#!/usr/bin/env bash
set -euo pipefail
if [[ ${1:-} == --refresh-origin ]]; then
  release=/opt/paxth-qa/current
else
  [[ ${1:-} =~ ^[a-f0-9]{40}$ ]] || { echo 'Pass a full release SHA.' >&2; exit 1; }
  release="/opt/paxth-qa/releases/$1"
fi
exec /usr/bin/flock -n /opt/paxth-qa/state/deploy.lock "$release/runtime/node" "$release/ops/deploy.mjs" "$@"
