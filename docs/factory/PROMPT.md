# Build a software factory as Claude Code skills

Reusable prompt. Paste it into Claude Code in any repo. Fill in or adjust the **Project** section first; everything else is the same for any project.

## Project (adjust per repo)

- Stack and conventions: read `CLAUDE.md` (or `AGENTS.md`) first and follow it strictly: worktree rules, branch names, per-worktree install, never commit to `main`, never bypass git hooks, and the project's definition of done (tests, stories, a11y checks, coverage).
- Backlog file: `roadmap.md`, with epics and tasks that have stable IDs `<PREFIX>-<n>` (e.g. `DS-12`), never reused or renumbered, checkbox status (`[ ]` / `[~]` / `[x]`), and a Done section.
- Verification commands (the hard gates), e.g. `npm run lint`, `npm run typecheck`, `npm test -- --coverage`, `npm run build-storybook`.
- UI paths (for the UI guard), e.g. `src/components/`, `src/styles/`, `*.css`, `*.stories.*`, `.storybook/`.
- Design source: Claude Design canvases (`*.dc.html`) under a design folder, published to claude.ai; specs under `docs/specs/`. Drop the design line if the project has no UI.
- Dev-server port rule from `CLAUDE.md` (one deterministic port per worktree).

## Goal

A "software factory" that takes tasks from the backlog, designs or implements each one in isolation with Claude subagents, verifies it with hard gates, opens a PR, and merges it when GitHub checks are green. The human approves designs and anything marked `needs_human`, and sees everything in one status page.

## Decisions (already made; don't re-ask)

- **Interface = Claude Code skills, not a CLI.** Everything is typed as `/factory:<skill>` in Claude Code. Package it as a repo-local plugin named `factory` (`.claude-plugin/marketplace.json` at the repo root + `.claude/settings.json` enabling it), so skills appear as `/factory:…`. No separate CLI, daemon or server.
- **Runs locally** on the developer's machine, on their Claude Code login (no API key). The usage limit is the only budget. Nothing runs unattended or in CI except the PR checks.
- **Manual trigger.** The user starts each task. Several tasks can run in parallel, each in its own Claude Code session and git worktree.
- **The main session orchestrates; subagents do the creative work.** Subagents in the plugin's `agents/`: `designer`, `builder`, `qa`, `reviewer`, each with its own prompt, tool list and default model. No agent approves its own output.
- **Hard gates**, run by the orchestrating session as real commands; pass/fail is the exit code.
- **Max 2 fix loops per stage** (gates, QA, review, CI, spec check), then the task is blocked. `/factory:retry <id> opus` resumes from the failed stage with a stronger model.
- **Design line** (UI projects): the Designer writes a canvas and a spec. The session publishes the canvas to claude.ai with the Artifact tool, keeping one stable URL across revisions, and opens a draft PR. The human always approves (`/factory:approve`) or asks for changes (`/factory:design <id> <feedback>`). The approved spec on `main` is the only handoff to the build task. Only design tasks produce a canvas and a spec.
- **`has_ui` on every task.** A UI build depends on an approved design. A `has_ui: no` build is checked by a **UI guard**: if it touches UI paths, it stops and asks (`/factory:retry <id> --allow-ui` accepts it, and the PR then needs approval).
- **Every task ends in a PR. The factory merges it** (squash) only when every GitHub check is green (at least one check must exist), the branch is mergeable, and, where required (design, `needs_human`, accepted UI change), the PR has the `factory:approved` label from `/factory:approve`. Never push to `main`; never `--no-verify`.
- **State in files:** the backlog in `roadmap.md` (changed only through PRs). **One job file per task, `factory/jobs/<id>.md`**: status, stage, links, loop counts, a timeline of every event, and notes. It's committed on the task branch and lands on `main` with the PR as history. Plus branches, PRs and labels (`factory:needs-approval`, `factory:approved`, `factory:blocked`).
- **Claim atomically** by creating the task branch through the GitHub API (`gh api …/git/refs`); if it already exists, the task is taken.
- **Status page:** `/factory:status` runs a small dependency-free script that reads the roadmap, specs, job files (live from worktrees first), branches and PRs, writes a static HTML page styled with the project's tokens, and opens it. It shows needs-you (approvals, blocked), in progress, runnable now, epic progress, and a board. Not live; it refreshes when the command runs.
- **Adding work:** `/factory:add <feature>` asks at most 3 questions, splits the feature (UI → design + build; non-UI → one task; tokens/release/secrets → `needs_human`; more than 4 tasks → "split it"), previews the exact roadmap markdown, and only after the user's ok opens a roadmap PR (IDs reserved via the branch name, so parallel adds can't collide) that merges on green checks. `/factory:edit <id> <change>` does the same for one task.

## Skills to build

`status`, `next`, `add`, `edit`, `design`, `build`, `approve`, `merge`, `retry`, plus a shared `RULES.md` in the plugin root that every skill reads (task format, job files, labels, claim/worktree, ports, gates, loops, UI guard, per-agent scope checks, commit/PR/merge/block rules). Mark skills that change things (`design`, `build`, `approve`, `merge`, `retry`) `disable-model-invocation: true`, so only the user starts them. `approve` must never run on the model's own initiative.

## Task model (roadmap.md)

```md
### Epic: Components

- [ ] **DS-4 Textarea — implementation.** Description.
  - type: build · has_ui: yes · depends_on: DS-3 · needs_human: no · status: todo
  - done_when:
    - Testable criterion
```

Fields: `type` (`design | build | infra | docs`), `has_ui`, `depends_on`, `needs_human`, `status` (`todo | ready | in-progress | review | done | blocked`), `done_when` (1–5 items). First step of the work: add these fields to every existing task (propose values; the human approves in the PR).

## How to work

1. Read `CLAUDE.md`, the backlog, and existing design/test conventions. Ask at most a few questions about anything project-specific that's still unclear, then write a short design doc in `docs/factory/design.md` and wait for approval.
2. Build in a worktree: backlog fields → `RULES.md` + job template → subagents → skills → status script → docs (`docs/factory/README.md` usage guide). Validate the plugin with `claude plugin validate --strict`.
3. Open one PR with everything.

## Done when

- `docs/factory/design.md` approved.
- `/factory:design <id>` produces a published canvas and a spec in a draft PR awaiting approval. `/factory:build <id>` takes a real small task to a green PR that the factory merges.
- Every run leaves a complete job file, and `/factory:status` shows it.
- The project's own lint, typecheck and tests still pass.

## Non-goals

A CLI or daemon, background/unattended runs, a hosted dashboard, auto-publishing packages, migrating the backlog to an issue tracker.
