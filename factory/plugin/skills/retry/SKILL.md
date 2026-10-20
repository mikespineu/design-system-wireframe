---
name: retry
description: Resume a blocked or stopped factory task from where it failed, optionally with a stronger model (e.g. opus) or accepting a UI change on a has_ui no task.
argument-hint: <DS-n> [opus|sonnet|haiku] [--from <stage>] [--allow-ui]
disable-model-invocation: true
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(lsof:*), Bash(curl:*), Bash(cksum:*), Bash(kill:*), Read, Write, Edit, Glob, Grep, Agent, Artifact
---

# /factory:retry

Arguments: `$ARGUMENTS`. "Better model", "stronger model" or "with opus" means model `opus`.

Read `${CLAUDE_PLUGIN_ROOT}/RULES.md` (in this repo: `factory/plugin/RULES.md`).

1. Find the task's branch, worktree and job file (worktree first, else `git show origin/<branch>:factory/jobs/DS-<n>.md`). Recreate the worktree from the remote branch and `npm ci` if it's gone. No branch → tell the user to start it with `/factory:design` or `/factory:build`.
2. Read the job file: `stage`, `blocked_reason`, and the last failure (timeline, Notes, or the latest `factory: blocked` PR comment).
3. Reset: `loops` all to 0, `blocked_reason: ""`, `needs_you: ""`, `status: in-progress`, `model: <model or default>`. Timeline: `retry: from <stage>[ with <model>][, UI change accepted]`. Remove `factory:blocked` from the PR. With `--allow-ui`, add `factory:needs-approval` to the PR (the user approves before merge).
4. Continue the right line from the failed stage (or `--from`), passing the model to **every** subagent in this run:
   - design tasks → `/factory:design` steps, from the Designer (with the last failure as feedback) or from publishing;
   - build tasks → `/factory:build` steps: `build` / `ui-guard` / a gate → back to the Builder with the last failure as feedback; `qa` → QA; `review` → Reviewer; `pr`/`ci`/`merge` → PR and merge. With `--allow-ui`, skip the UI guard.
5. Same loop limits as a fresh run (2 per stage). Report as the line skill does.
