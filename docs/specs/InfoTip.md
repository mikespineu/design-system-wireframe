# InfoTip

- task: DS-41
- canvas: docs/design-system-wireframe/InfoTip.dc.html
- canvas_url: https://claude.ai/artifact/YCBKiW7d5SMHrWhnekSH5b
- approved: yes
- approved_by: mikespin
- approved_at: 2026-10-26
- approval_hash:

This spec covers three components. DS-42 builds `Tooltip` and `Popover`. DS-43 builds `InfoTip` on top of them.

- **Tooltip**: a short plain-text label or hint for a focusable trigger. Opens on hover (after a delay) and on keyboard focus. Dark gray-900 panel with white caption text. Built on Radix `Tooltip`.
- **Popover**: a non-modal panel opened by clicking a button. It can hold any content, including fields and buttons. White panel with a 1 px black border, the same look as the Dialog panel. Built on Radix `Popover`.
- **InfoTip**: a borderless info icon button that explains the label or setting next to it in plain text. It renders a **Tooltip** when touch is not the primary input, and a **Popover** when the `(pointer: coarse)` media query matches (touch is the primary input). It switches on that media query only, never on viewport width.

All three use square corners and no shadow. Depth comes from the gray-900 fill (Tooltip) or the black border (Popover), and each has an arrow that points at the trigger.

Proposed API (narrow and typed):

```ts
type Side = 'top' | 'right' | 'bottom' | 'left';
type Align = 'start' | 'center' | 'end';

// src/components/Tooltip/ (DS-42)
interface TooltipProps {
  content: string;                       // plain text only; no elements, no links
  children: ReactElement;                // the trigger, via Tooltip.Trigger asChild; must be focusable
  side?: Side;                           // default 'top'
  align?: Align;                         // default 'center'
  open?: boolean;                        // controlled
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;                    // on Tooltip.Content
}
interface TooltipProviderProps {         // optional, once near the app root
  delayDuration?: number;                // default 400
  skipDelayDuration?: number;            // default 300
  children: ReactNode;
}

// src/components/Popover/ (DS-42)
type PopoverProps = {
  trigger: ReactElement;                 // via Popover.Trigger asChild; must be a <button> (e.g. Button, IconButton)
  children: ReactNode;                   // any content
  side?: Side;                           // default 'bottom'
  align?: Align;                         // default 'center'
  showClose?: boolean;                   // default false; 32 × 32 close button, top right
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;                    // on Popover.Content
} & (
  | { title: ReactNode; 'aria-label'?: never }   // visible heading, names the dialog
  | { title?: never; 'aria-label': string }      // no heading: name it explicitly
);

// src/components/InfoTip/ (DS-43)
interface InfoTipProps {
  label: string;                         // accessible name of the trigger, e.g. "About billing period"; also names the Popover
  content: string;                       // plain, non-interactive text
  side?: Side;                           // default 'top', in both modes
  align?: Align;                         // default 'center'
  size?: 'sm' | 'md';                    // trigger size, default 'md'
  className?: string;                    // on the trigger button
}
```

- `Tooltip`: `ref` and rest props go to `Tooltip.Content`. `Popover`: `ref` and rest props go to `Popover.Content`. `InfoTip`: `ref` and rest props go to the trigger `<button>`.
- **Provider.** `TooltipProvider` wraps Radix `Tooltip.Provider` with the system's delays and sets a context flag. If `Tooltip` finds no flag, it wraps itself in its own `Tooltip.Provider` with the same defaults, so it never throws. Mounting `TooltipProvider` once at the app root (and in the Storybook preview) is still recommended, because the 300 ms skip delay between neighbouring tooltips only works when they share a provider.
- **Text only.** `Tooltip.content` and `InfoTip.content` are typed `string`, so the content cannot contain links, buttons or fields. Tooltip content can never receive focus, so anything interactive in it would be unreachable by keyboard. InfoTip uses the same content in both modes, so it has to follow the stricter Tooltip rule. Anything that needs interaction belongs in a `Popover`.
- No `disabled` prop on any of the three. A disabled trigger cannot receive hover or focus, so its tip could never be reached. Explain why something is disabled in visible text, or put an InfoTip next to the disabled control.

## Sizes

Canvas sections 02, 03, 04 and 08.

**Tooltip** comes in one size.

| Property | Value |
| --- | --- |
| Padding | 4 px vertical, 8 px horizontal |
| Text | caption 13 / 20, Red Hat Text 400, left-aligned |
| Height, one line | 28 px |
| Max width | 240 px (see Token requests). Text wraps; keep it to three lines or fewer |
| Arrow | 12 × 6 px |
| Side offset (trigger edge to arrow tip) | 4 px |

**Popover** comes in one size.

| Property | Value |
| --- | --- |
| Padding | 16 px on all sides |
| Border | 1 px black |
| Width | sized by content, max 320 px (see Token requests), and never wider than the space Radix reports as available |
| Max height | the space Radix reports as available (`--radix-popover-content-available-height`). Beyond that, the content area scrolls |
| Title (optional) | Red Hat Mono 500, 16 / 24, black. 8 px from title to content |
| Close button (optional) | 32 × 32 with a 16 px X, in the top-right corner, nudged −4 px up and −8 px right like the Dialog close button. It comes last in the DOM and is positioned absolutely; the first row (title, or content when there is no title) reserves its width plus a 16 px gap with `padding-inline-end` |
| Body text | body 16 / 26 |
| Arrow | 16 × 8 px. It overlaps the panel border by 1 px, so the border appears to open where the arrow joins |
| Side offset (trigger edge to arrow tip) | 4 px |

Layout: `Popover.Content` is a flex column with `max-height` set to the available height. The title (when present) does not shrink. A body wrapper (`flex: 1 1 auto; min-height: 0; overflow-y: auto`) holds `children`. The content itself never scrolls, because the arrow sits outside the panel and a scrolling content element would clip it.

**InfoTip trigger** comes in two sizes. The panels are the Tooltip and Popover above, unchanged.

| Size | Button | Icon (`info`) | Hit area on `(pointer: coarse)` | Use |
| --- | --- | --- | --- | --- |
| `sm` | 24 × 24 | 16 px, stroke 2 | 44 × 44 (pseudo-element, inset −10 px) | inline in caption or label text, 4 px after the text |
| `md` (default) | 32 × 32 | 18 px, stroke 1.5 (same as `IconButton`) | 44 × 44 (pseudo-element, inset −6 px) | after a field label (4 px gap), in a SegmentedControl / TileGroup help slot (8 px after the control) |

- On coarse pointers the larger hit area is an invisible `::after` with `position: absolute`. It does not change the visible size or the layout. This is plain CSS (`@media (pointer: coarse)`), separate from the JavaScript mode switch. Keep 8 px clear of other targets around an `sm` trigger.
- The trigger is centred vertically on the text line or control it follows.

## States

### Tooltip

Canvas section 03.

| State | Trigger | Panel | Arrow | Notes |
| --- | --- | --- | --- | --- |
| Closed | `data-state="closed"` | not rendered (nothing portaled) | — | trigger has no `aria-describedby` |
| Hover, waiting | pointer on trigger, under 400 ms | not rendered | — | the trigger shows its own hover; leaving now cancels the open |
| Open by hover | `data-state="delayed-open"` | gray-900 fill, white text, fades in over 120 ms | gray-900, points at trigger centre | trigger gets `aria-describedby` |
| Open, instantly | `data-state="instant-open"` | same | same | after keyboard focus, or when the pointer moves from one tooltip trigger to another within 300 ms |
| Side top / right / bottom / left | `[data-side]` on the content | placed on that side | on the facing edge, pointing at trigger | `data-side` is the side used after collision handling |
| Flipped | requested side does not fit | opposite side | follows `data-side` | see Radix: collisions |
| Shifted | not enough room along the side | slides to stay 8 px inside the viewport | stays on the trigger centre, at least 8 px from the panel corners | Radix hides the arrow if it cannot point at the trigger |
| Long text | content wider than 240 px | wraps, max width 240 px | unchanged | |
| Detached | trigger scrolled out of view | hidden (`hideWhenDetached`) | hidden | |

- The trigger keeps its own styles. Tooltip does not restyle it, so an `IconButton` still shows its hover and focus ring. The tip sits 4 px from the trigger, which clears the 2 px focus ring at 2 px offset.

### Popover

Canvas section 04.

| State | Trigger | Panel | Arrow | Notes |
| --- | --- | --- | --- | --- |
| Closed | `data-state="closed"`, `aria-expanded="false"` | not rendered | — | Popover does not restyle the trigger (Button, IconButton keep their own look) |
| Open | `data-state="open"`, `aria-expanded="true"` | white fill, 1 px black border, fades in over 120 ms | white with black edges | focus moves inside (see Keyboard) |
| Open, focus on content | an element inside has `:focus-visible` | unchanged | unchanged | the focused element shows its own ring |
| Open, text only | nothing focusable inside | the panel itself is focused | unchanged | no outline on the panel (`outline: none`); the black border already marks it |
| Open with title and close | `title`, `showClose` | title on the left, close button in the top-right corner | unchanged | |
| Close · default / hover / focus-visible / pressed | close button | as Dialog close: white fill, transparent border / gray-100 fill / black border + 2 px black ring, 2 px offset / black fill, white icon | | |
| Side top / right / bottom / left | `[data-side]` | placed on that side | on the facing edge | |
| Flipped | requested side does not fit | opposite side | follows `data-side` | |
| Height-limited | content taller than the available height | `max-height` equals the available height; the body scrolls | unchanged | |

### InfoTip trigger

Canvas section 02. These states are the same in both modes. The "open" state matches either mode's `data-state` value.

| State | Selector | Fill | Border | Icon | Notes |
| --- | --- | --- | --- | --- | --- |
| Default | none | transparent | 1 px transparent | gray-600 | `cursor: pointer` |
| Hover | `:hover` inside `@media (hover: hover)` | gray-100 | transparent | black | transition `--ds-motion`. Never applied on touch, so a tap doesn't leave a stuck hover |
| Focus-visible | `:focus-visible` | unchanged | unchanged | black | 2 px black outline, 2 px offset |
| Open | `[data-state="delayed-open"]`, `[data-state="instant-open"]` (Tooltip mode), `[data-state="open"]` (Popover mode) | gray-100 | 1 px black | black | links the trigger to the open panel |
| Pressed | `:active` | black | black | white | |

### InfoTip modes

Canvas section 01.

| Mode | When | Renders | Panel look |
| --- | --- | --- | --- |
| Non-touch (Tooltip) | `matchMedia('(pointer: coarse)').matches === false` | `Tooltip` around the trigger | Tooltip: gray-900, caption 13/20, max 240 px |
| Touch (Popover) | `matchMedia('(pointer: coarse)').matches === true` | `Popover` around the trigger, `aria-label={label}`, no title, no close button | Popover: white, black border, body 16/26, max 320 px |
| Before hydration | server render, and the first client render while hydrating | Tooltip mode, closed | nothing portaled |

- **Switching** depends on `(pointer: coarse)` only. DS-43 adds a `useMediaQuery(query, { defaultValue })` hook built on `useSyncExternalStore`. Its subscribe adds a `change` listener on `window.matchMedia(query)`, its snapshot is `.matches`, and its server snapshot is `defaultValue` (here `false`). InfoTip must not read `innerWidth`, width or height media queries, container queries, user-agent strings or `'ontouchstart' in window`. The canvas shows a 1366 px touch tablet getting the Popover and a 360 px desktop window getting the Tooltip.
- **Before hydration** the server can't know the input type, so it renders Tooltip mode, closed. Neither Radix primitive portals anything while closed, and the trigger `<button>` is the same element with the same class, size, icon and `aria-label` in both modes. So when a touch device switches to Popover right after hydration, there is no layout shift and no hydration mismatch. Only the ARIA attributes Radix adds differ (`aria-haspopup`, `aria-expanded` and `aria-controls` in Popover mode). Taps before hydration do nothing, like any other button before hydration. In a client-only render the hook returns the real value on the first render, so there is no switch.
- **Live switch.** When the media query changes while mounted (a tablet docked to a keyboard and trackpad, devtools emulation), InfoTip re-renders in the other mode. An open tip closes. If the trigger had focus, InfoTip moves focus to the new trigger element after the switch, so focus is never lost.
- **Hybrid devices.** On a touchscreen laptop the primary pointer is fine, so InfoTip is a Tooltip. A tap focuses the trigger (focus opens the tip), and the tap behaviour below keeps it open. This is a known limit of keying on the primary pointer. It is what the task asks for, so `(any-pointer: coarse)` is deliberately not used.
- **Click in Tooltip mode.** On a plain Tooltip, Radix closes the tip when the trigger is pressed or clicked. That suits action buttons, but on an info button a click should show the text. In Tooltip mode, InfoTip controls `open`, and a pointer press, click, Enter or Space on the trigger opens the tip at once (no delay) and keeps it open. Radix composes its close-on-`pointerdown` and close-on-`click` handlers behind the consumer's handlers and skips them when `event.defaultPrevented`, so InfoTip calls `preventDefault()` in its own trigger handlers. Pointer leave, blur, Esc and an outside click still close it.

### Motion (all three)

- Panels fade in on `[data-state="open"]` / `[data-state="delayed-open"]` / `[data-state="instant-open"]` and fade out on `[data-state="closed"]`. Opacity only, over `--ds-motion`, with no slide or scale. Use CSS `@keyframes` animations, not transitions: Radix `Presence` waits for `animationend` before it unmounts, so the fade-out only plays with an animation.
- Under `prefers-reduced-motion: reduce` there is no animation and the panel appears and disappears at once.
- All visual state comes from Radix attributes (`[data-state]`, `[data-side]`, `[data-align]`) and pseudo-classes, never from JavaScript state. The only exception is InfoTip's mode, which decides which component renders. DS-43 also sets `data-mode="tooltip" | "popover"` on the trigger for tests and debugging; nothing in the CSS keys on it.

## Keyboard

### Tooltip

| Key / input | Action |
| --- | --- |
| Tab to the trigger | Opens at once (`instant-open`, no delay). |
| Shift + Tab / Tab away | Blur closes the tip. |
| Esc | Closes. Focus stays on the trigger. It does not reopen until focus or hover leaves and comes back. Inside a Popover or Dialog, Esc closes only the tooltip (Radix layers each handle one Esc). |
| Enter / Space on the trigger | Runs the trigger's own action. Radix closes the tip on click. |
| Pointer rests on the trigger | Opens after 400 ms (`delayed-open`). |
| Pointer moves to another tooltip trigger within 300 ms of a tip closing | Opens at once (`instant-open`), if both share a `TooltipProvider`. |
| Pointer leaves the trigger | Closes at once, unless the pointer moves onto the tip (hoverable content, WCAG 1.4.13). |

Tooltip adds no tab stop and is never focusable. Focus order is the page's own order.

### Popover

| Key / input | Action |
| --- | --- |
| Enter / Space / click on the trigger | Toggles open and closed. On open, focus moves to the first focusable element inside, or to the panel itself (`tabindex="-1"`) when nothing inside is focusable (Radix `onOpenAutoFocus` default). |
| Tab / Shift + Tab while open | Moves through focusable elements inside the panel and wraps from last to first and back (Radix `FocusScope loop`; non-modal, so there is no trap against pointer focus). With nothing focusable inside, focus stays on the panel. |
| Esc | Closes. Focus returns to the trigger. In a Dialog, the first Esc closes the Popover and the next one closes the Dialog. |
| Click / tap outside | Closes. Focus is not pulled back to the trigger, because the click may have focused something else (Radix default). |
| Close button / `Popover.Close` | Closes. Focus returns to the trigger. |

Focus order inside the panel follows the DOM: the content's focusable elements, then the close button (when present). The close button comes last in the DOM, so initial focus (`onOpenAutoFocus`, the first tabbable) lands on the content. It lands on the close button only when the content has nothing focusable, and screen readers read the title and text before reaching the button. On close, focus returns to the trigger unless an outside click moved it.

### InfoTip

| Key / input | Tooltip mode (non-touch) | Popover mode (touch) |
| --- | --- | --- |
| Tab to the trigger | Opens at once | Focus ring only; stays closed |
| Enter / Space | Opens at once and keeps it open | Toggles; on open, focus moves to the panel (it has no focusables) |
| Esc | Closes; focus stays on the trigger | Closes; focus returns to the trigger |
| Tab away | Closes | (focus is on the panel) Tab stays on the panel; Esc or a tap outside closes |
| Pointer hover | Opens after 400 ms | none (no hover on touch) |
| Tap / click | Opens at once and keeps it open | Toggles |
| Tap / click outside | Closes | Closes |

The trigger is one tab stop in page order.

## Radix

- `Tooltip` from `radix-ui` (`import { Tooltip } from 'radix-ui'`): `Tooltip.Provider`, `Tooltip.Root`, `Tooltip.Trigger` (`asChild`), `Tooltip.Portal`, `Tooltip.Content`, `Tooltip.Arrow`.
  - Provider: `delayDuration={400}` (Radix default 700, too slow for icon toolbars), `skipDelayDuration={300}`, `disableHoverableContent={false}`.
  - Content: `side` (default `top`), `align` (default `center`), `sideOffset={4}`, `collisionPadding={8}`, `arrowPadding={8}`, `avoidCollisions` (default true), `sticky="partial"`, `hideWhenDetached`.
  - Arrow: `width={12} height={6}`, filled with the panel colour.
- `Popover` from `radix-ui` (`import { Popover } from 'radix-ui'`): `Popover.Root` (`modal={false}`, the default), `Popover.Trigger` (`asChild`), `Popover.Portal`, `Popover.Content`, `Popover.Arrow` (`asChild`), `Popover.Close` (`asChild`).
  - Content: `side` (default `bottom`), `align` (default `center`), `sideOffset={4}`, `collisionPadding={8}`, `arrowPadding={8}`, `avoidCollisions`, `sticky="partial"`, `hideWhenDetached={false}`. Hiding a panel while focus is inside it would hide the focused element.
  - Arrow: `Popover.Arrow asChild` around our own 16 × 8 SVG. It is a white-filled triangle with a 1 px black stroke on its two sloped edges only, shifted 1 px toward the panel (`translateY(-1px)` on the SVG; Radix rotates the arrow wrapper for each side, so one rule covers all four). Radix's default arrow is a single filled polygon and can't draw the border.
  - Close: `Popover.Close asChild` around a native `<button type="button" aria-label="Close">`, styled like the Dialog close button.
  - The dialog name comes from `aria-labelledby` (pointing at the title) when `title` is set, otherwise from `aria-label`. The type requires one of the two.
- **Delays.** Tooltip opens after 400 ms of hover, at once on focus, and at once when moving between triggers within 300 ms. It closes at once on leave, with Radix's grace area so the pointer can travel onto the tip. Popover has no delays.
- **Collision handling** is Radix Popper (Floating UI) for both. If the requested side lacks room, the panel flips to the opposite side (`avoidCollisions`). It also shifts along its side to stay 8 px (`collisionPadding`) inside the viewport (`sticky="partial"`). The arrow keeps pointing at the trigger, at least 8 px from the panel corners (`arrowPadding`), and Radix hides it when it can't. Styles key on the side Radix actually used (`[data-side]`), not on the requested side. Width and height are capped with `--radix-tooltip-content-available-width`, `--radix-popover-content-available-width` and `--radix-popover-content-available-height`, combined with `min()` against the max widths.
- **Portal layering.**
  - Both portal to `document.body` (`Tooltip.Portal`, `Popover.Portal`), so they escape `overflow: hidden` and stacking contexts.
  - Fixed layer order: page, then Dialog overlay (50) and panel (51), then Popover (60), then Tooltip (70). These are `z-index` values on `.ds-popover` / `.ds-tooltip`. Radix copies the content's computed `z-index` onto its positioning wrapper. See Token requests.
  - A Popover inside a modal Dialog works: Radix `DismissableLayer` keeps the nested layer interactive above the Dialog, and one Esc closes one layer.
  - Theme: portaled content must carry the nearest `data-theme`, following the portal rule in `docs/specs/Theming.md`.
- **InfoTip** composes the DS-42 `Tooltip` and `Popover` components, not raw Radix parts. It renders one or the other, never both, around the same trigger markup.

## Tokens

| Property | Token |
| --- | --- |
| Tooltip fill, Tooltip arrow fill | `--ds-color-inverse` |
| Tooltip text | `--ds-color-primary-contrast`, `--ds-font-text` 400, 13 px / `--ds-line-height-sm` |
| Tooltip padding | `--ds-space-1` vertical, `--ds-space-2` horizontal |
| Tooltip max width | 240 px (see Token requests), capped by `--radix-tooltip-content-available-width` |
| Tooltip / Popover radius | `--ds-radius-md` |
| Tooltip / Popover shadow | none |
| Tooltip arrow | 12 × 6 px (Radix `width` / `height` props; 12 = `--ds-space-3`) |
| Side offset | 4 px = `--ds-space-1` (Radix `sideOffset` is a number) |
| Collision padding, arrow padding | 8 px = `--ds-space-2` |
| Popover fill, Popover arrow fill | `--ds-color-surface` |
| Popover border, Popover arrow edges | `--ds-border-width` solid `--ds-color-ink` |
| Popover padding | `--ds-space-4` |
| Popover max width | 320 px (see Token requests), capped by `--radix-popover-content-available-width` |
| Popover max height | `--radix-popover-content-available-height` |
| Popover arrow | 16 × 8 px (`--ds-space-4` × `--ds-space-2`), overlap `--ds-border-width` |
| Popover body text | `--ds-font-text` 400, 16 px / `--ds-line-height-lg`, `--ds-color-text` |
| Popover title | `--ds-font-mono` 500, 16 px / `--ds-line-height-md`, `--ds-color-ink` |
| Popover title to body gap | `--ds-space-2` |
| Popover first-row reserve for the close button | `--ds-space-8` + `--ds-space-4` (`padding-inline-end`) |
| Popover close button | as Dialog close: size `--ds-space-8`, icon `--ds-space-4`; fill `--ds-color-surface`, icon `--ds-color-ink`; hover fill `--ds-color-fill`; pressed fill `--ds-color-ink`, icon `--ds-color-primary-contrast`; offset −`--ds-space-1` top, −`--ds-space-2` right |
| InfoTip trigger size md / sm | `--ds-space-8` / `--ds-space-6` |
| InfoTip trigger icon | `Icon name="info"`, size 18 / 16 (`--ds-space-4` for sm), `currentColor` |
| InfoTip trigger icon colour, default | `--ds-color-text-muted` |
| InfoTip trigger icon colour, hover / focus / open | `--ds-color-ink` |
| InfoTip trigger border | `--ds-border-width` solid transparent; open: `--ds-color-ink` |
| InfoTip trigger fill, hover and open | `--ds-color-fill` |
| InfoTip trigger pressed | fill and border `--ds-color-ink`, icon `--ds-color-primary-contrast` |
| InfoTip coarse hit area | `--ds-control-height` square; inset `calc((var(--ds-space-8) - var(--ds-control-height)) / 2)` md, `calc((var(--ds-space-6) - var(--ds-control-height)) / 2)` sm |
| InfoTip gap after label text | `--ds-space-1`; after a control (help slot) `--ds-space-2` |
| Focus ring (trigger, close, content focusables) | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Fade in / out, hover transitions | `--ds-motion` |
| Popover z-index / Tooltip z-index | 60 / 70 (see Token requests) |

## Accessibility

- **Tooltip**
  - Radix renders the content and a visually hidden copy with `role="tooltip"`. While the tip is open, the trigger has `aria-describedby` pointing at it; while closed, it has none.
  - The tooltip is a description, not a name. Icon-only triggers still need their own `aria-label`, and the tooltip may repeat it ("Add photo").
  - It meets WCAG 1.4.13: dismissible with Esc without moving focus, hoverable (`disableHoverableContent={false}`), and it stays open until the pointer or focus leaves.
  - It opens on keyboard focus, so keyboard and screen reader users get the same information as mouse users.
- **Popover**
  - `Popover.Content` has `role="dialog"`, named by the title (`aria-labelledby`) or by `aria-label`.
  - The trigger gets `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls` (Radix).
  - The popover is non-modal, so the page is not `aria-hidden`.
  - The close button is a native button with `aria-label="Close"`; its icon is `aria-hidden`.
- **InfoTip**
  - The trigger is a native `<button type="button">` with `aria-label={label}` (required). The icon is `aria-hidden`. The name always comes from `label`, never from the content.
  - Tooltip mode is described as above.
  - Popover mode: `role="dialog"` with `aria-label={label}`. Focus moves to the panel on open, so VoiceOver and TalkBack read the text straight away. Esc, a second tap on the trigger, or a tap outside closes it.
  - The content is plain text in both modes, so there is never a focusable element that is unreachable in Tooltip mode.
  - `label` should name the topic ("About billing period"), not just "Info", so several InfoTips on one page stay distinct.
- **Contrast**
  - Tooltip: white on gray-900 is 18.4:1.
  - Popover: body gray-700 on white is 10.4:1, title black is 21:1, and the black border against the page is 21:1.
  - InfoTip trigger: the gray-600 icon on white is 7:1, which passes the 3:1 non-text minimum (WCAG 1.4.11). The black icon on the gray-100 hover fill is 18.1:1, and the white icon on the black pressed fill is 21:1.
  - Focus rings: 21:1.
- **Target size:** `sm` is 24 × 24 and `md` is 32 × 32, both meeting WCAG 2.5.8. On coarse pointers both grow to 44 × 44. The Popover close button is 32 × 32.
- **Motion:** opacity fade only, removed under `prefers-reduced-motion`.
- **`jest-axe`** should find no violations for:
  - Tooltip closed, and open (`defaultOpen`) on an `IconButton`.
  - Popover open with `title` and `showClose`; open with `aria-label` and only text; open with a focusable button inside.
  - InfoTip `md` and `sm`, closed and open, in Tooltip mode (`matchMedia` stub returns `false`) and in Popover mode (stub returns `true` for `(pointer: coarse)`).
- **`userEvent` tests**
  - **Tooltip:**
    - Tab to the trigger opens it and sets `aria-describedby`; `getByRole('tooltip')` has the text.
    - Esc closes it and focus stays on the trigger.
    - Hover opens it after the delay (fake timers: not at 399 ms, open at 400 ms).
    - Unhover closes it.
  - **Popover:**
    - Click and Enter on the trigger open it.
    - Focus lands on the first focusable inside, or on the panel when there is none.
    - Tab wraps inside.
    - Esc closes it and returns focus to the trigger.
    - An outside click closes it.
    - The close button closes it and calls `onOpenChange(false)`.
    - `getByRole('dialog', { name })` works with both `title` and `aria-label`.
  - **InfoTip:**
    - With `(pointer: coarse)` false: renders a Tooltip; focus and hover open it; a click keeps it open.
    - With true: renders a Popover; a click opens it; the dialog is named by `label`; Esc returns focus.
    - A `change` event on the media query switches the mode live and closes an open tip.
    - Mocking a narrow viewport (`innerWidth = 320`) or a `(max-width: …)` query has no effect.
    - The server render (`renderToString`) produces the Tooltip-mode trigger with no portal content.
  - The `matchMedia` stub in `jest.setup.ts` / `src/test/dom-stubs` already returns `matches: false`. Tests override it per query, as `SegmentedControl.test.tsx` does.

## Token requests

- `--ds-z-popover: 60` and `--ds-z-tooltip: 70`: layer order for portaled floating content. No z-index tokens exist, and `Dialog.css` hardcodes 50 / 51. A shared scale keeps Popover above Dialog and Tooltip above everything, and future Select / DropdownMenu can reuse `--ds-z-popover`. If declined, the builder defines them as component-local constants in `Popover.css` / `Tooltip.css` with a comment pointing at `Dialog.css`, as Dialog did with its widths. Optional: `--ds-z-overlay: 50` so `Dialog.css` can use the same scale (a separate change, not part of DS-42).
- `--ds-tooltip-max-width: 240px` and `--ds-popover-max-width: 320px`: panel max widths. The space scale stops at 96 px. If declined, they become component-local custom properties, as Dialog widths did (`calc()` from space tokens works, e.g. `calc(var(--ds-space-16) * 5)`, but it is hard to read).
