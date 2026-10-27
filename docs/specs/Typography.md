# Typography

- task: DS-37
- canvas: docs/design-system-wireframe/Typography.dc.html
- canvas_url: https://claude.ai/artifact/Pc7fkxmB8rdMZscZG1W44x
- approved: no
- approved_by:
- approved_at:
- approval_hash:

Typography has no React components: no `Heading`, no `Text`, nothing under `src/components/`. It is a set of eleven named Tailwind v4 utilities, defined with `@utility` in `src/styles/tailwind.css`. Each one uses `@apply` to compose existing theme utilities: family, a type-scale size (with its leading, tracking and weight), and a colour. There are six heading styles (`heading-2xl` … `heading-xs`) and five body styles (`body-lg` … `body-2xs`). Weight, family, tone, truncation and line clamp are stock Tailwind utilities that the author adds to the same element. The class sets only the look. The author picks the element (`h1`–`h6`, `p`, `span`, `label`, `a`, …), so semantics stay in the markup.

Build: DS-38 adds the theme entries and utilities listed under Token requests to `src/styles/tailwind.css`, and extends the existing docs story `src/foundations/Typography.stories.tsx`. DS-38 is currently titled "build Heading and Text components" and needs re-scoping.

```tsx
<h1 className="heading-xl">Account settings</h1>
<h2 className="heading-sm">Plan</h2>                      {/* outline h2, small look */}
<p className="body-md">Your name appears on invoices.</p>
<span className="body-xs text-muted">Updated 2 hours ago</span>
<span className="body-lg font-mono font-medium text-ink">1,284</span>
<p className="body-md line-clamp-2">Long card description …</p>
<label htmlFor="name" className="body-md font-medium text-ink">Display name</label>
```

### Naming

- `heading-{size}` is a heading look. `body-{size}` is everything else. Both use the same t-shirt steps, `2xl` … `2xs`, so a pair such as `heading-sm` and `body-sm` reads as one scale.
- Neither prefix exists in Tailwind, so they cannot collide with core utilities. They also stay clear of the `text-*` namespace. In Tailwind, `text-*` is already overloaded with font sizes (`text-h1`, `text-body`, `text-sm`) and colours (`text-muted`, `text-ink`). A composed `text-heading-lg` would read like a size or a colour, and `text-md` would sit right next to Tailwind's own `text-sm` / `text-lg`.
- The steps are sizes, not levels. `heading-lg` instead of `heading-2` keeps the look apart from the outline: an `h2` can be `heading-sm` without the class name contradicting the element.
- Composed vs atomic: `text-h1`, `text-body`, `text-caption` and the rest stay in the theme as atomic size utilities, used by component internals and by the composed classes themselves. In page and content markup, use the composed class. `body-md` is the full style: family, size, leading, weight, tracking and colour. `text-body` is only the size and leading.
- Rejected names: `type-heading-lg` / `type-body-lg` (unambiguous but long at every call site); `h1` … `h6` classes (they tie the look to the level); `ds-*` (reads like a component class).

## Sizes

### Heading styles (canvas sections 02 and 03)

All heading styles are Red Hat Mono 500 in ink (black) with balanced wrapping (`text-wrap-style: balance`). They set no margin.

| Class | Composes | Font size | Line height | Tracking | Default for | Use |
| --- | --- | --- | --- | --- | --- | --- |
| `heading-2xl` | `font-mono text-display text-ink` | 72 px (4.5rem) | 72 px (1) | −0.04em | none (explicit only) | hero, marketing |
| `heading-xl` | `font-mono text-h1 text-ink` | 48 px (3rem) | 53 px (1.1) | −0.03em | `h1` | page title |
| `heading-lg` | `font-mono text-h2 text-ink` | 32 px (2rem) | 38 px (1.2) | −0.02em | `h2` | page section |
| `heading-md` | `font-mono text-h3 tracking-normal text-ink` | 22 px (1.375rem) | 29 px | 0 | `h3` | card, dialog title, subsection |
| `heading-sm` | `font-mono text-h4 tracking-normal text-ink` | 18 px (1.125rem) | 26 px | 0 | `h4` | group inside a card, side panel |
| `heading-xs` | `font-mono text-h5 tracking-normal text-ink` | 16 px (1rem) | 24 px | 0 | `h5`, `h6` | list heading; smallest heading |

- Default class per level. Use it unless the design says otherwise: `h1` → `heading-xl`, `h2` → `heading-lg`, `h3` → `heading-md`, `h4` → `heading-sm`, `h5` and `h6` → `heading-xs`. When the outline and the visual hierarchy disagree, keep the element and change the class, for example `<h3 className="heading-sm">`.
- `heading-sm` and `heading-xs` need the new theme steps `text-h4` and `text-h5` (Token requests B). They reuse 18 px and 16 px, which are already in the scale, with tighter leading than body text. `h5` and `h6` share `heading-xs`, because a seventh step would be too close to body text. For anything smaller, use a body style with `font-medium text-ink`.
- Base heading styles today: `@layer base` sets `font-family: var(--ds-font-mono)` on `h1`–`h6`. Tailwind's preflight resets their `font-size` and `font-weight` to `inherit` and their margin to 0. A bare `<h2>` therefore renders in mono at the surrounding body size and weight. This spec does not change that, so every heading needs a `heading-*` class (review question F2).
- Sizes are in rem, so they follow the user's browser font size.

### Body styles (canvas sections 04 and 05)

All body styles are Red Hat Text 400, tracking 0, in the default text colour (gray-700).

| Class | Composes | Font size | Line height | Use |
| --- | --- | --- | --- | --- |
| `body-lg` | `font-sans text-body-lg font-normal tracking-normal text-text` | 18 px (1.125rem) | 1.6 (28.8 px; README 29) | intros, lead paragraphs, empty states |
| `body-md` | `font-sans text-body font-normal tracking-normal text-text` | 16 px (1rem) | 26 px | paragraphs, interface copy (same as Input, Checkbox md label, Dialog body) |
| `body-sm` | `font-sans text-body-sm font-normal tracking-normal text-text` | 15 px (0.9375rem) | 24 px | dense tables, side panels (same as Checkbox sm label) |
| `body-xs` | `font-sans text-caption font-normal tracking-normal text-text` | 13 px (0.8125rem) | 20 px | captions, metadata, hints, footnotes |
| `body-2xs` | `font-sans text-ui-sm font-normal tracking-normal text-text` | 12 px (0.75rem) | 16 px | tags, counters, timestamps; meta only, never paragraphs |

- `body-sm` and `body-2xs` need the new theme steps `text-body-sm` and `text-ui-sm` (Token requests B). Those names match the Theming spec (DS-26).
- `body-md` and `body-xs` match the README only if the existing `text-body` and `text-caption` line heights are aligned to the line-height tokens (Token requests C). `heading-md` likewise needs the `text-h3` alignment.
- Default element: whatever is semantically right. `p` for paragraphs, `span` inline, `label`, `legend`, `figcaption`, `time`, `a`, `td`. The class works on any of them.
- One heading or body class per element (per breakpoint). Don't stack two composed classes, and don't combine a composed class with an atomic size (`text-h1`, `text-body`, Tailwind's `text-sm`, …). To get a different size, pick a different composed class.

### Modifiers (canvas sections 05, 06 and 07)

Add these to the same element. They are stock Tailwind utilities, or system utilities that already exist in `tailwind.css`.

| Need | On-system modifiers | Notes |
| --- | --- | --- |
| Weight | `font-normal` (400), `font-medium` (500), `font-bold` (700) | Body defaults to 400 and headings to 500. Both fonts are loaded at exactly these three weights. |
| Family | `font-sans` (Red Hat Text), `font-mono` (Red Hat Mono) | Body defaults to sans. Use `font-mono` for numerals, code, paths, IDs and meta. Changing the family never changes size or leading. |
| Tone | `text-text` (gray-700, body default), `text-muted` (gray-600), `text-ink` (black, heading default), `text-inherit` (parent colour) | `text-inherit` is for text inside primary buttons, field error rows and disabled controls. |
| Truncate | `truncate` | One line with an end ellipsis. On an inline element (`span`, `a`), add `block` or `inline-block max-w-full`. As a flex or grid child, add `min-w-0`. |
| Line clamp | `line-clamp-{n}` (usually 2 or 3), `line-clamp-none` (reset at a breakpoint) | n lines, with an ellipsis at the end of the last one. |
| Responsive | variants such as `md:heading-xl` | They work because the styles are `@utility` classes. This spec doesn't define a responsive or fluid type scale. |
| Inline emphasis | `<strong>`, `<em>`, `<code>` children | Children inherit the size. Preflight sets `strong` to `bolder` (700 in body text). For 500, use `<strong className="font-medium">`. `code` picks up `font-mono`. |

Layout utilities are not typography, so they combine freely: margins and padding, `text-left`, `text-center` and `text-right`, `max-w-prose`, `max-w-[60ch]`. Spacing between text blocks belongs to the layout (Stack / Grid, DS-35).

Off-system. Don't use these on text content:

| Class | Why | Generates CSS today |
| --- | --- | --- |
| `font-thin`, `font-extralight`, `font-light`, `font-semibold`, `font-extrabold`, `font-black` | The fonts are not loaded at these weights, so the browser would synthesise or snap them | yes (theme weights are not cleared, F5) |
| `font-serif` | not a system family | yes |
| `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl` … `text-9xl` | Tailwind's default size steps are not the type scale (`text-sm` is 14 px) | yes. Existing control internals (Button, Tag, Alert) use them; this spec does not touch those. |
| `text-h1` … `text-caption` with a composed class | they override the composed size; pick another composed class instead | yes |
| `leading-*`, `tracking-*` | the composed class owns leading and tracking | yes |
| `text-gray-*`, `text-black`, `text-white` as tones | use the semantic tones; nothing lighter than gray-600 for text | yes |
| `text-text-strong`, `text-placeholder`, `text-disabled` | control colours, not text tones | yes |
| `text-error`, `text-success`, `text-info` on plain copy | status colour only inside Field error / Alert, paired with an icon and a label | yes |
| `text-balance`, `text-pretty`, `text-wrap`, `text-nowrap`, `whitespace-*`, a hand-built `overflow-hidden text-ellipsis` | they fight `truncate` and the built-in balance. Use `truncate` / `line-clamp-*` | yes |
| `uppercase` with a composed class | uppercase belongs to the label style (`font-mono text-label uppercase`) only | yes |
| `bg-blue-500`, `rounded-lg`, `shadow-md` | off-palette | no (already cleared) |

### Override contract: cascade and layer order (canvas section 07)

1. A composed class sets only `font-family`, `font-size`, `line-height`, `font-weight`, `letter-spacing` and `color`. Heading classes also set `text-wrap-style`. A composed class never sets margin, padding, `display`, `overflow`, `white-space`, the `text-wrap` shorthand, `text-overflow`, `max-width` or `text-transform`, so it never blocks layout, truncation or clamping.
2. Every utility lives in `@layer utilities`, as a single class with specificity (0,1,0). Tailwind v4 orders utilities in three steps: first by variant; then by each utility's first property in Tailwind's property order; then, for equal starts, the utility with more properties goes first. The composed classes start at `font-family`. That puts them before every one-property modifier in the same group: `font-medium`, `font-mono`, `text-muted`, `text-inherit`. **The modifier wins whatever the class order in the markup.**
3. `truncate` and `line-clamp-*` start at `overflow`, which comes earlier in Tailwind's property order, so they are emitted *before* the composed class. That is safe only because the composed class shares no property with them (point 1).
4. This is why headings use the longhand `text-wrap-style: balance` and not `@apply text-balance`. `text-balance` emits the shorthand `text-wrap: balance`, which also resets `text-wrap-mode` to `wrap`. Emitted after `truncate`, that would undo its `white-space: nowrap`, and a truncated heading would wrap again (canvas 07, "Don't"). Browsers without `text-wrap-style` simply wrap normally.
5. A variant (`md:heading-xl`) is emitted after its base classes, so responsive swaps work.
6. Component CSS outside any layer (`src/components/*/*.css`) beats every utility. That is existing behaviour. These classes are for page and content markup; components keep their own CSS.
7. DS-38 locks points 1–5 in with a compiled-CSS test (see Accessibility). If a Tailwind upgrade changes the sort, the fallback is to move the eleven rules into `@layer components`. That layer sits below utilities, so modifiers win by layer. Variants such as `md:heading-xl` would stop working.

## States

Typography classes are non-interactive. Nothing has a hover, pressed, selected, disabled or invalid state, and nothing is in the tab order. A class with a given set of modifiers always renders the same way: modifiers are variants, not states. Canvas sections 06, 08 and 09 show each row.

| State | Trigger | Text colour | Other |
| --- | --- | --- | --- |
| Static (every style) | always | `heading-*`: ink; `body-*`: gray-700 | default text cursor; Tab skips it |
| Tone muted | `text-muted` | gray-600 | none |
| Tone ink | `text-ink` on a body style | black | same colour as headings |
| Tone inherit | `text-inherit` | the parent's colour | white inside primary buttons, error inside field error rows, gray-500 inside disabled controls |
| Truncated | `truncate` (+ `block` / `min-w-0`) | unchanged | one line, end ellipsis; heading balance has no effect (no wrap) |
| Clamped | `line-clamp-{n}` | unchanged | n lines, ellipsis at the end of the last |
| Fits | `truncate` / `line-clamp-*` on short text | unchanged | no ellipsis, no visible change |
| Focus target, focus-visible | heading with `tabIndex={-1}` and `focus-visible:focus-ring`, focused from the keyboard (skip link, route change after a key press) | unchanged | 2 px black outline with a 2 px offset (existing `focus-ring` utility). Heading classes don't include it. Add it on every focus-target heading. |
| Focus target, pointer focus | the same heading, focused by script after a pointer action (`:focus` without `:focus-visible`) | unchanged | no ring |
| Nested link: rest / hover / focus-visible | `<h3 className="heading-md"><a/></h3>`, or a body class on the `a` itself | the link inherits the heading look, or takes its own classes | the link owns these states: underline with a 4 px offset on hover, `focus-visible:focus-ring` on focus. Typography classes never style children. |

- Status colours are not tones. Feedback text belongs to Field error and Alert, which pair the colour with an icon and a label. Inside them, use `text-inherit`.

## Keyboard

Typography handles no keys and makes nothing focusable.

| Key | Action |
| --- | --- |
| Tab / Shift + Tab | Skips headings and text. Focus moves to the next or previous control, including links nested inside them. |
| Enter on a skip link | Moves focus to the target heading, which needs `tabIndex={-1}`, an `id` and `focus-visible:focus-ring`. The ring shows (canvas 08), and the next Tab continues from there. The skip link is the app's job. |
| Any other key | No action. |

- Focus order: unchanged. Links nested in text are tab stops in DOM order. The text or heading around them is never a stop.
- Screen-reader heading navigation (NVDA / JAWS `H` and `1`–`6`, the VoiceOver rotor, TalkBack reading controls) belongs to the reader. It only works when the element levels follow the outline (Accessibility, heading order). The classes cannot affect it.

## Radix

None. Typography is CSS utilities only, with no React component and no Radix primitive. There is no `Slot` either: authors put the class directly on whatever element they render. That covers `Dialog.Title`, router links and `time` without a wrapper (`<Dialog.Title className="heading-md">`). The existing `Dialog` component already styles its own title, so this applies only to custom dialogs.

## Tokens

Each composed class resolves through Tailwind theme entries to design tokens from `src/styles/tokens.css`. Font sizes, unitless line heights and tracking are raw values in the `@theme` block, as `text-h1` and the rest are today. There are no font-size tokens yet; DS-27 (Theming) can later repoint these theme entries without touching the utilities.

| Property | Utility | Theme entry | Token / value |
| --- | --- | --- | --- |
| Heading family | `font-mono` | `--font-mono` | `--ds-font-mono` (Red Hat Mono) |
| Body family | `font-sans` | `--font-sans` | `--ds-font-text` (Red Hat Text) |
| Heading weight | from `text-display` / `text-h1` … `text-h5` | `--text-*--font-weight` | 500 |
| Body weight | `font-normal` | Tailwind default `--font-weight-normal` | 400 |
| Weight modifiers | `font-medium` / `font-bold` | Tailwind defaults | 500 / 700 |
| Heading colour, tone ink | `text-ink` | `--color-ink` | `--ds-color-ink` (black) |
| Body colour, tone default | `text-text` | `--color-text` | `--ds-color-text` (gray-700) |
| Tone muted | `text-muted` | `--color-muted` | `--ds-color-text-muted` (gray-600) |
| Tone inherit | `text-inherit` | none | `color: inherit` |
| `heading-2xl` size / leading / tracking | `text-display` | `--text-display*` | 4.5rem / 1 / −0.04em |
| `heading-xl` | `text-h1` | `--text-h1*` | 3rem / 1.1 / −0.03em |
| `heading-lg` | `text-h2` | `--text-h2*` | 2rem / 1.2 / −0.02em |
| `heading-md` | `text-h3`, `tracking-normal` | `--text-h3*` | 1.375rem / `--ds-line-height-xl` (29px, request C) / 0 |
| `heading-sm` | `text-h4`, `tracking-normal` | `--text-h4*` (request B) | 1.125rem / `--ds-line-height-lg` (26px) / 0 |
| `heading-xs` | `text-h5`, `tracking-normal` | `--text-h5*` (request B) | 1rem / `--ds-line-height-md` (24px) / 0 |
| `body-lg` | `text-body-lg`, `tracking-normal` | `--text-body-lg*` | 1.125rem / 1.6 / 0 |
| `body-md` | `text-body`, `tracking-normal` | `--text-body*` | 1rem / `--ds-line-height-lg` (26px, request C) / 0 |
| `body-sm` | `text-body-sm`, `tracking-normal` | `--text-body-sm*` (request B) | 0.9375rem / `--ds-line-height-md` (24px) / 0 |
| `body-xs` | `text-caption`, `tracking-normal` | `--text-caption*` | 0.8125rem / `--ds-line-height-sm` (20px, request C) / 0 |
| `body-2xs` | `text-ui-sm`, `tracking-normal` | `--text-ui-sm*` (request B) | 0.75rem / `--ds-line-height-xs` (16px) / 0 |
| Heading wrap | none (plain declaration) | none | `text-wrap-style: balance` |
| Focus ring (focus target) | `focus-visible:focus-ring` | `@utility focus-ring` | `--ds-focus-width` solid `--ds-color-ink`, offset `--ds-focus-offset` (2px / 2px) |
| Margin | none | none | none set; preflight already resets it to 0 |

- No hardcoded colours, weights or spacing appear in the utilities; every value comes from an `@apply`'d utility or a theme entry. The only literal is `text-wrap-style: balance`, which is a keyword, not a design value.

## Accessibility

- Roles: the element decides the role, never the class. `<h2 className="heading-sm">` is a level-2 heading. `<p className="heading-lg">` is a paragraph that only looks like a heading. Typography adds no ARIA.
- Labels: content is the accessible name. A `label` with a body class still needs `htmlFor` (or a wrapped control). Headings must never be empty (axe `empty-heading`).
- Heading order (canvas section 10):
  - Choose the element from the outline and the class from the design. Never choose an element for its look. Use `<h3 className="heading-sm">` instead of `<h4>`.
  - Use one `h1` per page: the page title. If the design shows no title, use a visually hidden `h1` (`sr-only`).
  - Going down the outline, add one level at a time (h2 → h3, never h2 → h4). Going back up, any level is fine.
  - Dialog titles are `h2` (Radix `Dialog.Title`), and sections inside a dialog start at `h3`.
  - Reusable parts that contain a heading (cards, sections, panels) take a `headingLevel` prop from the caller and render `` `h${headingLevel}` `` with a fixed class. They never hardcode the level.
  - Don't: a heading class on a non-heading to fake a section title. If text looks and works like a section title, it must be an `h*`, or sighted and screen-reader users get different structures (WCAG 1.3.1).
  - Don't: an `h*` for text that is not a heading, such as eyebrows, big numbers, bold labels or table cells. Use a body class with modifiers, for example `body-2xs font-mono font-medium text-muted` or `body-lg font-mono font-medium text-ink`.
- Contrast. Every pair passes 4.5:1 at every size, so no size is limited to "large text":
  - Headings and `text-ink`: black on white 21:1, on gray-50 19.8:1, on gray-100 18.1:1.
  - Body default `text-text`: gray-700 on white 10.4:1, on gray-50 9.7:1, on gray-100 8.9:1.
  - `text-muted`: gray-600 on white 7.0:1, on gray-50 6.5:1, on gray-100 6.0:1. No on-system tone is lighter than gray-600. Off-system `text-gray-400` / `-500` must not be used for text.
  - `text-inherit` takes the parent's pair, for example white on black 21:1 or error on white 7.0:1.
  - Focus ring: black on white 21:1.
- Truncation and clamping:
  - The full text stays in the DOM, so screen readers, find-in-page and copy get all of it.
  - Truncated content must not be the only place the information appears. Link to a detail view, or show the full value on the next screen.
  - `title` is not a fix, because keyboard and touch users can't reach it. If a hover reveal is needed, use the future Tooltip on a focusable trigger.
  - Don't truncate a heading that is the only name of a region.
- Resize and spacing:
  - Font sizes are in rem, so they scale with the browser text size (WCAG 1.4.4).
  - The line heights of `heading-md` / `-sm` / `-xs` and of `body-md` / `-sm` / `-xs` / `-2xs` are px, because they reuse the line-height tokens. At very large root font sizes the leading gets tight; text starts to overlap at about 160 %. Review question F4.
  - Nothing sets a height, so user text-spacing overrides (WCAG 1.4.12) reflow freely, apart from the deliberate cut-off of `line-clamp-*`.
- Motion: none.
- Tests for DS-38. jsdom doesn't apply Tailwind CSS, so the tests are split in two:
  - Compiled-CSS contract test (Node; compile `src/styles/tailwind.css` with Tailwind's compiler, e.g. `@tailwindcss/node`, which `@tailwindcss/vite` already depends on). It checks that:
    - all eleven classes exist and resolve to the values under Sizes;
    - heading classes contain `text-wrap-style: balance` and no `text-wrap:` shorthand;
    - no composed class declares margin, padding, `display`, `overflow`, `white-space`, `text-overflow` or `text-transform`;
    - the rules for `font-normal`, `font-medium`, `font-bold`, `font-sans`, `font-mono`, `text-text`, `text-muted`, `text-ink` and `text-inherit` are emitted after every composed class;
    - `md:heading-xl` comes after `heading-lg`.
  - `jest-axe` on the docs-story markup should find no violations for:
    - an outline h1 > h2 > h3 > h2 > h3 using the default class per level;
    - `<h2 className="heading-sm">`;
    - every body class with every on-system tone, on `p` and `span`;
    - `label` (with `htmlFor` and an input) and `legend` (inside a `fieldset`) with body classes;
    - an `a` with `body-md font-medium text-ink`;
    - `truncate` and `line-clamp-2` samples;
    - a heading focus target with `tabIndex={-1}`.
  - Negative tests: h2 → h4 is reported by `heading-order`, and an empty `h2` by `empty-heading`, to show that the guidance can be checked. Colour contrast is not computed in jsdom, so the figures above stand in for it.
  - Keyboard (`userEvent`): Tab skips a heading and a paragraph but lands on a link nested in a heading. `focus()` on a `tabIndex={-1}` heading makes it `document.activeElement`. The full text of a truncated sample is still in `textContent`.

## Token requests

### A. New `--ds-*` tokens

None. Every value is either already in `src/styles/tokens.css` (fonts, colours, line heights, focus) or a type-scale size. Type-scale sizes live as raw rem values in the `@theme` block, as they do today.

### B. New `@theme` entries in `src/styles/tailwind.css` (need approval)

Add these next to the existing type scale. The names follow the Theming spec (DS-26).

```css
  --text-h4: 1.125rem;
  --text-h4--line-height: var(--ds-line-height-lg);
  --text-h4--font-weight: 500;
  --text-h5: 1rem;
  --text-h5--line-height: var(--ds-line-height-md);
  --text-h5--font-weight: 500;
  --text-body-sm: 0.9375rem;
  --text-body-sm--line-height: var(--ds-line-height-md);
  --text-ui-sm: 0.75rem;
  --text-ui-sm--line-height: var(--ds-line-height-xs);
```

- `text-h4` and `text-h5` exist so that `h4`–`h6` have a heading look. Reusing `text-body-lg` / `text-body` would tie heading sizes to body copy in future themes. Alternative if rejected: `heading-sm` / `heading-xs` compose `text-body-lg leading-[var(--ds-line-height-lg)]` and similar. That needs no new entries, but heading and body sizes become coupled.
- `text-body-sm` and `text-ui-sm` already exist as values in Checkbox sm and Slider / Tag. These entries only name them.
- None of them adds a raw value that is new to the system.

### C. Changes to existing `@theme` entries (need approval)

| Entry | Today | Proposed | Why |
| --- | --- | --- | --- |
| `--text-h3--line-height` | 1.3 (28.6 px) | `var(--ds-line-height-xl)` (29px) | matches README h3 22/29, the Theming spec and the Dialog title |
| `--text-body--line-height` | 1.6 (25.6 px) | `var(--ds-line-height-lg)` (26px) | matches README body 16/26, Input and Checkbox md |
| `--text-caption--line-height` | 1.5 (19.5 px) | `var(--ds-line-height-sm)` (20px) | matches README caption 13/20 and field hints |

Each change is under 0.5 px for current `text-h3` / `text-body` / `text-caption` users (Introduction, Typography and pattern stories). Alternative: keep today's values, and the composed classes inherit the sub-pixel difference from the README.

### D. New `@utility` entries in `src/styles/tailwind.css` (need approval)

```css
/* Heading styles: look only; the author picks h1–h6. Longhand balance so truncate still works. */
@utility heading-2xl { @apply font-mono text-display text-ink; text-wrap-style: balance; }
@utility heading-xl  { @apply font-mono text-h1 text-ink; text-wrap-style: balance; }
@utility heading-lg  { @apply font-mono text-h2 text-ink; text-wrap-style: balance; }
@utility heading-md  { @apply font-mono text-h3 tracking-normal text-ink; text-wrap-style: balance; }
@utility heading-sm  { @apply font-mono text-h4 tracking-normal text-ink; text-wrap-style: balance; }
@utility heading-xs  { @apply font-mono text-h5 tracking-normal text-ink; text-wrap-style: balance; }

/* Body styles: everything that is not a heading */
@utility body-lg  { @apply font-sans text-body-lg font-normal tracking-normal text-text; }
@utility body-md  { @apply font-sans text-body font-normal tracking-normal text-text; }
@utility body-sm  { @apply font-sans text-body-sm font-normal tracking-normal text-text; }
@utility body-xs  { @apply font-sans text-caption font-normal tracking-normal text-text; }
@utility body-2xs { @apply font-sans text-ui-sm font-normal tracking-normal text-text; }
```

- `@layer base` is unchanged: `h1`–`h6` keep only `font-family`.
- Docs, after approval (DS-38): README "Tailwind" table gains a "Type styles" row (`heading-2xl` … `heading-xs`, `body-lg` … `body-2xs`) and the modifier list. The README type table gains h4 18/26, h5 16/24, body-sm 15/24 and ui-sm 12/16. The Foundations/Typography story shows every class, the level defaults, the modifiers and truncate / clamp.

### E. Off-system cleanup (not requested, see F5)

No theme entries are removed in this spec.

### F. Review questions

1. **JS helper.** Do you also want a tiny typed helper on top of the CSS utilities? For example, a function that returns the class string, composed with `clsx` / `tailwind-merge` so conflicting modifiers collapse predictably. It is not designed here; the CSS utilities stand on their own.
2. Should `@layer base` give bare `h1`–`h6` their default class (`h1 { @apply heading-xl }` …)? Classes would still override it, because base sits below utilities. The risk is that existing headings that rely on preflight's `font-size: inherit` would change size.
3. `body-lg` keeps line height 1.6 (28.8 px), not README's 29 px. Accept, or change `--text-body-lg--line-height` to `var(--ds-line-height-xl)`?
4. The line-height tokens are px, so leading doesn't scale with the user's root font size. Keep px for parity, or move DS-27 to unitless or rem line heights?
5. Should the theme clear off-system weights and families (`--font-weight-*: initial` with normal / medium / bold re-added, and `font-serif` dropped), so that `font-semibold` and similar generate no CSS, as the palette already does? `src/` uses only `font-medium` and `font-bold` today.
6. Should the uppercase label / eyebrow style (`font-mono text-label uppercase`) also get a composed class, for example `label-sm`? It is not proposed.
