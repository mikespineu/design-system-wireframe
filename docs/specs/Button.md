# Button

- task: DS-32
- canvas: docs/design-system-wireframe/Button.dc.html
- canvas_url: https://claude.ai/artifact/PKujodLxbUcDyTWeRPKmGX
- approved: no
- approved_by:
- approved_at:
- approval_hash:

This spec covers the whole Button family. It extends the two existing components and adds one new one:

| Component | Job | Change | Radix | Canvas | Build task |
| --- | --- | --- | --- | --- | --- |
| `Button` | Text action, optional icons | adds `leadingIcon`, `trailingIcon`, `loading` | `Slot` (existing `asChild`) | 01–06 | DS-33 |
| `IconButton` | Icon-only action or toggle | adds `variant`, `loading`, `pressed` / `defaultPressed` / `onPressedChange`, `pressedIcon`; `icon` becomes `IconComponent` (DS-47) | `Slot`, `Toggle` | 01–02, 06–08 | DS-33 |
| `ButtonGroup` | Joins Buttons and IconButtons into one named unit | new | none | 01, 06, 09–10 | DS-34 |

The design adds no new tokens and no new glyphs. Icons are passed in as `IconComponent`s (the contract comes from DS-46 / DS-47). The Wishlist heart (outline and filled) is a consumer icon, built with `createIcon` in stories. It is not added to `Icon`'s defaults.

Proposed API:

```ts
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import type { IconComponent } from '../Icon'; // DS-47

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

// ---------- Button ----------
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;          // default 'primary' (unchanged)
  leadingIcon?: IconComponent;      // before the label, 16 px, aria-hidden
  trailingIcon?: IconComponent;     // after the label, 16 px, aria-hidden
  loading?: boolean;                // default false; see "Loading" below
  asChild?: boolean;                // unchanged: Radix Slot, e.g. <a>
}

// ---------- IconButton ----------
interface IconButtonBaseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  'aria-label': string;             // required, unchanged; never changes with `pressed`
  icon: IconComponent;              // 18 px (type changed by DS-47, was IconName)
  variant?: ButtonVariant;          // default 'secondary' = today's IconButton look
  loading?: boolean;                // default false
}
interface IconButtonActionProps extends IconButtonBaseProps {
  asChild?: boolean;                // unchanged
  children?: ReactNode;             // only with asChild
  pressed?: never; defaultPressed?: never; onPressedChange?: never; pressedIcon?: never;
}
interface IconButtonToggleProps extends IconButtonBaseProps {
  pressed?: boolean;                // controlled
  defaultPressed?: boolean;         // uncontrolled
  onPressedChange?: (pressed: boolean) => void;
  pressedIcon?: IconComponent;      // shown instead of `icon` while pressed
  asChild?: never;                  // a link is not a toggle
  children?: never;
}
export type IconButtonProps = IconButtonActionProps | IconButtonToggleProps;

// ---------- ButtonGroup ----------
interface ButtonGroupBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  attached?: boolean;               // default false (spaced, 8 px gap)
  disabled?: boolean;               // default false; disables every child
  children: ReactNode;              // Buttons and IconButtons
}
export type ButtonGroupProps = ButtonGroupBaseProps &
  ({ 'aria-label': string; 'aria-labelledby'?: never } | { 'aria-label'?: never; 'aria-labelledby': string });
```

- `ref` and rest props go to the root element: the `button` (or the `asChild` child) for Button and IconButton, and the `div` for ButtonGroup.
- `type` still defaults to `"button"` when not `asChild`.
- An IconButton is a **toggle** when `pressed` or `defaultPressed` is not `undefined`. Otherwise it is a plain action button and renders no `aria-pressed`. The union keeps `asChild` and the toggle props apart. If the union proves awkward in DS-33, a dev-mode `console.error` for `asChild` + toggle props is an acceptable alternative.
- A Button must have a text label. A Button with only an icon and no children is a misuse; use `IconButton`. DS-33 may add a dev-mode warning.
- `variant="primary"` + toggle with no `pressedIcon` cannot show its state, because the pressed border is black on black (see States). DS-33 adds a dev-mode `console.warn` for this case.

## Sizes

One size, the existing 44 px control height. No `size` prop is added (out of scope). Canvas 02.

Button:

| Part | primary / secondary | ghost |
| --- | --- | --- |
| Height | 44 | 44 |
| Padding-x | 24 | 16 |
| Icon | 16 × 16 | 16 × 16 |
| Icon to label gap | 8 | 8 |
| Label | Red Hat Mono 500, 14/20 | same, underlined (offset 4) |
| Border | 1 px | 1 px transparent |

- Padding stays the same on the icon side. An icon makes the button 24 px wider (16 + 8) and never taller.
- Order in the flex row: `leadingIcon`, label, `trailingIcon`, then the spinner overlay (absolute). Icons are centred on the 44 px box.
- Ghost: the underline is on the label only, not under the icons or the gaps. A text node in a flex row is its own item, so `text-decoration` on the root already skips the SVGs. With `asChild`, the anchor's text gets it the same way.

IconButton:

| Part | All variants |
| --- | --- |
| Box | 44 × 44 (width = control height) |
| Icon | 18 × 18 (unchanged) |
| Border | 1 px (ghost: transparent); 2 px when pressed (secondary, ghost) |

- The pressed 2 px border grows inward (`box-sizing: border-box`), so the box stays 44 × 44 and the icon does not move.

Spinner (Button and IconButton):

| Host | Size | Stroke (24 viewBox) | Shape | Motion |
| --- | --- | --- | --- | --- |
| Button | 16 | 2 | 270° arc, butt caps | rotate 360° in 800 ms, linear, infinite |
| IconButton | 18 | 2 | same | same |

- The spinner is an absolutely positioned overlay (`inset: 0`, centred) over the whole button, whatever the icon layout. It is an internal SVG with `aria-hidden="true"` and `data-spinner`. It cannot be overridden in v1.
- Under `prefers-reduced-motion: reduce` it does not rotate. Instead it pulses opacity 1 → 0.4 → 1 over 1600 ms, so the busy state is still visible without motion.
- The 800 ms and 1600 ms durations are component constants, not tokens (see Token requests).

ButtonGroup:

| Mode | Layout | Between children |
| --- | --- | --- |
| spaced (default) | `inline-flex`, `align-items: center` | 8 px gap |
| `attached` | `inline-flex`, no gap | every child after the first gets `margin-inline-start: -1px`, so neighbouring 1 px borders collapse into one shared line |

- Children keep their own sizes. The group is as wide as its content, minus 1 px per seam when attached. To stretch the group (e.g. a mobile product page), the consumer sets the width on the group and `flex: 1` on the Button through `className`. No `fullWidth` prop in v1.
- Horizontal only. RTL mirrors through `margin-inline-start` and flex direction.

## States

All visuals come from attributes and pseudo-classes: `:hover`, `:focus-visible`, `:disabled`, `[data-loading]`, Radix `[data-state="on" | "off"]`, and `[data-attached]` / `[data-disabled]` on the group. No extra JS state.

Hover rules must exclude loading and disabled: `:hover:not([data-loading]):not(:disabled)`. The current `enabled:hover:` alone is not enough, because a loading button is still `:enabled`.

### Button (canvas 03–05; each artboard shows leading, trailing and both)

Icons are `currentColor`, so they always follow the label colour.

| State | Trigger | primary | secondary | ghost |
| --- | --- | --- | --- | --- |
| Default | – | fill + border black, label + icons white | fill white, border black, label + icons black | fill + border transparent, label + icons black, label underlined |
| Hover | `:hover` | fill + border gray-800 | fill gray-100 | fill gray-100 |
| Focus-visible | `:focus-visible` | + 2 px black outline, 2 px offset; nothing else changes | same | same; the ring traces the 44 px box |
| Disabled | `:disabled` | fill + border gray-200, label + icons gray-500 | fill white, border gray-300, label + icons gray-500 | label + icons gray-500 |
| Loading | `[data-loading]` | as Default; content hidden, white spinner centred | as Default; content hidden, black spinner | as Default; content and underline hidden, black spinner |
| Loading + focus | `[data-loading]:focus-visible` | as Loading + ring | same | same |
| Loading + hover | `[data-loading]:hover` | no change | no change | no change |

- Disabled: `cursor: not-allowed`, no hover, out of the tab order (native `disabled`). Unchanged from today.
- Loading: `cursor: progress`.
- Colour transitions (`background-color`, `border-color`) use `--ds-motion`, as today. Content hide/show and the spinner appear instantly, with no fade.

### Loading (Button and IconButton, canvas 06)

| Aspect | Behaviour |
| --- | --- |
| Spinner placement | Centred overlay over the whole button (`position: absolute; inset: 0`). The root gets `position: relative`. |
| Width | Fixed. Label and icons stay in the flow but are visually hidden, so the box keeps its exact size. The label is never swapped for "Loading…". |
| How content is hidden | Canvas shows `opacity: 0`. Build with `color: transparent` on the root while `[data-loading]`. Label text, `currentColor` icons and the ghost underline all follow it, and it works for `asChild` text nodes. The spinner sets its colour explicitly: `--ds-color-primary-contrast` on primary, `--ds-color-ink` on secondary and ghost. |
| Colours | The variant's Default fill and border stay. Loading never looks disabled. |
| Attributes | `aria-busy="true"`, `aria-disabled="true"`, `data-loading=""`. **Not** the native `disabled` attribute. |
| Clicks blocked | The wrapper's `onClick` calls `event.preventDefault()` and returns before calling the consumer's `onClick`. This also stops form submission for `type="submit"` (including implicit submission by Enter in a field) and stops Radix `Toggle` from toggling, because `composeEventHandlers` skips the internal handler when `defaultPrevented`. With `asChild` links it stops navigation. |
| Focus | Stays focusable and in the tab order. If loading starts while the button has focus, focus stays on it. Native `disabled` would drop focus to `<body>`, which is why it is not used. Nothing is trapped: Tab and Shift + Tab move on as usual. |
| Accessible name | Unchanged ("Add to cart"; IconButton keeps its `aria-label`). `aria-pressed` keeps its value while busy. |
| `disabled` + `loading` | `disabled` wins: native disabled look, no spinner, no `aria-busy`. The same applies when a disabled ButtonGroup contains a loading child. |
| Result | The button does not announce success or failure. The app does that, e.g. through a Toast / live region. |
| Forced colours | `forced-colors: active` overrides `transparent`, so the label shows. In that mode the spinner is hidden (`display: none`) to avoid overlap; clicks stay blocked and `aria-busy` stays. |

### IconButton (canvas 07–08; each artboard shows primary, secondary and ghost)

Unpressed and plain action (`aria-pressed="false"` or no `aria-pressed`):

| State | Trigger | primary | secondary (default) | ghost |
| --- | --- | --- | --- | --- |
| Default | – | fill + border black, icon white | fill white, border 1 px black, icon black | fill + border transparent, icon black |
| Hover | `:hover` | fill + border gray-800 | fill gray-100 | fill gray-100 |
| Focus-visible | `:focus-visible` | + 2 px black outline, 2 px offset | same | same |
| Disabled | `:disabled` | fill + border gray-200, icon gray-500 | fill white, border gray-300, icon gray-400 (unchanged) | icon gray-400 |
| Loading | `[data-loading]` | as Default; icon hidden, white 18 px spinner | as Default; icon hidden, black spinner | as Default; icon hidden, black spinner |

- Hover never previews `pressedIcon`. The icon changes only when the button is activated.
- Disabled icon colours: secondary and ghost keep today's gray-400 (`--ds-color-disabled`, the non-text disabled role). Primary uses gray-500, the same as the Button primary disabled label, because gray-400 on a gray-200 fill is barely visible. A disabled primary Button and primary IconButton side by side then match.

Pressed (toggle with `aria-pressed="true"`, Radix `[data-state="on"]`):

| State | Trigger | primary | secondary | ghost |
| --- | --- | --- | --- | --- |
| Pressed | `[data-state="on"]` | as Default; `pressedIcon` (filled heart) | fill white, **border 2 px black**, `pressedIcon` | fill transparent, **border 2 px black**, `pressedIcon` |
| Pressed + hover | `[data-state="on"]:hover` | fill + border gray-800 | fill gray-100, border 2 px black | fill gray-100, border 2 px black |
| Pressed + focus | `[data-state="on"]:focus-visible` | + ring | + ring; the 2 px offset keeps the ring apart from the 2 px border | same as secondary |
| Pressed + disabled | `[data-state="on"]:disabled` | fill + border gray-200, `pressedIcon` gray-500 | border 2 px gray-400, `pressedIcon` gray-400 | border 2 px gray-400, `pressedIcon` gray-400 |
| Pressed + loading | `[data-state="on"][data-loading]` | as Pressed; icon hidden, spinner | as Pressed (2 px border kept); spinner | same as secondary |

- Without `pressedIcon`, the same `icon` is shown in both states. On secondary and ghost the 2 px border alone carries the state. On primary nothing would change, hence the dev warning (see API).
- With `pressedIcon`, the state is shown by **shape** (outline → filled) plus, on secondary and ghost, the border. It never depends on colour alone.
- The icon swap and the border change are instant. Only fill and border colour transition with `--ds-motion`.

### ButtonGroup (canvas 09–10)

The group draws nothing itself. Its states are its children's states plus stacking rules.

| State | Trigger | attached | spaced |
| --- | --- | --- | --- |
| Default | – | one shared 1 px seam; Add to cart (primary) + Wishlist (secondary) gives a black seam | 8 px gap, full borders |
| Hover on a child | child `:hover` | hovered child `z-index: 1`, so its border (e.g. gray-800) wins the seam | child hover only |
| Child pressed | child `[data-state="on"]` | pressed child `z-index: 1`; its 2 px border wins, so the seam reads 2 px on its side | child pressed only |
| Focus-within | child `:focus-visible` | ring on the focused child only, `z-index: 2`, drawn over the neighbour | ring on the focused child; the 2 + 2 px ring fits inside the 8 px gap |
| Disabled | group `disabled` → `[data-disabled]` on root | every child natively disabled; the seam is the later child's disabled border (gray-300 on the IconButton) | every child disabled |
| Child loading | child `[data-loading]` | only that child is busy; the others stay usable | same |

- There is no ring or outline on the group for `:focus-within`, because the ring must show which child has focus.
- Children need `position: relative` for the `z-index` rules. Button and IconButton already have it for the spinner overlay.
- Ghost children are allowed only in spaced groups. A ghost has no visible border, so an attached ghost shows no joint (canvas 09, "Don't"). This is docs guidance and is not enforced in code.

## Keyboard

Button and plain IconButton (native `button`):

| Key | Action |
| --- | --- |
| Tab / Shift + Tab | Next / previous focusable. Loading buttons stay in the order; disabled ones are skipped. |
| Enter | Activates (`onClick`, or form submit for `type="submit"`). No-op while loading. |
| Space | Activates on key up. No-op while loading. |

Toggle IconButton (Radix `Toggle`):

| Key | Action |
| --- | --- |
| Enter / Space | Toggles `pressed` and calls `onPressedChange(next)`. No-op while loading or disabled. |
| Tab / Shift + Tab | Next / previous focusable. Focus stays on the button after toggling. |

ButtonGroup:

| Key | Action |
| --- | --- |
| Tab | Moves into the group on the first enabled child. Each further Tab goes to the next child, then out of the group. |
| Shift + Tab | The reverse. |
| Arrow keys, Home, End | No action. This is not a toolbar, so there is no roving focus. |

- Focus order is DOM order: "Add to cart" → Wishlist → the next control after the group. A loading child is still a tab stop. A disabled group is skipped entirely.
- `asChild` links follow link semantics: Enter activates, Space does not.

## Radix

- **Button**: `Slot` from `radix-ui`, as today, for `asChild`. With `asChild`, the icons and the spinner are rendered around the child's own content through `Slot.Slottable`, the same pattern the current `IconButton` uses: `leadingIcon`, `<Slot.Slottable>{children}</Slot.Slottable>`, `trailingIcon`, spinner. No other primitive is needed. A button's behaviour is native.
- **IconButton**:
  - Plain action: native `button`, or `Slot.Root` with `asChild`, as today.
  - Toggle (`pressed` or `defaultPressed` defined): `Toggle` from `radix-ui` (`import { Toggle } from 'radix-ui'`). `Toggle.Root` renders the `button`. Radix provides `aria-pressed`, `data-state="on" | "off"`, `data-disabled`, the controlled / uncontrolled `pressed` logic and `onPressedChange`. Hand-rolling `aria-pressed` would duplicate this, so it is not done.
  - The loading guard is the wrapper's `onClick`, passed to `Toggle.Root`. It calls `preventDefault()`, so Radix's composed handler does not toggle.
- **ButtonGroup**: none. It is a `div` with `role="group"` and a React context that carries `disabled`.
  - Radix `Toolbar` is not used: it adds roving tabindex and arrow-key navigation, which DS-34 rules out. A two-button product action is not a toolbar.
  - Radix `ToggleGroup` is not used: it is for choosing among options, which a group of independent actions is not.
- **Icons**: rendered through `Icon` (DS-47) with `size` 16 (Button) or 18 (IconButton). `Icon` sets `aria-hidden`, `focusable="false"` and `currentColor`.

## Tokens

Button:

| Property | Token |
| --- | --- |
| Height | `--ds-control-height` |
| Padding-x primary / secondary | `--ds-space-6` |
| Padding-x ghost | `--ds-space-4` |
| Icon size | `--ds-space-4` (16 px, passed as `Icon size={16}`) |
| Icon to label gap | `--ds-space-2` |
| Ghost underline offset | `--ds-space-1` |
| Border width | `--ds-border-width` |
| Label font | `--ds-font-mono`, weight 500, 14 px (Tailwind `text-sm`, unchanged), line height `--ds-line-height-sm` |
| Corner radius | `--ds-radius-md` |
| Primary fill + border / label + icons | `--ds-color-primary` / `--ds-color-primary-contrast` |
| Primary hover fill + border | `--ds-color-primary-hover` |
| Primary disabled fill + border / label + icons | `--ds-color-divider` / `--ds-color-placeholder` |
| Secondary fill / border / label + icons | `--ds-color-surface` / `--ds-color-ink` / `--ds-color-ink` |
| Secondary hover fill | `--ds-color-fill` |
| Secondary disabled border / label + icons | `--ds-color-border` / `--ds-color-placeholder` |
| Ghost label + icons | `--ds-color-ink` |
| Ghost hover fill | `--ds-color-fill` |
| Ghost disabled label + icons | `--ds-color-placeholder` |
| Focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Colour transitions | `--ds-motion` (background-color, border-color) |

IconButton:

| Property | Token |
| --- | --- |
| Width and height | `--ds-control-height` |
| Icon size | 18 px, `Icon size={18}`, unchanged. There is no 18 px token (see Token requests). |
| Border width / pressed border width | `--ds-border-width` / `--ds-border-width-strong` |
| Primary fill + border / icon | `--ds-color-primary` / `--ds-color-primary-contrast` |
| Primary hover fill + border | `--ds-color-primary-hover` |
| Primary disabled fill + border / icon | `--ds-color-divider` / `--ds-color-placeholder` |
| Secondary fill / border / icon | `--ds-color-surface` / `--ds-color-ink` / `--ds-color-ink` |
| Secondary and ghost hover fill | `--ds-color-fill` |
| Secondary disabled border / icon | `--ds-color-border` / `--ds-color-disabled` |
| Ghost icon / disabled icon | `--ds-color-ink` / `--ds-color-disabled` |
| Pressed border (secondary, ghost) | `--ds-border-width-strong` solid `--ds-color-ink` |
| Pressed + disabled border (secondary, ghost) | `--ds-border-width-strong` solid `--ds-color-disabled` |
| Corner radius | `--ds-radius-md` |
| Focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Colour transitions | `--ds-motion` |

Spinner:

| Property | Token |
| --- | --- |
| Size in Button | `--ds-space-4` (16 px) |
| Size in IconButton | 18 px, the IconButton icon size |
| Colour on primary | `--ds-color-primary-contrast` |
| Colour on secondary and ghost | `--ds-color-ink` |
| Rotation / reduced-motion pulse | 800 ms linear / 1600 ms ease-in-out, component constants (not tokens) |

ButtonGroup:

| Property | Token |
| --- | --- |
| Spaced gap | `--ds-space-2` |
| Attached overlap | `calc(var(--ds-border-width) * -1)` as `margin-inline-start` on every child after the first |
| Shared seam colour | the children's own border tokens (no group token) |

## Accessibility

- **Button**
  - Native `button` role, or the `asChild` element's role.
  - The accessible name is the visible label. `leadingIcon` and `trailingIcon` are always `aria-hidden` and never add to the name.
- **IconButton**
  - The accessible name is `aria-label`, required by the type. It describes the action ("Add to wishlist"), not the state, and stays the same when pressed.
  - Toggle: `aria-pressed="true" | "false"` from Radix `Toggle`, announced "toggle button, pressed / not pressed".
  - Plain action: no `aria-pressed` at all. Never render `aria-pressed="false"` on a button that cannot toggle.
- **Loading**
  - `aria-busy="true"` and `aria-disabled="true"` on the button. The name is unchanged, the button stays focusable, and the spinner is `aria-hidden`.
  - Screen readers announce `aria-busy` on buttons unevenly. The app should announce the result through a live region (e.g. a Toast); the button's docs must say so.
- **ButtonGroup**
  - `role="group"`, named by the required `aria-label` (e.g. "Product actions") or `aria-labelledby`.
  - Children keep their own roles and names, in DOM order, with no roving tabindex.
  - A disabled group disables every child natively. With `asChild` link children, they get `aria-disabled="true"` and the click is blocked instead.
- **Contrast**
  - Primary: white label and icons on black are 21:1, and on gray-800 hover 15.1:1.
  - Secondary and ghost: black on white is 21:1, and on gray-100 hover 18.1:1.
  - Secondary border: black on white is 21:1, which passes 1.4.11.
  - Ghost has no boundary by design. The icon or the underlined label identifies it, as today.
  - Pressed: the outline → filled shape change is not colour. On secondary and ghost the 2 px black border on white (21:1) is a second cue.
  - Focus ring: black on white is 21:1. In an attached group the ring is drawn above the neighbour, so it is never covered.
  - Disabled controls are exempt. For reference: gray-500 on gray-200 is 3.4:1, gray-500 on white 4.5:1, and gray-400 on white 2.5:1.
- **Target size**: every Button and IconButton is 44 px tall, and IconButton is 44 × 44, which meets 2.5.5 (AAA). An attached seam does not shrink any target.
- **Motion**: the spinner does not rotate under `prefers-reduced-motion` (opacity pulse instead). Colour transitions use `--ds-motion` and are dropped under reduced motion, as elsewhere.
- **`jest-axe`** should report no violations for:
  - Button: each variant with leading icon, trailing icon and both; disabled; loading; `asChild` link with icons.
  - IconButton: each variant; disabled; loading; toggle unpressed and pressed (with and without `pressedIcon`); pressed + disabled; `asChild` link.
  - ButtonGroup: attached and spaced with "Add to cart" + Wishlist; disabled group; a group with a loading child; named by `aria-label` and by `aria-labelledby`.
- **`userEvent`** tests should check:
  - Button:
    - Tab focuses it; Enter and Space call `onClick`.
    - With `loading`: click, Enter and Space do **not** call `onClick`; `aria-busy="true"` and `aria-disabled="true"` are set; the accessible name is unchanged.
    - It stays focusable while loading, and Tab moves past it.
    - `type="submit"` + `loading` does not submit its form.
    - Switching `loading` on while focused keeps `document.activeElement` on the button.
    - The width does not change between `loading` false and true (compare `getBoundingClientRect` with a stubbed layout, or assert the content stays in the DOM and is not `display: none`).
    - Icons render with `aria-hidden="true"`.
    - `disabled` + `loading` renders native `disabled` and no `aria-busy`.
  - IconButton:
    - A plain IconButton has no `aria-pressed`.
    - Toggle: click, Enter and Space flip `aria-pressed` and call `onPressedChange`; `pressedIcon` renders when pressed and `icon` when not.
    - Loading blocks toggling and `onPressedChange`.
    - `aria-label` is the same in both states.
  - ButtonGroup:
    - `role="group"` with its name.
    - Tab order is DOM order, and arrow keys do not move focus.
    - `disabled` on the group disables every child, even one with `disabled={false}`.
    - `data-attached` is present only when `attached`.

## Token requests

None. Every value above maps to an existing `--ds-*` token, except two that are deliberately left as component constants:

- **IconButton icon size 18 px.** This is unchanged from today's `IconButton` and is passed as `Icon size={18}`. DS-46 (Icon design) already plans to propose `--ds-icon-size-sm/md/lg` and `--ds-icon-stroke`. When those are approved, map Button icons and the Button spinner to the 16 px size and the IconButton icon and spinner to the 18 px size. No separate request is made here, to avoid two competing proposals.
- **Spinner durations (800 ms rotation, 1600 ms reduced-motion pulse).** These are not requested. `--ds-motion` is for short state transitions (120 ms), and a looping indicator is a different job. CLAUDE.md restricts hardcoded colours and spacing, not animation durations. If more looping indicators appear (e.g. a Progress or Skeleton component), a `--ds-motion-loop` token could be proposed then.
