# PromoVideo

- task: DS-74
- canvas: docs/design-system-wireframe/PromoVideo.dc.html
- canvas_url: https://claude.ai/artifact/1oXGMnDPoUM6Yhf9SKe2fB
- approved: yes
- approved_by: mikespin
- approved_at: 2026-11-04
- approval_hash:

A 78 s promo video, 1920 × 1080, 30 fps, 2340 frames, built with Remotion in `video/` (workspace from DS-73, compositions in DS-75, render and publish in DS-76). Its one message: **don't spend tokens building your own design system.** It shows what is already built, how to install it, how to make it your own, and how it works with Claude.

This is a video, not a component. Nothing is added to `src/components/` or `src/index.ts`. Every scene renders real components and theme CSS from the installed package (the DS-73 `npm pack` install), so the video can't show a look the library doesn't have. Every feature is presented as shipped: no "coming soon", "planned", "roadmap" or version-in-progress wording appears on screen. The final render waits until every task it shows is done (DS-76).

**Framing.** The key features are (1) many working components, (2) the design system works inside Claude, and (3) you can make your own theme that fits your brand and looks made for it. The shipped themes (`default`, `dark`, `bold`, `bold-dark`) are demos, and the system is largely color-agnostic, so the video never pitches a theme count or names the demo themes as a feature. Every branded look on screen is `my-brand`, the example brand built from one `ds.theme.json` (the scene 05 fixture): 02b introduces it, 02d uses it, and 05 shows how it was made. `default` appears as the neutral starting point and `dark` only as a stage color for 02e and 06.

The canvas has one keyframe per scene in every theme the scene uses. Each keyframe header gives its absolute frame number; DS-75's still at that frame must match it.

## Scenes

Frame numbers are absolute (0-based) unless marked `s` (frame within the scene). Seconds = frame / 30.

| # | Scene id | Start | Frames | Seconds | Theme(s) | Keyframes |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | `hook` | 0 | 210 | 0.0 – 7.0 | default | KF01 f 180 |
| 02a | `radix` | 210 | 180 | 7.0 – 13.0 | default | KF02a f 270, KF02b f 345 |
| 02b | `components` | 390 | 300 | 13.0 – 23.0 | default, `my-brand` | KF03a f 465, KF03b f 550, KF03c f 640 |
| 02c | `icons` | 690 | 150 | 23.0 – 28.0 | default | KF04 f 810 |
| 02d | `type` | 840 | 150 | 28.0 – 33.0 | default, `my-brand` (pane) | KF05 f 960 |
| 02e | `tested` | 990 | 180 | 33.0 – 39.0 | dark | KF06 f 1140 |
| 03 | `skip` | 1170 | 210 | 39.0 – 46.0 | default | KF07 f 1340 |
| 04 | `install` | 1380 | 180 | 46.0 – 52.0 | default | KF08 f 1530 |
| 05 | `customize` | 1560 | 300 | 52.0 – 62.0 | default, `my-brand` (panel) | KF09a f 1660, KF09b f 1820 |
| 06 | `claude` | 1860 | 300 | 62.0 – 72.0 | dark | KF10a f 1980, KF10b f 2130 |
| 07 | `end` | 2160 | 180 | 72.0 – 78.0 | default | KF11 f 2310 |

Total 2340 frames (78.0 s), inside the 60–90 s brief.

`my-brand` always means the light block of the theme that `theme build` writes from `video/fixtures/ds.theme.json` (see 05). DS-75 builds it once at bundle time and loads its `theme.css` for 02b, 02d and 05. The canvas can only draw themes whose CSS is in its token block, so it paints `my-brand` with the shipped `bold` theme as a stand-in (see 05, Canvas stand-in).

### Motion rules (all scenes)

Every movement is computed from `useCurrentFrame()` with Remotion `interpolate` (always `extrapolateLeft/Right: 'clamp'`). The easing is the system curve from `--ds-motion`, `cubic-bezier(0.2, 0, 0, 1)`, passed as `Easing.bezier(0.2, 0, 0, 1)`. No CSS `animation` or `transition`, no `setTimeout`, `setInterval` or `requestAnimationFrame`. The DS-73 `MotionOff` stays mounted in every scene, so `--ds-motion` is `0ms` and the library's own transitions are off. No `loading` buttons (the spinner is a CSS animation). Nothing zooms, spins, shakes or parallaxes.

| Move | Frames | Driven value |
| --- | --- | --- |
| Enter | 15 | opacity 0 → 1 and translateY 8 → 0 logical px (16 output px), from the start frame given per line |
| Wipe | 12 | the incoming layer's `clip-path: inset(0 X% 0 0)`, X 100 → 0 (reveals left to right). Every scene starts with one (except 01); 02b uses it to restyle the stage into `my-brand`, 05 for the preview panel. The outgoing scene shows its last frame underneath. |
| Type | ceil(length / 1.5) | visible characters = `floor((frame − start) × 1.5)`, clamped to the string length. A steady block caret follows the last character; it never blinks. |
| Count | 20 or 30 | `Math.round(interpolate(frame, [a, b], [from, to]))` with `font-variant-numeric: tabular-nums`, so digits don't jitter. Also drives the 02b Slider value. |
| Key / focus / value step | step | focus ring, highlight, checked or on state and value change on the event frame, like the real UI, through the component's controlled props. The pressed key cap (02a) is filled for 6 frames. |
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

### 02b Key features: working components, your brand, Claude · f 390 – 689 · default, then `my-brand`

The three key features in one short beat. It shows the first one (a wall of components that are used on screen) and the second one (the same wall restyled into a brand). It only names the third (Claude), because 05 and 06 show how theming and Claude work. 02a has just shown one component in depth; 02b steps back to the whole set.

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Components that already work. | `h2` style | Enter s12 |
| Statement 1 | 25 component families | check glyph + `body-lg`, `--ds-font-weight-medium`, `--ds-color-text-emphasis` | Enter s30 |
| Statement 2 | Your brand, not ours | same | Enter s170 (with the stage wipe) |
| Statement 3 | Ready for Claude | same | Enter s200 |
| Wall caption | From the package · tag `data-theme="default"`, after the wipe `data-theme="my-brand"` | label style + `Tag` (neutral, small, mono) | arrives with the scene wipe; the tag changes with the stage wipe |
| Wall | eight tiles, each with its family name above the live component: **Button · IconButton** (primary "Save", secondary IconButton close, label "Close"); **Select** (closed trigger "Medium"); **Input** (placeholder "Name or email"); **Slider** (value 30, attached numeric input); **Switch** ("Notify", off); **Checkbox** ("Email me", unchecked); **SegmentedControl** (Week, Month; Week on); **Tag** (New solid, Q4 subtle removable) | the shipped `Button`, `IconButton`, `Select`, `Input`, `Slider`, `Switch`, `Checkbox`, `SegmentedControl`, `Tag`, laid out with the package's `Grid` (4 columns, gap 3) and `Stack` per tile | arrives with the scene wipe |

The three statements sit in a three-column row; empty columns keep their place until each statement enters. "25" is read at bundle time (see Numbers and sources). The tile names are the family names from `src/index.ts`.

Events. Every change goes through the component's controlled props, so the components draw their own states:

| Frame | Part | What changes |
| --- | --- | --- |
| f 480 (s90) | Switch | off → on (thumb to the end, track `--ds-color-primary`) |
| f 495 (s105) | Checkbox | unchecked → checked (fill `--ds-color-primary`, check glyph) |
| f 510 (s120) | SegmentedControl | Week → Month |
| f 525 – 544 (s135 – s154) | Slider | value 30 → 70 (Count move, `Math.round`, step 1); thumb, range and numeric input follow the value |
| f 560 – 571 (s170 – s181) | whole stage | wipe from `default` into `my-brand` (`data-theme` on the stage root). Same markup and values; fonts, colors, radius, shadow and control height change. Light to light. |

| Keyframe | Frame | Theme | State |
| --- | --- | --- | --- |
| KF03a | f 465 (s75) | default | heading and statement 1 in; every tile at rest (Switch off, Checkbox unchecked, Week, 30) |
| KF03b | f 550 (s160) | default | after the four events (Switch on, Checkbox checked, Month, 70) |
| KF03c | f 640 (s250) | `my-brand` (canvas: `bold` stand-in) | all three statements in; wall after the events; caption tag `data-theme="my-brand"` |

No focus ring is shown in 02b (02a covers keyboard and focus). Nothing in the wall opens a portal.

### 02c Key features: bring your own icons · f 690 – 839 · default

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Bring your own icons. | `h2` style | Enter s12 |
| Sub | Lucide, Tabler, Phosphor, Heroicons, or any SVG with createIcon. | `body-lg` | Enter s18 |
| Code line | `<IconProvider icons={{ close: X, check: Check, info: Info }}>` | terminal panel (small) | Enter s24 |
| Left pane | eyebrow "Default glyphs"; Alert info "Heads up" / "Icons follow currentColor."; Checkbox "Notify" (checked); IconButton (close, label "Close"); Tag "Q4" (removable) | `Alert`, `Checkbox`, `IconButton`, `Tag` with the private default glyphs | Enter s30 |
| Right pane | eyebrow "With IconProvider · Lucide"; same four parts | same components inside `IconProvider` with `lucide-react` `X`, `Check`, `Info` | Enter s30 |

DS-75 adds `lucide-react` to `video/package.json` (it is a root devDependency only today, per DS-49).

### 02d Key features: type that follows your brand · f 840 – 989 · default + `my-brand` pane

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Type that follows your brand. | `h2` style | Enter s12 |
| Sub | heading-* and body-* utilities read the font and size roles. | `body-lg` | Enter s18 |
| Two panes | tag `default` / `my-brand`; class name above each line: `heading-lg` "Launch plan", `heading-md` "Owner and dates", `body-lg` "One attribute restyles every line." | Tailwind utilities `heading-lg`, `heading-md`, `body-lg` from `src/styles/tailwind.css`; right pane `data-theme="my-brand"` inside a `data-theme="default"` reset | Enter s30 |

DS-75 checks that these utilities are present in the packaged `styles.css`; if the library build does not emit them, the scene applies the same roles inline from the package's role names (no hard-coded values). The canvas draws the right pane with `bold`; the video's `my-brand` pane has the fixture's fonts (Bricolage Grotesque, Figtree), and its heading case and type steps follow `createTheme()` output.

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
| Fact 3 | 53 · contrast pairs checked | same | same |
| Fact 4 | 61 · tasks already done | same | same |
| Closing | So your tokens go to your product, not your buttons. | `h3` style, `--ds-color-text` | Enter s75 |

No theme count. Facts 2 and 3 count what a brand theme gets for free: the roles it can set and the contrast pairs `checkContrast()` checks in each of its blocks (05 shows the same check on `my-brand`: 53 pairs × 2 blocks = 106). The numbers on the canvas are today's counts on main; the video reads them at bundle time (see Numbers and sources).

### 04 Install in one line · f 1380 – 1559 · default

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Install in one line. | `h1` style | Enter s12 |
| Terminal | `$ npm install design-system-wireframe` | terminal panel (`body-lg`, mono) | panel Enter s24; Type s30 – s53 (35 characters) |
| Starter card | Or start from the React starter. · `examples/vite-react` · Form, dialog and toast, themed from ds.theme.json. | card (`h3` style, mono name, `body`) | Enter s70 |

The package name comes from the library's `package.json` `name`; the typing duration follows its length.

### 05 Customize in one file · f 1560 – 1859 · default + `my-brand` panel

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Customize it in one file. | `h2` style | Enter s12 |
| Theme file | the fixture `video/fixtures/ds.theme.json`, printed verbatim (see below) | code panel | Enter s24 |
| Caption | Write it by hand, or with the theme skill: /wireframe-ds:theme | `body-sm`, skill name in mono | Enter s36 |
| Terminal | `$ npx design-system-wireframe theme build` | terminal panel (small) | panel Enter s24; Type s120 – s145 (39 characters) |
| Preview | caption "Preview" + tag `default`, then `data-theme="my-brand"`; "Launch plan", tag New, field "Owner", buttons Publish, Save draft | `Tag`, `TextField`, `Button` | panel Enter s24; Wipe into `my-brand` s160 – s171 |
| Result | Contrast checked · checkContrast(): 0 failures, 106 pairs | `Alert` (success) | Enter s180 |

This is the payoff of 02b: the brand the wall turned into is exactly what this file builds. The fixture holds the `bold` input from `src/themes/bold.ts` (`boldConfig`) under the name `my-brand`:

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

DS-75 runs the real `theme build` on this file at bundle time, loads the `theme.css` it writes, and sets `data-theme="my-brand"` on the panel (and on the 02b stage and the 02d pane). If DS-60's schema differs (field names, required keys), the fixture follows the schema and the code panel prints the fixture as it is; the canvas is then updated.

**Canvas stand-in.** The canvas can only draw themes whose CSS is in its token block, so KF03c, the KF05 right pane and KF09b paint `my-brand` with the shipped `bold` theme. The video paints the CLI's `theme.css`, which is `createTheme()` output without bold's override block: background, a few text roles, the heading case and the type scale differ slightly. For those keyframes, DS-75's still matches the canvas in layout, copy, fonts, radius and component states, not in exact role values.

### 06 Works with Claude · f 1860 – 2159 · dark

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Heading | Works with Claude. | `h1` style | Enter s12 |
| Sub | A Claude Code plugin that reads the manifest of every component. | `body-lg` | Enter s18 |
| Terminal | `> /plugin marketplace add mikespineu/design-system-wireframe` · `> /plugin install wireframe-ds@wireframe-ds` | terminal panel (small); `>` marks Claude Code input | panel Enter s24; Type line 1 s36 – s73, line 2 s84 – s111 |
| Card: Skills | `component-usage` · Picks components and imports. · `theme` · Saves your ds.theme.json. | card, mono names, `body-xs` | Enter s135 |
| Card: Agent | `ui-review` · Flags hardcoded colors, hand-rolled primitives, missing labels. | card | Enter s150 |
| Card: MCP server | `wireframe-ds` · tools `list_components`, `search`, `get_component`, `get_theme`, `list_tokens`, `save_theme` | card + `Tag` (subtle, small, mono) per tool | Enter s165 |

This is the payoff of the 02b statement "Ready for Claude". The video does not say the plugin is listed in Anthropic's plugin directory. It shows only the plugin's own marketplace, which DS-52 ships. A directory line can be added in a later revision once DS-57's listing is live.

### 07 End card · f 2160 – 2339 · default

| Element | Copy | Built with | Motion |
| --- | --- | --- | --- |
| Wordmark | Design System Wireframe | `display` style | Enter s12 |
| Message | Don't spend tokens building your own design system. | `h3` style, `--ds-color-text` | Enter s24 |
| Links | Install: `npm install design-system-wireframe` · Code: `github.com/mikespineu/design-system-wireframe` · Docs: `ds.mikespin.dev` | label + mono `body-lg` | Enter s36 |
| Tags | MIT · React · Radix UI | `Tag` (outline) | Enter s36 |

s150 – s179 (f 2310 – 2339) hold still. KF11 (f 2310) is the poster frame DS-76 exports.

## Numbers and sources

Every number on screen is computed at bundle time from the source below (DS-75 writes them to a generated facts module and a test fails if any shown value differs from its source). The copy makes no token, time or cost claim: "one line" and "one file" are counts of a command and a file, and there is no "minutes", "hours", "x faster" or price anywhere. No number counts themes.

| Shown | Value today (main) | Source and rule |
| --- | --- | --- |
| component families (02b, 03) | 25 | `src/index.ts`: lines matching `export * from './components/<Name>'` |
| themeable roles | 87 | `themeRoles.length`, exported from the package (`src/styles/roles.ts`; `src/styles/roles.test.ts` asserts 87) |
| contrast pairs checked | 53 | `requiredPairs.length` in `src/theme/checkContrast.ts` (30 text-role × ground pairs, 9 more text pairs, 14 UI pairs; `checkContrast.test.ts` asserts `checked` = `requiredPairs.length × 2` for a two-block theme). Not exported from the package today, so DS-75 reads it from the source file or `checkContrast()`'s `checked` on a one-block theme |
| tasks already done | 61 | `roadmap.md`: task lines with `status: done`. Counted at bundle time, so the final render (DS-76, every task done) shows the count on that commit |
| coverage floor | 80 % | `jest.config.cjs`: lowest value in `coverageThreshold.global` (branches, functions, lines, statements are all 80); enforced by `npm test -- --coverage --ci` in `.github/workflows/ci.yml` |
| 0 failures, 106 pairs | 0 / 106 | `checkContrast(theme)` on the fixture's built theme: `failures.length` and `checked` (53 required pairs × 2 blocks for `mode: "both"`) |
| CI step names | 4 tags | `.github/workflows/ci.yml`, job `ci`: step `name`s Lint, Typecheck, Test with coverage, Build library |
| package name | `design-system-wireframe` | the library's `package.json` `name` (set by DS-59; `design-system-test` today). See Package name below |
| repo and docs links | `github.com/mikespineu/design-system-wireframe`, `ds.mikespin.dev` | `package.json` `repository.url`; the Storybook badge link in `README.md` |
| plugin, skill, agent, tool names | see 06 | `plugins/wireframe-ds/.claude-plugin/plugin.json` `name`, `skills/*/SKILL.md`, `agents/*.md`, the MCP server's registered tools |

The 02b Slider values (30, 70) and the other UI values are sample content, not claims.

**Package name.** The user chose the unscoped npm name `design-system-wireframe` for the install line. The roadmap brief for DS-74 and DS-59 talk about a "scoped npm package", and `docs/specs/ClaudePlugin.md` (DS-50) records `@mikespineu/design-system` (its CLI row, the manifest path and an open question about owning the `@mikespineu` scope). DS-59 and `ClaudePlugin.md` may need to change to match. This spec doesn't edit them. The video still reads the name from `package.json` at bundle time, so whatever DS-59 ships is what appears on screen.

## Features shown

Each feature on screen, the task that ships it, the file that proves it, and whether it's on main today. DS-75 depends on all of them; DS-76 renders only once every one is done.

| Feature on screen | Scene | Ships in | Proof file | On main today |
| --- | --- | --- | --- | --- |
| Radix Select keyboard and focus | 02a | DS-17, DS-18 | `src/components/Select/Select.tsx` (Radix `Select`), `Select.test.tsx` | yes |
| Wall of working components: Select, Slider, Switch, Checkbox, SegmentedControl, Button, IconButton, Tag, Input, laid out with Grid and Stack | 02b | DS-18 (Select), DS-24 (Slider), DS-29 (Switch), DS-14 (Checkbox), DS-30 (SegmentedControl), DS-33 (Button, IconButton icons), DS-36 (Stack, Grid); Button, Tag and Input predate the roadmap | `src/index.ts` exports; `src/components/<Name>/<Name>.tsx` and `<Name>.test.tsx` for each | yes |
| "25 component families" | 02b, 03 | the component tasks above and the rest in `roadmap.md` | `src/index.ts` | yes |
| "Your brand, not ours": stage, pane and panel in `my-brand` built from `ds.theme.json` | 02b, 02d, 05 | DS-60 (theme file and CLI), on DS-28 (`createTheme()`, `checkContrast()`) and DS-27 (role contract) | the package's JSON schema file and `package.json` `bin` entry for the CLI; `src/theme/createTheme.ts` | no |
| "Ready for Claude" (named in 02b, shown in 06) | 02b, 06 | DS-51, DS-52, DS-53, DS-55 | `dist/manifest.json`, `plugins/wireframe-ds/.claude-plugin/plugin.json`, `skills/component-usage/SKILL.md`, `mcp/server.mjs` | no |
| Bring your own icons | 02c | DS-46 – DS-49 | `src/components/Icon/IconProvider.tsx`, `createIcon.tsx`, `BringYourOwnIcons.stories.tsx` | yes |
| Typography utilities | 02d | DS-37, DS-38 | `src/styles/tailwind.css` (`@utility heading-*`, `body-*`) | yes |
| Story per component, jest-axe, CI, coverage floor | 02e | DS-8, CLAUDE.md conventions | `.github/workflows/ci.yml`, `jest.config.cjs`, `src/components/*/*.stories.tsx`, `*.test.tsx` | yes |
| Themeable roles, contrast pairs checked | 03 | DS-26, DS-27 (roles), DS-28 (pairs) | `src/styles/roles.ts`, `src/theme/checkContrast.ts` (`requiredPairs`) | yes |
| `checkContrast()` | 05 | DS-28 | `src/theme/checkContrast.ts` | yes |
| Generated manifest ("reads the manifest of every component") | 06 | DS-51 | `dist/manifest.json`, package export `./manifest.json` | no |
| Plugin and its marketplace, install commands | 06 | DS-52, DS-56 | `plugins/wireframe-ds/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, "Use with Claude Code" in `docs/consumer-guide.md` | no |
| `component-usage` skill | 06 | DS-53 | `plugins/wireframe-ds/skills/component-usage/SKILL.md` | no |
| `ui-review` agent | 06 | DS-54 | `plugins/wireframe-ds/agents/ui-review.md` | no |
| MCP tools (6) | 06 | DS-55 | `plugins/wireframe-ds/.mcp.json`, `plugins/wireframe-ds/mcp/server.mjs` (tool registrations) | no |
| Anthropic directory submission | not claimed on screen | DS-57 | submission reference in `factory/jobs/DS-57.md` | no |
| npm package `design-system-wireframe`, one-line install | 04, 07 | DS-59 | `package.json` `name` = `design-system-wireframe`; `npm view design-system-wireframe` | no |
| `ds.theme.json` and `theme build` CLI (`npx design-system-wireframe theme build`) | 05 | DS-60 | the package's JSON schema file and `package.json` `bin` entry for the CLI | no |
| Theme skill `/wireframe-ds:theme` | 05, 06 | DS-10 | `plugins/wireframe-ds/skills/theme/SKILL.md` | no |
| React starter `examples/vite-react` | 04 | DS-61 | `examples/vite-react/package.json`, its CI job | no |

The shipped demo themes (DS-1, DS-12) are not a feature on screen. `default` and `dark` appear as stage colors and `bold` only on the canvas, as the stand-in for `my-brand`.

## Sizes

| Property | Value |
| --- | --- |
| Output | 1920 × 1080, 30 fps, H.264 MP4, 2340 frames (78.0 s) |
| Logical stage | 960 × 540 CSS px rendered at 2×. Every `--ds-*` size keeps its shipped value; on screen it is doubled (`display` 72 → 144 px, `h1` 48 → 96, `body-lg` 18 → 36, label 12 → 24). |
| How 2× is made | Preferred: composition 960 × 540 rendered with Remotion `scale: 2` (device scale factor), so portalled Radix content (the Select list in 02a) and focus outlines scale with everything. Alternative: a 1920 × 1080 composition with a `scale(2)` wrapper as in the DS-73 placeholder, which then must keep the Select list inside the wrapper. DS-75 picks one; either way the file is 1920 × 1080. |
| Action-safe (5 %) | 48 × 27 logical inset (96 × 54 output). No UI outside it. |
| Title-safe (10 %) | 96 × 54 logical inset. All copy sits in a box inset `--ds-space-24` (96) left and right and `--ds-space-16` (64) top and bottom, i.e. 768 × 412 logical, inside title-safe. |
| Columns | single column, or two columns with `--ds-space-8` gap (left 344 – 420 logical, right takes the rest); 02b uses three statement columns (gap `--ds-space-6`) and a four-column wall (gap `--ds-space-3`) |
| Smallest text | `--ds-text-label-size` / `--ds-text-ui-sm-size` (12 logical = 24 output px), used only for labels, tags, tile family names and the code panel. Lines to read are at least `--ds-text-body-size` (16 logical = 32 output px). |
| Keyframes on the canvas | drawn at 0.625 (600 × 338) per artboard, 1.25 for the format board |

## States

The video's "states" are its scenes and themes. Each row is a canvas artboard and a still DS-75 renders at that frame.

| Keyframe | Frame | Scene | Theme | What's on screen |
| --- | --- | --- | --- | --- |
| KF01 | 180 | 01 hook | default | both lines settled, underline full |
| KF02a | 270 | 02a radix | default | focus ring on the Select trigger; Tab row emphasized |
| KF02b | 345 | 02a radix | default | list open, High highlighted (fill + inset ring), Medium checked; ↓ row emphasized |
| KF03a | 465 | 02b components | default | heading, "25 component families"; wall at rest (Switch off, Checkbox unchecked, Week, Slider 30) |
| KF03b | 550 | 02b components | default | wall after the events (Switch on, Checkbox checked, Month, Slider 70) |
| KF03c | 640 | 02b components | `my-brand` (canvas: bold stand-in) | the same wall in the brand; all three statements; tag `data-theme="my-brand"` |
| KF04 | 810 | 02c icons | default | default glyphs vs Lucide inside `IconProvider` |
| KF05 | 960 | 02d type | default + `my-brand` pane (canvas: bold stand-in) | same utilities, neutral and brand |
| KF06 | 1140 | 02e tested | dark | three rows, 80 %, four CI tags |
| KF07 | 1340 | 03 skip | default | four facts settled (25, 87, 53, 61), closing line |
| KF08 | 1530 | 04 install | default | command typed, caret, starter card |
| KF09a | 1660 | 05 customize | default | theme file, empty prompt, preview in default |
| KF09b | 1820 | 05 customize | default + `my-brand` (canvas: bold stand-in) | command typed, preview in the built theme, contrast Alert |
| KF10a | 1980 | 06 claude | dark | both install commands typed, cards not yet in |
| KF10b | 2130 | 06 claude | dark | three cards |
| KF11 | 2310 | 07 end | default | end card, held to the last frame |

Component states shown: Select trigger rest, focus-visible and open; listbox item highlighted and selected; SegmentedControl item checked (both items in turn in 02b); Switch off and on; Checkbox unchecked and checked; Slider at two values with its numeric input; Button primary and secondary at rest; IconButton secondary at rest; Tag solid, subtle, outline, neutral and removable; Alert info and success; Input and TextField empty with placeholder. No hover (there is no pointer in the video), no disabled, no error states.

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

The 02b events are not keyboard events and show no key caps or focus ring: they are controlled `checked` and `value` props set on the event frame.

## Radix

n/a for the video itself (nothing is interactive). Primitives on screen, all through the shipped wrappers, never raw Radix parts:

| Scene | Component | Radix primitive |
| --- | --- | --- |
| 02a | `SelectField` | `Select` (portalled content: set `data-theme` on `<html>` for the scene so the list gets the stage theme) |
| 02b | `Select` (closed trigger only) | `Select` |
| 02b | `Slider` with its numeric input | `Slider` |
| 02b | `Switch` | `Switch` |
| 02b, 02c | `Checkbox` | `Checkbox` |
| 02b | `SegmentedControl` | `RadioGroup` |
| 02b, 02c, 04, 05, 06, 07 | `Button`, `IconButton`, `Tag`, `Alert`, `Input`, `TextField`, `Grid`, `Stack` | none (native elements; `Slot` where the component uses `asChild`) |

## Tokens

Every value below is an existing `--ds-*` role, read through the theme on the stage. Nothing in `video/` hard-codes a color, size or space (DS-75 test).

| Property | Token |
| --- | --- |
| Stage background | `--ds-color-background` |
| Body copy, sub lines | `--ds-color-text`; font `--ds-font-body`; size `--ds-text-body-lg-size` / `--ds-text-body-lg-line-height` (subs), `--ds-text-body-size` / `--ds-text-body-line-height` |
| Headings and wordmark | `--ds-color-text-emphasis`; `--ds-font-heading`; `--ds-text-heading-weight`; `--ds-text-heading-transform`; `--ds-text-display-size`, `--ds-text-display-line-height`, `--ds-text-display-tracking`; `--ds-text-h1-size`, `--ds-text-h1-line-height`, `--ds-text-h1-tracking`; `--ds-text-h2-size`, `--ds-text-h2-line-height`, `--ds-text-h2-tracking`; `--ds-text-h3-size`, `--ds-text-h3-line-height`, `--ds-text-h3-tracking` |
| Hook line 1, key legend rest, eyebrows, fact labels, tile family names | `--ds-color-text-muted` |
| Labels, eyebrows, fact labels, link labels, tile family names | `--ds-font-label`, `--ds-text-label-size`, `--ds-text-label-line-height`, `--ds-text-label-weight`, `--ds-text-label-tracking`, `--ds-text-label-transform` |
| Underline bar (01) | `--ds-color-border-strong`, height `--ds-space-1` |
| Terminal and code panels | background `--ds-color-inverse`; ink `--ds-color-text-inverse`; font `--ds-font-mono`; size `--ds-text-body-lg-size` (04), `--ds-text-ui-size` (small terminal), `--ds-text-ui-sm-size` / `--ds-text-ui-sm-line-height` (code); padding `--ds-space-4` / `--ds-space-3`; radius `--ds-radius-md` |
| Caret | `--ds-color-text-inverse` |
| Key caps | border `--ds-border-width-strong` solid `--ds-color-border-strong`; background `--ds-color-surface`; text `--ds-color-text-emphasis`, `--ds-font-label`, `--ds-text-ui-size`, `--ds-text-ui-weight`; radius `--ds-radius-sm`; height `--ds-space-8`, min width `--ds-space-12`. Pressed: background and border `--ds-color-primary`, text `--ds-color-primary-contrast` |
| Focus ring | `--ds-focus-width` solid `--ds-color-focus`, offset `--ds-focus-offset` (from the component) |
| Facts and stat numbers | `--ds-text-display-size`, `--ds-text-display-line-height`, `--ds-text-display-tracking`, `--ds-font-heading`, `--ds-color-text-emphasis`; top rule `--ds-border-width` solid `--ds-color-border-strong` |
| Key-feature statements (02b) | `--ds-text-body-lg-size` / `--ds-text-body-lg-line-height`, `--ds-font-weight-medium`, `--ds-color-text-emphasis`; column gap `--ds-space-6`, glyph gap `--ds-space-2` |
| Check glyphs (02b, 02e) | `--ds-color-icon`, `--ds-icon-size-lg`, stroke `--ds-icon-stroke-strong` |
| Component wall tiles (02b) | border `--ds-border-width` solid `--ds-color-divider`; background `--ds-color-surface`; radius `--ds-radius-lg`; padding `--ds-space-3`; gap inside `--ds-space-2` (Stack), between tiles `--ds-space-3` (Grid) |
| Cards and panes | border `--ds-border-width` solid `--ds-color-divider`; background `--ds-color-surface` (cards) / `--ds-color-background` (panes); radius `--ds-radius-lg`; shadow `--ds-shadow-sm`; padding `--ds-space-4` / `--ds-space-6` |
| Demo screen frame (05 preview) | border `--ds-border-width` solid `--ds-color-border-strong`; radius `--ds-radius-lg`; shadow `--ds-shadow-lg`; padding `--ds-space-4` |
| Layout gaps | `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-space-6`, `--ds-space-8`, `--ds-space-12` |
| Safe box | inset `--ds-space-24` × `--ds-space-16` |
| Components (Select, Slider, SegmentedControl, Switch, Checkbox, Button, IconButton, Tag, Alert, Input, TextField, Grid, Stack) | their own shipped styles; the video sets no component style |
| Motion | `--ds-motion` stays `0ms` inside compositions (DS-73 `MotionOff`); its curve `cubic-bezier(0.2, 0, 0, 1)` is reused as the Remotion easing |

## Accessibility

**Text contrast, at least 4.5:1 in every theme.** Copy uses only pairs that `checkContrast()` requires at 4.5:1: `--ds-color-text-emphasis`, `--ds-color-text-strong`, `--ds-color-text`, `--ds-color-text-muted` and `--ds-color-placeholder` on `--ds-color-background`, `--ds-color-surface` or `--ds-color-fill`; status text on its own background (`--ds-color-success` on `--ds-color-success-bg`, `--ds-color-info` and `--ds-color-text` on `--ds-color-info-bg`); `--ds-color-primary-contrast` on `--ds-color-primary`; `--ds-color-text-inverse` on `--ds-color-inverse`. No copy sits on `--ds-color-surface-subtle`, which is not a checked ground. Per theme:

| Theme | Where | Proof |
| --- | --- | --- |
| default | 01, 02a, 02b (f 390 – 571), 02c, 02d, 03, 04, 05, 07 | README color table: text 10.4:1, muted 7:1, placeholder 4.5:1 on white; DS-75 also runs `checkContrast()` on the resolved default block |
| dark | 02e, 06 | `src/themes/bold.test.tsx`: "the shipped dark block in tokens.css … passes checkContrast()" |
| `my-brand` (light block) | 02b (from f 560), 02d pane, 05 panel | `checkContrast()` on the built fixture, shown on screen in 05 (0 failures, 106 pairs, both blocks); DS-75 test requires 0 failures. The dark block is checked but never on screen. |
| bold (canvas only) | stand-in for `my-brand` on the canvas; not in the video | `src/themes/bold.test.tsx`: passes `checkContrast()` with no failures |

Focus ring, key caps, icons, the Select border, the Slider thumb and the Switch and Checkbox borders use the 3:1 UI pairs (`--ds-color-focus`, `--ds-color-icon`, `--ds-color-border-strong`, `--ds-color-primary` on background and surface). Status color appears only in the success Alert (05) and the info Alert (02c), each with an icon and a title, never color alone.

**Minimum time on screen per line of copy.** A line must stay fully visible (after its Enter, before the scene ends) for at least `max(60, 15 + 10 × words)` frames, i.e. 2 s minimum and about 180 words per minute beyond that. Words are whitespace-separated tokens; a command or code line counts its tokens. Copy that is identical on both sides of the 02b stage wipe counts as one continuous line. Every line in the scene tables meets this. The tightest are the 02c sub (9 words, needs 105, has 117), the 02d sub (10 words, needs 115, has 117), the 04 card body (7 words, needs 85, has 95) and, in 02b, "Ready for Claude" (3 words, needs 60, has 85: fully in s215 – s299) and the `my-brand` caption tag (needs 60, has 118). The 02b `default` tag is fully on s12 – s169 (158). DS-75 tests the rule from the same scene data the compositions use, so a copy change that breaks it fails CI.

**Flashes (WCAG 2.3.1).** No more than 3 flashes in any one second; the design stays far below that. Large light/dark changes happen only at four scene wipes, at f 990, 1170, 1860 and 2160. The closest two are 180 frames (6 s) apart, so no one-second window has more than one reversal. The 02b stage wipe (f 560), the 02b → 02c wipe (f 690), the 02d pane and the 05 panel (f 1720) all go between default and the light block of `my-brand`, light to light, so none of them is a reversal. Each change is a 12-frame wipe, not a cut. Nothing blinks: the caret is steady, key caps fill once for 6 frames over a small area, the 02b Switch, Checkbox and SegmentedControl change once each over small areas at least 15 frames apart, and counters change digits only. No saturated red is used at all. DS-75 tests that theme or scene changes are at least 30 frames apart.

**Captions and transcript.** The video has no speech and no audio, so there is nothing to caption in the WCAG 1.2.2 sense. It still ships two text alternatives, generated by DS-75 from the same scene data (so they can't drift from the picture) and published by DS-76 next to the video:

- `promo.en.vtt`, a WebVTT text track with one cue per line of on-screen copy, timed from the frames in this spec (frame / 30). It lets players show the text and makes it searchable.
- `promo-transcript.md`, a described transcript: every line of copy in order, plus one short sentence per scene describing what is shown (e.g. "A wall of shipped components is used: a switch turns on, a box is checked, a slider moves. Then the same wall is restyled in an example brand built from one theme file."). This is the media alternative for the video-only content (WCAG 1.2.1).

The README link (DS-76) points to the video and the transcript, and the poster image (KF11) has alt text describing the video.

**No audio.** The render has no `<Audio>` element and no audio file, unless the user supplies a licensed track. If they do, the license (or its source and terms) goes into `video/README.md` with the file, the track carries no lyrics or speech, its level stays constant (no sudden loud cue), and the VTT gets a `[Music]` cue for its span. DS-75 tests that no audio is imported unless that license note exists.

**Motion comfort.** Only fades, small rises (16 output px), wipes and in-place component state changes. No zoom, rotation, parallax or camera move.

**What DS-75 should verify** (the video has no DOM to run `jest-axe` on, so these replace it):

- every number shown equals its source (Numbers and sources);
- every feature shown exists: package name matches `package.json`, the `theme build` command exists in the CLI `bin`, every skill, agent and MCP tool named in 06 is registered in the plugin, every 02b tile name is a family exported from `src/index.ts`;
- no copy contains roadmap wording ("coming soon", "soon", "planned", "roadmap", "beta", "preview") or a time, token or cost figure;
- no copy counts themes or names the demo themes `bold` or `bold-dark`;
- every line meets the minimum hold; theme or scene changes are at least 30 frames apart;
- each theme used passes `checkContrast()` (default, dark, the `my-brand` fixture);
- no CSS animation, transition, timer or audio in `video/src`;
- the VTT and transcript are generated and contain every line of copy;
- optional: `jest-axe` on each scene component rendered in jsdom at its keyframe, to catch missing alt text or labels on the components themselves (decorative glyphs `aria-hidden`, IconButton labelled, the 02b Slider, Switch and Checkbox labelled).

## Token requests

None.
