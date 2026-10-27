# TileGroup (usage guide for code agents)

Pick exactly one of several options shown as icon + label tiles in a horizontal row. Built on Radix `RadioGroup` through the internal `ChoiceGroup` base (same scroll, label, hint and help behaviour as `SegmentedControl`). Source of truth: `TileGroup.tsx` and `../ChoiceGroup/ChoiceGroup.tsx`. Spec: `docs/specs/Toggle.md`.

## Which one to use

- `TileGroup`: picture-led options (layout picker, quick action, plan type). A value is always selected.
- Short text-only values (density, view, theme): `SegmentedControl`.
- One on/off setting: `Switch`.
- Picking a number: `Slider`.
- Photo or swatch tiles are out of scope.
- `ChoiceGroup` is internal. Never import it.

## Import

```ts
import { TileGroup, Icon } from 'design-system-test';
import type { TileGroupProps, TileOption } from 'design-system-test';
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `readonly TileOption<V>[]` | required | `{ value: V; label: string; icon: ReactNode; disabled?: boolean }`. One or two words per label. |
| `label` | `ReactNode` | required | Group label; names the radiogroup. |
| `value` / `defaultValue` / `onValueChange` | `V` / `V` / `(v: V) => void` | first enabled option | Same as `SegmentedControl`. Never called with empty. |
| `labelPosition` | `'start' \| 'top'` | `'top'` | `top`: label, hint, then tiles. |
| `hint` | `ReactNode` | none | Only rendered with `labelPosition="top"`; wired to `aria-describedby`. |
| `help` | `ReactNode` | none | Trailing slot outside the arrow-key order, typically an `IconButton` with its own `aria-label`. |
| `size` | `'sm' \| 'md'` | `'md'` | md: 96 x 88 tile, 24 px icon. sm: 72 x 64, 16 px icon (fine pointers only). |
| `disabled`, `required`, `name`, `dir`, `id`, `className`, `aria-*` | | | As `SegmentedControl`. Per item: `options[i].disabled`. |
| `ref` | | | Forwarded to the Radix `RadioGroup.Root`. |

## Behavior rules

- **Icon.** `icon` is any node, usually `<Icon name="..." />`. The tile wraps it in an `aria-hidden` box and sizes the `svg` (24 px md, 16 px sm), so do not pass a `size`. It uses `currentColor`.
- **Label.** The label is the tile's accessible name. It never wraps or truncates; the tile grows to fit. Keep labels short.
- **Always one selected**, no deselect. Keyboard: Tab enters on the selected tile; arrows move and select (wrap, skip disabled, flip in RTL); Home/End move focus only; Space selects.
- **Overflow.** The row scrolls horizontally with an edge fade and keeps the selected tile in view. Do not wrap it in your own scroller.
- **Motion.** The selected look cross-fades with `--ds-motion` (none under `prefers-reduced-motion`). There is no sliding indicator.

## Recipe

```tsx
import { Icon, TileGroup } from 'design-system-test';

const ACTIONS = [
  { value: 'add', label: 'Add', icon: <Icon icon={PlusIcon} /> },
  { value: 'search', label: 'Search', icon: <Icon icon={SearchIcon} /> },
  { value: 'info', label: 'Details', icon: <Icon icon={InfoIcon} />, disabled: true },
] as const;

<TileGroup label="Quick action" options={ACTIONS} />
<TileGroup label="Quick action" hint="What the button does." size="sm" options={ACTIONS} name="action" defaultValue="search" />
```

See `TileGroup.stories.tsx` for every state, including Keyboard and Overflow.

## Do / Don't

- Do use `as const` options so `value` is a union.
- Do use `md` on touch layouts.
- Don't use it for text-only options (`SegmentedControl`) or a single boolean (`Switch`).
- Don't pass `aria-label` on the icon or rely on it for meaning; the label carries the name.
- Don't hardcode colors or spacing; use `--ds-*` tokens.
