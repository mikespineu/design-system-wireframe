# Design System Wireframe

Minimal black / gray / white system. White ground, gray accents, black for ink and action, muted green and red for feedback only. Photography is always monochrome. Titles in Red Hat Mono, body in Red Hat Text.

Live canvas: https://claude.ai/artifact/4R5XwSAJ1Hj8gTqgLdwTmK

## Files

| File | Contents |
| --- | --- |
| `Main.dc.html` | Foundations: color palette and the 30 color roles, font and font-weight roles, every type step, spacing, shape and line with radius and shadow steps, photography |
| `AllComponents.dc.html` | Every component exported from `src/index.ts` in its key states, drawn with the current `--ds-*` role tokens |
| `Form.dc.html` | Example contact form with live validation (interactive), drawn with the shipped Field, Input, Select, RadioGroup, Checkbox, Button and Alert looks |
| `Textarea.dc.html` | Textarea design (DS-3) |
| `Slider.dc.html` | Slider design (DS-23) |
| `Dialog.dc.html` | Dialog design (DS-19) |
| `Checkbox.dc.html` | Checkbox and CheckboxGroup design (DS-13) |
| `Toggle.dc.html` | Switch, SegmentedControl and TileGroup design (DS-5) |
| `Theming.dc.html` | Theme contract and knobs: roles, color, fonts, type scale, radius, shadow, dark (DS-26) |
| `Themes.dc.html` | Example themes default, dark, bold and bold-dark side by side (each panel sets `data-theme`), with roles, contrast and `createTheme()` inputs (DS-2) |
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
| `Introduction.dc.html` | Storybook Introduction page redesign: the whole page in default, dark, bold and bold-dark, phone width, states, keyboard order, heading outline and contrast (DS-70) |
| `PromoVideo.dc.html` | Promo video storyboard: format and safe areas, timeline, one keyframe per scene in every theme it uses, motion vocabulary and contrast pairs (DS-74) |
| `canvas.json` | Canvas layout (artboard sizes and positions) |

### Role tokens

Every board except `AllComponents.dc.html` and `Theming.dc.html` styles only through `var(--ds-*)` role tokens, so each one follows `data-theme`: set `data-theme="dark"` (or `bold`, `bold-dark` where the theme is loaded) on the page and the whole board recolors. `AllComponents.dc.html` already did this; `Theming.dc.html` shows custom themes, so its hex values are the example themes by design.

Each board carries one token block at the top of its `<style>`, between `/* ds-tokens:start */` and `/* ds-tokens:end */`. It is a copy of `src/styles/tokens.css` (default theme and `[data-theme="dark"]`) without the `@layer ds` wrapper; `Themes.dc.html`, `Introduction.dc.html` and `PromoVideo.dc.html` also carry `src/themes/bold.css`. `src/test/canvasBoards.test.ts` fails when:

- a board has no token block, more than one, or one that differs from `tokens.css` (whitespace, comments and hex case are ignored);
- a hex color or a color function (`rgb()`, `hsl()`, ...) appears anywhere outside the block, except in the exceptions below;
- a board reads a `--ds-*` token that does not exist;
- any board mentions the deleted `Components.dc.html`.

To refresh the blocks after a token change, paste the new `tokens.css` body (and `bold.css` for Themes) between the markers.

#### Illustration-only fills

The only values allowed outside a token block. They are drawings, not UI colors, and they carry a marker attribute the test looks for.

| Board | What | Marker |
| --- | --- | --- |
| `Main.dc.html` | Four grayscale photo stand-ins (landscape, architecture, portrait, texture) in the Photography section. Photography has no color tokens; the SVGs read `--ds-photo-filter` so they dim in dark. | `<svg data-ds-illustration>` |
| `Form.dc.html` | The grayscale building photo stand-in beside the form. | `<svg data-ds-illustration>` |
| `Themes.dc.html` | Four small color-photo stand-ins in the bold panels (bold turns the photo filter off, so they are colored on purpose). | `<svg data-ds-illustration>` |
| `Themes.dc.html` | The `createTheme()` input samples in section 08: `brand: '#4318D1'` and shadow strings are the literal API input being documented. | `<pre data-ds-code>` |
| `Introduction.dc.html` | The `docs/theming-guide/samples/minimal.ts` code sample in the "Customize in minutes" band: `brand: '#0b6e4f'` is the literal sample file shown on the page. | `<pre data-ds-code>` |
| `PromoVideo.dc.html` | The `ds.theme.json` fixture in scene 05 (KF09a, KF09b): `"brand": "#4318D1"` and `"neutral": "#140E3D"` are the literal file shown on screen. | `<pre data-ds-code>` |

Everything else that used to be a hex label is now a role or token name, a swatch or a contrast chip drawn from the role itself (the Themes color-role and contrast tables), so no value is repeated by hand.

### Audit

DS-58 audited every board against `src/index.ts`, `src/components/*` and `src/styles/tokens.css` (the DS-27 role tokens). Result: `Components.dc.html` was deleted, `AllComponents.dc.html` was added, three small token fixes were made, and the rest was flagged. DS-63 cleared the flags: every board now reads `var(--ds-*)`, `Main.dc.html` was brought up to the DS-27 token set, `Form.dc.html` was redrawn, and the dangling `Components.dc.html` mention in `Tabs.dc.html` was removed.

Fixed means edited in DS-58 or DS-63. Shipped component(s) are the exports of `src/index.ts`. Every board below was checked with `data-theme="dark"` in a headless browser; in the default theme the converted boards render pixel-identical to before, apart from the body-font fallback (`system-ui`, now read from `--ds-font-body`). `Main.dc.html`, `Form.dc.html` and `Themes.dc.html` changed on purpose.

| Board | Shipped component(s) | Stale items | Keep / Fix |
| --- | --- | --- | --- |
| `Main.dc.html` | none (foundations, `tokens.css`) | **Fixed (DS-58):** the "Shape & line" snippet named tokens that do not exist; it lists the real ones. **Fixed (DS-63):** now has the color roles (all 30, grouped, drawn from `var(--ds-color-*)`), the palette labeled by token, gray-800 and black with their role uses, font roles, the three font-weight roles, all 15 type steps (display, h1 to h5, body-lg, body, body-sm, body-xs, caption, label, ui, ui-sm, ui-xs; h4 and h5 follow `tailwind.css`), radius steps (`-sm/-md/-lg/-full`) and shadow steps (`-sm/-md/-lg`). Photo stand-ins are illustration-only fills. | Keep; fixed |
| `AllComponents.dc.html` | all 25 components exported from `src/index.ts` | New. Not stale by construction: `var(--ds-*)` only. | Keep |
| `Form.dc.html` | none (pattern); uses Field, Input, Textarea, Select, RadioGroup, Checkbox, Button, Alert looks | **Fixed (DS-63):** rebuilt. Labels, hints and errors follow Field (label role, hint, error with icon); text fields and the textarea follow Input and Textarea; Topic is a Select trigger with a listbox (arrow keys, Home/End, Enter, Escape); Reply by is a RadioGroup (square 24 px boxes); consent is a Checkbox; the error summary is an Alert. Error icons use stroke 2. All values read `var(--ds-*)`. The interactive logic is unchanged apart from the listbox state. | Keep; fixed |
| `Textarea.dc.html` | Textarea, TextareaField, TextareaCounter | **Fixed (DS-63):** role tokens. States, sizes (2/4/8 rows), resize and counter match the code. | Keep; fixed |
| `Slider.dc.html` | Slider, SliderField | **Fixed (DS-63):** role tokens. Shows rejected directions B, C and D as design record; shipped is A Hairline. | Keep; fixed |
| `Dialog.dc.html` | Dialog, DialogClose | **Fixed:** overlay row now `--ds-color-overlay` (DS-58); role tokens (DS-63), the scrim reads `--ds-color-overlay`. | Keep; fixed |
| `Checkbox.dc.html` | Checkbox, CheckboxGroup | **Fixed (DS-63):** role tokens. Sizes, states and group match the code. | Keep; fixed |
| `Toggle.dc.html` | Switch, SegmentedControl, TileGroup (ChoiceGroup is internal, not exported) | **Fixed (DS-63):** role tokens. The "Cards" label is a sample segment name, not a component. | Keep; fixed |
| `Theming.dc.html` | `createTheme`, role exports (`src/theme`, `src/styles/roles.ts`) | None found: already reads `var(--ds-*)` roles; every token it names exists in `tokens.css`. Hex values are the example themes (Orchard, dark) by design. Exempt from the hex test. | Keep |
| `Themes.dc.html` | `createTheme`, `src/themes/bold.css` | **Fixed (DS-63):** panels set `data-theme` instead of hand-written role blocks, so the board shows the shipped values (the token block holds `tokens.css` and `bold.css`). Role and contrast tables are swatches and chips, not hex text. Color-photo stand-ins and the `createTheme()` samples are listed under illustration-only fills. | Keep; fixed |
| `RadioGroup.dc.html` | RadioGroup, RadioGroupItem | **Fixed (DS-63):** role tokens. The 50% circular radio is the "Alternative · not proposed" mock; shipped radios are square (`--ds-radius-full` is 0). | Keep; fixed |
| `InfoTip.dc.html` | InfoTip, Tooltip, TooltipProvider, Popover | **Fixed (DS-63):** role tokens. The 20 px radius is a touch-target overlay, not component shape. | Keep; fixed |
| `Icon.dc.html` | Icon, createIcon, IconProvider (11 private default glyphs) | **Fixed (DS-63):** role tokens. Glyph count, sizes (12/16/20) and strokes (1.5/2) match `glyphs.tsx` and `constants.ts`. | Keep; fixed |
| `Tabs.dc.html` | Tabs | **Fixed (DS-63):** role tokens; the note naming the deleted `Components.dc.html` now says only that the old underline mock was superseded (the underline was rejected; shipped Tabs reuse the segmented and tile looks). | Keep; fixed |
| `Layout.dc.html` | Stack, Grid | **Fixed (DS-63):** role tokens. Gaps, columns, alignments and breakpoints match the code. | Keep; fixed |
| `Select.dc.html` | Select, SelectField | **Fixed (DS-63):** role tokens. | Keep; fixed |
| `Button.dc.html` | Button, IconButton, ButtonGroup | **Fixed (DS-63):** role tokens. Variants, loading, pressed and attached/spaced groups match the code. | Keep; fixed |
| `Toast.dc.html` | ToastProvider, useToast, Toaster | **Fixed (DS-63):** role tokens. Width 384, severities and 2 px error border match the code. | Keep; fixed |
| `Drawer.dc.html` | Drawer, DrawerClose | **Fixed:** overlay row now `--ds-color-overlay` (DS-58); role tokens (DS-63). | Keep; fixed |
| `Typography.dc.html` | none (Tailwind utilities `heading-*` and `body-*` in `tailwind.css`, DS-38) | **Fixed (DS-63):** role tokens. Correctly shows classes, not components. | Keep; fixed |
| `Introduction.dc.html` | none (the Storybook page `src/Introduction.stories.tsx`); uses Button, Tag, SegmentedControl, Breadcrumb, TextField, Switch and Alert looks | New (DS-70). Role tokens only; token block carries `tokens.css` and `bold.css`, like `Themes.dc.html`. | Keep |
| `PromoVideo.dc.html` | none (storyboard for the Remotion video in `video/`, DS-75); uses Button, IconButton, Tag, TextField, Input, Select, Slider, Switch, Checkbox, SegmentedControl and Alert looks | New (DS-74). Role tokens only; token block carries `tokens.css` and `bold.css`, like `Themes.dc.html`. The example brand `my-brand` (scene 02b stage, 02d pane, 05 built panel) is drawn with `bold` as a stand-in for the generated theme (see `docs/specs/PromoVideo.md`). | Keep |
| `Components.dc.html` (deleted) | none | Showed the unbuilt Cards and Table; checkbox, radio and switch as native 20 px controls (shipped: 24 px, 2 px strong border; switch 48 x 24); Tabs as an underline (rejected); an inverse-fill snackbar (shipped Toast differs); pre-DS-27 hex colors. | Deleted; replaced by `AllComponents.dc.html` |

Components with no dedicated board: Alert, Breadcrumb, Tag and Badge, Input, Field and TextField. They were only drawn on the deleted `Components.dc.html`; `AllComponents.dc.html` is now their canvas. A spec-level board for them is a separate design task.

Historical mentions of `Components.dc.html` left as they are: `docs/specs/Tabs.md`, `docs/specs/Toast.md` and `docs/specs/Textarea.md`. No board mentions it.

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
| h4 | Red Hat Mono 500 | 18 / 26 | body-lg size, body line height |
| h5 | Red Hat Mono 500 | 16 / 24 | body size, body-sm line height |
| body-sm | Red Hat Text 400 | 15 / 24 | |
| body-xs | Red Hat Text 400 | 14 / 21 | |
| label | Red Hat Mono 500 | 12 / 16 | +8%, uppercase |
| caption | Red Hat Text 400 | 13 / 20 | gray-600 |
| ui | Red Hat Mono 500 | 14 / 20 | buttons, controls |
| ui-sm | Red Hat Mono 400 | 12 / 16 | tags, counters |
| ui-xs | Red Hat Mono 400 | 11 / 16 | badges |

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
