#!/usr/bin/env bash
# Run once as root after copying ops/ and a protected app.env to the server.
set -euo pipefail
[[ $EUID == 0 ]] || { echo 'Run setup as root.' >&2; exit 1; }
[[ -x /usr/local/bin/cloudflared ]] || { echo 'cloudflared is required.' >&2; exit 1; }
command -v python3 >/dev/null
command -v flock >/dev/null
[[ -s /etc/paxth-qa/app.env ]] || { echo 'Install /etc/paxth-qa/app.env with database/provider credentials first.' >&2; exit 1; }
if ! id paxth-qa >/dev/null 2>&1; then useradd --system --create-home --home-dir /var/lib/paxth-qa --shell /bin/bash paxth-qa; fi
install -d -o paxth-qa -g paxth-qa -m 750 /opt/paxth-qa /opt/paxth-qa/releases /opt/paxth-qa/incoming /opt/paxth-qa/state /opt/paxth-qa/ops
install -o root -g root -m 644 "$(dirname "$0")/paxth-qa.service" "$(dirname "$0")/paxth-qa-tunnel.service" /etc/systemd/system/
install -o root -g root -m 755 "$(dirname "$0")/tunnel.py" "$(dirname "$0")/deploy.sh" /opt/paxth-qa/ops/
chown root:paxth-qa /etc/paxth-qa/app.env
chmod 640 /etc/paxth-qa/app.env
chown root:paxth-qa /etc/paxth-qa
chmod 750 /etc/paxth-qa
printf '%s\n' 'paxth-qa ALL=(root) NOPASSWD: /usr/bin/systemctl start paxth-qa.service, /usr/bin/systemctl stop paxth-qa.service' > /etc/sudoers.d/paxth-qa
chmod 440 /etc/sudoers.d/paxth-qa
visudo -cf /etc/sudoers.d/paxth-qa
systemctl daemon-reload
systemctl enable paxth-qa.service paxth-qa-tunnel.service
systemctl start paxth-qa-tunnel.service
echo 'Paxth services installed. Install the app-specific SSH public key, then deploy a tested release.'
