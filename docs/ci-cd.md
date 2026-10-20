# CI/CD and the secondary VPS app

Pull requests into `main` and pushes to `main` run `ci-core`, `ci-database`, and
`ci-browser`. Deployment depends on all three passing and only runs from `main`.
No provider credentials or production database are used by CI. Fork pull requests
cannot enter the deployment job. Builds and browser installation happen on GitHub,
not on the shared VPS.

## One-time GitHub settings

The available integration credential can read/write source but cannot administer
branch protection or Actions secrets. The repository owner must configure these
settings; checking in a workflow alone does not enforce merge protection.

1. Open **Settings → Environments**, create `vps-preview`, and restrict deployment
   branches to `main`. No required reviewer is needed for this automatic flow.
2. Set environment variables `VPS_HOST`, `VPS_PORT`, and `VPS_KNOWN_HOSTS`. The host
   keys must be independently verified, not accepted with SSH checking disabled.
   The SSH account is always `paxth-qa`.
3. Set environment secret `VPS_SSH_KEY` to the app-specific Ed25519 private key.
   Keep the root password and database/provider keys out of GitHub.
4. After the first PR checks exist, protect `main`: require a pull request and
   checks `ci-core`, `ci-database`, `ci-browser`; require the branch to be current;
   enforce the rule for administrators; disable force pushes and deletion. Set
   required approving reviews to zero so a solo maintainer can merge passing PRs.

## One-time VPS setups

The target is Ubuntu 24.04 x86-64 with systemd, Python 3 and cloudflared. Existing
services, their environment, their Node runtime and port 3000 are left intact.

Before the first rollout, take a PostgreSQL custom-format backup of the current
application schema **outside the repository**, protect it with mode 600, and
restore it into a disposable database to verify it. The deployment reuses this
repo's configured database and existing administrator; it does not bootstrap or
reset accounts. Development and deployment therefore share data and worker locks.

As root, install database/provider configuration at `/etc/paxth-qa/app.env`, copy
the repository's `ops` directory to a temporary directory, then run its
`setup-vps.sh`. Configuration must use dotenv/systemd-compatible `KEY=value`
syntax. The installer gives the environment file mode 640, root ownership and
the app's group. If the database URI specifies `sslrootcert`, copy that CA
certificate to the server and update only its file path in the server URI;
preserve `verify-full` and the provider's connection settings. It installs two
app-specific services and starts the tunnel.
Install the dedicated public SSH key in the `paxth-qa` account's `authorized_keys`
with the `restrict` option. The account may start/stop only `paxth-qa.service`
through passwordless sudo; the application itself runs with `NoNewPrivileges`.

The app listens only on `127.0.0.1:3200`, with 512 MiB maximum memory, a 384 MiB
Node heap, 50% CPU quota and failure restart. The new tunnel has separate metrics
on loopback port 20242 and a 96 MiB/10% CPU limit. A temporary tunnel is preview
hosting: its hostname can change and it has no uptime guarantee. The helper
validates the generated hostname and updates the exact allowed HTTPS origin. If
jobs are active, origin changes wait instead of interrupting execution. Existing
browser tabs must open the new URL when the tunnel changes.

## Releases and recovery

`node scripts/package-release.mjs FULL_COMMIT_SHA` packages the built application,
production dependencies, deployment operations and Node 22 runtime. The archive
uses an allowlist and excludes source credentials, backups and the development checkout.
The checksum and `/version.json` identify the exact release tested by the database
smoke suite. GitHub artifacts expire after seven days; the server retains current
and previous successful releases. Incoming failed archives can be removed after
diagnosis to recover disk space.

Deployment uploads into `incoming`, verifies the checksum, extracts into a new
release directory, then runs:

```bash
bash /opt/paxth-qa/ops/deploy.sh FULL_COMMIT_SHA
```

The script uses `flock` to serialize with other deployments and tunnel updates.
It locks both queue tables before checking for queued/running/cancelling work and
holds the locks through service stop. Busy queues or concurrent transactions
leave the running service untouched. Existing request timeouts bound waiting
submissions during shutdown. Rerun a deferred GitHub deployment after jobs finish.
An older pipeline cannot deploy after `main` has moved forward.

Local and public readiness, release identity and anonymous-session rejection must
all pass. Schema readiness gets a 20-second request timeout, matching the existing
container health check and allowing sequential queries to the remote database.
A failed compatible release restores the previous service and still
fails the workflow. A failed initial release is stopped. Rollback never restores
or overwrites the database. Normal deployments keep the tunnel process alive.

Startup/schema modules have a conservative fingerprint. Changes require an
external backup, migration rehearsal and compatibility review before a manual
release:

```bash
bash /opt/paxth-qa/ops/deploy.sh FULL_COMMIT_SHA --allow-schema-change
```

After explicitly allowing such a release, failure stops the app rather than
starting older code against a potentially changed schema. Follow the reviewed
migration recovery procedure. A failure marker also blocks boot-time startup;
the next reviewed deployment with `--allow-schema-change` clears it. Do not use `db:push` or automatically restore an
older backup over new data.

To inspect service status and logs as an administrator:

```bash
systemctl status paxth-qa.service paxth-qa-tunnel.service
journalctl -u paxth-qa.service -n 50 --no-pager
cat /opt/paxth-qa/state/url.txt
```

The Actions deployment summary includes the current link. The server-side URL file
is authoritative after a later tunnel restart. Check existing app health and both
services' memory use during rollout. A shared 1 GiB VPS has limited headroom;
passing mocked tests does not establish paid provider availability or full load
capacity. Rotate the root password shared during setup separately.

Changes to the root-owned service units or tunnel launcher require rerunning the
reviewed VPS installer as administrator. Application releases do not replace
privileged host configuration automatically.
