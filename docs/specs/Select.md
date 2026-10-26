# Select

- task: DS-17
- canvas: docs/design-system-wireframe/Select.dc.html
- canvas_url: https://claude.ai/artifact/GYZS1Eqf7wtJGW1ZB8tCSg
- approved: no
- approved_by:
- approved_at:
- approval_hash:

Pick one value from a list. The closed trigger looks exactly like `Input`: 44 px, 1 px gray-300 border, body 16/26, and the same hover, focus, invalid and disabled treatment. It is wired to `Field` (label, hint, error) through `useFieldControl()`. It opens a square listbox with a 1 px black border and no shadow, 4 px below the trigger, in a portal. Options are plain data, so the same props drive three renderers:

1. the default list on Radix `Select`;
2. the search variant (`searchable`), on Radix `Popover` with an ARIA combobox, because Radix `Select` cannot filter;
3. a native `<select>` on touch-first devices.

Options can be preselected, can carry a leading emoji (for example a country flag), and can be split into "Top choices" and the rest.

Proposed API:

```ts
interface SelectOption {
  value: string;            // non-empty and unique (Radix reserves '' for "no value")
  label: string;            // plain text: accessible name, typeahead, search, native <option> text
  emoji?: string;           // leading emoji, e.g. '🇩🇪'; decorative, see Accessibility
  disabled?: boolean;
  keywords?: string[];      // extra search terms, e.g. ['Deutschland', 'DE']; search variant only
}

interface SelectProps {
  options: SelectOption[];
  value?: string;           // controlled; '' or undefined shows the placeholder
  defaultValue?: string;    // uncontrolled preselection; omitted = placeholder
  onValueChange?: (value: string) => void;
  placeholder?: string;     // default 'Select an option'
  topValues?: string[];     // values listed first, in this order, under topLabel
  topLabel?: string;        // default 'Top choices'
  restLabel?: string;       // default 'All options'; label of the second group
  searchable?: boolean;     // default false; adds the search field (custom list only)
  searchPlaceholder?: string;             // default 'Search'
  noResultsText?: (query: string) => string; // default q => `No results for “${q}”`
  native?: 'auto' | boolean; // default 'auto', see Radix › Native on touch
  open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; // ignored when native
  name?: string;            // form submission
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;        // without Field; Field sets aria-invalid itself
  id?: string; className?: string;
  'aria-label'?: string; 'aria-labelledby'?: string; // only when used without Field
}

interface SelectFieldProps extends SelectProps {
  label: ReactNode; hint?: ReactNode; error?: ReactNode;
  fieldClassName?: string;  // Field wrapper; className goes to the trigger
}
```

- `Select` is the bare control; `SelectField` is `Field` + `Select`, the same split as `Input` / `TextField`. Inside a `Field`, `Select` takes `id`, `aria-invalid`, `aria-describedby`, `aria-required` and `disabled` from `useFieldControl()`; explicit props win.
- `ref` goes to the focusable control: the trigger `button`, or the `<select>` in native mode (`forwardRef<HTMLButtonElement | HTMLSelectElement>`). Rest props go to the same element.
- `value` / `defaultValue`: preselect by passing an option's `value`. A controlled `value=''` resets to the placeholder. A value that matches no option shows the placeholder and logs a dev-only warning. There is no clear button; for an optional field, add an option such as "None" (canvas 04, "Other / not listed").
- Options are an array, not children. One data source is needed for the custom list, the filtered list and the native `<option>`s, and labels must be plain strings for typeahead, filtering and native text.
- `topValues`: each listed option appears **once**, in the top group, in `topValues` order. Every other option goes in the second group, in `options` order. Radix `Select` needs unique values, and a duplicate would show two checks. Without `topValues` there are no groups, labels or separator.

## Sizes

One size, `md`, like `Input` (canvas 01). There is no `sm`. Dense tables can use the native `<select>` or a later size if needed.

| Part | Measure |
| --- | --- |
| Trigger | height 44 px (`--ds-control-height`), full container width, padding 0 12 px, gap 8 px between parts |
| Trigger parts | [emoji slot 24 px] · value or placeholder (one line, ellipsis) · chevron-down `Icon` 16 px, stroke 1.5 |
| List panel | 1 px black border, white, 0 radius, no shadow, 4 px top and bottom padding inside the viewport |
| List width | `min-width: var(--radix-select-trigger-width)` (search: `--radix-popover-trigger-width`); grows for a wider option up to `var(--radix-select-content-available-width)` |
| List max height | `min(calc(7.5 * var(--ds-control-height)), var(--radix-select-content-available-height))` = 330 px or less. The half row at the cut shows that the list scrolls. Search variant: the 44 px search row plus a list capped the same way, with the total capped at `--radix-popover-content-available-height`. |
| List position | below the trigger, start-aligned, 4 px gap (`sideOffset={4}`), 8 px from viewport edges (`collisionPadding={8}`); flips above when there is not enough room below (canvas 07) |
| Item | min height 44 px, padding 9 px 12 px (so a 26 px line is centred), gap 8 px: [emoji slot 24 px] · label · check slot 16 px |
| Long item label | wraps; `align-items: flex-start`; the check gets a 5 px top margin to centre it on the first line |
| Group label | mono 12/16 uppercase, +8 % tracking, padding 12 px top, 12 px sides, 4 px bottom |
| Separator | 1 px, 4 px margin above and below |
| Scroll up / down button | 24 px tall, full width, chevron 16 px centred, 1 px divider toward the list. Shown only when the list can scroll that way. |
| Search row | 44 px, padding 0 12 px, search `Icon` 16 px, gap 8 px, 1 px bottom divider; fixed above the scrolling list |
| No results row | min height 44 px, padding 9 px 12 px |

- Emoji slot: if **any** option has an `emoji`, every item and the trigger reserve the 24 px slot, so labels line up; an option without one leaves it empty. If no option has an emoji, there is no slot. The emoji is drawn at text size (16 px) and centred in the slot.
- The check slot is always reserved, so a label never moves when it becomes selected.
- Item text starts 12 px in, the same as the trigger text, so a value lines up with its option when the list opens below.

## States

### Trigger (canvas 02)

| State | Trigger | Border | Fill | Text | Chevron / emoji | Other |
| --- | --- | --- | --- | --- | --- | --- |
| Default, placeholder | `[data-placeholder]` | 1 px gray-300 | white | placeholder gray-500 | chevron black | `cursor: pointer` |
| Filled / preselected | value set | 1 px gray-300 | white | black | emoji in colour before the value | |
| Hover | `:hover`, not disabled or invalid | 1 px black | white | unchanged | unchanged | transition `--ds-motion` |
| Focus-visible | `:focus-visible` | 1 px black | white | unchanged | unchanged | 2 px black outline, 2 px offset |
| Open | `[data-state="open"]` | 1 px black | white | unchanged | chevron rotated 180° | no ring: focus is in the list |
| Disabled | `[data-disabled]` / `:disabled` | 1 px gray-200 | gray-50 | gray-500 (value and placeholder) | chevron gray-400; emoji monochrome | `cursor: not-allowed`, not focusable, no hover |
| Invalid | `[aria-invalid="true"]` | 2 px error | white | unchanged | unchanged | Field error message with icon below |
| Invalid + hover / open | both | 2 px error kept | white | unchanged | open: chevron rotated | error colour is never replaced by black |
| Invalid + focus | both | 2 px error kept | white | unchanged | unchanged | plus the black outline |
| Disabled + invalid | both | disabled wins | gray-50 | gray-500 | as disabled | same rule order as `Textarea.css` |
| Long value | value overflows | | | one line, `text-overflow: ellipsis` | | full label in the list and in the accessible value |

- The 2 px invalid border is not compensated in padding, the same as `Input` and `Textarea`.
- The Field label turns gray-500 when disabled and shows `*` (`aria-hidden`) when required, as in `TextField`.

### List items (canvas 03, 04)

| State | Trigger | Fill | Text | Indicator | Other |
| --- | --- | --- | --- | --- | --- |
| Default | none | white | black, 400 | empty 16 px slot | `cursor: pointer`, whole row |
| Highlighted | `[data-highlighted]` | gray-100 | unchanged | unchanged | 2 px black inset ring (`outline-offset: -2px`). Same for pointer and keyboard: Radix moves focus with the pointer, so only one item is ever active. |
| Selected | `[data-state="checked"]` | white | black, 500 | black check, 16 px, stroke 2 (`Select.ItemIndicator`) | |
| Selected + highlighted | both | gray-100 | black, 500 | check | ring. This is the state right after opening. |
| Disabled | `[data-disabled]` | white | gray-500 | empty | emoji monochrome; `cursor: not-allowed`; never highlighted; skipped by arrows and typeahead |
| Group label | `Select.Label` | white | mono label, gray-600 | — | not interactive |
| Separator | `Select.Separator` | 1 px gray-200 line | — | — | decorative |
| Scroll button | `Select.ScrollUpButton` / `ScrollDownButton` | white | — | chevron black | scrolls on hover / press; mounted only when needed |

### Search variant (canvas 05)

| State | Search row | List | Live region |
| --- | --- | --- | --- |
| Open, empty query | focus in field, bottom divider black, placeholder gray-500 | grouped as without search; the selected option (or the first enabled one) is active | silent |
| Filtered | query in black | flat: group labels and separator hidden, matches in group order (top choices first); first enabled match active | polite: "4 results" (after a 300 ms pause in typing) |
| No results | query in black | listbox empty; a muted row "No results for “query”" (gray-600) outside the listbox | polite: "No results" |
| Option states | | same as the table above; "highlighted" is the `aria-activedescendant` option, marked with `data-highlighted` | |

- Matching: case-insensitive, accent-insensitive substring match on `label` and `keywords` (`normalize('NFD')`, strip `\p{M}`, `toLocaleLowerCase()`). The emoji is not matched. Disabled matches are listed but never active.
- While filtering, the list keeps its top edge and shrinks to fit the matches. It never flips sides mid-query.
- The query is cleared each time the list closes.

### Native on touch (canvas 06)

The closed `<select>` copies the trigger's look and state rules: `appearance: none`, the same border, fill, padding (right 36 px for the chevron), focus ring, invalid and disabled styles. The chevron is an `Icon` over the select with `pointer-events: none`. The placeholder colour uses `select:has(option[value=""]:checked)`. The open list is the OS picker and is not styled.

- All visual state comes from Radix attributes and pseudo-classes: `[data-state]`, `[data-placeholder]`, `[data-highlighted]`, `[data-disabled]`, `[aria-invalid="true"]`, `:hover`, `:focus-visible`. The search variant sets `data-state`, `data-placeholder` and `data-highlighted` on the same elements from its own value, open and active-option state, so one stylesheet serves both. Visuals never need extra JS state.
- Motion: the chevron rotates and borders change colour with `--ds-motion`. The list appears without animation. Nothing moves under `prefers-reduced-motion: reduce`.

## Keyboard

Focus order: the Field label, hint and error are not focusable. The trigger is one tab stop in DOM order. While the list is open, focus is in the portal (on an item, or in the search field). On close, focus returns to the trigger, whose `:focus-visible` ring then shows.

Default (Radix `Select`; focus moves onto items):

| Key | Closed (trigger focused) | Open |
| --- | --- | --- |
| Tab / Shift + Tab | moves focus in / out | no action (Radix prevents it) |
| Enter, Space, Arrow Down, Arrow Up | opens; highlights the selected item, or the first enabled item | Enter / Space: select the highlighted item, close, focus the trigger |
| Arrow Down / Arrow Up | (opens, as above) | next / previous enabled item; stops at the ends (no wrap); scrolls it into view |
| Home / End | — | first / last enabled item |
| Printable characters | typeahead: selects the next option whose label starts with the typed text, **without opening** | typeahead: highlights the next match |
| Esc | bubbles (a parent Dialog may close) | closes without changing the value, focus to trigger; stops propagation, so one Esc closes one layer |
| Pointer down outside | — | closes without changing the value |

- Typeahead uses `textValue={option.label}`, so the emoji in `ItemText` is ignored.
- Disabled items are skipped by arrows, Home / End and typeahead. A disabled Select is skipped by Tab.

Search variant (`searchable`; Radix `Popover`, focus stays in the search field):

| Key | Closed (trigger focused) | Open (search field focused) |
| --- | --- | --- |
| Tab / Shift + Tab | moves focus in / out | no action: the modal popover traps focus, and the field is its only tab stop (parity with Radix `Select`) |
| Enter, Space, Arrow Down, Arrow Up | opens; focuses the field; the selected option, or the first enabled option, is active | — |
| Printable characters | opens and starts the query with that character | edit the query (Space types a space); the list filters, and the first enabled match becomes active |
| Arrow Down / Arrow Up | (opens, as above) | next / previous enabled match via `aria-activedescendant`; no wrap; scrolled into view (`block: 'nearest'`) |
| Home / End, Arrow Left / Right | — | move the caret (native text editing) |
| Enter | (opens) | selects the active option, closes, focus to trigger; with no results, no action. Always `preventDefault()`, so it never submits the form. |
| Esc | bubbles | closes without changing the value, clears the query, focus to trigger; stops propagation |
| Pointer | — | hover makes an option active; click selects; pointer down outside closes |

Native `<select>`: all keys are the browser's and OS picker's own. No custom handlers.

## Radix

- **Default: `Select` from `radix-ui`** (`import { Select } from 'radix-ui'`).
  - `Select.Root` (`value`, `defaultValue`, `onValueChange`, `open`, `defaultOpen`, `onOpenChange`, `name`, `required`, `disabled`, `dir`). Radix renders a hidden native select for form submission.
  - `Select.Trigger`: the styled `button` with `role="combobox"`, `aria-expanded`, `aria-controls`, `data-state` and `data-placeholder`. It gets the Field `id`, `aria-invalid` and `aria-describedby`.
  - `Select.Value placeholder={placeholder}`: Radix copies the selected `ItemText` into it, so the emoji inside `ItemText` shows in the trigger automatically.
  - `Select.Icon asChild` around the chevron `Icon`.
  - `Select.Portal` → `Select.Content position="popper" side="bottom" align="start" sideOffset={4} collisionPadding={8}`. Popper mode, not item-aligned: the list always opens below or above the trigger, matching the search variant.
  - `Select.ScrollUpButton`, `Select.Viewport`, `Select.ScrollDownButton`. The Viewport hides the native scrollbar, so the scroll buttons are kept.
  - `Select.Group` + `Select.Label` per group (only with `topValues`); `Select.Separator` between them.
  - `Select.Item value textValue={label} disabled` → `Select.ItemText` (the emoji `span aria-hidden` and the label) + `Select.ItemIndicator` (check `Icon`).
- **Search variant: `Popover` from `radix-ui` plus an ARIA combobox and listbox** (`import { Popover } from 'radix-ui'`). Radix has no Combobox, and `Select` cannot hold a text input (its typeahead and focus management take over the keys).
  - `Popover.Root modal` (focus trap, outside content `aria-hidden`, scroll lock; parity with `Select`), `Popover.Trigger asChild` around the same styled `button`, `Popover.Portal`, `Popover.Content side="bottom" align="start" sideOffset={4} collisionPadding={8} avoidCollisions={false while a query is typed}`, with `onOpenAutoFocus` moving focus to the search input.
  - Inside: `<input type="text" role="combobox" aria-expanded="true" aria-controls={listId} aria-autocomplete="list" aria-activedescendant={activeId}>`, labelled by `aria-label={searchPlaceholder}`. Below it, `<div role="listbox" id={listId} aria-labelledby={fieldLabelId}>` with `role="group"` + `aria-labelledby` per group, and `<div role="option" id aria-selected aria-disabled data-highlighted>` per option.
  - Hand-rolled here, because Radix offers nothing for it: the filtering, the active-option index, Arrow and Enter handling on the input, and the live region. Radix keeps focus trap, Esc and outside dismissal, portal, positioning and focus return.
  - Form: renders `<input type="hidden" name value>` when `name` is set; `required` is passed as `aria-required` on the trigger, and the Field shows the error.
- **Native on touch**: no Radix. A plain `<select>` is rendered from the same props:
  - **Detection rule:** `native="auto"` (default) renders native when `window.matchMedia('(hover: none) and (pointer: coarse)').matches`, that is, the primary input is touch with no hover (phones, tablets without a trackpad). Touch laptops report a fine primary pointer and keep the custom list. The value is read with `useSyncExternalStore` and its `change` event, so it updates live.
  - **Override:** `native={true}` always renders native, `native={false}` never does.
  - **SSR:** the server snapshot is `false`, so the server and the first client render output the custom trigger, and the swap to native happens after hydration. Both look identical when closed, so there is no visible jump. With `native={true}`, the server renders the `<select>` directly.
  - **Same props:** `value` / `defaultValue` → the select's `value` / `defaultValue`. `onValueChange(e.target.value)` fires on `change`. `name`, `required` and `disabled` pass through. The Field `id` / `aria-*` go on the `<select>`, which the Field `label htmlFor` names natively. Option `disabled` → `<option disabled>`.
  - **Placeholder:** a first `<option value="" disabled hidden>{placeholder}</option>`, selected while there is no value.
  - **Top choices:** with `topValues`, `<optgroup label={topLabel}>` then `<optgroup label={restLabel}>`, same membership and order as the custom list. Without it, flat `<option>`s.
  - **Emoji:** in the option text, `${emoji} ${label}` (a normal space), since `<option>` cannot contain markup.
  - **No search:** `searchable` is ignored, and so are `open` / `defaultOpen` / `onOpenChange`.
- The wrappers expose the narrow API above. No raw Radix parts are re-exported.

## Tokens

| Property | Token |
| --- | --- |
| Trigger height, item min height, search row height | `--ds-control-height` |
| Trigger and item horizontal padding, search row padding | `--ds-space-3` |
| Gap between emoji / text / chevron / check / search icon | `--ds-space-2` |
| Item vertical padding | computed: (`--ds-control-height` − `--ds-line-height-lg`) / 2 = 9 px |
| Emoji slot width | `--ds-space-6` |
| Chevron, check, search icon, scroll button icon size | `--ds-space-4` |
| Scroll button height | `--ds-space-6` |
| Trigger border, default | `--ds-border-width` solid `--ds-color-border` |
| Trigger border, hover / focus / open | `--ds-color-ink` |
| Trigger border, invalid | `--ds-border-width-strong` solid `--ds-color-error` |
| Trigger fill | `--ds-color-surface` |
| Trigger value text, item text, search query | `--ds-font-text`, 16 px / `--ds-line-height-lg`, `--ds-color-ink` |
| Placeholder (trigger and search) | `--ds-color-placeholder` |
| Chevron | `--ds-color-ink`; disabled `--ds-color-disabled` |
| Disabled trigger | border `--ds-color-divider`, fill `--ds-color-surface-subtle`, text `--ds-color-placeholder` |
| Disabled emoji (trigger and item) | `filter: var(--ds-photo-filter)` |
| Focus ring (trigger, native select) | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Panel border | `--ds-border-width` solid `--ds-color-ink` |
| Panel fill | `--ds-color-surface` |
| Panel radius / shadow | `--ds-radius-md` / none |
| Panel gap to trigger (`sideOffset`) | `--ds-space-1` (passed as the number 4) |
| Viewport collision padding | `--ds-space-2` (passed as the number 8) |
| Viewport vertical padding, separator margin | `--ds-space-1` |
| List max height | `min(calc(7.5 * var(--ds-control-height)), var(--radix-select-content-available-height))` |
| Item highlighted | fill `--ds-color-fill`; outline `--ds-focus-width` solid `--ds-color-ink`, offset `calc(-1 * var(--ds-focus-width))` |
| Item selected | weight 500; check `--ds-color-ink`, stroke 2 |
| Item disabled | text `--ds-color-placeholder` |
| Group label | `--ds-font-mono` 500, 12 px / `--ds-line-height-xs`, uppercase, +8 % tracking, `--ds-color-text-muted`; padding `--ds-space-3` top and sides, `--ds-space-1` bottom |
| Separator | 1 px `--ds-color-divider` |
| Scroll button divider, search row divider | `--ds-border-width` solid `--ds-color-divider`; search row with focus `--ds-color-ink` |
| Search icon | `--ds-color-text-muted` |
| No results text | 16 px / `--ds-line-height-lg`, `--ds-color-text-muted` |
| Native select right padding (chevron room) | `calc(var(--ds-space-3) + var(--ds-space-4) + var(--ds-space-2))` = 36 px |
| Field label, hint, error | as `Field` / `TextField` (unchanged) |
| Transitions (border, chevron rotation, item fill) | `--ds-motion`; none under `prefers-reduced-motion` |
| Panel z-index | component-local `z-index: 60`, above Dialog's overlay (50) and panel (51); see Token requests |

## Accessibility

- **Default (Radix `Select`):** the trigger is a `button` with `role="combobox"`, `aria-expanded` and `aria-controls` (Radix). It is named by the Field label through `label htmlFor` = trigger `id` (or by `aria-label` / `aria-labelledby` without Field). Its value is the selected label. Content is `role="listbox"`, items are `role="option"` with `aria-selected`, and groups are `role="group"` named by their `Select.Label`. The separator is hidden from assistive tech.
- **Search variant:** the trigger is a `button` with `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls` (Radix `Popover`). A plain button's name comes from its label and would drop the value, so it gets `aria-labelledby="{fieldLabelId} {valueId}"` and is read as "Ship to, Germany". The popover is `role="dialog"` named by the Field label. The input is `role="combobox"` with `aria-autocomplete="list"`, `aria-controls` and `aria-activedescendant`. The listbox and options are as above. A visually hidden `role="status"` (`aria-live="polite"`) announces "N results" / "No results". The no-results message sits outside the listbox.
- **Native:** the `<select>` is named by `label htmlFor`. Optgroups are announced by the platform.
- **Description and state:** `aria-describedby` = hint id, then error id (from Field). `aria-invalid="true"` when `error` / `invalid`, and `aria-required="true"` when `required`. The error text starts with a visually hidden "Error: " and has an icon (Field).
- **Emoji:** decorative. In the custom list and the trigger it is in a `span aria-hidden="true"`, so the accessible name is only `label` (no "flag: Germany, Germany"). Typeahead and search also ignore it. In the native `<option>` it cannot be hidden, so some screen readers read the flag name first. This is accepted, and the docs should recommend flags only where the label already names the country. Windows does not draw flag emoji (it shows letters such as "DE"); the label carries the meaning either way.
- **Not colour alone:** selected = check shape + weight; highlighted = 2 px black ring + fill; invalid = 2 px border + icon + text; disabled = gray text + `not-allowed` + `aria-disabled`.
- **Contrast:**
  - Value and item text black on white 21:1, on the gray-100 highlight 18.1:1. Placeholder gray-500 on white 4.5:1. Group label gray-600 on white 7:1. Disabled text gray-500 4.5:1, though disabled controls are exempt.
  - Highlight ring and focus ring black 21:1. The gray-100 fill alone (1.1:1) is never the only cue.
  - Panel border black 21:1, which separates the list from the page without a shadow. The chevron is black 21:1, so the trigger is identifiable even though the gray-300 border (shared with Input) is below 3:1.
  - Error border on white 7:1.
- **Target size:** the trigger and items are 44 px tall, with the full row clickable. Scroll buttons are 24 px tall and full width (WCAG 2.5.8).
- **Motion:** colour transitions and the chevron rotation only, removed under `prefers-reduced-motion`.
- **`jest-axe` (run on `document.body`, since content is portalled)** should find no violations for:
  - closed with placeholder; closed preselected with emoji; open list; open with `topValues` groups; a disabled option;
  - disabled Select; invalid with error; required; `SelectField` with hint;
  - searchable open, filtered, and no results;
  - native mode (`native`) with optgroups.
- **`userEvent` tests should check:**
  - Enter / Space / Arrow Down open on the selected item; arrows move and skip disabled items; Home / End; Enter selects and returns focus to the trigger; Esc closes without change and does not close a parent Dialog.
  - Typeahead on the closed and open trigger ignores the emoji.
  - `defaultValue` preselects; controlled `value` + `onValueChange`; `value=''` shows the placeholder.
  - The `topValues` order, and that no option is duplicated.
  - Searchable: typing filters (case and accent), Arrow / Enter select via `aria-activedescendant`, no results makes Enter a no-op, the live region text, and the query is cleared on reopen.
  - Field wiring: the trigger is named by the label and described by the hint and error.
  - The hidden input / native select submits `name` / `value`.
  - Native: chosen when `matchMedia` matches (stubbed), `native={true}` / `false` overrides, `onValueChange` fires on `change`, optgroup labels and emoji in the option text, no search field.
- **`jest.setup.ts` stubs** the builder will likely need: `Element.prototype.hasPointerCapture` / `releasePointerCapture` / `scrollIntoView` (Radix `Select`), `ResizeObserver` (Popper), and `window.matchMedia` (jsdom has none; default to not matching).

## Token requests

None required. The design uses only existing tokens, plus two component-local constants in `Select.css`:

- `z-index: 60` for the list panel. Optional request, for the reviewer: a shared layer scale such as `--ds-z-dialog: 50` and `--ds-z-popover: 60` would let Dialog, Select and future Popover / Tooltip / Menu agree on stacking without magic numbers. If declined, Select keeps the local 60, which is above Dialog's 50 / 51.
- `7.5` rows as the max-height multiplier. This is a layout rule, not a token.

For the review decision only: canvas 04 shows monochrome emoji ("Alternative · not proposed"), which would reuse `--ds-photo-filter` and needs no new token. It is not proposed because emoji are content, grayscale flags are hard to recognise, and the native picker cannot be filtered, so the two renderers would differ.
