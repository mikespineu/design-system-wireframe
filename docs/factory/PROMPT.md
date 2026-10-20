# Build a software factory for this design system

## Context
This repo is a React + TypeScript design system (Vite, Storybook 10, Jest 30, Tailwind v4 tokens, Radix primitives). Read `CLAUDE.md` first and follow it strictly: worktrees under `.worktrees/`, branch names `feat|fix|chore/<topic>`, `npm ci` per worktree, never commit to `main`, never bypass the Husky pre-push hook, every component needs a story, tests, and a jest-axe check.

The backlog lives in `roadmap.md`: epics containing tasks with stable IDs `DS-<n>` (never reused or renumbered), checkbox status (`[ ]` todo, `[~]` in progress, `[x]` done), and a Done section.

## Goal
Design and build a "software factory": an automated system that picks tasks from the backlog, designs or implements each one in isolation with Claude agents, verifies it, and opens a pull request for human review. Humans stay in control of approvals and merging, and can watch everything live.

## How to work
1. Do NOT write code first. Start with the brainstorming process: ask me clarifying questions one at a time (where it runs: locally vs GitHub Actions; budget limits; concurrency; which tasks need a human), then write a short design doc in `docs/factory/design.md` and wait for my approval.
2. After approval, write an implementation plan with phases and get approval again.
3. Build it phase by phase, in a worktree, with tests. Stop after each phase for my review.

## Task model
- Fields: `id`, `title`, `epic`, `type` (`design | build | infra | docs`), `status` (`todo | ready | in-progress | review | done | blocked`), `depends_on: DS-<n>[]`, `needs_human: boolean`, `done_when: string[]`, `branch`, `pr`, `blocked_reason`.
- Phase 0 extends `roadmap.md` with these fields in a format that stays human-readable, and fills them in for existing tasks (propose values; I approve). Build tasks depend on their design task (e.g. DS-4 → DS-3, DS-6 → DS-5).
- **Backlog source adapter:** an interface with a `roadmap.md` implementation now, designed so a GitHub Issues implementation can be added later without changing the rest.

## Architecture: one core, two lines
- **Orchestrator core** (deterministic code, not an LLM): backlog adapter, pick, claim, dependency resolution, routing by `type`, verification gates, budgets, retries, logs, event stream, kill switch.
  - Pick: next `ready` task whose dependencies are done and `needs_human` is false.
  - Claim: atomically, by pushing branch `feat/DS-<n>-<slug>` (if the push fails, the task is taken).
- **Design line** (`type: design`): Designer agent works in Claude Design (canvases in `docs/design-system-wireframe/*.dc.html`) and writes a design spec to `docs/specs/<Component>.md`: canvas link, sizes, all states, keyboard behavior, token mapping, a11y notes, `approved: no`. Uses only existing `--ds-*` tokens; new tokens require human approval. Ends at human approval, which sets `approved: yes` with date and approver.
- **Build line** (`type: build | infra | docs`):
  - Builder: implements from the approved spec with TDD in its own worktree, following `CLAUDE.md`. Also handles infra tasks (CI, package config) via task-specific skills.
  - Verification gates (hard, not agent judgement): `npm run lint`, `npm run typecheck`, `npm test` (coverage ≥ 80%), `npm run build-storybook`. On failure, feed errors back to the Builder, up to N retries, then mark `blocked` with the reason.
  - QA: black-box verification. Runs Storybook in a browser, compares against the spec, tests keyboard and a11y, may add tests but never edits production code. Failures route back to the Builder.
  - Reviewer: read-only diff review against done-when and `CLAUDE.md`. One fix round with the Builder, then escalate to a human.
  - PR: title `DS-<n>: <title>`, body lists the done-when criteria with how each is met. A human merges.
- **Contract between lines:** the design spec is the only handoff. A build task for a component is `ready` only when its spec exists and is approved. QA verifies against the spec.
- Keep the lines independently runnable (`factory design …`, `factory build …`) so they can later be split into separate factories without code changes.
- Each agent has its own system prompt, tool allowlist, and budget. No agent approves its own output. Use the Claude Agent SDK (TypeScript); check current model IDs and SDK APIs with the claude-api skill rather than from memory.

## Interfaces (all thin layers over one CLI)
- **Single source of logic:** a `factory` CLI owns every operation. Task data lives in the backlog (`roadmap.md`); runtime data (active runs, gate results, cost, timings) lives in `.factory/state.json`, logs in `.factory/logs/DS-<n>.log`, events in `.factory/events.jsonl`. Slash commands, dashboard, and status line only call the CLI. No interface writes state directly.
- **Claude Code commands** (plugin or `.claude/` skills): `/factory:status`, `/factory:next`, `/factory:design <id>`, `/factory:build <id>`, `/factory:approve <id>`, `/factory:block <id> <reason>`, `/factory:unblock <id>`, `/factory:retry <id>`, `/factory:stop`, `/factory:dashboard`. `design`/`build` refuse with a clear reason if the task is the wrong type, has open dependencies, or (for build) has no approved spec.
- **Status line** (optional): one-line summary, e.g. `factory ▸ 1 running · 3 ready · 2 awaiting you`.

## Live dashboard
- **Event stream as the backbone.** The orchestrator appends one JSON line per event to `.factory/events.jsonl`: `task.claimed`, `stage.started` / `stage.finished` (design, build, gate:lint, gate:typecheck, gate:test, gate:storybook, qa, review, pr), `agent.activity` (short summary of what the agent is doing, derived from the Agent SDK message stream: file edited, command run, test result), `gate.passed` / `gate.failed`, `needs_human` (with reason and the action required), `task.blocked`, `task.done`, `cost.updated`. Events are the only input to the live view; `state.json` is a snapshot rebuilt from them.
- **Server:** `factory dashboard` starts a small local server that tails `events.jsonl` and pushes events to the browser over Server-Sent Events; actions (approve, retry, stop…) are POSTs that call the CLI. On reconnect, the client gets the current snapshot, then the stream.
- **Live view (HTML page):**
  - "Now running": one card per active task with a pipeline stepper (claim → design/build → gates → QA → review → PR) highlighting the current stage, elapsed time, running cost, and a live tail of `agent.activity` lines.
  - "Needs you" panel pinned at the top: specs awaiting approval, `needs_human` tasks, blocked tasks, PRs to merge. Each item has the reason and the action button. Fire a browser notification (and optionally a macOS notification) when a new item arrives.
  - Board: kanban by status with line badges (design/build) and a blocked column; cards update in place as events arrive.
  - "Runnable now" list with Run buttons per line.
  - Task detail: deps, done-when, spec + approval + canvas link, branch, PR, per-gate results, full log, cost, duration, event timeline.
  - Actions: approve, block/unblock, retry, toggle `needs_human`, edit dependencies, global STOP.
  - Epic progress bars, a connection indicator (live / reconnecting), and today's total cost.
  - Uses the design system's own tokens and components where practical.
- Later (not now): the same event stream can feed a hosted/shared view for the team.

## Guardrails
- Never push to or merge into `main`; never use `--no-verify`.
- Per-task time and cost budget; max retries; then `blocked` with reason and a `needs_human` event.
- Kill switch: `factory stop` / `.factory/STOP` file halts all agents at the next safe point.
- Secrets only from environment variables, never written to logs or events.
- Tasks with `needs_human: true` (design approval, release/npm setup) are skipped by the picker, or produce a proposal only, never a final change.

## Build order
1. Phase 0: backlog fields + adapter.
2. CLI core: status, next, claim, event stream, state, logs, stop.
3. Slash commands.
4. Design line.
5. Build line (gates, QA, reviewer, PR).
6. Live dashboard.
7. Status line.

## Non-goals for now
- Auto-merging PRs.
- Migrating the backlog to GitHub Issues (only keep the adapter seam).
- Publishing to npm.
- A hosted/team dashboard.

## Done when
- `docs/factory/design.md` approved.
- `factory build DS-<n>` takes a real backlog task to an open PR with all verification gates green, demonstrated on one small task, and `factory design DS-<n>` produces a spec awaiting approval.
- The live dashboard shows that run in real time: current stage, activity, gate results, and the "needs you" item when approval is required.
- The factory has its own tests, and `npm test` / `npm run typecheck` / `npm run lint` pass.
