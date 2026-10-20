---
name: plan
description: Research and plan the design-system roadmap - the Planner subagent inventories the repo, the backlog and the factory's job history, finds gaps, and proposes the next features as correctly shaped tasks; after the user picks and approves them they land in roadmap.md through a PR. Use for /factory:plan or when the user asks to plan the roadmap, research what to build next, or fill the backlog.
argument-hint: "[focus: epic, theme or free text] [count] [opus|sonnet|haiku]"
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Bash(node:*), Read, Write, Edit, Glob, Grep, Agent
---

# /factory:plan

Arguments: `$ARGUMENTS` (optional focus text; a bare number is how many features to propose, default 5, max 8; a trailing `opus`/`sonnet`/`haiku` is the model).

Read `${CLAUDE_PLUGIN_ROOT}/RULES.md` (in this repo: `factory/plugin/RULES.md`) and `${CLAUDE_PLUGIN_ROOT}/skills/add/SKILL.md` (in this repo: `factory/plugin/skills/add/SKILL.md`). Tasks are shaped, numbered and landed exactly as `/factory:add` does it; this skill only adds the research and the choosing.

## 1. Snapshot

1. `git fetch -q origin` and read the backlog: `git show origin/main:roadmap.md`.
2. Run `node "${CLAUDE_PLUGIN_ROOT}/skills/status/scripts/status-page.mjs" --json --quiet` (in this repo: `factory/plugin/skills/status/scripts/status-page.mjs`) for what's in progress, blocked and runnable.
3. Research checkout: `git worktree add --detach .worktrees/plan-research origin/main` (remove a stale one first). It's read-only, so no `npm ci`. Remove it with `git worktree remove --force .worktrees/plan-research` when the Planner is done.
4. Tell the user in one line what you're researching (focus, count).

## 2. Research (Planner)

Run the **planner** subagent with: the absolute path of `.worktrees/plan-research`, the focus, the feature count, and the task IDs from the status JSON's `runnable`, `running` and `needsYou`. Pass the model if the user gave one.

Then check its JSON yourself (deterministic, don't trust it):
- Every task has `title`, `description`, `type` in `design | build | infra | docs`, `has_ui`, `needs_human`, `depends_on`, and 1–5 `done_when` items.
- A UI feature has a `design` task and a `build` task that depends on it; a feature has at most 4 tasks.
- `depends_on` names only existing roadmap IDs or keys of proposed tasks; no cycles.
- No proposal duplicates a roadmap task (compare titles and component names, done ones too).

Drop or fix anything that fails and say what you dropped. If nothing valid is left, tell the user why and stop.

## 3. Preview

Show, in this order:
1. The Planner's summary (a few lines) and its `next_up` recommendation.
2. A numbered list of features by priority: `1. <title> (<epic>) — <why>` plus its evidence links.
3. For each feature, the exact markdown that would go into `roadmap.md` (checkbox line, meta line, `done_when`), under its `### Epic:` heading, with **provisional** IDs assigned as in `/factory:add` step 3 (next free ID, counting remote branches), in priority order. Local keys in `depends_on` are replaced with those IDs.

Ask: "Which ones should I add? (all / numbers like 1,3 / changes)". Re-preview after any change. Renumber so the chosen tasks get consecutive IDs with no gaps. Nothing lands without the user's explicit ok.

## 4. Land

Follow `/factory:add` step 4 for the chosen tasks, with these names:
- Branch `chore/roadmap-plan-DS-<first id>`, worktree `.worktrees/chore-roadmap-plan-DS-<first id>`. If the reservation fails, take the next IDs and re-preview.
- Commit and PR title `roadmap: plan DS-<a>…DS-<z>`. PR body: the Planner's summary, the chosen features with their `why` and evidence, the tasks as previewed, the model used, "Previewed and approved in Claude Code", and the attribution line. Label `factory:approved`.
- Merge it per the merging rules (no checks after 2 minutes → leave it for the user and say so). Clean up the worktree and branch.

## 5. Reply

The PR link, the new IDs, and which task to start first (the Planner's `next_up` if it's now runnable, otherwise what `/factory:next` would pick) with its command (`/factory:design DS-<n>` or `/factory:build DS-<n>`). Then refresh the status page as in "Ending a run".
