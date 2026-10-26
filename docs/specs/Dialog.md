# Dialog

- task: DS-19
- canvas: docs/design-system-wireframe/Dialog.dc.html
- canvas_url: https://claude.ai/artifact/WALKLKSPFMwmnqLpdHsJ4X
- approved: no
- approved_by:
- approved_at:
- approval_hash:

Modal panel over a dimmed overlay, built on Radix `Dialog`. Square corners, no shadow: the panel separates from the page by a 1 px black border and the 50 % black overlay. Parts: overlay, panel, header (title, optional description, close button), body, footer (actions).

Proposed API (for the builder; narrow and typed):

```ts
interface DialogProps {
  open?: boolean;                        // controlled
  defaultOpen?: boolean;                 // uncontrolled
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;                   // rendered via Dialog.Trigger asChild
  title: ReactNode;                      // required; Dialog.Title
  description?: ReactNode;               // Dialog.Description; omitted => aria-describedby={undefined}
  children?: ReactNode;                  // body
  footer?: ReactNode;                    // actions, e.g. <Button>; wrap Cancel in <DialogClose asChild>
  size?: 'sm' | 'md' | 'lg';             // default 'md'
  dismissible?: boolean;                 // default true; false disables overlay click (Esc and close button still close)
  hideCloseButton?: boolean;             // default false
  className?: string;                    // on Dialog.Content
}
export const DialogClose: typeof Dialog.Close; // re-export, for footer Cancel buttons
```

- `ref` and rest props forward to `Dialog.Content`.

## Sizes

Size sets the panel max width only. Padding, type and parts are identical at every size. Width is `100% − 2 × 16 px` gutters, capped at the max width. Max height is `100dvh − 2 × 48 px`. Past that, only the body scrolls.

| Size | Max width | Use |
| --- | --- | --- |
| `sm` | 400 px | confirmations, one sentence plus two actions |
| `md` (default) | 560 px | short forms |
| `lg` | 720 px | rich or long content |

Layout (all sizes):

- Panel is centered horizontally and vertically in the viewport (`position: fixed`, transform-free centering via grid on the overlay or `inset` + `margin: auto`).
- Header: padding 24 top, 24 sides, 0 bottom. Title and description stack with an 8 px gap. Close button 32 × 32 sits top-right, nudged −4 px up and −8 px right so the icon lines up with the padding edge.
- Body: padding 16 top, 24 sides, 24 bottom. `overflow-y: auto` when the panel hits max height.
- Footer: 1 px top divider, padding 16 / 24, actions right-aligned with a 12 px gap, primary action last (rightmost). On viewports under 480 px, actions stack full width with primary first (`flex-direction: column-reverse`).
- Without `footer`, the footer and its divider are not rendered.

## States

Canvas section 03 (panel and close button) and section 01 (open at each size).

| State | Trigger | Overlay | Panel | Close button | Other |
| --- | --- | --- | --- | --- | --- |
| Closed | `data-state="closed"` | not rendered | not rendered | — | focus back on trigger |
| Open | `data-state="open"` | black 50 % | white, 1 px black border | default | page scroll locked; outside content `inert` / `aria-hidden` (Radix) |
| Open, scrolling | content taller than max height | unchanged | header and footer fixed; body scrolls | unchanged | footer divider marks the cut |
| Open, no description | `description` omitted | unchanged | title only in header | unchanged | no `aria-describedby` |
| Close · default | none | | | white fill, transparent 1 px border, black icon | `cursor: pointer` |
| Close · hover | `:hover` | | | fill gray-100 | transition `--ds-motion` |
| Close · focus-visible | `:focus-visible` | | | 1 px black border + 2 px black outline, 2 px offset | |
| Close · pressed | `:active` | | | fill black, icon white | |
| Action focus-visible | footer button `:focus-visible` | | | | as `Button` focus: 2 px black outline, 2 px offset |

- Open / close motion: overlay and panel fade (opacity 0 → 1) using `--ds-motion`, keyed on `[data-state="open"]` / `[data-state="closed"]`. No scale, no slide. None under `prefers-reduced-motion: reduce`.
- Style state only through `[data-state]` and pseudo-classes; no JS visual state.
- No destructive / alert variant here: an alert dialog that must not close on outside click is a separate component on Radix `AlertDialog` (out of scope).

## Keyboard

| Key / input | Action |
| --- | --- |
| Enter / Space on trigger | Open. Focus moves to the first focusable element in the body; if none, the first focusable in the panel (close button). Radix `onOpenAutoFocus` default. |
| Tab / Shift + Tab | Move through focusables inside the panel only; wraps from last to first and back (focus trap, Radix `FocusScope`). |
| Esc | Close (Radix `onEscapeKeyDown`). Focus returns to the trigger. Children that handle Esc (Select, Popover, Slider input drafts) stop propagation first, so one Esc closes one layer. |
| Pointer down on overlay (outside the panel) | Close when `dismissible` (default). With `dismissible={false}`, `onPointerDownOutside` and `onInteractOutside` call `preventDefault()`. |
| Close button, Cancel (`DialogClose`) | Close; focus returns to trigger. |

Focus order inside the panel (DOM order): close button, body focusables, footer actions (secondary, then primary). The close button is first in the DOM but initial focus skips it in favor of body content, so screen readers still read title and description first. Without a trigger (controlled `open`), focus returns to the previously focused element.

## Radix

- `Dialog` from `radix-ui` (`import { Dialog } from 'radix-ui'`): `Dialog.Root`, `Dialog.Trigger` (`asChild`), `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, `Dialog.Close`.
- Modal only (`modal` default true): Radix provides the focus trap, scroll lock, `aria-hidden` on outside content, portal, Escape and outside-click dismissal, and focus return.
- `dismissible={false}` maps to `preventDefault()` in `onPointerDownOutside` / `onInteractOutside` only; Esc still closes.
- `Dialog.Title` is always rendered (required prop). `Dialog.Description` only if `description` is passed; otherwise pass `aria-describedby={undefined}` to `Content` to silence the Radix warning.
- The close button is `Dialog.Close asChild` around a native `<button type="button" aria-label="Close">`.

## Tokens

| Property | Token |
| --- | --- |
| Overlay color | `color-mix(in srgb, var(--ds-color-ink) 50%, transparent)` (see Token requests) |
| Panel fill | `--ds-color-surface` |
| Panel border | `--ds-border-width` solid `--ds-color-ink` |
| Panel radius | `--ds-radius-md` |
| Panel shadow | none |
| Panel max width sm / md / lg | 400 / 560 / 720 px (see Token requests) |
| Viewport gutter | `--ds-space-4` |
| Viewport top / bottom margin | `--ds-space-12` |
| Header padding | `--ds-space-6` top and sides, 0 bottom |
| Title / description gap | `--ds-space-2` |
| Title | `--ds-font-mono`, weight 500, h3 22/29, `--ds-color-ink` |
| Description | `--ds-font-text`, body 16/26, `--ds-color-text-muted` |
| Header gap (text to close) | `--ds-space-4` |
| Body padding | `--ds-space-4` top, `--ds-space-6` sides and bottom |
| Body text | `--ds-font-text`, body 16/26, `--ds-color-text` |
| Footer divider | `--ds-border-width` solid `--ds-color-divider` |
| Footer padding | `--ds-space-4` vertical, `--ds-space-6` horizontal |
| Footer action gap | `--ds-space-3` |
| Close button size | `--ds-space-8` |
| Close button icon | `--ds-space-4`, 2 px stroke, `currentColor` |
| Close button offset | −`--ds-space-1` top, −`--ds-space-2` right |
| Close button fill / icon | `--ds-color-surface` / `--ds-color-ink` |
| Close button hover fill | `--ds-color-fill` |
| Close button pressed | fill `--ds-color-ink`, icon `--ds-color-primary-contrast` |
| Close button focus | border `--ds-color-ink`; outline `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Footer actions | existing `Button` (primary `--ds-color-primary` / `--ds-color-primary-contrast`, secondary outline `--ds-color-ink`), height `--ds-control-height` |
| Open / close fade, hover transitions | `--ds-motion` |

## Accessibility

- `Dialog.Content` has `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → title, `aria-describedby` → description when present (all from Radix).
- Title is required, so every dialog has an accessible name. Title renders as `h2`.
- Close button: native `<button>`, `aria-label="Close"`, icon `aria-hidden`.
- Outside content is hidden from assistive tech while open (Radix `hideOthers`).
- Contrast: title black on white 21:1; description gray-600 7:1; body gray-700 10:1; panel border black on overlay-dimmed page and white about 21:1 / ≥ 3:1 (WCAG 1.4.11); close button icon 21:1, focus ring 21:1.
- Target size: close button 32 × 32 (meets WCAG 2.5.8); footer actions 44 px tall.
- Motion: fade only, removed under `prefers-reduced-motion`.
- `jest-axe` should verify no violations for: open md with title, description, body form field and footer; open sm without description; open lg with scrolling body; `hideCloseButton`.
- Tests with `userEvent`: Enter on trigger opens and focuses the first body input; Tab cycles and wraps inside the panel (last action → close button), Shift + Tab reverses; Esc closes and focus returns to the trigger; clicking the overlay closes, but not with `dismissible={false}` (Esc still does); close button and `DialogClose` close and call `onOpenChange(false)`; dialog is named by the title (`getByRole('dialog', { name })`).

## Token requests

- `--ds-dialog-width-sm: 400px`, `--ds-dialog-width-md: 560px`, `--ds-dialog-width-lg: 720px` — panel max widths. No existing token fits (the space scale stops at 96 px). Alternative if declined: express as component-local CSS variables in `Dialog.css` (`calc(var(--ds-space-24) * 4 + var(--ds-space-4))` etc. is unreadable, so local constants are preferred).
- `--ds-color-overlay: rgb(0 0 0 / 0.5)` — modal scrim, reusable by future Sheet / Drawer. If declined, the builder uses `color-mix(in srgb, var(--ds-color-ink) 50%, transparent)`, which needs no new token.
