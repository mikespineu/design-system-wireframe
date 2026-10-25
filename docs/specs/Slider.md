# Slider

- task: DS-23
- canvas: docs/design-system-wireframe/Slider.dc.html
- canvas_url: https://claude.ai/artifact/NZrzu3r48VEABES7SWacfJ
- approved: no
- approved_by:
- approved_at:
- approval_hash:

Pick one number, or a range of two, by dragging along a horizontal track. Built on Radix `Slider`. Works with a uniform scale (`min` / `max` / `step`) or with a custom list of allowed values (`values`, e.g. `[1, 2, 3, 5, 8, 10]`). An optional attached numeric input (`showInput`) lets users type a value; it snaps to the nearest allowed value on Enter or blur.

Canvas section 01 explores four directions: A Hairline, B Block, C Segmented, D Ruler. **Recommended: A Hairline** (2 px gray-500 track, black fill, square white thumb with a 2 px black border, 1 px tick marks, attached Input-style numeric field). This spec describes direction A. If review picks another direction, sections Sizes, States and Tokens change; API, snapping, keyboard, Radix and accessibility stay as written.

Ships as `Slider` (control only, works inside `Field`) and `SliderField` (`Field` + `Slider`, mirrors `TextField` / `TextareaField`).

Proposed API (for the builder; narrow and typed):

```ts
type SliderValue = number | [number, number];       // number = one thumb, tuple = range

type SliderScale =
  | { min?: number; max?: number; step?: number; values?: never } // uniform; defaults 0 / 100 / 1
  | { values: readonly number[]; min?: never; max?: never; step?: never }; // custom list

interface SliderOwnProps<V extends SliderValue> {
  value?: V;                                 // controlled; always a real value, never an index
  defaultValue?: V;                          // uncontrolled; default min (single) or [min, max] (range)
  onValueChange?: (value: V) => void;        // every change: drag move, key, input commit
  onValueCommit?: (value: V) => void;        // end of interaction: pointer up, key, input commit
  size?: 'sm' | 'md' | 'lg';                 // default 'md'; 'lg' is the touch size
  marks?: boolean | readonly number[];       // default: true for `values`, false for uniform
  showInput?: boolean;                       // attached numeric input(s); default false
  showBubble?: boolean;                      // value bubble while dragging / keyboard focus; default false
  formatValue?: (value: number) => string;   // labels, bubble, aria-valuetext; default String(value)
  thumbLabels?: [string, string];            // range only; default ['minimum', 'maximum']
  invalid?: boolean;                         // as Input; Field sets it from `error`
  disabled?: boolean;
  name?: string;                             // form submission of real values (see Radix)
  dir?: 'ltr' | 'rtl';
  id?: string;
  className?: string;
  'aria-label'?: string;                     // only when used outside a Field
  'aria-labelledby'?: string;
}
export type SliderProps<V extends SliderValue = number> = SliderOwnProps<V> & SliderScale;

export interface SliderFieldProps<V extends SliderValue = number> extends SliderProps<V> {
  label: ReactNode; hint?: ReactNode; error?: ReactNode; required?: boolean; fieldClassName?: string;
}
```

- Range is chosen by the shape of `value` / `defaultValue` (a 2-tuple). Callbacks receive the same shape. No more than two thumbs.
- `ref` forwards to the Radix `Slider.Root` element. Rest props are not spread (narrow API); `className` goes to the root wrapper.
- Dev-only `console.warn` (no throw) when: `values` is empty, unsorted, has duplicates or non-finite numbers; `(max − min)` is not a multiple of `step`; a `marks` entry is not an allowed value (it is snapped); `value` is not an allowed value (it is snapped for display; `onValueChange` is not fired for that).

## Sizes

Size changes the root height (which is the hit area), the thumb, the fill thickness, the tick length and the attached input height. The unfilled track is 2 px at every size. Width is always 100 % of the container. Input type stays body 16 at every size, as in `Input`.

| Size | Root / hit height | Thumb | Fill | Ticks | Input (w × h) | Use |
| --- | --- | --- | --- | --- | --- | --- |
| `sm` | 32 px | 12 × 12 | 2 px | 4 px | 64 × 32 | dense desktop panels (≥ 24 px, WCAG 2.5.8; not for touch) |
| `md` (default) | 44 px (= control height) | 16 × 16 | 4 px | 8 px | 64 × 44 | desktop forms; lines up with `Input` |
| `lg` | 48 px | 24 × 24 | 8 px | 8 px | 64 × 48 | touch and mobile forms (≥ 44 px) |

Layout (canvas sections 02, 05, 06):

- Single with `showInput`: `[track][16 px gap][input]`. The input sits on the same row and its top aligns with the root; mark labels sit under the track only.
- Range with `showInput`: `[From input][16 px gap][track][16 px gap][To input]`. Below a 320 px container width (container query) the two inputs move to a row under the track, From left and To right.
- Ticks start 4 px below the track's lower edge. Mark labels: 4 px under the root, label style without uppercase (Red Hat Mono 12/16), centered on the tick, tabular numbers.
- Thumb placement follows Radix: the thumb stays inside the root (Radix in-bounds offset), so at min its left edge touches the root's left edge. Ticks and labels must use the same mapping: `left: calc(var(--slider-thumb-size) / 2 + p * (100% - var(--slider-thumb-size)))`, where `p` is the 0..1 position and `--slider-thumb-size` is a component-local variable set per size from the token in the Tokens table. Edge labels may overflow the root by half their width; the wrapper reserves no extra space.
- Position `p`: uniform `(v − min) / (max − min)`; custom list `index / (values.length − 1)` (equal spacing per value, not proportional).

## States

All states apply to every size, to uniform and custom lists, and to both thumbs of a range. Canvas section 03 has one artboard per row; section 04 shows marks in default and disabled.

| State | Trigger | Track (unfilled) | Fill | Thumb | Ticks / labels | Input | Other |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Default | none | 2 px gray-500 | black | white fill, 2 px black border | ticks under the fill black, others gray-500; labels gray-600, current value's label black 500 | as `Input` default (1 px gray-300) | root `cursor: pointer`, thumb `cursor: grab` |
| Hover | root `:hover`, not disabled | unchanged | unchanged | fill gray-100 | unchanged | unchanged | transition `--ds-motion` |
| Focus-visible (thumb) | thumb `:focus-visible` | unchanged | unchanged | 2 px black outline, 2 px offset (border unchanged) | unchanged | unchanged | bubble shows if `showBubble` |
| Dragging | root `:active`, not disabled (pointer down on track or thumb) | unchanged | follows pointer | fill black (border black) | update live | mirrors value live | `cursor: grabbing`; bubble shows if `showBubble` |
| Disabled | `disabled` (Radix `[data-disabled]`) | gray-200 | gray-400 | fill gray-50, 2 px gray-400 border | ticks gray-300; labels gray-500 | as `Input` disabled | label gray-500, `cursor: not-allowed`, thumbs and input leave the tab order, no hover |
| Invalid | `invalid`, Field `error` (`aria-invalid="true"`) | unchanged | error | 2 px error border | ticks under the fill error | 2 px error border | Field message: alert icon + "Error: ..." |
| Invalid + focus | invalid and thumb `:focus-visible` | unchanged | error | error border kept + 2 px black outline | as invalid | as invalid | |
| Input hover | input `:hover` | unchanged | unchanged | unchanged | unchanged | 1 px black border | as `Textarea` hover |
| Input focus | input `:focus-visible` | unchanged | unchanged | unchanged | unchanged | 1 px black border + 2 px black outline, 2 px offset (invalid keeps the error border) | typed draft is not applied until commit |

Options:

| Option | Look | When visible |
| --- | --- | --- |
| Value bubble (`showBubble`) | gray-900 fill, white Red Hat Mono 500 12/16, padding 4 / 8 px, square, 8 px above the thumb, centered; text = `formatValue(v)` | only while dragging (root `:active`) or thumb `:focus-visible`; never on hover alone; never when disabled |
| Range | one fill between the two thumbs; ticks between the thumbs black | always; thumbs cannot cross (they stop at each other) |

Notes:

- Style state only with pseudo-classes and Radix attributes: `:hover`, `:active`, `:focus-visible`, `[data-disabled]`, `[aria-invalid="true"]`. Radix has no dragging attribute; dragging is `:active` on the root, which covers presses on the thumb and the track because the thumb is a descendant. No JS state for visuals.
- Invalid uses the status hue on the fill, the thumb border and the input, and is always paired with the Field error message (icon + "Error:"), never color alone.
- Out of scope (canvas section 08): vertical orientation, more than two thumbs, minimum distance between thumbs, read-only (Radix Slider has none; use `disabled` or show the value as text), proportional or log spacing for custom lists, clickable mark labels, bubble on hover, spin buttons on the input.
- The only JS state the wrapper holds is the input's draft text while it is focused, and the controlled / uncontrolled value.

### Steps and custom values (snapping)

Uniform mode (`min` / `max` / `step`):

- Passed to Radix as is. Allowed values = `{ min + k × step | k ≥ 0 } ∩ [min, max]`. If `max` is off-grid, the largest reachable value is the last grid point below `max` (Radix behavior); dev warning.
- `marks={true}`: a tick at every allowed value when there are ≤ 21 of them, labels at min and max only. More than 21: ticks and labels at min and max only. `marks={[...]}`: tick and label at each listed value.

Custom list mode (`values`):

- Radix receives `min={0}`, `max={values.length - 1}`, `step={1}` and the index (or index pair). The wrapper converts both ways: `index = values.indexOf(v)` in, `values[index]` out. Public callbacks and `value` always use real values.
- Equal spacing: every value gets the same share of the track, so 1, 2, 3, 5, 8, 10 sit at 0, 20, 40, 60, 80, 100 %.
- `marks` defaults to `true`: a tick and a label at every value. `marks={[...]}` limits labels to the listed values (ticks stay at every value).

Typed input (`showInput`), applied on Enter, on blur and on Tab:

1. Parse: trim; accept an optional leading `-` or `−`, digits, and one decimal separator (`.` or `,`). Anything else, or empty: revert the input to the current value, fire nothing.
2. Clamp to `[min, max]` (custom list: `[values[0], values[last]]`). Range: also clamp From to `≤ To` and To to `≥ From`.
3. Snap: uniform `min + round((v − min) / step) × step`; custom list: the value with the smallest `|v − value|`. Ties go to the higher value (4 in `[3, 5]` → 5; 42.5 with step 5 → 45). Round the result to the step's decimal places to remove float noise (0.1 + 0.2).
4. Show the snapped value in the input. If it differs from the current value, fire `onValueChange` then `onValueCommit` once each. If the snapped value differs from what was typed, announce "Set to {formatValue(v)}" in a polite live region.
5. Esc while editing: discard the draft, show the current value, keep focus.

Snapping never produces an error state; the input always ends on an allowed value.

## Keyboard

Thumb keys come from Radix `Slider` (no custom key handling). In a custom list, one step = one list item.

| Key (thumb focused) | Action |
| --- | --- |
| Right Arrow, Up Arrow | Increase by one step (next allowed value). In `dir="rtl"`, Left Arrow increases. |
| Left Arrow, Down Arrow | Decrease by one step. |
| Page Up, Shift + Right/Up Arrow | Increase by 10 steps, clamped to max (a 6-item list reaches the end). |
| Page Down, Shift + Left/Down Arrow | Decrease by 10 steps, clamped to min. |
| Home / End | Go to min / max. In a range, a thumb stops at the other thumb. |
| Tab / Shift + Tab | Move to the next / previous focusable element. |
| Esc | No action; bubbles so a parent Dialog or Popover can close. |

| Key (input focused) | Action |
| --- | --- |
| Enter | Parse, clamp, snap, commit (see Snapping). `preventDefault`, so it never submits the form. Focus stays. |
| Tab / Shift + Tab, blur | Same commit, then focus moves. |
| Esc | If there is a draft, discard it and stop propagation; otherwise bubble. |
| Arrow keys, Home, End | Native caret movement only (the input is `type="text"`, no spin behavior). |

Focus order (DOM order):

- Single: thumb, then input.
- Range: From input, min thumb, max thumb, To input.
- The label is not focusable. Clicking it focuses the input when `showInput` is on, otherwise the thumb (the first thumb in a range). Disabled: thumbs and inputs are skipped.
- Pressing on the track moves the nearest thumb and focuses it (Radix). The focus ring shows only for `:focus-visible`.

## Radix

- Control: `Slider` from `radix-ui` (`import { Slider } from 'radix-ui'`): `Slider.Root`, `Slider.Track`, `Slider.Range`, one `Slider.Thumb` per value. `orientation="horizontal"`, `inverted={false}`, `minStepsBetweenThumbs={0}` (not exposed). Radix owns pointer and keyboard interaction, thumb focus, `role="slider"`, `aria-orientation` and `data-disabled`.
- Values mode: pass indices to Radix (see Snapping). On each `Slider.Thumb` override `aria-valuemin`, `aria-valuemax` and `aria-valuenow` with real values (`values[0]`, `values[last]`, `values[index]`) and always set `aria-valuetext={formatValue(v)}`. Radix spreads Thumb props after its own ARIA attributes, so the override wins; a test must assert it.
- Forms: do not pass `name` to Radix (in values mode it would submit the index). The wrapper renders one `<input type="hidden" name={name} value={v}>` per thumb (a range submits two entries under `name`; read with `FormData.getAll`). The attached numeric inputs have no `name`.
- Marks, labels and the bubble are plain presentational elements (`aria-hidden="true"`), not Radix parts. The bubble renders inside `Slider.Thumb` and is shown by CSS only.
- Numeric input: reuse `Input` (`src/components/Input/Input.tsx`) with `type="text"` and `inputMode="decimal"`, not a new input style. No Radix primitive exists for a number field; parsing and snapping are wrapper logic.
- Label: `Label` from `radix-ui` through the existing `Field`. Wiring:
  - Slider calls `useFieldControl()`. With `showInput`, the Field `id` goes on the (first) input, so the label's `htmlFor` works natively. Without an input, the `id` goes on the (first) thumb.
  - A thumb is a `span`, which `htmlFor` cannot label, so thumbs use `aria-labelledby`. This needs one additive change to `Field`: give the `Label.Root` `id={`${controlId}-label`}` and expose it through a new `useFieldLabelId()` hook (separate context value so `Input` and `Textarea`, which spread `useFieldControl()`, are unaffected).
  - Clicking the label without an input must focus the thumb: `Label` `onClick` calls `thumb.focus()` (done via a ref inside `Slider`; no change to `Input` behavior).
  - `aria-invalid`, `aria-describedby`, `aria-required` from Field go on every thumb and every input. `disabled` from Field becomes Radix `disabled` and input `disabled`.
  - Range: thumbs `aria-labelledby="{labelId} {thumbLabelId}"` where the thumb label is a visually hidden span "minimum" / "maximum" (`thumbLabels`). Inputs use `aria-label="{label text}, minimum"` / `"..., maximum"` (via the same `aria-labelledby` pair).

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
| Input width | `--ds-space-16` |
| Input height sm / md / lg | `--ds-space-8` / `--ds-control-height` / `--ds-space-12` |
| Input, all other properties and states | as `Input` (`--ds-color-border`, `--ds-color-ink`, `--ds-color-error`, `--ds-color-divider`, `--ds-color-surface-subtle`, `--ds-color-placeholder`, `--ds-font-text`, padding `--ds-space-3`, sm `--ds-space-2`); text right-aligned, tabular numbers |
| Gap track to input | `--ds-space-4` |
| Label to control, control to hint gap | `--ds-space-2` (from `Field`) |
| Label | `--ds-color-ink`, `--ds-font-mono`, label style 12/16 uppercase +8 %; disabled `--ds-color-placeholder` |
| Hint | `--ds-color-text-muted`, caption 13/20 |
| Error message | `--ds-color-error`, caption 13/20 weight 500, 14 px alert icon (from `Field`) |
| Focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Corner radius (thumb, bubble, track, input) | `--ds-radius-md` |
| Hover / state transition | `--ds-motion` (background-color, border-color only; never animate thumb position) |

## Accessibility

- Roles: each thumb is `role="slider"` (Radix) with `aria-orientation="horizontal"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (real values, also in values mode) and `aria-valuetext` = `formatValue(v)` (e.g. "100%", "€200"). The attached input is a native `textbox`; no `spinbutton` role (it has no arrow stepping).
- Names: from the visible Field label. Single: thumb `aria-labelledby` = label id; input labelled natively by `htmlFor`. Range: thumbs "Price minimum" / "Price maximum" via `aria-labelledby` with a visually hidden thumb label; inputs the same. A bare `Slider` outside a Field needs `aria-label` or `aria-labelledby` (dev warning if missing); document it in a story.
- Description: `aria-describedby` from Field (hint, then error) on every thumb and input.
- Invalid: `aria-invalid="true"` on every thumb and input; Field error starts with screen-reader "Error: " and has the alert icon. Never color alone.
- Required: `aria-required="true"` from Field on the inputs (thumbs too; `aria-required` is allowed on `slider`). Visible asterisk is `aria-hidden`.
- Disabled: Radix `disabled` removes thumbs from the tab order and sets `data-disabled`; inputs use native `disabled`.
- Presentational parts: ticks, mark labels and the bubble are `aria-hidden="true"`; the value is exposed through `aria-valuetext`. The snap message ("Set to 5") uses one visually hidden `aria-live="polite"` region per Slider.
- Contrast: fill and thumb border black on white 21:1; unfilled track gray-500 on white 4.5:1 and ticks gray-500 (both meet 3:1 for non-text, WCAG 1.4.11); invalid fill error on white 7:1; bubble white on gray-900 about 18:1; mark labels gray-600 7:1; focus ring black 21:1; hover thumb gray-100 keeps its black border (21:1). Disabled parts are exempt as inactive.
- Target size: md root 44 px tall and full width, lg 48 px; Radix moves the nearest thumb on press anywhere on the root, so each thumb's effective target is the full root height. sm (32 px) meets WCAG 2.5.8 but is desktop-only. Inputs are at least 44 px at md and lg.
- Motion: thumb movement is never animated; color transitions use `--ds-motion` and are dropped under `prefers-reduced-motion: reduce`.
- `jest-axe` should verify no violations for: single default in `SliderField`, with hint, invalid with error, disabled, with `showInput`, custom `values` with marks, range, range with `showInput`, and a bare `Slider` with `aria-label`.
- Tests with `userEvent` should also check: Arrow, Page Up/Down, Home/End move by the right amounts in uniform and values mode (values mode: Right from 3 gives 5, `aria-valuenow="5"`, `aria-valuetext` from `formatValue`); Tab order (single: thumb then input; range: From, min thumb, max thumb, To); label click focuses the input, or the thumb without one; typing 4 + Enter in `[1, 2, 3, 5, 8, 10]` gives 5 and calls `onValueChange` and `onValueCommit` once; 120 clamps to 100; "abc" reverts without callbacks; Esc discards the draft; Enter does not submit a wrapping form; range From cannot pass To; disabled thumbs and inputs are skipped; hidden form inputs submit real values, not indices. `ResizeObserver` and `PointerEvent` may need stubs in `jest.setup.ts` for Radix Slider.

## Token requests

- `--ds-border-width-strong: 2px` — used for the slider thumb border, the 2 px unfilled track and the sm fill. The same 2 px is already hard-coded as Tailwind `border-2` for the invalid border in `Input` and `Textarea`, so one token would cover all of them. If declined, the builder uses Tailwind `border-2` / `h-0.5` as `Input` does today, and nothing else changes.
