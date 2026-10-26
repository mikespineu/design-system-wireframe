# SegmentedControl (usage guide for code agents)

Pick exactly one of 2–7 short text options in a horizontal strip. Built on Radix `RadioGroup` through the internal `ChoiceGroup` base. Source of truth: `SegmentedControl.tsx` and `../ChoiceGroup/ChoiceGroup.tsx`. Spec: `docs/specs/Toggle.md`.

## Which one to use

- `SegmentedControl`: one of a few short text values (density, view, theme, sort order). A value is always selected.
- One on/off setting: use `Switch` (planned, DS-29), not a two-option SegmentedControl.
- Options led by an icon or picture (layout picker, quick actions): use `TileGroup` (planned, DS-31).
- More than 7 options, long labels, or options that can be empty: use a select or a radio list instead (the system has no `Select` component yet).
- Picking a number: use `Slider` (see `../Slider/Slider.md`).
- `ChoiceGroup` is internal. Never import it.

## Import

```ts
import { SegmentedControl } from 'design-system-test'; // exported from src/index.ts
import type { SegmentedControlProps, ChoiceOption } from 'design-system-test';
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `readonly ChoiceOption<V>[]` | required | `{ value: V; label: string; disabled?: boolean }`. 2–7 items, one or two words each. `label` is the visible text and accessible name. |
| `label` | `ReactNode` | required | Group label; names the radiogroup. Always pass it. |
| `value` | `V` | none | Controlled. Must match an option value (dev `console.error` otherwise). |
| `defaultValue` | `V` | first enabled option | Uncontrolled initial value. |
| `onValueChange` | `(value: V) => void` | none | Only called with a real option value. Never called with empty. |
| `labelPosition` | `'start' \| 'top'` | `'start'` | `start`: label left of the strip on one row. `top`: label above. |
| `hint` | `ReactNode` | none | Caption under the label. Rendered **only** with `labelPosition="top"`; wired to `aria-describedby`. |
| `help` | `ReactNode` | none | Trailing slot after the strip, outside the arrow-key order. Typically an `IconButton` with its own `aria-label`. |
| `size` | `'sm' \| 'md'` | `'md'` | `sm` is for fine pointers (desktop) only. Use `md` on touch. |
| `fullWidth` | `boolean` | `false` | Segments share the width equally and never scroll. Only for 2–4 short options. |
| `disabled` | `boolean` | `false` | Whole group. Per item: `options[i].disabled`. |
| `required`, `name` | | none | `name` submits the selected value through Radix's hidden input. |
| `dir` | `'ltr' \| 'rtl'` | `'ltr'` | Flips layout, arrow keys and edge fades. |
| `id`, `className`, `aria-*` | | none | Passed to the Radix root. |
| `ref` | | | Forwarded to the Radix `RadioGroup.Root` element. |

`V` is inferred from `options`, so `value` and `onValueChange` are typed to your union:

```ts
const VIEWS = [{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }] as const;
// onValueChange: (v: 'list' | 'grid') => void
```

## Behavior rules

- **Always one selected.** No value means the first enabled option. Clicking the selected item does nothing. There is no deselect, and `onValueChange` never fires with an empty value.
- **Width.** The track hugs its segments by default. `fullWidth` stretches it to the container and splits it evenly; it never scrolls.
- **Overflow.** When options don't fit, the strip scrolls horizontally and never wraps. The selected item is scrolled into view (clear of the edge fade) on mount, on change and on focus. A fade shows only on the side that has hidden items. Do not wrap it in your own scroll container.
- **Indicator.** The selected fill slides between segments using `--ds-motion`. It does not animate on first render and jumps without animation under `prefers-reduced-motion`.
- **Keyboard.** Tab enters on the selected segment. Arrow keys move **and select** (they wrap, skip disabled items, and flip in RTL). Home/End move focus only; Space selects the focused item. Enter does not submit the form. Tab leaves the group, then reaches `help`.
- **Controlled.** Pass `value` + `onValueChange`. A `value` you never update does not change.

## Accessibility

- The root is a `radiogroup` named by `label`; each segment is a `radio` named by its option `label`.
- `hint` (top labels only) is the group description.
- `help` must have its own accessible name, for example `<IconButton icon="info" aria-label="About views" />`.
- The sliding indicator is `aria-hidden`.

## Recipes

```tsx
import { useState } from 'react';
import { IconButton, SegmentedControl } from 'design-system-test';

const VIEWS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'board', label: 'Board' },
] as const;

// Basic, uncontrolled (starts on "List")
<SegmentedControl label="View" options={VIEWS} />

// Controlled
const [view, setView] = useState<'list' | 'grid' | 'board'>('grid');
<SegmentedControl label="View" options={VIEWS} value={view} onValueChange={setView} />

// Label on top with a hint, full width
<SegmentedControl label="Density" labelPosition="top" hint="Row spacing in tables." fullWidth
  options={[{ value: 'compact', label: 'Compact' }, { value: 'cozy', label: 'Cozy' }]} />

// Help button outside the arrow-key order
<SegmentedControl label="View" options={VIEWS} help={<IconButton icon="info" aria-label="About views" />} />

// A disabled option
<SegmentedControl label="Plan" options={[
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team', disabled: true },
]} />

// In a form: submits view=grid
<form>
  <SegmentedControl label="View" name="view" options={VIEWS} defaultValue="grid" />
</form>

// Dense desktop toolbar
<SegmentedControl label="Sort" size="sm" options={[{ value: 'new', label: 'Newest' }, { value: 'top', label: 'Top' }]} />
```

See `SegmentedControl.stories.tsx` for every state, including Keyboard and Overflow.

## Do / Don't

- Do keep labels short (one or two words) and use 2–7 options.
- Do type options `as const` so `value` is a union, not `string`.
- Do use `md` on touch layouts and `fullWidth` only for 2–4 options.
- Do give a `help` control its own `aria-label`.
- Don't use it for a single on/off setting (`Switch`) or icon-led options (`TileGroup`).
- Don't try to clear the value or add an "all/none" segment to fake deselection.
- Don't pass `hint` with `labelPosition="start"`; it is not rendered.
- Don't import `ChoiceGroup`, restyle the indicator, or hardcode colors or spacing. Use `--ds-*` tokens.
- Don't nest it in a horizontally scrolling wrapper; it handles its own overflow.
