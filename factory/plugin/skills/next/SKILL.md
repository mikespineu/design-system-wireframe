---
name: next
description: Show the next runnable factory task from the roadmap (ready, dependencies done, not needs_human, not claimed), optionally only design or build tasks.
argument-hint: "[design|build]"
allowed-tools: Bash(git:*), Bash(gh:*), Bash(node:*)
---

# /factory:next

Run the status script in JSON mode and read `runnable`:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/status/scripts/status-page.mjs" --json --quiet
```

(In this repo the script is `factory/plugin/skills/status/scripts/status-page.mjs`.)

Pick the first task in `runnable` with `needsHuman: false` (and matching `line` if the user passed `design` or `build`). Reply in one or two lines: `DS-<n> <title> (<line>)` and the command to start it (`/factory:design DS-<n>` or `/factory:build DS-<n>`). If nothing is runnable, say why in one line (waiting on dependencies, approvals, or everything is done). Don't start it.
