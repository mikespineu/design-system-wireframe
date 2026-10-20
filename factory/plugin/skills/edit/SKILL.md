---
name: edit
description: Change a roadmap task (title, description, type, has_ui, needs_human, depends_on, done_when, or block/unblock it), previewed first and landed through a PR. Only for tasks that are todo or blocked.
argument-hint: <DS-n> <what to change>
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Read, Write, Edit
---

# /factory:edit

Request: `$ARGUMENTS`

Read `${CLAUDE_PLUGIN_ROOT}/RULES.md` (in this repo: `factory/plugin/RULES.md`).

1. Read the task from `origin/main:roadmap.md`. Refuse if it's done, or if it has a `feat/DS-<n>-*` branch that isn't blocked (check the job file's `status`): "edit it when it's todo or blocked". `type` can't change once the task has a branch.
2. Work out the new task block. Ask one short question only if the request is ambiguous. Keep the roadmap rules: a UI build depends on a design task, 1–5 `done_when` items, `depends_on` only existing IDs and no cycles. "Block DS-n because X" → `status: blocked · blocked_reason: X`; "unblock" → `status: todo`.
3. Show the old and new block. Apply only after the user says ok:
   - branch `chore/roadmap-DS-<n>-edit-<short slug>`, reserved with `gh api …/git/refs` as in the rules;
   - worktree, `npm ci`, change **only that task's block**, commit `roadmap: edit DS-<n>`, push;
   - PR `roadmap: edit DS-<n>` labeled `factory:approved`; merge it per the merging rules; clean up.
4. Reply with the PR link and whether it merged.
