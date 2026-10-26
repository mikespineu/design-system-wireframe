# Tabs

- task: DS-21
- canvas: docs/design-system-wireframe/Tabs.dc.html
- canvas_url: https://claude.ai/artifact/RnXFvckipEqi6fCiVh2rS5
- approved: no
- approved_by:
- approved_at:
- approval_hash:

Tabs is a mechanism, not a new visual style. It switches which panel is shown below a tab list, using Radix `Tabs` semantics (`tablist` / `tab` / `tabpanel`, `aria-controls`, roving focus). The tab list wears one of the two existing switcher looks (canvas 01–05):

- `variant="segmented"` (default) is the `SegmentedControl` look: a gray-100 strip, text triggers, and the sliding white indicator with a 1 px black border.
- `variant="tile"` is the `TileGroup` look: icon + label tiles, with the active tile white and a 2 px black border.

There is no underline or ink-bar treatment. The roadmap's "active underline/ink treatment" is replaced by the switchers' selected look, per the reviewer's direction.

### Why Tabs is its own component

| | `SegmentedControl` / `TileGroup` | `Tabs` |
| --- | --- | --- |
| Job | Set a value (form field) | Choose which content is visible |
| Radix | `RadioGroup` | `Tabs` |
| Roles | `radiogroup` / `radio` | `tablist` / `tab` / `tabpanel` |
| Controls content | no | yes, `aria-controls` → panel, panel `aria-labelledby` → tab |
| Form | `name`, `required`, hidden inputs | none |
| Visible field label, hint, help | yes | no (the list is named by `aria-label` / `aria-labelledby`) |
| Arrow keys | move + select, both axes | move (+ activate in automatic mode), Left/Right only |
| Home / End | focus only | focus, and activate in automatic mode |

Rule of thumb: if the choice is saved or submitted, use `SegmentedControl` / `TileGroup`. If it only changes what is on screen below, use `Tabs`. Wrapping `RadioGroup` (or `ChoiceGroup`) for tabs would expose the wrong roles, drop `aria-controls` and the panel relationship, and add form inputs, so Tabs must not do that.

### Sharing the look without sharing the semantics (recommendation for DS-22)

Share the styling layer and the scroll/indicator behaviour. Do not share the primitive.

1. **CSS: reuse the existing classes.** `Tabs.List` renders with `className="ds-choice-control"` and the same data attributes the switchers use: `data-variant="segmented" | "tile"`, `data-size`, `data-full-width`, `data-overflow`, `data-indicator-ready`. Each `Tabs.Trigger` gets `className="ds-choice-item"`. Tile triggers render the existing `.ds-tile-icon` / `.ds-tile-label` spans. In `ChoiceGroup.css`, `SegmentedControl.css` and `TileGroup.css`, widen every state selector so it matches both primitives:
   - `[data-state='checked']` → `:is([data-state='checked'], [data-state='active'])`
   - `[data-state='unchecked']` → `:is([data-state='unchecked'], [data-state='inactive'])`
   - `[data-disabled]` is already the same in both.

   `Tabs.tsx` imports those three stylesheets plus its own `Tabs.css`, which holds only the root stack, the list-to-panel gap and the panel focus ring. The look has one source, so a change to SegmentedControl or TileGroup reaches Tabs automatically. The SegmentedControl and TileGroup tests must stay green after the selector change.
2. **JS: extract the strip behaviour into an internal hook.** Move the overflow measurement (`data-overflow`), `scrollItemIntoView`, the sliding-indicator placement, the `ResizeObserver` / `document.fonts.ready` settle and the focus-scroll handler out of `ChoiceGroup.tsx` into `src/components/ChoiceGroup/useChoiceStrip.ts`. The hook is not exported from `src/index.ts`. It takes the selector of the selected item (`'[role="radio"][data-state="checked"]'` or `'[role="tab"][data-state="active"]'`) and the item role to observe. `ChoiceGroup` and `Tabs` both call it. Tabs never renders `ChoiceGroup` or `RadioGroup`.
3. **Rejected:** copying the CSS into `Tabs.css` (it would drift), wrapping `ChoiceGroup` (wrong semantics), and a new underline style (rejected by the reviewer).

### Proposed API

Items are data, the same pattern as `options` in `SegmentedControl` / `TileGroup`:

- The wrapper owns the trigger markup, so the look can't be broken.
- Every trigger has a panel by construction, so `aria-controls` never dangles on purpose.
- `V` types `value` / `onValueChange` as a union.

Compound parts (`<Tabs.List>`, `<Tabs.Panel>`) would allow a list placed far from its panels, but they widen the API and let consumers build triggers without panels. Revisit only if a real layout needs it (see Notes).

```ts
interface TabItemBase<V extends string> {
  value: V;
  label: string;                 // visible text and the tab's accessible name
  disabled?: boolean;
  panel: ReactNode;              // content of this tab's tabpanel
}
interface SegmentedTabItem<V extends string> extends TabItemBase<V> { icon?: never }
interface TileTabItem<V extends string> extends TabItemBase<V> {
  icon: ReactNode;               // decorative, rendered aria-hidden; 24 px md / 16 px sm
}

type TabsLabelling =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-labelledby': string; 'aria-label'?: never };  // e.g. the id of the section heading

type TabsVariantProps<V extends string> =
  | { variant?: 'segmented'; items: readonly SegmentedTabItem<V>[]; fullWidth?: boolean }
  | { variant: 'tile'; items: readonly TileTabItem<V>[]; fullWidth?: never };

type TabsProps<V extends string = string> = TabsLabelling &
  TabsVariantProps<V> & {
    value?: V;                                // controlled
    defaultValue?: V;                         // uncontrolled; default = first enabled item
    onValueChange?: (value: V) => void;       // only ever a real item value, never ''
    activationMode?: 'automatic' | 'manual';  // default 'automatic' (Radix)
    size?: 'sm' | 'md';                       // default 'md'
    keepMounted?: boolean;                    // default false; true = forceMount every panel
    dir?: 'ltr' | 'rtl';
    id?: string; className?: string;
  };
```

- `ref` and rest props go to `Tabs.Root` (the outer `div`). `aria-label` / `aria-labelledby` go to `Tabs.List`, not to the root, because the list is the element with a role.
- `orientation` is not exposed. It is fixed to `'horizontal'` (see Keyboard).
- Radix `Tabs` falls back to `''` (nothing active) when there is no value. The wrapper passes the first enabled item as `defaultValue` so a tab is always active. A controlled `value` that matches no item, or matches a disabled item, logs a dev-mode `console.error`.
- `fullWidth` is segmented only. The type forbids it for tiles, as `TileGroup` does.
- Recommended counts: segmented 2–7 tabs with one- or two-word labels. Tiles have no hard limit because the row scrolls, but more than about 7 should use manual activation.

## Sizes

Triggers are the switcher sizes, unchanged. The only new measurement is the list-to-panel gap (canvas 02, 03).

Segmented (= SegmentedControl, canvas 03):

| Size | Strip height | Strip padding | Trigger height | Trigger padding-x | Text | List to panel gap |
| --- | --- | --- | --- | --- | --- | --- |
| `sm` | 32 | 4 | 24 | 12 | caption 13/20, weight 500 | 16 |
| `md` (default) | 44 (= control height) | 4 | 36 | 16 | body 16/26, weight 500 | 24 |

Tile (= TileGroup, canvas 03):

| Size | Tile min width × height | Padding-x | Icon | Icon to label | Tile gap | Text | List to panel gap |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `sm` | 72 × 64 | 8 | 16 | 4 | 8 | caption 13/20, weight 500 | 16 |
| `md` (default) | 96 × 88 | 12 | 24 | 8 | 8 | caption 13/20, weight 500 | 24 |

Layout:

- The root (`.ds-tabs`) is `display: flex; flex-direction: column` with `gap` = the list-to-panel gap. The list hugs its triggers and sits at the inline start (`align-self: flex-start`, already in `SegmentedControl.css`). Only `fullWidth` stretches it.
- The tile row keeps TileGroup's 4 px scroller padding and −4 px margin (focus-ring clearance), so the gap is measured from the tile's outer edge.
- The panel (`.ds-tabs-panel`) has no border, fill or padding. It is the consumer's content area, full width of the root, and its height follows its content. The list never moves when panels differ in height.
- No content transition: panels swap instantly. Only the segmented indicator moves.

Overflow (canvas 08) is the ChoiceGroup behaviour, unchanged. It comes from the shared CSS and `useChoiceStrip`:

- The list is the scroll container (`overflow-x: auto`). It never wraps and has no scroll-snap. `scroll-padding-inline` is 24 px.
- A 24 px `mask-image` edge fade shows only on the side with hidden triggers (`[data-overflow="start" | "end" | "both"]`). The thin native scrollbar stays.
- The active trigger is scrolled into view on mount and on value change. Any trigger that receives focus is also scrolled into view. This matters in manual mode, where focus and activation differ.
- The fade and scroll apply to the list only, never to the panel.
- `fullWidth` never scrolls.

## States

All visuals come from Radix attributes and pseudo-classes: `[data-state="active" | "inactive"]`, `[data-disabled]`, `:hover`, `:focus-visible`. The one exception is the shared `[data-overflow]`. No extra JS state is added beyond what `useChoiceStrip` already sets (`data-overflow`, `data-indicator-ready`).

Segmented trigger (canvas 04, at md):

| State | Trigger | Border | Fill | Text | Other |
| --- | --- | --- | --- | --- | --- |
| Default (inactive) | `[data-state="inactive"]` | 1 px transparent | none (strip gray-100 shows) | gray-700, 500 | `cursor: pointer` |
| Hover, inactive | `:hover` on inactive, not disabled | 1 px transparent | gray-200 | black | transition `--ds-motion` |
| Active | `[data-state="active"]` | 1 px black (on the indicator) | white (on the indicator) | black | The indicator slides (`transform`, `width`, `--ds-motion`). Before it is measured, the trigger itself carries the white fill and black border. |
| Hover, active | `:hover` on active | unchanged | unchanged | unchanged | no change |
| Pressed | `:active` | n/a | n/a | n/a | No pressed style. Radix activates on pointer down, so the trigger is already active. |
| Focus-visible, active | `:focus-visible` | unchanged | unchanged | unchanged | 2 px black outline, 2 px offset, `z-index: 1`. Fits inside the 4 px strip padding. |
| Focus-visible, inactive | `:focus-visible` on inactive | unchanged | unchanged | unchanged | Same ring. Only reachable in manual mode, after arrows, Home or End. |
| Disabled | `[data-disabled]` (native `disabled`) | 1 px transparent | none | gray-500 | `cursor: not-allowed`, no hover, never focusable, skipped by arrows, Home and End |
| Active + disabled | n/a | | | | Not allowed; see API |
| Disabled list | n/a | | | | Not supported. Radix `Tabs` has no group disabled. |

Tile trigger (canvas 05, at md):

| State | Trigger | Border | Fill | Icon + label | Other |
| --- | --- | --- | --- | --- | --- |
| Default (inactive) | `[data-state="inactive"]` | 2 px transparent | gray-100 | gray-700 | `cursor: pointer` |
| Hover, inactive | `:hover` | 2 px transparent | gray-200 | black | transition `--ds-motion` |
| Active | `[data-state="active"]` | 2 px black | white | black | Cross-fades `background-color`, `border-color`, `color` with `--ds-motion`. No slide. |
| Hover, active | `:hover` | unchanged | unchanged | unchanged | |
| Focus-visible, active | `:focus-visible` | unchanged | unchanged | unchanged | 2 px black outline, 2 px offset, drawn in the 8 px gap or the 4 px scroller padding |
| Focus-visible, inactive | `:focus-visible` | unchanged | unchanged | unchanged | Same ring. Manual mode only. |
| Disabled | `[data-disabled]` | 2 px transparent | gray-50 | icon gray-400, label gray-500 | `cursor: not-allowed`, no hover, never focusable |

Panel (canvas 06):

| State | Trigger | Visual |
| --- | --- | --- |
| Active | `[data-state="active"]` | Rendered, no border, fill or padding |
| Inactive | `[data-state="inactive"]` | Unmounted (default) or present with `hidden` (`keepMounted`). Never visible. |
| Focus-visible | `:focus-visible` | 2 px black outline, 2 px offset, outside the panel box. Shown on keyboard focus only; a pointer click shows no ring. |

## Keyboard

Radix `Tabs` with `orientation="horizontal"` and `loop` (default true). The tab list uses a roving tabindex.

| Key | Action |
| --- | --- |
| Tab | From before the list: lands on the **active** trigger. From a trigger: goes to the active panel (`tabindex="0"`), then to focusable content inside it. |
| Shift + Tab | From the panel: back to the list. In automatic mode this lands on the active trigger. In manual mode it lands on the trigger that last had focus (the roving tab stop). From a trigger: leaves the list backwards. |
| Arrow Right / Arrow Left | Next / previous **enabled** trigger, wrapping at the ends. Automatic: also activates it, and the panel switches. Manual: focus only. Mirrored when `dir="rtl"`. The trigger is scrolled into view. |
| Arrow Up / Arrow Down | No action. The list is horizontal, so the keys keep their default page scroll. |
| Home / End | First / last enabled trigger. Automatic: also activates it, because Radix activates on focus. Manual: focus only. Scrolled into view. This differs from SegmentedControl, where Home/End never select. |
| Enter / Space | Activate the focused trigger. Only meaningful in manual mode. Never submits a form, because triggers are `type="button"`. |
| Pointer | Primary-button press (pointer down) activates and focuses. Ctrl-click and secondary buttons do nothing (Radix). |

- **Focus order:** the tab list (one stop) → the active panel → content inside the panel → onward. Disabled triggers are never focused. Inactive panels are not in the order, whether unmounted or `hidden`.
- **Activation mode:**
  - `automatic` is the default. Panels in this system are local content that renders instantly, and WAI-ARIA recommends automatic activation in that case: one key press both moves and shows.
  - Use `manual` when showing a panel is slow or has side effects: a network fetch, a heavy chart or table render, a route or URL change that loads data, or analytics per view.
  - Also use `manual` on long tile rows, where arrowing across would mount every panel on the way.
  - To keep local panel state (such as half-filled inputs) across switches, use `keepMounted`. That is not a reason for `manual`.
- **Orientation:** only horizontal is in scope. Neither switcher look has a vertical form, so vertical tabs (Up/Down keys, a side list) need their own design task.

## Radix

- `Tabs` from `radix-ui` (`import { Tabs } from 'radix-ui'`). Each part:
  - `Tabs.Root` → the `.ds-tabs` stack. Receives `value`, `defaultValue` (the wrapper's fallback), `onValueChange` (guarded against `''`), `activationMode`, `dir`, and `orientation="horizontal"`.
  - `Tabs.List` → the strip or tile row, `role="tablist"`, `aria-orientation="horizontal"`, `loop`. It gets the `ds-choice-control` class, the shared data attributes and `aria-label` / `aria-labelledby`. For the segmented variant it holds the `aria-hidden` indicator `span`, as ChoiceGroup does.
  - `Tabs.Trigger` → one per item: a `button` with `role="tab"`, `aria-selected`, `aria-controls`, `data-state`, `data-disabled` and native `disabled`. Class `ds-choice-item`.
  - `Tabs.Content` → one per item: `role="tabpanel"`, `aria-labelledby` the trigger, `tabIndex={0}`, class `ds-tabs-panel`. `forceMount` is set on every panel when `keepMounted` is true.
- **Not `RadioGroup` or `ToggleGroup`.** They have the wrong roles, no panel relationship, and form inputs Tabs doesn't need. Tabs shares only CSS and the internal `useChoiceStrip` hook with the switchers (see "Sharing the look" above).
- Radix behaviour the wrapper relies on (verified in `@radix-ui/react-tabs`):
  - activation on `mousedown`
  - activation on focus unless `activationMode="manual"`
  - Enter/Space activate
  - disabled triggers are not focusable (`RovingFocusGroup.Item focusable={!disabled}`)
  - entering the list focuses the active item
  - inactive content is unmounted via `Presence` unless `forceMount`
- The switchers' test stubs for `ResizeObserver` and `scrollTo` (`test/dom-stubs.ts`) cover Tabs too. Tabs needs no new browser-API stubs.

## Tokens

The trigger tokens are those of the reused looks. They are listed in full so DS-22 can check every state.

Segmented list and trigger:

| Property | Token |
| --- | --- |
| Strip height md / sm | `--ds-control-height` / `--ds-space-8` |
| Strip padding | `--ds-space-1` |
| Trigger height | strip height − 2 × `--ds-space-1` (36 / 24, computed) |
| Trigger padding-x md / sm | `--ds-space-4` / `--ds-space-3` |
| Strip fill | `--ds-color-fill` |
| Trigger border width | `--ds-border-width` |
| Inactive text | `--ds-color-text` |
| Hover fill, inactive | `--ds-color-divider` (gray-200, as in `SegmentedControl.css`) |
| Hover text | `--ds-color-ink` |
| Active border (indicator) | `--ds-color-ink` |
| Active fill (indicator) | `--ds-color-surface` |
| Active text | `--ds-color-ink` |
| Disabled text | `--ds-color-placeholder` |
| Text md / sm | `--ds-font-text` 500; 16 px / `--ds-line-height-lg` (26), 13 px / `--ds-line-height-sm` (20) |
| Indicator slide, text cross-fade | `--ds-motion` |

Tile list and trigger:

| Property | Token |
| --- | --- |
| Tile min height md / sm | `--ds-space-16` + `--ds-space-6` (88) / `--ds-space-16` (64) |
| Tile min width md / sm | `--ds-space-24` (96) / `--ds-space-16` + `--ds-space-2` (72) |
| Tile padding-x md / sm | `--ds-space-3` / `--ds-space-2` |
| Icon md / sm | `--ds-space-6` / `--ds-space-4`, `currentColor` |
| Icon to label md / sm | `--ds-space-2` / `--ds-space-1` |
| Tile gap | `--ds-space-2` |
| Tile border width | `--ds-border-width-strong` |
| Inactive fill | `--ds-color-fill` |
| Inactive icon + label | `--ds-color-text` |
| Hover fill | `--ds-color-divider` (gray-200) |
| Hover icon + label | `--ds-color-ink` |
| Active fill / border / icon + label | `--ds-color-surface` / `--ds-color-ink` / `--ds-color-ink` |
| Disabled fill | `--ds-color-surface-subtle` |
| Disabled icon / label | `--ds-color-disabled` / `--ds-color-placeholder` |
| Label | `--ds-font-text` 500, 13 px / `--ds-line-height-sm` |
| Active cross-fade | `--ds-motion` |

Shared (list, overflow, focus, panel):

| Property | Token |
| --- | --- |
| List to panel gap md / sm | `--ds-space-6` / `--ds-space-4` |
| Tile row focus clearance | `--ds-space-1` padding and negative margin |
| Edge fade length, `scroll-padding-inline` | `--ds-space-6` |
| Scrollbar thumb | `--ds-color-border` |
| Trigger focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Panel focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Panel border, fill, padding | none (no token) |
| Corner radius | `--ds-radius-md` |
| Transitions | `--ds-motion` (`background-color`, `border-color`, `color`, indicator `transform` / `width`); none under `prefers-reduced-motion` |

The font sizes (16 px, 13 px) stay literal, as in the existing switcher CSS, because `tokens.css` has no font-size tokens.

## Accessibility

- **Roles (Radix):**
  - `tablist` with `aria-orientation="horizontal"`, named by the required `aria-label` or `aria-labelledby`. The type enforces exactly one.
  - Each trigger is a `tab` with `aria-selected` and `aria-controls`, named by its visible `label`.
  - Each panel is a `tabpanel` with `aria-labelledby` its tab and `tabindex="0"`.
- **Decorative parts:** tile icons and the sliding indicator are `aria-hidden`. The list is not an extra tab stop (its triggers are focusable), so there is no `tabindex` on the scroller and no axe `scrollable-region-focusable` issue.
- **Panel content:** start each panel with a heading or text so the focused panel is announced meaningfully. The tab's name already labels the panel, so a heading that repeats it is optional.
- **Not by color alone:** the active tab differs by a black border (segmented 1 px, tile 2 px) and a white fill, not only by hue or text color.
- **Contrast:** the same values as the switchers (`docs/specs/Toggle.md`).
  - Active border, black on gray-100: 18.1:1, which passes 1.4.11 by the border.
  - Inactive text, gray-700 on gray-100: 8.9:1. On gray-200 hover: 7.8:1.
  - Active text, black on white: 21:1.
  - Focus ring: 21:1 on white, 18.1:1 on the gray-100 strip padding.
  - Disabled triggers are exempt. Gray-500 on gray-100 is about 3.9:1.
- **Target size:**
  - md: segmented trigger 36 px tall in a 44 px strip, tile 88 px.
  - sm: segmented trigger 24 px, which meets the WCAG 2.5.8 minimum; tile 64 px.
  - sm is for fine pointers only. Say so in the docs.
- **Motion:** the indicator slide, the color cross-fades and the smooth scroll-into-view are dropped under `prefers-reduced-motion`. Panels never animate.
- **`jest-axe`** should find no violations for:
  - segmented md and sm
  - `fullWidth`
  - tile md and sm
  - a disabled tab
  - `activationMode="manual"`
  - `keepMounted` true and false: inactive tabs' `aria-controls` point at unmounted ids when false. Confirm axe accepts this for `aria-selected="false"` tabs.
  - an overflowing list (8 tabs in a narrow container)
  - `aria-labelledby` pointing at a heading
  - Confirm `aria-required-children` passes with the `aria-hidden` indicator `span` inside the `tablist`. If it fails, move the indicator out of the list element.
- **`userEvent`** tests should check:
  - Tab lands on the active trigger. The next Tab focuses the active panel.
  - Automatic: Arrow Right activates the next tab and shows its panel. It skips disabled tabs and wraps. Home and End activate the first and last enabled tab.
  - Manual: arrows and Home/End move focus without changing `value`. Enter and Space then activate.
  - RTL: Arrow Left moves forward.
  - Arrow Up and Down do nothing.
  - With no `defaultValue`, the first enabled tab is active. A disabled first tab is skipped.
  - `onValueChange` is never called with `''`. Clicking the active tab does not fire it again.
  - A disabled tab can't be clicked or focused.
  - `keepMounted` keeps an input's typed value across switches. Without it, the panel remounts.
  - `data-overflow` is set when the stubbed `scrollWidth` exceeds `clientWidth`. The focused trigger is scrolled into view (`scrollTo` stubbed).
  - SegmentedControl and TileGroup tests still pass after the shared-selector and hook refactor.

## Token requests

None. Every value maps to an existing `--ds-*` token.

Not requested, for the reviewer to decide: `--ds-color-fill-hover` (= gray-200) as a semantic role for "hover on a gray-100 fill". The switchers use `--ds-color-divider` for this today. Tabs inherits that choice, and with a third consumer the role may now be worth adding.

## Notes and open questions

- **Components.dc.html** still shows an underline Tabs mock under Navigation. It predates this spec and contradicts it. Should it be replaced with the segmented look or removed? This spec doesn't change that file.
- **Roadmap wording.** DS-21's task text asks for an "active underline/ink treatment". This spec replaces it with the switcher looks, per the reviewer's direction. DS-22's done_when should refer to `variant: 'segmented' | 'tile'` and the shared CSS / `useChoiceStrip` refactor of `ChoiceGroup`.
- **Variant name.** The prop value is `'tile'`, not `'tiles'`, to match the existing `data-variant="tile"` and `ChoiceGroupProps.variant`, so there is no mapping layer. Rename it if the reviewer prefers `'tiles'`.
- **Compound API later?** If a layout needs the list far from the panels (for example the list in a page header and the panels in the body), a compound API would be needed. Not in v1.
- **URL-synced tabs** work through controlled `value` / `onValueChange` with the router. Triggers stay buttons, not links; tabs that navigate between pages are a nav component, not Tabs.
