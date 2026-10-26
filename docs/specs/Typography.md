# Typography

- task: DS-37
- canvas: docs/design-system-wireframe/Typography.dc.html
- canvas_url: https://claude.ai/artifact/Pc7fkxmB8rdMZscZG1W44x
- approved: no
- approved_by:
- approved_at:
- approval_hash:

This spec turns the type scale into two components. `Heading` is Red Hat Mono 500 in black. `level` (1–6) sets the element (`h1`–`h6`) for the document outline. `size` sets only the look, so the two are independent. `Text` covers everything else: five sizes, three weights, the text or mono family, four gray-scale tones, and single-line truncate or multi-line clamp. Neither component is interactive. Both compose through `asChild` (Radix `Slot`), forward `ref` and rest props, and reset `margin` to 0, because spacing belongs to the layout (Stack / Grid, DS-35).

DS-38 builds them in `src/components/Heading/` and `src/components/Text/`.

Proposed API:

```ts
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';

type HeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, 'color'> & {
  size?: HeadingSize;              // look only; default from level (table under Sizes)
  truncate?: boolean;              // one line + ellipsis
  lineClamp?: number;              // n lines + ellipsis (integer >= 1)
} & (
  | { asChild?: false; level: HeadingLevel }   // renders h{level}; level required
  | { asChild: true; level?: HeadingLevel }    // child is the element; level only picks the default size (md if omitted)
);
// truncate and lineClamp are mutually exclusive (typed union in the build).

type TextSize = 'lg' | 'md' | 'sm' | 'xs' | '2xs';
type TextWeight = 'regular' | 'medium' | 'bold';
type TextFamily = 'text' | 'mono';
type TextTone = 'default' | 'muted' | 'emphasis' | 'inherit';
type TextElement = 'span' | 'p' | 'div' | 'label' | 'legend' | 'figcaption';

type TextProps = Omit<HTMLAttributes<HTMLElement>, 'color'> & {
  size?: TextSize;                 // default 'md'
  weight?: TextWeight;             // default 'regular'
  family?: TextFamily;             // default 'text'
  tone?: TextTone;                 // default 'default'
  truncate?: boolean;
  lineClamp?: number;
} & (
  | { as?: TextElement; asChild?: false }      // default 'span'
  | { as?: never; asChild: true }
);
// label-specific props (htmlFor) are allowed when as="label".
```

- `level` vs `size`: `level` comes from the page outline and is required, with no default, so authors have to choose it. `size` comes from the visual hierarchy. Changing `size` never changes the element. Once `size` is set, `level` has no effect on the look.
- `as` vs `asChild`:
  - `Text` has `as` for the plain HTML tags it is commonly used as: `span` (default), `p`, `div`, `label`, `legend`, `figcaption`. `span` is the default because it is valid anywhere: inside buttons, labels, headings and table cells.
  - Anything else goes through `asChild`, for example `a`, `time`, a router `Link`, or a component that renders its own element. `as` and `asChild` are mutually exclusive in the types.
  - `strong` / `em` / `code` are not `as` values. Inside a `Text`, use plain `<strong>` / `<em>` children (they inherit size and family), or `weight` / `family` on the `Text`.
- `Heading` has no `as`, because `level` is its element. With `asChild`, the child decides the element. Use it only when the child is itself a heading: `Dialog.Title` (renders `h2`), a router title that renders its own `h*`, or an element with `role="heading"` and `aria-level`. Never put `asChild` on a link (canvas 08, "Don't"). Nest the link instead.
- Ref and rest props go to the rendered element, or through `Slot` to the child. `className` is merged after the component's classes. Styling hooks are data attributes on the element: `data-size`, `data-weight`, `data-family`, `data-tone`, `data-truncate`, and `data-line-clamp`. `lineClamp` is passed as the component-local custom property `text-clamp` in the inline style.
- Not in scope: responsive / fluid sizes, text alignment, uppercase "label" style (stays the Field label / legend style), status tones, middle truncation. See Token requests for review questions.

## Sizes

### Heading (canvas sections 02 and 03)

All sizes use Red Hat Mono 500, `--ds-color-ink`, `margin: 0`, and `text-wrap: balance` (turned off when truncating or clamping).

| Size | Type style | Font size | Line height | Tracking | Default for level | Use |
| --- | --- | --- | --- | --- | --- | --- |
| `2xl` | display | 72 px (4.5rem) | 72 px (1) | −0.04em | never (explicit only) | hero, marketing |
| `xl` | h1 | 48 px (3rem) | 53 px (1.1) | −0.03em | 1 | page title |
| `lg` | h2 | 32 px (2rem) | 38 px (1.2) | −0.02em | 2 | page section |
| `md` | h3 | 22 px (1.375rem) | 29 px | 0 | 3 | card, dialog title, subsection |
| `sm` | h4 (new step) | 18 px (1.125rem) | 26 px | 0 | 4 | group inside a card, side panel |
| `xs` | h5 (new step) | 16 px (1rem) | 24 px | 0 | 5 and 6 | list heading; smallest heading |

- `2xl` to `md` are the existing display, h1, h2 and h3 styles from the README type table and `tailwind.css`.
- `sm` and `xs` are new heading steps. They reuse font sizes that are already in the scale (18 px body-lg, 16 px body) with tighter leading, so h4 to h6 look like headings and not like bold body text. Levels 5 and 6 share `xs`, because a seventh step would be too close to body text. Below `xs`, use `Text weight="medium"`.
- Sizes are in rem, so they follow the user's browser font size.

### Text (canvas sections 04 and 05)

| Size | Type style | Font size | Line height | Use |
| --- | --- | --- | --- | --- |
| `lg` | body-lg | 18 px (1.125rem) | 1.6 (28.8 px, README 29) | intros, lead paragraphs, empty states |
| `md` (default) | body | 16 px (1rem) | 26 px | paragraphs, interface copy (same as Input, Checkbox md label, Dialog body) |
| `sm` | body-sm | 15 px (0.9375rem) | 24 px | dense tables, side panels (same as Checkbox sm label) |
| `xs` | caption | 13 px (0.8125rem) | 20 px | captions, metadata, hints, footnotes |
| `2xs` | ui-sm | 12 px (0.75rem) | 16 px | tags, marks, counters, timestamps; meta only, never paragraphs |

| Weight | Value | Use |
| --- | --- | --- |
| `regular` (default) | 400 | reading text |
| `medium` | 500 | inline emphasis, list item titles, values, prices |
| `bold` | 700 | rare: one key figure or warning word inside a paragraph |

| Family | Font | Use |
| --- | --- | --- |
| `text` (default) | Red Hat Text | reading text |
| `mono` | Red Hat Mono | numerals, code, file paths, IDs, timestamps, meta |

- Family never changes size or line height. All 3 × 2 weight and family combinations are drawn at every size in canvas section 05. Both fonts are loaded at 400, 500 and 700.

### Truncate and line clamp (canvas section 07, both components)

| Prop | Behaviour |
| --- | --- |
| none (default) | wraps normally |
| `truncate` | `display: block`, `min-width: 0`, `overflow: hidden`, `white-space: nowrap`, `text-overflow: ellipsis`. One line, ellipsis at the end. `min-width: 0` lets it shrink inside flex and grid rows. |
| `lineClamp={n}` | `display: -webkit-box`, `-webkit-box-orient: vertical`, `-webkit-line-clamp: n` (plus standard `line-clamp: n`), `overflow: hidden`. n lines, ellipsis at the end of the last one. |

- Short content that fits shows no ellipsis and no visual change.
- The ellipsis is always at the end. Middle truncation, for example keeping a file name, is not supported.
- The full string stays in the DOM.

## States

Heading and Text are non-interactive. They have no hover, pressed, selected, disabled or invalid state, and they are not in the tab order. They render one way for a given set of props; props are variants, not states. Canvas section 08 shows the cases below.

| State | Trigger | Text colour | Other |
| --- | --- | --- | --- |
| Static (every variant) | always | per tone (Heading: ink) | default text cursor; Tab skips it |
| Tone default | `tone="default"` | gray-700 | Text only |
| Tone muted | `tone="muted"` | gray-600 | Text only |
| Tone emphasis | `tone="emphasis"` | black | Text only; same colour as Heading |
| Tone inherit | `tone="inherit"` | parent colour (`color: inherit`) | inside primary buttons (white), field error rows (error), disabled controls (gray-500) |
| Truncated | `truncate` | unchanged | one line, ellipsis; Heading drops `text-wrap: balance` |
| Clamped | `lineClamp={n}` | unchanged | n lines, ellipsis; Heading drops `text-wrap: balance` |
| Focus target, focus-visible | element has `tabIndex={-1}` and receives keyboard-driven focus (skip link, route change after a key press) | unchanged | 2 px black outline, 2 px offset. Heading CSS includes the `:focus-visible` rule; Text does not, because it is not used as a focus target. |
| Focus target, pointer focus | same element, focused by script after a pointer action (`:focus` without `:focus-visible`) | unchanged | no ring |
| Nested link: rest / hover / focus-visible | `<Heading><a/></Heading>` or `<Text asChild><a/></Text>` | link inherits the size and colour | link-owned: underline with 4 px offset on hover; 2 px black ring, 2 px offset on focus-visible. Heading and Text do not style their children. |

- Status colours are not tones. Feedback text is the job of Field error and Alert, which pair the colour with an icon and a label. To sit inside them, use `tone="inherit"`.

## Keyboard

Neither component handles keys, and neither is focusable by default.

| Key | Action |
| --- | --- |
| Tab / Shift + Tab | Skips Heading and Text. Focus moves to the next / previous control, including links nested inside them. |
| Enter on a skip link | Moves focus to the target heading, which needs `tabIndex={-1}` and an `id`. It shows the focus ring (canvas 08), and the next Tab continues from there. The skip link is the app's job; the heading only needs to accept focus. |
| Any other key | No action. |

- Focus order: unchanged by these components. Nested links are tab stops in DOM order. The heading or text around them is never a stop.
- Screen-reader heading navigation (NVDA / JAWS `H` and `1`–`6`, the VoiceOver rotor, TalkBack reading controls) belongs to the reader. It only works when `level` follows the outline (Accessibility, heading order).

## Radix

- `Slot` from `radix-ui` (`import { Slot } from 'radix-ui'`, used as `Slot.Root`) implements `asChild` on both components. It merges `className`, `style`, `ref`, data attributes and event handlers onto the single child.
- There is no Radix primitive for typography. Everything else is plain elements with CSS: `h1`–`h6` for Heading, and the `as` element (default `span`) for Text.
- With `Dialog`: `<Heading asChild size="md"><Dialog.Title>…</Dialog.Title></Heading>` keeps Radix's `h2` and its `aria-labelledby` wiring. The existing `Dialog` component already styles its title, so this is for custom dialogs only.

## Tokens

Naming, as in `docs/specs/Theming.md`: an existing token is written with its full name. A role that the approved Theming spec (DS-26) defines but `src/styles/tokens.css` does not have yet (DS-27 is still todo) is written by its bare name without the global prefix, for example `text-h1-size`. The two roles that are new in this spec (h4, h5) are also bare names. Full names, defaults and the build fallback are under Token requests. "Default" is the value the role resolves to today.

### Heading

| Property | Token / role | Default |
| --- | --- | --- |
| Font family | `font-heading` (DS-26); until it lands, `--ds-font-mono` | Red Hat Mono |
| Font weight | `text-heading-weight` (DS-26) → `font-weight-medium` | 500 |
| Text transform | `text-heading-transform` (DS-26) | none |
| Colour | `color-text-emphasis` (DS-26); until it lands, `--ds-color-ink` | black |
| 2xl size / line height / tracking | `text-display-size` / `text-display-line-height` / `text-display-tracking` (DS-26) | 4.5rem / 1 / −0.04em |
| xl | `text-h1-size` / `text-h1-line-height` / `text-h1-tracking` (DS-26) | 3rem / 1.1 / −0.03em |
| lg | `text-h2-size` / `text-h2-line-height` / `text-h2-tracking` (DS-26) | 2rem / 1.2 / −0.02em |
| md | `text-h3-size` / `text-h3-line-height` / `text-h3-tracking` (DS-26) | 1.375rem / `--ds-line-height-xl` (29px) / 0 |
| sm | `text-h4-size` / `text-h4-line-height` / `text-h4-tracking` (new) | 1.125rem / `--ds-line-height-lg` (26px) / 0 |
| xs | `text-h5-size` / `text-h5-line-height` / `text-h5-tracking` (new) | 1rem / `--ds-line-height-md` (24px) / 0 |
| Margin | none (fixed `0`) | 0 |
| Focus ring (focus target) | `--ds-focus-width` solid `--ds-color-ink` (later `color-focus`), offset `--ds-focus-offset` | 2px / 2px |

### Text

| Property | Token / role | Default |
| --- | --- | --- |
| Family `text` | `font-body` (DS-26); until it lands, `--ds-font-text` | Red Hat Text |
| Family `mono` | `--ds-font-mono` | Red Hat Mono |
| Weight regular / medium / bold | `font-weight-regular` / `font-weight-medium` / `font-weight-bold` (DS-26) | 400 / 500 / 700 |
| lg size / line height | `text-body-lg-size` / `text-body-lg-line-height` (DS-26) | 1.125rem / 1.6 |
| md | `text-body-size` / `text-body-line-height` (DS-26) | 1rem / `--ds-line-height-lg` (26px) |
| sm | `text-body-sm-size` / `text-body-sm-line-height` (DS-26) | 0.9375rem / `--ds-line-height-md` (24px) |
| xs | `text-caption-size` / `text-caption-line-height` (DS-26) | 0.8125rem / `--ds-line-height-sm` (20px) |
| 2xs | `text-ui-sm-size` / `text-ui-sm-line-height` (DS-26) | 0.75rem / `--ds-line-height-xs` (16px) |
| Tone default | `--ds-color-text` | gray-700 |
| Tone muted | `--ds-color-text-muted` | gray-600 |
| Tone emphasis | `color-text-emphasis` (DS-26); until it lands, `--ds-color-ink` | black |
| Tone inherit | none (`color: inherit`) | parent |
| Line clamp count | component-local `text-clamp` (from the prop) | n |
| Margin | none (fixed `0`) | 0 |

- No hardcoded font sizes, weights, line heights, tracking or colours in component CSS. The test added by DS-27 (Theming spec, Accessibility) has to pass for these components.
- Tailwind: once DS-27 maps the utilities, `text-h4` and `text-h5` should be added next to `text-h3` (Token requests).

## Accessibility

- Roles:
  - `Heading` renders a native `h1`–`h6`, so its role is `heading` and its `aria-level` equals `level`. `size` never changes the role or the level.
  - With `asChild`, the child's semantics apply. The child must be a heading element, or carry `role="heading"` and `aria-level`.
  - `Text` has no role. It renders the chosen element (`span`, `p`, `label`, etc.) with its native semantics.
- Labels: content is the accessible name. `Text as="label"` needs `htmlFor` (or a wrapped control). Headings must never be empty (axe `empty-heading`).
- Heading order (canvas section 09):
  - Choose `level` from the outline and `size` from the design. Never choose a level for its look. Use `level={3} size="sm"` instead of `level={4}`.
  - One `h1` per page: the page title. If the design shows no title, use a visually hidden `h1`.
  - Going down the outline, add one level at a time (h2 → h3, never h2 → h4). Going back up, any level is fine.
  - Dialog titles are `h2` (Radix `Dialog.Title`), and sections inside a dialog start at `h3`.
  - Reusable components that contain a heading (cards, sections, panels) take a `headingLevel` prop from the caller instead of hardcoding one.
  - Do not use `Heading` for text that is not a heading: eyebrows, big numbers, bold labels, table cells. Use `Text` with `weight`, `family` and `size`.
- Contrast. All pairs pass 4.5:1 at every size, so no size is restricted to "large text":
  - Heading and emphasis: black on white 21:1, on gray-50 19.8:1, on gray-100 18.1:1.
  - Default tone: gray-700 on white 10.4:1, on gray-50 9.7:1, on gray-100 8.9:1.
  - Muted tone: gray-600 on white 7.0:1, on gray-50 6.5:1, on gray-100 6.0:1. No tone is lighter than gray-600.
  - `inherit` takes on the parent's pair, for example white on black 21:1 or error on white 7.0:1.
  - Focus ring: black on white 21:1.
- Truncation and clamping:
  - The full text stays in the DOM, so screen readers, find-in-page and copy get all of it.
  - Truncated content must not be the only place the information appears: link to a detail view, or show the full value on the next screen.
  - `title` is not a fix, because keyboard and touch users cannot reach it. If a hover reveal is needed, use the future Tooltip on a focusable trigger.
  - Do not truncate headings that are the only name of a region.
- Resize and spacing:
  - Font sizes are in rem, so they scale with the browser text size (WCAG 1.4.4).
  - Line heights for md and smaller headings and for Text are px, as in the existing tokens. At very large root font sizes the leading gets tight, but text does not overlap until roughly 160 % (16 px at 26 px leading). This is flagged for review under Token requests.
  - Nothing sets a fixed height, so user text-spacing overrides (1.4.12) reflow freely, apart from the deliberate cut-off of `lineClamp`.
- Motion: none.
- `jest-axe` should find no violations for:
  - each `level` 1–6 at its default size;
  - a `level` / `size` mismatch (h2 at sm);
  - `asChild` with a heading child;
  - Text at every `size`, `weight`, `family` and `tone`;
  - `as` of `p`, `label` (with `htmlFor` and an input) and `legend` (inside a `fieldset`);
  - `asChild` with an `a`;
  - `truncate` and `lineClamp`;
  - a heading focus target with `tabIndex={-1}`;
  - a full page outline h1 > h2 > h3 > h2 > h3 (the `heading-order` rule passes). Add a negative test that h2 → h4 is reported by `heading-order`, to show the guidance is checkable.
- Unit tests should also check:
  - `getByRole('heading', { level: n })` finds each level, and `size` leaves the tag unchanged.
  - The default sizes per level match the table under Sizes.
  - `asChild` renders the child's tag with the merged class and data attributes, and forwards `ref`.
  - `as` renders each allowed tag. `Text` defaults to `span`.
  - `truncate` / `lineClamp` set `data-truncate` / `data-line-clamp` and the `text-clamp` style, and the full text is still in `textContent`.
  - `className` and rest props pass through.
  - Keyboard (`userEvent`): Tab skips a Heading and a Text, but lands on a link nested inside a Heading. Programmatic `focus()` on a `tabIndex={-1}` heading makes it `document.activeElement`.

## Token requests

### A. Type roles from the approved Theming spec (DS-26), not yet in tokens.css

These roles are already approved in `docs/specs/Theming.md` (section D, B, C and A) but are implemented by DS-27, which is still todo. Typography needs no new values for them. Build fallback: if DS-38 starts before DS-27 lands, DS-38 adds exactly this subset to `src/styles/tokens.css` with the same names and defaults, so DS-27 merges without conflict. Otherwise, DS-38 waits for DS-27.

| Token | Default | Used for |
| --- | --- | --- |
| `--ds-font-heading` | `var(--ds-font-mono)` | Heading family |
| `--ds-font-body` | `var(--ds-font-text)` | Text family `text` |
| `--ds-font-weight-regular` / `-medium` / `-bold` | 400 / 500 / 700 | Text weights |
| `--ds-text-heading-weight` | `var(--ds-font-weight-medium)` | Heading weight |
| `--ds-text-heading-transform` | none | Heading transform |
| `--ds-text-display-size` / `-line-height` / `-tracking` | 4.5rem / 1 / -0.04em | Heading 2xl |
| `--ds-text-h1-size` / `-line-height` / `-tracking` | 3rem / 1.1 / -0.03em | Heading xl |
| `--ds-text-h2-size` / `-line-height` / `-tracking` | 2rem / 1.2 / -0.02em | Heading lg |
| `--ds-text-h3-size` / `-line-height` / `-tracking` | 1.375rem / 29px / 0 | Heading md |
| `--ds-text-body-lg-size` / `-line-height` | 1.125rem / 1.6 | Text lg |
| `--ds-text-body-size` / `-line-height` | 1rem / 26px | Text md |
| `--ds-text-body-sm-size` / `-line-height` | 0.9375rem / 24px | Text sm |
| `--ds-text-caption-size` / `-line-height` | 0.8125rem / 20px | Text xs |
| `--ds-text-ui-sm-size` / `-line-height` | 0.75rem / 16px | Text 2xs |
| `--ds-color-text-emphasis` | `var(--ds-color-black)` | Heading colour, Text tone emphasis (`--ds-color-ink` until then) |

Where a DS-26 default is a px value equal to an existing line-height token (29px, 26px, 24px, 20px, 16px), the builder may write it as `var(--ds-line-height-*)`.

### B. New in this spec (need approval)

| Token | Proposed value | Why |
| --- | --- | --- |
| `--ds-text-h4-size` | 1.125rem (18px) | Heading `sm`, the default for level 4. The scale has only four heading styles (display, h1–h3), but Heading has six levels. Reusing `--ds-text-body-lg-size` would tie a heading look to body copy, and a theme that changes body text would also move headings. |
| `--ds-text-h4-line-height` | `var(--ds-line-height-lg)` (26px) | tighter than body-lg's 1.6, as for every heading |
| `--ds-text-h4-tracking` | 0 | every heading style has a tracking role (DS-26 pattern) |
| `--ds-text-h5-size` | 1rem (16px) | Heading `xs`, the default for levels 5 and 6 |
| `--ds-text-h5-line-height` | `var(--ds-line-height-md)` (24px) | tighter than body's 26px |
| `--ds-text-h5-tracking` | 0 | as above |

These add no new raw values: 18 px and 16 px are already in the scale, and the line heights are existing tokens. Also add the Tailwind utilities `text-h4` and `text-h5` next to `text-h3` (in DS-27, or in DS-38 if it carries the fallback). README's type table gains h4 18/26 and h5 16/24 once this is approved.

Alternative if the reviewer rejects B: map `sm` and `xs` to the body-lg and body size roles with the existing line-height tokens. This adds no tokens, but heading and body sizes become coupled in themes.

### C. Review questions (no token change proposed)

1. Text `lg` keeps the DS-26 line height 1.6 (28.8 px), not README's 29 px. The difference is sub-pixel. Accept, or change the DS-26 default to `var(--ds-line-height-xl)`?
2. Line-height tokens are px, so leading does not scale with the user's root font size (Accessibility, resize). Keep px for parity, or move DS-27 to unitless or rem line heights?
3. Should there be a `Text` `transform="uppercase"` or `variant="label"` for eyebrows, so the Field label style is reusable? It is not proposed: it stays the Field label / legend style.
