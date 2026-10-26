# Toast

- task: DS-39
- canvas: docs/design-system-wireframe/Toast.dc.html
- canvas_url: https://claude.ai/artifact/BRwvxit3ikx6FCkdJYe2Ki
- approved: no
- approved_by:
- approved_at:
- approval_hash:

A toast is a short, non-modal message. It appears in a fixed region at the bottom of the screen and leaves on its own. It is built on Radix `Toast`. There are three severities: info, success and error. Each toast has a required title, an optional description, at most one optional action (for example Undo or Retry, rendered with the existing secondary `Button`) and a close button that is always shown. Corners are square and there is no shadow. The border separates the toast from the page, the same way the Dialog panel is separated. Severity is shown by fill (none or tinted), border weight (1 or 2 px), icon shape (circle, tick, triangle) and title weight, so it never depends on hue alone (canvas section 10).

This replaces the black "Frame moved to Archive · Undo" snackbar sketch in `Components.dc.html` section 05. That sketch used an inverse fill. Its ring and buttons would need white variants that no other component has.

Proposed API (for the builder, DS-40; narrow and typed):

```ts
type ToastSeverity = 'info' | 'success' | 'error';

interface ToastAction {
  label: string;            // visible Button text, e.g. 'Undo'
  altText: string;          // Radix Toast.Action altText: how to do this without the toast
  onClick: () => void;      // runs, then the toast closes
}

interface ToastOptions {
  severity?: ToastSeverity; // default 'info'
  title: ReactNode;         // required, Toast.Title
  description?: ReactNode;  // Toast.Description
  action?: ToastAction;     // at most one
  duration?: number;        // ms; default from the Timing table; Infinity = stays until closed
}

interface ToastProviderProps {
  children: ReactNode;
  label?: string;           // Radix Provider label, announcement prefix; default 'Notification'
}

interface ToasterProps {    // renders Toast.Viewport plus the current toasts; one per app
  className?: string;       // on Toast.Viewport
}

function useToast(): {
  toast: (options: ToastOptions) => string;                  // returns the toast id
  update: (id: string, options: Partial<ToastOptions>) => void;
  dismiss: (id?: string) => void;                            // one toast, or all of them
};
```

- `ToastProvider` wraps `Toast.Provider` and holds the toast list in React context. `Toaster` must be rendered inside it, once, at app root level after the page content.
- `ref` and rest props of `Toaster` go to `Toast.Viewport`.
- **Limit.** At most 3 toasts are visible. Calling `toast()` when 3 are open closes the oldest one with its normal exit motion. There is no queue.
- **Update.** `update()` changes the content in place. It does not replay the enter motion, the change is not announced again, and the timer restarts with the full duration of the resulting options. If `severity` changes, the toast is replaced instead (new key in the same slot). The replacement is announced with the new politeness and plays the enter motion. This lets a pending info toast turn into an error.
- **Action.** The action runs `onClick` and then closes the toast (Radix `Toast.Action` closes on click).

## Sizes

There is one size. Canvas sections 01, 02 and 06.

| Property | Desktop (≥ 480 px) | Mobile (< 480 px) |
| --- | --- | --- |
| Toast width | 384 px (`4 × --ds-space-24`), max `100vw − 2 × 24 px` | viewport width − 2 × 16 px |
| Viewport position | `fixed`, right 24, bottom 24 | `fixed`, left 16, right 16, bottom `16 px + env(safe-area-inset-bottom)` |
| Stack gap | 8 px | 8 px |
| Max visible | 3 | 3 |
| Swipe direction | right | right |

- The breakpoint is `max-width: 479px`, the same as the Dialog footer. Placement is decided by the media query in CSS only, with no JS.
- Toast layout: a flex row aligned to the top, with gap 12. Padding is 16 on 1 px toasts and 15 on the 2 px error toast, so the content lines up across a stack. The parts are icon (20 px, `flex: none`), a content column (flex 1, `min-width: 0`) and the close button.
- Content column: title, then description 4 px below it, then the action 12 px below that (4 px gap + 8 px top padding on the action row). The action is left-aligned with the title.
- Close button: 32 × 32. The right margin is −8 px so the X icon lines up with the right padding edge. The top and bottom margins are −6 px (`(32 − 20) / 2`, computed) so the button is centred on the 20 px title line without making the row taller.
- Heights: a title-only toast is 52 px (16 + 20 + 16). With a description it is 76 px. With a description and an action it is 132 px. Text wraps and is never truncated. Keep descriptions to 2 lines; longer content belongs in an `Alert` or a `Dialog`.
- Stack (canvas section 05): a plain column with no overlap, no scaling and no collapsing, because the system has no shadows to separate overlapping cards. DOM order is oldest to newest, so the newest toast sits at the bottom, nearest the screen edge.
- Layering: the viewport uses `z-index: 60`, a component-local constant above Dialog's overlay (50) and panel (51). A toast raised from inside a modal dialog stays visible and clickable: the viewport is a Radix `DismissableLayer.Branch`.

## States

Canvas sections 01 (severities), 03 (states), 04 (swipe), 05 (stack) and 07 (motion).

Severity (the base look of each toast):

| Severity | Border | Fill | Icon | Title | Description |
| --- | --- | --- | --- | --- | --- |
| info | 1 px ink | surface (white) | circle-i, 1.5 stroke, info fg | mono 14/20, weight 500, info fg | text (gray-700) |
| success | 1 px success fg | success bg | tick (`check`), 1.75 stroke, success fg | mono 14/20, weight 500, success fg, hidden "Success: " prefix | text (gray-700) |
| error | 2 px error fg | error bg | triangle (`warning`), 1.75 stroke, error fg | mono 14/20, weight 700, error fg, hidden "Error: " prefix | text-strong (gray-800) |

- Icons come from the existing `Icon` set (`info`, `check`, `warning`) and are the same as in `Alert`. Each severity has a different silhouette.
- The 1 px info border is ink, not `--ds-color-info-border` (gray-300). A floating layer over arbitrary page content needs a boundary of at least 3:1. Success and error use their fg colour for the border for the same reason (their `-border` tints are below 3:1 on white).

Toast states:

| State | Trigger | Border | Fill | Text / icon | Other |
| --- | --- | --- | --- | --- | --- |
| Entering | `[data-state="open"]` on mount | as severity | as severity | as severity | keyframes: opacity 0 → 1, `translateX(16px)` → 0, `--ds-motion` |
| Open, idle | `[data-state="open"]` | as severity | as severity | as severity | timer runs |
| Open, hover | pointer over the viewport | unchanged | unchanged | unchanged | no visual change. **All** timers pause and resume with the time left (Radix) |
| Toast focus-visible | `Toast.Root:focus-visible` | unchanged | unchanged | unchanged | 2 px ink outline, 2 px offset (outside the border). Timers paused |
| Viewport focus-visible | `Toast.Viewport:focus-visible` (after F8) | — | — | — | 2 px ink outline, 2 px offset, around the whole stack. Timers paused |
| Title only | no `description` | unchanged | unchanged | title row only | 52 px tall |
| Swipe start / move | `[data-swipe="start"]`, `[data-swipe="move"]` | unchanged | unchanged | unchanged | `transform: translateX(var(--radix-toast-swipe-move-x))`, no transition, no fade |
| Swipe cancel | `[data-swipe="cancel"]` (released before 50 px) | unchanged | unchanged | unchanged | back to `translateX(0)`, `transition: transform --ds-motion` |
| Swipe end | `[data-swipe="end"]` (released past 50 px) | unchanged | unchanged | unchanged | keyframes from `translateX(var(--radix-toast-swipe-end-x))` to `translateX(100%)`, opacity → 0, `--ds-motion`; then closed |
| Exiting | `[data-state="closed"]` | as severity | as severity | as severity | keyframes: opacity 1 → 0, 0 → `translateX(16px)`, `--ds-motion`. Then unmounted |
| Closed | unmounted | — | — | — | the toasts above move down at once (no height animation) |

Part states:

| Part · state | Trigger | Border | Fill | Icon / text |
| --- | --- | --- | --- | --- |
| Close · default | none | 1 px transparent | transparent (shows the toast fill) | ink X |
| Close · hover | `:hover` | 1 px ink | surface (white) | ink X |
| Close · focus-visible | `:focus-visible` | 1 px ink | unchanged | ink X, plus a 2 px ink outline at 2 px offset |
| Close · pressed | `:active` | 1 px ink | ink | primary-contrast (white) X |
| Action · default / hover / focus-visible | `Button` secondary | as `Button`: 1 px ink | surface; hover fill | ink; focus outline 2 px ink, 2 px offset |

- The close button's hover is a white fill plus an ink border, not Dialog's gray-100 fill. gray-100 is almost the same as the tinted success and error fills, so that hover would be invisible on them.
- Motion: all animations are CSS `@keyframes` lasting `--ds-motion` (120 ms). They are not transitions: Radix `Presence` waits for `animationend` before unmounting, and a transition would cut the exit short. The only transitions are swipe cancel and the hover colour changes.
- `prefers-reduced-motion: reduce` sets `animation: none` on enter, exit and swipe end, and `transition: none` on swipe cancel and hovers. Toasts then appear and disappear at once. During swipe move the toast still follows the pointer, because the movement is driven by the user.
- Every visual state comes from `[data-state]`, `[data-swipe]`, `[data-swipe-direction]`, a `data-severity` attribute on the root, and pseudo-classes. There is no JS visual state.

## Keyboard

Canvas section 08.

| Key / input | Action |
| --- | --- |
| F8 | Moves focus to the viewport region from anywhere on the page (Radix `Toast.Viewport` `hotkey={['F8']}`, the default). On macOS this may be fn + F8. |
| Tab (in the region) | Moves through the toasts **newest first**. For each toast the order is toast root (`tabindex="0"`), then action, then close. Radix sorts these. After the last one, focus leaves the region and continues in page order (Radix focus proxies). |
| Shift + Tab | The same, in reverse. |
| Enter / Space on the action | Runs `onClick` and closes the toast. |
| Enter / Space on close | Closes the toast. |
| Esc | With focus in a toast (the root or its buttons), closes that toast (Radix `onEscapeKeyDown`). |
| Pointer / touch drag right | Swipe to dismiss once the drag passes 50 px (`swipeThreshold`, Radix default). Shorter drags snap back. |
| Pointer over the viewport | Pauses every timer. Leaving resumes them with the time left. |

- Toasts never take focus on their own, so showing one never interrupts typing.
- When a focused toast closes (action, close, Esc), Radix moves focus to the viewport, never to `<body>`. Timers stay paused until focus leaves the region.
- Pausing: Radix pauses all toasts while the pointer is over the viewport, while focus is inside it, and while the window is blurred. It resumes them with the time left. This, F8 and the action's `altText` cover WCAG 2.2.1 (Timing Adjustable).

## Radix

- `Toast` from `radix-ui` (`import { Toast } from 'radix-ui'`): `Toast.Provider`, `Toast.Viewport`, `Toast.Root`, `Toast.Title`, `Toast.Description`, `Toast.Action`, `Toast.Close`.
- `Toast.Provider`: `swipeDirection="right"`, `swipeThreshold={50}` (default), `label="Notification"` (default, overridable by `ToastProviderProps.label`). The durations come from the per-toast values in the Timing table below, not from the provider default.
- `Toast.Viewport`: keep the default `hotkey={['F8']}` and the default `label` "Notifications ({hotkey})", which gives the region the name "Notifications (F8)". It renders an `ol` inside a `role="region"` landmark.
- `Toast.Root`: `type` comes from severity (see Accessibility), `duration` comes from the Timing table or `ToastOptions.duration`, and `open` / `onOpenChange` are controlled by the provider state so that `dismiss()` and the 3-toast limit can close a toast. Styling uses `data-state`, `data-swipe`, `data-swipe-direction` and the CSS variables `--radix-toast-swipe-move-x` / `--radix-toast-swipe-end-x`.
- `Toast.Action asChild` wraps `<Button variant="secondary">`. `altText` is required: Radix uses it as the screen-reader alternative.
- `Toast.Close asChild` wraps a native `<button type="button" aria-label="Close">` with the 16 px `close` `Icon` (`aria-hidden`).
- Hidden severity prefix: `VisuallyHidden` from `radix-ui` (or the Tailwind `sr-only` utility) inside `Toast.Title`.

Timing:

| Severity | No action | With action |
| --- | --- | --- |
| info | 5000 ms | 8000 ms |
| success | 5000 ms | 8000 ms |
| error | `Infinity` (stays until closed) | `Infinity` |

- `ToastOptions.duration` overrides these values. Do not set it below 5000 ms. An action needs extra time to be reached, so action toasts get 8000 ms. Errors stay because the user has to read them and often act on them.

## Tokens

| Property | Token |
| --- | --- |
| Toast width (desktop) | `calc(var(--ds-space-24) * 4)` = 384 px |
| Viewport inset desktop | `--ds-space-6` (right, bottom) |
| Viewport inset mobile | `--ds-space-4` (left, right); bottom `calc(var(--ds-space-4) + env(safe-area-inset-bottom))` |
| Stack gap | `--ds-space-2` |
| Toast padding | `--ds-space-4`; error `calc(var(--ds-space-4) - (var(--ds-border-width-strong) - var(--ds-border-width)))` |
| Icon to content, content to close gap | `--ds-space-3` |
| Title to description gap | `--ds-space-1` |
| Action row top padding | `--ds-space-2` (plus the `--ds-space-1` gap = 12 px) |
| Radius | `--ds-radius-md` |
| Shadow | none |
| Border width info / success | `--ds-border-width` |
| Border width error | `--ds-border-width-strong` |
| Border colour info / success / error | `--ds-color-ink` / `--ds-color-success` / `--ds-color-error` |
| Fill info / success / error | `--ds-color-surface` / `--ds-color-success-bg` / `--ds-color-error-bg` |
| Icon and title colour info / success / error | `--ds-color-info` / `--ds-color-success` / `--ds-color-error` |
| Icon size | 20 px (`Icon size={20}`, as `Alert`) |
| Title | `--ds-font-mono`, 14 px / `--ds-line-height-sm`, weight 500 (error 700) |
| Description | `--ds-font-text`, 14 px / `--ds-line-height-sm`, `--ds-color-text` (error `--ds-color-text-strong`) |
| Action | `Button variant="secondary"`, height `--ds-control-height` |
| Close button size | `--ds-space-8` |
| Close button margin | vertical `calc((var(--ds-space-8) - var(--ds-line-height-sm)) / -2)`; right `calc(-1 * var(--ds-space-2))` |
| Close icon | 16 px (`--ds-space-4`), `currentColor` = `--ds-color-ink` |
| Close hover | fill `--ds-color-surface`, border `--ds-color-ink` |
| Close pressed | fill `--ds-color-ink`, icon `--ds-color-primary-contrast` |
| Focus ring (toast, viewport, close, action) | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Enter / exit offset | `--ds-space-4` (translateX) |
| Enter, exit, swipe-end, swipe-cancel, hover | `--ds-motion` |
| z-index | 60, component-local constant (no token; Dialog uses local 50 / 51) |

## Accessibility

- Region: `Toast.Viewport` sits in a `role="region"` landmark named "Notifications (F8)", which also tells screen-reader users the hotkey. The list is an `ol` and each toast is an `li` (Radix).
- Live region politeness per severity, through Radix `type`:

  | Severity | Radix `type` | Announced with |
  | --- | --- | --- |
  | info | `background` | `aria-live="polite"` |
  | success | `background` | `aria-live="polite"` |
  | error | `foreground` | `aria-live="assertive"` |

  Radix announces through its own visually hidden `role="status"` node. It reads the provider label ("Notification"), then the title, the description and the action's `altText`. The `li` itself has `aria-live="off"`, so nothing is read twice.
- Severity in text: success and error titles start with a visually hidden "Success: " / "Error: ", matching the field-error rule in the README. Info has no prefix because it is the neutral default. Icons are `aria-hidden`.
- Never colour alone: severity is carried by fill, border weight, icon shape, title weight and the hidden prefix (canvas section 10, grayscale check).
- Names: close is `aria-label="Close"`. The action's name is its visible label, and its `altText` is the announced alternative (for example "Undo from Archive › Coastline").
- Contrast:
  - Info title and icon (gray-700) on white 10.4:1. Success fg on success bg 5.7:1. Error fg on error bg 6.1:1.
  - Description gray-700 on white 10.4:1 and on success bg about 9.3:1. gray-800 on error bg about 13.3:1.
  - Toast boundary against a white page: ink 21:1, success fg 6.4:1, error fg 7:1. All pass 3:1 (WCAG 1.4.11).
  - Close X (ink) on every fill is at least 18:1. Focus ring ink on the page 21:1. It sits outside the toast at a 2 px offset, so it is always against the page.
- Target size: close 32 × 32 (WCAG 2.5.8), action 44 px high.
- Timing: info and success auto-dismiss after at least 5 s (8 s with an action) and pause on hover, focus and window blur. Errors never auto-dismiss. Every toast can be closed by button, Esc or swipe.
- Motion: removed under `prefers-reduced-motion: reduce`, except the swipe, which follows the finger.
- `jest-axe` should find no violations for:
  - each severity without and with an action (6 cases)
  - title only
  - a stack of 3 mixed severities
  - the viewport after F8 focus
- `userEvent` tests (fake timers, `userEvent.setup({ advanceTimers: jest.advanceTimersByTime })`):
  - F8 focuses `getByRole('region', { name: 'Notifications (F8)' })`. Tab then reaches the newest toast, its action, its close, and then the next older toast.
  - Enter on the action calls `onClick` once and removes the toast. Enter on close removes it. Esc on a focused toast removes it. After each of these, focus is on the viewport.
  - Info and success close after 5000 ms, and after 8000 ms with an action. An error is still present after 60 s.
  - Hovering the viewport (`user.hover`) pauses the timer: advancing past the duration leaves the toast open, and `user.unhover` resumes with the time left. Focus inside the viewport pauses the timer too.
  - A fourth `toast()` call removes the oldest of three.
  - `update()` changes the text in place and keeps the toast count. `dismiss()` with no id removes all toasts.
  - The error announcement node has `aria-live="assertive"`, and the info and success nodes have `aria-live="polite"`. The success and error titles contain the hidden prefix.
- Swipe needs `PointerEvent` and pointer capture, which jsdom lacks. Cover it in a Storybook story (desktop drag and mobile viewport) instead of Jest, or add stubs to `jest.setup.ts` if the builder wants a unit test.
- Stories must cover: each severity with and without an action, a stack of 3, the mobile viewport, keyboard (F8 walkthrough), a sticky error, reduced motion, and a toast fired from inside an open `Dialog`.

## Token requests

None. Every value maps to an existing token or is computed from existing tokens (width `4 × --ds-space-24`, error padding, close margin).

For review only: the viewport's `z-index: 60` is a component-local constant, like Dialog's 50 / 51. If more layered components arrive (Popover, Tooltip, DS-41), a shared scale such as `--ds-z-overlay: 50`, `--ds-z-toast: 60` and `--ds-z-tooltip: 70` would stop the components from fighting over values. It is not requested here.
