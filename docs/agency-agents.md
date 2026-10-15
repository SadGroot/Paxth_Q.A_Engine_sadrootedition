# Agency Agents in this repository

Installed on 15 October 2026. These are development/review personas, not application users, QA model prompts, or a background service.

## What was inspected and installed

The requested [agency-agents-app](https://github.com/msitarzewski/agency-agents-app) is a native Tauri/Rust and Svelte desktop installer. Its catalog comes from the separate [agency-agents](https://github.com/msitarzewski/agency-agents) repository. It renders persona instructions into the formats expected by coding tools; it does not execute reviews itself. Its native installer tracks file hashes and backs up modified files. This is useful tooling on a developer workstation, rather than a dependency for the React/Express application.

This headless workspace has the seven relevant personas installed directly from that catalog using its official Codex converter. The desktop GUI was inspected, not installed or embedded in Paxth. No Rust, Svelte, model service, global agent configuration, or application dependency was added.

| Project agent | Intended work |
| --- | --- |
| Application Security Engineer | Authentication, authorization, input boundaries, network access, dependency reachability |
| Software Architect | Data flow, persistence, concurrency, complexity, scaling |
| DevOps Automator | Builds, containers, migrations, CI, release and recovery |
| UI Designer | Visual hierarchy, density, navigation and feedback |
| UX Architect | Operator workflows, state, selection and errors |
| Accessibility Auditor | Keyboard access, names, dialogs and responsive behavior |
| Reality Checker | Cross-check findings against code and test evidence; qualify release claims |

Files live in [`.codex/agents/`](../.codex/agents/). The MIT license is preserved there. [The provenance manifest](agency-agents.lock.json) records the inspected installer commit, catalog commit, source paths, converter hash, and installed-file hashes. Installed instructions match the selected upstream Markdown bodies; their self-described experience and example tool commands are persona text, not credentials or proof of capabilities.

[Official OpenAI documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents) supports project agents in `.codex/agents/*.toml` with `name`, `description`, and `developer_instructions`. The files leave model, provider and permissions to the parent session. No `.codex/config.toml` change is needed. Start a fresh supported local Codex session if newly installed names are not discovered in an existing session.

## Use and verify

From the repository root:

```bash
npm run agents:verify
```

This checks the seven installed files, their fields, exact hashes and license without network access or provider credentials. It detects local drift; it does not certify the safety of future upstream changes.

Example request to Codex:

```text
Use Application Security Engineer, Software Architect and DevOps Automator
to review this repository. Use UI Designer, UX Architect and Accessibility
Auditor for the UI. Have Reality Checker reconcile the findings and tests.
Review only; cite exact source locations and realistic impact. Use local
mocked providers and disposable databases. Do not access production or paid
providers, read secrets, change application behavior or deploy anything.
Prioritize the smallest fix for each confirmed issue.
```

Installation alone does not launch agents. For the [initial review](agency-review-2026-10-15.md), three independent workers read and applied the security, architecture/deployment, and UI/accessibility personas. The primary worker applied Reality Checker's evidence checks and reconciled their findings. This environment's collaboration tool delegates those instructions explicitly rather than selecting an installed persona by name. Upstream example commands for unrelated stacks were not executed.

## Reproduce or update

The checked-in files work after a normal clone; no installer download is needed. To regenerate the pinned source in a temporary directory:

```bash
agency_source="$(mktemp -d)"
git -C "$agency_source" init
git -C "$agency_source" remote add origin https://github.com/msitarzewski/agency-agents.git
git -C "$agency_source" fetch --depth 1 origin 652b2692f8d8ec2b1f1a38e559073e287dfdc469
git -C "$agency_source" checkout --detach FETCH_HEAD
bash "$agency_source/scripts/convert.sh" --tool codex
```

Compare the seven `integrations/codex/agents/<slug>.toml` files against the installed destinations listed in the manifest. For an intentional update, review the selected source instructions and converter first, copy only those seven rendered files and the license, and update the provenance and hashes together. Run `npm run agents:verify` again. Preserve local customizations before replacing a persona. There is no automatic upstream refresh or desktop-app install ledger for these manually installed files.

The agent directory is already excluded from Docker by `.dockerignore`, so these personas are not included in the production image.
