---
name: status
description: Factory overview - what's in progress, what needs the user (approvals, blocked tasks), what's runnable, epic progress and a board of every roadmap task; writes and opens a status page. Use for /factory:status or when the user asks how the factory or the roadmap is doing.
argument-hint: "[DS-n for one task's job details]"
allowed-tools: Bash(node:*), Bash(git:*), Bash(gh:*), Read
---

# /factory:status

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/status/scripts/status-page.mjs" --open
```

(In this repo the script is `factory/plugin/skills/status/scripts/status-page.mjs`.)

It reads `roadmap.md` on `origin/main`, approved specs, every job file (`factory/jobs/DS-<n>.md`: live from worktrees, else from task branches, else from `main`), branches and open PRs. It writes `.factory/status.html` and opens it.

Reply with the script's summary as-is. Put "needs you" items first, each with the command that resolves it.

If the user named a task (`$ARGUMENTS`), also show that task's job file: its status, stage, links, the last 10 timeline lines, and its notes. Read it from the worktree, else `git show origin/<branch>:factory/jobs/DS-<n>.md`, else `origin/main`.

This skill only reads; it never starts, approves or merges anything.
