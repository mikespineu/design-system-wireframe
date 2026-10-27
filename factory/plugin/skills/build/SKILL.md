---
name: build
description: Run the factory build line on a roadmap build/infra/docs task (DS-n) - Builder subagent implements with TDD in its own worktree, hard gates (lint, typecheck, tests, Storybook build), QA and Reviewer subagents, then a PR that merges itself when checks are green.
argument-hint: <DS-n> [model]
disable-model-invocation: true
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(lsof:*), Bash(curl:*), Bash(cksum:*), Bash(kill:*), Read, Write, Edit, Glob, Grep, Agent
---

# /factory:build

Arguments: `$ARGUMENTS` (task ID, optional model `opus`/`sonnet`/`haiku`, optional `--allow-ui` and `--from <stage>` when called from `/factory:retry`).

First read the rules: `${CLAUDE_PLUGIN_ROOT}/RULES.md` (in this repo: `factory/plugin/RULES.md`). Follow them exactly, including the job file updates at every stage.

This session's id is `${CLAUDE_SESSION_ID}`. Write it to the job file's `session_id` (rules: Job files) so the user can return with `claude --resume ${CLAUDE_SESSION_ID}`.

## 1. Check and claim

1. Read the task from `origin/main:roadmap.md`. **Refuse** with the exact reason if:
   - its type is `design` (say "use `/factory:design DS-<n>`");
   - it's done, or a `depends_on` task isn't done on main;
   - `has_ui: yes` and there's no approved spec: find the design dependency's spec in `origin/main:docs/specs/*.md` (field `task: <design id>`), require `approved: yes`, and check that no commit on main touched the spec or its canvas after the approval commit (`git log --format=%H -1 origin/main -- <spec> <canvas>` must be the commit that set `approved: yes`).
   - its branch already exists (unless this is a retry).
2. Claim, create the worktree, `npm ci`, create the job file (line `build`), commit it. If `needs_human: yes`, note in the job file that the PR will need approval.

## 2. Builder

Job file: `status: in-progress`, `stage: build`. Run the **builder** subagent with:
- the absolute worktree path and the task block (description, `done_when`);
- for `has_ui: yes`: the approved spec text and the canvas path;
- for `has_ui: no`: "do not change UI files";
- on a fix loop: the failure output or findings as feedback.

Then: scope check (Builder may not touch specs, canvases, `.husky`, the review workflow), commit anything left uncommitted, and run the **UI guard** for `has_ui: no` tasks (skip it if this run has `--allow-ui`).

Note the Builder's turns and model in the timeline.

## 3. Gates

Run the four gates in the worktree, in order, stopping at the first failure. Record each in the job file's gate table and timeline. On failure: fix loop (back to step 2 with the output). Max 2 loops, then block.

## 4. QA

- UI tasks: start the worktree's Storybook on its port (rules) and record `storybook_url` in the job file.
- Run the **qa** subagent with the worktree path, the task, and (UI) the spec, canvas path and Storybook URL.
- Scope check: QA may only add or change `*.test.ts(x)` and `.qa/**`. Revert anything else. Commit QA's tests (`DS-<n>: QA tests`).
- Read the fenced JSON verdict at the end of QA's reply. No verdict or `"fail"` → fix loop with the findings (back to step 2). If QA added tests, run the gates again before moving on.

## 5. Review

Run the **reviewer** subagent with the worktree path, the task and (UI) the spec. It must not change anything (check `git status`). `"fail"` or no verdict → fix loop with the findings (back to step 2, then gates, QA and review again).

## 6. PR

1. In the worktree's `roadmap.md`, tick the task: `- [x]`, `status: done` (only this task's block; nothing else in the file changes).
2. Job file: `stage: pr`. Commit, push, open the PR (`DS-<n>: <title>`, body per the rules). Add the PR link to the roadmap's `## Done` section (replace `_Nothing yet._` if it's there): `- **DS-<n>** <title> — <PR url>`. Record `pr`/`pr_url` in the job file. Commit and push.
3. **Every implementation PR needs the user's approval.** Add `factory:needs-approval`, set `status: waiting` and `needs_you: approve the PR (/factory:approve DS-<n>)`. The status page then shows the task as **blocked by human** (Blocked column, human tag).

## 7. CI and merge

Wait for CI. Green checks do **not** merge the PR: approval is always required, so set the job file to `waiting` with `needs_you: approve the PR (/factory:approve DS-<n>)`, push, and end the run. The merge happens in `/factory:approve`. A red check is a fix loop (max 2). No checks at all: set `waiting` with `needs_you: no CI checks ran; merge the PR yourself or add CI (DS-8), then /factory:merge DS-<n>`, and end.

When merged: job file `merged` (committed before the merge, per the rules), clean up the worktree, branch and Storybook.

## 8. Report

Summarize: gates, loops used, model(s). Then hand the PR to the user (rules, "Handing a PR to the user for approval"): the **PR link**, the **local Storybook preview link** (keep it running; check it answers), and `/factory:approve DS-<n>`. Refresh the status page (rules).
