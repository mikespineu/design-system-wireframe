---
name: add
description: Add a feature to the design-system roadmap - turns a plain-words feature into correctly shaped tasks (design + build split, dependencies, done_when), previews them, and after the user's ok lands them in roadmap.md through a PR. Use for /factory:add or when the user asks to add a feature, component or task to the roadmap.
argument-hint: <feature in plain words>
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Bash(node:*), Read, Write, Edit
---

# /factory:add

Feature: `$ARGUMENTS`

Read `${CLAUDE_PLUGIN_ROOT}/RULES.md` (in this repo: `factory/plugin/RULES.md`) for the task format and git rules.

## 1. Understand (at most 3 questions)

Read the backlog: `git fetch -q origin main && git show origin/main:roadmap.md`. Then ask only what you can't infer, one short question per message, three at most:
- which epic it belongs to (offer the closest existing one);
- whether it has UI (anything a user sees: a component, a visual change, a new state, a theme);
- what it depends on, if that isn't obvious.

If the request is already clear, ask nothing.

## 2. Split it

| Feature | Tasks |
| --- | --- |
| Has UI | a `design` task (`has_ui: yes`) **and** a `build` task (`has_ui: yes`) that depends on it |
| No UI (tooling, CI, docs, refactor) | one task: `build`, `infra` or `docs`, `has_ui: no` |
| Needs new tokens, a release, secrets, or anything outside the repo | the same, with `needs_human: yes` |

- At most **4 tasks** per feature; more means "split it into separate features" (say so and stop).
- Titles follow the existing style: `Tooltip — design`, `Tooltip — implementation`.
- 1–5 testable `done_when` items per task, never vague ("works well").
- Design `done_when`: canvas covers every size and state; spec covers keyboard, tokens, a11y.
- UI build `done_when`: starts with "Matches the approved spec in every state" and includes "Story per state, keyboard story, `jest-axe` test, exported from `src/index.ts`".
- Name the Radix primitive in the build description when one fits.
- `depends_on` uses existing IDs only, no cycles.

## 3. IDs

Next ID = 1 + the highest `DS-<n>` found in `origin/main:roadmap.md` **and** in remote branch names (`git ls-remote --heads origin | grep -o 'DS-[0-9]*'`), so open roadmap PRs and claims are counted. IDs are never reused or renumbered.

## 4. Preview, then apply only on the user's ok

Show the exact markdown that will be added, in the roadmap format (checkbox line, meta line, `done_when` list), under its `### Epic:` heading. Ask "Apply this?". Change and re-preview as often as the user wants.

When the user says yes:
1. Branch `chore/roadmap-DS-<first id>-<slug>`. Reserve it atomically: `gh api repos/{owner}/{repo}/git/refs -f ref=refs/heads/<branch> -f sha=$(git rev-parse origin/main)`. If it already exists, take the next ID and re-preview.
2. Worktree `.worktrees/chore-roadmap-DS-<n>-<slug>` from that branch, `npm ci`.
3. Insert the tasks at the end of their epic (create `### Epic: <name>` before `## Done` if new). Don't change anything else in the file.
4. Commit (`roadmap: add DS-<a>, DS-<b>`), push, open PR `roadmap: add DS-<a>, DS-<b>` with the preview in the body and "Previewed and approved in Claude Code", label it `factory:approved` (the user just approved it).
5. Merge it following the merging rules (green checks; none → leave it for the user and say so). Clean up the worktree and branch.
6. Reply with the PR link, the new IDs, and the command to start the first one.
