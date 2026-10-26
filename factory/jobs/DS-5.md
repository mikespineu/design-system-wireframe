---
task: DS-5
title: "Toggle — design"
line: design           # design | build
status: waiting        # claimed | in-progress | waiting | blocked | merged
stage: pr
branch: "feat/DS-5-toggle-design"
worktree: "/Users/michalkrecisz/Desktop/workspace/design-system-test/.worktrees/feat-DS-5-toggle-design"
pr: ""
pr_url: ""
canvas_url: "https://claude.ai/artifact/UuJ22jU7nJ5m6JBXJbm3uq"
storybook_url: ""
model: default
loops: { gates: 0, qa: 0, review: 0, ci: 0, spec: 0 }
needs_you: "approve the design (/factory:approve DS-5) or ask for changes (/factory:design DS-5 <feedback>)"
blocked_reason: ""
started: "2026-10-26T11:10:55Z"
updated: "2026-10-26T11:17:58Z"
---

# DS-5 Toggle — design

## Timeline

- 12:10 claim: claimed feat/DS-5-toggle-design
- 12:10 design: designer started (user feedback: on/off switch + segmented/tile choice groups, X-scroll on overflow, consider splitting)
- 12:17 design: designer finished (Switch + SegmentedControl + TileGroup; RadioGroup for groups; no token requests)
- 12:17 publish: canvas at https://claude.ai/artifact/UuJ22jU7nJ5m6JBXJbm3uq
- 12:17 spec: check passed (header, sections, tokens, canvas)
- 12:17 pr: waiting for you — approve design or request changes

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
- Open: DS-6 only covers Switch — roadmap needs SegmentedControl + TileGroup implementation tasks (or DS-6 widened). Naming (Switch vs Toggle, TileGroup). Help slot needs Tooltip/Popover (none yet).
