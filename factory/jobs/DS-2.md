---
task: DS-2
title: "Example themes — design"
line: design           # design | build
status: in-progress        # claimed | in-progress | waiting | blocked | merged
stage: ci
branch: "feat/DS-2-example-themes-design"
worktree: "/Users/michalkrecisz/Desktop/workspace/design-system-test/.worktrees/feat-DS-2-example-themes-design"
pr: "97"
pr_url: "https://github.com/mikespineu/design-system-wireframe/pull/97"
canvas_url: "https://claude.ai/artifact/1PkVgkht4TuQFLdxmoxxTj"
storybook_url: ""
model: default
session_id: "caacfd37-17b1-41a4-941b-cdeb49927561"     # Claude Code session that last ran this job (${CLAUDE_SESSION_ID})
loops: { gates: 0, qa: 0, review: 0, ci: 0, spec: 0 }
needs_you: ""
blocked_reason: ""
started: "2026-11-02T13:22:31Z"
updated: "2026-11-02T14:01:33Z"
---

# DS-2 Example themes — design

## Timeline

- 14:22 claim: claimed feat/DS-2-example-themes-design
- 14:22 session: caacfd37-17b1-41a4-941b-cdeb49927561
- 14:23 design: designer started
- 14:46 design: designer finished (30 tool uses); scope check clean
- 14:47 publish: canvas at https://claude.ai/artifact/1PkVgkht4TuQFLdxmoxxTj
- 14:48 spec: check passed (header fields, 7 sections, 87 tokens all in tokens.css, canvas complete HTML)
- 14:48 spec: verified all 186 contrast cells with contrastRatio() from src/theme/color.ts: all pass thresholds; fixed 2 rounding slips in bold (text-strong/background 14.02→14.01, text-strong/info-bg 12.82→12.81) in spec and canvas, republished canvas (v2)
- 14:48 pr: waiting for you (approve design or request changes)
- 14:48 pr: opened draft PR #97 with factory:needs-approval
- 15:01 approve: approved by mikespin

## Gate results

| Gate | Result |
| --- | --- |
| lint | – |
| typecheck | – |
| test | – |
| storybook | – |

## Notes

- Component name: `done_when` names the spec `docs/specs/Themes.md`, so the component name is `Themes` (not `ExampleThemes`); canvas `docs/design-system-wireframe/Themes.dc.html`.
- `needs_human: yes`: the user started this task explicitly; the PR needs their approval.
- Canvas references `./support.js` like the other canvases; published without it, same as DS-15/DS-17.
- Designer had no shell and computed contrast by hand; the orchestrator re-checked every cell with `contrastRatio()` and confirmed the dark column equals the DS-27 `[data-theme="dark"]` values.
- `createTheme()` limits (from the Designer): it emits the default type scale, weights and shape, caps neutral chroma at 0.03, sets surface = background, and takes dark primary from scale step 100. So bold needs an override block after the generated one, and `bold-dark` uses its own `mode: 'dark'` call (a `'both'` dark block carries colors only). For `dark` with brand #000000 the generator differs from DS-27 in 4 roles, so `dark` stays hand-written.
- Open questions: extend `ThemeConfig` (type, weights, shape, neutral chroma) in a follow-up; keep hand-tuned bold colors vs generator output; saturated status colors for bold (+12 raw values); bigger change to `dark` (raised surface); opt-in font CSS for bold vs consumer-loaded.
- Roadmap: DS-12 still names `soft` and `dark`; it should ship `bold`, `bold-dark` and the dark photo-filter change, with a 4-theme Storybook toolbar. Needs `/factory:edit DS-12`.
