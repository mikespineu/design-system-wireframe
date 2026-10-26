# Checkbox

- task: DS-13
- canvas: docs/design-system-wireframe/Checkbox.dc.html
- canvas_url: https://claude.ai/artifact/NfoQGsLzyNGC3AtsCDFAKQ
- approved: no
- approved_by:
- approved_at:
- approval_hash:

A square box with a 2 px black border and the label to its right. Checked and indeterminate states fill the box black and show a white mark. Focus, invalid and disabled match the Field controls (`Input`, `Textarea`). It is built on Radix `Checkbox`. It ships as `Checkbox`, a single box with an inline label, and `CheckboxGroup`, a `fieldset` with a `legend`, a hint, an error and several `Checkbox`es.

Proposed API:

```ts
type CheckedState = boolean | 'indeterminate';

interface CheckboxProps {
  checked?: CheckedState;            // controlled
  defaultChecked?: CheckedState;     // uncontrolled
  onCheckedChange?: (checked: CheckedState) => void;
  label: ReactNode;                  // required, rendered to the right of the box
  description?: ReactNode;           // optional caption under the label
  size?: 'sm' | 'md';                // default 'md'
  invalid?: boolean;                 // CheckboxGroup sets it from `error`
  disabled?: boolean;
  required?: boolean;
  name?: string; value?: string;     // form submission (Radix renders a hidden input)
  id?: string; className?: string;
}

interface CheckboxGroupProps {
  legend: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;                 // sets invalid on every child
  required?: boolean;
  disabled?: boolean;                // native fieldset disabled + passes to children
  orientation?: 'vertical' | 'horizontal'; // default 'vertical'
  size?: 'sm' | 'md';                // passed to children
  children: ReactNode;               // Checkbox elements
  className?: string;
}
```

- `ref` and rest props go to `Checkbox.Root` (the `button`). The group uses React context to pass `size`, `invalid`, `disabled` and `aria-describedby` to its children.
- A single standalone checkbox with an error (for example "accept terms") may sit inside a `CheckboxGroup` with one child, or take `invalid` and an error rendered by its parent. A single `Checkbox` does not use `Field`, because a Field label sits above the control and this label sits beside it.

## Sizes

| Size | Box | Mark icon | Row / hit height | Box to label gap | Label type | Use |
| --- | --- | --- | --- | --- | --- | --- |
| `sm` | 16 × 16 | 12 px | 32 px | 8 px | body-sm 15/24 | dense desktop tables and filters (fine pointer only) |
| `md` (default) | 24 × 24 | 16 px | 44 px (= control height) | 12 px | body 16/26 | forms, touch |

- The whole row (box plus label) is the click target, because the `label` element wraps both or points at the box.
- Label placement: the label always sits to the right of the box (to the left in RTL, since it is a flex row that follows `dir`). It uses body text in `--ds-color-ink`, not the uppercase Field label style. Single-line rows center the box vertically. When the label wraps, the box aligns with the first line: the row uses `align-items: flex-start` and the box gets a top margin of (line height − box) / 2, which is 1 px at md and 4 px at sm. The label text gets 9 px vertical padding at md so the first line stays centered in the 44 px row; that padding is part of the line box, not a token.
- Description: caption 13/20 in `--ds-color-text-muted`, directly under the label text, with the same indent.
- Group: options stack vertically with no extra gap because each row is already 44 px. In horizontal orientation they wrap with a 24 px gap. Nested children under a "select all" parent are indented by the box width plus the gap (36 px at md, 24 px at sm).

## States

Canvas section 02 has one artboard per state, and each artboard shows unchecked, checked and indeterminate.

| State | Trigger | Border | Fill | Mark (icon) | Label | Other |
| --- | --- | --- | --- | --- | --- | --- |
| Unchecked | `[data-state="unchecked"]` | 2 px black | white | none | black | `cursor: pointer` on the row |
| Checked | `[data-state="checked"]` | 2 px black | black | white check | black | |
| Indeterminate | `[data-state="indeterminate"]` | 2 px black | black | white dash | black | only set from code; a user click goes to checked |
| Hover, unchecked | row `:hover` | 2 px black | gray-100 | none | unchanged | transition `--ds-motion` |
| Hover, checked or indeterminate | row `:hover` | 2 px gray-800 | gray-800 | white | unchanged | |
| Focus-visible | box `:focus-visible` | unchanged | unchanged | unchanged | unchanged | 2 px black outline, 2 px offset, on the box only |
| Disabled, unchecked | `[data-disabled]` | 2 px gray-400 | gray-50 | none | gray-500 | `cursor: not-allowed`, no hover, out of the tab order |
| Disabled, checked or indeterminate | `[data-disabled]` | 2 px gray-400 | gray-400 | white | gray-500 | |
| Invalid, unchecked | `aria-invalid="true"` | 2 px error | white | none | black | error message with an icon under the group |
| Invalid, checked | `aria-invalid="true"` | 2 px error | error | white | black | rare; for example "too many selected" |
| Invalid + focus | invalid and `:focus-visible` | error kept | as invalid | as invalid | black | plus the black outline |

Group states (canvas section 04):

| State | Legend | Hint | Options | Error |
| --- | --- | --- | --- | --- |
| Default | Field label style, black | gray-600 caption, under the legend | as above | none |
| Invalid | unchanged | unchanged | every child invalid | under the options: error caption 500 with a 14 px alert icon, screen-reader "Error: " prefix |
| Disabled | gray-500 | gray-500 | every child disabled | none |
| Required | asterisk after the legend (`aria-hidden`) | unchanged | unchanged | unchanged |

- All visual state comes from Radix attributes and pseudo-classes: `[data-state]`, `[data-disabled]`, `[aria-invalid="true"]`, `:hover`, `:focus-visible`. The component holds no JS state for visuals.

## Keyboard

| Key | Action |
| --- | --- |
| Space | Toggles the focused checkbox. Indeterminate becomes checked. (Radix) |
| Enter | No action. Radix prevents it, so pressing Enter on a checkbox never submits the form. |
| Tab / Shift + Tab | Moves to the next / previous checkbox. Every checkbox in a group is its own tab stop; there is no roving focus. |

- Focus order follows DOM order: the "select all" parent first, then its children, then the next option. Disabled checkboxes are skipped. The legend, hint and labels are not focusable. Clicking a label focuses and toggles its box.

## Radix

- `Checkbox` from `radix-ui` (`import { Checkbox } from 'radix-ui'`): `Checkbox.Root` is the box (a `button` with `role="checkbox"`), and `Checkbox.Indicator` holds the check or dash icon. The icon is picked from the `[data-state]` of the indicator. Radix handles toggling, `aria-checked` (including `"mixed"`), `data-state`, `data-disabled`, and the hidden native input it uses for form submission.
- Label: `Label` from `radix-ui`, with `htmlFor` set to the root id. `aria-describedby` points to the description when one exists.
- CheckboxGroup: Radix has no checkbox-group primitive, so it is a native `<fieldset>` with a `<legend>`, which gives the group its role and name. The fieldset gets `aria-describedby` = hint id plus error id. `disabled` on the fieldset plus the Radix `disabled` on each child keeps `data-disabled` styling correct.

## Tokens

| Property | Token |
| --- | --- |
| Row / hit height md / sm | `--ds-control-height` / `--ds-space-8` |
| Box size md / sm | `--ds-space-6` / `--ds-space-4` |
| Mark icon md / sm | `--ds-space-4` / `--ds-space-3`, 2 px stroke, `currentColor` |
| Box border width | 2 px (Tailwind `border-2`, as the `Input` invalid border; see Token requests) |
| Box border, default / focus | `--ds-color-ink` |
| Box fill, unchecked | `--ds-color-surface` |
| Box fill, unchecked hover | `--ds-color-fill` |
| Box fill, checked / indeterminate | `--ds-color-primary` |
| Box fill and border, checked hover | `--ds-color-primary-hover` |
| Mark color | `--ds-color-primary-contrast` |
| Disabled border | `--ds-color-disabled` |
| Disabled fill, unchecked / checked | `--ds-color-surface-subtle` / `--ds-color-disabled` |
| Disabled label and legend | `--ds-color-placeholder` |
| Invalid border, invalid checked fill | `--ds-color-error` |
| Focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Box to label gap md / sm | `--ds-space-3` / `--ds-space-2` |
| Label | `--ds-font-text`, body 16/26 (sm 15/24), `--ds-color-ink` |
| Description | caption 13/20, `--ds-color-text-muted` |
| Legend | `--ds-font-mono`, label style 12/16 uppercase +8 %, `--ds-color-ink` |
| Legend to hint, hint to options, options to error | `--ds-space-2` |
| Hint | caption 13/20, `--ds-color-text-muted` |
| Error | caption 13/20 weight 500, `--ds-color-error`, 14 px alert icon (as `Field`) |
| Horizontal option gap | `--ds-space-6` |
| Nested indent md / sm | box + gap (computed: `--ds-space-6` + `--ds-space-3` / `--ds-space-4` + `--ds-space-2`) |
| Corner radius | `--ds-radius-md` |
| Transition | `--ds-motion` (background-color, border-color) |

## Accessibility

- Role: `checkbox` from Radix, with `aria-checked` set to `true`, `false` or `mixed`.
- Name: the visible label, through `htmlFor`. The description goes in `aria-describedby`. The icons are `aria-hidden`.
- Group: `fieldset`/`legend` gives role `group` and its name. The fieldset's `aria-describedby` lists the hint, then the error. Each child also gets `aria-invalid="true"` when the group has an error. The error starts with a visually hidden "Error: " and has an icon, so it never relies on color alone. A required group shows an `aria-hidden` asterisk on the legend. Each child gets no `aria-required`, since "at least one" is a group rule and is stated in the hint.
- Contrast: the black border on white is 21:1. The white mark on black is 21:1. The error border on white is 7:1. Hover fills keep the border, so 3:1 still holds. The focus ring is 21:1. Disabled controls are exempt.
- Target size: an md row is 44 px tall and the whole row is clickable. An sm row is 32 px, which meets WCAG 2.5.8.
- Motion: only color transitions, which are dropped under `prefers-reduced-motion`.
- `jest-axe` should find no violations for: unchecked, checked, indeterminate, disabled, invalid, with description, a group (default, with hint, invalid with error, disabled, horizontal) and a "select all" parent with an indeterminate state.
- `userEvent` tests should check: Space toggles; Enter does nothing and does not submit; clicking the label toggles; indeterminate + click becomes checked; Tab visits each enabled box and skips disabled ones; `aria-checked="mixed"` for indeterminate; the group is named by its legend and described by the hint and error; the hidden input submits `name`/`value` when checked.

## Token requests

- `--ds-border-width-strong: 2px`, the same request as in the Slider spec. It would cover the 2 px box border here, the Slider thumb border, and the 2 px invalid border in `Input` and `Textarea`. A 1 px gray-300 border, as on `Input`, does not reach the 3:1 non-text contrast a checkbox needs, so the box uses 2 px black. If the request is declined, the builder uses Tailwind `border-2`, as `Input` already does.
