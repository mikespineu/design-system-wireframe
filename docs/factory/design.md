# Software factory: design

Status: **draft v2, awaiting approval**. Source brief: [`PROMPT.md`](./PROMPT.md).

## 1. Intent

Take a task from `roadmap.md` to an open pull request with as little hand-holding as possible, while the human keeps every decision that matters: approving designs and merging PRs. Each task runs isolated in its own worktree, is checked by hard gates (not agent opinion), and is visible live on a local dashboard.

## 2. Decisions from the brainstorm (yours)

| Topic | Decision |
| --- | --- |
| Where it runs | Locally on the MacBook only. Agents don't run in GitHub Actions; Actions only run the PR checks. |
| Auth / budget | No separate login and no API key: agents reuse the session you're already logged into with `claude` in the terminal (verified: headless `claude -p` runs with no `ANTHROPIC_API_KEY`). No dollar budget; the usage limit is the ceiling. |
| Fix loops | At most **2** fix loops per stage (gates, QA, review). Then `blocked`; `factory retry DS-n --model <id>` reruns with a stronger model. |
| Canvas scope | Only `design` tasks create a canvas and a spec. A `build` task with no UI needs no spec, and the factory makes sure it really has no UI (§10). |
| PR and merge | Every task ends in a PR. The factory merges it itself once GitHub checks are green and, where needed, a human has approved it on GitHub (§10.6). |
| Trigger | Manual, from Claude Code (`/factory:build DS-4`, `/factory:next`, …). No daemon picks work on its own. |
| Concurrency | Several tasks at once, each in its own worktree, started from separate Claude Code sessions. |
| Where you watch | The dashboard. The slash command starts a background run and returns immediately; no chat is attached to the run. |
| Design | Every design task produces a Claude Design canvas. You always approve the design; no agent approves it. The approved canvas becomes part of the spec the Builder and QA work from. |

## 3. Goals, non-goals, anti-goals

**Goals**
- `factory design DS-n` → canvas + spec, waiting for your approval.
- `factory build DS-n` → implemented change in a worktree, all gates green, QA + review passed, PR open, merged once GitHub checks (and, if required, a human) approve.
- Live dashboard showing every run across sessions, with a "Needs you" panel.
- Two lines (design, build) independently runnable.

**Non-goals (now):** GitHub Issues backlog (adapter seam only), npm publishing, hosted/team dashboard, scheduled or unattended runs, running agents in CI.

**Anti-goals (failure even if it "works")**
- Any direct push to `main`, any `--no-verify`, or a merge with a red/missing check or without a required human approval.
- A build starting from a spec you did not approve.
- An agent marking its own output as passed (gates are code; QA/Reviewer are separate agents).
- Two runs silently clobbering each other's state or worktree.
- A dead dashboard or preview link.

## 4. Constraints

- `CLAUDE.md` rules apply to every run: worktrees under `.worktrees/`, `npm ci` per worktree, per-worktree port formula, Radix primitives, `--ds-*` tokens only, story + test + `jest-axe` per component, coverage ≥ 80 %, Husky pre-push never bypassed.
- The factory never commits or pushes to `main` directly; `main` only changes by merging PRs. So **`roadmap.md` on `main` only changes through PRs** (see §6.3).
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

`id, title, epic, type (design|build|infra|docs), status (todo|ready|in-progress|review|done|blocked), depends_on, needs_human, done_when[], branch, pr, blocked_reason` — as in the brief — plus **`has_ui: boolean`** (does this task change anything a user sees: components, styles, tokens, Storybook pages). A `build` task with `has_ui: yes` must depend on a `design` task.

### 6.2 Format in `roadmap.md` (Phase 0)

The existing line stays; metadata goes in indented sub-bullets so it still reads well on GitHub:

```md
- [ ] **DS-4 Textarea — implementation.** `src/components/Textarea/` with component, CSS, stories, tests …
  - type: build · has_ui: yes · depends_on: DS-3 · needs_human: no · status: todo
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

| ID | type | has_ui | depends_on | needs_human | Notes |
| --- | --- | --- | --- | --- | --- |
| DS-1 | build | no | – | no | Theming infra; current tokens become `default`, nothing visible changes. UI guard (§10.1) checks that's true |
| DS-2 | design | yes | DS-1 | **yes** | New theme = new raw token values → human. Canvas shows the theme on existing components |
| DS-3 | design | yes | – | no | Textarea |
| DS-4 | build | yes | DS-3 | no | |
| DS-5 | design | yes | – | no | Toggle |
| DS-6 | build | yes | DS-5 | no | |
| DS-7 | infra | no | – | no | Library build |
| DS-8 | infra | no | DS-7 | no | CI pipeline. **Recommended first**: auto-merge relies on real checks (§10.6) |
| DS-9 | infra | no | DS-7, DS-8 | **yes** | npm release / trusted publishing → proposal only |
| DS-10 | docs | no | DS-1, DS-7 | no | Theme skill |
| DS-11 | docs | no | DS-1, DS-7 | no | Consumer docs |

DS-2 also needs a build task for the theme itself and the Storybook theme switcher; Phase 0 proposes it as **DS-12** (`build`, `has_ui: yes`, depends on DS-2).

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
1. Validate: right `type`, dependencies `done`, `needs_human` false, and (build with `has_ui: yes`) an approved spec on `main`. Otherwise refuse with the reason.
2. Claim, create worktree, `npm ci`.
3. Spawn a detached Node process for the run; CLI prints task, worktree, and dashboard URL, then exits.
4. Run process executes the line (§9 / §10), emitting events, honoring limits and STOP.

**Auth:** agents run through the Agent SDK, which drives the installed `claude` CLI and reuses its existing terminal login. The factory never sets or asks for an API key. If `claude` isn't logged in, the run refuses up front with "run `claude` and log in first".

**Loops (yours): max 2.** Each stage that can send work back to the Builder (gates, QA, review) gets at most 2 fix loops. After the 2nd failed loop the task is `blocked` with the last failure output, plus a `needs_human` event.

**Limits (my call, configurable in `factory/config.ts`):** per-agent `maxTurns` (Designer 60, Builder 80, QA 40, Reviewer 20), per-task wall clock 90 min. No cost limits; `cost.updated` is replaced by `usage.updated` (turns, duration, tokens if the SDK reports them).

**Models (my call):** a default model per role in `factory/config.ts`, picked from current IDs via the `claude-api` skill at build time.

**Retry:** `factory retry DS-n [--model <id>] [--from <stage>]` (and `/factory:retry DS-n --model opus`). It resumes on the same branch from the stage that failed (or `--from`), resets the loop counter, and uses the given model for every agent in that run. The model used is recorded in events and shown on the dashboard. The dashboard's Retry button has the same model picker.

**Usage limit reached:** SDK error is caught → task `blocked`, reason `usage limit reached`, `needs_human` event; work stays committed on the branch. `factory retry DS-n` resumes from the last finished stage.

**Kill switch:** `factory stop` writes `.factory/STOP`. Runs check it between stages and between agent turns (abort controller), then stop at that safe point and mark `blocked: stopped`. `factory stop --clear` removes it.

## 9. Design line (`type: design`)

Only `design` tasks produce a canvas and a spec. The spec is the extra input the matching build task works from.

1. **Designer agent** (tools: Read, Glob, Grep, Write/Edit limited to `docs/specs/**` and `docs/design-system-wireframe/**`, `Artifact` for publishing; no Bash) reads `README.md`, `tokens.css`, existing canvases and similar components (e.g. `Input`).
2. Writes the canvas `docs/design-system-wireframe/<Component>.dc.html` in the same `x-dc` format as `Components.dc.html` (every size and state as an artboard), adds it to `canvas.json`.
3. **Publishes the canvas** to claude.ai as a private artifact and records `canvas_url` in the spec. On a revision it republishes to the same URL, so the link never changes.
4. Writes `docs/specs/<Component>.md`: canvas path, `canvas_url`, sizes, all states, keyboard behavior, Radix primitive, token mapping (existing `--ds-*` only), a11y notes, `approved: no`. Any new token is listed under **Token requests** and forces `needs_human`.
5. A deterministic check validates the spec (required sections present, every token referenced exists in `tokens.css`, canvas file parses, `canvas_url` set).
6. Commit, push branch, open a **draft PR** `DS-n: <title>` with the canvas link in the body. Event `needs_human: approve design`.

**Your touch point (always):** dashboard shows the canvas rendered in an iframe next to the spec, with the live claude.ai link. You either:
- **Request changes** with a comment → Designer re-runs on the same branch with your feedback. These review rounds are yours, so the 2-loop cap doesn't apply to them, or
- **Approve** (`factory approve DS-n`) → factory commits `approved: yes`, date, approver (git user) to the spec on the branch, adds the `factory:approved` label, and marks the PR ready. The PR then merges like any other (§10.6). (Not a GitHub review: PRs are opened under your account, and GitHub doesn't allow approving your own PR.)

A build task becomes `ready` only when the approved spec is on `main`. Any later change to the canvas or spec resets `approved: no` (enforced by the spec check: approval stores a hash of canvas + spec).

**Live canvas: tested 2026-10-20.** A headless `claude -p` run, with no API key and `--allowedTools Artifact,Read`, published a test page to claude.ai and returned the URL. The Designer can therefore publish on its own. Phase 3 rechecks this through the Agent SDK `query()` path. The fallback, if that path lacks the tool, is a `claude -p` subprocess for the publish step only.

## 10. Build line (`type: build | infra | docs`)

1. **Builder** (tools: Read, Write, Edit, Glob, Grep, Bash with allowlist: `npm`, `npx`, `git` excluding `push`/`merge`/`--no-verify`) implements with TDD, following `CLAUDE.md`. For `has_ui: yes` it works from the approved spec + canvas. For `has_ui: no` there is no spec; it works from the task text and `done_when`, and its prompt says not to change UI. Infra/docs tasks get task-specific skill text added to its prompt. Ticks the task in `roadmap.md` on the branch.
   - **UI guard (`has_ui: no` only)** makes sure the task really needs no UI. It's a deterministic check after each Builder pass: if the diff touches UI paths (`src/components/**`, `src/styles/**`, `*.css`, `*.stories.tsx`, `.storybook/**`, `docs/design-system-wireframe/**`), the run stops. The task goes `blocked` with the files listed and a `needs_human` event: "this changes UI, so it needs a design task". You either add a design task, or mark the change as fine (`factory unblock DS-n --allow-ui`, recorded in events and in the PR body).
2. **Gates** (code, in order): `npm run lint`, `npm run typecheck`, `npm test -- --coverage` (≥ 80 %), `npm run build-storybook`. Failure → errors fed back to the Builder, max 2 loops, then `blocked` with the failing gate's output.
3. **QA** (tools: Read, Glob, Grep, Bash limited to Playwright scripts and writing files under `src/**/*.test.tsx`; may add tests, never edits production code — enforced by a post-check that the diff from QA touches only test files). For `has_ui: yes` it starts the worktree's Storybook, checks every spec state has a story, screenshots each state next to the canvas artboard, tests keyboard, and runs axe. For `has_ui: no` it checks each `done_when` item black-box (e.g. runs the new build/workflow command). Failures → back to Builder, max 2 loops.
4. **Reviewer** (read-only: Read, Glob, Grep, `git diff`) reviews the diff against `done_when` and `CLAUDE.md`. Findings → Builder, then gates rerun, max 2 loops; still failing → `blocked` + `needs_human`.
5. **PR (always):** push (Husky hook runs), `gh pr create` titled `DS-n: <title>`, body lists each `done_when` criterion with how it's met, gate results, model(s) used, and the worktree's Storybook link.
6. **Merge (by the factory):** the run waits on `gh pr checks --watch` (timeout 30 min, my call), then merges with `gh pr merge --squash --delete-branch` only when all of these hold:
   - every GitHub check on the PR is green, with at least one check reported (no checks = no merge);
   - the branch is up to date with `main` and has no conflicts. If it's behind, the factory merges `main` into the branch, reruns the gates, and pushes, which counts toward the loop cap;
   - **if human approval is required**, the PR has `factory:approved`. Required for: design PRs (always), tasks with `needs_human: yes`, and runs unblocked with `--allow-ui`. If approval is still missing, the run ends with `needs_human: approve PR`, and `factory approve DS-n` later does the check-then-merge;
   - GitHub allows it. Checked 2026-10-20: branch protection isn't available on this private repo with the current GitHub plan, so these factory rules are the only merge gate. If protection is added later and blocks the merge, the factory doesn't work around it; the PR shows up in "Needs you" as "merge on GitHub".

   After merge: worktree removed, local branch deleted, its Storybook stopped, `task.done` emitted. A red check → logs fetched (`gh run view --log-failed`) and fed back to the Builder as a gate failure (counts toward the loop cap).

No agent approves its own output: gates are code, QA and Reviewer are separate agents with their own prompts and no write access to production code.

## 11. Interfaces

**CLI:** `status`, `next`, `design <id>`, `build <id>`, `approve <id>`, `request-changes <id> <comment>`, `block <id> <reason>`, `unblock <id> [--allow-ui]`, `retry <id> [--model <id>] [--from <stage>]`, `merge <id>` (check-then-merge, same rules as §10.6), `stop [--clear]`, `dashboard`, `status --line`.

**Slash commands:** `.claude/commands/factory/{status,next,design,build,approve,merge,block,unblock,retry,stop,dashboard}.md`, each a thin wrapper calling the CLI and reporting its output. `design`/`build` relay the CLI's refusal reason verbatim.

**Status line (optional, last):** `factory status --line` → `factory ▸ 1 running · 3 ready · 2 awaiting you`.

## 12. Events

One JSON line each: `{ ts, task, type, stage?, data }`. Types: `task.claimed`, `stage.started`, `stage.finished` (`design`, `build`, `gate:lint`, `gate:typecheck`, `gate:test`, `gate:storybook`, `ui-guard`, `qa`, `review`, `pr`, `ci`, `merge`), `agent.activity` (short summary derived from the SDK message stream: file edited, command run, test result), `gate.passed`, `gate.failed`, `needs_human` (reason, action), `task.blocked`, `task.done`, `pr.merged`, `usage.updated` (includes model used). Payloads are scrubbed of anything that looks like a secret before writing.

## 13. Dashboard

- `factory dashboard` starts a small Node `http` server (no framework) on its own port; it tails `events.jsonl` and pushes over SSE. On connect: snapshot, then stream. Actions are POSTs that run the CLI. Binds to `127.0.0.1` only.
- Page (plain HTML/CSS/JS, styled with `tokens.css` and the design system's look):
  - **Needs you** (pinned): designs to approve (canvas + spec inline, Approve / Request changes), blocked tasks with reason (Retry with model picker / Unblock), PRs waiting for your approval or a manual merge (Approve / link). Browser notification + macOS notification (`osascript`) on new items.
  - **Now running:** card per run, stepper claim → design/build → gates → QA → review → PR → CI → merge, model in use, elapsed time, turns used, live `agent.activity` tail, Stop button.
  - **Board:** kanban by status with design/build badges and a blocked column.
  - **Runnable now** with Run buttons per line.
  - **Task detail:** deps, done-when, spec + approval + canvas, branch, PR, gate results, full log, usage, timeline.
  - Epic progress bars, connection indicator, global STOP.

## 14. Build order (phases; stop for your review after each)

0. Backlog fields in `roadmap.md` + `RoadmapMdSource` + adapter interface. You approve proposed values (§6.4).
1. CLI core: status, next, claim, events, state, lock, logs, stop, retry.
2. Slash commands.
3. Design line, incl. canvas publishing (recheck the Artifact tool via SDK `query()`).
4. Build line: UI guard, gates, QA, Reviewer, PR, CI wait, merge.
5. Dashboard.
6. Status line.

**Demo:** `factory design DS-3` (Textarea) → you approve → factory merges → `factory build DS-4` → PR, gates and checks green → factory merges, all watched live on the dashboard.

## 15. Calls I made (check these)

- Factory code in `factory/` in this repo, TypeScript run via `tsx`, tests in the existing Jest.
- Runtime status not written to `roadmap.md`; `done` arrives through the task's own PR (§6.3).
- Design PRs are drafts until you approve. Your approval is the `factory:approved` label plus `approved: yes` in the spec, not a GitHub review (§9).
- Human approval is required for design PRs, `needs_human` tasks and `--allow-ui` unblocks. Every other PR auto-merges on green checks (§10.6).
- Merging needs at least one green check, so DS-8 (CI) is recommended as the first build task; today only `claude-code-review` and `storybook-vercel` run on PRs.
- Squash merge, 30 min CI wait.
- Limits in §8 (turns, 90 min); loops are capped at 2 per stage (yours).
- `cost.updated` replaced by `usage.updated`; no dollar figures shown.
- Proposed task metadata in §6.4, notably `has_ui`, DS-2 and DS-9 as `needs_human`, and the new DS-12.

## 16. Open questions to verify during build

- How the SDK reports a usage-limit error (exact shape, to map it to `blocked`).
- That the `Artifact` tool is exposed through SDK `query()` as it is through `claude -p` (fallback in §9).

