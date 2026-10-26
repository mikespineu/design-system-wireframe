# Theming

- task: DS-26
- canvas: docs/design-system-wireframe/Theming.dc.html
- canvas_url: https://claude.ai/artifact/ABfGmU24bzv2C7XhNfCwJY
- approved: yes
- approved_by: mikespin
- approved_at: 2026-10-26
- approval_hash:

The public theming API of the design system: a flat set of semantic roles that a theme may override, with defaults that reproduce today's Wireframe look exactly (white ground, gray accents, black ink, Red Hat Mono titles and labels, Red Hat Text body, square corners, no shadows). A consumer changes colors, fonts, type, corners, depth or switches to dark by overriding roles under `[data-theme="<name>"]`; components never read palette steps or raw values directly.

This is a contract, not a component. DS-27 implements it in `src/styles/tokens.css`, `src/styles/tailwind.css` and the component CSS; DS-28 generates it with `createTheme()`; DS-2 designs the example themes `soft` and `dark`.

## Token architecture

Three tiers. Only the middle tier is public.

| Tier | What | Who sets it | Examples |
| --- | --- | --- | --- |
| 1. Primitives | Raw palette and spacing scale. Never read by components (enforced by `src/components/semanticColors.test.ts`). | Library only | `--ds-color-gray-500`, `--ds-color-black`, `--ds-space-4` |
| 2. Roles (the theme contract) | Semantic values every component reads: color, font, weight, type scale, radius, shadow, shape and density. Flat, one value each, no nesting beyond a default `var()` to another role or primitive. | Library defaults, `[data-theme]` blocks, `createTheme()` | `--ds-color-primary`, `--ds-color-text-muted`, `--ds-radius-md` |
| 3. Component-local | Private custom properties inside one component's CSS, always derived from roles. Not themeable, not documented as API. | Component CSS only | Checkbox `checkbox-row`, Dialog `dialog-width-md`, Slider `slider-pill-font` |

Naming convention for this spec. The deterministic spec check only allows full custom-property names that already exist in `src/styles/tokens.css`. So above the `## Token requests` section, every role is written by its bare name, without the global prefix: role `color-text-muted` is the CSS custom property `--ds-color-text-muted`. Existing roles appear with their full CSS name where useful; new roles appear by bare name only, and their full names, defaults and dark values are in `## Token requests`. Component-local properties are written without their leading dashes (for example `checkbox-line`) because they are not global tokens.

Design rules for the role list (so `createTheme()` can fill it):

- Flat: every role is a single custom property. No composite shorthands (no `font` shorthand, no `border` shorthand).
- Complete: every visual property a component sets that a theme may want to change is a role. Anything not a role is deliberately fixed (see "Fixed, not themeable" under Tokens).
- Paired: roles that must be legible together are documented as pairs (see Accessibility), so a generator can check them.
- Default-by-reference: new roles default to an existing role or primitive with `var()`, so overriding one upstream role in a theme moves everything that follows it unless the theme overrides the follower too.

## Theme contract

87 roles in 7 groups. 33 exist today (listed here with full names and defaults); 54 are new (bare names here, full definitions under Token requests).

### Color (30 roles: 24 existing, 6 new)

| Role | Default (light) | Used for |
| --- | --- | --- |
| `--ds-color-background` | `--ds-color-white` #FFFFFF | page ground |
| `--ds-color-surface` | `--ds-color-white` #FFFFFF | control and panel fill |
| `--ds-color-surface-subtle` | `--ds-color-gray-50` #F7F7F7 | disabled / read-only fill, info background |
| `--ds-color-fill` | `--ds-color-gray-100` #EEEEEE | hover fill, subtle tag |
| `--ds-color-divider` | `--ds-color-gray-200` #E0E0E0 | separators, disabled borders, disabled primary fill |
| `--ds-color-border` | `--ds-color-gray-300` #C7C7C7 | rest border of text controls |
| `--ds-color-disabled` | `--ds-color-gray-400` #A3A3A3 | disabled non-text (box border, checked fill, separator glyph) |
| `--ds-color-placeholder` | `--ds-color-gray-500` #767676 | placeholder, disabled text, slider track |
| `--ds-color-text-muted` | `--ds-color-gray-600` #595959 | hints, descriptions, muted links, secondary icons |
| `--ds-color-text` | `--ds-color-gray-700` #404040 | body copy |
| `--ds-color-text-strong` | `--ds-color-gray-800` #262626 | stronger body (error alert body, subtle and neutral tags) |
| `color-text-emphasis` (new) | black #000000 | titles, labels, legends, control values, current item; replaces text uses of `--ds-color-ink` |
| `color-text-inverse` (new) | white #FFFFFF | text on `--ds-color-inverse` |
| `color-border-strong` (new) | black #000000 | outlines that must read at 3:1 or more (secondary and icon buttons, checkbox box, slider thumb and steppers, outline tag, dialog panel, text-control hover and focus border); replaces border uses of `--ds-color-ink` |
| `color-icon` (new) | black #000000 | standalone icons in controls (icon button, dialog close, slider steppers); replaces icon uses of `--ds-color-ink` |
| `color-focus` (new) | black #000000 | focus ring color; replaces outline uses of `--ds-color-ink` |
| `color-overlay` (new) | rgb(0 0 0 / 0.5) | modal scrim (Dialog overlay) |
| `--ds-color-inverse` | `--ds-color-gray-900` #141414 | inverse surface (slider value bubble) |
| `--ds-color-primary` | `--ds-color-black` #000000 | brand / action: primary button, checked box, slider range and filled ticks, solid tag, badge, pressed fill |
| `--ds-color-primary-hover` | `--ds-color-gray-800` #262626 | hover on primary |
| `--ds-color-primary-contrast` | `--ds-color-white` #FFFFFF | text and marks on primary |
| `--ds-color-info`, `--ds-color-info-border`, `--ds-color-info-bg` | #404040, #C7C7C7, #F7F7F7 | info feedback |
| `--ds-color-success`, `--ds-color-success-border`, `--ds-color-success-bg` | #2E6B45, #9CC7AB, #EDF5EF | success feedback |
| `--ds-color-error`, `--ds-color-error-border`, `--ds-color-error-bg` | #A3302B, #E3AAA6, #FBEDEC | error feedback, invalid borders and messages |

`--ds-color-ink` leaves the contract: it becomes a deprecated alias of `color-text-emphasis` (see Token requests) so un-migrated code keeps working, and themes do not set it.

### Font (4 roles: 1 existing, 3 new)

| Role | Default | Used for |
| --- | --- | --- |
| `font-heading` (new) | `--ds-font-mono` (Red Hat Mono) | display, h1 to h3, dialog title |
| `font-body` (new) | `--ds-font-text` (Red Hat Text) | body copy, inputs, checkbox labels, hints, errors, alert body |
| `font-label` (new) | `--ds-font-mono` (Red Hat Mono) | UI text: buttons, field labels, legends, tags, badges, breadcrumb, alert title |
| `--ds-font-mono` | 'Red Hat Mono', ui-monospace, monospace | tabular numerals and units (slider pill, bubble, marks, units); also the default source of heading and label |

`--ds-font-text` and `--ds-font-family` stay as primitives / legacy aliases and are not part of the contract.

### Font weight (3 new)

`font-weight-regular` 400, `font-weight-medium` 500, `font-weight-bold` 700. Components pick a weight role; styles that own a weight (heading, label, ui) have their own weight role defaulting to one of these.

### Type scale (36 new)

13 styles. See Sizes for the full table with values. Each style has a size and a line-height; headings add a tracking role each and share a weight and a transform role; label has weight, tracking and transform; ui has weight.

### Radius (4 roles: 1 existing, 3 new)

`radius-sm`, `--ds-radius-md`, `radius-lg`, `radius-full`. All default to 0 (via `--ds-radius`). Assignment per component under Tokens.

### Shadow (3 new)

`shadow-sm`, `shadow-md`, `shadow-lg`. All default to `none`.

### Shape and density (7 existing)

| Role | Default | Note |
| --- | --- | --- |
| `--ds-border-width` | 1px | |
| `--ds-border-width-strong` | 2px | invalid fields, checkbox box, slider thumb and track |
| `--ds-focus-width` | 2px | themes may raise it, never below 2px |
| `--ds-focus-offset` | 2px | |
| `--ds-control-height` | 44px | md controls; themes may lower it only to 40px or more (target size) |
| `--ds-motion` | 120ms cubic-bezier(0.2, 0, 0, 1) | |
| `--ds-photo-filter` | grayscale(1) contrast(1.1) | a theme may set `none` to allow color photography |

Not themeable: the spacing scale (`--ds-space-1` to `--ds-space-24`), the palette, and component-local properties. Spacing is the layout grid; changing it per theme would break alignment between components.

## Sizes

Theming has no component sizes of its own. The sizing knobs it exposes are the type scale, the radius scale, the shadow scale and control height. Canvas section 10.

### Type scale

Default values reproduce today. Line-heights are given in the unit that matches the component CSS today (px where components hardcode px, unitless where only the Tailwind theme uses the style).

| Style | Font role | Size | Line-height | Weight | Tracking | Transform | Used by today |
| --- | --- | --- | --- | --- | --- | --- | --- |
| display | font-heading | 4.5rem (72) | 1 | text-heading-weight (500) | -0.04em | text-heading-transform (none) | `text-display` utility, foundations |
| h1 | font-heading | 3rem (48) | 1.1 | 500 | -0.03em | none | `text-h1`, `h1` |
| h2 | font-heading | 2rem (32) | 1.2 | 500 | -0.02em | none | `text-h2`, `h2` |
| h3 | font-heading | 1.375rem (22) | 29px | 500 | 0 | none | Dialog title, Slider touch bubble |
| body-lg | font-body | 1.125rem (18) | 1.6 | regular | — | — | `text-body-lg` |
| body | font-body | 1rem (16) | 26px | regular | — | — | Input, Textarea, Checkbox md label, Dialog description and body, Slider pill and bubble input (size only, in mono) |
| body-sm | font-body | 0.9375rem (15) | 24px | regular | — | — | Checkbox sm label |
| body-xs | font-body | 0.875rem (14) | 1.5 (21) | regular | — | — | Alert body |
| caption | font-body | 0.8125rem (13) | 20px | regular | — | — | hints, errors (medium), checkbox description, textarea counter, breadcrumb (size only, in label font) |
| label | font-label | 0.75rem (12) | 16px | text-label-weight (500) | 0.08em | uppercase | Field label, CheckboxGroup legend |
| ui | font-label | 0.875rem (14) | 20px | text-ui-weight (500) | — | — | Button, Alert title |
| ui-sm | font-label | 0.75rem (12) | 16px | per use | — | — | Tag, Slider marks, bubble, sm pill (in mono) |
| ui-xs | font-label | 0.6875rem (11) | 16px | per use | — | — | Badge |

Sub-pixel deltas when Tailwind utilities move onto these roles (the component CSS values win, matching the README type table): `text-body` 25.6 → 26px, `text-caption` 19.5 → 20px, `text-h3` 28.6 → 29px, `text-label` 15.96 → 16px. Inputs and breadcrumb have fixed 44 px boxes, so nothing visibly moves; Field hint and error rows grow by 0.5 px.

### Radius scale

| Step | Default | Intended for |
| --- | --- | --- |
| `radius-sm` | 0 | small parts: checkbox box, tag, dialog close button, slider value bubble |
| `--ds-radius-md` | 0 | controls: button, icon button, input, textarea, slider steppers and bubble input |
| `radius-lg` | 0 | containers: alert, dialog panel |
| `radius-full` | 0 | pills and round parts: badge, slider track, range and thumb |

In Wireframe everything is square, so `radius-full` is 0 too; a theme sets it to 9999px.

### Shadow scale

| Step | Default | Intended for |
| --- | --- | --- |
| `shadow-sm` | none | slider thumb |
| `shadow-md` | none | slider value bubble and bubble input (floating, small) |
| `shadow-lg` | none | dialog panel |

Buttons, inputs, alerts and tags stay flat in every theme (no shadow role assigned).

### Control height

`--ds-control-height` 44px; checkbox row, button, input, icon button, breadcrumb and slider md read it.

## States

Two kinds of state matter: which theme is active, and which role each interaction state reads. Canvas sections 02 to 09 (02 default, 03 to 07 one per knob, 08 all knobs together, 09 dark) and 11 (interaction states in default and dark). Every themed panel uses identical markup and CSS; only a block of role overrides on the panel root differs. All example values in those panels (colors, web fonts, sizes, radii, shadows) are illustrative, not tokens.

### Theme states

| State | Trigger | What changes |
| --- | --- | --- |
| Default (Wireframe) | no attribute, or `data-theme="default"` on any ancestor | all roles at defaults; identical to today |
| Dark | `data-theme="dark"` on `html` or any ancestor | all 30 color roles take dark values; `color-scheme: dark`; fonts, type, radius, shadow, shape unchanged |
| Consumer theme | `data-theme="<name>"` with the consumer's own block | only the roles the theme sets; everything else inherits from default |
| Scoped (nested) theme | `data-theme` on a subtree, e.g. a dark card inside a light page | roles resolve from the nearest ancestor with `data-theme`; portaled content needs care (see Radix) |
| Brand knob (minimum) | override `--ds-color-primary`, `--ds-color-primary-hover`, `--ds-color-primary-contrast`, `color-focus` | primary button, checked box, slider range and filled ticks, solid tag, badge, pressed fills, focus ring |
| Color knob (full, canvas 03) | override any color role; canvas example: magenta primary #BE185D / hover #9D174D / focus, plus every neutral tinted toward the brand hue (blush ground #FCEEF4, plum ink #2E0F22, tinted fills, borders, text roles, inverse, scrim, info); 22 of 30 roles, status kept | ground, surfaces, text, borders, icons, focus, action, scrim; every pair still passes (ratios on the canvas) |
| Fonts knob | override `font-heading`, `font-body`, `font-label` (and optionally `--ds-font-mono`); canvas example: Playfair Display / DM Sans / DM Sans / JetBrains Mono | titles, body, UI labels, numerals |
| Type scale knob | override any `text-*` role; canvas example: bold h3 at 32px / 36px with -0.05em tracking, 18px body, bold sentence-case labels, 16px bold buttons | sizes, line-heights, heading weight and tracking, label case and tracking, button weight |
| Radius knob | override `radius-sm`, `--ds-radius-md`, `radius-lg`, `radius-full` | corners; focus rings follow the radius |
| Shadow knob | override `shadow-sm`, `shadow-md`, `shadow-lg` | thumb, bubble, dialog panel depth |
| All knobs together (canvas 08, "Example: Orchard") | one block setting color, font, type, radius, shadow and `--ds-control-height` roles; shown side by side with Default | everything at once: cream ground #FBF3E4, brown ink #2A1C12, persimmon primary #C2410C, Fraunces / Outfit / DM Mono, sentence-case labels, radius 6 / 12 / 20 / full, warm soft shadows, 48px controls. Illustrative only; the shipped example themes are DS-2's soft and dark |

### Interaction state → role

What each component state reads after DS-27. Defaults make every row look like today.

| Interaction state | Border | Fill | Text / icon |
| --- | --- | --- | --- |
| Rest, text control | `--ds-color-border` | `--ds-color-surface` | value `color-text-emphasis`, placeholder `--ds-color-placeholder` |
| Rest, outlined control (secondary / icon button, checkbox, thumb, stepper, outline tag) | `color-border-strong` | `--ds-color-surface` | `color-text-emphasis` / `color-icon` |
| Rest, primary | `--ds-color-primary` | `--ds-color-primary` | `--ds-color-primary-contrast` |
| Hover, neutral | unchanged; text controls go to `color-border-strong` | `--ds-color-fill` | unchanged |
| Hover, primary / checked | `--ds-color-primary-hover` | `--ds-color-primary-hover` | `--ds-color-primary-contrast` |
| Pressed (dialog close, stepper, thumb) | unchanged | `--ds-color-primary` | `--ds-color-primary-contrast` |
| Checked / indeterminate / selected range | `--ds-color-primary` | `--ds-color-primary` | mark `--ds-color-primary-contrast` |
| Focus-visible | text controls and dialog close add `color-border-strong` border | unchanged | outline `--ds-focus-width` solid `color-focus`, offset `--ds-focus-offset` |
| Invalid | `--ds-color-error`, width `--ds-border-width-strong` | checked: `--ds-color-error` | message `--ds-color-error`, weight medium |
| Disabled | `--ds-color-divider` (text controls, primary) or `--ds-color-disabled` (checkbox, thumb) or `--ds-color-border` (secondary, icon button) | `--ds-color-surface-subtle`, checked `--ds-color-disabled`, primary `--ds-color-divider` | `--ds-color-placeholder`; icons `--ds-color-disabled` |
| Read-only | `--ds-color-divider` | `--ds-color-surface-subtle` | `color-text-emphasis` |
| Active drag (slider bubble) | `--ds-color-inverse` | `--ds-color-inverse` | `color-text-inverse` |
| Open (dialog) | panel `color-border-strong` | scrim `color-overlay`, panel `--ds-color-surface` | |

## Keyboard

Theming adds no keys and must not change keyboard behavior. Rules a theme must keep:

- Focus order, roving focus and every key binding come from the components and Radix; a theme only changes values, never `display`, `order` or `tabindex`.
- Focus is always visible: the ring is `outline: --ds-focus-width solid color-focus` with `--ds-focus-offset`. A theme may change the ring color, width (2px minimum) and offset (0 minimum), never remove it.
- `color-focus` must reach 3:1 against `--ds-color-background` and against the surface it sits next to (WCAG 2.4.11 / 1.4.11). The default and dark values reach 21:1 and 17.2:1.
- Outlines follow `border-radius`, so the ring stays aligned when `radius-*` changes; no extra role is needed.
- Switching `data-theme` at runtime must not move focus or re-mount components (it is a pure CSS change).
- Forced-colors mode (Windows High Contrast) overrides all roles; components keep using `outline` (not `box-shadow`) for focus so the ring survives.

## Radix

None. Theming is a CSS custom-property contract; there is no primitive to build on, and Radix Themes must not be used.

How the contract meets Radix primitives:

- Components style Radix state attributes (`[data-state="checked"]`, `[data-state="open"]`, `[data-disabled]`, `[data-highlighted]`, `[data-orientation]`) only through role tokens, never palette steps or raw values. A theme therefore never needs Radix-specific selectors.
- Portals. `Dialog.Portal` (and future Popover, Tooltip, Select, DropdownMenu) mounts into `document.body`. A theme set on `html` reaches portaled content; a theme scoped to a subtree does not. DS-27 must make portaled wrappers carry the theme: read the nearest `[data-theme]` from the trigger and set the same `data-theme` on the portaled root, or accept a `container` prop. The canvas shows the scoped case only for in-flow components.
- Animations keyed on `[data-state]` use `--ds-motion`; themes may change it, and `prefers-reduced-motion` still removes motion.

## Tokens

Mapping of every hardcoded typography, shadow and text-transform value, and every `--ds-color-ink` use, in `src/components/` (CSS and TSX class names, stories and tests excluded) to a role. Roles by bare name. "Same" means the value already reads a role and stays.

### Button (`src/components/Button/Button.tsx`)

| Line | Current | Role |
| --- | --- | --- |
| 14 | `font-mono` | font-label |
| 14 | `text-sm` (14px / 20px) | text-ui-size, text-ui-line-height |
| 14 | `font-medium` (500) | text-ui-weight |
| 14 | `rounded-md` | `--ds-radius-md` (same) |
| 15 | `focus-visible:focus-ring` (ring in `--ds-color-ink`) | color-focus (via the `focus-ring` utility, see tailwind.css) |
| 23 | secondary `border-ink` | color-border-strong |
| 23 | secondary `text-ink` | color-text-emphasis |
| 26 | ghost `text-ink` | color-text-emphasis |
| 26 | ghost `underline underline-offset-4` | fixed (link affordance, not themeable) |

### IconButton (`src/components/IconButton/IconButton.tsx`)

| Line | Current | Role |
| --- | --- | --- |
| 19 | `rounded-md` | `--ds-radius-md` (same) |
| 19 | `border-ink` | color-border-strong |
| 19 | `text-ink` (icon via currentColor) | color-icon |

### Field, Input, TextField (`src/components/Input/Input.tsx`)

| Line | Current | Role |
| --- | --- | --- |
| 79 | label `font-mono` | font-label |
| 79 | label `text-label` (12px / 1.33, 0.08em) | text-label-size, text-label-line-height, text-label-tracking |
| 79 | label `font-medium` | text-label-weight |
| 79 | label `uppercase` | text-label-transform |
| 79 | label `text-ink` | color-text-emphasis |
| 88, 96 | hint `text-caption` (13px / 1.5) | text-caption-size, text-caption-line-height |
| 102 | error `text-caption` | text-caption-size, text-caption-line-height |
| 102 | error `font-medium` | font-weight-medium |
| 122 | input `font-sans` | font-body |
| 122 | input `text-body` (16px / 1.6) | text-body-size, text-body-line-height |
| 122 | input `text-ink` | color-text-emphasis |
| 122 | input `rounded-md` | `--ds-radius-md` (same) |
| 123 | `focus-visible:focus-ring` | color-focus |

### Alert (`src/components/Alert/Alert.tsx`)

| Line | Current | Role |
| --- | --- | --- |
| 33, 41 | info / success title `font-medium` | text-ui-weight |
| 49 | error title `font-bold` (700) | font-weight-bold |
| 63 | box, no radius | radius-lg (new property, default 0: no change) |
| 63 | box, no shadow | none (flat in every theme) |
| 73 | title `font-mono` | font-label |
| 73 | title `text-sm` (14px / 20px) | text-ui-size, text-ui-line-height |
| 77 | body `text-sm leading-normal` (14px / 1.5) | text-body-xs-size, text-body-xs-line-height |
| 77 | body font (inherits Red Hat Text) | font-body |

### Tag, Badge (`src/components/Tag/Tag.tsx`)

| Line | Current | Role |
| --- | --- | --- |
| 19 | `font-mono` | font-label |
| 19 | `text-xs` (12px / 16px), weight inherited 400 | text-ui-sm-size, text-ui-sm-line-height, font-weight-regular |
| 22–25 | no radius | radius-sm (new property, default 0) |
| 24 | outline `border-ink` | color-border-strong |
| 24 | outline `text-ink` | color-text-emphasis |
| 49 | remove button `focus-visible:focus-ring` | color-focus |
| 69 | Badge `font-mono` | font-label |
| 69 | Badge `text-[11px]` (line-height inherited) | text-ui-xs-size, text-ui-xs-line-height (box is a fixed 22px flex, no visible change) |
| 69 | Badge `font-medium` | font-weight-medium |
| 69 | Badge, no radius | radius-full (new property, default 0) |

### Breadcrumb (`src/components/Breadcrumb/Breadcrumb.tsx`)

| Line | Current | Role |
| --- | --- | --- |
| 26 | link `hover:text-ink` | color-text-emphasis |
| 26 | link `underline-offset-4`, `hover:underline` | fixed (link affordance) |
| 26 | link `focus-visible:focus-ring` | color-focus |
| 41 | `font-mono` | font-label |
| 41 | `text-[13px]` (line-height inherited 1.5) | text-caption-size, text-caption-line-height (inside a 44px flex row, no visible change) |
| 50 | current page `text-ink` | color-text-emphasis |

### Checkbox, CheckboxGroup (`src/components/Checkbox/Checkbox.css`)

| Line | Current | Role |
| --- | --- | --- |
| 6 | local `checkbox-line: 26px` | text-body-line-height |
| 7 | local `checkbox-pad: 9px` | `calc((checkbox-row − checkbox-line) / 2)`, derived (44 − 26) / 2 = 9 |
| 13 | `font-family: var(--ds-font-text)` | font-body |
| 20 | sm `checkbox-line: 24px` | text-body-sm-line-height |
| 21 | sm `checkbox-pad: 4px` | derived (32 − 24) / 2 = 4 |
| 38 | box border `--ds-color-ink` | color-border-strong |
| 39 | box `--ds-radius-md` | radius-sm |
| 46–49 | checked fill `--ds-color-primary` (border stays ink) | fill same; border `--ds-color-primary` (black today, so identical) |
| 62 | focus outline `--ds-color-ink` | color-focus |
| 122 | label `--ds-color-ink` | color-text-emphasis |
| 123 | label `font-size: 1rem` | text-body-size |
| 129 | sm label `0.9375rem` | text-body-sm-size |
| 140, 141 | description `0.8125rem` / `20px` | text-caption-size, text-caption-line-height |
| 162 | legend `--ds-color-ink` | color-text-emphasis |
| 163 | legend `--ds-font-mono` | font-label |
| 164 | legend `0.75rem` | text-label-size |
| 165 | legend `500` | text-label-weight |
| 166 | legend `16px` | text-label-line-height |
| 167 | legend `letter-spacing: 0.08em` | text-label-tracking |
| 168 | legend `text-transform: uppercase` | text-label-transform |
| 182, 183 | hint `0.8125rem` / `20px` | text-caption-size, text-caption-line-height |
| 202 | error `0.8125rem` | text-caption-size |
| 203 | error `500` | font-weight-medium |
| 204 | error `20px` | text-caption-line-height |

### Dialog (`src/components/Dialog/Dialog.css`)

| Line | Current | Role |
| --- | --- | --- |
| 5 | overlay `color-mix(in srgb, var(--ds-color-ink) 50%, transparent)` | color-overlay |
| 34 | panel border `--ds-color-ink` | color-border-strong |
| 35 | panel `--ds-radius-md` | radius-lg |
| 36 | panel `box-shadow: none` | shadow-lg |
| 77 | title `--ds-font-mono` | font-heading |
| 78 | title `font-weight: 500` | text-heading-weight |
| 79 | title `22px` | text-h3-size |
| 80 | title `29px` | text-h3-line-height |
| 75–82 | title, no letter-spacing / transform | text-h3-tracking, text-heading-transform (new properties, defaults 0 / none) |
| 81 | title `--ds-color-ink` | color-text-emphasis |
| 85, 86, 87 | description `--ds-font-text`, `1rem`, `26px` | font-body, text-body-size, text-body-line-height |
| 102 | close `--ds-radius-md` | radius-sm |
| 104 | close icon `--ds-color-ink` | color-icon |
| 110 | close focus border `--ds-color-ink` | color-border-strong |
| 111 | close focus outline `--ds-color-ink` | color-focus |
| 115, 116 | close pressed `--ds-color-ink` / `--ds-color-primary-contrast` | `--ds-color-primary` / `--ds-color-primary-contrast` |
| 124, 125, 126 | body `--ds-font-text`, `1rem`, `26px` | font-body, text-body-size, text-body-line-height |
| 22–24 | local `dialog-width-sm/md/lg` | fixed component-local (layout, not themeable) |

### Textarea (`src/components/Textarea/Textarea.css`)

| Line | Current | Role |
| --- | --- | --- |
| 3 | local `textarea-line: 26px` | text-body-line-height |
| 4, 5 | local `textarea-chrome`, `textarea-min`, inputs `textarea-rows`, `textarea-max-rows` | component-local, derived (stay) |
| 15 | `color: --ds-color-ink` | color-text-emphasis |
| 16 | `--ds-font-text` | font-body |
| 17 | `font-size: 1rem` | text-body-size |
| 45, 54 | hover / focus border `--ds-color-ink` | color-border-strong |
| 49 | focus outline `--ds-color-ink` | color-focus |
| 88 | counter `--ds-font-text` | font-body |
| 89, 90 | counter `0.8125rem` / `20px` | text-caption-size, text-caption-line-height |
| 92 | counter `font-weight: 400` | font-weight-regular |
| 102 | near / at `500` | font-weight-medium |
| 103 | near / at `--ds-color-ink` | color-text-emphasis |
| 107 | over `500` | font-weight-medium |

### Slider (`src/components/Slider/Slider.css`)

| Line | Current | Role |
| --- | --- | --- |
| 12 | local `slider-pill-font: 16px` (md, lg) | text-body-size |
| 23 | root `--ds-font-text` | font-body |
| 38 | sm `slider-pill-font: 12px` | text-ui-sm-size |
| 114 | track `--ds-radius-md` | radius-full |
| 123 | range `--ds-radius-md` | radius-full |
| 124 | range `--ds-color-ink` | `--ds-color-primary` |
| 147 | thumb border `--ds-color-ink` | color-border-strong |
| 148 | thumb `--ds-radius-md` | radius-full |
| 140–152 | thumb, no shadow | shadow-sm (new property, default none) |
| 160 | thumb pressed fill `--ds-color-ink` | `--ds-color-primary` |
| 165 | thumb focus outline `--ds-color-ink` | color-focus |
| 185 | pill `--ds-font-mono` | `--ds-font-mono` (same) |
| 187 | pill `font-weight: 500` | font-weight-medium |
| 189 | pill `--ds-color-ink` | color-text-emphasis |
| 240 | filled tick `--ds-color-ink` | `--ds-color-primary` |
| 257 | mark label `--ds-font-mono` | same |
| 258, 259 | mark label `12px` / `16px` | text-ui-sm-size, text-ui-sm-line-height |
| 266 | current mark `--ds-color-ink` | color-text-emphasis |
| 267 | current mark `500` | font-weight-medium |
| 292 | bubble `--ds-radius-md` | radius-sm |
| 294 | bubble text `--ds-color-primary-contrast` | color-text-inverse |
| 295 | bubble `--ds-font-mono` | same |
| 296, 297 | bubble `12px` / `16px` | text-ui-sm-size, text-ui-sm-line-height |
| 298 | bubble `500` | font-weight-medium |
| 275–304 | bubble, no shadow | shadow-md (new property, default none) |
| 351 | bubble input border `--ds-color-ink` | color-border-strong |
| 354 | bubble input text `--ds-color-ink` | color-text-emphasis |
| 355 | bubble input `--ds-font-mono` | same |
| 356 | bubble input `16px` | text-body-size |
| 357 | bubble input `500` | font-weight-medium |
| 326–363 | bubble input, no shadow | shadow-md |
| 370 | bubble input focus outline `--ds-color-ink` | color-focus |
| 390 | active bubble input text `--ds-color-primary-contrast` | color-text-inverse |
| 433, 434 | touch bubble `22px` / `29px` | text-h3-size, text-h3-line-height |
| 442 | touch bubble input `22px` | text-h3-size |
| 464 | stepper border `--ds-color-ink` | color-border-strong |
| 467 | stepper icon `--ds-color-ink` | color-icon |
| 487, 488 | stepper pressed `--ds-color-ink` / `--ds-color-primary-contrast` | `--ds-color-primary` / `--ds-color-primary-contrast` |
| 492 | stepper focus outline `--ds-color-ink` | color-focus |
| 533 | unit `--ds-font-mono` | same |

### Global styles (`src/styles/tailwind.css`, outside `src/components/` but read by every component)

| Line | Current | Role |
| --- | --- | --- |
| 56 | `--font-sans: var(--ds-font-text)` | font-body |
| 57 | `--font-mono: var(--ds-font-mono)` | same; add `font-heading` and `font-label` utilities |
| 65–70 | `--radius-md` only; shadows cleared | add `rounded-sm`, `rounded-lg`, `rounded-full` and `shadow-sm/md/lg` mapped to the roles (Tailwind's own values stay cleared) |
| 74–98 | `--text-*` utilities with literal values | each `--text-<style>`, `--line-height`, `--letter-spacing`, `--font-weight` reads the matching role |
| 104 | `html` color `--ds-color-ink` | color-text-emphasis |
| 105 | `html` font `--ds-font-text` | font-body |
| 114 | `h1`–`h6` font `--ds-font-mono` | font-heading, plus text-heading-weight and text-heading-transform |
| 126 | `focus-ring` outline `--ds-color-ink` | color-focus |

### Fixed, not themeable

- Underline and underline offset on ghost button and breadcrumb links (affordance).
- `font-variant-numeric: tabular-nums` (Slider, Textarea counter): functional.
- Icon sizes and stroke widths (`Icon.tsx`, call sites): part of the icon set, not the type scale.
- Component-local layout constants: Dialog widths, Slider geometry (`slider-fill: 2px` equals `--ds-border-width-strong`), Checkbox box sizes.
- Spacing outside the 4 px scale found during the inventory, reported for a later cleanup, not themed: `gap: 6px` in Checkbox.css:200 and Textarea.css:87, Tailwind `gap-1.5` in Input.tsx:102 and Tag.tsx:40.

## Dark mode

`[data-theme="dark"]` overrides the 30 color roles and sets `color-scheme: dark` (native scrollbars, form controls, autofill). Fonts, type, radius, shadow and shape stay at their defaults, so dark Wireframe is the same system with the ground inverted: near-black ground, light-gray text, near-white ink and action, the same muted green and red for feedback. Values and the full role table are under Token requests. Canvas section 09 shows the component set; section 11 shows interaction states; section 12 the contrast table.

Principles:

- Mirror the light ramp: ground gray-900 #141414, ink gray-50 #F7F7F7 (not pure white, to soften halation), primary becomes light with dark text on it.
- Reuse existing palette steps wherever a pair passes; only 6 new raw values plus one overlay alpha.
- Status hues: light-mode borders become dark-mode foregrounds and light-mode foregrounds become dark-mode borders; backgrounds are new deep tints.
- Overlay rises to 70 % black: 50 % over an already dark page does not separate the panel.
- Shadows stay `none`; a dark theme that adds shadows needs higher alpha than a light one.
- The text-control rest border passes 3:1 in dark (#737373, 3.9:1); see Accessibility for the light gap.

Contrast, WCAG 2.x relative luminance, computed from the hex values. Text pairs need 4.5:1, UI pairs 3:1. Light column is today's defaults.

| Pair (foreground / background) | Kind | Light | Light ratio | Dark | Dark ratio |
| --- | --- | --- | --- | --- | --- |
| color-text-emphasis / color-background | text | #000000 / #FFFFFF | 21.00 | #F7F7F7 / #141414 | 17.20 |
| color-text-strong / color-background | text | #262626 / #FFFFFF | 15.13 | #E0E0E0 / #141414 | 13.96 |
| color-text / color-background | text | #404040 / #FFFFFF | 10.37 | #C7C7C7 / #141414 | 10.90 |
| color-text-muted / color-background | text | #595959 / #FFFFFF | 7.00 | #A3A3A3 / #141414 | 7.30 |
| color-placeholder / color-background | text | #767676 / #FFFFFF | 4.54 | #8F8F8F / #141414 | 5.70 |
| color-placeholder / color-surface-subtle (disabled field text) | text (disabled, exempt) | #767676 / #F7F7F7 | 4.24 | #8F8F8F / #1F1F1F | 5.10 |
| color-text-emphasis / color-fill (hover) | text | #000000 / #EEEEEE | 18.10 | #F7F7F7 / #262626 | 14.13 |
| color-text-strong / color-fill (subtle tag) | text | #262626 / #EEEEEE | 13.04 | #E0E0E0 / #262626 | 11.46 |
| color-primary-contrast / color-primary | text | #FFFFFF / #000000 | 21.00 | #141414 / #F7F7F7 | 17.20 |
| color-primary-contrast / color-primary-hover | text | #FFFFFF / #262626 | 15.13 | #141414 / #E0E0E0 | 13.96 |
| color-text-inverse / color-inverse | text | #FFFFFF / #141414 | 18.42 | #141414 / #EEEEEE | 15.88 |
| color-info / color-info-bg | text | #404040 / #F7F7F7 | 9.68 | #C7C7C7 / #1F1F1F | 9.75 |
| color-text / color-info-bg (alert body) | text | #404040 / #F7F7F7 | 9.68 | #C7C7C7 / #1F1F1F | 9.75 |
| color-success / color-success-bg | text | #2E6B45 / #EDF5EF | 5.72 | #9CC7AB / #13261A | 8.46 |
| color-text / color-success-bg (alert body) | text | #404040 / #EDF5EF | 9.34 | #C7C7C7 / #13261A | 9.41 |
| color-success / color-background | text | #2E6B45 / #FFFFFF | 6.35 | #9CC7AB / #141414 | 9.80 |
| color-error / color-error-bg | text | #A3302B / #FBEDEC | 6.11 | #E3AAA6 / #2D1414 | 8.65 |
| color-text-strong / color-error-bg (alert body) | text | #262626 / #FBEDEC | 13.28 | #E0E0E0 / #2D1414 | 13.02 |
| color-error / color-background (field error text) | text | #A3302B / #FFFFFF | 6.97 | #E3AAA6 / #141414 | 9.27 |
| color-primary-contrast / color-error (invalid checked mark) | UI | #FFFFFF / #A3302B | 6.97 | #141414 / #E3AAA6 | 9.27 |
| color-border-strong / color-background | UI | #000000 / #FFFFFF | 21.00 | #F7F7F7 / #141414 | 17.20 |
| color-icon / color-background | UI | #000000 / #FFFFFF | 21.00 | #F7F7F7 / #141414 | 17.20 |
| color-focus / color-background | UI | #000000 / #FFFFFF | 21.00 | #F7F7F7 / #141414 | 17.20 |
| color-primary / color-background (checked box, range, solid button) | UI | #000000 / #FFFFFF | 21.00 | #F7F7F7 / #141414 | 17.20 |
| color-error / color-surface (invalid border) | UI | #A3302B / #FFFFFF | 6.97 | #E3AAA6 / #141414 | 9.27 |
| color-placeholder / color-background (slider track) | UI | #767676 / #FFFFFF | 4.54 | #8F8F8F / #141414 | 5.70 |
| color-text-muted / color-background (tag remove icon) | UI | #595959 / #FFFFFF | 7.00 | #A3A3A3 / #141414 | 7.30 |
| color-border / color-surface (text-control rest border) | UI | #C7C7C7 / #FFFFFF | **1.69** (known gap, unchanged) | #737373 / #141414 | 3.89 |
| color-disabled / color-background | UI (disabled, exempt) | #A3A3A3 / #FFFFFF | 2.52 | #595959 / #141414 | 2.63 |
| color-placeholder / color-divider (disabled primary button) | text (disabled, exempt) | #767676 / #E0E0E0 | 3.44 | #8F8F8F / #333333 | 3.91 |
| color-divider / color-background | decorative | #E0E0E0 / #FFFFFF | 1.32 | #333333 / #141414 | 1.46 |
| status borders / status bg | decorative (alert identified by icon, title and fill) | e.g. #9CC7AB / #EDF5EF | 1.69 | #2E6B45 / #13261A, #A3302B / #2D1414, #595959 / #1F1F1F | 2.50, 2.47, 2.35 |

## Consumer override contract

How a product themes the library.

1. Load the library styles (they define `:root, [data-theme="default"]` and `[data-theme="dark"]`).
2. Write a block that sets only role tokens, after the library CSS (equal specificity, so source order wins; DS-27 should ship tokens in a cascade layer so consumer CSS always wins regardless of order):

   ```css
   [data-theme="acme"] {
     --ds-color-primary: #be185d;
     --ds-color-primary-hover: #9d174d;
     --ds-color-primary-contrast: #ffffff;
   }
   ```

   Font, type, radius, shadow and the remaining new color roles are set the same way once DS-27 lands; their names are under Token requests.
3. Put `data-theme="acme"` on `html` (whole app) or any element (scoped). Roles not set inherit from the default theme. A dark variant of a consumer theme is a second block, e.g. `[data-theme="acme-dark"]`, starting from the dark values.

Rules:

- Only the 87 roles are public. Do not set palette primitives, spacing, `--ds-color-ink`, `--ds-font-text`, `--ds-font-family`, `--ds-radius` or component-local properties; they are not API and may change.
- Override pairs together: primary + primary-hover + primary-contrast; inverse + text-inverse; each status triple; background with every text role it carries. The pairs and minimum ratios are listed under Accessibility; `createTheme()` (DS-28) checks them.
- Status colors stay feedback-only and keep icon and label; a theme may retint them but not remove the icon or the "Error:" prefix.
- Keep focus visible (see Keyboard) and `--ds-control-height` at 40px or more.
- No `!important`, no component selectors in themes. If something cannot be themed through a role, that is a contract gap: file it, do not patch the component.

`createTheme()` (DS-28) fill guide: from a brand color generate a 50–900 OKLCH scale; light theme takes primary from the darkest step that gives 4.5:1 with white (typically 700–900), primary-hover one step darker, color-focus equal to primary; dark theme takes primary from a light step (100–200) with primary-contrast from 900. Neutral roles map to the neutral scale exactly as the gray ramp does today (light: background 0, surface-subtle 50, fill 100, divider 200, border 300, disabled 400, placeholder 500, text-muted 600, text 700, text-strong 800, inverse 900; dark: the values under Token requests). Optionally the neutral ramp is mixed toward the brand hue, so one brand color also tints ground, fills, borders, text and ink (canvas section 03 shows this with a magenta brand: blush ground, plum ink). Then run the pair checks.

## Accessibility

Theming has no roles or labels of its own. It owns contrast and focus visibility for every component.

- Required pairs (any theme, any mode): every text role on every ground it sits on ≥ 4.5:1 (color-text-emphasis, text-strong, text, text-muted, placeholder on background, surface, fill, and the status backgrounds); primary-contrast on primary and primary-hover ≥ 4.5:1; text-inverse on inverse ≥ 4.5:1; each status fg on its bg and on background ≥ 4.5:1; UI ≥ 3:1 for color-border-strong, color-icon, color-focus, primary (as fill next to background), error (invalid border) and placeholder (slider track) against background and surface. Disabled roles are exempt (WCAG 1.4.3 / 1.4.11 inactive components). Divider and status borders are decorative.
- Default and dark values meet every required pair (table in Dark mode).
- Known gap kept for Wireframe parity: the light text-control rest border `--ds-color-border` #C7C7C7 is 1.69:1 on white, under the 3:1 of WCAG 1.4.11. Fields stay identifiable by their visible label and the hover / focus border, but a stronger default would change today's look, which this task must not do. Dark already passes (3.89:1). Flagged as an open question.
- Color is never the only signal: status keeps icon and label, invalid keeps the 2 px border and "Error:" text, checked keeps the mark. A theme cannot remove these.
- `prefers-reduced-motion` still removes transitions whatever `--ds-motion` is set to; `forced-colors: active` keeps outlines.
- Tests (DS-27): `jest-axe` cannot measure color contrast in jsdom, so add a deterministic unit test that parses `tokens.css`, resolves the default and dark blocks, and asserts every required pair above with the WCAG formula. Keep `jest-axe` checks for each component rendered inside `data-theme="dark"` (no ARIA regressions, focus ring present via `toHaveStyle` on `:focus-visible` where feasible). Extend `semanticColors.test.ts` to forbid `--ds-color-ink` in components once migrated, and add a check that component CSS sets no literal `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-transform` or `box-shadow` values.

## Open questions

1. Line-heights: the spec picks the component CSS / README values (body 26px, caption 20px, h3 29px, label 16px) over the Tailwind ratios, causing the sub-pixel deltas listed in Sizes. Accept, or keep the Tailwind ratios and move the components by 0.5 px instead?
2. Light input rest border at 1.69:1 (see Accessibility). Keep for parity now, and decide in DS-2 or a follow-up?
3. Alert title on `font-label` (UI font) rather than `font-heading`. A theme with a serif heading font keeps alert titles in the UI font. OK?
4. Radius and shadow assignment per component (Sizes): badge, slider track and thumb on `radius-full`; alert and dialog on `radius-lg`; thumb `shadow-sm`, bubbles `shadow-md`, dialog `shadow-lg`. Confirm.
5. Dark mode activation: explicit `data-theme="dark"` only (proposed), or also follow `prefers-color-scheme` automatically?
6. Dark raw values as literal hex in the dark block (proposed), or as new palette steps (gray-850 #1F1F1F, gray-750 #333333, gray-550 #737373, gray-450 #8F8F8F)?
7. Portaled content under scoped themes (see Radix): propagate `data-theme` automatically in DS-27, or document `html`-only themes for now?

## Token requests

54 new role tokens, 1 deprecated alias redefinition, and a dark block with 7 new raw values. All new roles default to values that reproduce today's look. Full CSS names below.

### A. Color roles (6 new)

| Token | Light default | Dark | Why |
| --- | --- | --- | --- |
| `--ds-color-text-emphasis` | `var(--ds-color-black)` #000000 | #F7F7F7 (`--ds-color-gray-50`) | text uses of `--ds-color-ink` (titles, labels, values, current item); a theme can soften ink text without touching borders |
| `--ds-color-text-inverse` | `var(--ds-color-white)` #FFFFFF | #141414 (`--ds-color-gray-900`) | text on `--ds-color-inverse`; today it borrows `--ds-color-primary-contrast`, which breaks once primary is a brand color |
| `--ds-color-border-strong` | `var(--ds-color-black)` #000000 | #F7F7F7 | border uses of `--ds-color-ink` |
| `--ds-color-icon` | `var(--ds-color-black)` #000000 | #F7F7F7 | icon uses of `--ds-color-ink` |
| `--ds-color-focus` | `var(--ds-color-black)` #000000 | #F7F7F7 | outline uses of `--ds-color-ink`; brand themes often tint the ring |
| `--ds-color-overlay` | `rgb(0 0 0 / 0.5)` | `rgb(0 0 0 / 0.7)` | modal scrim (also requested in the Dialog spec); replaces `color-mix` on ink, which would turn white in dark |

### B. Font roles (3 new)

| Token | Default | Why |
| --- | --- | --- |
| `--ds-font-heading` | `var(--ds-font-mono)` | headings separate from UI labels and numerals |
| `--ds-font-body` | `var(--ds-font-text)` | body; replaces `--ds-font-text` / `--ds-font-family` as the role components read |
| `--ds-font-label` | `var(--ds-font-mono)` | UI text (buttons, labels, tags, breadcrumb, alert title) |

### C. Font weights (3 new)

| Token | Default |
| --- | --- |
| `--ds-font-weight-regular` | 400 |
| `--ds-font-weight-medium` | 500 |
| `--ds-font-weight-bold` | 700 |

### D. Type scale (36 new)

| Token | Default | | Token | Default |
| --- | --- | --- | --- | --- |
| `--ds-text-display-size` | 4.5rem | | `--ds-text-body-size` | 1rem |
| `--ds-text-display-line-height` | 1 | | `--ds-text-body-line-height` | 26px |
| `--ds-text-display-tracking` | -0.04em | | `--ds-text-body-sm-size` | 0.9375rem |
| `--ds-text-h1-size` | 3rem | | `--ds-text-body-sm-line-height` | 24px |
| `--ds-text-h1-line-height` | 1.1 | | `--ds-text-body-xs-size` | 0.875rem |
| `--ds-text-h1-tracking` | -0.03em | | `--ds-text-body-xs-line-height` | 1.5 |
| `--ds-text-h2-size` | 2rem | | `--ds-text-caption-size` | 0.8125rem |
| `--ds-text-h2-line-height` | 1.2 | | `--ds-text-caption-line-height` | 20px |
| `--ds-text-h2-tracking` | -0.02em | | `--ds-text-label-size` | 0.75rem |
| `--ds-text-h3-size` | 1.375rem | | `--ds-text-label-line-height` | 16px |
| `--ds-text-h3-line-height` | 29px | | `--ds-text-label-weight` | `var(--ds-font-weight-medium)` |
| `--ds-text-h3-tracking` | 0 | | `--ds-text-label-tracking` | 0.08em |
| `--ds-text-heading-weight` | `var(--ds-font-weight-medium)` | | `--ds-text-label-transform` | uppercase |
| `--ds-text-heading-transform` | none | | `--ds-text-ui-size` | 0.875rem |
| `--ds-text-body-lg-size` | 1.125rem | | `--ds-text-ui-line-height` | 20px |
| `--ds-text-body-lg-line-height` | 1.6 | | `--ds-text-ui-weight` | `var(--ds-font-weight-medium)` |
| | | | `--ds-text-ui-sm-size` | 0.75rem |
| | | | `--ds-text-ui-sm-line-height` | 16px |
| | | | `--ds-text-ui-xs-size` | 0.6875rem |
| | | | `--ds-text-ui-xs-line-height` | 16px |

Why: no type tokens exist today; values are scattered across Tailwind `@theme` literals and component CSS literals (inventory under Tokens). New raw values: 0.9375rem (15px), 0.875rem (14px, today Tailwind `text-sm`), 0.6875rem (11px, today `text-[11px]`); all others already appear in `tailwind.css` or component CSS.

### E. Radius (3 new)

| Token | Default | Why |
| --- | --- | --- |
| `--ds-radius-sm` | `var(--ds-radius)` (0) | small parts |
| `--ds-radius-lg` | `var(--ds-radius)` (0) | containers |
| `--ds-radius-full` | `var(--ds-radius)` (0) | pills / round parts; themes set 9999px |

### F. Shadow (3 new)

| Token | Default | Why |
| --- | --- | --- |
| `--ds-shadow-sm` | none | thumb |
| `--ds-shadow-md` | none | floating bubbles |
| `--ds-shadow-lg` | none | dialog panel |

Example values used only to illustrate the knob on the canvas (not requested as defaults): `0 1px 2px rgb(0 0 0 / 0.12)`, `0 4px 12px rgb(0 0 0 / 0.14)`, `0 16px 40px rgb(0 0 0 / 0.2)`.

### G. Dark mode block

`[data-theme="dark"] { color-scheme: dark; … }` with:

| Token | Light (today) | Dark |
| --- | --- | --- |
| `--ds-color-background` | #FFFFFF | #141414 (`--ds-color-gray-900`) |
| `--ds-color-surface` | #FFFFFF | #141414 (`--ds-color-gray-900`) |
| `--ds-color-surface-subtle` | #F7F7F7 | **#1F1F1F** (new raw) |
| `--ds-color-fill` | #EEEEEE | #262626 (`--ds-color-gray-800`) |
| `--ds-color-divider` | #E0E0E0 | **#333333** (new raw) |
| `--ds-color-border` | #C7C7C7 | **#737373** (new raw) |
| `--ds-color-disabled` | #A3A3A3 | #595959 (`--ds-color-gray-600`) |
| `--ds-color-placeholder` | #767676 | **#8F8F8F** (new raw) |
| `--ds-color-text-muted` | #595959 | #A3A3A3 (`--ds-color-gray-400`) |
| `--ds-color-text` | #404040 | #C7C7C7 (`--ds-color-gray-300`) |
| `--ds-color-text-strong` | #262626 | #E0E0E0 (`--ds-color-gray-200`) |
| `--ds-color-text-emphasis` | #000000 | #F7F7F7 (`--ds-color-gray-50`) |
| `--ds-color-text-inverse` | #FFFFFF | #141414 (`--ds-color-gray-900`) |
| `--ds-color-border-strong` | #000000 | #F7F7F7 |
| `--ds-color-icon` | #000000 | #F7F7F7 |
| `--ds-color-focus` | #000000 | #F7F7F7 |
| `--ds-color-overlay` | rgb(0 0 0 / 0.5) | **rgb(0 0 0 / 0.7)** (new raw) |
| `--ds-color-inverse` | #141414 | #EEEEEE (`--ds-color-gray-100`) |
| `--ds-color-primary` | #000000 | #F7F7F7 |
| `--ds-color-primary-hover` | #262626 | #E0E0E0 |
| `--ds-color-primary-contrast` | #FFFFFF | #141414 |
| `--ds-color-info` | #404040 | #C7C7C7 |
| `--ds-color-info-border` | #C7C7C7 | #595959 |
| `--ds-color-info-bg` | #F7F7F7 | #1F1F1F |
| `--ds-color-success` | #2E6B45 | #9CC7AB (today's success-border) |
| `--ds-color-success-border` | #9CC7AB | #2E6B45 (today's success fg) |
| `--ds-color-success-bg` | #EDF5EF | **#13261A** (new raw) |
| `--ds-color-error` | #A3302B | #E3AAA6 (today's error-border) |
| `--ds-color-error-border` | #E3AAA6 | #A3302B (today's error fg) |
| `--ds-color-error-bg` | #FBEDEC | **#2D1414** (new raw) |
| `--ds-color-ink` (deprecated alias) | #000000 | follows `--ds-color-text-emphasis` |

New raw values needing approval: #1F1F1F, #333333, #737373, #8F8F8F, #13261A, #2D1414, rgb(0 0 0 / 0.7). Contrast ratios for every pair are in the Dark mode section.

### H. Changes to existing tokens

- `--ds-color-ink`: redefine as `var(--ds-color-text-emphasis)` and mark deprecated; components stop reading it (DS-27), themes do not set it.
- `--ds-font-family`: redefine as `var(--ds-font-body)` (legacy alias).
- `--ds-radius-md`: unchanged value, now one step of the public radius scale.

### I. Tailwind utilities to add in DS-27 (no new raw values)

`text-emphasis`, `text-inverse`, `border-strong`, `text-icon`, `bg-overlay`, `focus-ring` reading `--ds-color-focus`; `font-heading`, `font-label` (and `font-sans` reading `--ds-font-body`); `rounded-sm`, `rounded-lg`, `rounded-full`; `shadow-sm`, `shadow-md`, `shadow-lg`; `text-body-sm`, `text-body-xs`, `text-ui`, `text-ui-sm`, `text-ui-xs` beside the existing type utilities, all reading the roles above.
