# Layout

- task: DS-35
- canvas: docs/design-system-wireframe/Layout.dc.html
- canvas_url: https://claude.ai/artifact/4mecTuqFqJMihn34gorMVD
- approved: no
- approved_by:
- approved_at:
- approval_hash:

Two layout primitives, `Stack` and `Grid`, built in DS-36 as `src/components/Stack/` and `src/components/Grid/`. Neither draws anything: no color, border, padding, margin, radius or type. They only arrange their children. `Stack` is a flex line, vertical (default) or horizontal, with a gap, cross-axis `align`, main-axis `justify` and an optional `wrap`. `Grid` is a CSS grid of 1, 2, 3, 4, 6 or 12 equal columns with a gap and `align`. Gaps only take steps of the `--ds-space-*` scale. Every layout prop except `wrap` accepts a single value or a per-breakpoint object, mobile first. Both render a `div` by default, accept `as` for a different layout element, or `asChild` to put the layout on their only child through Radix `Slot`.

The hatching and dashed outlines on the canvas show gap, free space and bounds for review only. They are not part of the components.

### Proposed API

Shared types (exported from both packages through `src/index.ts`; put them in one shared module, for example `src/lib/layout.ts`, so Stack and Grid don't drift):

```ts
import type { HTMLAttributes, ReactNode } from 'react';

/** Suffixes of the --ds-space-* scale, plus 0. gap={4} → var(--ds-space-4). */
export type Space = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24;

/** Mobile-first breakpoint keys. See "Breakpoints" under Sizes. */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg';

/** A single value (all widths) or values per breakpoint. */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

/** Elements Stack and Grid may render through `as`. */
export type LayoutElement =
  | 'div' | 'span' | 'section' | 'article' | 'aside' | 'header' | 'footer'
  | 'main' | 'nav' | 'form' | 'ul' | 'ol' | 'li';

/** `as` and `asChild` are mutually exclusive at the type level. */
export type LayoutElementProps =
  | { as?: LayoutElement; asChild?: false }
  | { as?: never; asChild: true };
```

`Stack`:

```ts
export type StackDirection = 'vertical' | 'horizontal';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export type StackProps = Omit<HTMLAttributes<HTMLElement>, 'children'> &
  LayoutElementProps & {
    direction?: Responsive<StackDirection>; // default 'vertical'
    gap?: Responsive<Space>;                // default 4 (16 px)
    align?: Responsive<StackAlign>;         // cross axis, default 'stretch'
    justify?: Responsive<StackJustify>;     // main axis, default 'start'
    wrap?: boolean;                         // default false; effect only when horizontal
    children?: ReactNode;                   // with asChild: exactly one element
  };

export const Stack: ForwardRefExoticComponent<StackProps & RefAttributes<HTMLElement>>;
```

`Grid`:

```ts
export type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;
export type GridAlign = 'start' | 'center' | 'end' | 'stretch';

export type GridProps = Omit<HTMLAttributes<HTMLElement>, 'children'> &
  LayoutElementProps & {
    columns?: Responsive<GridColumns>; // default 1
    gap?: Responsive<Space>;           // row and column gap, default 6 (24 px)
    align?: Responsive<GridAlign>;     // align-items in each row, default 'stretch'
    children?: ReactNode;              // with asChild: exactly one element
  };

export const Grid: ForwardRefExoticComponent<GridProps & RefAttributes<HTMLElement>>;
```

Rules for both:

- Responsive object: each key applies from its breakpoint up until a larger key overrides it. A missing `base` falls back to the prop's default. `{ md: 'horizontal' }` is vertical below 768 px and horizontal from 768 px.
- `wrap` is a plain boolean, not responsive, to keep the API narrow. It is harmless when the Stack is vertical.
- `ref` and rest props (`id`, `className`, `style`, `aria-*`, `data-*`, event handlers) go to the rendered element, or with `asChild` are merged onto the child by `Slot.Root`. `className` is appended to the component class with `cx`, as in `Button`.
- `as` and `asChild` together are a type error (the `LayoutElementProps` union). At runtime, if both arrive anyway, `asChild` wins.
- No `rowGap` / `columnGap`, `padding`, `reverse`, `order`, `inline`, `minChildWidth`, `dense`, or child span props. Spanning is done by children with Tailwind `col-span-*` utilities (see Sizes). Add any of these later only with a new design task.

### Rendering contract (for the builder)

Resolved values render as data attributes, the same pattern as `.ds-checkbox[data-size='sm']`. No inline styles, no JS media queries.

| Prop | Base attribute (always rendered, with the default if omitted) | Breakpoint attributes (only when set) |
| --- | --- | --- |
| Stack `direction` | `data-direction="vertical"` | `data-direction-sm`, `-md`, `-lg` |
| `gap` (both) | `data-gap="4"` (Stack) / `data-gap="6"` (Grid) | `data-gap-sm`, `-md`, `-lg` |
| `align` (both) | `data-align="stretch"` | `data-align-sm`, `-md`, `-lg` |
| Stack `justify` | `data-justify="start"` | `data-justify-sm`, `-md`, `-lg` |
| Stack `wrap` | `data-wrap` present when `true`, absent when `false` | n/a |
| Grid `columns` | `data-columns="1"` | `data-columns-sm`, `-md`, `-lg` |

- Class names: `ds-stack` and `ds-grid`.
- CSS: base rules, then `@media (min-width: 640px)` with the `-sm` rules, then `768px` with `-md`, then `1024px` with `-lg`, in that source order, all at the same specificity (`.ds-stack[data-gap-md='6']`), so the larger breakpoint wins by order. Every value is a finite list, so every rule is written out (no `attr()`).
- `as="ul"` / `as="ol"`: render `role="list"` (overridable by a passed `role`), and reset `list-style: none; margin: 0; padding: 0` through `.ds-stack:is(ul, ol), .ds-grid:is(ul, ol)`. The reset also applies when `asChild` is a `ul` / `ol`, but then the consumer adds `role="list"` themselves.
- Value mapping: direction vertical → `flex-direction: column`, horizontal → `row`. align start / center / end / stretch / baseline → `align-items: flex-start / center / flex-end / stretch / baseline` (Grid: `start / center / end / stretch`). justify start / center / end / between → `justify-content: flex-start / center / flex-end / space-between`. wrap → `flex-wrap: wrap`, else `nowrap`. columns n → `grid-template-columns: repeat(n, minmax(0, 1fr))`. gap 4 → `gap: var(--ds-space-4)`, and the same pattern for every step in the Tokens table; gap 0 → `gap: 0`.
- `display: flex` (Stack) and `display: grid` (Grid), both block-level. Neither sets width, height, `min-width`, `flex` on itself or any style on its children.

## Sizes

Layout has no component sizes. Its "sizes" are the gap steps, the column counts and the breakpoints.

### Gap steps (canvas sections 01, 02, 08)

| `gap` | px | Token | Typical use |
| --- | --- | --- | --- |
| `0` | 0 | none (literal `0`) | children that carry their own spacing, such as 44 px rows |
| `1` | 4 | `--ds-space-1` | icon to text |
| `2` | 8 | `--ds-space-2` | tags, chips, label to hint |
| `3` | 12 | `--ds-space-3` | button groups |
| `4` | 16 | `--ds-space-4` | **Stack default**; mobile gutter |
| `6` | 24 | `--ds-space-6` | **Grid default**; field to field, card to card |
| `8` | 32 | `--ds-space-8` | |
| `12` | 48 | `--ds-space-12` | groups inside a section |
| `16` | 64 | `--ds-space-16` | |
| `24` | 96 | `--ds-space-24` | page sections |

Any other number (`gap={5}`, `gap={10}`) is a TypeScript error. One `gap` sets both the row and the column gap. In a wrapping Stack the gap also separates lines (canvas section 05). Children with `display: none` don't create a gap (CSS `gap`, not margins).

### Columns (canvas section 07)

| `columns` | Tracks | Typical use |
| --- | --- | --- |
| `1` (default) | 1 | mobile, single column forms |
| `2` | 2 equal | tablet cards, form pairs |
| `3` | 3 equal | card rows |
| `4` | 4 equal | desktop cards |
| `6` | 6 equal | thumbnails, contact sheets |
| `12` | 12 equal | page layout; children span tracks |

- Tracks are `minmax(0, 1fr)`, so long content (an unbroken URL, a wide image) can't push a column wider than its share.
- Rows are implicit and auto-sized; the Grid fills row by row (`grid-auto-flow: row`, never `dense`). An incomplete last row leaves empty cells.
- Spanning: children use Tailwind `col-span-1` … `col-span-12`, with breakpoint prefixes (`col-span-12 md:col-span-8`). These utilities already exist (the theme only clears colors, radii and shadows) and use the same breakpoints as the Grid's keys. The Grid does not add a span API.

### Breakpoints (canvas section 09)

Viewport width, `min-width`, mobile first. The values are Tailwind v4's defaults for `sm` / `md` / `lg`, which `src/styles/tailwind.css` keeps, so Grid keys and child `md:` utilities switch at the same width.

| Key | Applies from | Range | Device |
| --- | --- | --- | --- |
| `base` | 0 | 0–639 px | mobile (canvas frames at 375 px) |
| `sm` | 640 px | 640–767 px | large phone, small tablet portrait |
| `md` | 768 px | 768–1023 px | tablet (canvas frames at 768 px) |
| `lg` | 1024 px | 1024 px and up | desktop |

No breakpoint tokens exist in `tokens.css`. The build writes the pixel values literally in the `@media` queries of `Stack.css` and `Grid.css`, with a comment pointing here, because CSS custom properties can't be used in media queries. See Token requests. Tailwind's `xl` (1280) and `2xl` (1536) are not keys of this API. The existing `@media (max-width: 479px)` in `Dialog.css` is unrelated and unchanged.

Container queries (sizing to the parent instead of the viewport) are out of scope.

## States

Stack and Grid have no interactive states: no hover, focus, active, disabled, invalid or open/closed, and no Radix `data-state`. They hold no JS state. What changes is layout only, by prop and by viewport width:

| Condition | Canvas | What changes |
| --- | --- | --- |
| Direction vertical (default) / horizontal | 01, 02 | main axis: `flex-direction: column` / `row` |
| Each gap step | 01, 02, 08 | space between children (and between lines when wrapping) |
| Stack align start / center / end / stretch / baseline | 03 | cross-axis position of each child. Stretch fills the line; a child with its own width or height keeps it. Baseline in a vertical Stack acts like start |
| Stack justify start / center / end / between | 04 | distribution of free main-axis space. A vertical Stack only has free space when its height is set by its parent |
| nowrap (default) | 05 | one line; children shrink to their content, then overflow the Stack's box (visible, not clipped) |
| wrap | 05 | children break onto new lines; gap applies between lines; order unchanged |
| Grid columns 1 / 2 / 3 / 4 / 6 / 12 | 07 | number of equal tracks |
| Grid align stretch / start / center / end | 10 | vertical position of each child in its row. Stretch (default) makes children in a row equal height |
| Responsive change at sm / md / lg | 06, 09 | any responsive prop takes the value of the largest matching key. The DOM order and therefore reading and focus order never change |
| RTL (`dir="rtl"` on an ancestor) | 03, 04 | start / end and horizontal order mirror automatically (logical flex values); nothing in the API changes |
| Empty (no children) | n/a | renders the empty element; no gap, no height |

## Keyboard

None of its own. Stack and Grid render no `tabindex`, are never focusable, handle no keys and do no roving focus. Canvas section 11.

| Key | Action |
| --- | --- |
| Tab / Shift + Tab | Moves through the focusable children in DOM order (handled by the browser and by the children). |
| Arrow keys | Nothing. A `Grid` is a layout grid, not an ARIA `grid`; it never adds arrow-key navigation. |

- Focus order = DOM order = visual order, at every breakpoint. The API has no reverse direction, no `order`, no `dense` packing and no responsive reordering, so a layout change can never make the Tab sequence disagree with what is on screen (WCAG 1.3.2, 2.4.3).
- Horizontal Stack: left to right (right to left in RTL). Vertical Stack: top to bottom. Wrapped Stack: line by line. Grid: row by row. Responsive direction changes (canvas 06 and 11) keep the same sequence.
- Focus visuals belong to the children (the standard 2 px `--ds-color-ink` ring with `--ds-focus-offset`). Stack and Grid never clip (`overflow` stays visible), so the ring is never cut off. With `gap={0}` or `gap={1}` the ring overlaps the neighbour; that is expected and still visible.

## Radix

- `Slot` from `radix-ui` (`import { Slot } from 'radix-ui'`), used exactly as in `Button` and `IconButton`: `const Comp = asChild ? Slot.Root : (as ?? 'div')`. `Slot.Root` merges `className`, `style`, event handlers and the ref onto the single child.
- No other primitive. Layout has no behavior, focus management or ARIA that Radix provides, so nothing else applies.

## Tokens

| Property | Token |
| --- | --- |
| Gap `1` / `2` / `3` / `4` / `6` / `8` / `12` / `16` / `24` | `--ds-space-1` / `--ds-space-2` / `--ds-space-3` / `--ds-space-4` / `--ds-space-6` / `--ds-space-8` / `--ds-space-12` / `--ds-space-16` / `--ds-space-24` |
| Gap `0` | none; literal `0` (unitless zero is not a spacing value) |
| Stack default gap | `--ds-space-4` |
| Grid default gap | `--ds-space-6` |
| Color, border, radius, shadow, type, padding, margin | none: the components draw nothing (list reset sets margin and padding to `0`) |
| Breakpoints 640 / 768 / 1024 px | no token yet; literal values in media queries (see Token requests) |

Canvas-only visuals (the gray-200 hatch, gray-300 dashed bounds, black-bordered sample children) use existing palette values and are not part of the components.

## Accessibility

- Roles: none by default. A `div` is a generic container and adds nothing to the accessibility tree. Semantics come from `as` or the `asChild` child: `as="nav"` / `"aside"` / `"section"` / `"main"` / `"header"` / `"footer"` give landmarks, `as="ul"` / `"ol"` give a list. Consumers label landmarks and sections (`aria-label` / `aria-labelledby`); the components pass these through.
- Lists: with `as="ul"` or `as="ol"` the component adds `role="list"`, because `list-style: none` makes Safari / VoiceOver drop list semantics. Children of a list Stack or Grid must be `li` (the consumer's job; axe checks it).
- Labels: none needed; the components have no name of their own.
- Contrast: not applicable; the components render no color. Children keep their own contrast.
- Order: reading and focus order always follow the DOM (see Keyboard). Visual reordering is not possible through the API.
- Reflow (WCAG 1.4.10): at 320 px wide content must fit in one column without horizontal scrolling. Responsive grids should use `base: 1` (or `2` for small tiles). `nowrap` horizontal Stacks with wide content can overflow on mobile; use `wrap` or a vertical `base` direction there.
- Text spacing and zoom: gaps are fixed px from the spacing scale; at 200 % zoom the viewport narrows and the breakpoints handle reflow.
- `jest-axe` should find no violations for:
  - a default Stack and a default Grid with text children
  - a horizontal Stack of buttons
  - a Stack `as="ul"` with `li` children (and that `role="list"` is present)
  - a Grid `as="ol"` with `li` children
  - a Grid `asChild` on a `section` with `aria-labelledby`
  - a Stack `as="nav"` with `aria-label`
  - nested: a Grid whose children are Stacks
- Tests (jsdom can't evaluate media queries, so assert attributes, not computed layout):
  - defaults render `ds-stack` / `ds-grid` with `data-direction="vertical" data-gap="4" data-align="stretch" data-justify="start"` and `data-columns="1" data-gap="6" data-align="stretch"`
  - a scalar prop renders the base attribute only; a responsive object renders the base attribute (default if `base` is omitted) plus one attribute per given key
  - `wrap` renders `data-wrap` only when true
  - `as` renders the given tag; `ul` / `ol` get `role="list"`, and a passed `role` wins
  - `asChild` renders the child element (no extra wrapper), with the class, data attributes and the child's own `className` merged
  - `ref` reaches the DOM node with and without `asChild`; rest props are forwarded
  - `userEvent.tab()` through three buttons in a horizontal Stack and six links in a 3-column Grid visits them in DOM order, and the Stack / Grid element itself never receives focus
  - type-level checks with `// @ts-expect-error` for `gap={5}`, `columns={5}`, `direction="row"`, and `as` together with `asChild`; `npm run typecheck` runs them
- Stories should show: every gap step in both directions, align and justify options, wrap vs nowrap, Grid at 1–4, 6 and 12 columns with spans, responsive examples from canvas sections 06 and 09 (use the Storybook viewport toolbar where available), the focus-order examples, and `as` / `asChild`.

## Token requests

- **Breakpoints**, proposed for `src/styles/tokens.css`:

  ```css
  --ds-breakpoint-sm: 640px;
  --ds-breakpoint-md: 768px;
  --ds-breakpoint-lg: 1024px;
  ```

  Why: the system has no named breakpoints, and Stack, Grid and future components need one shared set. The values equal Tailwind's defaults so `sm:` / `md:` / `lg:` utilities and the component keys agree.

  How the build handles it: CSS custom properties can't be used inside `@media` conditions, so these tokens would be reference values only (docs, `matchMedia` in JS through `getComputedStyle`, Storybook viewports). `Stack.css` and `Grid.css` write the literal `640px` / `768px` / `1024px` in their media queries with a comment naming this spec (and the tokens, if approved). A unit test may read `tokens.css` and the two CSS files and assert the numbers match. Optionally, `tailwind.css` could pin `--breakpoint-sm/md/lg` to the same literals in `@theme` so a future Tailwind default change can't move them; that is a theme change and also needs approval.

  DS-36 must not wait for this: if the request isn't approved, the build uses the literal values and the comment, and adds no `--ds-breakpoint-*` names.

- No other token is needed. `gap={0}` uses a literal `0`, not a new spacing token.
