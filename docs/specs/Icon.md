# Icon

- task: DS-46
- canvas: docs/design-system-wireframe/Icon.dc.html
- canvas_url: https://claude.ai/artifact/SvP8RwEpiPbN58PeDFRctP
- approved: no
- approved_by:
- approved_at:
- approval_hash:

The icon system works on a bring-your-own model. The design system ships no public icon set. `Icon` renders any SVG icon component that meets the `IconComponent` contract, and every component that draws an icon inside itself falls back to a small private set of default glyphs. A consumer can replace a glyph for one instance (an override prop), for a subtree (`IconProvider`), or not at all (default glyph). Lucide, Tabler, Phosphor and Heroicons components meet the contract as they are. `createIcon` turns a hand-drawn SVG into one.

This document is a contract and a design. Three tasks implement it. DS-47 rebuilds `Icon` around `icon: IconComponent`, removes the public `name` / `IconName` / `icons`, changes `IconButton`'s `icon` to `IconComponent`, and moves internal usages to `useIcon`. DS-48 adds the override props listed in the role map. DS-49 adds the "Bring your own icons" docs page.

Naming convention for this spec: the spec check only allows full custom-property names that already exist in `src/styles/tokens.css`. Outside `## Token requests`, the requested icon tokens therefore appear by bare name: `icon-size-sm` is the CSS custom property with the global prefix, and its full name and value are under Token requests. Roles from the Theming spec (DS-26) that DS-27 has not shipped yet, such as `color-icon` and `color-focus`, are written the same way.

## API

### Public exports (after DS-47)

| Export | Kind | Purpose |
| --- | --- | --- |
| `Icon`, `IconProps` | component | Renders one `IconComponent` at a system size and stroke, decorative or labeled |
| `IconComponent`, `IconComponentProps` | types | The contract every icon must meet |
| `createIcon` | function | Makes an `IconComponent` from SVG children |
| `IconProvider`, `IconProviderProps` | component | Replaces default glyphs for a subtree |
| `useIcon` | hook | Resolves one role: prop > provider > default |
| `IconRole`, `IconSet` | types | The 11 role names, and `Record<IconRole, IconComponent>` |

Removed: `IconName`, `icons`, and `Icon`'s `name` prop. The default glyphs are not exported.

### Contract

```ts
import type { AriaAttributes, ComponentType, SVGProps } from 'react';

export interface IconComponentProps extends AriaAttributes {
  width?: number | string;          // always passed by the system, in px
  height?: number | string;         // always passed by the system, in px
  className?: string;
  style?: SVGProps<SVGSVGElement>['style'];
  strokeWidth?: number | string;    // always passed; stroke sets honor it, fill sets ignore it
  role?: SVGProps<SVGSVGElement>['role'];
  focusable?: SVGProps<SVGSVGElement>['focusable'];
}

export type IconComponent = ComponentType<IconComponentProps>;
```

An `IconComponent` must:

1. Render exactly one root `<svg>` and spread `width`, `height`, `className`, `style`, `strokeWidth`, `role`, `focusable` and every `aria-*` prop onto it. Props it receives must win over its own defaults (Lucide, Tabler, Phosphor and Heroicons spread rest props last).
2. Paint with `currentColor` (stroke, fill, or both). The system never passes a color.
3. Not be focusable, have no event handlers, and render no `<title>` unless it is labeled. The system decides decorative or labeled.
4. Scale to any `width` / `height` through its own `viewBox`. The grid size does not matter (24 for Lucide, Tabler and Heroicons; 256 for Phosphor).

The contract does not require ref forwarding. Icons are not interactive, and the system never needs a ref to them.

Compatibility, checked against each library's published prop types (DS-49 verifies this in a type test):

| Library | Example | Size | Stroke |
| --- | --- | --- | --- |
| Lucide (`lucide-react`) | `X` | `width` / `height` override `size` | honors `strokeWidth` |
| Tabler (`@tabler/icons-react`) | `IconX` | `width` / `height` override `size` | its prop is `stroke`; `strokeWidth` from rest props wins because rest is spread last |
| Phosphor (`@phosphor-icons/react`) | `X` | `width` / `height` | fill-based; `strokeWidth` has no effect. Pick the weight in a wrapper: `(p) => <X {...p} weight="bold" />` |
| Heroicons (`@heroicons/react/24/outline`) | `XMarkIcon` | `width` / `height` | honors `strokeWidth` (overrides its built-in 1.5) |

To keep a library's own weight instead of the system weight, wrap the icon and set the stroke after the spread: `const Close = (p: IconComponentProps) => <X {...p} strokeWidth={1.75} />`.

### `createIcon`

```ts
function createIcon(
  displayName: string,
  children: ReactNode,             // SVG children drawn on the grid
  options?: { viewBox?: string },  // default '0 0 24 24'
): IconComponent;
```

The result is a `forwardRef` component (the system does not rely on the ref, but consumers may want it). It renders:

```tsx
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox={options.viewBox ?? '0 0 24 24'}
  width={width ?? 24} height={height ?? 24}
  fill="none" stroke="currentColor" strokeWidth={strokeWidth ?? 1.5}
  strokeLinecap="butt" strokeLinejoin="miter"
  focusable="false"
  aria-hidden={hasAccessibleName ? undefined : true}   // name = aria-label or aria-labelledby
  {...rest}
>
  {children}
</svg>
```

- `displayName` is set on the component, which helps in devtools and test output.
- For filled shapes, children set `fill="currentColor" stroke="none"` themselves.
- The 11 private default glyphs are built with `createIcon`.

### `IconProvider`

```ts
type IconRole =
  | 'close' | 'check' | 'minus' | 'plus'
  | 'alert' | 'info' | 'success' | 'warning'
  | 'chevron-down' | 'chevron-left' | 'chevron-right';

type IconSet = Record<IconRole, IconComponent>;

interface IconProviderProps {
  icons: Partial<IconSet>;   // values may not be null
  children: ReactNode;
}
```

- Nested providers merge. The inner provider wins per role, and roles it leaves unset come from the outer provider.
- The merged value is memoized on the `icons` object identity. Docs tell consumers to define the map at module level or memoize it.
- A provider changes only the drawing. Size, stroke, color and ARIA still come from the component.

### `useIcon`

```ts
function useIcon(role: IconRole): IconComponent;
function useIcon(role: IconRole, override: IconComponent | undefined): IconComponent;
function useIcon(role: IconRole, override: IconComponent | null | undefined): IconComponent | null;
```

Resolution order, where the first defined source wins:

1. **Prop**: `override !== undefined` returns `override`. `null` returns `null` and the caller renders nothing. Only Alert's types allow `null`.
2. **Provider**: `icons[role]` from the nearest `IconProvider`, merged with any outer providers.
3. **Default**: the private default glyph for `role`.

`useIcon` is public, so consumers who build their own components can respect the same provider.

### `Icon`

```ts
interface IconProps extends Omit<IconComponentProps, 'width' | 'height'> {
  icon: IconComponent;                     // required
  size?: 'sm' | 'md' | 'lg' | number;      // default 'md' (16 px)
  strokeWidth?: number;                    // default from size: 2 if px <= 16, else 1.5
  label?: string;                          // accessible name; omitted = decorative
}
```

- `Icon` renders `<IconComp width={px} height={px} strokeWidth={stroke} focusable="false" aria-hidden="true" className={…} {...rest} />`.
- With a `label`, the icon is wrapped in Radix `AccessibleIcon` (`<AccessibleIcon label={label}>`), which keeps the SVG `aria-hidden` and adds a visually hidden text label.
- `Icon` has no `name` prop and no lookup table.

### Role map

These are all the internal icons in `src/components/` today, each with its role, size, stroke and override prop (DS-48). Every slot receives the same props: `width` and `height` set to the size, `strokeWidth`, `className`, `aria-hidden="true"` and `focusable="false"`.

| Component | Part | Role | Size (px) | Stroke | Override prop | Type | Today |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Dialog` | close button | `close` | 16 | 2 | `closeIcon` | `IconComponent` | `Dialog.tsx:100` |
| `Checkbox` | checked mark, md / sm | `check` | 16 / 12 | 2 | `checkIcon` | `IconComponent` | `Checkbox.tsx:78`, size from `Checkbox.css:99-107` |
| `Checkbox` | indeterminate mark, md / sm | `minus` | 16 / 12 | 2 | `indeterminateIcon` | `IconComponent` | `Checkbox.tsx:81-83` (inline SVG, not `Icon`) |
| `CheckboxGroup` | error message | `alert` | 14 | 2 | `errorIcon` | `IconComponent` | `Checkbox.tsx:149` |
| `Field` | error message | `alert` | 14 | 2 | `errorIcon` | `IconComponent` | `Input.tsx:103` |
| `TextField` | passes to `Field` | `alert` | 14 | 2 | `errorIcon` | `IconComponent` | `Input.tsx:143-148` |
| `TextareaCounter` | over-limit counter | `alert` | 14 | 2 | `errorIcon` | `IconComponent` | `Textarea.tsx:89` |
| `Textarea` | passes to its own counter | `alert` | 14 | 2 | `errorIcon` | `IconComponent` | `Textarea.tsx:117` |
| `TextareaField` | passes to `Field` and to the counter | `alert` | 14 | 2 | `errorIcon` | `IconComponent` | `Textarea.tsx:199-228` |
| `Tag` | remove button, md and sm | `close` | 12 | 2 | `removeIcon` | `IconComponent` | `Tag.tsx:51` |
| `Alert` | severity `info` | `info` | 20 | 1.5 | `icon` | `IconComponent \| null` | `Alert.tsx:66` |
| `Alert` | severity `success` | `success` | 20 | 2 | `icon` | `IconComponent \| null` | `Alert.tsx:66` (today `check`, 1.75) |
| `Alert` | severity `error` | `warning` | 20 | 2 | `icon` | `IconComponent \| null` | `Alert.tsx:66` (today 1.75) |
| `Slider` | decrement stepper, md / lg, sm | `minus` | 16, 12 | 2 | `decrementIcon` | `IconComponent` | `Slider.tsx:418-428` (private 16-grid SVG) |
| `Slider` | increment stepper, md / lg, sm | `plus` | 16, 12 | 2 | `incrementIcon` | `IconComponent` | `Slider.tsx:418-428` |
| `SliderField` | passes to `Slider` and `Field` | `minus`, `plus`, `alert` | as above | as above | `decrementIcon`, `incrementIcon`, `errorIcon` | `IconComponent` | `Slider.tsx:608-615` |
| `IconButton` | the icon | none (required, consumer-supplied) | 18 | 1.5 | `icon` | `IconComponent` (was `IconName`) | `IconButton.tsx:35` |

Notes:

- Two props go beyond the task list. `indeterminateIcon` exists because the indeterminate dash is an internal icon too. `errorIcon` sits on `CheckboxGroup` rather than `Checkbox`, because the group renders the error line and a single `Checkbox` has none.
- `Alert`'s `icon` replaces the severity default for that one instance. A provider maps `info`, `success` and `warning` once for all Alerts.
- `IconButton` does not use `useIcon`. Its icon is content, not chrome, so the consumer always passes it.
- Not icons, and out of scope: the Breadcrumb separator `/` and the required asterisk (both text); the Switch thumb, SegmentedControl indicator, and Slider thumb and ticks (shapes); Badge (a count).
- Chevrons have no internal user yet. They are reserved for the planned Select, Accordion and Pagination.

### Default glyphs

These are private, built with `createIcon`, and drawn on a 24 × 24 grid with a 2 px padding (20 × 20 live area). They are stroke only, with butt caps, miter joins and no fill. Dots are 2-unit dashes so they stay square with butt caps. The canvas section 02 draws each at 4× over the grid.

| Role | Path data | Change vs `icons.tsx` |
| --- | --- | --- |
| `close` | `M6 6l12 12M18 6L6 18` | none |
| `check` | `M5 12l5 5 9-10` | none |
| `minus` | `M5 12h14` | new (was inline in Checkbox) |
| `plus` | `M12 5v14M5 12h14` | arms 4 → 20 become 5 → 19, to match `minus` and `close` |
| `alert` | circle 12 12 r10; `M12 6.5v7M12 15.5v2` | dot was a 0.5-unit sliver (`v.5`); now a 2-unit dash, and the group is re-centered |
| `info` | circle 12 12 r10; `M12 10.5v7M12 6.5v2` | same dot fix, re-centered |
| `success` | circle 12 12 r10; `M7.5 12.5l3 3 6-7` | new; it is the glyph the Components canvas already shows for Alert success |
| `warning` | `M12 3.5l9.5 17h-19z`; `M12 9.5v5M12 16v2` | triangle inset 0.5 so miter corners at stroke 2 stay inside the grid; dot fix |
| `chevron-down` | `M6 9l6 6 6-6` | none |
| `chevron-left` | `M15 6l-6 6 6 6` | none |
| `chevron-right` | `M9 6l6 6-6 6` | none |

`search` is removed from the system because no component uses it. Stories and tests that need it build it with `createIcon` (canvas section 01).

Uses outside `src/components/` that DS-47 must migrate:

- `src/patterns/Configurator/Configurator.stories.tsx:139` and `src/patterns/ContactForm/ContactForm.stories.tsx:131` (`<Icon name="check" size={24|32}>`).
- `IconButton` and `SegmentedControl` stories, tests and `SegmentedControl.md` (`icon="plus" | "close" | "search" | "info"`).
- `Icon.stories.tsx` and `Icon.test.tsx`.

## Sizes

Canvas sections 03 and 04.

| Size | Px | Token | Stroke (24 grid) | Rendered line | Used by |
| --- | --- | --- | --- | --- | --- |
| `sm` | 12 | `icon-size-sm` | 2 (`icon-stroke-strong`) | 1.00 px | Tag remove, Checkbox sm mark, Slider sm steppers |
| (local) | 14 | none, component-local | 2 | 1.17 px | Field, CheckboxGroup and Textarea counter error lines (matches the 13/20 caption) |
| `md` (default) | 16 | `icon-size-md` | 2 | 1.33 px | Dialog close, Checkbox md mark, Slider md / lg steppers, `Icon` default |
| (local) | 18 | none, component-local | 1.5 (`icon-stroke`) | 1.13 px | IconButton (44 px box) |
| `lg` | 20 | `icon-size-lg` | 1.5; 2 for Alert success / error | 1.25 / 1.67 px | Alert |
| (number) | 24 | none | 1.5 | 1.50 px | standalone consumer use; the drawing grid |

- Stroke rule: stroke 2 at 16 px and below, 1.5 at 18 px and above. This keeps the rendered line at 1 px or more at every size. Heroicons' own 1.5 at 12 px renders 0.75 px, and the comparison in canvas section 03 shows why the system passes stroke at small sizes.
- The one exception is Alert success and error, which use stroke 2 at 20 px as a severity emphasis (they were 1.75). See Open questions.
- `Icon size` takes `'sm' | 'md' | 'lg'` or any number of px. A number goes through the same stroke rule.
- Sizes 14 and 18 stay component-local. The public scale is on the 4 px grid (12 / 16 / 20, equal to 3, 4 and 5 spacing steps). 14 is tuned to caption text and 18 to the 44 px button, and neither is a general size.

## States

An icon has no interactive state and is never focusable. It paints with `currentColor`, so its color in every state comes from the parent. Canvas section 05 (color contexts), section 06 (states of the controls that contain icons), and section 07 (resolution states).

### Color states

| State | Trigger | Icon color (from parent) | Border / fill | Canvas |
| --- | --- | --- | --- | --- |
| Default | standalone, IconButton, Dialog close, steppers | `--ds-color-ink` | none of its own | 05 Default |
| Muted | Tag remove | `--ds-color-text-muted` | none | 05 Muted |
| Disabled | inside a disabled control | `--ds-color-disabled` | none | 05 Disabled |
| On primary | Checkbox checked / indeterminate mark; Dialog close and stepper pressed | `--ds-color-primary-contrast` | the control's `--ds-color-primary` fill | 05 On primary |
| Info | Alert info | `--ds-color-info` | the Alert's | 05 Info |
| Success | Alert success | `--ds-color-success` | the Alert's | 05 Success |
| Error | Alert error, error messages, over-limit counter | `--ds-color-error` | the Alert's or none | 05 Error |
| Hover / focus-visible / pressed / disabled of the control | the control's own states | follows the control | the control's ring and fill only; the icon never gets an outline | 05 Inside a control, 06 |

### Resolution states

| State | What renders | What stays the same | Canvas |
| --- | --- | --- | --- |
| Default glyph | private glyph, butt / miter | size, stroke, color, ARIA, control name | 07 · 1 |
| Provider | `icons[role]` from the nearest provider | same | 07 · 2 |
| Prop override | the prop, even inside a provider | same | 07 · 3 |
| Nested providers | inner role wins, outer roles fill the gaps | same | 07 · 4 |
| Hidden (`icon={null}`, Alert only) | no `<svg>`, no 12 px gap; content starts at the 16 px padding | role, border, fill, title, body | 06 Alert overrides |
| Decorative `Icon` | `<svg aria-hidden="true" focusable="false">` | n/a | 09 |
| Labeled `Icon` | Radix `AccessibleIcon`: hidden `<svg>` plus visually hidden label | n/a | 09 |

## Keyboard

The icon system adds no keys and must not change any.

| Key | Behavior |
| --- | --- |
| Tab / Shift + Tab | Never stops on an icon. Every icon has `focusable="false"` and no `tabindex`. Focus goes to the control that contains it (IconButton, Dialog close, Tag remove, Checkbox), and the focus ring is drawn on that control. |
| Enter / Space | Handled by the control. An override icon never adds handlers. |
| Esc, arrows, Home / End, Page Up / Page Down | Unchanged. Dialog, Slider and Radix own them. |

- Focus order is unchanged by an override, because the icon is a leaf inside the same control.
- Slider steppers stay `tabIndex={-1}`, as the Slider spec says. They show the ring only when a screen reader or script focuses them.

## Radix

- **`AccessibleIcon`** (`import { AccessibleIcon } from 'radix-ui'`) for `Icon` with a `label`. It clones the SVG with `aria-hidden` and `focusable="false"` and renders a `VisuallyHidden` label next to it. This is better than `role="img"` + `aria-label` on the SVG, because the name is real text (translatable, read the same way by every screen reader). Decorative `Icon`s render the SVG directly, with no wrapper.
- **None** for `IconProvider`, `useIcon` and `createIcon`. They are React context and a plain SVG factory, and Radix has no primitive for either.
- The components keep their primitives. The icon slot sits inside `Checkbox.Indicator`, inside the `Dialog.Close asChild` button, and so on. Swapping the icon does not touch Radix state attributes (`[data-state]`, `[data-disabled]`). `IconButton` keeps `Slot` for `asChild`.

## Tokens

| Property | Token / value |
| --- | --- |
| Icon color | `currentColor`. The parent sets it: `--ds-color-ink`, `--ds-color-text-muted`, `--ds-color-disabled`, `--ds-color-primary-contrast`, `--ds-color-info`, `--ds-color-success`, `--ds-color-error`. After DS-27, standalone icons in controls read `color-icon` (Theming role) instead of `--ds-color-ink`. |
| Size sm / md / lg | `icon-size-sm` 12, `icon-size-md` 16, `icon-size-lg` 20 (requested) |
| Size 14 (error lines), 18 (IconButton) | component-local constants |
| Stroke, 18 px and up | `icon-stroke` 1.5 (requested) |
| Stroke, 16 px and below; Alert success / error | `icon-stroke-strong` 2 (requested) |
| Line caps / joins | `butt` / `miter`, fixed by the glyph style, not tokens |
| Grid | 24 × 24 viewBox, 2 px padding, fixed |
| Gap, icon to text | unchanged per component: Alert `--ds-space-3`; error lines and counter 6 px (the existing off-scale value flagged in the Theming spec) |
| Checkbox mark size | today `--ds-space-4` / `--ds-space-3` in `Checkbox.css`; moves to `icon-size-md` / `icon-size-sm` |
| Focus ring (on the control) | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` (`color-focus` after DS-27) |

- Components pass size and stroke to icons as React props, because the contract is props-based. DS-47 adds TS constants (`iconSize = { sm: 12, md: 16, lg: 20 }`, `iconStroke = { regular: 1.5, strong: 2 }`) that mirror the tokens, plus a unit test that parses `tokens.css` and asserts they match. CSS that sizes an icon (for example `Checkbox.css`) reads the tokens directly.
- These tokens are not part of the theme contract. The Theming spec lists icon sizes and strokes as fixed, and themes must not override them.

## Accessibility

- **Icons inside components are always decorative.** Every slot passes `aria-hidden="true"` and `focusable="false"` to whatever icon wins (default, provider or prop). The accessible name stays on the control and never comes from the icon:
  - Dialog close: `aria-label="Close"`.
  - Tag remove: `aria-label="Remove <label>"` / `removeLabel`.
  - Slider steppers: "Decrease" / "Increase" (`buttonNaming`).
  - Checkbox: name from its label, state from `aria-checked` (`true` / `false` / `mixed`).
  - Field, CheckboxGroup, Textarea errors: text with a visually hidden "Error: " prefix. The counter's message comes from its live region.
  - Alert: `role="status"` / `role="alert"` with its title and body.
  - IconButton: required `aria-label`.
- **Labeled standalone icons** use `Icon label="…"` (Radix `AccessibleIcon`). Use this only when the icon is the only carrier of meaning, for example a status icon alone in a table cell. Otherwise leave it decorative.
- **`null` is allowed only on Alert** (`icon={null}`). There the severity is still conveyed by `role`, border, fill and the title. The Alert docs require the title to name the severity when the icon is hidden (for example "Error: upload failed"), so color is never the only cue. Everywhere else `null` is a type error, because the icon is the only visible content of an icon-only control (Dialog close, Tag remove, steppers), the only visual of a checked state (Checkbox), or the non-color cue paired with error text (error lines, counter). To remove those, use the component's own option (`hideCloseButton`, omit `onRemove`, `stepper={false}`), not a null icon. Provider values cannot be `null`.
- **Contrast**: icons inherit colors that already pass. Ink is 21:1, muted 7:1, error 7:1 on white and 6.1:1 on its background, success 6.4:1 / 5.7:1, info 9.7:1, and white on primary 21:1. Icons that carry meaning (close, check, steppers, status) meet the 3:1 non-text minimum (WCAG 1.4.11). Disabled icons are exempt. The size-stroke rule keeps lines at 1 px or more. An override icon inherits the same color, so contrast does not depend on the library.
- **Forced colors**: `currentColor` follows the system colors. Stroke-only glyphs and Phosphor's filled outlines both survive. The focus ring stays an `outline` on the control.
- **Contract violations** are the consumer's responsibility. Docs (DS-49) state that an `IconComponent` must not render `<title>`, `tabindex` or handlers, and must spread the passed props.
- **`jest-axe` should find no violations for:**
  - `Icon` decorative and labeled.
  - Each component in the role map rendered three ways: default glyphs, inside an `IconProvider` with a fake `IconComponent`, and with the override prop.
  - `Alert` with `icon={null}` for each severity.
- **Unit and `userEvent` tests should check:**
  - Resolution order: prop > provider > default, nested providers merge, and the inner provider wins.
  - Every slot passes `width`, `height`, `strokeWidth`, `className`, `aria-hidden="true"` and `focusable="false"` to a spy `IconComponent`, with the size and stroke from the role map.
  - The control keeps its accessible name with an override (`getByRole('button', { name: 'Close' })`).
  - Tab never lands on an `<svg>`, and Space / Enter still activate the control with an override in place.
  - `Icon label` renders a visually hidden label and a hidden `<svg>`.
  - `createIcon` sets `aria-hidden` unless it gets `aria-label` / `aria-labelledby`, and the given props win over its defaults.
  - Type tests: `null` is rejected on every override prop except Alert's `icon`, and Lucide, Tabler, Phosphor and Heroicons components are assignable to `IconComponent` (DS-49, with those packages as devDependencies only).

## Open questions

1. Alert success and error stroke goes from 1.75 to 2, so the system has two strokes only. The alternative is 1.5 for all three severities.
2. Alert success goes from a bare check to the circled `success` glyph, matching the Components canvas and the info / error family. Confirm.
3. Slider steppers move from a private 16-grid SVG (2 px line at md) to the shared 24-grid `minus` / `plus` at stroke 2 (1.33 px at md), the same weight as Dialog close and the Checkbox mark. Accept the lighter steppers?
4. The system passes `strokeWidth` to every icon in a slot, so Lucide, Tabler and Heroicons render at the system weight. The alternative is to pass it only to default glyphs and let libraries keep their own weight. Consumers can opt out per icon with a wrapper either way.
5. `indeterminateIcon` (Checkbox) and the move of `errorIcon` to `CheckboxGroup` go beyond the prop list in the task. Confirm.
6. Should 14 and 18 stay component-local, or become tokens (an extra `icon-size-xs` 14 and `icon-size-ml` 18)? This spec keeps three public steps.
7. DS-49 needs `lucide-react`, `@tabler/icons-react`, `@phosphor-icons/react` and `@heroicons/react` as devDependencies, for docs and type tests only and never as runtime dependencies.

## Token requests

Five new tokens. They are fixed system constants and not part of the theme contract.

| Token | Value | Why |
| --- | --- | --- |
| `--ds-icon-size-sm` | 12px | Small icon step: Tag remove, Checkbox sm mark, Slider sm steppers. Today it is hardcoded as `12` in TSX or borrowed from `--ds-space-3` in `Checkbox.css`, which is a spacing token used for a size. |
| `--ds-icon-size-md` | 16px | Default icon step and the `Icon` default: Dialog close, Checkbox md mark, Slider md / lg steppers. Today it is hardcoded or borrowed from `--ds-space-4`. |
| `--ds-icon-size-lg` | 20px | Large icon step: Alert. Today it is hardcoded. |
| `--ds-icon-stroke` | 1.5 | Regular stroke in 24-grid units, for icons of 18 px and up (IconButton, Alert info, standalone). Unitless, so it works as CSS `stroke-width` in user units and as the React prop. |
| `--ds-icon-stroke-strong` | 2 | Strong stroke for icons of 16 px and below, and for Alert success / error emphasis. It keeps rendered lines at 1 px or more. Named after `--ds-border-width-strong`. |

All five values already appear in the code today (`Icon.tsx` defaults and every call site). Nothing visible changes except the items in Open questions 1 to 3.
