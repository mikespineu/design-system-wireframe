---
task: DS-5
title: "Toggle — design"
line: design           # design | build
status: merged        # claimed | in-progress | waiting | blocked | merged
stage: merge
branch: "feat/DS-5-toggle-design"
worktree: "/Users/michalkrecisz/Desktop/workspace/design-system-test/.worktrees/feat-DS-5-toggle-design"
pr: "49"
pr_url: "https://github.com/mikespineu/design-system-wireframe/pull/49"
canvas_url: "https://claude.ai/artifact/UuJ22jU7nJ5m6JBXJbm3uq"
storybook_url: "http://localhost:6178"
model: default
loops: { gates: 0, qa: 0, review: 0, ci: 0, spec: 0 }
needs_you: ""
blocked_reason: ""
started: "2026-10-26T11:10:55Z"
updated: "2026-10-26T12:09:00Z"
---

# DS-5 Toggle — design

## Timeline

- 12:10 claim: claimed feat/DS-5-toggle-design
- 12:10 design: designer started (user feedback: on/off switch + segmented/tile choice groups, X-scroll on overflow, consider splitting)
- 12:17 design: designer finished (Switch + SegmentedControl + TileGroup; RadioGroup for groups; no token requests)
- 12:17 publish: canvas at https://claude.ai/artifact/UuJ22jU7nJ5m6JBXJbm3uq
- 12:17 spec: check passed (header, sections, tokens, canvas)
- 12:17 pr: waiting for you — approve design or request changes
- 12:18 pr: draft PR #49 opened
- 12:21 design: revised per canvas comment (segmented track hugs its items, no stretch to container width); canvas republished
- 12:22 design: revised per canvas comment (tile examples use Icon set icons, varied label lengths); canvas republished
- 12:23 design: revised per canvas comment (SegmentedControl selection slides between segments, --ds-motion); canvas republished
- 12:24 design: example labels replaced with neutral app-settings copy (no 1:1 labels from reference screenshots); spec check passed; canvas republished
- 13:07 approve: approved by mikespin
- 13:09 ci: checks green (ci, claude-review, deploy)
- 13:09 merge: squash-merged PR #49

## Gate results

| Gate | Result |
| --- | --- |
| lint | – |
| typecheck | – |
| test | – |
| storybook | – |

## Notes

- User asked: Toggle must cover on/off (true/false) and the choice cases from their screenshots (icon tile picker "Styl", pill segmented control "Głębokość/Nóżki/Panele tylne/Wykończenie"); overflow scrolls on X; consider splitting into several components.
- Design split into Switch (Radix Switch), SegmentedControl and TileGroup (Radix RadioGroup, shared internal ChoiceGroup; overflow scrolls on X with snap + edge fade). Stepper/slider from screenshot 3 = existing Slider (DS-23), out of scope.
- No accent color: screenshots' orange mapped to black/white per system; optional `--ds-color-accent` proposed but not recommended.
- Example copy is neutral (density, view, theme, notifications) on purpose; reference screenshot labels are not reused.
- Open: DS-6 only covers Switch — roadmap needs SegmentedControl + TileGroup implementation tasks (or DS-6 widened). Naming (Switch vs Toggle, TileGroup). Help slot needs Tooltip/Popover (none yet).
