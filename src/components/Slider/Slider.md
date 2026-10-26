# Slider (usage guide for code agents)

Pick one number with a single thumb along a horizontal track. Built on Radix `Slider`. Source of truth: `Slider.tsx`.

## Which one to use

- `SliderField`: default choice. It is `Field` (label, hint, error, required) + `Slider`. Use it in forms.
- `Slider`: the bare control, only when you supply your own label (needs `aria-label` or `aria-labelledby`) or sit inside an existing `Field`.
- Use `Input` (not a slider) when the exact number matters more than a quick pick, or the range is huge. Use `SliderField` with `showInput` when you want both.
- Single value only. No range / two thumbs, no vertical orientation.

## Import

```ts
import { Slider, SliderField } from 'design-system-test'; // exported from src/index.ts
import type { SliderProps, SliderFieldProps, SliderValue, SliderMarks, SliderBubble } from 'design-system-test';
```

## Props

`Slider` props (`SliderField` accepts all of them plus the Field props below).

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | `number` | none | Controlled. Always a real value, never an index. Off-scale values are snapped for display. |
| `defaultValue` | `number` | `min` (list: `values[0]`) | Uncontrolled initial value. |
| `onValueChange` | `(v: number) => void` | none | Every change: drag move, key, stepper, input commit. |
| `onValueCommit` | `(v: number) => void` | none | End of an interaction: pointer up, key, stepper, input commit. Use for saving. |
| `min` / `max` / `step` | `number` | `0` / `100` / `1` | Uniform scale. Exclusive with `values`. `(max - min)` should be a multiple of `step`. |
| `values` | `readonly number[]` | none | Custom list of allowed values. Sorted, unique, finite. Exclusive with `min`/`max`/`step`. |
| `spacing` | `'index' \| 'value'` | `'index'` | Only with `values`. `index`: equal slot per value. `value`: real position `(v - first) / (last - first)`. |
| `marks` | `'none' \| 'steps' \| 'ends' \| number[]` | `'steps'` with `values`, `'none'` otherwise | See marks below. Ignored (dev warning) for a uniform scale with `stepper`. |
| `bubble` | `'auto' \| 'always' \| 'off'` | `'auto'` | `always` makes the bubble an editable input. |
| `showInput` | `boolean` | `false` | Attached numeric input beside the track. Type error with `bubble="always"` (ignored at runtime, dev warning). |
| `stepper` | `boolean` | `false` | Minus / plus buttons and a value pill as the thumb. |
| `unit` | `string` | none | Appended to displayed values (`40%`, `239 cm`). Also stripped when parsing typed text. |
| `formatValue` | `(v: number) => string` | none | Owns labels, bubble, pill and `aria-valuetext`; `unit` is then not appended. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `lg` is the touch size. |
| `invalid` | `boolean` | `false` | Field `error` sets it for you. |
| `disabled` | `boolean` | `false` | Field `disabled` also applies. |
| `name` | `string` | none | Renders a hidden input with the real value. |
| `dir` | `'ltr' \| 'rtl'` | `'ltr'` | |
| `id`, `className` | `string` | none | `className` goes to the wrapper. Outside a Field, `id` goes on the thumb (or the input). |
| `aria-label`, `aria-labelledby` | `string` | none | Required outside a Field (dev warning otherwise). |
| `ref` | | | Forwarded to the Radix root element. Other props are not spread. |

`SliderField` extra props: `label` (required), `hint`, `error`, `required`, `fieldClassName` (Field wrapper; `className` goes to the slider), `id` (Field id).

Exclusions and rules:

- `values` XOR `min`/`max`/`step`. `spacing` is only valid with `values`.
- `showInput` XOR `bubble="always"`.
- `stepper` on a uniform scale draws no marks. With `values` it keeps them.
- `bubble="always"` with `stepper`: the pill itself becomes editable (click without moving, or Enter on the pill).

## Behavior rules

- **Snapping:** the value is always an allowed one. Uniform: `min + k * step`. If `max` is off-grid the last reachable value is below it. List: only list members.
- **Typed input** (attached input, bubble input, stepper edit): parse, clamp to the ends, snap to the nearest allowed value; ties go up (4 in `[3, 5]` gives 5; 42.5 with step 5 gives 45). Applies on Enter and on blur or Tab. The unit may be typed (`239`, `239cm`, `239 cm`), `,` or `.` decimals, leading `-`. Text that is not a number reverts without callbacks. Esc discards a draft (and stops propagation); with no draft it bubbles. Enter never submits the form. If the snapped value differs from what was typed, a polite live region says "Set to X". Callbacks fire only when the value actually changed: `onValueChange` then `onValueCommit`, once each.
- **Keyboard (thumb focused):** Right/Up next allowed value, Left/Down previous (rtl flips left/right). PageUp/PageDown and Shift+arrow move 10 values, clamped. Home/End first/last. Arrow means "next allowed value" in list mode, also with `spacing="value"`. Enter opens edit mode only for `stepper` + `bubble="always"`.
- **Spacing:** `index` puts `[1, 2, 3, 5, 8, 10]` at 0, 20, 40, 60, 80, 100 %. `value` places each value at its real position, so `[200, 240, 241..280]` puts 240 mid-track. In value mode dragging snaps to the nearest allowed value by real distance.
- **Marks:** `steps` a tick at every allowed value (uniform scales label only min and max; lists label every value; more than 21 uniform values falls back to `ends` with a warning). `ends` ticks and labels at the first and last. `none` nothing. `number[]` ticks and labels at the listed values (lists keep a tick at every value, label only the listed). With `spacing="value"` and dense lists, label only a few values so labels do not collide.
- **Bubble:** `auto` shows a read-only value tooltip while dragging or focused. On fine pointers the layout reserves room above the track for it so it never covers the label; on touch it lifts above the finger while dragging. `always` shows an editable input above the thumb and reserves space for it. `off` shows none. With a uniform-or-list `stepper` the `auto` bubble shows only on touch drags.
- **Unit:** `unit="%"` or `"°"` shows `40%`; any other unit shows `239 cm` with a non-breaking space. Inputs show the bare number plus a static suffix.
- **Sizes:** `sm` 32 px hit area (desktop only), `md` 44 px, `lg` 48 px. Use `lg` on touch screens (stepper buttons are 44 px at `lg`).
- **Disabled:** thumb, inputs and stepper buttons leave the tab order. **Invalid:** error color on fill, thumb and inputs; always pair with a message (use `SliderField error`).
- **Controlled / uncontrolled:** pass `value` (+ `onValueChange`) or `defaultValue`. A controlled value that you do not update does not move.
- **Forms:** pass `name` to submit the real value (never an index) through a hidden input. The visible inputs have no name.

## Accessibility

- Inside `SliderField` / `Field` the thumb is named by the label (`aria-labelledby`); clicking the label focuses the input if there is one, else the thumb.
- Outside a Field pass `aria-label` or `aria-labelledby`. Stepper buttons are named "Decrease/Increase <label>".
- `aria-valuenow` is the real value, `aria-valuemin`/`aria-valuemax` the first/last, `aria-valuetext` is `formatValue(v)` (e.g. "239 cm"). Marks and the auto bubble are `aria-hidden`.
- Hint, error and `required` from the Field are wired to the thumb and the input.

## Recipes

```tsx
import { useState, type FormEvent } from 'react';
import { Button, Slider, SliderField } from 'design-system-test';

// Basic
<SliderField label="Volume" defaultValue={40} unit="%" hint="Applies to all rooms." />

// Unit + typed input
<SliderField label="Height" unit="cm" min={100} max={250} step={10} defaultValue={180} showInput />

// Custom values (equal spacing)
<SliderField label="Rating" values={[1, 2, 3, 5, 8, 10]} defaultValue={3} showInput />

// Mixed steps at real positions: 200, 240, then every cm to 280
const LENGTHS = [200, 240, ...Array.from({ length: 40 }, (_, i) => 241 + i)];
<SliderField label="Length" values={LENGTHS} spacing="value" unit="cm" marks={[200, 240, 280]} defaultValue={240} showInput />

// Stepper (uniform: no marks)
<SliderField label="Height" stepper unit="cm" min={100} max={250} step={10} defaultValue={180} />

// Editable bubble, with an error
<SliderField label="Level" bubble="always" unit="%" error="Too loud" />

// Bare, outside a Field
<Slider aria-label="Zoom" defaultValue={25} unit="%" />

// Controlled; save on commit
const [v, setV] = useState(30);
<SliderField label="Brightness" unit="%" value={v} onValueChange={setV} onValueCommit={(final) => save(final)} />

// In a form: submits rating=5
<form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const rating = new FormData(e.currentTarget).get('rating'); }}>
  <SliderField label="Rating" name="rating" values={[1, 2, 3, 5, 8, 10]} defaultValue={5} />
  <Button type="submit">Save</Button>
</form>

// Configurator-like composition
const [dims, setDims] = useState({ width: 120, height: 180, depth: 32 });
const set = (key: keyof typeof dims) => (v: number) => setDims((d) => ({ ...d, [key]: v }));
<form>
  <SliderField label="Depth" values={[20, 32, 40]} unit="cm" value={dims.depth} onValueChange={set('depth')} />
  <SliderField label="Height" min={60} max={240} step={10} unit="cm" marks="ends" value={dims.height} onValueChange={set('height')} />
  <SliderField label="Width" min={40} max={200} unit="cm" showInput value={dims.width} onValueChange={set('width')} />
  <output>{dims.width} × {dims.height} × {dims.depth} cm</output>
</form>
```

See `Configurator.stories.tsx` in `src/patterns/Configurator` for a full example.

## Do / Don't

- Do use `SliderField` for anything with a visible label; do give a bare `Slider` an `aria-label`.
- Do use `values` for non-uniform stops and `onValueCommit` for saving or network calls.
- Do use `size="lg"` on touch layouts. Do pair `invalid` with an error message.
- Don't mix `values` with `min`/`max`/`step`, or pass `spacing` without `values`.
- Don't combine `showInput` with `bubble="always"`.
- Don't pass `marks` with a uniform `stepper` (ignored), and don't label every value of a dense `spacing="value"` list.
- Don't pass an index as `value` in list mode; always the real value.
- Don't pass `name` expecting an index, or add your own `name` to the inputs.
- Don't hardcode colors or spacing around it; use `--ds-*` tokens.
- Don't build a range slider or vertical slider; they are out of scope.
