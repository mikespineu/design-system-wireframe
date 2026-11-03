#!/usr/bin/env bash
# Starts Remotion Studio on this worktree's own port (CLAUDE.md "Port isolation"): 6100-6999,
# derived from the worktree directory name, incremented while another process listens on it.
# Never 3000 (Remotion default) or 6006 (Storybook).
set -euo pipefail

cd "$(dirname "$0")/.."
PORT=$((6100 + $(basename "$PWD" | cksum | cut -d' ' -f1) % 900))
while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

echo "Remotion Studio: http://localhost:$PORT"
cd video
exec npx remotion studio src/index.ts --port="$PORT" "$@"
