# Factory rules (shared by every `/factory:*` skill)

The factory is a set of Claude Code skills. You (the main session) are the orchestrator: you follow these rules exactly, delegate the creative work to the factory subagents (`designer`, `builder`, `qa`, `reviewer`), and run every check yourself as a real command. Whether something passed is decided by exit codes and these rules, never by an agent's opinion. No agent approves its own output, and you never approve on the user's behalf.

State lives in files and git: `roadmap.md` on `main` (the backlog), one **job file per task** (`factory/jobs/DS-<n>.md`, below), task branches, and PRs. Don't keep state anywhere else.

## Tasks

`roadmap.md` on `origin/main` is the backlog. Each task looks like this:

```md
- [ ] **DS-4 Textarea — implementation.** Description.
  - type: build · has_ui: yes · depends_on: DS-3 · needs_human: no · status: todo
  - done_when:
    - Criterion
```

- `type`: `design` (canvas + spec), or `build` / `infra` / `docs` (code).
- `has_ui: yes` build tasks need an **approved spec on `main`** from the design task they depend on.
- **Ready** means: status `todo`, every `depends_on` task is `[x]` done on main, there's no `feat/DS-n-*` branch on origin, and (for UI builds) the approved spec exists.
- `needs_human: yes`: `/factory:next` skips it. If the user starts it explicitly, its PR needs their approval before merging.
- Never edit `roadmap.md` on `main`. Roadmap changes go through a PR: the task's own PR ticks it done; `/factory:add` and `/factory:edit` open roadmap PRs.

Read the backlog with `git fetch -q origin main && git show origin/main:roadmap.md`.

## Job files (`factory/jobs/DS-<n>.md`)

Every task the factory touches has a job file: its status, stage and notes. The job ID is the task ID. Create it right after the claim, from `factory/jobs/TEMPLATE.md`, inside the task's worktree.

- **Update it at every stage change** (frontmatter `status`, `stage`, `updated`, `loops`, links) and **append a line to `## Timeline`** for each event: `- <HH:MM> <stage>: <what happened>` (agent finished + turns, gate passed/failed with the one-line reason, QA/review verdict with findings, PR opened, waiting for you, blocked, merged).
- Put decisions, open questions and anything the user should know under `## Notes`. Subagents report notes in their final message; you copy the useful ones here.
- `needs_you`: one line describing what the user must do (empty when nothing). `blocked_reason`: set when blocked, cleared on retry.
- Commit it with the work (`DS-<n>: job update` when it's the only change). It's pushed with the branch, so it's in the PR and lands on `main` on merge, where it stays as the task's history.
- `status` values: `claimed` → `in-progress` → `waiting` (needs you) / `blocked` → `merged`. `stage`: `claim`, `design`, `publish`, `build`, `ui-guard`, `gate:lint`, `gate:typecheck`, `gate:test`, `gate:storybook`, `qa`, `review`, `pr`, `ci`, `merge`.
- Never write secrets, tokens or full environment dumps into a job file.

The status page reads job files from local worktrees first (live), then from task branches on origin, then from `main`.

## Labels (create them if missing: `gh label create <name> --force --color 000000`)

| Label | Meaning |
| --- | --- |
| `factory:needs-approval` | waiting for the user (design review, `needs_human` task, accepted UI change) |
| `factory:approved` | the user approved via `/factory:approve`; may merge when checks are green |
| `factory:blocked` | stopped after the loop limit or an error; the reason is the latest PR comment |

## Starting a task (claim + worktree)

1. Branch: `feat/DS-<n>-<slug>` (slug = kebab-case title, max 40 chars). Same prefix for design tasks.
2. **Claim atomically** without pushing from any checkout:
   `gh api repos/{owner}/{repo}/git/refs -f ref=refs/heads/<branch> -f sha=$(git rev-parse origin/main)`.
   If it fails with "Reference already exists", someone else has the task: stop and tell the user.
3. Worktree: `git fetch -q origin <branch> && git worktree add .worktrees/<branch with / → -> -B <branch> origin/<branch>`, then `git -C <worktree> branch --set-upstream-to origin/<branch>`, then `npm ci` inside it.
4. Create `factory/jobs/DS-<n>.md` from the template (status `claimed`, stage `claim`).
5. Work only inside the worktree, with absolute paths. Pass the absolute worktree path to every subagent.

## Ports (from `CLAUDE.md`)

`PORT=$((6100 + $(basename "<worktree>" | cksum | cut -d' ' -f1) % 900))`; if `lsof -i :$PORT` shows a listener, increment until free. Never use 6006, never kill other processes. Storybook: `cd <worktree> && npx storybook dev -p $PORT --no-open --ci` in the background; wait until `curl -sf http://localhost:$PORT` answers.

## Gates (hard, run by you, in this order, in the worktree)

1. `npm run lint`
2. `npm run typecheck`
3. `npm test -- --coverage --ci` (the 80 % threshold is in `jest.config.cjs`)
4. `npm run build-storybook -- --quiet`

Stop at the first failure. The output (last ~150 lines) is the feedback for the Builder.

## Loops

At most **2 fix loops per stage** (gates, QA, review, CI, spec check). A fix loop = the Builder (or Designer) runs again with the failure as feedback, then everything from that stage on runs again. After the 2nd failed loop the task is **blocked** (below). Retry with a stronger model via `/factory:retry DS-n opus`.

Model per agent: use the subagent's default unless the user asked for one; then pass it as the Agent tool's `model` for every agent in that run.

## UI guard (build tasks with `has_ui: no`)

After every Builder pass: `git -C <worktree> diff --name-only origin/main...HEAD` plus `git status --porcelain`. If any path matches `src/components/`, `src/styles/`, `*.css`, `*.stories.*`, `*.mdx`, `.storybook/`, `docs/design-system-wireframe/`, stop: block the task with the file list and the reason "has_ui: no but changes UI files; needs a design task". The user can accept it with `/factory:retry DS-n --allow-ui`, which adds `factory:needs-approval` to the PR.

## Scope checks after each subagent (deterministic, by you)

- **Designer** may only change `docs/specs/**` and `docs/design-system-wireframe/**`.
- **Builder** may not change `docs/specs/**`, `docs/design-system-wireframe/**`, `.husky/**`, or `.github/workflows/claude-code-review.yml`.
- **QA** may only add or change `*.test.ts(x)` files and `.qa/**` (gitignored).
- **Reviewer** changes nothing.

Revert anything outside scope (`git checkout -- <file>` / delete untracked) and tell the user what you reverted.

## Commits and pushes

- Commit in the worktree: `git add -A && git commit -m "DS-<n>: <summary>"` with the `Co-Authored-By` trailer from the session's attribution rules.
- Push with `git push -u origin <branch>`. The Husky pre-push hook runs lint and test. **Never** `--no-verify`, never push to `main`, never force-push `main`.

## PRs

- Title `DS-<n>: <title>`. Body: each `done_when` item as a checked box with how it's met, gate results, the model(s) used, the canvas link (design) or Storybook link, and the attribution line from the session's rules.
- Design PRs open as **drafts** with `factory:needs-approval`.

## Merging (the factory merges; the user approves where needed)

Merge only when **all** of these hold:

1. `gh pr checks <n> --json name,bucket` returns **at least one** check and every one is `pass` or `skipping`. Wait with `gh pr checks <n> --watch` (up to 30 min). If there are no checks after 2 minutes, don't merge: tell the user and leave the PR for them.
2. The PR is mergeable (`gh pr view <n> --json mergeable,mergeStateStatus`). If it's behind or conflicting, merge `origin/main` into the branch in the worktree, re-run the gates, push, and wait again. Real conflicts: block.
3. If approval is required (design PRs, `needs_human: yes` tasks, accepted UI changes), the PR has `factory:approved`.

Before merging, set the job file to `status: merged`, `stage: merge`, add the timeline line, commit and push (so the record lands on `main`; wait for checks again if that push restarts them). Then `gh pr merge <n> --squash`, `git push origin --delete <branch>`, stop that worktree's Storybook, `git worktree remove <worktree>` and `git branch -D <branch>`.

A red check is a CI failure: fetch `gh run view <run-id> --log-failed` and feed it to the Builder as a fix loop.

## Blocking

To block: commit whatever exists (`git commit --allow-empty` if nothing), push, open the PR as a draft if there isn't one, add `factory:blocked`, and post a comment:

```
factory: blocked at <stage>
Reason: <one line>
Next: <what the user can do, e.g. /factory:retry DS-n opus>
<details><summary>Last output</summary>

<last ~100 lines>
</details>
```

Set the job file's `status: blocked`, `blocked_reason`, `needs_you`, add the timeline line, and commit it before pushing. Then tell the user the reason and the next step.

## Ending a run

Finish every run with a short summary: task, stage reached, PR link, and what (if anything) the user needs to do. If the worktree still exists and its Storybook is running, end with its link, e.g. `http://localhost:6137` (required by `CLAUDE.md`; check it answers first).

Then run the status page script so the user's overview is current:
`node "${CLAUDE_PLUGIN_ROOT}/skills/status/scripts/status-page.mjs" --quiet` (in this repo: `factory/plugin/skills/status/scripts/status-page.mjs`).
