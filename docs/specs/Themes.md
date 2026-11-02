# Themes

- task: DS-2
- canvas: docs/design-system-wireframe/Themes.dc.html
- canvas_url: https://claude.ai/artifact/1PkVgkht4TuQFLdxmoxxTj
- approved: yes
- approved_by: mikespin
- approved_at: 2026-11-02
- approval_hash:

The example themes built on the DS-26 theme contract (docs/specs/Theming.md). They prove a consumer can change the whole look through roles alone.

| Theme | Selector | What it is |
| --- | --- | --- |
| `default` | `:root`, `[data-theme="default"]` | Today's gray Wireframe, unchanged. Reference only, not redesigned here. |
| `dark` | `[data-theme="dark"]` | Dark mode of Wireframe. All 30 DS-27 color values are kept (each required pair passes, see Accessibility). One refinement: photos are dimmed. |
| `bold` | `[data-theme="bold"]` | A different system: saturated ultramarine brand #4318D1, lavender ground and indigo ink (no gray neutrals), Bricolage Grotesque / Figtree / IBM Plex Mono, heavy uppercase headings with sentence-case labels, 8 / 14 / 24 / full corners, hard offset shadows, 2 px lines, 48 px controls, color photography. |
| `bold-dark` | `[data-theme="bold-dark"]` | Dark mode of bold. Same fonts, type, radius and shape. Indigo night ground #120D2E with a raised surface #19133A, light violet brand #A08CFF with dark text on it, black and brand-colored shadows. |

Every canvas panel renders the same markup with the same component CSS. The only difference between panels is the role block on the panel root. No component changes, no new roles.

Naming: full custom-property names are used for roles; every one exists in `src/styles/tokens.css`. Raw values and font families that are new to the library are listed under Token requests.

## Sizes

Themes add no component sizes. Each theme sets its own density, type scale, radius and line weight through the existing roles. Canvas sections 05 and 06.

### Density and line weight

| Role | default | dark | bold | bold-dark |
| --- | --- | --- | --- | --- |
| `--ds-control-height` | 44px | 44px | 48px | 48px |
| `--ds-border-width` | 1px | 1px | 2px | 2px |
| `--ds-border-width-strong` | 2px | 2px | 3px | 3px |
| `--ds-focus-width` | 2px | 2px | 3px | 3px |
| `--ds-focus-offset` | 2px | 2px | 2px | 2px |

Spacing is not themeable (DS-26), so density comes from control height and type size only. 48px stays above the 40px minimum in the contract. The checkbox row follows `--ds-control-height` and `--ds-text-body-line-height`, so its pad becomes (48 − 28) / 2 = 10px in bold, which the component derives itself.

### Type scale

`default` and `dark` share the Wireframe scale. `bold` and `bold-dark` share the bold scale. Sizes in px at a 16px root.

| Style | Wireframe size / line-height | Wireframe tracking, transform | bold size / line-height | bold tracking, transform |
| --- | --- | --- | --- | --- |
| display | 72 / 72 | -0.04em, none | 80 / 76 (5rem / 0.95) | -0.02em, uppercase |
| h1 | 48 / 52.8 | -0.03em, none | 56 / 56 (3.5rem / 1) | -0.015em, uppercase |
| h2 | 32 / 38.4 | -0.02em, none | 36 / 39.6 (2.25rem / 1.1) | -0.01em, uppercase |
| h3 (dialog title) | 22 / 29 | 0, none | 24 / 28 (1.5rem / 28px) | 0, uppercase |
| heading weight | 500 | | 800 | |
| body-lg | 18 / 28.8 | | 20 / 30 (1.25rem / 1.5) | |
| body | 16 / 26 | | 17 / 28 (1.0625rem / 28px) | |
| body-sm | 15 / 24 | | 16 / 24 (1rem / 24px) | |
| body-xs (alert body) | 14 / 21 | | 15 / 22.5 (0.9375rem / 1.5) | |
| caption | 13 / 20 | | 14 / 20 (0.875rem / 20px) | |
| label | 12 / 16, weight 500 | 0.08em, uppercase | 14 / 20, weight 700 | 0.01em, none |
| ui (buttons, alert title) | 14 / 20, weight 500 | | 16 / 24, weight 700 | |
| ui-sm (tags, marks, bubble) | 12 / 16 | | 13 / 18 | |
| ui-xs (badge) | 11 / 16 | | 12 / 16 | |

bold reverses Wireframe's case logic. Wireframe has mono headings in mixed case and uppercase, widely tracked mono labels. bold has heavy uppercase grotesque headings and bold sentence-case labels. Font weights in bold are regular 400, medium 600, bold 700. The heading weight is 800, the only weight Bricolage Grotesque needs above 700.

### Radius and shadow

| Step | default, dark | bold | bold-dark | Used by (DS-26) |
| --- | --- | --- | --- | --- |
| `--ds-radius-sm` | 0 | 8px | 8px | checkbox box, tag, dialog close, slider bubble |
| `--ds-radius-md` | 0 | 14px | 14px | button, icon button, input, textarea, steppers |
| `--ds-radius-lg` | 0 | 24px | 24px | alert, dialog panel |
| `--ds-radius-full` | 0 | 9999px | 9999px | badge, slider track, range, thumb |
| `--ds-shadow-sm` | none | `0 2px 0 #140e3d` | `0 2px 0 rgb(0 0 0 / 0.6)` | slider thumb |
| `--ds-shadow-md` | none | `0 4px 0 #140e3d` | `0 4px 0 rgb(0 0 0 / 0.6)` | slider bubble, bubble input |
| `--ds-shadow-lg` | none | `8px 8px 0 #140e3d` | `8px 8px 0 #4318d1` | dialog panel |

bold shadows are solid offsets with no blur, in ink, so depth reads as print rather than light. Ink shadows disappear on a dark ground, so bold-dark uses 60 % black for small parts and a brand-colored offset for the dialog. Buttons, inputs, alerts and tags stay flat in every theme (DS-26).

## States

### Theme states

| State | Trigger | What changes |
| --- | --- | --- |
| default | no attribute, or `data-theme="default"` | nothing; Wireframe as shipped |
| dark | `data-theme="dark"` | 30 color roles (DS-27 values), `color-scheme: dark`, `--ds-photo-filter` dimmed to 85 % brightness; fonts, type, radius, shadow and shape stay Wireframe |
| bold | `data-theme="bold"` | every role group: 30 color roles (24 new values, status triples kept), 4 fonts, medium weight, 36 type-scale roles, 4 radius, 3 shadow, and 5 shape roles (border widths, focus width, control height, motion, photo filter) |
| bold-dark | `data-theme="bold-dark"` | the bold non-color roles, the bold-dark color roles, dark shadows, `color-scheme: dark`, `--ds-photo-filter: brightness(0.9)`. Self-contained: works on its own, not only nested inside `bold` |
| Scoped | `data-theme` on any subtree | as in DS-26; portaled content follows the theme on `html` (DS-27 portal rule) |

### Interaction states per theme

These are the values each state resolves to, using the DS-26 state-to-role mapping. Canvas section 02 has one artboard per theme with rest, hover, focus-visible, disabled, invalid and checked.

| State | Part (role) | default | dark | bold | bold-dark |
| --- | --- | --- | --- | --- | --- |
| Primary rest | fill + border (`--ds-color-primary`) / text (`--ds-color-primary-contrast`) | #000000 / #FFFFFF | #F7F7F7 / #141414 | #4318D1 / #FFFFFF | #A08CFF / #120D2E |
| Primary hover | fill + border (`--ds-color-primary-hover`) | #262626 | #E0E0E0 | #3510A8 | #8B73FF |
| Primary disabled | fill (`--ds-color-divider`) / text (`--ds-color-placeholder`) | #E0E0E0 / #767676 | #333333 / #8F8F8F | #D5CCF5 / #63579A | #3A3170 / #9A90D6 |
| Secondary rest | border (`--ds-color-border-strong`), fill (`--ds-color-surface`), text (`--ds-color-text-emphasis`) | #000000, #FFFFFF, #000000 | #F7F7F7, #141414, #F7F7F7 | #140E3D 2px, #FFFFFF, #140E3D | #F5F3FF 2px, #19133A, #F5F3FF |
| Secondary hover | fill (`--ds-color-fill`) | #EEEEEE | #262626 | #E3DCFB | #2A2259 |
| Secondary disabled | border (`--ds-color-border`) / text (`--ds-color-placeholder`) | #C7C7C7 / #767676 | #737373 / #8F8F8F | #8478B8 / #63579A | #7C70C2 / #9A90D6 |
| Input rest | border (`--ds-color-border`), value (`--ds-color-text-emphasis`), placeholder (`--ds-color-placeholder`) | #C7C7C7 1px, #000000, #767676 | #737373 1px, #F7F7F7, #8F8F8F | #8478B8 2px, #140E3D, #63579A | #7C70C2 2px, #F5F3FF, #9A90D6 |
| Input hover, focus | border (`--ds-color-border-strong`) | #000000 | #F7F7F7 | #140E3D | #F5F3FF |
| Input invalid | border (`--ds-color-error`) at `--ds-border-width-strong`, message `--ds-color-error` | #A3302B 2px | #E3AAA6 2px | #A3302B 3px | #E3AAA6 3px |
| Input disabled | border (`--ds-color-divider`), fill (`--ds-color-surface-subtle`), text (`--ds-color-placeholder`) | #E0E0E0, #F7F7F7, #767676 | #333333, #1F1F1F, #8F8F8F | #D5CCF5, #EBE6FC, #63579A | #3A3170, #211A4A, #9A90D6 |
| Checkbox rest | box border (`--ds-color-border-strong`) at strong width | #000000 2px | #F7F7F7 2px | #140E3D 3px | #F5F3FF 3px |
| Checkbox checked | fill (`--ds-color-primary`), mark (`--ds-color-primary-contrast`) | #000000, #FFFFFF | #F7F7F7, #141414 | #4318D1, #FFFFFF | #A08CFF, #120D2E |
| Checkbox invalid checked | fill (`--ds-color-error`), mark (`--ds-color-primary-contrast`) | #A3302B, #FFFFFF | #E3AAA6, #141414 | #A3302B, #FFFFFF | #E3AAA6, #120D2E |
| Checkbox disabled | border and checked fill (`--ds-color-disabled`), fill (`--ds-color-surface-subtle`) | #A3A3A3, #F7F7F7 | #595959, #1F1F1F | #B3AAD9, #EBE6FC | #4D4485, #211A4A |
| Focus-visible (all) | outline (`--ds-color-focus`, `--ds-focus-width`, `--ds-focus-offset`) | #000000 2 / 2 | #F7F7F7 2 / 2 | #4318D1 3 / 2 | #A08CFF 3 / 2 |
| Slider | track (`--ds-color-placeholder`), range (`--ds-color-primary`), thumb (`--ds-color-border-strong` + `--ds-shadow-sm`), bubble (`--ds-color-inverse` / `--ds-color-text-inverse` + `--ds-shadow-md`) | square, flat | square, flat | round thumb with ink drop, indigo bubble #140E3D / #F4F1FF | round, black drop, lavender bubble #E3DFFA / #120D2E |
| Dialog open | scrim (`--ds-color-overlay`), panel (`--ds-color-surface`, `--ds-color-border-strong`, `--ds-radius-lg`, `--ds-shadow-lg`) | 50 % black, square, flat | 70 % black, square, flat | 60 % indigo, 24px, 8/8 ink offset | 75 % night, 24px, 8/8 brand offset |
| Alert | status triple + `--ds-radius-lg` + `--ds-border-width` | square, 1px | square, 1px | 24px, 2px | 24px, 2px |
| Tags | solid (`--ds-color-primary`), subtle (`--ds-color-fill` / `--ds-color-text-strong`), outline (`--ds-color-border-strong`) | square | square | 8px corners, ultramarine solid | 8px corners, violet solid |

## Keyboard

Themes add no keys and do not change keyboard behavior. Focus order, roving focus and every binding come from the components and Radix. A theme only changes values, never `display`, `order` or `tabindex`. Canvas section 03 shows focus-visible on every focusable part of the set (primary and secondary button, text field, checkbox, slider thumb, dialog close) in all four themes.

| Theme | Ring (`--ds-color-focus`) | Width / offset | vs background | vs surface |
| --- | --- | --- | --- | --- |
| default | #000000 | 2px / 2px | 21.00 | 21.00 |
| dark | #F7F7F7 | 2px / 2px | 17.20 | 17.20 |
| bold | #4318D1 (brand) | 3px / 2px | 8.24 | 9.17 |
| bold-dark | #A08CFF (brand) | 3px / 2px | 6.85 | 6.43 |

- In bold the ring color is the primary color, so a focused primary button shows a ring of its own fill. The 2px gap shows the ground between them, which separates them. Wireframe uses the same pattern with black.
- Switching `data-theme` at runtime is pure CSS: no re-mount, focus stays where it is.
- Outlines follow `border-radius`, so the ring stays concentric with bold's 14px and 9999px corners.

## Radix

None. Themes are role-value blocks on the DS-26 contract. There is no primitive to build on, and Radix Themes is not used. Components keep styling Radix state attributes through roles only, so no theme needs Radix-specific selectors. Portaled content (Dialog, Popover, Select, Tooltip) picks up a theme set on `html`. Scoped themes follow the DS-27 portal rule.

## Tokens

### Every role per theme

All 87 contract roles. The default column is today's `tokens.css`. The dark column shows the shipped DS-27 values plus the one refinement (`--ds-photo-filter`). bold-dark repeats the bold non-color values so that its block is self-contained.

#### Color (30)

| Role | default | dark | bold | bold-dark |
| --- | --- | --- | --- | --- |
| `--ds-color-background` | #FFFFFF | #141414 | #F4F1FF | #120D2E |
| `--ds-color-surface` | #FFFFFF | #141414 | #FFFFFF | #19133A |
| `--ds-color-surface-subtle` | #F7F7F7 | #1F1F1F | #EBE6FC | #211A4A |
| `--ds-color-fill` | #EEEEEE | #262626 | #E3DCFB | #2A2259 |
| `--ds-color-divider` | #E0E0E0 | #333333 | #D5CCF5 | #3A3170 |
| `--ds-color-border` | #C7C7C7 | #737373 | #8478B8 | #7C70C2 |
| `--ds-color-disabled` | #A3A3A3 | #595959 | #B3AAD9 | #4D4485 |
| `--ds-color-placeholder` | #767676 | #8F8F8F | #63579A | #9A90D6 |
| `--ds-color-text-muted` | #595959 | #A3A3A3 | #554A8A | #B3ABE6 |
| `--ds-color-text` | #404040 | #C7C7C7 | #2F2766 | #D2CCF5 |
| `--ds-color-text-strong` | #262626 | #E0E0E0 | #221B52 | #E3DFFA |
| `--ds-color-text-emphasis` | #000000 | #F7F7F7 | #140E3D | #F5F3FF |
| `--ds-color-text-inverse` | #FFFFFF | #141414 | #F4F1FF | #120D2E |
| `--ds-color-border-strong` | #000000 | #F7F7F7 | #140E3D | #F5F3FF |
| `--ds-color-icon` | #000000 | #F7F7F7 | #140E3D | #F5F3FF |
| `--ds-color-focus` | #000000 | #F7F7F7 | #4318D1 | #A08CFF |
| `--ds-color-overlay` | rgb(0 0 0 / 0.5) | rgb(0 0 0 / 0.7) | rgb(20 14 61 / 0.6) | rgb(8 5 26 / 0.75) |
| `--ds-color-inverse` | #141414 | #EEEEEE | #140E3D | #E3DFFA |
| `--ds-color-primary` | #000000 | #F7F7F7 | #4318D1 | #A08CFF |
| `--ds-color-primary-hover` | #262626 | #E0E0E0 | #3510A8 | #8B73FF |
| `--ds-color-primary-contrast` | #FFFFFF | #141414 | #FFFFFF | #120D2E |
| `--ds-color-info` | #404040 | #C7C7C7 | #2F2766 | #D2CCF5 |
| `--ds-color-info-border` | #C7C7C7 | #595959 | #D5CCF5 | #4D4485 |
| `--ds-color-info-bg` | #F7F7F7 | #1F1F1F | #EBE6FC | #211A4A |
| `--ds-color-success` | #2E6B45 | #9CC7AB | #2E6B45 | #9CC7AB |
| `--ds-color-success-border` | #9CC7AB | #2E6B45 | #9CC7AB | #2E6B45 |
| `--ds-color-success-bg` | #EDF5EF | #13261A | #EDF5EF | #13261A |
| `--ds-color-error` | #A3302B | #E3AAA6 | #A3302B | #E3AAA6 |
| `--ds-color-error-border` | #E3AAA6 | #A3302B | #E3AAA6 | #A3302B |
| `--ds-color-error-bg` | #FBEDEC | #2D1414 | #FBEDEC | #2D1414 |

How bold's color is built:

- **Brand.** Ultramarine #4318D1 (about hue 255 in HSL, fully saturated). White on it measures 9.17, and it measures 8.24 against the ground, so it serves as primary, focus ring, checked fill, slider range, solid tag and badge. Hover goes one step deeper, to #3510A8. In dark, the brand turns light (#A08CFF), carries dark text (6.85), and hover goes more saturated (#8B73FF, 5.34).
- **Tinted neutrals.** Every neutral is tinted toward the brand hue; none is gray. Light: lavender ground #F4F1FF, lilac fills and dividers, slate-violet border and placeholder, indigo text ramp ending in ink #140E3D. Dark: indigo night #120D2E, with surfaces and fills stepping up in the same hue and a lavender text ramp ending in #F5F3FF.
- **Surface vs ground.** bold puts white controls and panels on a lavender ground, so they lift off the page. bold-dark raises the surface one step above the ground (#19133A on #120D2E) for the same reason. Wireframe keeps surface equal to background.
- **Border.** The field rest border passes 3:1 in both bold modes (3.92 / 4.14 on surface), so bold does not inherit Wireframe's 1.69 gap.
- **Status.** The status triples keep the Wireframe hues and their dark-mode swaps. Feedback stays muted green and red, so it never reads as brand. These are also the values createTheme() emits.

#### Font (4)

| Role | default, dark | bold, bold-dark |
| --- | --- | --- |
| `--ds-font-heading` | var(`--ds-font-mono`) Red Hat Mono | 'Bricolage Grotesque', 'Arial Black', system-ui, sans-serif |
| `--ds-font-body` | 'Red Hat Text', system-ui, sans-serif | 'Figtree', system-ui, sans-serif |
| `--ds-font-label` | var(`--ds-font-mono`) Red Hat Mono | 'Figtree', system-ui, sans-serif |
| `--ds-font-mono` | 'Red Hat Mono', ui-monospace, monospace | 'IBM Plex Mono', ui-monospace, monospace |

#### Font weight (3)

| Role | default, dark | bold, bold-dark |
| --- | --- | --- |
| `--ds-font-weight-regular` | 400 | 400 |
| `--ds-font-weight-medium` | 500 | 600 |
| `--ds-font-weight-bold` | 700 | 700 |

#### Type scale (36)

| Role | default, dark | bold, bold-dark |
| --- | --- | --- |
| `--ds-text-display-size` | 4.5rem | 5rem |
| `--ds-text-display-line-height` | 1 | 0.95 |
| `--ds-text-display-tracking` | -0.04em | -0.02em |
| `--ds-text-h1-size` | 3rem | 3.5rem |
| `--ds-text-h1-line-height` | 1.1 | 1 |
| `--ds-text-h1-tracking` | -0.03em | -0.015em |
| `--ds-text-h2-size` | 2rem | 2.25rem |
| `--ds-text-h2-line-height` | 1.2 | 1.1 |
| `--ds-text-h2-tracking` | -0.02em | -0.01em |
| `--ds-text-h3-size` | 1.375rem | 1.5rem |
| `--ds-text-h3-line-height` | 29px | 28px |
| `--ds-text-h3-tracking` | 0 | 0 |
| `--ds-text-heading-weight` | var(`--ds-font-weight-medium`) | 800 |
| `--ds-text-heading-transform` | none | uppercase |
| `--ds-text-body-lg-size` | 1.125rem | 1.25rem |
| `--ds-text-body-lg-line-height` | 1.6 | 1.5 |
| `--ds-text-body-size` | 1rem | 1.0625rem |
| `--ds-text-body-line-height` | 26px | 28px |
| `--ds-text-body-sm-size` | 0.9375rem | 1rem |
| `--ds-text-body-sm-line-height` | 24px | 24px |
| `--ds-text-body-xs-size` | 0.875rem | 0.9375rem |
| `--ds-text-body-xs-line-height` | 1.5 | 1.5 |
| `--ds-text-caption-size` | 0.8125rem | 0.875rem |
| `--ds-text-caption-line-height` | 20px | 20px |
| `--ds-text-label-size` | 0.75rem | 0.875rem |
| `--ds-text-label-line-height` | 16px | 20px |
| `--ds-text-label-weight` | var(`--ds-font-weight-medium`) | var(`--ds-font-weight-bold`) |
| `--ds-text-label-tracking` | 0.08em | 0.01em |
| `--ds-text-label-transform` | uppercase | none |
| `--ds-text-ui-size` | 0.875rem | 1rem |
| `--ds-text-ui-line-height` | 20px | 24px |
| `--ds-text-ui-weight` | var(`--ds-font-weight-medium`) | var(`--ds-font-weight-bold`) |
| `--ds-text-ui-sm-size` | 0.75rem | 0.8125rem |
| `--ds-text-ui-sm-line-height` | 16px | 18px |
| `--ds-text-ui-xs-size` | 0.6875rem | 0.75rem |
| `--ds-text-ui-xs-line-height` | 16px | 16px |

#### Radius (4) and shadow (3)

| Role | default, dark | bold | bold-dark |
| --- | --- | --- | --- |
| `--ds-radius-sm` | 0 | 8px | 8px |
| `--ds-radius-md` | 0 | 14px | 14px |
| `--ds-radius-lg` | 0 | 24px | 24px |
| `--ds-radius-full` | 0 | 9999px | 9999px |
| `--ds-shadow-sm` | none | 0 2px 0 #140e3d | 0 2px 0 rgb(0 0 0 / 0.6) |
| `--ds-shadow-md` | none | 0 4px 0 #140e3d | 0 4px 0 rgb(0 0 0 / 0.6) |
| `--ds-shadow-lg` | none | 8px 8px 0 #140e3d | 8px 8px 0 #4318d1 |

#### Shape and density (7)

| Role | default | dark | bold | bold-dark |
| --- | --- | --- | --- | --- |
| `--ds-border-width` | 1px | 1px | 2px | 2px |
| `--ds-border-width-strong` | 2px | 2px | 3px | 3px |
| `--ds-focus-width` | 2px | 2px | 3px | 3px |
| `--ds-focus-offset` | 2px | 2px | 2px | 2px |
| `--ds-control-height` | 44px | 44px | 48px | 48px |
| `--ds-motion` | 120ms cubic-bezier(0.2, 0, 0, 1) | same | 160ms cubic-bezier(0.34, 1.56, 0.64, 1) | same as bold |
| `--ds-photo-filter` | grayscale(1) contrast(1.1) | grayscale(1) contrast(1.1) brightness(0.85) | none | brightness(0.9) |

bold's motion overshoots slightly, which gives a springy press. `prefers-reduced-motion` still removes transitions in every theme (DS-26).

### Visual property → role

The mapping is the same as in DS-26 (Theming.md, Tokens and States), because no component changes. In short:

| Visual property | Role |
| --- | --- |
| page ground | `--ds-color-background` |
| control and panel fill | `--ds-color-surface` |
| hover fill, subtle tag | `--ds-color-fill` |
| disabled / read-only fill, info bg | `--ds-color-surface-subtle` |
| separators, disabled border | `--ds-color-divider` |
| field rest border | `--ds-color-border` |
| outlines (secondary, checkbox, thumb, dialog, outline tag) | `--ds-color-border-strong` |
| titles, labels, values | `--ds-color-text-emphasis` |
| body, muted, placeholder | `--ds-color-text`, `--ds-color-text-muted`, `--ds-color-placeholder` |
| action fill, checked, range, badge | `--ds-color-primary`, `--ds-color-primary-hover`, `--ds-color-primary-contrast` |
| focus ring | `--ds-color-focus`, `--ds-focus-width`, `--ds-focus-offset` |
| scrim | `--ds-color-overlay` |
| bubble | `--ds-color-inverse`, `--ds-color-text-inverse` |
| families | `--ds-font-heading`, `--ds-font-body`, `--ds-font-label`, `--ds-font-mono` |
| corners | `--ds-radius-sm`, `--ds-radius-md`, `--ds-radius-lg`, `--ds-radius-full` |
| depth | `--ds-shadow-sm`, `--ds-shadow-md`, `--ds-shadow-lg` |
| line weight, density | `--ds-border-width`, `--ds-border-width-strong`, `--ds-control-height` |
| photography | `--ds-photo-filter` |

### createTheme() input

This is the `ThemeConfig` for each theme, matching `src/theme/createTheme.ts`. createTheme() fills in color (from `brand` and `neutral`), fonts, radius and shadow. It always emits the default weights, type scale and shape, and it caps neutral tint chroma at 0.03. The designed values in the tables above are normative. DS-12 generates the CSS with the input below, then appends a second block with the same selector that sets the roles listed after each input. The appended block wins by source order. DS-12 then runs `checkContrast()` on the merged values. Canvas section 08.

**dark.** Already shipped as the `[data-theme="dark"]` block in `tokens.css` and not regenerated. The equivalent input, for consumers who derive their own dark theme from Wireframe:

```ts
createTheme({
  name: 'dark',
  brand: '#000000',
  fonts: {
    heading: "'Red Hat Mono', ui-monospace, monospace",
    body: "'Red Hat Text', system-ui, sans-serif",
    label: "'Red Hat Mono', ui-monospace, monospace",
  },
  radius: {},
  shadow: {},
  mode: 'dark',
})
```

With a black brand the scale is pure gray (OKLCH chroma 0). Generator output then matches the DS-27 block except for 4 roles:

| Role | Generator | Shipped |
| --- | --- | --- |
| `--ds-color-primary` | #ebebeb (scale 100) | #F7F7F7 |
| `--ds-color-primary-hover` | #d7d7d7 (scale 200) | #E0E0E0 |
| `--ds-color-primary-contrast` | #292929 (scale 900) | #141414 |
| `--ds-color-focus` | #ebebeb | #F7F7F7 |

On top of these, the shipped block adds `--ds-photo-filter: grayscale(1) contrast(1.1) brightness(0.85)`.

**bold:**

```ts
createTheme({
  name: 'bold',
  brand: '#4318D1',
  neutral: '#140E3D',
  fonts: {
    heading: "'Bricolage Grotesque', 'Arial Black', system-ui, sans-serif",
    body: "'Figtree', system-ui, sans-serif",
    label: "'Figtree', system-ui, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, monospace",
  },
  radius: { sm: '8px', md: '14px', lg: '24px', full: '9999px' },
  shadow: { sm: '0 2px 0 #140e3d', md: '0 4px 0 #140e3d', lg: '8px 8px 0 #140e3d' },
  mode: 'light',
})
```

Appended `[data-theme="bold"]` block:

- the 24 non-status color roles from the bold column
- `--ds-font-weight-medium: 600`
- all 36 type-scale roles from the bold column
- `--ds-border-width: 2px`, `--ds-border-width-strong: 3px`, `--ds-focus-width: 3px`, `--ds-control-height: 48px`
- `--ds-motion: 160ms cubic-bezier(0.34, 1.56, 0.64, 1)`, `--ds-photo-filter: none`

**bold-dark.** This is a separate call with `mode: 'dark'`, not `mode: 'both'`. A `both` theme emits its dark block with colors only, so `data-theme="bold-dark"` on its own would fall back to Wireframe fonts, type and shape. A `dark`-mode call emits every role.

```ts
createTheme({
  name: 'bold-dark',
  brand: '#4318D1',
  neutral: '#140E3D',
  fonts: {
    heading: "'Bricolage Grotesque', 'Arial Black', system-ui, sans-serif",
    body: "'Figtree', system-ui, sans-serif",
    label: "'Figtree', system-ui, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, monospace",
  },
  radius: { sm: '8px', md: '14px', lg: '24px', full: '9999px' },
  shadow: { sm: '0 2px 0 rgb(0 0 0 / 0.6)', md: '0 4px 0 rgb(0 0 0 / 0.6)', lg: '8px 8px 0 #4318d1' },
  mode: 'dark',
})
```

The appended `[data-theme="bold-dark"]` block holds the 24 non-status color roles from the bold-dark column, plus the same non-color roles as bold except `--ds-photo-filter: brightness(0.9)`.

Why the generator alone is not enough for bold:

- Its neutral tint is capped at chroma 0.03, too gray for bold's indigo ink and lavender ground.
- It sets surface equal to background.
- It takes dark primary from scale step 100, which is near white.
- It has no input for type, weights or shape.

See Open questions 1 and 2.

## Accessibility

Themes add no roles, labels or ARIA. They own contrast and focus visibility for every component.

### Contrast

The pairs are exactly `requiredPairs` in `src/theme/checkContrast.ts`, plus the field rest border and the exempt and decorative pairs, listed for completeness. Ratios use WCAG 2.x relative luminance computed from the hex values, the same formula as `contrastRatio()` in `src/theme/color.ts`, and are rounded to 2 decimals. Text needs at least 4.5:1, UI at least 3:1. For the default ratios, see Theming.md (Dark mode table) and Theming canvas section 12. Canvas section 07 shows this table.

Each cell lists foreground / background, then the ratio.

| Pair | Kind | dark | bold | bold-dark |
| --- | --- | --- | --- | --- |
| text-emphasis / background | text | #F7F7F7 / #141414 · 17.20 | #140E3D / #F4F1FF · 16.27 | #F5F3FF / #120D2E · 17.05 |
| text-emphasis / surface | text | #F7F7F7 / #141414 · 17.20 | #140E3D / #FFFFFF · 18.10 | #F5F3FF / #19133A · 16.01 |
| text-emphasis / fill | text | #F7F7F7 / #262626 · 14.13 | #140E3D / #E3DCFB · 13.70 | #F5F3FF / #2A2259 · 13.01 |
| text-emphasis / info-bg | text | #F7F7F7 / #1F1F1F · 15.39 | #140E3D / #EBE6FC · 14.88 | #F5F3FF / #211A4A · 14.60 |
| text-emphasis / success-bg | text | #F7F7F7 / #13261A · 14.85 | #140E3D / #EDF5EF · 16.30 | #F5F3FF / #13261A · 14.51 |
| text-emphasis / error-bg | text | #F7F7F7 / #2D1414 · 16.04 | #140E3D / #FBEDEC · 15.89 | #F5F3FF / #2D1414 · 15.67 |
| text-strong / background | text | #E0E0E0 / #141414 · 13.96 | #221B52 / #F4F1FF · 14.01 | #E3DFFA / #120D2E · 14.43 |
| text-strong / surface | text | #E0E0E0 / #141414 · 13.96 | #221B52 / #FFFFFF · 15.59 | #E3DFFA / #19133A · 13.55 |
| text-strong / fill | text | #E0E0E0 / #262626 · 11.46 | #221B52 / #E3DCFB · 11.80 | #E3DFFA / #2A2259 · 11.01 |
| text-strong / info-bg | text | #E0E0E0 / #1F1F1F · 12.49 | #221B52 / #EBE6FC · 12.81 | #E3DFFA / #211A4A · 12.36 |
| text-strong / success-bg | text | #E0E0E0 / #13261A · 12.05 | #221B52 / #EDF5EF · 14.04 | #E3DFFA / #13261A · 12.28 |
| text-strong / error-bg | text | #E0E0E0 / #2D1414 · 13.02 | #221B52 / #FBEDEC · 13.68 | #E3DFFA / #2D1414 · 13.26 |
| text / background | text | #C7C7C7 / #141414 · 10.90 | #2F2766 / #F4F1FF · 11.77 | #D2CCF5 / #120D2E · 12.20 |
| text / surface | text | #C7C7C7 / #141414 · 10.90 | #2F2766 / #FFFFFF · 13.10 | #D2CCF5 / #19133A · 11.46 |
| text / fill | text | #C7C7C7 / #262626 · 8.95 | #2F2766 / #E3DCFB · 9.92 | #D2CCF5 / #2A2259 · 9.31 |
| text / info-bg | text | #C7C7C7 / #1F1F1F · 9.75 | #2F2766 / #EBE6FC · 10.77 | #D2CCF5 / #211A4A · 10.44 |
| text / success-bg | text | #C7C7C7 / #13261A · 9.41 | #2F2766 / #EDF5EF · 11.80 | #D2CCF5 / #13261A · 10.38 |
| text / error-bg | text | #C7C7C7 / #2D1414 · 10.17 | #2F2766 / #FBEDEC · 11.50 | #D2CCF5 / #2D1414 · 11.21 |
| text-muted / background | text | #A3A3A3 / #141414 · 7.30 | #554A8A / #F4F1FF · 6.91 | #B3ABE6 / #120D2E · 8.80 |
| text-muted / surface | text | #A3A3A3 / #141414 · 7.30 | #554A8A / #FFFFFF · 7.68 | #B3ABE6 / #19133A · 8.27 |
| text-muted / fill | text | #A3A3A3 / #262626 · 6.00 | #554A8A / #E3DCFB · 5.82 | #B3ABE6 / #2A2259 · 6.72 |
| text-muted / info-bg | text | #A3A3A3 / #1F1F1F · 6.53 | #554A8A / #EBE6FC · 6.31 | #B3ABE6 / #211A4A · 7.54 |
| text-muted / success-bg | text | #A3A3A3 / #13261A · 6.31 | #554A8A / #EDF5EF · 6.92 | #B3ABE6 / #13261A · 7.49 |
| text-muted / error-bg | text | #A3A3A3 / #2D1414 · 6.81 | #554A8A / #FBEDEC · 6.74 | #B3ABE6 / #2D1414 · 8.09 |
| placeholder / background | text | #8F8F8F / #141414 · 5.70 | #63579A / #F4F1FF · 5.62 | #9A90D6 / #120D2E · 6.53 |
| placeholder / surface | text | #8F8F8F / #141414 · 5.70 | #63579A / #FFFFFF · 6.25 | #9A90D6 / #19133A · 6.13 |
| placeholder / fill | text | #8F8F8F / #262626 · 4.68 | #63579A / #E3DCFB · 4.73 | #9A90D6 / #2A2259 · 4.98 |
| placeholder / info-bg | text | #8F8F8F / #1F1F1F · 5.10 | #63579A / #EBE6FC · 5.14 | #9A90D6 / #211A4A · 5.59 |
| placeholder / success-bg | text | #8F8F8F / #13261A · 4.92 | #63579A / #EDF5EF · 5.63 | #9A90D6 / #13261A · 5.56 |
| placeholder / error-bg | text | #8F8F8F / #2D1414 · 5.32 | #63579A / #FBEDEC · 5.48 | #9A90D6 / #2D1414 · 6.00 |
| primary-contrast / primary | text | #141414 / #F7F7F7 · 17.20 | #FFFFFF / #4318D1 · 9.17 | #120D2E / #A08CFF · 6.85 |
| primary-contrast / primary-hover | text | #141414 / #E0E0E0 · 13.96 | #FFFFFF / #3510A8 · 11.73 | #120D2E / #8B73FF · 5.34 |
| text-inverse / inverse | text | #141414 / #EEEEEE · 15.88 | #F4F1FF / #140E3D · 16.27 | #120D2E / #E3DFFA · 14.43 |
| info / info-bg | text | #C7C7C7 / #1F1F1F · 9.75 | #2F2766 / #EBE6FC · 10.77 | #D2CCF5 / #211A4A · 10.44 |
| info / background | text | #C7C7C7 / #141414 · 10.90 | #2F2766 / #F4F1FF · 11.77 | #D2CCF5 / #120D2E · 12.20 |
| success / success-bg | text | #9CC7AB / #13261A · 8.46 | #2E6B45 / #EDF5EF · 5.72 | #9CC7AB / #13261A · 8.46 |
| success / background | text | #9CC7AB / #141414 · 9.80 | #2E6B45 / #F4F1FF · 5.71 | #9CC7AB / #120D2E · 9.95 |
| error / error-bg | text | #E3AAA6 / #2D1414 · 8.65 | #A3302B / #FBEDEC · 6.11 | #E3AAA6 / #2D1414 · 8.65 |
| error / background | text | #E3AAA6 / #141414 · 9.27 | #A3302B / #F4F1FF · 6.26 | #E3AAA6 / #120D2E · 9.41 |
| primary-contrast / error (invalid checked mark) | UI | #141414 / #E3AAA6 · 9.27 | #FFFFFF / #A3302B · 6.97 | #120D2E / #E3AAA6 · 9.41 |
| border-strong / background | UI | #F7F7F7 / #141414 · 17.20 | #140E3D / #F4F1FF · 16.27 | #F5F3FF / #120D2E · 17.05 |
| border-strong / surface | UI | #F7F7F7 / #141414 · 17.20 | #140E3D / #FFFFFF · 18.10 | #F5F3FF / #19133A · 16.01 |
| icon / background | UI | #F7F7F7 / #141414 · 17.20 | #140E3D / #F4F1FF · 16.27 | #F5F3FF / #120D2E · 17.05 |
| icon / surface | UI | #F7F7F7 / #141414 · 17.20 | #140E3D / #FFFFFF · 18.10 | #F5F3FF / #19133A · 16.01 |
| focus / background | UI | #F7F7F7 / #141414 · 17.20 | #4318D1 / #F4F1FF · 8.24 | #A08CFF / #120D2E · 6.85 |
| focus / surface | UI | #F7F7F7 / #141414 · 17.20 | #4318D1 / #FFFFFF · 9.17 | #A08CFF / #19133A · 6.43 |
| primary / background | UI | #F7F7F7 / #141414 · 17.20 | #4318D1 / #F4F1FF · 8.24 | #A08CFF / #120D2E · 6.85 |
| primary / surface | UI | #F7F7F7 / #141414 · 17.20 | #4318D1 / #FFFFFF · 9.17 | #A08CFF / #19133A · 6.43 |
| error / background (invalid border) | UI | #E3AAA6 / #141414 · 9.27 | #A3302B / #F4F1FF · 6.26 | #E3AAA6 / #120D2E · 9.41 |
| error / surface (invalid border) | UI | #E3AAA6 / #141414 · 9.27 | #A3302B / #FFFFFF · 6.97 | #E3AAA6 / #19133A · 8.84 |
| placeholder / background (slider track) | UI | #8F8F8F / #141414 · 5.70 | #63579A / #F4F1FF · 5.62 | #9A90D6 / #120D2E · 6.53 |
| placeholder / surface | UI | #8F8F8F / #141414 · 5.70 | #63579A / #FFFFFF · 6.25 | #9A90D6 / #19133A · 6.13 |
| text-muted / background (tag remove icon) | UI | #A3A3A3 / #141414 · 7.30 | #554A8A / #F4F1FF · 6.91 | #B3ABE6 / #120D2E · 8.80 |
| border / surface (field rest border, not in requiredPairs) | UI | #737373 / #141414 · 3.89 | #8478B8 / #FFFFFF · 3.92 | #7C70C2 / #19133A · 4.14 |
| border / background | UI | #737373 / #141414 · 3.89 | #8478B8 / #F4F1FF · 3.52 | #7C70C2 / #120D2E · 4.41 |
| placeholder / surface-subtle (disabled field text) | exempt | #8F8F8F / #1F1F1F · 5.10 | #63579A / #EBE6FC · 5.14 | #9A90D6 / #211A4A · 5.59 |
| placeholder / divider (disabled primary) | exempt | #8F8F8F / #333333 · 3.91 | #63579A / #D5CCF5 · 4.10 | #9A90D6 / #3A3170 · 3.96 |
| disabled / background | exempt | #595959 / #141414 · 2.63 | #B3AAD9 / #F4F1FF · 1.95 | #4D4485 / #120D2E · 2.21 |
| divider / background | decorative | #333333 / #141414 · 1.46 | #D5CCF5 / #F4F1FF · 1.37 | #3A3170 / #120D2E · 1.65 |
| info-border / info-bg | decorative | #595959 / #1F1F1F · 2.35 | #D5CCF5 / #EBE6FC · 1.25 | #4D4485 / #211A4A · 1.89 |
| success-border / success-bg | decorative | #2E6B45 / #13261A · 2.50 | #9CC7AB / #EDF5EF · 1.69 | #2E6B45 / #13261A · 2.50 |
| error-border / error-bg | decorative | #A3302B / #2D1414 · 2.47 | #E3AAA6 / #FBEDEC · 1.74 | #A3302B / #2D1414 · 2.47 |

Lowest required ratios in each theme:

- **dark:** text 4.68 (placeholder / fill), UI 3.89 (border / surface).
- **bold:** text 4.73 (placeholder / fill), UI 3.52 (border / background).
- **bold-dark:** text 4.98 (placeholder / fill), primary-contrast / hover 5.34, UI 4.14 (border / surface).

### Other rules

- Color is never the only signal. Status keeps its icon and label. An invalid field keeps the strong border (3px in bold) and the "Error:" text. Checked keeps the mark.
- Uppercase headings in bold are set with `text-transform`, so screen readers read the source text in sentence case. Heading text in content must not be typed in capitals.
- bold's disabled border (#B3AAD9, 1.95 on the ground) is lighter than Wireframe's (2.52). It is exempt under WCAG 1.4.11, and disabled controls also carry the placeholder-colored text and the subtle fill.
- Hard shadows are decorative. Edges always come from borders (`--ds-border-width` 2px in bold), so `forced-colors: active` loses nothing.
- Fonts: if the web fonts fail to load, the fallbacks are 'Arial Black' for headings and system-ui for body and labels. Line-heights are fixed px or unitless, so layout holds.

### Tests (DS-12)

- A deterministic unit test that resolves the `bold` and `bold-dark` blocks (and the `dark` block in `tokens.css`) and runs `checkContrast()` on them. It expects `ok: true` and asserts each ratio is at least the threshold. Do not assert exact 2-decimal values.
- A test that `bold` and `bold-dark` each set all 87 roles from `themeRoles`, so `bold-dark` works standalone.
- A test that no `bold` or `bold-dark` neutral is gray: every neutral color role has R, G and B not all equal.
- `jest-axe` on the component set rendered inside `data-theme="bold"` and `data-theme="bold-dark"`: no ARIA regressions. jsdom cannot measure color contrast, which is why the unit test above exists.
- `userEvent.tab()` through the set under each theme: same focus order as default, and the `:focus-visible` outline is present.

## Open questions

1. **Generator gap.** createTheme() has no input for type scale, weights or shape (border widths, focus width, control height, motion, photo filter), and it caps neutral chroma at 0.03. DS-12 can append an override block (proposed). Should a follow-up extend `ThemeConfig` with `type`, `weights`, `shape` and a neutral-chroma option, so bold can be generated in one call?
2. **Designed vs generated color.** The bold and bold-dark hex values here are hand-tuned and normative. Alternatively, accept createTheme()'s own output for `brand: '#4318D1', neutral: '#140E3D'`. That would be grayer neutrals, surface equal to ground, and a near-white dark primary, and the ratios would need recomputing. Proposed: keep the designed values.
3. **Status hues in bold.** They are kept at Wireframe's muted green and red, so feedback never reads as brand and the values match the generator. Should bold get its own saturated status set instead? That would add 12 raw values.
4. **dark refinement scope.** Every DS-27 color value passes every required pair, so the only change proposed is dimmed photos. Is a further change wanted, for example a raised surface in dark like bold-dark's? That would need its own values and ratios.
5. **Roadmap.** DS-12 still names the shipped themes `soft` and `dark`. It should ship `bold` and `bold-dark` (and the `dark` photo-filter change), and the Storybook toolbar should list `default`, `dark`, `bold`, `bold-dark`.
6. **Font loading.** Should bold ship an opt-in `fonts-bold.css` (Google Fonts or self-hosted woff2), like the Red Hat `fonts.css`, or should consumers load the fonts themselves?

## Token requests

No new token names. Every value is set through existing roles. New selectors: `[data-theme="bold"]` and `[data-theme="bold-dark"]`, shipped as opt-in theme CSS (DS-12). One change to an existing block: `--ds-photo-filter` in `[data-theme="dark"]`.

### New font families (all SIL Open Font License, on Google Fonts)

| Family | Weights needed | Used by |
| --- | --- | --- |
| Bricolage Grotesque | 800 (heading weight; display, h1 to h3, dialog title) | `--ds-font-heading` in bold, bold-dark |
| Figtree | 400, 600, 700 | `--ds-font-body`, `--ds-font-label` in bold, bold-dark |
| IBM Plex Mono | 400, 600 | `--ds-font-mono` in bold, bold-dark (slider pill, bubble, marks, units) |

Fallback stacks: 'Arial Black', system-ui, sans-serif for headings; system-ui, sans-serif for body and labels; ui-monospace, monospace for mono.

### New raw color values

| Theme | Values |
| --- | --- |
| bold | #F4F1FF, #EBE6FC, #E3DCFB, #D5CCF5, #8478B8, #B3AAD9, #63579A, #554A8A, #2F2766, #221B52, #140E3D, #4318D1, #3510A8, rgb(20 14 61 / 0.6) |
| bold-dark | #120D2E, #19133A, #211A4A, #2A2259, #3A3170, #7C70C2, #4D4485, #9A90D6, #B3ABE6, #D2CCF5, #E3DFFA, #F5F3FF, #A08CFF, #8B73FF, rgb(8 5 26 / 0.75) |

bold and bold-dark reuse #FFFFFF and the Wireframe status values (#2E6B45, #9CC7AB, #EDF5EF, #A3302B, #E3AAA6, #FBEDEC, #13261A, #2D1414).

### New raw type, shape and effect values

| Group | Values |
| --- | --- |
| Type sizes | 5rem, 3.5rem, 2.25rem, 1.5rem, 1.25rem, 1.0625rem |
| Line-heights | 0.95, 28px, 18px (1, 1.1, 1.5, 20px, 24px, 16px already exist) |
| Tracking | -0.02em on display (exists for h2), -0.015em, -0.01em, 0.01em |
| Weights | 600 (medium in bold), 800 (heading weight in bold) |
| Radius | 8px, 14px, 24px, 9999px |
| Shadow | `0 2px 0 #140e3d`, `0 4px 0 #140e3d`, `8px 8px 0 #140e3d`, `0 2px 0 rgb(0 0 0 / 0.6)`, `0 4px 0 rgb(0 0 0 / 0.6)`, `8px 8px 0 #4318d1` |
| Shape | border 2px (exists as the strong width), 3px, focus 3px, control height 48px |
| Motion | `160ms cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Photo filter | `none` (bold), `brightness(0.9)` (bold-dark), `grayscale(1) contrast(1.1) brightness(0.85)` (dark) |

### Change to an existing block

| Token | Block | Today | Proposed | Why |
| --- | --- | --- | --- | --- |
| `--ds-photo-filter` | `[data-theme="dark"]` | inherits grayscale(1) contrast(1.1) | grayscale(1) contrast(1.1) brightness(0.85) | a bright monochrome photo glares on the #141414 ground; dimming keeps it in the same tonal range as the UI |
