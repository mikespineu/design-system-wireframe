# Textarea

- task: DS-3
- canvas: docs/design-system-wireframe/Textarea.dc.html
- canvas_url: https://claude.ai/artifact/2xzRy5QSUXVA3FGCTy25N2
- approved: yes
- approved_by: mikespin
- approved_at: 2026-10-20
- approval_hash:

Multi-line text control. Visual twin of `Input` (`src/components/Input/Input.tsx`): same border, fill, type, padding-x, focus ring, invalid and disabled treatment, and the same `Field` wiring through `useFieldControl()`. Ships as `Textarea` (control only, works inside `Field`) and `TextareaField` (`Field` + `Textarea`, mirrors `TextField`).

Proposed API (for the builder; narrow and typed):

```ts
interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  size?: 'sm' | 'md' | 'lg';          // starting rows 2 / 4 / 8; default 'md'
  rows?: number;                       // overrides size (rows 1 = 44 px, same as Input)
  resize?: 'vertical' | 'none' | 'auto'; // default 'vertical'
  maxRows?: number;                    // only for resize="auto"; default 6
  maxLength?: number;                  // shows the counter; NOT passed as the native maxlength
  invalid?: boolean;                   // same as Input
}
interface TextareaFieldProps extends TextareaProps {
  label: ReactNode; hint?: ReactNode; error?: ReactNode; fieldClassName?: string;
}
```

## Sizes

Size sets the starting row count only. Type stays body 16/26 at every size, because `Input` has a single type size. Width is always 100 % of the container.

Height (box-sizing: border-box) = rows × 26 px line + 2 × 8 px vertical padding + 2 × 1 px border.

| Size | Rows | Height | Use |
| --- | --- | --- | --- |
| `sm` | 2 | 70 px | short captions, comments |
| `md` (default) | 4 | 122 px | messages, notes |
| `lg` | 8 | 226 px | long-form descriptions |
| `rows={1}` | 1 | 44 px | equals `--ds-control-height`; lines up with an `Input` in the same row |

`rows` overrides `size`. The height above is the minimum height (`min-height`) for every resize mode. The 2 px invalid border sits inside that box (border-box), so the content shifts inward by 1 px and the outer size does not change, as in `Input`.

## States

All states apply to every size. Canvas section 02 has one artboard per row below; section 04 covers the counter states.

| State | Trigger | Border | Fill | Text | Other |
| --- | --- | --- | --- | --- | --- |
| Default | none | 1 px gray-300 (`--ds-color-border`) | white | ink; placeholder gray-500 | resize handle visible (vertical) |
| Filled | has value | unchanged | unchanged | ink | |
| Hover | `:hover`, not disabled / read-only / invalid | 1 px black (`--ds-color-ink`) | unchanged | unchanged | transition `--ds-motion` |
| Focus (keyboard) | `:focus-visible` | 1 px black | unchanged | unchanged | 2 px black outline, 2 px offset |
| Invalid | `aria-invalid="true"` (Field `error`, `invalid` prop, or counter over limit) | 2 px error (`--ds-color-error`) | unchanged | unchanged | error message under the field: alert icon + "Error: ..." in error color (from `Field`) |
| Invalid + focus | invalid and `:focus-visible` | 2 px error (kept; not replaced by black) | unchanged | unchanged | 2 px black outline, 2 px offset |
| Disabled | `disabled` | 1 px gray-200 (`--ds-color-divider`) | gray-50 (`--ds-color-surface-subtle`) | gray-500 (`--ds-color-placeholder`) | label gray-500, `cursor: not-allowed`, `resize: none`, not focusable, no hover |
| Read-only | `readOnly` | 1 px gray-200 | gray-50 | ink (full contrast; content must stay readable) | `resize: none`, `cursor: default`, focusable and selectable, no hover; label stays ink |
| Read-only + focus | read-only and `:focus-visible` | 1 px gray-200 (unchanged) | gray-50 | ink | 2 px black outline, 2 px offset |

Notes:

- Read-only vs disabled: both use the gray-50 fill and gray-200 border, so they read as "not editable". Read-only keeps black text, stays in the tab order and can be copied; disabled grays the text and the label and leaves the tab order.
- Hover and the black focus border are not in `Input` code today (canvas `Components.dc.html` shows the black border on focus). They are specified here so Textarea and Input match; the builder should add the same two rules to `Input` only if a task asks for it. Textarea must not diverge otherwise.
- Style state through attributes and pseudo-classes (`:hover`, `:focus-visible`, `[aria-invalid="true"]`, `:disabled`, `[readonly]`), no extra JS state.

### Resize

Width never changes (no horizontal resize). Canvas section 03.

| `resize` | Behavior |
| --- | --- |
| `vertical` (default) | Native resize handle, bottom-right. Minimum height = starting rows; no maximum. Overflow scrolls (`overflow-y: auto`). |
| `none` | Fixed height at starting rows. Overflow scrolls. For dialogs, table cells, dense layouts. |
| `auto` | Grows with content one row at a time from starting rows up to `maxRows` (default 6), then scrolls. No handle. Implemented with CSS `field-sizing: content` plus `min-height` (rows) and `max-height` (`maxRows`) computed with the height formula above. Browsers without `field-sizing` fall back to `vertical`; no JS measuring. |

Disabled and read-only force `resize: none` in every mode. The native handle is pointer-only; keyboard users read and edit through scrolling, which is why `vertical` never caps height and `auto` exists.

### Character counter

Shown only when `maxLength` is set. Canvas section 04.

- Placement: right side of the hint row under the field (hint left, counter right, `gap` 16 px). If there is no hint, the counter is still right-aligned. The Field error message, if any, appears below this row.
- Format: `{count} / {max}`, e.g. `32 / 160`. Caption type (13/20, Red Hat Text), `font-variant-numeric: tabular-nums` so it does not jitter. Counts UTF-16 length (`value.length`), same as the native `maxlength`.
- Typing past the limit is allowed: `maxLength` is not forwarded as the native attribute, so pasted text is never silently truncated. The consumer still validates on submit.

| Counter state | Rule | Counter | Field |
| --- | --- | --- | --- |
| Under limit | count < 90 % of max | gray-600 (`--ds-color-text-muted`), weight 400 | unchanged |
| Near limit | 90 % ≤ count < max | black (`--ds-color-ink`), weight 500 | unchanged |
| At limit | count = max | black, weight 500 | unchanged, still valid |
| Over limit | count > max | error (`--ds-color-error`), weight 500, 14 px alert icon before the numbers | invalid: `aria-invalid="true"`, 2 px error border |

Color appears only past the limit and always with the icon, per the "never color alone" rule.

## Keyboard

Native `<textarea>` behavior, identical to `Input` apart from Enter.

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Move focus to the next / previous focusable element. Never inserts a tab character. Disabled textareas are skipped; read-only ones are a tab stop. |
| Enter, Shift+Enter | Insert a line break. Never submits the surrounding form. |
| Arrow keys, Home, End, PageUp, PageDown | Native caret movement and scrolling inside the field (also in read-only). |
| Cmd/Ctrl+A, C, X, V, Z | Native select all, copy, cut, paste, undo. Cut and paste do nothing in read-only. |
| Esc | No action; the event bubbles so a parent Dialog or Popover can close. |

Focus order: label is not focusable; clicking it focuses the textarea (Radix `Label` `htmlFor`). Focus goes straight to the textarea; hint, counter and error are not focusable. The focus ring shows only for `:focus-visible` (keyboard), not on mouse click.

## Radix

- Control: none. Radix has no textarea primitive; a native `<textarea>` already provides all behavior (editing, selection, resize, form participation), so nothing would be hand-rolled.
- Label: `Label` from `radix-ui`, reused through the existing `Field` component (`src/components/Input/Input.tsx`). Do not create a second Field.
- Wiring: the control spreads `useFieldControl()` first, then its own props (explicit props win), exactly like `Input`. Counter ids are appended to the `aria-describedby` that Field provides.

## Tokens

| Property | Token |
| --- | --- |
| Border width (default, hover, focus, disabled, read-only) | `--ds-border-width` |
| Border width (invalid) | 2 px, Tailwind `border-2`, same as `Input` (no `--ds-*` width token for it) |
| Border color, default | `--ds-color-border` |
| Border color, hover and focus | `--ds-color-ink` |
| Border color, invalid | `--ds-color-error` |
| Border color, disabled and read-only | `--ds-color-divider` |
| Fill, default | `--ds-color-surface` |
| Fill, disabled and read-only | `--ds-color-surface-subtle` |
| Text | `--ds-color-ink` |
| Placeholder text; disabled text and label | `--ds-color-placeholder` |
| Label (default, read-only) | `--ds-color-ink`, `--ds-font-mono`, label style 12/16 uppercase +8 % |
| Field text font | `--ds-font-text`, body style 16/26 (Tailwind `text-body`) |
| Padding | `--ds-space-2` top/bottom, `--ds-space-3` left/right |
| Label to field, field to hint row gap | `--ds-space-2` |
| Hint row gap (hint to counter) | `--ds-space-4` |
| Icon to counter / error text gap | 6 px, Tailwind `gap-1.5`, same as `Field` error |
| Hint text | `--ds-color-text-muted`, caption 13/20 |
| Counter, under limit | `--ds-color-text-muted` |
| Counter, near / at limit | `--ds-color-ink` |
| Counter and error message, over limit / invalid | `--ds-color-error` |
| Focus ring | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` |
| Corner radius | `--ds-radius-md` |
| Hover / state transition | `--ds-motion` |
| Height of `rows={1}` | equals `--ds-control-height` |

## Accessibility

- Role: native `textbox` with `aria-multiline="true"` implied by `<textarea>`; add no extra role.
- Name: always from a visible label (`Field` / `TextareaField` `label`). A bare `Textarea` outside a Field needs `aria-label` or `aria-labelledby`; document this in the story.
- Description: `aria-describedby` = hint id, then counter description id, then error id. The counter description is a static, visually hidden sentence "You can enter up to {max} characters".
- Counter announcements: the visible `32 / 160` text is `aria-hidden`. A visually hidden `aria-live="polite"` region announces "{n} characters remaining" or "{n} characters too many", debounced (about 500 ms after typing stops) so screen readers are not flooded on every key.
- Invalid: `aria-invalid="true"` on the textarea; the error message starts with a screen-reader "Error: " (from `Field`); the over-limit counter adds the alert icon. Never color alone.
- Required: `aria-required="true"` from `Field`; the visible asterisk is `aria-hidden`.
- Disabled uses the native `disabled` attribute; read-only uses native `readonly` (not `aria-readonly` alone), so it stays focusable and is announced as read only.
- Contrast: text black on white 21:1; read-only text black on gray-50 about 19.6:1; placeholder gray-500 on white 4.5:1; hint and counter gray-600 7:1; error `#A3302B` on white 7:1; focus ring black on white 21:1. Disabled text gray-500 on gray-50 (about 4.2:1) is exempt as an inactive control. The default gray-300 border (about 1.6:1) is the existing `Input` decision; the visible label identifies the field, and hover/focus raise the border to black.
- Target size: the smallest textarea (`rows={1}`) is 44 px tall.
- `jest-axe` should verify no violations for: default with label, with hint, invalid with error, disabled, read-only, and with counter (under and over limit). Tests should also check with `userEvent`: label click focuses the textarea; Tab enters and leaves without inserting a tab; Enter inserts a newline and does not submit a wrapping form; disabled is skipped by Tab and read-only is not; typing past `maxLength` keeps all characters, sets `aria-invalid="true"`, and updates the live region; the accessible description includes the hint, the limit sentence and the error.

## Token requests

None.
