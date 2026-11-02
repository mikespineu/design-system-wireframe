# Create your own theme

A step-by-step guide for consumers who want their own look. You pick a brand color, neutrals, fonts, radius and shadow, generate a `[data-theme]` block with `createTheme()`, add an override block for the roles the generator does not cover, check contrast with `checkContrast()`, ship a light and a dark theme, and turn it on with `data-theme`.

The worked example is the `bold` theme that ships with the package (`design-system-test/themes/bold.css`). Every step rebuilds it from its spec input (`docs/specs/Themes.md`, "createTheme() input"), so at the end you have the same CSS the package ships. Every TypeScript sample below is a real file in [`docs/theming-guide/samples/`](theming-guide/samples/). `npm run typecheck` checks them against `ThemeConfig`. A test imports and runs them, and fails if a code block in this guide differs from its file or if the rebuilt `bold` CSS differs from `src/themes/bold.css`.

Read the [consumer guide](consumer-guide.md#apply-a-theme) first for how themes are applied and the [theming contract](specs/Theming.md) for the 87 roles.

- [How it fits together](#how-it-fits-together)
- [Step 1: choose your values](#step-1-choose-your-values)
- [Step 2: write the `createTheme()` input](#step-2-write-the-createtheme-input)
- [Step 3: generate the `[data-theme]` block](#step-3-generate-the-data-theme-block)
- [Step 4: add an override block](#step-4-add-an-override-block)
- [Step 5: check contrast with `checkContrast()`](#step-5-check-contrast-with-checkcontrast)
- [Step 6: ship light and dark](#step-6-ship-light-and-dark)
- [Step 7: load the fonts](#step-7-load-the-fonts)
- [Step 8: turn it on with `data-theme`](#step-8-turn-it-on-with-data-theme)
- [Checklist](#checklist)

## How it fits together

A theme is a CSS block that sets the semantic roles (`--ds-color-*`, `--ds-font-*`, `--ds-radius-*`, and so on) under `[data-theme="<name>"]`. Components read only roles. You never edit a component.

```text
ThemeConfig --createTheme()--> generated block ---+
                                                  +--> your .css file --> data-theme="<name>"
override block (hand-set roles) ------------------+
        |
        +--> merged values --checkContrast()--> report
```

`createTheme()` is a pure function. It runs in Node (a build script) or in the browser. It sets all 87 roles, but it only designs the color, font, radius and shadow roles from your input. Weights, the type scale and shape (border widths, control height, focus offset, motion) come out as the Wireframe defaults. If you want those to differ, or you want hand-picked colors, you add an override block (step 4).

The imports in this guide are from `design-system-test`: `createTheme`, `checkContrast`, `themeRoles` and the types `ThemeConfig`, `ThemeFonts`, `ThemeRadius`, `ThemeBlock`, `ContrastReport`.

## Step 1: choose your values

You choose five things. The right column is what `bold` chose and why.

| Input | What it controls | `bold` |
| --- | --- | --- |
| `brand` | One hex color. The 50 to 900 scale, `primary`, `primary-hover` and `focus` derive from it. | `#4318D1`, a saturated indigo. Dark enough that white text on it passes 4.5:1 |
| `neutral` | Optional hex color. Only its hue and chroma are used, to tint the whole neutral ramp: ground, fills, borders, text. Chroma is capped at 0.03 and lightness is ignored. Omit it for pure grays. | `#140E3D`, the brand hue as a near-black ink, so no neutral reads as gray |
| `fonts` | CSS `font-family` values. `heading` and `body` are required. `label` defaults to `heading`; `mono` defaults to Red Hat Mono. | Bricolage Grotesque for headings, Figtree for body and labels, IBM Plex Mono for numerals |
| `radius` | `sm`, `md`, `lg`, `full`. A CSS length. Anything you leave out is `0`. | `8px`, `14px`, `24px`, `9999px`: soft and rounded |
| `shadow` | `sm`, `md`, `lg`. A CSS `box-shadow`. Anything you leave out is `none`. | A hard offset in the ink color, no blur (`8px 8px 0 #140e3d`) |

Rules of thumb:

- Pick a brand color with enough depth. In a light theme the generator uses the first step of the scale (500 to 900) that reaches 4.5:1 against the ground as `primary`, so a very light brand color still works but ends up darker than what you picked.
- Use the brand hue for `neutral` when you want a cohesive look. Any hex works, since only its hue and chroma count.
- Fonts are only names here. Loading them is step 7.
- Types are strict. `brand` and `neutral` are `#rgb` or `#rrggbb`; a radius is `0` or a number with `px`, `rem`, `em` or `%`; a shadow is `none` or starts with an offset (`0 4px ...`). A value with `;`, `{` or `}` is rejected.
- The `name` becomes the `data-theme` value: lowercase letters, digits and hyphens, starting with a letter.

## Step 2: write the `createTheme()` input

The input is a `ThemeConfig`. Typing it as `ThemeConfig` (and `ThemeFonts`, `ThemeRadius`) makes the compiler check your values for you.

**`bold.config.ts`**

<!-- sample: bold.config.ts -->
```ts
import type { ThemeConfig, ThemeFonts, ThemeRadius } from 'design-system-test'

const fonts: ThemeFonts = {
  heading: "'Bricolage Grotesque', 'Arial Black', system-ui, sans-serif",
  body: "'Figtree', system-ui, sans-serif",
  label: "'Figtree', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
}

const radius: ThemeRadius = { sm: '8px', md: '14px', lg: '24px', full: '9999px' }

export const boldConfig: ThemeConfig = {
  name: 'bold',
  brand: '#4318D1',
  neutral: '#140E3D',
  fonts,
  radius,
  shadow: { sm: '0 2px 0 #140e3d', md: '0 4px 0 #140e3d', lg: '8px 8px 0 #140e3d' },
  mode: 'light',
}

export const boldDarkConfig: ThemeConfig = {
  name: 'bold-dark',
  brand: '#4318D1',
  neutral: '#140E3D',
  fonts,
  radius,
  shadow: { sm: '0 2px 0 rgb(0 0 0 / 0.6)', md: '0 4px 0 rgb(0 0 0 / 0.6)', lg: '8px 8px 0 #4318d1' },
  mode: 'dark',
}
```

`mode` decides what is emitted. `bold` is built as two separate calls, `light` and `dark`, and step 6 explains why. If you want the shortest path, one call with `mode: 'both'` gives you a light and a dark block:

**`minimal.ts`**

<!-- sample: minimal.ts -->
```ts
import { createTheme } from 'design-system-test'

// The smallest useful input: one brand color, nothing else chosen.
// Unset radius is 0, unset shadow is none, unset neutral gives pure grays.
export const acme = createTheme({
  name: 'acme',
  brand: '#0b6e4f',
  fonts: { heading: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  radius: {},
  shadow: {},
  mode: 'both',
})

// acme.css holds two blocks: [data-theme="acme"] (light, every role) and
// [data-theme="acme-dark"] (dark, color roles only).
export const selectors: string[] = acme.blocks.map((block) => block.selector)
```

## Step 3: generate the `[data-theme]` block

`createTheme(config)` returns a `Theme`:

| Field | What it is |
| --- | --- |
| `name`, `mode` | Copied from the input |
| `scale` | The generated 50 to 900 brand scale |
| `blocks` | One `ThemeBlock` per emitted selector: `{ mode, selector, values }`, where `values` maps each role to a value |
| `css` | The blocks as a stylesheet, ready to write to a file |

It throws on an invalid `name`, color or CSS value, so a typo fails at build time with a message that names the bad value.

For `boldConfig` the start of `theme.css` looks like this (the full block sets all 87 roles; lines in between are left out here):

<!-- excerpt: bold.css -->
```css
[data-theme="bold"] {
  --ds-color-background: #f9faff;
  --ds-color-surface: #f9faff;
  --ds-color-surface-subtle: #f6f6ff;
  --ds-color-fill: #ebedff;
  --ds-radius-sm: 8px;
  --ds-radius-md: 14px;
  --ds-radius-lg: 24px;
  --ds-radius-full: 9999px;
  --ds-shadow-sm: 0 2px 0 #140e3d;
  --ds-shadow-md: 0 4px 0 #140e3d;
  --ds-shadow-lg: 8px 8px 0 #140e3d;
```

Fonts, radius and shadow in this block are final. The colors are a starting point: bold's ground is a lavender (`#F4F1FF`), the generator's is a barely tinted `#f9faff`. That is what step 4 is for.

If the generated block already looks right, you can stop after step 5: write `theme.css` to a file and skip the override block.

## Step 4: add an override block

The generator cannot do everything. For bold it:

- tints neutrals with a chroma of at most 0.03, too gray for bold's indigo ink and lavender ground
- sets `surface` equal to `background`, but bold wants white panels on a lavender ground
- takes dark `primary` from scale step 100, which is near white
- has no input for font weights, the type scale or shape

So the next step is a second block with the **same selector**, placed after the generated one. Both blocks have the same specificity, so the later one wins for every role it sets. The rest comes through from the generated block.

Put the hand-set values in plain objects keyed by role (a full custom property name). First the color roles. The 24 non-status colors are set by hand; the status triples (`success` and `error`) stay as generated because the generator already uses the Wireframe feedback hues.

**`bold.colors.ts`**

<!-- sample: bold.colors.ts -->
```ts
// The 24 non-status color roles the generator cannot get right for bold.
// The status triples (success, error) stay as the generator emits them.
export const boldColors: Record<string, string> = {
  '--ds-color-background': '#f4f1ff',
  '--ds-color-surface': '#ffffff',
  '--ds-color-surface-subtle': '#ebe6fc',
  '--ds-color-fill': '#e3dcfb',
  '--ds-color-divider': '#d5ccf5',
  '--ds-color-border': '#8478b8',
  '--ds-color-disabled': '#b3aad9',
  '--ds-color-placeholder': '#63579a',
  '--ds-color-text-muted': '#554a8a',
  '--ds-color-text': '#2f2766',
  '--ds-color-text-strong': '#221b52',
  '--ds-color-text-emphasis': '#140e3d',
  '--ds-color-text-inverse': '#f4f1ff',
  '--ds-color-border-strong': '#140e3d',
  '--ds-color-icon': '#140e3d',
  '--ds-color-focus': '#4318d1',
  '--ds-color-overlay': 'rgb(20 14 61 / 0.6)',
  '--ds-color-inverse': '#140e3d',
  '--ds-color-primary': '#4318d1',
  '--ds-color-primary-hover': '#3510a8',
  '--ds-color-primary-contrast': '#ffffff',
  '--ds-color-info': '#2f2766',
  '--ds-color-info-border': '#d5ccf5',
  '--ds-color-info-bg': '#ebe6fc',
}
```

Then the roles that have no `createTheme()` input: weights, type scale and shape.

**`bold.shape.ts`**

<!-- sample: bold.shape.ts -->
```ts
// Weight, type scale and shape roles. createTheme() has no input for them, so it emits the
// defaults; bold replaces these. Both modes share them.
export const boldShape: Record<string, string> = {
  '--ds-font-weight-medium': '600',
  '--ds-text-display-size': '5rem',
  '--ds-text-display-line-height': '0.95',
  '--ds-text-display-tracking': '-0.02em',
  '--ds-text-h1-size': '3.5rem',
  '--ds-text-h1-line-height': '1',
  '--ds-text-h1-tracking': '-0.015em',
  '--ds-text-h2-size': '2.25rem',
  '--ds-text-h2-line-height': '1.1',
  '--ds-text-h2-tracking': '-0.01em',
  '--ds-text-h3-size': '1.5rem',
  '--ds-text-h3-line-height': '28px',
  '--ds-text-h3-tracking': '0',
  '--ds-text-heading-weight': '800',
  '--ds-text-heading-transform': 'uppercase',
  '--ds-text-body-lg-size': '1.25rem',
  '--ds-text-body-lg-line-height': '1.5',
  '--ds-text-body-size': '1.0625rem',
  '--ds-text-body-line-height': '28px',
  '--ds-text-body-sm-size': '1rem',
  '--ds-text-body-sm-line-height': '24px',
  '--ds-text-body-xs-size': '0.9375rem',
  '--ds-text-body-xs-line-height': '1.5',
  '--ds-text-caption-size': '0.875rem',
  '--ds-text-caption-line-height': '20px',
  '--ds-text-label-size': '0.875rem',
  '--ds-text-label-line-height': '20px',
  '--ds-text-label-weight': 'var(--ds-font-weight-bold)',
  '--ds-text-label-tracking': '0.01em',
  '--ds-text-label-transform': 'none',
  '--ds-text-ui-size': '1rem',
  '--ds-text-ui-line-height': '24px',
  '--ds-text-ui-weight': 'var(--ds-font-weight-bold)',
  '--ds-text-ui-sm-size': '0.8125rem',
  '--ds-text-ui-sm-line-height': '18px',
  '--ds-text-ui-xs-size': '0.75rem',
  '--ds-text-ui-xs-line-height': '16px',
  '--ds-border-width': '2px',
  '--ds-border-width-strong': '3px',
  '--ds-focus-width': '3px',
  '--ds-control-height': '48px',
  '--ds-motion': '160ms cubic-bezier(0.34, 1.56, 0.64, 1)',
}
```

Roles you leave out of the object keep the generated value. Take only the roles you really want to change; every extra role is a value you must keep in sync with the rest of the theme.

Override related roles together: `primary`, `primary-hover` and `primary-contrast`; `inverse` and `text-inverse`; each status triple; the ground together with every text role that sits on it. The valid role names are exported as `themeRoles`.

Now a function that turns config plus overrides into a block and the merged values:

**`build-theme.ts`**

<!-- sample: build-theme.ts -->
```ts
import { createTheme, themeRoles, type ThemeBlock, type ThemeConfig } from 'design-system-test'
import { writeFileSync } from 'node:fs'

export interface BuiltTheme {
  name: string
  /** The generated block followed by the override block (same selector, so it wins by source order). */
  css: string
  /** The generated blocks with the overrides applied: what the browser resolves. Feed this to checkContrast(). */
  blocks: ThemeBlock[]
}

export function buildTheme(config: ThemeConfig, overrides: Record<string, string>): BuiltTheme {
  const generated = createTheme(config)

  // Keep the override roles in contract order, so the file reads the same as the generated block.
  const roles = themeRoles.filter((role) => role in overrides)
  const lines = roles.map((role) => `  ${role}: ${overrides[role]};`)
  const overrideBlock = `[data-theme="${config.name}"] {\n${lines.join('\n')}\n}`

  // The merged values: for each role the override if there is one, else the generated value.
  const blocks = generated.blocks.map((block) => ({
    ...block,
    values: Object.fromEntries(themeRoles.map((role) => [role, overrides[role] ?? block.values[role] ?? ''])),
  }))

  return { name: config.name, css: `${generated.css}\n${overrideBlock}\n`, blocks }
}

/** Writes one stylesheet with every theme in it. Run it from a build script. */
export function writeCss(path: string, themes: BuiltTheme[]): void {
  writeFileSync(path, themes.map((theme) => theme.css).join('\n'))
}
```

Why `blocks` is returned next to `css`: the browser merges the two CSS blocks, but `checkContrast()` reads values, not CSS. `blocks` is that merge done in code, so the report describes what users see.

**`themes.ts`**

<!-- sample: themes.ts -->
```ts
import { boldConfig, boldDarkConfig } from './bold.config'
import { boldColors } from './bold.colors'
import { boldDarkColors } from './bold.dark-colors'
import { boldShape } from './bold.shape'
import { buildTheme } from './build-theme'

export const bold = buildTheme(boldConfig, { ...boldColors, ...boldShape, '--ds-photo-filter': 'none' })

export const boldDark = buildTheme(boldDarkConfig, {
  ...boldDarkColors,
  ...boldShape,
  '--ds-photo-filter': 'brightness(0.9)',
})
```

`bold.css` in the package is exactly this: the light theme followed by the dark theme, each a generated block and an override block (plus a header comment). The start of the first override block:

<!-- excerpt: bold.css -->
```css
[data-theme="bold"] {
  --ds-color-background: #f4f1ff;
  --ds-color-surface: #ffffff;
  --ds-color-surface-subtle: #ebe6fc;
```

## Step 5: check contrast with `checkContrast()`

`checkContrast({ blocks })` checks every required text pair (4.5:1) and UI pair (3:1) in every block: text roles on every ground they sit on, `primary-contrast` on `primary`, status colors on their backgrounds, the focus ring, borders and icons. Disabled roles, dividers and status borders are exempt. The pair list is `requiredPairs` in `src/theme/checkContrast.ts` and is described in the Accessibility section of the [theming contract](specs/Theming.md).

Pass it the **merged** blocks from step 4. Checking only `createTheme()` output would test values your override block replaces.

**`check-contrast.ts`**

<!-- sample: check-contrast.ts -->
```ts
import { checkContrast, type ContrastReport } from 'design-system-test'
import { bold, boldDark } from './themes'

// Check the merged values (generator output plus overrides), not the generator output alone.
export const report: ContrastReport = checkContrast({ blocks: [...bold.blocks, ...boldDark.blocks] })
// report.ok is true, report.failures is empty and report.checked counts every pair in both blocks.

// A deliberately weak muted text color shows what a failure looks like.
const weakMutedText = bold.blocks.map((block) => ({
  ...block,
  values: { ...block.values, '--ds-color-text-muted': '#9a90d6' },
}))

export const broken: ContrastReport = checkContrast({ blocks: weakMutedText })
// broken.ok is false and broken.failures lists 7 pairs. The first is
// { foreground: 'color-text-muted', background: 'color-background', kind: 'text', ratio: 2.57,
//   required: 4.5, mode: 'light', selector: 'bold' }
```

A `ContrastReport` is `{ ok, failures, checked }`. Each failure names the role pair, the kind, the measured and required ratio, the mode and the selector, so you know which role to change. Fix it in the override object (or the config) and run the check again. Make the check part of your build or test run, so a theme that fails never ships. `bold` and `bold-dark` pass every pair.

## Step 6: ship light and dark

`ThemeConfig.mode` is one of:

| `mode` | Emits |
| --- | --- |
| `'light'` | `[data-theme="name"]` with every role |
| `'dark'` | `[data-theme="name"]` with every role and `color-scheme: dark` |
| `'both'` | `[data-theme="name"]` (light, every role) and `[data-theme="name-dark"]` (dark, **color roles only**) |

A `both` theme is the quickest way to get two themes, but its dark block sets colors only. Switch to `name-dark` on its own and fonts, type, radius and shape fall back to the Wireframe defaults. Use `both` only when the dark theme is always scoped inside a light one, or when you add the other roles yourself.

`bold` makes two calls instead, `mode: 'light'` for `bold` and `mode: 'dark'` for `bold-dark`, because it wants each theme to stand alone. The dark config in step 2 has its own `shadow` (a black offset, the brand color for the large one). Then `bold-dark` has its own override object (`bold.dark-colors.ts`) and shares the shape overrides with `bold`.

**`bold.dark-colors.ts`**

<!-- sample: bold.dark-colors.ts -->
```ts
export const boldDarkColors: Record<string, string> = {
  '--ds-color-background': '#120d2e',
  '--ds-color-surface': '#19133a',
  '--ds-color-surface-subtle': '#211a4a',
  '--ds-color-fill': '#2a2259',
  '--ds-color-divider': '#3a3170',
  '--ds-color-border': '#7c70c2',
  '--ds-color-disabled': '#4d4485',
  '--ds-color-placeholder': '#9a90d6',
  '--ds-color-text-muted': '#b3abe6',
  '--ds-color-text': '#d2ccf5',
  '--ds-color-text-strong': '#e3dffa',
  '--ds-color-text-emphasis': '#f5f3ff',
  '--ds-color-text-inverse': '#120d2e',
  '--ds-color-border-strong': '#f5f3ff',
  '--ds-color-icon': '#f5f3ff',
  '--ds-color-focus': '#a08cff',
  '--ds-color-overlay': 'rgb(8 5 26 / 0.75)',
  '--ds-color-inverse': '#e3dffa',
  '--ds-color-primary': '#a08cff',
  '--ds-color-primary-hover': '#8b73ff',
  '--ds-color-primary-contrast': '#120d2e',
  '--ds-color-info': '#d2ccf5',
  '--ds-color-info-border': '#4d4485',
  '--ds-color-info-bg': '#211a4a',
}
```

Both themes are built in `themes.ts` (step 4) and checked together in `check-contrast.ts` (step 5). `--ds-photo-filter` is the one role that differs between the two shared overrides: `none` in light, `brightness(0.9)` in dark.

Write both blocks into one stylesheet:

**`write-bold.ts`**

<!-- sample: write-bold.ts -->
```ts
import { writeCss } from './build-theme'
import { bold, boldDark } from './themes'

/** Writes both themes into one stylesheet. From a build script: `writeBold('bold.css')`. */
export const writeBold = (path: string): void => writeCss(path, [bold, boldDark])
```

Dark mode is not a different app: it is a different `data-theme` value. Which one to apply is step 8.

## Step 7: load the fonts

The library never loads fonts. `createTheme()` only writes the `font-family` stacks. If the families are not available, the browser uses the fallbacks in your stack (`Arial Black` and `system-ui` for bold), so always end each stack with a system font.

Pick one of these:

- **A stylesheet.** Bold ships `design-system-test/themes/bold-fonts.css`, which loads its three families (SIL Open Font License) from Google Fonts:

<!-- excerpt: bold-fonts.css -->
```css
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Figtree:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');
```

- **A `<link>` tag** to the same URL, with `rel="preconnect"` for `fonts.googleapis.com` and `fonts.gstatic.com`. This avoids the extra round trip of `@import`.
- **Self-hosted files.** Add your own `@font-face` rules with `font-display: swap`. Self-hosting needs no third-party request.

Load every weight the theme uses. Bold uses 800 for headings (`--ds-text-heading-weight`), 400, 600 and 700 for Figtree (`--ds-font-weight-medium` is 600) and 400 and 600 for IBM Plex Mono. A weight that is not loaded is synthesized by the browser and looks off.

## Step 8: turn it on with `data-theme`

Import the library CSS, the fonts and your theme, then set the attribute on `<html>`.

**`main.ts`**

<!-- sample: main.ts -->
```ts
import 'design-system-test/styles.css'
import 'design-system-test/themes/bold-fonts.css'
import './bold.css'
import { followSystem } from './apply-theme'

export const stopFollowing = followSystem(window.matchMedia('(prefers-color-scheme: dark)'))
```

Library CSS is in `@layer ds` and your theme file is not in a layer, so the theme wins in any import order. Do not put your theme in an `@layer`: unlayered CSS beats any layer, so a layered theme can lose to other unlayered theme blocks such as `themes/bold.css`. The file `./bold.css` above is the output of `writeBold()` (step 6).

Set the attribute with code, so you can switch at run time:

**`apply-theme.ts`**

<!-- sample: apply-theme.ts -->
```ts
export type ColorMode = 'light' | 'dark'

/** The `data-theme` value for a mode. */
export const themeName = (mode: ColorMode): string => (mode === 'dark' ? 'bold-dark' : 'bold')

/** Switches the whole app: roles resolve from the nearest ancestor with the attribute, here <html>. */
export function applyTheme(mode: ColorMode, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = themeName(mode)
}

/** Follows the OS setting. Returns a function that stops following. */
export function followSystem(query: MediaQueryList, root: HTMLElement = document.documentElement): () => void {
  const update = () => applyTheme(query.matches ? 'dark' : 'light', root)
  update()
  query.addEventListener('change', update)
  return () => query.removeEventListener('change', update)
}
```

Or set it by hand in the markup when the theme is fixed:

```html
<html data-theme="bold">
```

Notes:

- Set the attribute on `html` (or `body`) when overlays (Dialog, Drawer, Popover, Tooltip, Select, Toast) must follow it. They render into a portal on `document.body`, so a theme scoped to a subtree does not reach them.
- `data-theme` can also sit on a subtree: a `bold-dark` card on a `bold` page. Roles resolve from the nearest ancestor with the attribute.
- Remember the choice (for example in `localStorage`) and set the attribute before first paint, to avoid a flash of the wrong theme.

## Checklist

- [ ] Brand, neutral, fonts, radius and shadow chosen (step 1)
- [ ] `ThemeConfig` typed and `createTheme()` runs without throwing (steps 2 and 3)
- [ ] Override block for every role the generator does not cover, after the generated block, same selector (step 4)
- [ ] `checkContrast()` reports `ok: true` on the merged values of every mode (step 5)
- [ ] Light and dark are both written to the stylesheet, each with the roles it needs (step 6)
- [ ] Fonts loaded, with every weight used (step 7)
- [ ] Library CSS, theme CSS and `data-theme` in place (step 8)
