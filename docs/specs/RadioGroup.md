# RadioGroup

- task: DS-15
- canvas: docs/design-system-wireframe/RadioGroup.dc.html
- canvas_url: https://claude.ai/artifact/F2qAAT8HRmLYmV7r3WjoU8
- approved: no
- approved_by:
- approved_at:
- approval_hash:

Pick exactly one of a list of options. Each item is a square box with a 2 px black border and the label to its right, the same box, row, label, focus, invalid and disabled treatment as `Checkbox`. A selected item keeps the white box and shows a black square dot inset at half the box size. A checked `Checkbox` instead fills black with a white tick, so the two controls differ when on without breaking the system's square-only shape rule. The group label, hint and error look exactly like `CheckboxGroup`. It is built on Radix `RadioGroup`, so the group is one tab stop and arrow keys move focus and selection together.

Proposed API:

```ts
interface RadioGroupProps {
  label: ReactNode;                  // group label, Field label style; names the radiogroup
  hideLabel?: boolean;               // visually hidden, still names the group
  hint?: ReactNode;
  error?: ReactNode;                 // sets invalid on the group and on every item
  value?: string;                    // controlled
  defaultValue?: string;             // uncontrolled; no preselection when omitted
  onValueChange?: (value: string) => void;
  name?: string;                     // form submission (Radix renders hidden inputs)
  required?: boolean;
  disabled?: boolean;                // disables every item
  orientation?: 'vertical' | 'horizontal'; // layout only, default 'vertical'
  size?: 'sm' | 'md';                // default 'md', passed to items
  loop?: boolean;                    // default true (Radix)
  dir?: 'ltr' | 'rtl';
  children: ReactNode;               // RadioGroupItem elements
  id?: string; className?: string;
}

interface RadioGroupItemProps {
  value: string;
  label: ReactNode;                  // rendered to the right of the box
  description?: ReactNode;           // caption under the label
  disabled?: boolean;
  id?: string; className?: string;
}
```

- `ref` and rest props of `RadioGroup` go to `RadioGroup.Root`. `ref` and rest props of `RadioGroupItem` go to `RadioGroup.Item` (the `button`). The group passes `size` and `invalid` to its items through React context, the same way `CheckboxGroup` does.
- The prop is `label`, not `legend` as on `CheckboxGroup`, because it is not a `<legend>` (see Radix). It matches `SegmentedControl`'s `label`.
- There is no standalone `Radio`. A radio only makes sense inside a group.
- No preselection: unlike `SegmentedControl`, the group may have no value. This is the right default for required questions, where a preselected answer hides the fact that the user never chose one. Pass `defaultValue` to preselect.
- Deselecting is not possible once a value is set (radio semantics, Radix has no deselect).

## Sizes

Canvas section 01. Every number matches `Checkbox`.

| Size | Box | Dot | Row / hit height | Box to label gap | Label type | Use |
| --- | --- | --- | --- | --- | --- | --- |
| `sm` | 16 × 16 | 8 × 8 | 32 px | 8 px | body-sm 15/24 | dense desktop filters and tables (fine pointer only) |
| `md` (default) | 24 × 24 | 12 × 12 | 44 px (= control height) | 12 px | body 16/26 | forms, touch |

- Shape (canvas section 02): the box has a 2 px border and square corners. The dot is a square centred in the box at half its size, which leaves a 4 px (md) / 2 px (sm) white gap between the border and the dot. A circular radio was considered and is shown on the canvas as "not proposed"; see Token requests.
- The whole row (box plus label) is the click target. Clicking the label or the empty space in the row selects the item, as in `Checkbox`.
- Label placement (canvas section 05), as in `Checkbox`: the label is always to the right of the box (left in RTL, because the row is a flex row that follows `dir`). It uses body text in `--ds-color-ink`. Single-line rows centre the box. When the label wraps, the row uses `align-items: flex-start`, the box gets a top margin of (row − box) / 2 (10 px md, 8 px sm), and the label text gets (row − line height) / 2 vertical padding (9 px md, 4 px sm), so the first line stays centred on the box.
- Description: caption 13/20 in `--ds-color-text-muted`, directly under the label, same indent. Use it in vertical groups only.
- Group layout (canvas section 06): label, hint, options, error, with 8 px between each. Vertical options stack with no extra gap because each row is already 44 / 32 px. Horizontal options sit in a row with a 24 px column gap and wrap with no row gap.

## States

Item states are on canvas section 03 (vertical) and section 04 (horizontal). The item looks the same in both orientations; only the layout changes.

| State | Trigger | Border | Fill | Dot | Label | Other |
| --- | --- | --- | --- | --- | --- | --- |
| Unselected | `[data-state="unchecked"]` | 2 px black | white | none | black | `cursor: pointer` on the row |
| Selected | `[data-state="checked"]` | 2 px black | white | black, 12 / 8 px | black | dot is `RadioGroup.Indicator`, mounted only when checked |
| Hover, unselected | row `:hover` | 2 px black | gray-100 | none | unchanged | transition `--ds-motion` |
| Hover, selected | row `:hover` | 2 px gray-800 | white | gray-800 | unchanged | mirrors Checkbox checked hover |
| Focus-visible, unselected | item `:focus-visible` | unchanged | unchanged | none | unchanged | 2 px black outline, 2 px offset, on the box only. Seen when tabbing into a group with no value |
| Focus-visible, selected | item `:focus-visible` | unchanged | unchanged | black | unchanged | the usual case, because arrow keys select |
| Disabled, unselected | `[data-disabled]` | 2 px gray-400 | gray-50 | none | gray-500 | `cursor: not-allowed`, no hover, skipped by arrow keys |
| Disabled, selected | `[data-disabled][data-state="checked"]` | 2 px gray-400 | gray-50 | gray-400 | gray-500 | |
| Invalid, unselected | `[aria-invalid="true"]` | 2 px error | white | none | black | error message with an icon under the options |
| Invalid, selected | `[aria-invalid="true"][data-state="checked"]` | 2 px error | white | error | black | rare: a selected value rejected by the server |
| Invalid + hover | invalid and row `:hover` | error kept | unselected: gray-100; selected: white | selected: error kept | black | the error colour is never replaced by gray-800 |
| Invalid + focus | invalid and `:focus-visible` | error kept | as invalid | as invalid | black | plus the black outline |
| Disabled + invalid | both | disabled wins | as disabled | as disabled | gray-500 | same rule order as `Checkbox.css` |

Group states (canvas sections 03, 04 and 06):

| State | Label | Hint | Items | Error |
| --- | --- | --- | --- | --- |
| Default | Field label style, black | gray-600 caption under the label | as above | none |
| Required | asterisk after the label (`aria-hidden`) | unchanged; should say it is required | unchanged | none |
| Invalid | unchanged | unchanged | every item invalid | under the options: caption 500 in error with a 14 px alert icon and a visually hidden "Error: " prefix |
| Disabled | gray-500 | gray-500 | every item disabled | none |
| Hidden label | visually hidden, still in the accessibility tree | as default | unchanged | unchanged |

- All visual state comes from Radix attributes and pseudo-classes: `[data-state]`, `[data-disabled]`, `[aria-invalid="true"]`, `:hover`, `:focus-visible`. Orientation and size are `data-orientation` / `data-size` on the wrapper. The component holds no JS state for visuals.

## Keyboard

Radix `RadioGroup` uses a roving tabindex: the group is one tab stop, and only one item has `tabindex="0"` at a time. Canvas section 07 walks through it.

| Key | Action |
| --- | --- |
| Tab | Moves into the group. Focus lands on the selected item, or on the first enabled item when nothing is selected. Focusing by Tab never selects. The next Tab leaves the group. |
| Shift + Tab | Leaves the group backwards, from whichever item has focus. |
| Arrow Down / Arrow Right | Moves focus to the next enabled item **and selects it**. Wraps from last to first (`loop`, default true). |
| Arrow Up / Arrow Left | Moves focus to the previous enabled item **and selects it**. Wraps from first to last. |
| Home / End | Moves focus to the first / last enabled item **without selecting it** (Radix selects only on arrow keys). |
| Space | Selects the focused item. No action if it is already selected. |
| Enter | No action. Radix prevents it, so it never submits the form. |

- Both arrow axes work in both orientations, as with native radios. The wrapper's `orientation` prop sets layout only and is **not** passed to `RadioGroup.Root`, because Radix's `orientation` would disable the cross-axis arrows (the same choice as `SegmentedControl`).
- RTL: with `dir="rtl"`, Arrow Left and Arrow Right are mirrored. Up and Down are unchanged.
- Disabled items are skipped by arrow keys and never hold the tab stop. A disabled group is skipped by Tab entirely.
- Focus order: group label, hint and error are not focusable. The group is one stop in DOM order between the fields before and after it. Clicking an item or its label focuses and selects it.

## Radix

- `RadioGroup` from `radix-ui` (`import { RadioGroup, Label } from 'radix-ui'`).
  - `RadioGroup.Root` is the options container, a `div` with `role="radiogroup"`. Radix sets `aria-required`, `data-disabled`, `dir` and runs the roving focus.
  - `RadioGroup.Item` is the box, a `button` with `role="radio"` and `aria-checked`. Radix provides `data-state="checked" | "unchecked"`, `data-disabled`, Space selection, Enter prevention, and a hidden native input per item for `name` / `value` / `required` form submission.
  - `RadioGroup.Indicator` is the dot. It is mounted only when the item is checked, so the dot needs no `display` toggling.
- Item label: `Label` from `radix-ui`, with `htmlFor` set to the item id, as in `Checkbox`.
- Group label: a `span` whose id goes in `aria-labelledby` on `RadioGroup.Root`, as in `ChoiceGroup`. There is no `fieldset` / `legend`: a `role="radiogroup"` inside a `fieldset` would be announced as two nested groups. The wrapper is a plain `div` carrying `data-orientation`, `data-size` and `data-disabled`.
- Why not reuse `ChoiceGroup`: its options-array API, sliding indicator, horizontal scroller and start-aligned label are for segmented strips and tiles. RadioGroup needs children with descriptions, wrapping instead of scrolling, and an error slot. The builder may share small pieces (label and hint classes) if that falls out naturally, but `ChoiceGroup` is not the base.

## Tokens

| Property | Token |
| --- | --- |
| Row / hit height md / sm | `--ds-control-height` / `--ds-space-8` |
| Box size md / sm | `--ds-space-6` / `--ds-space-4` |
| Dot size md / sm | `--ds-space-3` / `--ds-space-2` |
| Box border width | `--ds-border-width-strong` |
| Box border, default | `--ds-color-ink` |
| Box fill, default and selected | `--ds-color-surface` |
| Box fill, unselected hover (incl. invalid) | `--ds-color-fill` |
| Dot, selected | `--ds-color-primary` |
| Border and dot, selected hover | `--ds-color-primary-hover` |
| Disabled border, disabled selected dot | `--ds-color-disabled` |
| Disabled fill | `--ds-color-surface-subtle` |
| Disabled item label and description, disabled group label and hint | `--ds-color-placeholder` |
| Invalid border, invalid selected dot | `--ds-color-error` |
| Focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Box to label gap md / sm | `--ds-space-3` / `--ds-space-2` |
| Wrapped label: box top margin, label padding | computed: (row − box) / 2 and (row − line height) / 2, from the tokens above |
| Item label | `--ds-font-text`, 16 px / `--ds-line-height-lg` (sm 15 px / `--ds-line-height-md`), `--ds-color-ink` |
| Item description | `--ds-font-text`, 13 px / `--ds-line-height-sm`, `--ds-color-text-muted` |
| Group label | `--ds-font-mono` 500, 12 px / `--ds-line-height-xs`, uppercase, +8 % tracking, `--ds-color-ink` |
| Hint | 13 px / `--ds-line-height-sm`, `--ds-color-text-muted` |
| Label to hint, hint to options, options to error | `--ds-space-2` |
| Horizontal column gap | `--ds-space-6` |
| Error | 13 px / `--ds-line-height-sm`, weight 500, `--ds-color-error`, 14 px alert `Icon`; icon gap and layout identical to the `CheckboxGroup` error row |
| Corner radius (box and dot) | `--ds-radius-md` |
| Transition | `--ds-motion` (background-color, border-color); none under `prefers-reduced-motion` |

## Accessibility

- Roles: `RadioGroup.Root` is `radiogroup`; each item is `radio` with `aria-checked="true" | "false"` (Radix). Screen readers announce position ("2 of 3").
- Names: the group is named by its visible label through `aria-labelledby` (also when `hideLabel` is set; the label is visually hidden, not removed). Each item is named by its visible label through `htmlFor`. The dot is decorative.
- Descriptions: `RadioGroup.Root` gets `aria-describedby` = hint id, then error id. Each item with a description gets `aria-describedby` = its description id.
- Invalid: when `error` is set, `RadioGroup.Root` and every item get `aria-invalid="true"`. The error text starts with a visually hidden "Error: " and has an icon, so it never relies on colour alone.
- Required: `required` makes Radix set `aria-required="true"` on the root and `required` on the hidden inputs. The visible asterisk is `aria-hidden`; the hint should say "Required."
- Selection is shown by a shape (the dot), not by colour.
- Contrast:
  - Black border on white 21:1; on the gray-100 hover fill 18.1:1. Black dot on white 21:1.
  - Gray-800 hover border and dot on white 15.1:1.
  - Error border and dot on white 7:1; error border on gray-100 hover 6:1. All pass 3:1 (WCAG 1.4.11).
  - Focus ring black on white 21:1.
  - Disabled controls are exempt. Disabled label gray-500 on white is 4.5:1.
- Target size: an md row is 44 px tall and the whole row is clickable. An sm row is 32 px, which meets WCAG 2.5.8. Horizontal items are at least 24 px wide plus their label.
- Motion: only colour transitions, removed under `prefers-reduced-motion`.
- `jest-axe` should find no violations for: default with no value, with a selected value, with a hint, with item descriptions, a disabled item, a disabled group, invalid with error (unselected and selected), required, hidden label, horizontal, sm.
- `userEvent` tests should check:
  - Tab enters on the selected item, or on the first enabled item when there is no value, without selecting it.
  - Arrow Down / Right select the next item and Arrow Up / Left the previous one, wrapping at both ends, in both orientations.
  - Home / End move focus without selecting; Space then selects.
  - Arrow keys skip disabled items; a disabled group is skipped by Tab.
  - Enter does nothing and does not submit the form.
  - Clicking an item's label selects it.
  - The group is named by its label and described by the hint and error; `aria-invalid` and `aria-required` are present when set.
  - The hidden input submits `name` / `value` of the selected item.
  - `dir="rtl"` mirrors Arrow Left / Right.

## Token requests

None. The design uses only existing tokens.

For the review decision only: if the reviewer prefers a conventional circular radio (canvas section 02, "Alternative · not proposed"), it needs a new token `--ds-radius-full: 50%` for the box and the dot. It is not proposed because the system has square corners everywhere (`--ds-radius: 0`), including the Switch thumb, and the inset-dot treatment already separates Radio from Checkbox.
