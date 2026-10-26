# Slider

- task: DS-23
- canvas: docs/design-system-wireframe/Slider.dc.html
- canvas_url: https://claude.ai/artifact/NZrzu3r48VEABES7SWacfJ
- approved: yes
- approved_by: mikespin
- approved_at: 2026-10-26
- approval_hash:

Pick one number by dragging a single thumb along a horizontal track. Built on Radix `Slider`. Works with a uniform scale (`min` / `max` / `step`) or with a custom list of allowed values (`values`, e.g. `[1, 2, 3, 5, 8, 10]`). A value bubble shows above the thumb while dragging (on by default); it can instead be always visible, and then it is an editable numeric input. Alternatively an attached numeric input (`showInput`) sits next to the track. Typed values snap to the nearest allowed value on Enter or blur. Optional − / + stepper buttons ride along the track with a value-showing thumb (`stepper`), marks come in three variants (`marks`: every step, none, ends only), and an optional `unit` is appended to every displayed value.

Canvas section 01 explores four directions: A Hairline, B Block, C Segmented, D Ruler. **Chosen: A Hairline** (2 px gray-500 track, black fill, square white thumb with a 2 px black border, 1 px tick marks, attached Input-style numeric field), picked in review as the default. B, C and D stay on the canvas as explored alternatives only. This spec describes direction A.

Ships as `Slider` (control only, works inside `Field`) and `SliderField` (`Field` + `Slider`, mirrors `TextField` / `TextareaField`).

Proposed API (for the builder; narrow and typed):

```ts
type SliderValue = number;                          // single thumb only; no tuple / range

type SliderScale =
  | { min?: number; max?: number; step?: number; values?: never } // uniform; defaults 0 / 100 / 1
  | { values: readonly number[]; min?: never; max?: never; step?: never }; // custom list

type SliderBubble = 'auto' | 'always' | 'off';

type SliderMarks = 'none' | 'steps' | 'ends' | readonly number[];

type SliderEntry =
  | { bubble?: 'auto' | 'off'; showInput?: boolean }  // read-only bubble (or none); showInput is opt-in, default false
  | { bubble: 'always'; showInput?: never };          // the bubble is the input; no attached input

interface SliderOwnProps {
  value?: SliderValue;                       // controlled; always a real value, never an index
  defaultValue?: SliderValue;                // uncontrolled; default min (custom list: values[0])
  onValueChange?: (value: SliderValue) => void; // every change: drag move, key, input commit
  onValueCommit?: (value: SliderValue) => void; // end of interaction: pointer up, key, input commit
  size?: 'sm' | 'md' | 'lg';                 // default 'md'; 'lg' is the touch size
  marks?: SliderMarks;                       // default: 'steps' for `values`, 'none' for uniform
  stepper?: boolean;                         // − / + buttons riding with a value thumb; default false
  unit?: string;                             // appended to displayed values, e.g. '%', 'cm', 'in'
  formatValue?: (value: number) => string;   // labels, bubble, pill, aria-valuetext; overrides the unit rule
  invalid?: boolean;                         // as Input; Field sets it from `error`
  disabled?: boolean;
  name?: string;                             // form submission of real values (see Radix)
  dir?: 'ltr' | 'rtl';
  id?: string;
  className?: string;
  'aria-label'?: string;                     // only when used outside a Field
  'aria-labelledby'?: string;
}
export type SliderProps = SliderOwnProps & SliderScale & SliderEntry;

export type SliderFieldProps = SliderProps & {
  label: ReactNode; hint?: ReactNode; error?: ReactNode; required?: boolean; fieldClassName?: string;
};
```

- Single thumb only. `value`, `defaultValue` and both callbacks always use one `number`; range (two thumbs) is out of scope.
- `bubble` (default `'auto'`):
  - `'auto'`: read-only value bubble, shown only while dragging or while the thumb has keyboard focus. Presentational (`aria-hidden`).
  - `'always'`: the bubble is always visible and is a real text input (the "bubble input"). Typing follows the same parse / clamp / snap / commit rules as the attached input. It replaces the attached input, so `showInput` is not allowed with it (type error; dev warning in JS if both are passed, `showInput` is ignored).
  - `'off'`: no bubble.
- `showInput` (default `false`) is opt-in. The default Slider is the track alone with the `auto` bubble; the attached input is added only where typing next to the track is wanted.
- `marks` (canvas sections 04 and 06):
  - `'steps'`: a tick at every allowed value. Uniform scales label min and max only; custom lists label every value. More than 21 allowed values falls back to `'ends'` (dev warning).
  - `'none'`: no ticks, no labels.
  - `'ends'`: a tick at min and at max only, with the min and max labels under them.
  - `number[]`: a tick and a label at each listed value (custom list: ticks stay at every value, labels only at the listed ones).
- `stepper` (default `false`): see Stepper below. The thumb becomes a value pill showing `formatValue(v)`, flanked by a − button before it and a + button after it; the group rides along the track.
- `unit`: the default display is `${v}${sep}${unit}`, where `sep` is nothing for `%` and `°` and a non-breaking space (U+00A0) for any other unit, so `unit="cm"` shows "239 cm" and `unit="%"` shows "40%". Used in the bubble, the value pill, mark labels and `aria-valuetext`. If `formatValue` is passed it fully owns the display and `unit` is not appended again (it is still used for parsing typed text). The attached input and the bubble input show the bare number with the unit as a static suffix (see Accessibility).
- `ref` forwards to the Radix `Slider.Root` element. Rest props are not spread (narrow API); `className` goes to the root wrapper.
- Dev-only `console.warn` (no throw) when: `values` is empty, unsorted, has duplicates or non-finite numbers; `(max − min)` is not a multiple of `step`; a `marks` entry is not an allowed value (it is snapped); `value` is not an allowed value (it is snapped for display; `onValueChange` is not fired for that).

## Sizes

Size changes the root height (which is the hit area), the thumb, the fill thickness, the tick length and, when `showInput` is on, the attached input height. The unfilled track is 2 px at every size. Width is always 100 % of the container. Input type stays body 16 at every size, as in `Input`.

| Size | Root / hit height | Thumb | Fill | Ticks | Input, `showInput` only (w × h) | Use |
| --- | --- | --- | --- | --- | --- | --- |
| `sm` | 32 px | 12 × 12 | 2 px | 4 px | 64 × 32 | dense desktop panels (≥ 24 px, WCAG 2.5.8; not for touch) |
| `md` (default) | 44 px (= control height) | 16 × 16 | 4 px | 8 px | 64 × 44 | desktop forms; lines up with `Input` |
| `lg` | 48 px | 24 × 24 | 8 px | 8 px | 64 × 48 | touch and mobile forms (≥ 44 px) |

Bubble sizes:

| Bubble | sm / md | lg | Touch drag (lifted, any size) |
| --- | --- | --- | --- |
| `auto` (read-only) | Red Hat Mono 500 12/16, padding 4 / 8, about 24 px tall | same | Red Hat Mono 500 22/29 (h3), 48 px tall, min width 64, padding 0 / 12 |
| `always` (bubble input) | 32 px tall, min width 48, padding 0 / 8, Red Hat Mono 500 16 | 44 px tall, min width 64, padding 0 / 8, Red Hat Mono 500 16 | Red Hat Mono 500 22/29 (h3), 48 px tall, min width 64, padding 0 / 12 |
| Gap, bubble bottom to thumb top | 8 px | 8 px | 48 px |

- The bubble input uses 16 px text at every size, so iOS does not zoom the page on focus. Its width grows with the longest formatted value (`ch`-based, text centered) and never drops below the min width.

Stepper sizes (`stepper`; canvas section 06). Corners are square (`--ds-radius-md` = 0): Hairline has no pills or circles, so the "pill" is a square-cornered value block.

| Size | Value pill (h × min w) | Pill text | − / + buttons | Icon | Gap button to pill | Root side inset |
| --- | --- | --- | --- | --- | --- | --- |
| `sm` | 24 × 64 | Red Hat Mono 500 12/16 | 24 × 24 | 12 px | 4 px | button + gap + half pill |
| `md` | 32 × 64 | Red Hat Mono 500 16 | 32 × 32 | 16 px | 4 px | button + gap + half pill |
| `lg` (touch) | 44 × 64 | Red Hat Mono 500 16 | 44 × 44 | 16 px | 4 px | button + gap + half pill |

- The pill's width is fixed per instance from the longest formatted value (`ch`-based, so it never changes width while dragging) and never drops below 64 px. Root heights stay 32 / 44 / 48.
- On touch, use `lg`: its buttons are 44 × 44. `sm` (24) and `md` (32) meet WCAG 2.5.8 and are for fine pointers only.

Layout (canvas sections 02, 05, 06, 07):

- With `showInput`: `[track][16 px gap][input]`. The input sits on the same row and its top aligns with the root; mark labels sit under the track only.
- Bubble placement: centered over the thumb using the same mapping as ticks (below), clamped horizontally so it never leaves the wrapper: at the ends it slides inward and stops flush with the root edge.
- `bubble="always"`: the wrapper reserves space above the root for the bubble input (bubble height + 8 px: 40 px at sm / md, 52 px at lg), so it never covers the label. `bubble="auto"` reserves nothing; the bubble overlays content above while visible.
- Touch lift: while a touch drag is in progress (`@media (pointer: coarse)` and dragging), the bubble (both `auto` and `always`) grows to the lifted size and moves up so its bottom is 48 px above the thumb top, clear of a fingertip (about 10 mm). It may overlay the label for the duration of the drag (it sits above field content in z-order). On release it returns to its resting size. Size and position change with `--ds-motion`; instant under `prefers-reduced-motion: reduce`. Fine pointers (mouse, pen) never lift.
- Ticks start 4 px below the track's lower edge. Mark labels: 4 px under the root, label style without uppercase (Red Hat Mono 12/16), centered on the tick, tabular numbers.
- Thumb placement follows Radix: the thumb stays inside the root (Radix in-bounds offset), so at min its left edge touches the root's left edge. Ticks and labels must use the same mapping: `left: calc(var(--slider-thumb-size) / 2 + p * (100% - var(--slider-thumb-size)))`, where `p` is the 0..1 position and `--slider-thumb-size` is a component-local variable set per size from the token in the Tokens table. Edge labels may overflow the root by half their width; the wrapper reserves no extra space.
- Position `p`: uniform `(v − min) / (max − min)`; custom list `index / (values.length − 1)` (equal spacing per value, not proportional).
- Stepper layout: `[−][4 px][value pill][4 px][+]`, vertically centered on the track, horizontally centered on the pill. The pill is the Radix thumb, so Radix keeps it inside the track; the root adds a side inset of `button + 4 px + half the pill width` on both sides (md with a 64 px pill: 68 px), and the track, ticks and labels run inside that inset. So at min the − button sits flush with the root's left edge and at max the + button with the right edge: the group never overflows and never needs clamping.
- Stepper ticks: the pill would cover ticks drawn below the track, so with `stepper` the ticks are drawn across the track (centered vertically, same length per size), matching the "dots" reading: ticks under the fill black, ahead of the thumb gray-500; ticks under the group are hidden by it. Mark labels stay 4 px under the root.

## States

All states apply to every size and to both uniform scales and custom lists. The Input column applies only with `showInput`. Canvas section 03 has one artboard per row (default slider without the input; the two input rows use `showInput`); section 04 shows marks in default and disabled.

| State | Trigger | Track (unfilled) | Fill | Thumb | Ticks / labels | Input | Other |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Default | none | 2 px gray-500 | black | white fill, 2 px black border | ticks under the fill black, others gray-500; labels gray-600, current value's label black 500 | as `Input` default (1 px gray-300) | root `cursor: pointer`, thumb `cursor: grab` |
| Hover | root `:hover`, not disabled | unchanged | unchanged | fill gray-100 | unchanged | unchanged | transition `--ds-motion` |
| Focus-visible (thumb) | thumb `:focus-visible` | unchanged | unchanged | 2 px black outline, 2 px offset (border unchanged) | unchanged | unchanged | `auto` bubble shows (default) |
| Dragging | root `:active`, not disabled (pointer down on track or thumb) | unchanged | follows pointer | fill black (border black) | update live | mirrors value live | `cursor: grabbing`; `auto` bubble shows (default); touch: bubble lifts (see Sizes) |
| Disabled | `disabled` (Radix `[data-disabled]`) | gray-200 | gray-400 | fill gray-50, 2 px gray-400 border | ticks gray-300; labels gray-500 | as `Input` disabled | label gray-500, `cursor: not-allowed`, thumb and input leave the tab order, no hover |
| Invalid | `invalid`, Field `error` (`aria-invalid="true"`) | unchanged | error | 2 px error border | ticks under the fill error | 2 px error border | Field message: alert icon + "Error: ..." |
| Invalid + focus | invalid and thumb `:focus-visible` | unchanged | error | error border kept + 2 px black outline | as invalid | as invalid | |
| Input hover (`showInput` only) | input `:hover` | unchanged | unchanged | unchanged | unchanged | 1 px black border | as `Textarea` hover |
| Input focus (`showInput` only) | input `:focus-visible` | unchanged | unchanged | unchanged | unchanged | 1 px black border + 2 px black outline, 2 px offset (invalid keeps the error border) | typed draft is not applied until commit |

Options:

| Option | Look | When visible |
| --- | --- | --- |
| Value bubble, `bubble="auto"` (default) | gray-900 fill, white Red Hat Mono 500 12/16, padding 4 / 8 px, square, 8 px above the thumb, centered; text = `formatValue(v)` | only while dragging (root `:active`) or thumb `:focus-visible`; never on hover alone; never when disabled |
| Bubble input, `bubble="always"` | editable input above the thumb; states below | always, including disabled (dimmed) |
| No bubble, `bubble="off"` | nothing | never |

Bubble input states (`bubble="always"`, canvas section 05). The thumb, track and fill follow the main table; this covers the bubble input only. Text is the bare number (as the attached input), not `formatValue`; with `unit` a gray-600 unit suffix follows it inside the box.

| State | Trigger | Fill | Border | Text | Other |
| --- | --- | --- | --- | --- | --- |
| Default | none | white | 1 px black | black, Red Hat Mono 500 16, centered, tabular | `cursor: text`; black border (not gray-300 as `Input`) because it floats over the track and must reach 3:1 |
| Hover | bubble input `:hover`, not disabled | gray-100 | 1 px black | black | transition `--ds-motion` |
| Focus (typing) | bubble input `:focus-visible` | white | 1 px black + 2 px black outline, 2 px offset | black, caret | draft is not applied until commit; the thumb does not move while typing |
| Dragging | wrapper `:has(root:active)` | gray-900 | gray-900 | white | follows the thumb, mirrors the value live (inverts like the thumb); touch: lifted size and offset |
| Disabled | `disabled` | gray-50 | 1 px gray-200 | gray-500 | native `disabled`, `cursor: not-allowed`, no hover, out of the tab order; stays visible |
| Invalid | `invalid` / Field `error` | white | 2 px error | black | `aria-invalid="true"`; with focus keeps the error border and adds the black outline; Field message carries the meaning |

### Stepper (`stepper`)

Canvas section 06. Track, fill and ticks follow the main table (ticks across the track, see Layout).

Behavior:

- Each press of − / + moves exactly one step to the previous / next allowed value: `∓ step` on a uniform scale, the previous / next item in a custom `values` list. The result is clamped to `[min, max]`; it fires `onValueChange` then `onValueCommit` once. No press-and-hold auto-repeat (out of scope).
- At min the − button is `disabled`; at max the + button is `disabled`. Both are disabled when the slider is disabled.
- The pill is the thumb: dragging it works as before, and its text is `formatValue(v)` (with `unit`).
- With `bubble="auto"` (default) the pill already shows the value, so the `auto` bubble is not shown on fine pointers; it shows only during a touch drag, lifted (the finger covers the pill). With `bubble="off"` it never shows.
- With `bubble="always"` the pill itself is the editable input (there is no separate bubble above). A click or tap on the pill that does not move it (pointer up within 4 px, value unchanged), or Enter on the focused pill, opens edit mode: a text input replaces the pill in place, same box, text selected. Enter commits and returns focus to the pill; Esc discards and returns focus to the pill; blur and Tab commit and close edit mode. Pressing − / + while editing first commits by blur, then steps from the committed value. Typing follows the Snapping rules.
- `showInput` may be combined with `stepper`; the attached input sits after the track as usual.

States:

| Part · state | Trigger | Fill | Border | Text / icon | Other |
| --- | --- | --- | --- | --- | --- |
| Button · default | none | white | 1 px black | black − / + icon, 2 px stroke | `cursor: pointer` |
| Button · hover | button `:hover`, enabled | gray-100 | 1 px black | black | transition `--ds-motion` |
| Button · pressed | button `:active`, enabled | black | 1 px black | white | value has already moved one step |
| Button · focus-visible | button `:focus-visible` (assistive tech or programmatic; not in the tab order) | white | 1 px black + 2 px black outline, 2 px offset | black | |
| Button · at end | value is min (−) or max (+); native `disabled` | gray-50 | 1 px gray-200 | gray-400 | `cursor: not-allowed`, no hover |
| Button · slider disabled | `disabled` | gray-50 | 1 px gray-200 | gray-400 | both buttons |
| Pill · default | none | white | 2 px black | black, Red Hat Mono 500, tabular, centered | `cursor: grab` |
| Pill · hover | root `:hover` | gray-100 | 2 px black | black | |
| Pill · focus-visible | thumb `:focus-visible` | white | 2 px black + 2 px black outline, 2 px offset | black | |
| Pill · dragging | root `:active` | black | 2 px black | white | `cursor: grabbing`; touch: lifted `auto` bubble above |
| Pill · editing (`bubble="always"`) | edit mode open | white | 2 px black + 2 px black outline, 2 px offset | black, caret, text selected | the pill is a text input until commit or Esc |
| Pill · disabled | `disabled` | gray-50 | 2 px gray-400 | gray-500 | not focusable |
| Pill · invalid | `invalid` / Field `error` | white | 2 px error | black | fill and under-fill ticks error as in the main table; buttons unchanged |

Notes:

- Style state only with pseudo-classes and Radix attributes: `:hover`, `:active`, `:focus-visible`, `[data-disabled]`, `[aria-invalid="true"]`. Radix has no dragging attribute; dragging is `:active` on the root, which covers presses on the thumb and the track because the thumb is a descendant. The bubble input sits outside the root, so its dragging and lifted styles use the wrapper selector `:has(<root>:active)`; the touch lift adds `@media (pointer: coarse)`. No JS state for visuals.
- Invalid uses the status hue on the fill, the thumb border and the input, and is always paired with the Field error message (icon + "Error:"), never color alone.
- Out of scope (canvas section 09): range / two thumbs (or more), press-and-hold repeat on stepper buttons, rounded pill or circular buttons (Hairline is square), vertical orientation, read-only (Radix Slider has none; use `disabled` or show the value as text), proportional or log spacing for custom lists, clickable mark labels, bubble on hover, spin buttons on the input.
- The only JS state the wrapper holds is the input's (or bubble input's) draft text while it is focused, the stepper edit-mode flag, and the controlled / uncontrolled value. If the thumb is dragged while the bubble input holds a draft, the draft is discarded and the bubble shows the dragged value.

### Steps and custom values (snapping)

Uniform mode (`min` / `max` / `step`):

- Passed to Radix as is. Allowed values = `{ min + k × step | k ≥ 0 } ∩ [min, max]`. If `max` is off-grid, the largest reachable value is the last grid point below `max` (Radix behavior); dev warning.
- `marks="steps"`: a tick at every allowed value when there are ≤ 21 of them, labels at min and max only. More than 21: behaves as `'ends'` (dev warning). `marks="ends"`: ticks and labels at min and max only. `marks="none"` (default): nothing. `marks={[...]}`: tick and label at each listed value.

Custom list mode (`values`):

- Radix receives `min={0}`, `max={values.length - 1}`, `step={1}` and the index. The wrapper converts both ways: `index = values.indexOf(v)` in, `values[index]` out. Public callbacks and `value` always use real values.
- Equal spacing: every value gets the same share of the track, so 1, 2, 3, 5, 8, 10 sit at 0, 20, 40, 60, 80, 100 %.
- `marks` defaults to `'steps'`: a tick and a label at every value. `'ends'`: ticks and labels at the first and last value only. `'none'`: nothing. `marks={[...]}` limits labels to the listed values (ticks stay at every value).

Typed input (`showInput` input, `bubble="always"` bubble input, or the stepper pill in edit mode; identical rules), applied on Enter, on blur and on Tab:

1. Parse: trim; if `unit` is set, strip it from the end (case-insensitive, with or without whitespace before it), so "239", "239cm" and "239 cm" all read as 239. Then accept an optional leading `-` or `−`, digits, and one decimal separator (`.` or `,`). Anything else, or empty: revert the input to the current value, fire nothing.
2. Clamp to `[min, max]` (custom list: `[values[0], values[last]]`).
3. Snap: uniform `min + round((v − min) / step) × step`; custom list: the value with the smallest `|v − value|`. Ties go to the higher value (4 in `[3, 5]` → 5; 42.5 with step 5 → 45). Round the result to the step's decimal places to remove float noise (0.1 + 0.2).
4. Show the snapped value in the input. If it differs from the current value, fire `onValueChange` then `onValueCommit` once each. If the snapped value differs from what was typed, announce "Set to {formatValue(v)}" in a polite live region.
5. Esc while editing: discard the draft, show the current value, keep focus.

Snapping never produces an error state; the input always ends on an allowed value.

## Keyboard

Thumb keys come from Radix `Slider` (no custom key handling, except Enter to open stepper edit mode). In a custom list, one step = one list item.

| Key (thumb focused) | Action |
| --- | --- |
| Right Arrow, Up Arrow | Increase by one step (next allowed value). In `dir="rtl"`, Left Arrow increases. |
| Left Arrow, Down Arrow | Decrease by one step. |
| Page Up, Shift + Right/Up Arrow | Increase by 10 steps, clamped to max (a 6-item list reaches the end). |
| Page Down, Shift + Left/Down Arrow | Decrease by 10 steps, clamped to min. |
| Home / End | Go to min / max. |
| Tab / Shift + Tab | Move to the next / previous focusable element. |
| Esc | No action; bubbles so a parent Dialog or Popover can close. |
| Enter | `stepper` with `bubble="always"` only: open edit mode on the pill (input in place, text selected). Otherwise no action. |

| Key (stepper button, reached by assistive tech) | Action |
| --- | --- |
| Enter, Space | One step down (−) or up (+), clamped. Native `<button>` behavior. |

| Key (input, bubble input or pill in edit mode) | Action |
| --- | --- |
| Enter | Parse, clamp, snap, commit (see Snapping). `preventDefault`, so it never submits the form. Focus stays (pill edit mode: closes and focus returns to the pill). |
| Tab / Shift + Tab, blur | Same commit, then focus moves (pill edit mode closes). |
| Esc | If there is a draft, discard it and stop propagation; otherwise bubble. Pill edit mode: always discards, closes, returns focus to the pill and stops propagation. |
| Arrow keys, Home, End | Native caret movement only (the input is `type="text"`, no spin behavior). |

Focus order (DOM order):

- Thumb, then input (when `showInput` is on) or thumb, then bubble input (`bubble="always"`). The bubble input comes after the thumb in the DOM even though it is drawn above it.
- Stepper buttons have `tabIndex={-1}`: they are not tab stops, because the thumb's Arrow keys already step by exactly the same amount, and three tab stops per slider would slow keyboard users down. They stay real, named `<button>`s, so screen-reader users can reach and activate them in browse mode, and pointer users click them. DOM order: −, thumb (pill), +, then any input.
- The label is not focusable. Clicking it focuses the input or the bubble input when there is one, otherwise the thumb. Clicking the bubble input focuses it (it never starts a drag). Disabled: thumb, input and bubble input are skipped.
- Pressing on the track moves the thumb there and focuses it (Radix). The focus ring shows only for `:focus-visible`.

## Radix

- Control: `Slider` from `radix-ui` (`import { Slider } from 'radix-ui'`): `Slider.Root`, `Slider.Track`, `Slider.Range`, exactly one `Slider.Thumb` (Radix always receives a one-element array). `orientation="horizontal"`, `inverted={false}` (not exposed). Radix owns pointer and keyboard interaction, thumb focus, `role="slider"`, `aria-orientation` and `data-disabled`.
- Values mode: pass indices to Radix (see Snapping). On the `Slider.Thumb` override `aria-valuemin`, `aria-valuemax` and `aria-valuenow` with real values (`values[0]`, `values[last]`, `values[index]`) and always set `aria-valuetext={formatValue(v)}`. Radix spreads Thumb props after its own ARIA attributes, so the override wins; a test must assert it.
- Forms: do not pass `name` to Radix (in values mode it would submit the index). The wrapper renders one `<input type="hidden" name={name} value={v}>` with the real value. The attached numeric input and the bubble input have no `name`.
- Marks, labels and the `auto` bubble are plain presentational elements (`aria-hidden="true"`), not Radix parts. The `auto` bubble renders inside `Slider.Thumb` and is shown by CSS only.
- Bubble input (`bubble="always"`): a native `<input type="text" inputMode="decimal">` rendered as a sibling after `Slider.Root` inside the wrapper, never inside `Slider.Thumb` (no focusable element nested in `role="slider"`) and outside the root (so pressing it does not start a Radix drag). It is positioned over the thumb with the same mapping as the ticks, from a component-local `--slider-p` set inline from the value.
- Stepper: the pill is `Slider.Thumb` with the formatted value as its child (text `aria-hidden`; the thumb is named by `aria-labelledby` and valued by `aria-valuetext`). Give it a fixed `ch`-based width so Radix's in-bounds offset (measured from the thumb size) stays stable. The − and + are native `<button type="button">` siblings outside `Slider.Root` (so pressing them never starts a Radix drag), positioned with `--slider-p` like the bubble input; their handlers compute the previous / next allowed value and set it through the same controlled / uncontrolled path as typing. Edit mode renders the bubble input in place of the pill (same position and size) and hides the pill visually while open. The root's side inset is a component-local padding (see Layout), not a Radix option.
- Numeric input: reuse `Input` (`src/components/Input/Input.tsx`) with `type="text"` and `inputMode="decimal"`, not a new input style. The bubble input shares the parse / snap logic and the `Input` reset styles, with its own bubble styling (see States). No Radix primitive exists for a number field; parsing and snapping are wrapper logic.
- Label: `Label` from `radix-ui` through the existing `Field`. Wiring:
  - Slider calls `useFieldControl()`. With `showInput` the Field `id` goes on the input, with `bubble="always"` on the bubble input, so the label's `htmlFor` works natively. Without either, the `id` goes on the thumb.
  - The thumb is a `span`, which `htmlFor` cannot label, so it uses `aria-labelledby`. This needs one additive change to `Field`: give the `Label.Root` `id={`${controlId}-label`}` and expose it through a new `useFieldLabelId()` hook (separate context value so `Input` and `Textarea`, which spread `useFieldControl()`, are unaffected).
  - Clicking the label without an input must focus the thumb: `Label` `onClick` calls `thumb.focus()` (done via a ref inside `Slider`; no change to `Input` behavior).
  - `aria-invalid`, `aria-describedby`, `aria-required` from Field go on the thumb and the input (or bubble input). `disabled` from Field becomes Radix `disabled` and input `disabled`.

## Tokens

| Property | Token |
| --- | --- |
| Root / hit height, md | `--ds-control-height` |
| Root / hit height, sm | `--ds-space-8` |
| Root / hit height, lg | `--ds-space-12` |
| Thumb size sm / md / lg | `--ds-space-3` / `--ds-space-4` / `--ds-space-6` |
| Thumb border width | 2 px (Tailwind `border-2`, as the `Input` invalid border; see Token requests) |
| Thumb fill, default | `--ds-color-surface` |
| Thumb fill, hover | `--ds-color-fill` |
| Thumb fill, dragging | `--ds-color-ink` |
| Thumb border, default / hover / dragging | `--ds-color-ink` |
| Thumb border, invalid | `--ds-color-error` |
| Thumb fill, disabled | `--ds-color-surface-subtle` |
| Thumb border, disabled | `--ds-color-disabled` |
| Unfilled track thickness | 2 px (Tailwind `h-0.5`; see Token requests) |
| Unfilled track color | `--ds-color-placeholder` (gray-500, 4.5:1 on white) |
| Unfilled track, disabled | `--ds-color-divider` |
| Fill thickness sm / md / lg | 2 px (see Token requests) / `--ds-space-1` / `--ds-space-2` |
| Fill color | `--ds-color-ink` |
| Fill, invalid | `--ds-color-error` |
| Fill, disabled | `--ds-color-disabled` |
| Tick width | `--ds-border-width` |
| Tick length sm / md / lg | `--ds-space-1` / `--ds-space-2` / `--ds-space-2` |
| Tick gap below track | `--ds-space-1` |
| Tick, outside fill | `--ds-color-placeholder` |
| Tick, under fill | `--ds-color-ink` (invalid: `--ds-color-error`) |
| Tick, disabled | `--ds-color-border` |
| Mark label | `--ds-font-mono`, 12/16 (label style without uppercase), `--ds-color-text-muted`, tabular numbers |
| Mark label, current value | `--ds-color-ink`, weight 500 |
| Mark label, disabled | `--ds-color-placeholder` |
| Mark labels gap below root | `--ds-space-1` |
| Bubble fill / text | `--ds-color-inverse` / `--ds-color-primary-contrast` |
| Bubble type | `--ds-font-mono`, 12/16, weight 500, tabular numbers |
| Bubble padding | `--ds-space-1` vertical, `--ds-space-2` horizontal |
| Bubble offset above thumb | `--ds-space-2` |
| Bubble input height sm / md / lg | `--ds-space-8` / `--ds-space-8` / `--ds-control-height` |
| Bubble input min width sm / md / lg | `--ds-space-12` / `--ds-space-12` / `--ds-space-16` |
| Bubble input padding | `--ds-space-2` horizontal |
| Bubble input type | `--ds-font-mono`, 16 px (body size), weight 500, tabular numbers, centered |
| Bubble input fill / border / text, default | `--ds-color-surface` / `--ds-border-width` `--ds-color-ink` / `--ds-color-ink` |
| Bubble input fill, hover | `--ds-color-fill` |
| Bubble input, dragging | fill and border `--ds-color-inverse`, text `--ds-color-primary-contrast` |
| Bubble input, disabled | fill `--ds-color-surface-subtle`, border `--ds-color-divider`, text `--ds-color-placeholder` |
| Bubble input border, invalid | 2 px `--ds-color-error` (as `Input`; see Token requests) |
| Bubble input reserved space above root | bubble input height + `--ds-space-2` |
| Touch lift, bubble height / min width | `--ds-space-12` / `--ds-space-16` |
| Touch lift, padding | `--ds-space-3` horizontal |
| Touch lift, type | `--ds-font-mono`, h3 22/29, weight 500 |
| Touch lift, gap bubble bottom to thumb top | `--ds-space-12` |
| Touch lift, transition | `--ds-motion` (size and position; none under reduced motion) |
| Stepper pill height sm / md / lg | `--ds-space-6` / `--ds-space-8` / `--ds-control-height` |
| Stepper pill min width | `--ds-space-16` |
| Stepper pill padding | `--ds-space-2` horizontal |
| Stepper pill type | `--ds-font-mono`, weight 500, tabular; 12/16 at sm, 16 px at md / lg |
| Stepper pill border | 2 px (as the thumb; see Token requests) `--ds-color-ink`; invalid `--ds-color-error`; disabled `--ds-color-disabled` |
| Stepper pill fill | `--ds-color-surface`; hover `--ds-color-fill`; dragging `--ds-color-ink` with text `--ds-color-primary-contrast`; disabled `--ds-color-surface-subtle` with text `--ds-color-placeholder` |
| Stepper button size sm / md / lg | `--ds-space-6` / `--ds-space-8` / `--ds-control-height` |
| Stepper button icon sm / md / lg | `--ds-space-3` / `--ds-space-4` / `--ds-space-4`, 2 px stroke, `currentColor` |
| Stepper button border | `--ds-border-width` `--ds-color-ink` |
| Stepper button fill / icon, default | `--ds-color-surface` / `--ds-color-ink` |
| Stepper button, hover | fill `--ds-color-fill` |
| Stepper button, pressed | fill `--ds-color-ink`, icon `--ds-color-primary-contrast` |
| Stepper button, disabled (at end or slider disabled) | fill `--ds-color-surface-subtle`, border `--ds-color-divider`, icon `--ds-color-disabled` |
| Stepper gap, button to pill | `--ds-space-1` |
| Stepper root side inset | button size + `--ds-space-1` + half the pill width (computed) |
| Unit suffix in inputs | `--ds-font-mono`, `--ds-color-text-muted`, `--ds-space-1` before it |
| Input width | `--ds-space-16`, plus the unit suffix width when `unit` is set |
| Input height sm / md / lg | `--ds-space-8` / `--ds-control-height` / `--ds-space-12` |
| Input, all other properties and states | as `Input` (`--ds-color-border`, `--ds-color-ink`, `--ds-color-error`, `--ds-color-divider`, `--ds-color-surface-subtle`, `--ds-color-placeholder`, `--ds-font-text`, padding `--ds-space-3`, sm `--ds-space-2`); text right-aligned, tabular numbers |
| Gap track to input | `--ds-space-4` |
| Label to control, control to hint gap | `--ds-space-2` (from `Field`) |
| Label | `--ds-color-ink`, `--ds-font-mono`, label style 12/16 uppercase +8 %; disabled `--ds-color-placeholder` |
| Hint | `--ds-color-text-muted`, caption 13/20 |
| Error message | `--ds-color-error`, caption 13/20 weight 500, 14 px alert icon (from `Field`) |
| Focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Corner radius (thumb, bubble, track, input) | `--ds-radius-md` |
| Hover / state transition | `--ds-motion` (background-color, border-color only, plus the touch lift; never animate thumb position) |

## Accessibility

- Roles: the thumb is `role="slider"` (Radix) with `aria-orientation="horizontal"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (real values, also in values mode) and `aria-valuetext` = `formatValue(v)` (e.g. "100%", "€200"). The attached input and the bubble input are native `textbox`es; no `spinbutton` role (no arrow stepping). The bubble input is a real control: never `aria-hidden`, always in the accessibility tree; the thumb keeps `aria-valuetext`.
- Names: from the visible Field label. Thumb `aria-labelledby` = label id; input or bubble input labelled natively by `htmlFor`. A bare `Slider` outside a Field needs `aria-label` or `aria-labelledby` (dev warning if missing); document it in a story.
- Stepper buttons: native `<button type="button">`, named "Decrease {label}" / "Increase {label}" via `aria-labelledby="{hiddenVerbId} {labelId}"` (visually hidden "Decrease" / "Increase" span plus the Field label), `aria-controls` = the thumb id, `tabIndex={-1}` (the thumb's Arrow keys are the keyboard path; see Keyboard). Native `disabled` at the end they can't pass. Icons are `aria-hidden`. When a button press changes the value, the polite live region announces `formatValue(v)` (e.g. "180 cm"), because focus is not on the thumb.
- Unit: `aria-valuetext` includes it ("239 cm"). The attached input and the bubble input show the bare number with an `aria-hidden` visual suffix; the unit joins their accessible name through `aria-labelledby="{labelId} {unitId}"` with a visually hidden unit span (name "Height cm"). Typing the unit is allowed (see Snapping).
- Description: `aria-describedby` from Field (hint, then error) on the thumb and the input or bubble input.
- Invalid: `aria-invalid="true"` on the thumb and the input or bubble input; Field error starts with screen-reader "Error: " and has the alert icon. Never color alone.
- Required: `aria-required="true"` from Field on the input (thumb too; `aria-required` is allowed on `slider`). Visible asterisk is `aria-hidden`.
- Disabled: Radix `disabled` removes the thumb from the tab order and sets `data-disabled`; the input uses native `disabled`.
- Presentational parts: ticks, mark labels and the `auto` bubble are `aria-hidden="true"`; the value is exposed through `aria-valuetext`. The snap message ("Set to 5") uses one visually hidden `aria-live="polite"` region per Slider.
- Contrast: fill and thumb border black on white 21:1; unfilled track gray-500 on white 4.5:1 and ticks gray-500 (both meet 3:1 for non-text, WCAG 1.4.11); invalid fill error on white 7:1; bubble white on gray-900 about 18:1; mark labels gray-600 7:1; focus ring black 21:1; hover thumb gray-100 keeps its black border (21:1); bubble input black text and 1 px black border on white 21:1 (border meets 3:1 against the white ground and the gray-500 track), dragging white on gray-900 about 18:1, lifted bubble text 22 px. Disabled parts are exempt as inactive.
- Target size: md root 44 px tall and full width, lg 48 px; Radix moves the thumb on press anywhere on the root, so the thumb's effective target is the full root height. sm (32 px) meets WCAG 2.5.8 but is desktop-only. The input is at least 44 px at md and lg. The bubble input is 32 px at sm / md (meets 2.5.8, desktop) and 44 px at lg. The touch lift keeps the value readable above the finger during a drag. Stepper buttons are 44 × 44 at lg (the touch size), 32 at md and 24 at sm (2.5.8 minimum, fine pointers only); the 4 px gap keeps them from overlapping the pill.
- Motion: thumb movement is never animated; color transitions and the touch lift use `--ds-motion` and are dropped under `prefers-reduced-motion: reduce`.
- `jest-axe` should verify no violations for: single default in `SliderField`, with hint, invalid with error, disabled, with `showInput`, with `bubble="always"` (default, invalid, disabled), custom `values` with marks (`'steps'`, `'none'`, `'ends'`), `stepper` (default, at min with − disabled, disabled, invalid, edit mode), `unit` with `showInput`, and a bare `Slider` with `aria-label`.
- Tests with `userEvent` should also check: Arrow, Page Up/Down, Home/End move by the right amounts in uniform and values mode (values mode: Right from 3 gives 5, `aria-valuenow="5"`, `aria-valuetext` from `formatValue`); Tab order (thumb then input); label click focuses the input, or the thumb without one; typing 4 + Enter in `[1, 2, 3, 5, 8, 10]` gives 5 and calls `onValueChange` and `onValueCommit` once; 120 clamps to 100; "abc" reverts without callbacks; Esc discards the draft; Enter does not submit a wrapping form; the disabled thumb and input are skipped; the hidden form input submits the real value, not the index. Bubble: with no `bubble` prop the `auto` bubble renders and is `aria-hidden`; `bubble="off"` renders none; `bubble="always"` renders a textbox named by the label, Tab order thumb then bubble input, label click focuses it, typing 4 + Enter in `[1, 2, 3, 5, 8, 10]` gives 5, Esc discards the draft, pointer down on it does not change the value; `showInput` with `bubble="always"` warns and renders one input only. Stepper: clicking + on a uniform 100–250 step 10 scale at 180 gives 190; on `[24, 27, 32, 43, 55, 65]` at 43 gives 55 and − gives 32; − is `disabled` at min and + at max; each click fires `onValueChange` and `onValueCommit` once; buttons are skipped by Tab (thumb is the only tab stop besides inputs); buttons are named "Decrease {label}" / "Increase {label}" and have `aria-controls` = thumb id; with `bubble="always"`, Enter on the pill opens edit mode, typing "239 cm" + Enter commits, Esc closes and refocuses the pill. Unit: `aria-valuetext` is "239 cm" for `unit="cm"` and "40%" for `unit="%"`; typing "239", "239cm" and "239 cm" all commit 239; `formatValue` overrides the unit display. Marks: `'none'` renders no ticks, `'ends'` renders two ticks and two labels, `'steps'` with more than 21 values falls back to `'ends'` with a warning. `ResizeObserver` and `PointerEvent` may need stubs in `jest.setup.ts` for Radix Slider.

## Token requests

- `--ds-border-width-strong: 2px` — used for the slider thumb border, the 2 px unfilled track, the sm fill, the bubble input's invalid border and the stepper pill border. The same 2 px is already hard-coded as Tailwind `border-2` for the invalid border in `Input` and `Textarea`, so one token would cover all of them. If declined, the builder uses Tailwind `border-2` / `h-0.5` as `Input` does today, and nothing else changes.
- Touch lift: no new token needed. The lifted bubble (48 px tall, min width 64, 22 px text) and its 48 px gap above the thumb map to existing `--ds-space-12`, `--ds-space-16`, `--ds-space-3` and the h3 type style, so no raw values are introduced. A semantic alias such as `--ds-touch-lift: var(--ds-space-12)` could be added later if other touch components need the same offset; not requested now.
- Stepper: no new token needed. Pill and button sizes (24 / 32 / 44), the 64 px pill min width, the 4 px gap and the 12 / 16 px icons all map to existing `--ds-space-*` and `--ds-control-height`; corners use `--ds-radius-md` (0). The 2 px icon stroke is SVG geometry, not a token.
