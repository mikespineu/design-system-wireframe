# Software factory: design

Status: **draft, awaiting approval**. Source brief: [`PROMPT.md`](./PROMPT.md).

## 1. Intent

Take a task from `roadmap.md` to an open pull request with as little hand-holding as possible, while the human keeps every decision that matters: approving designs and merging PRs. Each task runs isolated in its own worktree, is checked by hard gates (not agent opinion), and is visible live on a local dashboard.

## 2. Decisions from the brainstorm (yours)

| Topic | Decision |
| --- | --- |
| Where it runs | Locally on the MacBook only. No GitHub Actions runners. |
| Billing / budget | Runs on the Claude Code subscription login, not an API key. No dollar budget; the usage limit is the ceiling. |
| Trigger | Manual, from Claude Code (`/factory:build DS-4`, `/factory:next`, …). No daemon picks work on its own. |
| Concurrency | Several tasks at once, each in its own worktree, started from separate Claude Code sessions. |
| Where you watch | The dashboard. The slash command starts a background run and returns immediately; no chat is attached to the run. |
| Design | Every design task produces a Claude Design canvas. You always approve the design; no agent approves it. The approved canvas becomes part of the spec the Builder and QA work from. |

## 3. Goals, non-goals, anti-goals

**Goals**
- `factory design DS-n` → canvas + spec, waiting for your approval.
- `factory build DS-n` → implemented component in a worktree, all gates green, QA + review passed, PR open.
- Live dashboard showing every run across sessions, with a "Needs you" panel.
- Two lines (design, build) independently runnable.

**Non-goals (now):** auto-merge, GitHub Issues backlog (adapter seam only), npm publishing, hosted/team dashboard, scheduled or unattended runs, CI runners.

**Anti-goals (failure even if it "works")**
- Anything pushed to or merged into `main` by the factory, or any `--no-verify`.
- A build starting from a spec you did not approve.
- An agent marking its own output as passed (gates are code; QA/Reviewer are separate agents).
- Two runs silently clobbering each other's state or worktree.
- A dead dashboard or preview link.

## 4. Constraints

- `CLAUDE.md` rules apply to every run: worktrees under `.worktrees/`, `npm ci` per worktree, per-worktree port formula, Radix primitives, `--ds-*` tokens only, story + test + `jest-axe` per component, coverage ≥ 80 %, Husky pre-push never bypassed.
- The factory never commits to `main`. So **`roadmap.md` on `main` only changes through PRs** (see §6.3).
- Secrets only from the environment; never written to logs or events.

## 5. Architecture

```
Claude Code session ──/factory:*──▶ factory CLI ◀──POST── dashboard (browser)
                                        │                    ▲ SSE
                     spawns detached ▼  │ appends            │
                     run process ──────▶ .factory/events.jsonl ──tail──┘
                        │  (Agent SDK agents: Designer | Builder, QA, Reviewer)
                        ▼
                  .worktrees/feat-DS-n-<slug>
```

- **One CLI owns all logic** (`factory/cli.ts`, run as `npm run factory -- <cmd>`). Slash commands, dashboard and status line only call it.
- **Orchestrator core is deterministic TypeScript**, not an LLM: backlog adapter, pick, claim, dependency check, routing by `type`, gates, limits, retries, logs, events, kill switch.
- **Agents** are Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`, TypeScript) `query()` calls inside the run process, each with its own system prompt, tool allowlist, `maxTurns`, and working directory = the task's worktree. Model IDs and SDK API are checked against the `claude-api` skill at implementation time, not from memory.

### 5.1 Code layout (my call)

```
factory/
  cli.ts                 # commander-style entry: status, next, design, build, approve, block, unblock, retry, stop, dashboard
  core/
    backlog/             # BacklogSource interface + RoadmapMdSource (GitHub Issues later)
    picker.ts            # next runnable task
    claim.ts             # branch-push claim
    events.ts            # append / read / tail events.jsonl
    state.ts             # snapshot rebuilt from events
    lock.ts              # file lock for shared files
    limits.ts            # time / turn limits, retries, STOP file
    gates.ts             # lint, typecheck, test, storybook
    worktree.ts          # create, npm ci, port, storybook start/stop
  lines/
    design.ts            # Designer pipeline
    build.ts             # Builder → gates → QA → Reviewer → PR
  agents/                # system prompts + tool allowlists per role
  dashboard/             # server.ts (http + SSE) and static/ (HTML/CSS/JS)
  __tests__/
.claude/commands/factory/*.md   # /factory:status etc.
```

Factory tests run in the existing Jest setup with `@jest-environment node`; they count toward `npm test`, `typecheck` and `lint`.

## 6. Task model and backlog

### 6.1 Fields

`id, title, epic, type (design|build|infra|docs), status (todo|ready|in-progress|review|done|blocked), depends_on, needs_human, done_when[], branch, pr, blocked_reason` — as in the brief.

### 6.2 Format in `roadmap.md` (Phase 0)

The existing line stays; metadata goes in indented sub-bullets so it still reads well on GitHub:

```md
- [ ] **DS-4 Textarea — implementation.** `src/components/Textarea/` with component, CSS, stories, tests …
  - type: build · depends_on: DS-3 · needs_human: no · status: todo
  - done_when:
    - Matches approved spec `docs/specs/Textarea.md` in every state
    - Story per state, keyboard story, `jest-axe` test, exported from `src/index.ts`
```

Checkbox is derived from status: `[ ]` todo/ready/blocked, `[~]` in-progress/review, `[x]` done. Unknown fields are kept untouched on rewrite.

### 6.3 Who owns which status

Because the factory can't edit `main`:

| Status | Lives in | Set by |
| --- | --- | --- |
| `todo`, `ready`, `blocked` (human), `needs_human` | `roadmap.md` on `main` | You, via PR (factory can prepare the edit on the task branch) |
| `in-progress`, `review` | runtime: `.factory/` state + branch/PR existence | Factory |
| `blocked` (runtime: gate failure, usage limit, timeout) | runtime state, with reason | Factory; cleared by `unblock`/`retry` |
| `done` | `roadmap.md` `[x]` + Done section | The task's own PR (the Builder ticks it in the PR), so it's true once you merge |

Effective status = runtime overlay on top of `roadmap.md`. `branch` and `pr` are runtime fields (derived from git/`gh`), not written to `roadmap.md`.

### 6.4 Proposed values for existing tasks (you approve in Phase 0)

| ID | type | depends_on | needs_human | Notes |
| --- | --- | --- | --- | --- |
| DS-1 | build | – | no | Theming infra, no new raw values |
| DS-2 | design | DS-1 | **yes** | New theme = new raw token values → human |
| DS-3 | design | – | no | Textarea |
| DS-4 | build | DS-3 | no | |
| DS-5 | design | – | no | Toggle |
| DS-6 | build | DS-5 | no | |
| DS-7 | infra | – | no | Library build |
| DS-8 | infra | DS-7 | no | CI pipeline |
| DS-9 | infra | DS-7, DS-8 | **yes** | npm release / trusted publishing → proposal only |
| DS-10 | docs | DS-1, DS-7 | no | Theme skill |
| DS-11 | docs | DS-1, DS-7 | no | Consumer docs |

### 6.5 Backlog adapter

```ts
interface BacklogSource {
  list(): Promise<Task[]>;
  get(id: TaskId): Promise<Task>;
  proposeUpdate(id: TaskId, patch: Partial<Task>): Promise<Patch>; // returns an edit to apply on a branch, never writes main
}
```

`RoadmapMdSource` parses and serializes `roadmap.md` (round-trip tested). A `GitHubIssuesSource` can be added later without touching core.

## 7. Shared runtime state (parallel runs)

- `.factory/` lives in the **primary checkout** (resolved via `git rev-parse --git-common-dir`), gitignored, so every worktree and session sees the same state.
- `events.jsonl` is append-only, one JSON line per event, written under a file lock. `state.json` is a snapshot rebuilt from events (never hand-edited). Logs: `.factory/logs/DS-n.log`.
- **Claim** = `git push origin origin/main:refs/heads/feat/DS-n-<slug>` (design tasks use the same `feat/` prefix per the brief). If the branch already exists, the push fails and the task is taken. Then the worktree is created from that branch and `npm ci` runs.
- **Ports**: every worktree uses the `CLAUDE.md` cksum formula, incrementing if busy. The dashboard uses the same formula on the name `factory-dashboard`.

## 8. Run lifecycle

`/factory:build DS-4` → `factory build DS-4 --detach`:
1. Validate: right `type`, dependencies `done`, `needs_human` false, and (build) an approved spec on `main`. Otherwise refuse with the reason.
2. Claim, create worktree, `npm ci`.
3. Spawn a detached Node process for the run; CLI prints task, worktree, and dashboard URL, then exits.
4. Run process executes the line (§9 / §10), emitting events, honoring limits and STOP.

**Limits (my call, all configurable in `factory/config.ts`):** per-agent `maxTurns` (Designer 60, Builder 80, QA 40, Reviewer 20), per-task wall clock 90 min, gate retries 3, review fix rounds 1. No cost limits; `cost.updated` is replaced by `usage.updated` (turns, duration, tokens if the SDK reports them).

**Usage limit reached:** SDK error is caught → task `blocked`, reason `usage limit reached`, `needs_human` event; work stays committed on the branch. `factory retry DS-n` resumes from the last finished stage.

**Kill switch:** `factory stop` writes `.factory/STOP`. Runs check it between stages and between agent turns (abort controller), then stop at that safe point and mark `blocked: stopped`. `factory stop --clear` removes it.

## 9. Design line (`type: design`)

1. **Designer agent** (tools: Read, Glob, Grep, Write/Edit limited to `docs/specs/**` and `docs/design-system-wireframe/**`; no Bash) reads `README.md`, `tokens.css`, existing canvases and similar components (e.g. `Input`).
2. Writes the canvas `docs/design-system-wireframe/<Component>.dc.html` in the same `x-dc` format as `Components.dc.html` (every size and state as an artboard), adds it to `canvas.json`.
3. Writes `docs/specs/<Component>.md`: canvas path (+ `canvas_url` once published), sizes, all states, keyboard behavior, Radix primitive, token mapping (existing `--ds-*` only), a11y notes, `approved: no`. Any new token is listed under **Token requests** and forces `needs_human`.
4. A deterministic check validates the spec (required sections present, every token referenced exists in `tokens.css`, canvas file parses).
5. Commit, push branch, open a **draft PR** `DS-n: <title>`. Event `needs_human: approve design`.

**Your touch point (always):** dashboard shows the canvas rendered in an iframe next to the spec. You either:
- **Request changes** with a comment → Designer re-runs on the same branch with your feedback (loop as many times as you want), or
- **Approve** (`factory approve DS-n`) → factory commits `approved: yes`, date, approver (git user) to the spec on the branch, marks the PR ready. You merge it.

A build task becomes `ready` only when the approved spec is on `main`. Any later change to the canvas or spec resets `approved: no` (enforced by the spec check: approval stores a hash of canvas + spec).

**Open risk — live Claude Design link.** A headless Agent SDK process can write the `.dc.html` file but probably can't publish it to claude.ai. My plan: the canvas is reviewed locally on the dashboard; publishing the live canvas is a manual step you can do from Claude Code, and `canvas_url` is optional in the spec. Phase 4 starts with a spike to confirm; if publishing turns out possible headless, the Designer does it.

## 10. Build line (`type: build | infra | docs`)

1. **Builder** (tools: Read, Write, Edit, Glob, Grep, Bash with allowlist: `npm`, `npx`, `git` excluding `push`/`merge`/`--no-verify`) implements with TDD from the approved spec + canvas, following `CLAUDE.md`. Infra/docs tasks get task-specific skill text added to its prompt. Ticks the task in `roadmap.md` on the branch.
2. **Gates** (code, in order): `npm run lint`, `npm run typecheck`, `npm test -- --coverage` (≥ 80 %), `npm run build-storybook`. Failure → errors fed back to the Builder, up to 3 retries, then `blocked` with the failing gate's output.
3. **QA** (tools: Read, Glob, Grep, Bash limited to Playwright scripts and writing files under `src/**/*.test.tsx`; may add tests, never edits production code — enforced by a post-check that the diff from QA touches only test files). Starts the worktree's Storybook, checks every spec state has a story, screenshots each state next to the canvas artboard, tests keyboard, runs axe. Failures → back to Builder (counts as a retry).
4. **Reviewer** (read-only: Read, Glob, Grep, `git diff`) reviews the diff against `done_when` and `CLAUDE.md`. One fix round with the Builder, then gates rerun; still failing → `needs_human`.
5. **PR:** push (Husky hook runs), `gh pr create` titled `DS-n: <title>`, body lists each `done_when` criterion with how it's met, gate results, and the worktree's Storybook link. You merge.

No agent approves its own output: gates are code, QA and Reviewer are separate agents with their own prompts and no write access to production code.

## 11. Interfaces

**CLI:** `status`, `next`, `design <id>`, `build <id>`, `approve <id>`, `request-changes <id> <comment>`, `block <id> <reason>`, `unblock <id>`, `retry <id>`, `stop [--clear]`, `dashboard`, `status --line`.

**Slash commands:** `.claude/commands/factory/{status,next,design,build,approve,block,unblock,retry,stop,dashboard}.md`, each a thin wrapper calling the CLI and reporting its output. `design`/`build` relay the CLI's refusal reason verbatim.

**Status line (optional, last):** `factory status --line` → `factory ▸ 1 running · 3 ready · 2 awaiting you`.

## 12. Events

One JSON line each: `{ ts, task, type, stage?, data }`. Types: `task.claimed`, `stage.started`, `stage.finished` (`design`, `build`, `gate:lint`, `gate:typecheck`, `gate:test`, `gate:storybook`, `qa`, `review`, `pr`), `agent.activity` (short summary derived from the SDK message stream: file edited, command run, test result), `gate.passed`, `gate.failed`, `needs_human` (reason, action), `task.blocked`, `task.done`, `usage.updated`. Payloads are scrubbed of anything that looks like a secret before writing.

## 13. Dashboard

- `factory dashboard` starts a small Node `http` server (no framework) on its own port; it tails `events.jsonl` and pushes over SSE. On connect: snapshot, then stream. Actions are POSTs that run the CLI. Binds to `127.0.0.1` only.
- Page (plain HTML/CSS/JS, styled with `tokens.css` and the design system's look):
  - **Needs you** (pinned): designs to approve (canvas + spec inline, Approve / Request changes), blocked tasks with reason (Retry / Unblock), PRs to merge (link). Browser notification + macOS notification (`osascript`) on new items.
  - **Now running:** card per run, stepper claim → design/build → gates → QA → review → PR, elapsed time, turns used, live `agent.activity` tail, Stop button.
  - **Board:** kanban by status with design/build badges and a blocked column.
  - **Runnable now** with Run buttons per line.
  - **Task detail:** deps, done-when, spec + approval + canvas, branch, PR, gate results, full log, usage, timeline.
  - Epic progress bars, connection indicator, global STOP.

## 14. Build order (phases; stop for your review after each)

0. Backlog fields in `roadmap.md` + `RoadmapMdSource` + adapter interface. You approve proposed values (§6.4).
1. CLI core: status, next, claim, events, state, lock, logs, stop. Spike: confirm Agent SDK runs on your Claude Code login.
2. Slash commands.
3. Design line (starts with the live-canvas spike).
4. Build line: gates, QA, Reviewer, PR.
5. Dashboard.
6. Status line.

**Demo:** `factory design DS-3` (Textarea) → you approve and merge → `factory build DS-4` → PR with all gates green, watched live on the dashboard.

## 15. Calls I made (check these)

- Factory code in `factory/` in this repo, TypeScript run via `tsx`, tests in the existing Jest.
- Runtime status not written to `roadmap.md`; `done` arrives through the task's own PR (§6.3).
- Design PRs are drafts until you approve; approval commit is made by the factory on your command.
- Limits in §8 (turns, 90 min, 3 retries, 1 review round).
- `cost.updated` replaced by `usage.updated`; no dollar figures shown.
- Live Claude Design publishing treated as manual until the spike says otherwise (§9).
- Proposed task metadata in §6.4, notably DS-2 and DS-9 as `needs_human`.

## 16. Open questions to verify during build

- Agent SDK auth via Claude Code subscription login, and how it reports usage-limit errors.
- Whether a canvas can be published to claude.ai from a headless run.
