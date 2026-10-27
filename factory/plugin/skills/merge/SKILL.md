---
name: merge
description: Check a factory task's PR and squash-merge it if the merge rules allow (all GitHub checks green, at least one check, mergeable, and the user's approval label where required). Use after checks finish or after adding CI.
argument-hint: <DS-n>
disable-model-invocation: true
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Read, Write, Edit
---

# /factory:merge

Arguments: `$ARGUMENTS` (task ID).

Read `${CLAUDE_PLUGIN_ROOT}/RULES.md` (in this repo: `factory/plugin/RULES.md`) and apply its **Merging** section exactly. Don't bend any condition: no green check, no merge; approval required and no `factory:approved`, no merge.

This session's id is `${CLAUDE_SESSION_ID}`. Write it to the job file's `session_id` (rules: Job files) so the user can return with `claude --resume ${CLAUDE_SESSION_ID}`.

1. Find the open PR for `feat/DS-<n>-*` and the worktree (recreate from the remote branch + `npm ci` if needed).
2. Wait for checks (`gh pr checks <n> --watch`, up to 30 min).
3. Red check → don't merge. Set the job file to `blocked` with the failing check and suggest `/factory:retry DS-<n>` (which feeds the CI log to the Builder).
4. All conditions met → update the job file to `merged` (commit, push, wait for checks if that restarted them), squash-merge, clean up the branch, worktree and Storybook.
5. Report the outcome with the PR link.
