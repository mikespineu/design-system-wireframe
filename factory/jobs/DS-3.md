---
task: DS-3
title: "Textarea — design"
line: design
status: waiting
stage: pr
branch: "feat/DS-3-textarea-design"
worktree: "/Users/michalkrecisz/Desktop/workspace/design-system-test/.worktrees/feat-DS-3-textarea-design"
pr: ""
pr_url: ""
canvas_url: "https://claude.ai/artifact/2xzRy5QSUXVA3FGCTy25N2"
storybook_url: ""
model: default
loops: { gates: 0, qa: 0, review: 0, ci: 0, spec: 0 }
needs_you: "approve the design (/factory:approve DS-3) or ask for changes (/factory:design DS-3 <feedback>)"
blocked_reason: ""
started: "2026-10-20T10:25Z"
updated: "2026-10-20T10:29Z"
---

# DS-3 Textarea — design

## Timeline

- 12:25 claim: claimed feat/DS-3-textarea-design
- 12:25 design: designer started
- 12:29 design: designer finished (17 tool uses); scope check ok (docs/specs, docs/design-system-wireframe only)
- 12:29 publish: canvas at https://claude.ai/artifact/2xzRy5QSUXVA3FGCTy25N2
- 12:29 spec: check passed (fields, sections, 20 tokens all in tokens.css, canvas is complete HTML)
- 12:29 pr: waiting for you: approve or request changes

## Gate results

| Gate | Result |
| --- | --- |
| lint | – |
| typecheck | – |
| test | – |
| storybook | – |

## Notes

- Sizes are row counts: sm 2, md 4 (default), lg 8; `rows` overrides. 1 row = 44 px, lines up with `Input`.
- Resize: `vertical` (default), `none`, `auto` (grows to `maxRows`, default 6, via CSS `field-sizing: content`). Disabled/read-only never resize.
- Counter: "n / max" in hint row; black at ≥90 %, error + icon and invalid past the limit. No native maxlength, so paste is never truncated. Polite debounced live region.
- Hover (black border) and black focus border go beyond current `Input` code; spec says add to `Input` only via its own task.
- Read-only: same gray fill/border as disabled, black text, still in tab order.
- No Radix textarea primitive: plain `<textarea>` + existing `Field` (Radix `Label`) via `useFieldControl()`; `TextareaField` mirrors `TextField`.
- 2 px invalid border and 6 px icon gap use Tailwind `border-2` / `gap-1.5` like `Input`; no token requests.
- Designer also registered the canvas in `docs/design-system-wireframe/canvas.json`.
