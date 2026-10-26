# Toggle

- task: DS-5
- canvas: docs/design-system-wireframe/Toggle.dc.html
- canvas_url: https://claude.ai/artifact/UuJ22jU7nJ5m6JBXJbm3uq
- approved: no
- approved_by:
- approved_at:
- approval_hash:

"Toggle" is a family of three components, not one. A single component that handles a boolean, a pill row of text values and a row of icon tiles would need a mode prop that changes its role, keyboard model and layout, so the family splits on those lines:

| Component | Job | Radix | Canvas |
| --- | --- | --- | --- |
| `Switch` | One boolean setting, on or off, applied at once | `Switch` | 01–04 |
| `SegmentedControl` | Pick exactly one of 2–7 short text options | `RadioGroup` | 05–07, 10 |
| `TileGroup` | Pick exactly one of N options shown as icon + label | `RadioGroup` | 07–10 |

`SegmentedControl` and `TileGroup` share one internal base (`ChoiceGroup`, not exported). The base holds the label row, the help slot, the Radix `RadioGroup` wiring and the horizontal-scroll behaviour. The two public components only set how an item looks. In the configurator screenshots, the style row is a `TileGroup`. Depth, legs, back panels and finish are `SegmentedControl`s. The width stepper and the height slider are the existing `Slider` (DS-23, `docs/specs/Slider.md`, `stepper` and `values` + `marks="steps"`) and are out of scope here.

Visual translation: the screenshots use rounded pills and an orange-red accent. This system has square corners and no brand hue, so the selected item is white with a black border and black text, on a gray-100 strip. See Token requests for the accent.

Proposed API:

```ts
// ---------- Switch ----------
interface SwitchBaseProps {
  checked?: boolean;                      // controlled
  defaultChecked?: boolean;               // uncontrolled, default false
  onCheckedChange?: (checked: boolean) => void;
  description?: ReactNode;                // caption under the label
  labelPosition?: 'end' | 'start';        // default 'end' (track, then label)
  size?: 'sm' | 'md';                     // default 'md'
  disabled?: boolean;
  required?: boolean;
  name?: string; value?: string;          // form submission (Radix hidden input), value default 'on'
  id?: string; className?: string;
}
type SwitchProps = SwitchBaseProps &
  ({ label: ReactNode; 'aria-label'?: never } | { label?: never; 'aria-label': string });

// ---------- Choice groups (shared) ----------
interface ChoiceOption<V extends string> {
  value: V;
  label: string;                          // visible text and accessible name
  disabled?: boolean;
}
interface ChoiceGroupBaseProps<V extends string> {
  value?: V;                              // controlled
  defaultValue?: V;                       // uncontrolled; default = first enabled option
  onValueChange?: (value: V) => void;     // only ever called with a real value, never ''
  label: ReactNode;                       // group label (Field label style)
  labelPosition?: 'start' | 'top';        // SegmentedControl default 'start', TileGroup default 'top'
  hint?: ReactNode;                       // caption; shown under the label when labelPosition='top'
  help?: ReactNode;                       // trailing slot, e.g. <IconButton icon="help" aria-label="About legs" />
  size?: 'sm' | 'md';                     // default 'md'
  disabled?: boolean;                     // whole group
  name?: string; required?: boolean;      // form submission (Radix hidden inputs)
  id?: string; className?: string;
}

// ---------- SegmentedControl ----------
interface SegmentedControlProps<V extends string> extends ChoiceGroupBaseProps<V> {
  options: readonly ChoiceOption<V>[];    // 2–7 recommended
  fullWidth?: boolean;                    // segments share width equally; never scrolls; default false
}

// ---------- TileGroup ----------
interface TileOption<V extends string> extends ChoiceOption<V> {
  icon: ReactNode;                        // decorative, rendered aria-hidden; 24 px md / 16 px sm
}
interface TileGroupProps<V extends string> extends ChoiceGroupBaseProps<V> {
  options: readonly TileOption<V>[];
}
```

- `Switch`: `ref` and rest props go to `Switch.Root` (the `button`). `SegmentedControl` / `TileGroup`: `ref` and rest props go to `RadioGroup.Root`.
- Options are data, not children, so the wrapper owns the item markup and the API stays narrow. The value type `V` is a string union so `onValueChange` is typed.
- "Always one selected" comes from `RadioGroup`, which has no deselect. When there is no `value` or `defaultValue`, the wrapper passes the first enabled option as `defaultValue`. A controlled `value` that matches no option is a dev-mode `console.error`.

## Sizes

Switch (canvas 02, 04):

| Size | Track | Thumb | Thumb travel | Row / hit height | Track to label gap | Label type | Use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `sm` | 32 × 16 | 8 × 8 | 16 | 32 | 8 | body-sm 15/24 | dense desktop lists (fine pointer only) |
| `md` (default) | 48 × 24 | 16 × 16 | 24 | 44 (= control height) | 12 | body 16/26 | forms, configurator, touch |

- The track has a 2 px border and 2 px inner padding, and the thumb is square. Off: thumb at the inline start. On: thumb at the inline end. The thumb slides with `--ds-motion` and does not move under `prefers-reduced-motion`.
- Label placement (`labelPosition`):
  - `end` (default): the track comes first and the label follows, as in `Checkbox`.
  - `start`: the label comes first and the track is pushed to the far edge (`justify-content: space-between`, full width). Use it for settings lists and configurator rows, so a Switch row lines up with a `SegmentedControl` row whose label is at the start.
  - Both follow `dir`.
- A wrapping label aligns the track with the first line (`align-items: flex-start`, track margin-top 1 px md / 4 px sm). This is the same rule as `Checkbox`.
- The description is caption 13/20 in `--ds-color-text-muted`, under the label.
- A Switch with no visible label is allowed only in a table row whose header names it, and then needs `aria-label`. The type enforces this.

SegmentedControl (canvas 05):

| Size | Strip height | Strip padding | Segment height | Segment padding-x | Text |
| --- | --- | --- | --- | --- | --- |
| `sm` | 32 | 4 | 24 | 12 | caption 13/20, weight 500 |
| `md` (default) | 44 (= control height) | 4 | 36 | 16 | body 16/26, weight 500 |

- The grey track hugs its segments: it ends where the last segment ends and never stretches to the container width (`display: inline-flex`, `width: fit-content`, `align-self: flex-start` inside flex parents). Only `fullWidth` stretches it.
- Segments hug their text by default (`flex: none`, `white-space: nowrap`), with no gap between them. `fullWidth` makes the strip 100 % wide and gives every segment `flex: 1 1 0` with centred text. A `fullWidth` control never scrolls, so use it only for 2–4 short options.

TileGroup (canvas 08):

| Size | Tile min width × height | Padding-x | Icon | Icon to label | Tile gap | Text |
| --- | --- | --- | --- | --- | --- | --- |
| `sm` | 72 × 64 | 8 | 16 | 4 | 8 | caption 13/20, weight 500 |
| `md` (default) | 96 × 88 | 12 | 24 | 8 | 8 | caption 13/20, weight 500 |

- Tiles hug the label above the min width. The label stays on one line and is never truncated, so keep labels to one or two words.

Choice-group row (canvas 07):

- `labelPosition="start"` (SegmentedControl default): one flex row with a min height of 44 (md) or 32 (sm). It holds the label (`flex: none`), then the control pushed to the end (`margin-inline-start: auto`, `min-width: 0`), then the help slot 8 px after it. Rows without help keep their control flush to the end, and no help column is reserved.
- `labelPosition="top"` (TileGroup default): the label, then the hint, then the control, with an 8 px gap. The help slot sits after the control on the same line.
- The help slot takes any node. The intended content is an `IconButton` (44 × 44) that opens a tooltip or popover. A Tooltip component is not built yet; see Notes.

Overflow (canvas 10), the same for SegmentedControl (hug) and TileGroup:

- The item strip is the scroll container: `overflow-x: auto`, `overflow-y: hidden`, `overscroll-behavior-x: contain`. It never wraps.
- In a start-label row only the strip shrinks. Label and help are `flex: none`. Below about 320 px of container width, switch the field to `labelPosition="top"`. This is guidance; the component does not do it.
- Scroll snapping: `scroll-snap-type: x proximity` on the strip and `scroll-snap-align: start` on items. `scroll-padding-inline` is 24 px so a snapped or scrolled-to item clears the fade.
- Focus ring clearance: `overflow: auto` clips outlines.
  - SegmentedControl: the strip's own 4 px padding already holds the 2 px ring plus its 2 px offset.
  - TileGroup: the scroller gets 4 px padding and −4 px margin, so its outer edge does not move.
  - Trailing padding is ignored in overflowing flex rows in some browsers, so add the end padding with an `::after` spacer.
- Selected item in view: when the component mounts and whenever the value changes, the wrapper calls `item.scrollIntoView({ block: 'nearest', inline: 'nearest' })`. This covers arrow keys and controlled updates. It also runs on focus, which covers Home and End. It uses `behavior: 'smooth'`, except under `prefers-reduced-motion`.
- Edge fade:
  - A 24 px `mask-image` linear gradient on the strip, applied only on the side that has hidden content: `[data-overflow="end" | "both" | "start"]`.
  - The wrapper sets that attribute from a passive `scroll` listener and a `ResizeObserver`. This is the one piece of JS state, because Radix offers no attribute for overflow. When nothing overflows there is no attribute and no fade.
  - The mask is alpha only (black to transparent), so it uses no color token and works on any background.
- Scrollbar: the native one stays, styled with `scrollbar-width: thin` and `scrollbar-color: var(--ds-color-border) transparent`. Mouse users without a trackpad need it, and Shift + wheel also scrolls. There are no prev/next arrow buttons in v1; see Notes.

## States

All visuals come from Radix attributes and pseudo-classes: `[data-state]`, `[data-disabled]`, `:hover`, `:focus-visible`. The overflow fade is the one exception and uses `[data-overflow]`.

Switch (canvas 03, at md, each artboard shows off and on):

| State | Trigger | Track border | Track fill | Thumb | Label | Other |
| --- | --- | --- | --- | --- | --- | --- |
| Off | `[data-state="unchecked"]` | 2 px black | white | black, inline start | black | `cursor: pointer` on the row |
| On | `[data-state="checked"]` | 2 px black | black | white, inline end | black | |
| Hover, off | row `:hover` | 2 px black | gray-100 | black | unchanged | transition `--ds-motion` |
| Hover, on | row `:hover` | 2 px gray-800 | gray-800 | white | unchanged | |
| Focus-visible | track `:focus-visible` | unchanged | unchanged | unchanged | unchanged | 2 px black outline, 2 px offset, on the track only |
| Disabled, off | `[data-disabled]` | 2 px gray-400 | gray-50 | gray-400 | gray-500 | `cursor: not-allowed`, no hover, out of tab order |
| Disabled, on | `[data-disabled]` | 2 px gray-400 | gray-400 | white | gray-500 | |

- There is no invalid state. A switch applies a setting and is never wrong. Required consent ("I accept the terms") uses `Checkbox`.

SegmentedControl (canvas 06, at md):

| State | Trigger | Segment border | Segment fill | Text | Other |
| --- | --- | --- | --- | --- | --- |
| Unselected | `[data-state="unchecked"]` | 1 px transparent | none (strip gray-100 shows) | gray-700, 500 | `cursor: pointer` |
| Selected | `[data-state="checked"]` | 1 px black | white | black, 500 | |
| Hover, unselected | `:hover` on unselected | 1 px transparent | gray-200 | black | transition `--ds-motion` |
| Hover, selected | `:hover` on selected | unchanged | unchanged | unchanged | no change |
| Pressed | `:active` | as hover | as hover | as hover | selection moves on click, no separate style |
| Focus-visible | item `:focus-visible` | unchanged | unchanged | unchanged | 2 px black outline, 2 px offset, `z-index: 1`. Tab and arrow keys always land on the selected item, so the ring shows on the selected segment. Home and End can show it on an unselected one. |
| Disabled item | item `[data-disabled]` | 1 px transparent | none | gray-500 | `cursor: not-allowed`, no hover, skipped by arrow keys |
| Disabled group | root `[data-disabled]` | selected: 1 px gray-400; others transparent | strip gray-50; selected white | gray-500 | out of tab order, selection stays visible |
| No selection | n/a | | | | cannot happen; see API |

TileGroup (canvas 09, at md):

| State | Trigger | Tile border | Tile fill | Icon + label | Other |
| --- | --- | --- | --- | --- | --- |
| Unselected | `[data-state="unchecked"]` | 2 px transparent | gray-100 | gray-700 | `cursor: pointer` |
| Selected | `[data-state="checked"]` | 2 px black | white | black | |
| Hover, unselected | `:hover` | 2 px transparent | gray-200 | black | transition `--ds-motion` |
| Hover, selected | `:hover` | unchanged | unchanged | unchanged | |
| Focus-visible | `:focus-visible` | unchanged | unchanged | unchanged | 2 px black outline, 2 px offset, drawn in the 8 px gap or the 4 px scroller padding |
| Disabled item | `[data-disabled]` | 2 px transparent | gray-50 | icon gray-400, label gray-500 | `cursor: not-allowed`, no hover, skipped by arrow keys |
| Disabled group | root `[data-disabled]` | selected: 2 px gray-400 | all gray-50; selected white | icon gray-400, label gray-500 | out of tab order |

Choice-group row:

| State | Label | Hint | Help slot |
| --- | --- | --- | --- |
| Default | Field label style, black | caption gray-600 | as passed |
| Disabled group | gray-500 | gray-500 | unchanged (the consumer decides; help usually stays enabled to explain the lock) |

Overflow (canvas 10):

| State | Attribute | Fade |
| --- | --- | --- |
| Fits | none | none |
| At start, more after | `data-overflow="end"` | 24 px at inline end |
| Middle | `data-overflow="both"` | 24 px at both edges |
| At end, more before | `data-overflow="start"` | 24 px at inline start |

## Keyboard

Switch:

| Key | Action |
| --- | --- |
| Space | Toggles on / off. (Radix) |
| Enter | Toggles. Native `button` activation; Radix `Switch` does not block it. |
| Tab / Shift + Tab | Next / previous focusable. Every switch is its own tab stop. |

- Focus order follows the DOM. Disabled switches are skipped. Clicking the label focuses and toggles the switch.

SegmentedControl and TileGroup (Radix `RadioGroup`, roving tabindex):

| Key | Action |
| --- | --- |
| Tab | Moves into the group and lands on the selected item. The next Tab leaves the group: to the help slot if present, then onward. |
| Shift + Tab | Leaves the group backwards, from whichever item has focus. |
| Arrow Right / Arrow Down | Moves focus to the next enabled item **and selects it**. Wraps from last to first (`loop`, default true). The item is scrolled into view. |
| Arrow Left / Arrow Up | Same as above, to the previous item. Left and Right are mirrored when `dir="rtl"`. |
| Home / End | Moves focus to the first / last enabled item **without selecting it**, because Radix selects only on arrow keys. The item is scrolled into view. |
| Space | Selects the focused item. Does nothing if it is already selected. |
| Enter | No action. Radix prevents it, so it never submits the form. |

- Focus order: label (not focusable), then the group (one tab stop), then the help button. Disabled items are skipped by arrow keys. A disabled group is skipped entirely.
- `orientation` is not exposed. The wrapper leaves it undefined so both arrow axes work, which suits a horizontal strip that could become a vertical stack on mobile.

## Radix

- `Switch`: `Switch` from `radix-ui` (`import { Switch } from 'radix-ui'`). `Switch.Root` is the track, a `button` with `role="switch"` and `aria-checked`. `Switch.Thumb` is the square thumb. Radix provides `data-state`, `data-disabled` and the hidden input for forms. The label is `Label` from `radix-ui`, with `htmlFor` set to the root id.
- `SegmentedControl` and `TileGroup`: `RadioGroup` from `radix-ui`. `RadioGroup.Root` is the strip, with `role="radiogroup"`. Each item is a `RadioGroup.Item`, a `button` with `role="radio"`. `RadioGroup.Indicator` is not used, because the whole item restyles from `[data-state="checked"]`.
  - Why `RadioGroup` and not `ToggleGroup type="single"`: the value must always be set. `ToggleGroup` lets the user click the active item to deselect it (`value` becomes `''`), and the wrapper would have to fight that in `onValueChange`, which also breaks uncontrolled use.
  - `RadioGroup` has no deselect, gives the correct semantics for "one value of a form field" (`radiogroup` / `radio`, announced "2 of 4"), and submits `name` / `value` through hidden inputs.
  - Selection follows focus on arrow keys, which is the expected radio behaviour. For the configurator, every arrow press updates the model. Consumers whose `onValueChange` is expensive should debounce in their handler, not in the component.
  - `ToggleGroup` remains the right primitive for toolbars (bold, italic, align), which is not this job.
- The group label is a `span` whose id goes in `aria-labelledby` on `RadioGroup.Root`. The hint id goes in `aria-describedby`. There is no `fieldset` / `legend`, because Radix's `radiogroup` role already groups the items and a `fieldset` around a `role="radiogroup"` would double the group.
- The help slot renders outside `RadioGroup.Root`, so it is not part of the roving focus.

## Tokens

Switch:

| Property | Token |
| --- | --- |
| Row height md / sm | `--ds-control-height` / `--ds-space-8` |
| Track md: width × height | `--ds-space-12` × `--ds-space-6` |
| Track sm: width × height | `--ds-space-8` × `--ds-space-4` |
| Thumb md / sm | `--ds-space-4` / `--ds-space-2` |
| Track border width, track inner padding | `--ds-border-width-strong` (2 px, both) |
| Track border, off and on | `--ds-color-ink` |
| Track fill off / on | `--ds-color-surface` / `--ds-color-primary` |
| Thumb off / on | `--ds-color-ink` / `--ds-color-primary-contrast` |
| Hover fill, off | `--ds-color-fill` |
| Hover fill and border, on | `--ds-color-primary-hover` |
| Disabled border, disabled thumb (off), disabled fill (on) | `--ds-color-disabled` |
| Disabled fill (off) | `--ds-color-surface-subtle` |
| Disabled thumb (on) | `--ds-color-primary-contrast` |
| Disabled label | `--ds-color-placeholder` |
| Track to label gap md / sm | `--ds-space-3` / `--ds-space-2` |
| Label | `--ds-font-text`, body 16/26 (sm 15/24), `--ds-color-ink` |
| Description | caption 13/20, `--ds-color-text-muted` |
| Focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Corner radius | `--ds-radius-md` (track and thumb) |
| Thumb slide, color transition | `--ds-motion` (transform, background-color, border-color) |

SegmentedControl:

| Property | Token |
| --- | --- |
| Strip height md / sm | `--ds-control-height` / `--ds-space-8` |
| Strip padding | `--ds-space-1` |
| Segment height | strip height − 2 × `--ds-space-1` (36 / 24, computed) |
| Segment padding-x md / sm | `--ds-space-4` / `--ds-space-3` |
| Strip fill | `--ds-color-fill` |
| Strip fill, disabled group | `--ds-color-surface-subtle` |
| Segment border width | `--ds-border-width` |
| Selected border | `--ds-color-ink` |
| Selected fill | `--ds-color-surface` |
| Selected text | `--ds-color-ink` |
| Unselected text | `--ds-color-text` |
| Hover fill, unselected | `--ds-color-gray-200` (palette; no semantic hover-on-fill role exists) |
| Hover text | `--ds-color-ink` |
| Disabled text | `--ds-color-placeholder` |
| Disabled selected border | `--ds-color-disabled` |
| Text md / sm | `--ds-font-text` 500, body 16/26 / caption 13/20 |

TileGroup:

| Property | Token |
| --- | --- |
| Tile min height md / sm | 88 / 64: `--ds-space-16` + `--ds-space-6` / `--ds-space-16` (computed) |
| Tile min width md / sm | 96 / 72: `--ds-space-24` / `--ds-space-16` + `--ds-space-2` (computed) |
| Tile padding-x md / sm | `--ds-space-3` / `--ds-space-2` |
| Icon md / sm | `--ds-space-6` / `--ds-space-4`, `currentColor` |
| Icon to label md / sm | `--ds-space-2` / `--ds-space-1` |
| Tile gap | `--ds-space-2` |
| Tile border width | `--ds-border-width-strong` |
| Unselected fill / selected fill | `--ds-color-fill` / `--ds-color-surface` |
| Selected border, selected icon + label | `--ds-color-ink` |
| Unselected icon + label | `--ds-color-text` |
| Hover fill | `--ds-color-gray-200` |
| Disabled fill | `--ds-color-surface-subtle` |
| Disabled icon / label | `--ds-color-disabled` / `--ds-color-placeholder` |
| Disabled selected border | `--ds-color-disabled` |
| Label | `--ds-font-text` 500, caption 13/20 |

Shared (choice-group row, overflow, focus):

| Property | Token |
| --- | --- |
| Group label | `--ds-font-mono`, label style 12/16 uppercase +8 %, `--ds-color-ink`; disabled `--ds-color-placeholder` |
| Hint | caption 13/20, `--ds-color-text-muted` |
| Row min height md / sm | `--ds-control-height` / `--ds-space-8` |
| Label to control gap (start) md / sm | `--ds-space-4` / `--ds-space-3` |
| Label to hint to control (top) | `--ds-space-2` |
| Control to help gap | `--ds-space-2` |
| Scroller focus clearance (TileGroup) | `--ds-space-1` padding and negative margin (= `--ds-focus-width` + `--ds-focus-offset`) |
| Edge fade length, scroll-padding-inline | `--ds-space-6` |
| Scrollbar thumb | `--ds-color-border` |
| Focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Corner radius | `--ds-radius-md` |
| Transitions | `--ds-motion` (background-color, border-color, color) |

## Accessibility

- **Switch**
  - Role `switch` with `aria-checked="true" | "false"` (Radix).
  - The name comes from the visible label through `htmlFor`, or from the required `aria-label` when there is no visible label. The description goes in `aria-describedby`.
  - The on/off state is shown by thumb position and an inverted fill, never by color alone. There is no "ON/OFF" text inside the track, because the label must describe the setting, not its state.
- **SegmentedControl and TileGroup**
  - Role `radiogroup` (named by `aria-labelledby` = group label id, described by the hint), with items of role `radio` and `aria-checked` (Radix).
  - Each item's name is its visible label. TileGroup icons are `aria-hidden`.
  - `required` sets `aria-required` on the group.
  - The help button sits outside the group and needs its own `aria-label` (for example "About legs"). The `help` slot docs must say so.
- **Overflow**
  - Hidden items stay in the accessibility tree and in the arrow-key order. Screen readers announce "n of m".
  - The fade is decorative (a mask), so it has no a11y impact.
  - The strip is not a separate tab stop: the radio items are already focusable, so there is no `tabindex="0"` on the scroller. This avoids an axe `scrollable-region-focusable` false positive.
- **Contrast**
  - Switch: track border black on white is 21:1. The off thumb is black on white and the on thumb white on black, both 21:1. Hover keeps the border, so 3:1 still holds.
  - SegmentedControl:
    - Selected border black on gray-100 is 18.1:1, so the selected segment passes 1.4.11 by its border, not by its white fill (1.1:1).
    - Unselected text gray-700 on gray-100 is 8.9:1, and on gray-200 hover 7.8:1. Selected text black on white is 21:1.
  - TileGroup: the same as SegmentedControl, and the 2 px border makes the selected tile easier to spot in a long scrolling row.
  - The focus ring is 21:1 on white. The black ring on gray-100 strip padding is 18.1:1.
  - Disabled controls are exempt. Disabled text gray-500 on gray-50 is 4.2:1.
- **Target size**
  - md: a Switch row, a segment and the help button are 44 px tall, and a tile is 88 px.
  - sm: a Switch row is 32 px and a segment 24 px tall (meets WCAG 2.5.8 minimum 24 × 24). A tile is 64 px.
  - The sm SegmentedControl is for fine pointers only. Say so in the docs.
- **Motion**: the thumb slide, the color transitions and smooth `scrollIntoView` are all dropped under `prefers-reduced-motion`.
- **`jest-axe`** should find no violations for:
  - Switch: off, on, disabled off/on, `labelPosition` start and end, with description, `aria-label` only.
  - SegmentedControl: sm, md, `fullWidth`, label start and top, with hint, with help, a disabled item, a disabled group, overflowing (8 options in a narrow container).
  - TileGroup: md and sm, a disabled item, a disabled group, overflowing.
- **`userEvent`** tests should check:
  - Switch:
    - Space and Enter toggle.
    - Clicking the label toggles.
    - Tab skips a disabled switch.
    - The hidden input submits `name` / `value` when on.
  - SegmentedControl and TileGroup:
    - Tab lands on the selected item.
    - Arrow Right selects the next item, skips disabled ones and wraps.
    - Arrow Left in RTL goes forward.
    - Home and End move focus without changing the value; Space then selects.
    - Clicking the selected item does not fire `onValueChange` and does not clear the value.
    - With no `defaultValue`, the first enabled option is selected.
    - Enter does not submit the form.
    - Tab from the group goes to the help button.
    - `scrollIntoView` is called on value change (stubbed in `jest.setup.ts`, together with `ResizeObserver`).
    - `data-overflow` is set correctly when the stubbed `scrollWidth` exceeds `clientWidth`.

## Token requests

None required. Everything above maps to existing tokens, including `--ds-border-width-strong` (2 px), which now exists.

Not requested, for the reviewer to decide:

- `--ds-color-accent` (about `#E5482E`, the orange-red in the configurator screenshots) for selected text and icons. **Not recommended.** The system has no brand hue, and hue is reserved for status feedback (README, "Color"). The design shows selection with a black border, white fill and black text, which is clearer than an accent color and passes contrast without it. If a brand theme is wanted later, it should be a theme-level override of `--ds-color-ink` / `--ds-color-primary` under a `[data-theme]` selector, not a new token used only here. A ~`#E5482E` text would also fail 4.5:1 on white (about 4.0:1).
- `--ds-color-fill-hover` (= gray-200) as a semantic role for "hover on a gray-100 fill". The spec uses the palette token `--ds-color-gray-200` directly for now. Add the role only if more components need it.

## Notes and open questions

- **Roadmap follow-up needed.** DS-6 (Toggle implementation) as written covers only the Radix `Switch`. Either narrow DS-6 to `Switch` and add two new tasks, or widen DS-6 to the family and split it into three PRs:
  - `SegmentedControl — implementation` (with the shared `ChoiceGroup` base and the overflow behaviour)
  - `TileGroup — implementation` (depends on the first)
- **Naming.** The roadmap calls this "Toggle", but the boolean component is named `Switch` to match its role and Radix, and to avoid confusion with Radix `Toggle` (a pressed/unpressed button). Is `TileGroup` the preferred name, or `OptionTiles` / `IconChoice`?
- **Switch vs 2-option SegmentedControl for on/off** (canvas 07):
  - The default advice is `Switch` (with `labelPosition="start"` in configurator rows).
  - A 2-option SegmentedControl ("Off / On") is allowed when the row sits in a stack of SegmentedControls and should read the same, or when both states have their own names (Standard / Plinth).
  - Please confirm which the configurator should use for "back panels".
- **Help slot content.** There is no Tooltip or Popover component yet. Until one exists, the help `IconButton` can open a `Dialog` (DS-20), or the consumer can wire it up themselves. Does a "help" icon need to be added to `Icon`?
- **Scroll buttons.** v1 relies on swipe, trackpad, the thin scrollbar and the arrow keys. Optional prev/next `IconButton`s at the strip edges could come later if mouse-only testing shows the scrollbar is not discoverable enough.
- **Tiles with images** (for example finish swatches shown as photos) are out of scope. The icon slot takes any node, but photo tiles would need the photography filter and a different size scale.
- **Out of scope:** the width stepper and the height slider from the screenshots are `Slider` (DS-23).
