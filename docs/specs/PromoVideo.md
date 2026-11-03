# PromoVideo

- task: DS-74
- canvas: docs/design-system-wireframe/PromoVideo.dc.html
- canvas_url: https://claude.ai/artifact/1oXGMnDPoUM6Yhf9SKe2fB
- approved: no
- approved_by:
- approved_at:
- approval_hash:

A 78 s promo video, 1920 × 1080, 30 fps, 2340 frames, built with Remotion in `video/` (workspace from DS-73, compositions in DS-75, render and publish in DS-76). Its one message: **don't spend tokens building your own design system.** It shows what is already built, how to install it, how to make it your own, and how it works with Claude.

This is a video, not a component. Nothing is added to `src/components/` or `src/index.ts`. Every scene renders real components and theme CSS from the installed package (the DS-73 `npm pack` install), so the video can't show a look the library doesn't have. Every feature is presented as shipped: no "coming soon", "planned", "roadmap" or version-in-progress wording appears on screen. The final render waits until every task it shows is done (DS-76).

The canvas has one keyframe per scene in every theme the scene uses. Each keyframe header gives its absolute frame number; DS-75's still at that frame must match it.

## Scenes

Frame numbers are absolute (0-based) unless marked `s` (frame within the scene). Seconds = frame / 30.

| # | Scene id | Start | Frames | Seconds | Theme(s) | Keyframes |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | `hook` | 0 | 210 | 0.0 – 7.0 | default | KF01 f 180 |
| 02a | `radix` | 210 | 180 | 7.0 – 13.0 | default | KF02a f 270, KF02b f 345 |
| 02b | `themes` | 390 | 300 | 13.0 – 23.0 | default, dark, bold, bold-dark | KF03 f 440, 510, 585, 660 |
| 02c | `icons` | 690 | 150 | 23.0 – 28.0 | default | KF04 f 810 |
| 02d | `type` | 840 | 150 | 28.0 – 33.0 | default, bold (pane) | KF05 f 960 |
| 02e | `tested` | 990 | 180 | 33.0 – 39.0 | dark | KF06 f 1140 |
| 03 | `skip` | 1170 | 210 | 39.0 – 46.0 | default | KF07 f 1340 |
| 04 | `install` | 1380 | 180 | 46.0 – 52.0 | default | KF08 f 1530 |
| 05 | `customize` | 1560 | 300 | 52.0 – 62.0 | default, `my-brand` (panel) | KF09a f 1660, KF09b f 1820 |
| 06 | `claude` | 1860 | 300 | 62.0 – 72.0 | dark | KF10a f 1980, KF10b f 2130 |
| 07 | `end` | 2160 | 180 | 72.0 – 78.0 | default | KF11 f 2310 |

Total 2340 frames (78.0 s), inside the 60–90 s brief.

### Motion rules (all scenes)

Every movement is computed from `useCurrentFrame()` with Remotion `interpolate` (always `extrapolateLeft/Right: 'clamp'`). The easing is the system curve from `--ds-motion`, `cubic-bezier(0.2, 0, 0, 1)`, passed as `Easing.bezier(0.2, 0, 0, 1)`. No CSS `animation` or `transition`, no `setTimeout`, `setInterval` or `requestAnimationFrame`. The DS-73 `MotionOff` stays mounted in every scene, so `--ds-motion` is `0ms` and the library's own transitions are off. No `loading` buttons (the spinner is a CSS animation). Nothing zooms, spins, shakes or parallaxes.

| Move | Frames | Driven value |
| --- | --- | --- |
| Enter | 15 | opacity 0 → 1 and translateY 8 → 0 logical px (16 output px), from the start frame given per line |
| Wipe | 12 | the incoming layer's `clip-path: inset(0 X% 0 0)`, X 100 → 0 (reveals left to right). Every scene starts with one (except 01); 02b uses it for theme changes, 05 for the preview panel. The outgoing scene shows its last frame underneath. |
| Type | ceil(length / 1.5) | visible characters = `floor((frame − start) × 1.5)`, clamped to the string length. A steady block caret follows the last character; it never blinks. |
| Count | 20 or 30 | `Math.round(interpolate(frame, [a, b], [0, N]))` with `font-variant-numeric: tabular-nums`, so digits don't jitter |
| Key / focus | step | focus ring, highlight and value change on the event frame, like the real UI. The pressed key cap is filled for 6 frames. |
| Underline | 15 | width 0 → 100 % of a bar under one word (01 only) |

The wipe needs the outgoing scene underneath for 12 frames. DS-75 may build this with `@remotion/transitions` (`wipe()`, `linearTiming({ durationInFrames: 12 })`) as long as the start frames and the 2340 total stay as in the table; otherwise a wrapper that renders the previous scene's last frame under the incoming clip.

### 01 Hook · f 0 – 209 · default

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Line 1 | You could ask an agent to build your design system. | `h2` style, `--ds-color-text-muted` | Enter s0 |
| Line 2 | Don't spend tokens building your own design system. | `display` style, `--ds-color-text-emphasis` | Enter s60 |
| Underline under "tokens" | (none) | bar, height `--ds-space-1`, `--ds-color-border-strong` | Underline s90 – s104 |

Components: none. Commands: none.

### 02a Key features: keyboard and focus · f 210 – 389 · default

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Keyboard and focus come from Radix. | `h1` style | Enter s12 |
| Sub | Every interactive part is a Radix primitive. | `body-lg` | Enter s18 |
| Key legend | Tab: Move focus · ↓: Open and move · Enter: Choose | key caps (see Tokens) + `body` | Enter s24 |
| Field | label "Priority"; value "Medium"; options Low, Medium, High, Urgent | `SelectField` | arrives with the wipe |

Events (all step changes):

| Frame | Key | What changes |
| --- | --- | --- |
| f 255 (s45) | Tab | focus ring on the Select trigger; trigger border `--ds-color-border-strong`; Tab key cap filled s45 – s50; Tab row in `--ds-color-text-emphasis` |
| f 285 (s75) | ↓ | list opens below the trigger; Medium (current value) highlighted |
| f 315 (s105) | ↓ | highlight moves to High |
| f 360 (s150) | Enter | High selected, list closes, focus ring back on the trigger, value reads "High" |

KF02a (f 270): focus ring on the closed trigger. KF02b (f 345): list open, High highlighted, Medium checked.

### 02b Key features: one screen, four themes · f 390 – 689

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | One screen. Four themes. | `h2` style | Enter s12 |
| Sub | Only data-theme changes. The markup stays the same. | `body` | Enter s18 |
| Theme switcher | label "Theme"; segments default, dark, bold, bold-dark | `SegmentedControl` (value follows the stage theme) | arrives with the wipe |
| Theme tag | `data-theme="default"` / `"dark"` / `"bold"` / `"bold-dark"` | `Tag` (neutral, small, mono) | arrives with the wipe |
| Screen | "Launch plan"; tags New, Q4; field "Owner" (placeholder "Name or email"); switch "Notify the team" (on); alert "Saved" / "Your changes are live."; buttons Publish, Save draft | `Tag`, `TextField`, `Switch`, `Alert` (success), `Button` (primary, secondary) | arrives with the wipe |

The whole stage carries the theme (`data-theme` on the stage root, plus on `<html>` for anything portalled). Theme changes are wipes of a full re-render in the next theme:

| Theme | Wipe in | Fully on screen | Keyframe |
| --- | --- | --- | --- |
| default | scene wipe f 390 – 401 | f 402 – 464 | f 440 |
| dark | f 465 – 476 | f 477 – 539 | f 510 |
| bold | f 540 – 551 | f 552 – 614 | f 585 |
| bold-dark | f 615 – 626 | f 627 – 689 | f 660 |

### 02c Key features: bring your own icons · f 690 – 839 · default

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Bring your own icons. | `h2` style | Enter s12 |
| Sub | Lucide, Tabler, Phosphor, Heroicons, or any SVG with createIcon. | `body-lg` | Enter s18 |
| Code line | `<IconProvider icons={{ close: X, check: Check, info: Info }}>` | terminal panel (small) | Enter s24 |
| Left pane | eyebrow "Default glyphs"; Alert info "Heads up" / "Icons follow currentColor."; Checkbox "Notify" (checked); IconButton (close, label "Close"); Tag "Q4" (removable) | `Alert`, `Checkbox`, `IconButton`, `Tag` with the private default glyphs | Enter s30 |
| Right pane | eyebrow "With IconProvider · Lucide"; same four parts | same components inside `IconProvider` with `lucide-react` `X`, `Check`, `Info` | Enter s30 |

DS-75 adds `lucide-react` to `video/package.json` (it is a root devDependency only today, per DS-49).

### 02d Key features: typography · f 840 – 989 · default + bold pane

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Type that follows the theme. | `h2` style | Enter s12 |
| Sub | heading-* and body-* utilities read the font and size roles. | `body-lg` | Enter s18 |
| Two panes | tag `default` / `bold`; class name above each line: `heading-lg` "Launch plan", `heading-md` "Owner and dates", `body-lg` "One attribute restyles every line." | Tailwind utilities `heading-lg`, `heading-md`, `body-lg` from `src/styles/tailwind.css`; right pane `data-theme="bold"` inside a `data-theme="default"` reset | Enter s30 |

DS-75 checks that these utilities are present in the packaged `styles.css`; if the library build does not emit them, the scene applies the same roles inline from the package's role names (no hard-coded values).

### 02e Key features: Storybook, jest-axe, CI · f 990 – 1169 · dark

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Tested like a product. | `h1` style | Enter s12 |
| Row 1 | Storybook: a story for every component | check glyph + `body-lg` | Enter s24 |
| Row 2 | jest-axe in every component test | same | Enter s36 |
| Row 3 | CI on every pull request: lint, typecheck, tests, build | same | Enter s48 |
| Stat | 80 % | `display` style | Enter s60, Count 0 → 80 s60 – s79 |
| Stat label | coverage floor, enforced in CI | `body-lg` | Enter s60 |
| CI steps | Lint · Typecheck · Test with coverage · Build library | `Tag` (outline), names read from `.github/workflows/ci.yml` job `ci` | Enter s72 |

### 03 Skip building your own · f 1170 – 1379 · default

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Skip building your own. | `h1` style | Enter s12 |
| Fact 1 | 25 · component families | `display` number + `label` | labels Enter s30; number Count s30 – s59 |
| Fact 2 | 87 · themeable roles | same | same |
| Fact 3 | 4 · themes | same | same |
| Fact 4 | 61 · tasks already done | same | same |
| Closing | So your tokens go to your product, not your buttons. | `h3` style, `--ds-color-text` | Enter s75 |

The numbers on the canvas are today's counts on main; the video reads them at bundle time (see Numbers and sources).

### 04 Install in one line · f 1380 – 1559 · default

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Install in one line. | `h1` style | Enter s12 |
| Terminal | `$ npm install @mikespineu/design-system` | terminal panel (`body-lg`, mono) | panel Enter s24; Type s30 – s54 |
| Starter card | Or start from the React starter. · `examples/vite-react` · Form, dialog and toast, themed from ds.theme.json. | card (`h3` style, mono name, `body`) | Enter s70 |

The package name comes from the library's `package.json` `name`; the typing duration follows its length.

### 05 Customize in one file · f 1560 – 1859 · default + `my-brand` panel

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Customize it in one file. | `h2` style | Enter s12 |
| Theme file | the fixture `video/fixtures/ds.theme.json`, printed verbatim (see below) | code panel | Enter s24 |
| Caption | Write it by hand, or with the theme skill: /wireframe-ds:theme | `body-sm`, skill name in mono | Enter s36 |
| Terminal | `$ npx @mikespineu/design-system theme build` | terminal panel (small) | panel Enter s24; Type s120 – s148 |
| Preview | caption "Preview" + tag `default`, then `data-theme="my-brand"`; "Launch plan", tag New, field "Owner", buttons Publish, Save draft | `Tag`, `TextField`, `Button` | panel Enter s24; Wipe into `my-brand` s160 – s171 |
| Result | Contrast checked · checkContrast(): 0 failures, 106 pairs | `Alert` (success) | Enter s180 |

The fixture holds the `bold` input from `src/themes/bold.ts` (`boldConfig`) under a new name, so the result is close to a theme viewers saw in 02b:

```json
{
  "name": "my-brand",
  "brand": "#4318D1",
  "neutral": "#140E3D",
  "fonts": {
    "heading": "Bricolage Grotesque",
    "body": "Figtree"
  },
  "radius": { "md": "14px" },
  "mode": "both"
}
```

DS-75 runs the real `theme build` on this file at bundle time, loads the `theme.css` it writes, and sets `data-theme="my-brand"` on the panel. If DS-60's schema differs (field names, required keys), the fixture follows the schema and the code panel prints the fixture as it is; the canvas is then updated.

**Canvas stand-in.** The canvas can only draw themes whose CSS is in its token block, so KF09b paints the built panel with the shipped `bold` theme. The video paints the CLI's `theme.css`, which is `createTheme()` output without bold's override block: background, a few text roles and the type scale differ slightly. For KF09b, DS-75's still matches the canvas in layout, copy, fonts, radius and component states, not in exact role values.

### 06 Works with Claude · f 1860 – 2159 · dark

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Works with Claude. | `h1` style | Enter s12 |
| Sub | A Claude Code plugin that reads the manifest of every component. | `body-lg` | Enter s18 |
| Terminal | `> /plugin marketplace add mikespineu/design-system-wireframe` · `> /plugin install wireframe-ds@wireframe-ds` | terminal panel (small); `>` marks Claude Code input | panel Enter s24; Type line 1 s36 – s73, line 2 s84 – s111 |
| Card: Skills | `component-usage` · Picks components and imports. · `theme` · Saves your ds.theme.json. | card, mono names, `body-xs` | Enter s135 |
| Card: Agent | `ui-review` · Flags hardcoded colors, hand-rolled primitives, missing labels. | card | Enter s150 |
| Card: MCP server | `wireframe-ds` · tools `list_components`, `search`, `get_component`, `get_theme`, `list_tokens`, `save_theme` | card + `Tag` (subtle, small, mono) per tool | Enter s165 |

The video does not say the plugin is listed in Anthropic's plugin directory. It shows only the plugin's own marketplace, which DS-52 ships. A directory line can be added in a later revision once DS-57's listing is live.

### 07 End card · f 2160 – 2339 · default

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Wordmark | Design System Wireframe | `display` style | Enter s12 |
| Message | Don't spend tokens building your own design system. | `h3` style, `--ds-color-text` | Enter s24 |
| Links | Install: `npm install @mikespineu/design-system` · Code: `github.com/mikespineu/design-system-wireframe` · Docs: `ds.mikespin.dev` | label + mono `body-lg` | Enter s36 |
| Tags | MIT · React · Radix UI | `Tag` (outline) | Enter s36 |

s150 – s179 (f 2310 – 2339) hold still. KF11 (f 2310) is the poster frame DS-76 exports.

## Numbers and sources

Every number on screen is computed at bundle time from the source below (DS-75 writes them to a generated facts module and a test fails if any shown value differs from its source). The copy makes no token, time or cost claim: "one line" and "one file" are counts of a command and a file, and there is no "minutes", "hours", "x faster" or price anywhere.

| Shown | Value today (main) | Source and rule |
| --- | --- | --- |
| component families | 25 | `src/index.ts`: lines matching `export * from './components/<Name>'` |
| themeable roles | 87 | `themeRoles.length`, exported from the package (`src/styles/roles.ts`; `src/styles/roles.test.ts` asserts 87) |
| themes | 4 | distinct `[data-theme="…"]` names in the package CSS: `default` and `dark` in `src/styles/tokens.css`, `bold` and `bold-dark` in `src/themes/bold.css` (same list as `.storybook/themes.ts`) |
| tasks already done | 61 | `roadmap.md`: task lines with `status: done`. Counted at bundle time, so the final render (DS-76, every task done) shows the count on that commit |
| coverage floor | 80 % | `jest.config.cjs`: lowest value in `coverageThreshold.global` (branches, functions, lines, statements are all 80); enforced by `npm test -- --coverage --ci` in `.github/workflows/ci.yml` |
| 0 failures, 106 pairs | 0 / 106 | `checkContrast(theme)` on the fixture's built theme: `failures.length` and `checked` (53 required pairs × 2 blocks for `mode: "both"`) |
| CI step names | 4 tags | `.github/workflows/ci.yml`, job `ci`: step `name`s Lint, Typecheck, Test with coverage, Build library |
| package name | `@mikespineu/design-system` | the library's `package.json` `name` (set by DS-59; `design-system-test` today) |
| repo and docs links | `github.com/mikespineu/design-system-wireframe`, `ds.mikespin.dev` | `package.json` `repository.url`; the Storybook badge link in `README.md` |
| plugin, skill, agent, tool names | see 06 | `plugins/wireframe-ds/.claude-plugin/plugin.json` `name`, `skills/*/SKILL.md`, `agents/*.md`, the MCP server's registered tools |

## Features shown

Each feature on screen, the task that ships it, the file that proves it, and whether it's on main today. DS-75 depends on all of them; DS-76 renders only once every one is done.

| Feature on screen | Scene | Ships in | Proof file | On main today |
| --- | --- | --- | --- | --- |
| Radix Select keyboard and focus | 02a | DS-17, DS-18 | `src/components/Select/Select.tsx` (Radix `Select`), `Select.test.tsx` | yes |
| One screen in four themes | 02b | DS-1, DS-12, DS-27 | `src/styles/tokens.css`, `src/themes/bold.css`, package export `./themes/bold.css` | yes |
| Bring your own icons | 02c | DS-46 – DS-49 | `src/components/Icon/IconProvider.tsx`, `createIcon.tsx`, `BringYourOwnIcons.stories.tsx` | yes |
| Typography utilities | 02d | DS-37, DS-38 | `src/styles/tailwind.css` (`@utility heading-*`, `body-*`) | yes |
| Story per component, jest-axe, CI, coverage floor | 02e | DS-8, CLAUDE.md conventions | `.github/workflows/ci.yml`, `jest.config.cjs`, `src/components/*/*.stories.tsx`, `*.test.tsx` | yes |
| `checkContrast()` | 05 | DS-28 | `src/theme/checkContrast.ts` | yes |
| Generated manifest ("reads the manifest of every component") | 06 | DS-51 | `dist/manifest.json`, package export `./manifest.json` | no |
| Plugin and its marketplace, install commands | 06 | DS-52, DS-56 | `plugins/wireframe-ds/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, "Use with Claude Code" in `docs/consumer-guide.md` | no |
| `component-usage` skill | 06 | DS-53 | `plugins/wireframe-ds/skills/component-usage/SKILL.md` | no |
| `ui-review` agent | 06 | DS-54 | `plugins/wireframe-ds/agents/ui-review.md` | no |
| MCP tools (6) | 06 | DS-55 | `plugins/wireframe-ds/.mcp.json`, `plugins/wireframe-ds/mcp/server.mjs` (tool registrations) | no |
| Anthropic directory submission | not claimed on screen | DS-57 | submission reference in `factory/jobs/DS-57.md` | no |
| Scoped npm package, one-line install | 04, 07 | DS-59 | `package.json` `name` = `@mikespineu/design-system`; `npm view @mikespineu/design-system` | no |
| `ds.theme.json` and `theme build` CLI | 05 | DS-60 | the package's JSON schema file and `package.json` `bin` entry for the CLI | no |
| Theme skill `/wireframe-ds:theme` | 05, 06 | DS-10 | `plugins/wireframe-ds/skills/theme/SKILL.md` | no |
| React starter `examples/vite-react` | 04 | DS-61 | `examples/vite-react/package.json`, its CI job | no |

## Sizes

| Property | Value |
| --- | --- |
| Output | 1920 × 1080, 30 fps, H.264 MP4, 2340 frames (78.0 s) |
| Logical stage | 960 × 540 CSS px rendered at 2×. Every `--ds-*` size keeps its shipped value; on screen it is doubled (`display` 72 → 144 px, `h1` 48 → 96, `body-lg` 18 → 36, label 12 → 24). |
| How 2× is made | Preferred: composition 960 × 540 rendered with Remotion `scale: 2` (device scale factor), so portalled Radix content (the Select list in 02a) and focus outlines scale with everything. Alternative: a 1920 × 1080 composition with a `scale(2)` wrapper as in the DS-73 placeholder, which then must keep the Select list inside the wrapper. DS-75 picks one; either way the file is 1920 × 1080. |
| Action-safe (5 %) | 48 × 27 logical inset (96 × 54 output). No UI outside it. |
| Title-safe (10 %) | 96 × 54 logical inset. All copy sits in a box inset `--ds-space-24` (96) left and right and `--ds-space-16` (64) top and bottom, i.e. 768 × 412 logical, inside title-safe. |
| Columns | single column, or two columns with `--ds-space-8` gap (left 344 – 420 logical, right takes the rest) |
| Smallest text | `--ds-text-label-size` / `--ds-text-ui-sm-size` (12 logical = 24 output px), used only for labels, tags and the code panel. Lines to read are at least `--ds-text-body-size` (16 logical = 32 output px). |
| Keyframes on the canvas | drawn at 0.625 (600 × 338) per artboard, 1.25 for the format board |

## States

The video's "states" are its scenes and themes. Each row is a canvas artboard and a still DS-75 renders at that frame.

| Keyframe | Frame | Scene | Theme | What's on screen |
| --- | --- | --- | --- | --- |
| KF01 | 180 | 01 hook | default | both lines settled, underline full |
| KF02a | 270 | 02a radix | default | focus ring on the Select trigger; Tab row emphasized |
| KF02b | 345 | 02a radix | default | list open, High highlighted (fill + inset ring), Medium checked; ↓ row emphasized |
| KF03 | 440 | 02b themes | default | screen in default; segment "default" on |
| KF03 | 510 | 02b themes | dark | same screen in dark |
| KF03 | 585 | 02b themes | bold | same screen in bold (uppercase headings, radius, offset shadow, 48 px controls) |
| KF03 | 660 | 02b themes | bold-dark | same screen in bold-dark |
| KF04 | 810 | 02c icons | default | default glyphs vs Lucide inside `IconProvider` |
| KF05 | 960 | 02d type | default + bold pane | same utilities, two themes |
| KF06 | 1140 | 02e tested | dark | three rows, 80 %, four CI tags |
| KF07 | 1340 | 03 skip | default | four facts settled, closing line |
| KF08 | 1530 | 04 install | default | command typed, caret, starter card |
| KF09a | 1660 | 05 customize | default | theme file, empty prompt, preview in default |
| KF09b | 1820 | 05 customize | default + `my-brand` (canvas: bold stand-in) | command typed, preview in the built theme, contrast Alert |
| KF10a | 1980 | 06 claude | dark | both install commands typed, cards not yet in |
| KF10b | 2130 | 06 claude | dark | three cards |
| KF11 | 2310 | 07 end | default | end card, held to the last frame |

Component states shown: Select trigger rest, focus-visible and open; listbox item highlighted and selected; SegmentedControl item checked; Switch on; Checkbox checked; Button primary and secondary at rest; IconButton secondary at rest; Tag solid, subtle, outline, neutral and removable; Alert info and success; TextField empty with placeholder. No hover (there is no pointer in the video), no disabled, no error states.

## Keyboard

n/a for the video itself: it is a rendered file with no interactive content. Playback controls belong to the host (GitHub release page or README attachment), which DS-76 picks.

What the video shows (02a), and it must match the shipped Select behaviour exactly:

| Key | Shown at | Effect on screen |
| --- | --- | --- |
| Tab | f 255 | focus moves to the Select trigger; focus-visible ring appears |
| ArrowDown | f 285 | list opens, current value (Medium) highlighted |
| ArrowDown | f 315 | highlight moves to the next item (High) |
| Enter | f 360 | highlighted item selected, list closes, focus returns to the trigger |

Focus order shown: (start of page) → Select trigger → list items (while open) → Select trigger. DS-75 produces these states through the component, not by restyling it: it renders `SelectField` with controlled `open` and `value` and moves real focus with `.focus()` on the trigger and the highlighted item at the event frame (Radix sets `[data-highlighted]` on the focused item, and Chrome shows `:focus-visible` for programmatic focus without a prior pointer event). If headless rendering can't hold focus across frames, DS-75 raises it rather than drawing a fake ring.

## Radix

n/a for the video itself (nothing is interactive). Primitives on screen, all through the shipped wrappers, never raw Radix parts:

| Scene | Component | Radix primitive |
| --- | --- | --- |
| 02a | `SelectField` | `Select` (portalled content: set `data-theme` on `<html>` for the scene so the list gets the stage theme) |
| 02b | `SegmentedControl` | `RadioGroup` |
| 02b | `Switch` | `Switch` |
| 02c | `Checkbox` | `Checkbox` |
| 02b, 02c, 04, 05, 06, 07 | `Button`, `IconButton`, `Tag`, `Alert`, `TextField` | none (native elements; `Slot` where the component uses `asChild`) |

## Tokens

Every value below is an existing `--ds-*` role, read through the theme on the stage. Nothing in `video/` hard-codes a color, size or space (DS-75 test).

| Property | Token |
| --- | --- |
| Stage background | `--ds-color-background` |
| Body copy, sub lines | `--ds-color-text`; font `--ds-font-body`; size `--ds-text-body-lg-size` / `--ds-text-body-lg-line-height` (subs), `--ds-text-body-size` / `--ds-text-body-line-height` |
| Headings and wordmark | `--ds-color-text-emphasis`; `--ds-font-heading`; `--ds-text-heading-weight`; `--ds-text-heading-transform`; `--ds-text-display-size`, `--ds-text-display-line-height`, `--ds-text-display-tracking`; `--ds-text-h1-size`, `--ds-text-h1-line-height`, `--ds-text-h1-tracking`; `--ds-text-h2-size`, `--ds-text-h2-line-height`, `--ds-text-h2-tracking`; `--ds-text-h3-size`, `--ds-text-h3-line-height`, `--ds-text-h3-tracking` |
| Hook line 1, key legend rest, eyebrows, fact labels | `--ds-color-text-muted` |
| Labels, eyebrows, fact labels, link labels | `--ds-font-label`, `--ds-text-label-size`, `--ds-text-label-line-height`, `--ds-text-label-weight`, `--ds-text-label-tracking`, `--ds-text-label-transform` |
| Underline bar (01) | `--ds-color-border-strong`, height `--ds-space-1` |
| Terminal and code panels | background `--ds-color-inverse`; ink `--ds-color-text-inverse`; font `--ds-font-mono`; size `--ds-text-body-lg-size` (04), `--ds-text-ui-size` (small terminal), `--ds-text-ui-sm-size` / `--ds-text-ui-sm-line-height` (code); padding `--ds-space-4` / `--ds-space-3`; radius `--ds-radius-md` |
| Caret | `--ds-color-text-inverse` |
| Key caps | border `--ds-border-width-strong` solid `--ds-color-border-strong`; background `--ds-color-surface`; text `--ds-color-text-emphasis`, `--ds-font-label`, `--ds-text-ui-size`, `--ds-text-ui-weight`; radius `--ds-radius-sm`; height `--ds-space-8`, min width `--ds-space-12`. Pressed: background and border `--ds-color-primary`, text `--ds-color-primary-contrast` |
| Focus ring | `--ds-focus-width` solid `--ds-color-focus`, offset `--ds-focus-offset` (from the component) |
| Facts and stat numbers | `--ds-text-display-size`, `--ds-text-display-line-height`, `--ds-text-display-tracking`, `--ds-font-heading`, `--ds-color-text-emphasis`; top rule `--ds-border-width` solid `--ds-color-border-strong` |
| Checklist glyphs (02e) | `--ds-color-icon`, `--ds-icon-size-lg`, stroke `--ds-icon-stroke-strong` |
| Cards and panes | border `--ds-border-width` solid `--ds-color-divider`; background `--ds-color-surface` (cards) / `--ds-color-background` (panes); radius `--ds-radius-lg`; shadow `--ds-shadow-sm`; padding `--ds-space-4` / `--ds-space-6` |
| Demo screen frame | border `--ds-border-width` solid `--ds-color-border-strong`; radius `--ds-radius-lg`; shadow `--ds-shadow-lg`; padding `--ds-space-6` (02b), `--ds-space-4` (05) |
| Layout gaps | `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-space-6`, `--ds-space-8`, `--ds-space-12` |
| Safe box | inset `--ds-space-24` × `--ds-space-16` |
| Components (Select, SegmentedControl, Switch, Checkbox, Button, IconButton, Tag, Alert, TextField) | their own shipped styles; the video sets no component style |
| Motion | `--ds-motion` stays `0ms` inside compositions (DS-73 `MotionOff`); its curve `cubic-bezier(0.2, 0, 0, 1)` is reused as the Remotion easing |

## Accessibility

**Text contrast, at least 4.5:1 in every theme.** Copy uses only pairs that `checkContrast()` requires at 4.5:1: `--ds-color-text-emphasis`, `--ds-color-text-strong`, `--ds-color-text`, `--ds-color-text-muted` and `--ds-color-placeholder` on `--ds-color-background`, `--ds-color-surface` or `--ds-color-fill`; status text on its own background (`--ds-color-success` on `--ds-color-success-bg`, `--ds-color-info` and `--ds-color-text` on `--ds-color-info-bg`); `--ds-color-primary-contrast` on `--ds-color-primary`; `--ds-color-text-inverse` on `--ds-color-inverse`. No copy sits on `--ds-color-surface-subtle`, which is not a checked ground. Per theme:

| Theme | Where | Proof |
| --- | --- | --- |
| default | 01, 02a, 02b, 02c, 02d, 03, 04, 05, 07 | README color table: text 10.4:1, muted 7:1, placeholder 4.5:1 on white; DS-75 also runs `checkContrast()` on the resolved default block |
| dark | 02b, 02e, 06 | `src/themes/bold.test.tsx`: "the shipped dark block in tokens.css … passes checkContrast()" |
| bold, bold-dark | 02b, 02d (pane), 05 (canvas stand-in) | `src/themes/bold.test.tsx`: both pass `checkContrast()` with no failures |
| `my-brand` | 05 panel | `checkContrast()` on the built fixture, shown on screen; DS-75 test requires 0 failures |

Focus ring, key caps, icons and the Select border use the 3:1 UI pairs (`--ds-color-focus`, `--ds-color-icon`, `--ds-color-border-strong` on background and surface). Status color appears only in the two success Alerts and the info Alert, each with an icon and a title, never color alone.

**Minimum time on screen per line of copy.** A line must stay fully visible (after its Enter, before the scene ends) for at least `max(60, 15 + 10 × words)` frames, i.e. 2 s minimum and about 180 words per minute beyond that. Words are whitespace-separated tokens; a command or code line counts its tokens. Every line in the scene tables meets this; the tightest are the 02c sub (9 words, needs 105, has 117), the 02d sub (10 words, needs 115, has 117), each 02b theme tag (needs 60, has 63) and the 04 card body (7 words, needs 85, has 95). DS-75 tests the rule from the same scene data the compositions use, so a copy change that breaks it fails CI.

**Flashes (WCAG 2.3.1).** No more than 3 flashes in any one second; the design stays far below that. Large light/dark changes happen only at the wipes, at f 465, 540, 615, 690, 990, 1170, 1860 and 2160. The closest two are 75 frames (2.5 s) apart, so no one-second window has more than one reversal. Each change is a 12-frame wipe, not a cut. Nothing blinks: the caret is steady, key caps fill once for 6 frames over a small area, counters change digits only. No saturated red is used at all. DS-75 tests that theme or scene changes are at least 30 frames apart.

**Captions and transcript.** The video has no speech and no audio, so there is nothing to caption in the WCAG 1.2.2 sense. It still ships two text alternatives, generated by DS-75 from the same scene data (so they can't drift from the picture) and published by DS-76 next to the video:

- `promo.en.vtt`, a WebVTT text track with one cue per line of on-screen copy, timed from the frames in this spec (frame / 30). It lets players show the text and makes it searchable.
- `promo-transcript.md`, a described transcript: every line of copy in order, plus one short sentence per scene describing what is shown (e.g. "The same screen switches from default to dark, bold and bold-dark."). This is the media alternative for the video-only content (WCAG 1.2.1).

The README link (DS-76) points to the video and the transcript, and the poster image (KF11) has alt text describing the video.

**No audio.** The render has no `<Audio>` element and no audio file, unless the user supplies a licensed track. If they do, the license (or its source and terms) goes into `video/README.md` with the file, the track carries no lyrics or speech, its level stays constant (no sudden loud cue), and the VTT gets a `[Music]` cue for its span. DS-75 tests that no audio is imported unless that license note exists.

**Motion comfort.** Only fades, small rises (16 output px) and wipes. No zoom, rotation, parallax or camera move.

**What DS-75 should verify** (the video has no DOM to run `jest-axe` on, so these replace it):

- every number shown equals its source (Numbers and sources);
- every feature shown exists: package name matches `package.json`, the `theme build` command exists in the CLI `bin`, every skill, agent and MCP tool named in 06 is registered in the plugin;
- no copy contains roadmap wording ("coming soon", "soon", "planned", "roadmap", "beta", "preview") or a time, token or cost figure;
- every line meets the minimum hold; theme or scene changes are at least 30 frames apart;
- each theme used passes `checkContrast()` (default, dark, bold, bold-dark, the fixture);
- no CSS animation, transition, timer or audio in `video/src`;
- the VTT and transcript are generated and contain every line of copy;
- optional: `jest-axe` on each scene component rendered in jsdom at its keyframe, to catch missing alt text or labels on the components themselves (decorative glyphs `aria-hidden`, IconButton labelled).

## Token requests

None.
