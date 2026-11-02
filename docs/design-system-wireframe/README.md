# Design System Wireframe

Minimal black / gray / white system. White ground, gray accents, black for ink and action, muted green and red for feedback only. Photography is always monochrome. Titles in Red Hat Mono, body in Red Hat Text.

Live canvas: https://claude.ai/artifact/4R5XwSAJ1Hj8gTqgLdwTmK

## Files

| File | Contents |
| --- | --- |
| `Main.dc.html` | Foundations: color, typography, spacing, shape and line, photography |
| `AllComponents.dc.html` | Every component exported from `src/index.ts` in its key states, drawn with the current `--ds-*` role tokens |
| `Form.dc.html` | Example contact form with live validation (interactive) |
| `Textarea.dc.html` | Textarea design (DS-3) |
| `Slider.dc.html` | Slider design (DS-23) |
| `Dialog.dc.html` | Dialog design (DS-19) |
| `Checkbox.dc.html` | Checkbox and CheckboxGroup design (DS-13) |
| `Toggle.dc.html` | Switch, SegmentedControl and TileGroup design (DS-5) |
| `Theming.dc.html` | Theme contract and knobs: roles, color, fonts, type scale, radius, shadow, dark (DS-26) |
| `RadioGroup.dc.html` | RadioGroup design (DS-15) |
| `InfoTip.dc.html` | InfoTip, Tooltip and Popover design (DS-41) |
| `Icon.dc.html` | Icon system design (DS-46) |
| `Tabs.dc.html` | Tabs design (DS-21) |
| `Layout.dc.html` | Stack and Grid design (DS-35) |
| `Select.dc.html` | Select design (DS-17) |
| `Button.dc.html` | Button, IconButton and ButtonGroup design (DS-32) |
| `Toast.dc.html` | Toast design (DS-39) |
| `Drawer.dc.html` | Drawer design (DS-44) |
| `Typography.dc.html` | Heading and body type styles, shipped as Tailwind utilities (DS-37) |
| `canvas.json` | Canvas layout (artboard sizes and positions) |

### Audit

DS-58 audited every board against `src/index.ts`, `src/components/*` and `src/styles/tokens.css` (the DS-27 role tokens). Result: `Components.dc.html` was deleted, `AllComponents.dc.html` was added, three small token fixes were made, and the rest is flagged below.

Common to every board except Theming: colors are written as hex (`#000000`, `#E0E0E0`, ...) instead of `var(--ds-*)` roles, because the boards predate DS-27. Every hex still equals a value of the default theme (checked against `tokens.css`), so the boards are visually correct; they just do not follow a theme. Not fixed: rewriting ~10k lines of boards is out of scope. `AllComponents.dc.html` reads every value through `var(--ds-*)`.

Fixed means edited in this task. Flag means left as is and noted here. Shipped component(s) are the exports of `src/index.ts`.

| Board | Shipped component(s) | Stale items | Keep / Fix |
| --- | --- | --- | --- |
| `Main.dc.html` | none (foundations, `tokens.css`) | **Fixed:** the "Shape & line" snippet named `--ds-shadow`, `--ds-border` and `--ds-border-strong`, which do not exist; it now lists the real tokens (`--ds-radius`, `--ds-shadow-sm/md/lg`, `--ds-border-width(-strong)`, `--ds-color-divider/border/border-strong`, `--ds-focus-width/offset`, `--ds-color-focus`, `--ds-control-height`, `--ds-motion`). **Flag:** no role layer (the 30 color roles such as `text-strong`, `text-emphasis`, `border-strong`, `icon`, `focus`, `overlay`, `inverse`, `primary-*`; Theming has them); gray-800 is labeled only "Hover on black" (roles `primary-hover`, `text-strong`) and black only "Ink" (role `text-emphasis`; `--ds-color-ink` is a deprecated alias); type list omits body-sm 15/24, body-xs 14/1.5, ui 14/20, ui-sm 12/16, ui-xs 11/16 and the h4/h5 steps; no font-weight roles; radius and shadow steps (`-sm/-md/-lg/-full`) not shown. Palette hexes, status colors, 9 spacing steps and display to caption sizes all match `tokens.css`. | Keep; fixed + flag |
| `AllComponents.dc.html` | all 25 components exported from `src/index.ts` | New. Not stale by construction: `var(--ds-*)` only. | Keep |
| `Form.dc.html` | none (pattern); would use Field, TextField, Select, RadioGroup, Checkbox, Button, Alert | Hand-built with native `<input>`, `<select>` and 20 px radios and hex colors, not the shipped controls; error icons use stroke 1.75 (system uses 1.5 or 2). Predates Select, RadioGroup and Field. | Keep; flag (rebuild on shipped components) |
| `Textarea.dc.html` | Textarea, TextareaField, TextareaCounter | Hex colors only. States, sizes (2/4/8 rows), resize and counter match the code. | Keep; flag (hex) |
| `Slider.dc.html` | Slider, SliderField | Hex colors only. Shows rejected directions B, C and D as design record; shipped is A Hairline. | Keep; flag (hex) |
| `Dialog.dc.html` | Dialog, DialogClose | **Fixed:** overlay row cited `color-mix` of `--ds-color-ink`; now `--ds-color-overlay`. Hex colors elsewhere. | Keep; fixed + flag (hex) |
| `Checkbox.dc.html` | Checkbox, CheckboxGroup | Hex colors only. Sizes, states and group match the code. | Keep; flag (hex) |
| `Toggle.dc.html` | Switch, SegmentedControl, TileGroup (ChoiceGroup is internal, not exported) | Hex colors only. The "Cards" label is a sample segment name, not a component. | Keep; flag (hex) |
| `Theming.dc.html` | `createTheme`, role exports (`src/theme`, `src/styles/roles.ts`) | None found: already reads `var(--ds-*)` roles; every token it names exists in `tokens.css`. Hex values are the example themes (Orchard, dark) by design. | Keep |
| `RadioGroup.dc.html` | RadioGroup, RadioGroupItem | Hex colors only. The 50% circular radio is the "Alternative · not proposed" mock; shipped radios are square (`--ds-radius-full` is 0). | Keep; flag (hex) |
| `InfoTip.dc.html` | InfoTip, Tooltip, TooltipProvider, Popover | Hex colors only. The 20 px radius is a touch-target overlay, not component shape. | Keep; flag (hex) |
| `Icon.dc.html` | Icon, createIcon, IconProvider (11 private default glyphs) | Hex colors only. Glyph count, sizes (12/16/20) and strokes (1.5/2) match `glyphs.tsx` and `constants.ts`. | Keep; flag (hex) |
| `Tabs.dc.html` | Tabs | Hex colors only. Line 478 mentions the underline mock "in Components.dc.html": that file is now deleted, so the sentence is historical (the underline was rejected; shipped Tabs reuse the segmented and tile looks). Left as is. | Keep; flag (dangling reference) |
| `Layout.dc.html` | Stack, Grid | Hex colors only. Gaps, columns, alignments and breakpoints match the code. | Keep; flag (hex) |
| `Select.dc.html` | Select, SelectField | Hex colors only. | Keep; flag (hex) |
| `Button.dc.html` | Button, IconButton, ButtonGroup | Hex colors only. Variants, loading, pressed and attached/spaced groups match the code. | Keep; flag (hex) |
| `Toast.dc.html` | ToastProvider, useToast, Toaster | Hex colors only. Width 384, severities and 2 px error border match the code. | Keep; flag (hex) |
| `Drawer.dc.html` | Drawer, DrawerClose | **Fixed:** overlay row cited `color-mix` of `--ds-color-ink`; now `--ds-color-overlay`. Hex colors elsewhere. | Keep; fixed + flag (hex) |
| `Typography.dc.html` | none (Tailwind utilities `heading-*` and `body-*` in `tailwind.css`, DS-38) | Hex colors only. Correctly shows classes, not components. | Keep; flag (hex) |
| `Components.dc.html` (deleted) | none | Showed the unbuilt Cards and Table; checkbox, radio and switch as native 20 px controls (shipped: 24 px, 2 px strong border; switch 48 x 24); Tabs as an underline (rejected); an inverse-fill snackbar (shipped Toast differs); pre-DS-27 hex colors. | Deleted; replaced by `AllComponents.dc.html` |

Components with no dedicated board: Alert, Breadcrumb, Tag and Badge, Input, Field and TextField. They were only drawn on the deleted `Components.dc.html`; `AllComponents.dc.html` is now their canvas. A spec-level board for them is a separate design task.

Historical mentions of `Components.dc.html` left as they are: `docs/specs/Tabs.md`, `docs/specs/Toast.md`, `docs/specs/Textarea.md` and the `Tabs.dc.html` note above.

## Factory status

The roadmap for this system is built by the [software factory](../factory/README.md). To see what's in progress, what needs you, and what's ready to start:

- **Live (refreshes every 10 s):** from a terminal in the repo, run

  ```bash
  npm run factory:status
  ```

  It opens the page and keeps rebuilding it every 10 seconds until you stop it with Ctrl+C. The page reloads itself, except while a task dialog is open.
- **Snapshot:** type `/factory:status` in Claude Code (add a task ID, e.g. `/factory:status DS-4`, to also see that task's timeline and notes), or run `node factory/plugin/skills/status/scripts/status-page.mjs --open` once.

The page is written to `.factory/status.html` (gitignored). Click a task on the board to see its details.

| Flag | Effect |
| --- | --- |
| `--open` | open the page in the browser |
| `--json` | print the data as JSON instead of the summary |
| `--quiet` | don't print the text summary |
| `--no-fetch` | skip `git fetch` (faster, may be out of date) |
| `--local` | read `roadmap.md` from your checkout instead of `origin/main` (preview unmerged roadmap edits) |
| `--watch [seconds]` | keep rebuilding every N seconds (default 10); the page reloads itself |

## Tailwind

Tokens live in `src/styles/tokens.css` (`--ds-*`). `src/styles/tailwind.css` imports them and maps them into the Tailwind v4 theme. Import that one file, as `.storybook/preview.tsx` does, to get the fonts, tokens and utilities.

The default Tailwind palette, radii and shadows are cleared. Off-system classes such as `bg-blue-500`, `rounded-lg` or `shadow-md` generate no CSS.

| Need | Utilities |
| --- | --- |
| Palette | `bg-white`, `bg-gray-50` … `bg-gray-900`, `bg-black` (also `text-*`, `border-*`, …) |
| Semantic color | `bg-background`, `bg-surface`, `bg-surface-subtle`, `bg-fill`, `border-divider`, `border-border`, `text-disabled`, `placeholder:text-placeholder`, `text-muted`, `text-text`, `text-ink`, `bg-inverse`, `bg-primary`, `hover:bg-primary-hover`, `text-primary-contrast` |
| Status | `text-error`, `border-error`, `bg-error-bg`, `border-error-border`; same for `success` and `info` |
| Fonts | `font-mono` (titles; `h1`–`h6` default to it), `font-sans` (body, default) |
| Type scale | `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-label` (add `uppercase`), `text-caption` |
| Spacing | Tailwind's numeric scale is the 4 px base: `p-1` = 4, `p-4` = 16, `gap-6` = 24, `py-24` = 96. `h-control` = 44 px |
| Shape | `rounded-md` (= 0), `border` (1 px), `focus-visible:focus-ring` (2 px black, 2 px offset) |
| Photos | `photo` (applies `grayscale(1) contrast(1.1)`) |

```tsx
<button className="h-control px-6 bg-primary hover:bg-primary-hover text-primary-contrast font-mono text-sm font-medium focus-visible:focus-ring">
  Continue
</button>
<img className="photo aspect-[4/5] object-cover" src={src} alt="" />
<span className="font-mono text-label uppercase text-muted">Series</span>
```

## Color

| Token | Hex | Role |
| --- | --- | --- |
| white | `#FFFFFF` | Background |
| gray-50 | `#F7F7F7` | Surface subtle |
| gray-100 | `#EEEEEE` | Hover / fill |
| gray-200 | `#E0E0E0` | Divider |
| gray-300 | `#C7C7C7` | Border |
| gray-400 | `#A3A3A3` | Disabled (2.5:1, non-text) |
| gray-500 | `#767676` | Placeholder (4.5:1, minimum for text) |
| gray-600 | `#595959` | Muted text (7:1) |
| gray-700 | `#404040` | Body text (10.4:1) |
| gray-800 | `#262626` | Hover on black |
| gray-900 | `#141414` | Inverse surface |
| black | `#000000` | Ink, primary action (21:1) |

### Status

The only hues in the system. They're muted and used for feedback only (alerts, field errors, status tags), always alongside an icon and a text label, never color alone.

| Status | fg (text, icon, error field border) | border | bg | Contrast |
| --- | --- | --- | --- | --- |
| info (neutral) | `#404040` | `#C7C7C7` | `#F7F7F7` | fg on bg 9.7:1 |
| success (green) | `#2E6B45` | `#9CC7AB` | `#EDF5EF` | fg on bg 5.7:1, on white 6.4:1 |
| error (red) | `#A3302B` | `#E3AAA6` | `#FBEDEC` | fg on bg 6.1:1, on white 7:1 |

Tokens: `--ds-color-{info,success,error}`, `-border`, `-bg`. An invalid field gets a 2 px `error` border and an `error` message beginning "Error:".

## Typography

| Style | Font | Size / line | Notes |
| --- | --- | --- | --- |
| display | Red Hat Mono 500 | 72 / 72 | −4% tracking |
| h1 | Red Hat Mono 500 | 48 / 53 | −3% |
| h2 | Red Hat Mono 500 | 32 / 38 | −2% |
| h3 | Red Hat Mono 500 | 22 / 29 | |
| body-lg | Red Hat Text 400 | 18 / 29 | |
| body | Red Hat Text 400 | 16 / 26 | |
| label | Red Hat Mono 500 | 12 / 16 | +8%, uppercase |
| caption | Red Hat Text 400 | 13 / 20 | gray-600 |

## Spacing

4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96.

## Shape & line

```css
--ds-radius: 0;                 /* --ds-radius-sm | -md | -lg | -full default to it */
--ds-shadow-sm: none;           /* also -md, -lg; depth = borders + gray fills */
--ds-border-width: 1px;
--ds-border-width-strong: 2px;
--ds-color-divider: #E0E0E0;    /* hairline */
--ds-color-border: #C7C7C7;     /* control border */
--ds-color-border-strong: #000000;
--ds-focus-width: 2px;          /* --ds-focus-offset: 2px; --ds-color-focus: #000000 */
--ds-control-height: 44px;
--ds-motion: 120ms cubic-bezier(.2, 0, 0, 1);
```

Controls are 44 px tall at default size (`--ds-control-height`).

## Photography

```css
--ds-photo-filter: grayscale(1) contrast(1.1);
```

- **Do:** 100% grayscale, slight contrast lift, visible grain, square corners, crops 4:5 / 1:1 / 16:9, mono caption below the image.
- **Don't:** color or partial color, sepia, duotone, gradient overlays, drop shadows, rounded corners, text over busy areas.

The canvas uses abstract SVG stand-ins in place of real photos.
