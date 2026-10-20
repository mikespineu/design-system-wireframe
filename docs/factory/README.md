# Software factory

> **Status: planned, not built yet.** This guide describes how the factory will work once it's built from [`design.md`](./design.md). Commands below don't exist yet.

The factory takes tasks from [`roadmap.md`](../../roadmap.md), designs or builds each one in its own worktree with Claude agents, checks the result with hard gates, opens a pull request, and merges it when checks pass and you've approved what needs approving. You start everything by hand and watch it on a local dashboard.

## Before you start

- You're logged in to Claude Code in the terminal (run `claude` once). The factory reuses that login; there's no API key to set.
- `gh` is installed and logged in (`gh auth status`).
- You're in the primary checkout of this repo, with `npm ci` done.

Your usage limit is the only budget. If you hit it, the task is marked blocked with the reason "usage limit reached" and you retry it later.

## The everyday loop

```text
/factory:add "…"        add a feature to the roadmap
/factory:design DS-n    designer makes a canvas + spec → you approve
/factory:build DS-n     builder implements → gates → QA → review → PR → merge
/factory:dashboard      watch it all live
```

Each `/factory:*` command works in any Claude Code session. `design` and `build` start a background run and reply right away with the worktree and dashboard link, so you can start another task from a second session while the first one runs.

## 1. Add a feature to the roadmap

```text
/factory:add "Tooltip that shows on IconButton hover and keyboard focus"
```

1. Claude may ask up to 3 short questions (which epic, does it have UI, what does it depend on).
2. It shows you the new tasks exactly as they'll appear in `roadmap.md`:

   ```md
   - [ ] **DS-13 Tooltip — design.** Define placement, delay, states, keyboard behavior.
     - type: design · has_ui: yes · depends_on: – · needs_human: no · status: todo
     - done_when:
       - Canvas published and linked in `docs/specs/Tooltip.md`
       - Spec covers every state and keyboard behavior
   - [ ] **DS-14 Tooltip — implementation.** Build on Radix `Tooltip`.
     - type: build · has_ui: yes · depends_on: DS-13 · needs_human: no · status: todo
     - done_when:
       - Matches approved spec in every state
       - Story per state, keyboard story, `jest-axe` test, exported from `src/index.ts`
   ```

3. Say "ok" to apply, or ask for changes and get a new preview.
4. The factory opens a PR `roadmap: add DS-13, DS-14` and merges it once checks are green.

How features get split:

| Feature | You get |
| --- | --- |
| Has UI | a **design** task, then a **build** task that depends on it |
| No UI (tooling, CI, docs) | one task: `build`, `infra` or `docs` |
| Needs new tokens, a release, or secrets | the same, marked `needs_human: yes` |
| More than 4 tasks | rejected: split it into smaller features |

Other ways to add or change work:

```bash
# one quick task, no questions
npm run factory -- add task "Fix Tag focus ring" --type build --has-ui yes --done "Focus ring matches Button"
```

```text
/factory:edit DS-6      change an existing task (todo or blocked only)
```

You can still edit `roadmap.md` by hand in a PR. `npm run lint` runs `factory lint-roadmap`, which checks the fields, IDs and dependencies.

## 2. Design a component

```text
/factory:design DS-3
```

The Designer:

1. Draws a canvas `docs/design-system-wireframe/<Component>.dc.html` with every size and state, using only existing `--ds-*` tokens.
2. Publishes it to claude.ai and keeps the same link across revisions.
3. Writes `docs/specs/<Component>.md` with the canvas link, states, keyboard behavior, token mapping, a11y notes, and `approved: no`.
4. Opens a draft PR and puts the design in **Needs you** on the dashboard.

Then it's your turn, every time:

```text
/factory:approve DS-3                              looks good
npm run factory -- request-changes DS-3 "…"        what to change (or use the dashboard)
```

Request changes as many times as you like. Approving sets `approved: yes` with the date and your name, and labels the PR `factory:approved`. The factory merges it once checks are green. The build task can start only after the approved spec is on `main`.

## 3. Build a task

```text
/factory:build DS-4
```

What happens, in order:

| Stage | What it does | If it fails |
| --- | --- | --- |
| Builder | implements with TDD in `.worktrees/feat-DS-4-…`, from the approved spec if the task has UI | – |
| UI guard | for `has_ui: no` tasks, stops if UI files changed | blocked, asks you |
| Gates | `lint`, `typecheck`, `test` (coverage ≥ 80 %), `build-storybook` | back to Builder, max 2 loops |
| QA | checks Storybook against the canvas, keyboard, axe | back to Builder, max 2 loops |
| Reviewer | reads the diff against `done_when` and `CLAUDE.md` | back to Builder, max 2 loops |
| PR | `DS-4: <title>`, each `done_when` with how it's met | – |
| Merge | squash-merge when every GitHub check is green (and `factory:approved` if needed) | red check → back to Builder |

`build` refuses with a reason if the task is the wrong type, its dependencies aren't done, it's marked `needs_human`, or it has UI and no approved spec.

**Human approval is needed before merging** for design PRs, tasks with `needs_human: yes`, and anything you unblocked with `--allow-ui`. Everything else merges on its own once checks pass.

## 4. When something goes wrong

```text
/factory:status                        what's running, ready, waiting for you
/factory:retry DS-4                    rerun from the stage that failed
/factory:retry DS-4 --model opus       same, with a stronger model
/factory:unblock DS-4 --allow-ui       accept a UI change on a no-UI task
/factory:block DS-4 "waiting on API"   park a task
/factory:stop                          stop every run at the next safe point
```

`/factory:stop` creates `.factory/STOP`; runs finish their current step and stop. `npm run factory -- stop --clear` lets them run again.

## 5. Dashboard

```text
/factory:dashboard
```

Opens a local page (its own port, `127.0.0.1` only) that updates live:

- **Needs you:** designs to approve, blocked tasks with the reason, PRs waiting for you. You get a browser and macOS notification for each new item.
- **Now running:** one card per run with its stage, elapsed time, model and live activity.
- **Board**, **Runnable now** (with Run buttons), task details with logs and gate results, and a global **STOP**.

## Where things live

| Path | What |
| --- | --- |
| `roadmap.md` | tasks: the only backlog, changed only by PRs |
| `docs/specs/<Component>.md` | approved design specs |
| `docs/design-system-wireframe/*.dc.html` | canvases |
| `.factory/events.jsonl` | every event, append-only (gitignored) |
| `.factory/state.json` | current snapshot, rebuilt from events |
| `.factory/logs/DS-n.log` | full log per task |
| `.worktrees/feat-DS-n-…` | each task's worktree |

## Rules the factory never breaks

- Never pushes to `main` directly and never uses `--no-verify`.
- Never merges with a red or missing check, or without your approval where it's required.
- Never lets an agent approve its own work.
- Never writes secrets to logs or events.
