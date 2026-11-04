---
name: create-theme
description: Guide a consumer of design-system-test through creating a custom theme. Use when the user wants their own look, brand colors, a dark variant, or a new data-theme. Covers choosing raw values, generating the [data-theme] block with createTheme(), checking contrast with checkContrast(), and registering the theme.
---

# Create your own theme

Walk the user through four stages. Ask for the inputs, run the code, show the result, and do not move on until the contrast check passes. Imports come from `design-system-test`. The full reference is `docs/theming-guide.md` in the repository (also the "Your own theme" section of `docs/consumer-guide.md`).

## 1. Choose the raw values

Ask for these (all optional except `name`, `brand`, `fonts.heading`, `fonts.body`):

- `name`: becomes the `data-theme` value. Lowercase letters, digits, hyphens, starting with a letter.
- `brand`: one hex color (`#rgb` or `#rrggbb`). The 50 to 900 scale, `primary`, `primary-hover` and `focus` derive from it. A very light brand color ends up darker in `primary` so white text still reaches 4.5:1.
- `neutral`: optional hex. Only its hue and chroma tint the neutral ramp. Omit it for pure grays.
- `fonts`: CSS `font-family` stacks. `heading` and `body` required; `label` defaults to `heading`; `mono` defaults to Red Hat Mono. End each stack with a system font.
- `radius`: `sm`, `md`, `lg`, `full` as `0` or a length in `px`, `rem`, `em` or `%`. Unset means `0`.
- `shadow`: `sm`, `md`, `lg` as `none` or a `box-shadow` starting with an offset. Unset means `none`.
- `mode`: `'light'`, `'dark'` or `'both'`.

Values containing `;`, `{` or `}` are rejected.

## 2. Generate the `[data-theme]` block

```ts
import { createTheme, type ThemeConfig } from 'design-system-test'

const config: ThemeConfig = {
  name: 'acme',
  brand: '#0b6e4f',
  fonts: { heading: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  radius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
  shadow: {},
  mode: 'both',
}

const theme = createTheme(config) // throws on an invalid name, color or CSS value
// theme.css    : stylesheet text, ready to write to a file
// theme.blocks : [{ mode, selector, values }] with every role resolved
```

`mode: 'both'` emits `[data-theme="acme"]` (light, all roles) and `[data-theme="acme-dark"]` (dark, color roles only). For a standalone dark theme, make a second call with `mode: 'dark'` and a different `name`.

`createTheme()` designs colors, fonts, radius and shadow. Font weights, the type scale and shape (border widths, control height, motion) come out as defaults. To change those or to hand-pick colors, add a second block with the same selector after the generated one (it wins by source order) and keep unlayered CSS. Valid role names are exported as `themeRoles`.

Write `theme.css` to a file such as `acme.css`.

## 3. Check contrast

```ts
import { checkContrast } from 'design-system-test'

const report = checkContrast({ blocks: theme.blocks })
if (!report.ok) console.table(report.failures)
```

`report` is `{ ok, failures, checked }`. Each failure has `foreground`, `background`, `kind` (`'text'` needs 4.5, `'ui'` needs 3), `ratio`, `required`, `mode` and `selector`. If you added override blocks, check the merged values (override applied over `block.values`), not the generator output alone. Fix the failing role (or the config) and run again until `report.ok` is true. Suggest running this in the user's build or tests.

## 4. Register the theme

A theme is registered by loading its CSS and setting `data-theme`.

```ts
import 'design-system-test/styles.css'
import './acme.css' // unlayered; do not wrap it in @layer

document.documentElement.dataset.theme = 'acme' // or 'acme-dark'
```

- Library CSS is in `@layer ds`, so the unlayered theme file wins in any import order.
- Set the attribute on `html` (or `body`) so portal overlays (Dialog, Drawer, Popover, Tooltip, Select, Toast) follow it.
- Load the fonts yourself (a stylesheet, a `<link>` or `@font-face`), with every weight used.
- To switch light and dark, change the `data-theme` value; follow `prefers-color-scheme` if wanted.

## Finish

Summarize the files created, the chosen values, the contrast result, and where `data-theme` is set.
