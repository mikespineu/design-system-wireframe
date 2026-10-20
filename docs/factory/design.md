# Software factory: design

Status: **v3, built as Claude Code skills.** Source brief: [`PROMPT.md`](./PROMPT.md) (reusable in other projects). Usage: [`README.md`](./README.md). Operating rules the skills follow: [`factory/plugin/RULES.md`](../../factory/plugin/RULES.md).

## 1. Intent

Take a task from `roadmap.md` to a merged PR with as little hand-holding as possible, while the human keeps the decisions that matter: approving designs and anything marked `needs_human`. Each task runs isolated in its own worktree, is checked by hard gates (not agent opinion), and leaves a written record.

## 2. Decisions

| Topic | Decision |
| --- | --- |
| Interface | Claude Code skills typed as `/factory:…`, packaged as a repo-local plugin. No CLI, daemon or server. |
| Where it runs | Locally on the MacBook. GitHub Actions only run the PR checks. |
| Auth / budget | The `claude` terminal login; no API key. The usage limit is the only ceiling. |
| Trigger | Manual. Parallel tasks run in separate Claude Code sessions, one worktree each. |
| Orchestration | The main session follows the skill and `RULES.md`; the `designer`, `builder`, `qa` and `reviewer` subagents do the creative work. |
| Fix loops | Max 2 per stage, then blocked. `/factory:retry DS-n opus` for a stronger model. |
| Design | Only design tasks make a canvas and a spec. Canvas published to claude.ai (stable URL). The human always approves. |
| UI guard | `has_ui: no` builds that touch UI paths stop and ask; `--allow-ui` accepts and requires approval. |
| Merge | Every task ends in a PR; the factory squash-merges on green checks (≥ 1 check), plus `factory:approved` where required. |
| State | `roadmap.md` (via PRs), job files `factory/jobs/DS-n.md`, branches, PRs, labels. |
| Watching | `npm run factory:status` keeps a status page live (10 s refresh); `/factory:status` for a snapshot. Each session shows its own run live. |

## 3. Goals, non-goals, anti-goals

**Goals:** design → approved spec → build → merged PR, with a job file per task and a status page across all tasks; adding features to the roadmap from Claude Code.

**Non-goals:** a CLI or dashboard server, unattended or scheduled runs, running agents in CI, GitHub Issues as the backlog, npm publishing.

**Anti-goals:** any push to `main` or `--no-verify`; merging with a red or missing check or without required approval; a build from an unapproved spec; an agent approving its own work; two sessions taking the same task or ID.

## 4. Layout

```
.claude-plugin/marketplace.json      # repo-local marketplace → plugin "factory"
.claude/settings.json                # enables factory@design-system-factory for this repo
factory/
  plugin/
    .claude-plugin/plugin.json
    RULES.md                         # shared rules every skill reads
    agents/                          # designer, builder, qa, reviewer (prompt, tools, model)
    skills/
      status/ (+ scripts/status-page.mjs)   next/   add/   edit/
      design/   build/   approve/   merge/   retry/
  jobs/
    TEMPLATE.md   README.md   DS-<n>.md (one per task, land with each PR)
docs/specs/<Component>.md            # design specs (written by the design line)
docs/design-system-wireframe/*.dc.html   # canvases
```

## 5. Task model

`roadmap.md` tasks carry `type · has_ui · depends_on · needs_human · status` and a `done_when` list (1–5 items). A `build` with `has_ui: yes` depends on a `design` task. **Ready** = todo, deps done on main, no branch, and (UI build) an approved spec on main. The factory never edits `main`: a task's own PR ticks it done; `/factory:add` and `/factory:edit` open roadmap PRs. Existing tasks got their fields in this PR (DS-1 to DS-11, plus the new DS-12 for the second theme's build).

## 6. Job files

`factory/jobs/DS-n.md`: frontmatter (`status`, `stage`, branch, worktree, PR, canvas and Storybook links, model, loop counts, `needs_you`, `blocked_reason`, timestamps), then `## Timeline` (one line per event), `## Gate results`, and `## Notes`. The skill updates it at every stage and commits it with the work, so it's in the PR and stays on `main` as history. The status page reads it from the worktree (live), else from the task branch, else from `main`.

## 7. Lines

**Design (`/factory:design DS-n`):** claim (branch via GitHub API) → worktree + `npm ci` → job file → Designer subagent (scope: specs and canvases only) → publish the canvas with the Artifact tool (same URL on revisions) → deterministic spec check (fields, sections, tokens exist, canvas is valid HTML; max 2 loops) → draft PR labeled `factory:needs-approval` → waiting for the human. `/factory:design DS-n <feedback>` revises; `/factory:approve DS-n` stamps `approved: yes` with name and date, ticks the roadmap, labels `factory:approved`, and merges on green checks.

**Build (`/factory:build DS-n`):** refuses on the wrong type, open deps, or (UI) no approved spec unchanged since approval → claim → worktree → job file → Builder (TDD; scope excludes specs, canvases, hooks) → UI guard (`has_ui: no`) → gates (lint, typecheck, test with ≥ 80 % coverage, build-storybook) → QA (Storybook on the worktree's port; may only add tests) → Reviewer (read-only; JSON verdict) → tick roadmap + Done entry → PR → wait for checks → merge (approval label if required) → clean up. Each failing stage loops back to the Builder at most twice.

**Blocking:** commit, push, draft PR with `factory:blocked`, a comment with the reason, next step and last output, and the job file updated. `/factory:retry` resumes from that stage.

## 8. Adding to the roadmap

`/factory:add <feature>`: at most 3 questions → split (UI → design + build; non-UI → one task; tokens/release/secrets → `needs_human`; > 4 tasks → "split it") → preview the exact markdown → only after the user's ok: reserve the ID through the branch name `chore/roadmap-DS-n-<slug>` (GitHub API, atomic; also counts IDs in other branches) → roadmap PR labeled `factory:approved` → merge on green checks. `/factory:edit DS-n <change>` is the same for one todo/blocked task.

## 9. Status page

`factory/plugin/skills/status/scripts/status-page.mjs`: plain Node, no dependencies. It reads `origin/main:roadmap.md`, approved specs, job files, remote branches and open PRs (`gh`), and writes `.factory/status.html` (gitignored) styled with `tokens.css`. Sections: needs you, in progress, runnable now, epics, board (with job timeline and notes per task). Also `--json` (used by `/factory:next`), `--local` (preview with the working-tree roadmap), and `--watch [s]`: `npm run factory:status` rebuilds every 10 s and the page reloads itself (skipped while a task dialog is open).

## 10. Calls made (check these)

- Approval is the `factory:approved` label plus `approved: yes` in the spec, not a GitHub review (GitHub doesn't let you approve your own PR).
- Branch protection isn't available on this private repo with the current plan, so these rules are the only merge gate. **DS-8 (CI) is recommended first**: today only `claude-code-review` and `storybook-vercel` run on PRs.
- DS-1 is `has_ui: no` but edits `src/styles/tokens.css`, so the UI guard will stop it. Accept with `/factory:retry DS-1 --allow-ui` (then the PR needs your approval).
- Default models: Designer and Reviewer `opus`, Builder and QA `sonnet`.
- Skills that change things are user-only (`disable-model-invocation: true`).

## 11. Known limits

- Rules in skills are followed by the model, not enforced by code; scope checks and gates are real commands, but they run because the skill says so. Watch the first runs.
- `/factory:status` gives a snapshot; `npm run factory:status` keeps it live (every 10 s).
- Subagent tool limits restrict tool types, not paths; path scope is checked after each subagent with `git status` and reverted if needed.
