---
name: design
description: Run the factory design line on a roadmap design task (DS-n) - Designer subagent draws a Claude Design canvas and writes the spec, the canvas is published to claude.ai, and a draft PR waits for the user's approval. Also revises a design with the user's feedback.
argument-hint: <DS-n> [feedback to revise an existing design] [model]
disable-model-invocation: true
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(lsof:*), Bash(curl:*), Bash(cksum:*), Read, Write, Edit, Glob, Grep, Agent, Artifact
---

# /factory:design

Arguments: `$ARGUMENTS` (task ID, then optional feedback text; a trailing `opus`/`sonnet`/`haiku` is the model).

First read the rules: `${CLAUDE_PLUGIN_ROOT}/RULES.md` (in this repo: `factory/plugin/RULES.md`). Follow them exactly.

## 0. Decide: new design or revision

- Look for an open PR for this task: `gh pr list --state open --search "head:feat/DS-<n>-" --json number,headRefName,url,labels`.
- **No PR and no branch** → new design (steps 1–6).
- **Open draft PR** and the user gave feedback → revision: reuse the branch and worktree (create the worktree from the remote branch if it's not there), set the job file to `in-progress`, add a timeline line `design: revising (<short feedback>)`, then go to step 2 with the feedback.
- Otherwise tell the user what exists and stop.

## 1. Check and claim

1. Read the task from `origin/main:roadmap.md`. Refuse with a clear reason if: it isn't `type: design`, it's done, a dependency isn't done, or its branch exists. (`needs_human: yes` is fine here; the user started it on purpose.)
2. Claim, create the worktree, run `npm ci`, and create `factory/jobs/DS-<n>.md` (line `design`), as in the rules. Commit the job file.

## 2. Designer

- Component name: the title before " — ", in PascalCase without spaces (`Textarea — design` → `Textarea`).
- Canvas: `docs/design-system-wireframe/<Component>.dc.html`. Spec: `docs/specs/<Component>.md`.
- Update the job file (`stage: design`). Run the **designer** subagent with: the absolute worktree path, the task block from the roadmap, the canvas and spec paths, the existing `canvas_url` if any, and the feedback if this is a revision.
- Then the scope check: the Designer may only have changed `docs/specs/**` and `docs/design-system-wireframe/**`. Revert anything else.

## 3. Publish the canvas (you, not the agent)

- Publish the canvas file with the **Artifact** tool as a private artifact (icon `design`). On a revision, republish to the **same URL** (pass the existing `canvas_url` as `url`) so the link never changes.
- Write the URL into the spec's `canvas_url` field and the job file's `canvas_url`. Timeline: `publish: canvas at <url>`.

## 4. Spec check (deterministic, by you)

Fail the check if any of these is wrong:
- Spec has `# <Component>`, fields `task: DS-<n>`, `canvas: <path>`, `canvas_url: https://claude.ai/…`, `approved: no`.
- Sections present: `## Sizes`, `## States`, `## Keyboard`, `## Radix`, `## Tokens`, `## Accessibility`, `## Token requests`.
- Every `--ds-*` token mentioned outside "Token requests" exists in `src/styles/tokens.css` (`grep -o -- '--ds-[a-z0-9-]*'` on both and compare).
- The canvas file exists and is a complete HTML document.

On failure: one fix loop = run the Designer again with the list of problems (max 2 loops, `loops.spec` in the job file), then publish and check again. After 2 failed loops, block (rules).

## 5. Draft PR, then wait for the user

1. Job file: `status: waiting`, `stage: pr`, `needs_you: approve the design (/factory:approve DS-<n>) or ask for changes (/factory:design DS-<n> <feedback>)`. Timeline line.
2. Commit (`DS-<n>: design spec and canvas for <Component>`), push, and open (or update) a **draft** PR `DS-<n>: <title>` with `factory:needs-approval`. Body: canvas link, spec path, a summary of the design decisions, and a warning if "Token requests" lists new tokens (approving the design approves them).
3. Record the PR number and URL in the job file, commit, push.

## 6. Hand over

Tell the user, briefly: the canvas link, the PR link, any token requests, and the two options:
- `/factory:approve DS-<n>` to approve (then it merges when checks are green)
- `/factory:design DS-<n> <what to change>` to revise

Never approve the design yourself, and never mark the spec `approved: yes`.
