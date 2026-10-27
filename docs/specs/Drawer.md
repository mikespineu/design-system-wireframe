# Drawer

- task: DS-44
- canvas: docs/design-system-wireframe/Drawer.dc.html
- canvas_url: https://claude.ai/artifact/KBHcafYnw3U2BRtRR3bZwH
- approved: no
- approved_by:
- approved_at:
- approval_hash:

Modal side panel built on Radix `Dialog`. It slides in from the right (default), left, top or bottom over the same 50 % black overlay as `Dialog`. Square corners, no shadow: a 1 px black border on the panel's inner edge (the edge that faces the page) separates it from the page. The parts are Dialog's parts with Dialog's spacing and tokens: overlay, panel, header (title, description, close button), body, footer (actions). Only position, extent, border edge and motion are new.

Proposed API (for the builder; narrow and typed, mirrors `Dialog`):

```ts
type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
type DrawerSize = 'sm' | 'md' | 'lg';

interface DrawerProps {
  open?: boolean;                        // controlled
  defaultOpen?: boolean;                 // uncontrolled
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;                   // rendered via Dialog.Trigger asChild
  title: ReactNode;                      // required; Dialog.Title
  description: ReactNode;                // required; Dialog.Description
  children?: ReactNode;                  // body
  footer?: ReactNode;                    // actions; wrap Cancel in <DrawerClose asChild>
  side?: DrawerSide;                     // default 'right'
  size?: DrawerSize;                     // default 'md'
  dismissible?: boolean;                 // default true; false disables overlay click (Esc and close button still close)
  hideCloseButton?: boolean;             // default false
  className?: string;                    // on Dialog.Content
}
export const DrawerClose: typeof Dialog.Close; // re-export, for footer Cancel buttons
```

- `ref` and rest props forward to `Dialog.Content`.
- `Dialog.Content` carries `data-side` and `data-size` (our attributes) next to Radix's `data-state`. All styling keys off these three attributes and pseudo-classes; no JS visual state.
- Differences from `Dialog`: `side` prop; `description` is required (Dialog has it optional); no centering positioner (the panel is pinned to an edge); keyframe animation instead of transition (see States, Motion); the body is a focusable scroll region with a header divider that appears once scrolled (see Sizes, Scrolling). No new props for scrolling.

## Sizes

Canvas sections 01–04 (each side at each size, 1:1), 05 (mobile full) and 06 (scrolling content).

Size sets the panel's extent along the slide axis only: width for `left` / `right`, height for `top` / `bottom`. The panel always spans the full cross axis (full height for left/right, full width for top/bottom). Padding, type and parts are identical at every size and side.

| Size | Extent | Left / right use | Top / bottom use |
| --- | --- | --- | --- |
| `sm` | 320 px | navigation, filters, quick details | search, short actions |
| `md` (default) | 480 px | forms, record details | selection, filter sets |
| `lg` | 640 px | rich content, previews | previews, long lists |

Rules (all sides):

- Extent is fixed, not content-sized: `width` (left/right) or `height` (top/bottom) = size, capped at `100vw − 48 px` / `100dvh − 48 px`. The 48 px cap keeps a strip of overlay visible to click (canvas 09 "Open · capped extent").
- **Full (mobile):** at viewport widths under 480 px (`@media (max-width: 479px)`, the same breakpoint as Dialog's footer), `size` is ignored and every drawer fills the screen: `inset: 0`, `100vw × 100dvh`, no border. It still slides from its own `side`. No overlay strip remains, so it closes by close button, Cancel or Esc.
- Header: padding 24 top, 24 sides, 0 bottom. Title and description stack with an 8 px gap. Close button 32 × 32 top-right, nudged −4 px up and −8 px right (as Dialog). The close button stays top-right and actions stay right-aligned on every side; nothing mirrors with `side`.
- Body: `flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scroll-padding-block: var(--ds-space-4)` (16 px), padding 16 top, 24 sides, 24 bottom, plus a 1 px top border that is transparent until scrolled (see Scrolling). It fills the space header and footer leave; past that it scrolls. Short content leaves white space above the footer.
- Footer: pinned to the panel's bottom edge. 1 px top divider, padding 16 / 24, actions right-aligned with a 12 px gap, primary last. Under 480 px, actions stack full width with primary first (`flex-direction: column-reverse`), as in Dialog. In full mode the footer's bottom padding is `max(16 px, env(safe-area-inset-bottom))` and the header's top padding is `max(24 px, env(safe-area-inset-top))`.
- Without `footer`, the footer and its divider are not rendered.
- Position: `Dialog.Content` is `position: fixed` against its edge (`right` → `top: 0; bottom: 0; right: 0`, etc.); no positioner wrapper. Layering as Dialog: overlay `z-index: 50`, panel `51`.

Scrolling (canvas 06; same on every side, size and in full mode):

- Only the body scrolls. Header (title, description, close button) and footer never move. No second scroll region: a search field or filter row at the top of the body scrolls away with the content (canvas 06 "top · sm · mid-scroll").
- Available body height, for reference: left/right fill the viewport height; top/bottom at `sm` leave about 155 px of body (320 − header ≈ 87 − footer 77 − 1 px border), so long content there scrolls almost immediately. That is the main case to test.
- Bottom cut: the footer divider is always present (as in Dialog). Content runs into it and is clipped there; the clipped line reads as "more below". Without `footer`, content scrolls to the panel's own edge and rests on the body's 24 px bottom padding at the end.
- Top cut (header divider): the body's 1 px top border, `transparent` at `scrollTop: 0` and `--ds-color-divider` once the body is scrolled. Pure CSS, scroll-driven, no JS state and no scroll listener:

  ```css
  .ds-drawer-body { border-top: var(--ds-border-width) solid transparent; }
  @supports (animation-timeline: scroll()) {
    .ds-drawer-body {
      animation: ds-drawer-scroll-edge auto linear both;
      animation-timeline: scroll(self);          /* must follow the shorthand */
      animation-range: 0 var(--ds-space-4);
    }
  }
  @keyframes ds-drawer-scroll-edge {
    from { border-top-color: transparent; }
    to   { border-top-color: var(--ds-color-divider); }
  }
  ```

  The divider fades in over the first 16 px of scroll. When the body does not overflow, the timeline is inactive and the border stays transparent. Where `animation-timeline` is unsupported, no header divider is drawn (the Dialog look); nothing else changes. The border is always 1 px, so nothing shifts when it appears. It is a color change, not motion, so it is kept under `prefers-reduced-motion` (the reduced-motion rule targets the overlay and panel, not the body).
- Scroll positions shown: at top (no header divider; footer divider cuts content), mid-scroll (both dividers), at end (last content on 24 px padding above the footer divider, header divider stays).
- Focusable scroll region: the body always renders `tabIndex={0}`, `role="region"` and `aria-labelledby` pointing at the title text (see Accessibility). Always, not only when overflowing: overflow detection would need a `ResizeObserver` and JS state, does not work in jsdom/SSR, and modern Chrome and Firefox already make scroll containers focusable. Cost: one extra Tab stop in short drawers.
- `scroll-padding-block: 16px` makes native scroll-into-view (Tab to a control below or above the fold) stop 16 px inside the body, so the 4 px focus ring never touches a divider.
- Scrollbar: native, not restyled; no `scrollbar-gutter` (header and footer do not scroll, so there is nothing to keep aligned).
- Page behind: locked by Radix (`RemoveScroll`); wheel, trackpad and touch over the panel scroll the body only, and `overscroll-behavior: contain` stops chaining at either end.

## States

Canvas section 09 (panel states on right · sm, close button states), 06 (scrolling content, every side) and 08 (motion).

| State | Trigger | Overlay | Panel | Close button | Other |
| --- | --- | --- | --- | --- | --- |
| Closed | `data-state="closed"` (after exit animation) | not rendered | not rendered | — | trigger `aria-expanded="false"` |
| Closed · focus returned | after Esc, close, Cancel, overlay click | — | — | — | trigger shows its focus-visible ring |
| Opening | `data-state="open"`, animation running | fades 0 → 1 | slides from its edge to rest (see Motion) | default | focus already inside the panel |
| Open | `data-state="open"` | black 50 % | white, 1 px black inner-edge border | default | page scroll locked; outside content `aria-hidden` (Radix) |
| Open · initial focus | on open | unchanged | first body field shows focus ring | default | |
| Open · focus on close button | body has no focusable content | unchanged | unchanged | focus-visible | |
| Open · focus on primary action | Tab to last action | unchanged | primary button focus ring | default | next Tab wraps to close button |
| Open · scrolling · at top | content taller than body, `scrollTop: 0` | unchanged | header and footer fixed; body top border transparent (no header divider); content clipped at the footer divider | unchanged | overscroll does not chain to the page |
| Open · scrolling · mid | `scrollTop > 0` | unchanged | body top border `--ds-color-divider` (header divider, fades in over the first 16 px); content clipped at both dividers | unchanged | divider needs `animation-timeline` support; else absent |
| Open · scrolling · at end | `scrollTop` = max | unchanged | header divider stays; last content rests on the 24 px bottom padding above the footer divider | unchanged | further scrolling does not move the page |
| Open · scrolling · no footer | `footer` omitted, content overflows | unchanged | no bottom divider; at end, last content on 24 px padding above the panel edge | unchanged | header divider as above |
| Open · scroll region focus-visible | body `:focus-visible` (Tab from close button; or first tabbable when `hideCloseButton` and body has no controls) | unchanged | 2 px black outline inset on the body (`outline-offset: −2px`), so header and footer never clip it; fill and text unchanged | default | arrow / page / Home / End keys scroll the body |
| Open · focus scrolled into view | Tab to a body control outside the visible area | unchanged | body scrolls natively until the control is 16 px (`scroll-padding-block`) inside the body edge; control shows its own focus ring | unchanged | |
| Open · no footer | `footer` omitted | unchanged | body runs to the panel's bottom edge, no divider | unchanged | |
| Open · capped extent | size larger than viewport − 48 px | 48 px strip visible | extent = viewport − 48 px | unchanged | |
| Open · full | viewport < 480 px | covered by panel | `inset: 0`, no border, footer actions stacked | unchanged | |
| Open · not dismissible | `dismissible={false}` | unchanged | identical to Open | unchanged | overlay click ignored |
| Closing | `data-state="closed"`, animation running | fades 1 → 0 | slides from rest back past its edge | — | Radix Presence keeps it mounted until `animationend` |
| Close · default | none | | | white fill, transparent 1 px border, black icon | `cursor: pointer` |
| Close · hover | `:hover` | | | fill gray-100 | transition `--ds-motion` |
| Close · focus-visible | `:focus-visible` | | | 1 px black border + 2 px black outline, 2 px offset | |
| Close · pressed | `:active` | | | fill black, icon white | |
| Action focus-visible | footer button `:focus-visible` | | | | as `Button`: 2 px black outline, 2 px offset |

Motion:

| Side | Enter (`data-state="open"`) | Exit (`data-state="closed"`) |
| --- | --- | --- |
| `right` | `translateX(100%)` → `none` | `none` → `translateX(100%)` |
| `left` | `translateX(-100%)` → `none` | `none` → `translateX(-100%)` |
| `top` | `translateY(-100%)` → `none` | `none` → `translateY(-100%)` |
| `bottom` | `translateY(100%)` → `none` | `none` → `translateY(100%)` |
| overlay | opacity 0 → 1 | opacity 1 → 0 |

- Duration and easing: `--ds-motion` for panel and overlay, e.g. `animation: ds-drawer-in-right var(--ds-motion);` (the token expands to `120ms cubic-bezier(0.2, 0, 0, 1)`). Full mode uses the same keyframes.
- Use CSS `@keyframes` animations keyed on `[data-state]` and `[data-side]`, not transitions. Radix `Presence` waits for `animationend` before unmounting on close, so the exit slide plays. (Dialog uses a transition with `@starting-style`, which only animates the entry.)
- `@media (prefers-reduced-motion: reduce)`: `animation: none` on overlay and panel, `transition: none` on the close button. The drawer appears and disappears in one frame; nothing slides or fades.
- No scale, no blur, no shadow at any point.

## Keyboard

| Key / input | Action |
| --- | --- |
| Enter / Space on trigger | Open. Focus moves to the first focusable element in the body; if none, the first focusable in the panel (close button). Same `onOpenAutoFocus` override as Dialog. |
| Tab / Shift + Tab | Move through focusables inside the panel only; wraps from last to first and back (focus trap, Radix `FocusScope`). The body scroll region (`tabIndex={0}`) is one stop, between the close button and the body's own controls. Tabbing to a control outside the visible part of the body scrolls it into view (native, honors `scroll-padding-block: 16px`). |
| Esc | Close (Radix `onEscapeKeyDown`); exit animation plays; focus returns to the trigger. Children that handle Esc (Select, Popover) stop propagation first, so one Esc closes one layer. |
| Pointer down on overlay (outside the panel) | Close when `dismissible` (default). With `dismissible={false}`, `onPointerDownOutside` and `onInteractOutside` call `preventDefault()`. |
| Close button, Cancel (`DrawerClose`) | Close; focus returns to trigger. |
| ↑ / ↓ (focus on body region) | Scroll the body by one line. Native; no JS. |
| Page Up / Page Down, Space / Shift + Space (focus on body region) | Scroll the body by one page. Native. |
| Home / End (focus on body region) | Jump to the top / end of the body. Native. |
| Same keys with focus on a control inside the body | Belong to the control (caret, select options). The body scrolls only through scroll-into-view. |
| Wheel, trackpad, touch over the panel | Scroll the body only; the page stays locked (Radix `RemoveScroll`); `overscroll-behavior: contain` stops chaining. |
| Swipe / drag | Nothing. Gesture dismissal is out of scope (Radix has no gesture primitive; hand-rolling it is not allowed). |

Focus order inside the panel (DOM order): close button, body scroll region, body focusables, footer actions (secondary, then primary). The order does not change with `side` or scroll position. Initial focus skips the close button in favor of the first control inside the body (the region itself is not a candidate: the query is for descendants of the body, as in Dialog), so screen readers read title and description first. With no body controls, initial focus is the close button (Radix default); with `hideCloseButton` as well, the first tabbable is the body region, so arrow keys scroll straight away. Esc closes from any of these, including the body region. Without a trigger (controlled `open`), focus returns to the previously focused element.

## Radix

- `Dialog` from `radix-ui` (`import { Dialog } from 'radix-ui'`): `Dialog.Root`, `Dialog.Trigger` (`asChild`), `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`. A drawer is a dialog with a different position and motion; no extra primitive is needed.
- Modal only (`modal` default true): Radix provides the focus trap, scroll lock, `aria-hidden` on outside content, portal, Escape and outside-click dismissal, focus return, and `Presence` (keeps the panel mounted through the exit animation).
- `dismissible={false}` maps to `preventDefault()` in `onPointerDownOutside` / `onInteractOutside` only; Esc still closes.
- `Dialog.Title` and `Dialog.Description` are always rendered (both required), so no `aria-describedby={undefined}` workaround is needed.
- The close button is `Dialog.Close asChild` around a native `<button type="button" aria-label="Close">` with the existing `Icon name="close"` (16 px, stroke 2, `aria-hidden`).
- Builder may share header, close button and footer markup/CSS with `Dialog` internally; the public API stays a separate `Drawer` component.
- Scrolling uses the native body scroll container, not Radix `ScrollArea`: `ScrollArea` draws custom scrollbars (not wanted in the wireframe), and native scrolling already provides keyboard, wheel and touch behavior. Radix `Dialog`'s `RemoveScroll` locks the page and allows scrolling inside `Content`, so no extra config is needed.
- The body region's name: render `<Dialog.Title><span id={titleTextId}>{title}</span></Dialog.Title>` with `const titleTextId = useId()`, and give the body `aria-labelledby={titleTextId}`. Do not pass `id` to `Dialog.Title` itself: that would break Radix's `aria-labelledby` wiring on `Content` and its missing-title check.

## Tokens

| Property | Token |
| --- | --- |
| Overlay color | `color-mix(in srgb, var(--ds-color-ink) 50%, transparent)` (identical to Dialog's overlay) |
| Panel fill | `--ds-color-surface` |
| Panel border (inner edge only) | `--ds-border-width` solid `--ds-color-ink`; `border-left` for right, `border-right` for left, `border-bottom` for top, `border-top` for bottom; none in full mode |
| Panel radius | `--ds-radius-md` |
| Panel shadow | none |
| Panel extent sm / md / lg | 320 / 480 / 640 px, component-local CSS custom properties in `Drawer.css` (same approach as Dialog's local widths; see Token requests) |
| Overlay strip (extent cap) | `--ds-space-12` (`calc(100vw - var(--ds-space-12))`, `calc(100dvh - var(--ds-space-12))`) |
| Header padding | `--ds-space-6` top and sides, 0 bottom |
| Title / description gap | `--ds-space-2` |
| Title | `--ds-font-mono`, weight 500, h3 22 px / `--ds-line-height-xl`, `--ds-color-ink` |
| Description | `--ds-font-text`, body 16 px / `--ds-line-height-lg`, `--ds-color-text-muted` |
| Header gap (text to close) | `--ds-space-4` |
| Body padding | `--ds-space-4` top, `--ds-space-6` sides and bottom |
| Body text | `--ds-font-text`, body 16 px / `--ds-line-height-lg`, `--ds-color-text` |
| Body scroll-padding (scroll-into-view inset) | `--ds-space-4` (`scroll-padding-block`) |
| Header divider (body top border) | `--ds-border-width` solid, `transparent` at scrollTop 0 → `--ds-color-divider` when scrolled |
| Header divider fade range | 0 → `--ds-space-4` of scroll (`animation-range`) |
| Body region focus ring | outline `--ds-focus-width` solid `--ds-color-ink`, offset `calc(var(--ds-focus-width) * -1)` (inset) |
| Body region fill when focused | unchanged, `--ds-color-surface` |
| Footer divider | `--ds-border-width` solid `--ds-color-divider` |
| Footer padding | `--ds-space-4` vertical, `--ds-space-6` horizontal (full mode: bottom `max(var(--ds-space-4), env(safe-area-inset-bottom))`) |
| Footer action gap | `--ds-space-3` |
| Close button size | `--ds-space-8` |
| Close button icon | `--ds-space-4`, 2 px stroke, `currentColor` |
| Close button offset | −`--ds-space-1` top, −`--ds-space-2` right |
| Close button fill / icon | `--ds-color-surface` / `--ds-color-ink` |
| Close button hover fill | `--ds-color-fill` |
| Close button pressed | fill `--ds-color-ink`, icon `--ds-color-primary-contrast` |
| Close button focus | border `--ds-color-ink`; outline `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Footer actions | existing `Button` (primary `--ds-color-primary` / `--ds-color-primary-contrast`, secondary outline `--ds-color-ink`), height `--ds-control-height` |
| Slide and fade duration / easing, hover transitions | `--ds-motion` |

## Accessibility

- `Dialog.Content` has `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → title, `aria-describedby` → description (all from Radix). A drawer is announced as a dialog; that is correct for a modal panel.
- Title and description are required, so every drawer has an accessible name and description. Title renders as `h2`.
- Trigger gets `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` from Radix.
- Close button: native `<button>`, `aria-label="Close"`, icon `aria-hidden`.
- Outside content is hidden from assistive tech while open (Radix `hideOthers`); page scroll is locked.
- Navigation drawers put a `<nav aria-label="…">` inside the body; the drawer does not add landmarks itself.
- Contrast: title black on white 21:1; description gray-600 7:1; body gray-700 10.4:1; inner-edge border black against the dimmed page about 5:1 (≥ 3:1, WCAG 1.4.11); close icon and focus rings 21:1.
- Target size: close button 32 × 32 (WCAG 2.5.8); footer actions 44 px tall, full width under 480 px.
- Focus rings are not clipped: body has 16 / 24 px padding inside its scroll container and header / footer have 24 / 16 px padding, more than the 4 px a ring needs. When a control is scrolled into view, `scroll-padding-block: 16px` keeps its ring off the dividers. The body region's own ring is drawn inset (offset −2 px), so it shows fully at every scroll position.
- Scrollable region (WCAG 2.1.1, axe `scrollable-region-focusable`): the body is always keyboard-reachable: `tabIndex={0}`, `role="region"`, `aria-labelledby` → the title text, so it is announced as "<title>, region" instead of reading out the whole body. This matters most when the body has no controls (terms, previews, photo grids); with controls inside, it is one extra Tab stop. The region is inside the modal, so it does not add a page-level landmark.
- Header divider: gray-200 on white is decorative (it marks a cut, it does not identify a control), so WCAG 1.4.11 does not apply; the same holds for the footer divider in Dialog.
- Motion: slide and fade removed under `prefers-reduced-motion: reduce`. The header divider fade follows scroll position, not time, and stays.
- `jest-axe` should verify no violations for: right md with title, description, body form field and footer; left sm with a `<nav>` body and no footer; top and bottom sm; lg with scrolling body; `hideCloseButton`; a scrolling body with no focusable content (long text) on each side; `hideCloseButton` with a text-only scrolling body.
- jsdom has no layout (`scrollHeight` = `clientHeight` = 0), so axe's `scrollable-region-focusable` cannot fire in Jest. Tests must assert the guarantee directly: the body has `tabindex="0"`, `getByRole('region', { name: <title> })` finds it, and it is the second Tab stop after the close button (first with `hideCloseButton`). The real-browser check is the Storybook a11y addon (`@storybook/addon-a11y`, already installed) on the Scrolling stories below.
- Stories for DS-45: a `Scrolling` story per side (`ScrollingRight`, `ScrollingLeft`, `ScrollingTop`, `ScrollingBottom`), each open by default at `sm` with body content at least 3 × the body height (numbered paragraphs, so the position is obvious), plus `ScrollingNoFooter` (left, nav list) and `ScrollingFullMobile` (mobile viewport). At least one of them has no focusable body content, so the region-focus path is exercised. A play function can Tab to the body and press `End` to show the scrolled-to-end state with the header divider.
- Tests with `userEvent`: Enter on trigger opens and focuses the first body input; with no body focusables, focus lands on the close button; Tab cycles and wraps inside the panel (close button → body region → body controls → actions → close button), Shift + Tab reverses; with `hideCloseButton` and no body controls, the first Tab stop is the body region; Esc closes and focus returns to the trigger; clicking the overlay closes, but not with `dismissible={false}` (Esc still does); close button and `DrawerClose` close and call `onOpenChange(false)`; drawer is named and described (`getByRole('dialog', { name, description })`); `Content` has `data-side` matching `side` for all four values and defaults to `right` / `md`. jsdom fires no `animationend`, so tests that assert unmount after close may need the `prefers-reduced-motion` path or a stub, as with other Presence-based components.

## Token requests

None. The overlay reuses Dialog's `color-mix` of `--ds-color-ink`, and the motion reuses `--ds-motion`. Scrolling needs no new tokens: the header divider is `--ds-border-width` + `--ds-color-divider` (same as the footer divider), scroll-padding and the fade range are `--ds-space-4`, and the inset region ring is `--ds-focus-width` negated with `calc()`. The 320 / 480 / 640 px extents are kept as component-local CSS custom properties in `Drawer.css`, following the Dialog precedent, where the requested `--ds-dialog-width-*` tokens were implemented locally instead of being added to `tokens.css`. If the DS-19 requests for `--ds-color-overlay` or panel size tokens are approved later, Drawer should switch to them along with Dialog.
