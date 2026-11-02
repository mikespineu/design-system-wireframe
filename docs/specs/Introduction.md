# Introduction

- task: DS-70
- canvas: docs/design-system-wireframe/Introduction.dc.html
- canvas_url: https://claude.ai/artifact/N5SZzot7DeRFzPhvikTCrL
- approved: no
- approved_by:
- approved_at:
- approval_hash:

The Storybook landing page, `src/Introduction.stories.tsx` (title `Introduction`, story `Intro`, id `introduction--intro`). Today it pitches only the gray wireframe ("No hue", "No decoration"), lists 7 of the 25 component families as plain tags, and never shows a theme, `createTheme()` or the theme switcher. The redesign is organized around three questions: why use it, how to start from it, and how to customize it.

This is a page, not a component. Nothing is added to `src/components/` or `src/index.ts`. The page is built only from shipped components (Button, Tag, SegmentedControl, Breadcrumb, TextField, Switch, Alert), native elements and Tailwind utilities that read role tokens. DS-71 builds it.

## Page structure

Six bands, in DOM and visual order. Each band is a `<section aria-labelledby="<heading id>">` inside one `<main>`. Bands are separated by a bottom rule (`--ds-border-width` solid `--ds-color-divider`); the last band has none. Content sits in a centered wrapper, max width 1280 px.

| # | Band | Heading | id |
| --- | --- | --- | --- |
| 1 | Hero | h1 | `intro-hero` |
| 2 | Why use it | h2 | `why` |
| 3 | Theme showcase | h2 | `themes` |
| 4 | Start from it | h2 | `start` |
| 5 | Customize in minutes | h2 | `customize` |
| 6 | Every component | h2 | `components` |

The canvas (section 01) shows the whole page in `default`, `dark`, `bold` and `bold-dark`. The markup is identical in all four. Only `data-theme` differs, and in Storybook the toolbar sets it on `<html>`.

### Link format

- **Storybook pages** are relative to the preview iframe and open in the manager window: `href="./?path=/docs/<id>"` or `href="./?path=/story/<id>"`, with `target="_top"`. Without `target="_top"` the manager would load inside the preview iframe. The current page uses `?path=...` with no target, which is that bug.
- **GitHub pages** use the repository from `package.json` (`repository.url`): `https://github.com/mikespineu/design-system-wireframe`, abbreviated **GH** below. Files are linked as `GH/blob/main/<path>`. These links also use `target="_top"`. Nothing opens a new tab, so no "opens in a new tab" text or external-link glyph is needed.
- **In-page:** `href="#components"`.

Every Storybook id below comes from a `title` in a `*.stories.tsx` file or a `<Meta title>` in a `*.mdx` file in this repo. Every GitHub path exists under `main` today.

### Band 1: Hero

| Element | Copy | Built with |
| --- | --- | --- |
| Eyebrow (`<p>`) | Design System Wireframe · React 19 · Radix UI | label style, muted |
| h1 | Accessible React components. Your look, in minutes. | `<h1>` |
| Lede (`<p>`) | 25 component families on Radix primitives, styled only through role tokens. Build on the black and white wireframe today, then generate your own theme with `createTheme()`, check it with `checkContrast()` and ship it in light and dark, without touching a component. | `body-lg` |
| CTA 1 | Use this template | `<Button asChild>` + `<a>` → `GH/generate` |
| CTA 2 | Create your own theme | `<Button asChild variant="secondary">` + `<a>` → `./?path=/docs/foundations-theming-create-your-own-theme--docs` |
| CTA 3 | Browse components | `<Button asChild variant="ghost">` + `<a href="#components">` |
| Theme switcher tip | Title "Theme switcher" (label style, not a heading). Text: "Pick a theme from the paintbrush menu in the Storybook toolbar. This page, every story and every docs page follow it." Then a `<ul>` of four `<Tag variant="neutral">` items: default, dark, bold, bold-dark | bordered `div`, `Tag` |
| Facts (`<dl>`) | Component families **25** · Themes included **4** · Themeable roles **87** · Coverage floor **80 %** | `<dl>`; each `<div>` holds `<dt>` (label) then `<dd>` (number). The number is drawn above the label with `flex-col-reverse`, so DOM order stays term then value |

Where the numbers come from: 25 is the family count in band 6, computed from `src/index.ts`, not typed in. 4 is `Object.keys(storybookThemes)` in `.storybook/themes.ts`. 87 is `themeRoles.length` (exported). 80 is `coverageThreshold.global.lines` in `jest.config.cjs`. DS-71 should compute the first three and take the fourth from the config or a constant with a test.

### Band 2: Why use it

h2 "Why use it". Intro: "Four things you would otherwise build yourself, each with its proof one click away."

A `<ul>` of four cards (`<li>`), each with a kicker `<p>` (label style, muted), an h3, a body `<p>` and one text link.

| Kicker | h3 | Body | Link text → href |
| --- | --- | --- | --- |
| Radix UI | Accessible by default | Every interactive part is a Radix primitive, so focus, keyboard and ARIA come from Radix, not from hand-written handlers. Names a screen reader needs, like a Dialog title or an IconButton label, are required props. | Try the Dialog keyboard story → `./?path=/story/components-dialog--keyboard` |
| Role tokens | Themed through roles | Components read only the 87 semantic roles, never raw values. All library CSS sits in `@layer ds`, so one `[data-theme]` block of yours restyles everything, in any import order. | Read the theming contract → `./?path=/docs/foundations-theming--docs` |
| createTheme() · checkContrast() | Generate and verify a theme | `createTheme()` turns one brand color, fonts, radius and shadow into a complete theme block. `checkContrast()` checks every text and UI pair against WCAG AA, so a failing theme never ships. | Read the theming guide on GitHub → `GH/blob/main/docs/theming-guide.md` |
| Stories · jest-axe · coverage | Tested like a product | A story per state, keyboard stories for every interactive component, `userEvent` and `jest-axe` in every test file. CI runs lint, typecheck and the suite with an 80 % coverage floor on every pull request. | See the CI workflow on GitHub → `GH/blob/main/.github/workflows/ci.yml` |

The link sits at the bottom of each card (`mt-auto`), so links line up across a row.

### Band 3: Theme showcase

h2 "One component set, four themes". Intro: "The screen below is stock components. Pick a theme: only the `data-theme` attribute on the panel changes, never the markup. `bold` and `bold-dark` are opt-in (`themes/bold.css`); Storybook loads them for you."

- **Bar:** `<SegmentedControl label="Preview theme" labelPosition="top" options={[default, dark, bold, bold-dark]} defaultValue="bold">`. Option labels are the theme names, in that order, read from `storybookThemes`. Next to it, aligned to the end: text link "Compare all four side by side" → `./?path=/story/foundations-themes--side-by-side`.
- **Preview panel:** a `<figure>`. Its `<figcaption>` reads "Preview" and, on the right, `<code>data-theme="<selected>"</code>`. Under the caption is a wrapper `<div data-theme="default">`, then the panel `<div data-theme={selected}>`. The reset matters: `dark` sets only color roles, so without it a dark panel on a bold page would inherit bold's fonts, radius and 48 px controls (canvas section 04, third artboard). Same pattern as `Foundations/Themes` → `Panel`.
- **Panel content**, all shipped components:
  - `<Breadcrumb items={[{ label: 'Projects' }, { label: 'Launch plan' }]} />`, with no `href`, so it adds no dead link and no tab stop
  - h3 "Launch plan", followed by `<Tag variant="solid">New</Tag>`, `<Tag variant="subtle">Q4</Tag>` and `<Tag variant="outline">Shared</Tag>`
  - `<p>` "Stock parts only: no custom CSS, nothing to restyle by hand."
  - Left column: `<TextField label="Owner" placeholder="Name or email" hint="Who signs this off?" />`, then `<Switch label="Notify the team" defaultChecked />`
  - Right column: `<Alert severity="success" title="Saved">Your changes are live.</Alert>`, then `<Button>Publish</Button>`, `<Button variant="secondary">Save draft</Button>` and `<Button variant="ghost">Cancel</Button>`. These are `type="button"` with no handler.
- The selection is local React state. It does not change the toolbar, `<html>` or the rest of the page. Changing it re-renders the same component instances, so typed text and the switch state survive a theme change.
- The default is `bold` because most visitors arrive on `default`, so the first view of the showcase already proves the restyle. If the page is on `bold`, the panel looks the same as the page until the user picks another theme. That is accepted.

### Band 4: Start from it

h2 "Start from it". Intro: "Make the repository yours and you get the components, tokens, Storybook, tests and CI in one step."

Two columns (2 : 1). Left: an `<ol>` of three steps. Each step has a decorative number (`aria-hidden`, mono, muted: 01, 02, 03), an h3, a body and its links. Right: a "Read first" card.

| Step h3 | Body | Extra |
| --- | --- | --- |
| Use the template | Create your own copy of the repository on GitHub with "Use this template". | Text link "Use this template on GitHub" → `GH/generate` |
| Run it | Install and open Storybook. Lint, typecheck and tests run the same way locally and in CI. | `<pre>` with two lines: `npm ci` and `npm run storybook`. It is not focusable, because it never overflows (shortest line fits 280 px) |
| Build your screens | Compose pages from the components below and the Tailwind utilities, or start from a pattern. | Text links "Contact form pattern" → `./?path=/story/patterns-contact-form--default` and "Configurator pattern" → `./?path=/story/patterns-configurator--default` |

"Read first" card: h3 "Read first", then a `<ul>` of link rows (same look as band 6). Each row shows the name, plus a muted tag on the right.

| Row | Tag | href |
| --- | --- | --- |
| Consumer guide | GitHub | `GH/blob/main/docs/consumer-guide.md` |
| Colors | Foundations | `./?path=/docs/foundations-colors--docs` |
| Typography | Foundations | `./?path=/docs/foundations-typography--docs` |
| Spacing | Foundations | `./?path=/docs/foundations-spacing--docs` |
| Shape and line | Foundations | `./?path=/docs/foundations-shape-and-line--docs` |

Starter guide: `docs/starter-guide.md` does not exist yet (DS-66, todo). If it is on `main` when DS-71 is built, add a first row "Starter guide · GitHub" → `GH/blob/main/docs/starter-guide.md` (stop numbers after it shift by one). If it is not, leave it out. A link to a missing file fails DS-71's link test.

### Band 5: Customize in minutes

h2 "Customize in minutes". Intro: "One brand color is enough. `createTheme()` derives the rest: neutrals, hover, focus, radius, shadow and a dark block."

Two columns (5 : 7). Left: an `<ol>` of three steps, styled like band 4, then two text links. Right: the code sample.

| Step h3 | Body |
| --- | --- |
| Generate | Call `createTheme()` with a name, a brand color and fonts. It returns a stylesheet with every role set. |
| Check | Run `checkContrast()` on the blocks. It lists every text and UI pair under WCAG AA, so your build can fail on it. |
| Turn it on | Import the CSS and set `data-theme="acme"` on `<html>`, or `"acme-dark"` for dark. |

Links: "Follow the step-by-step guide" → `./?path=/docs/foundations-theming-create-your-own-theme--docs`, and "Apply a theme: consumer guide" → `GH/blob/main/docs/consumer-guide.md#apply-a-theme`.

Code sample: a `<figure>` whose `<figcaption>` is `docs/theming-guide/samples/minimal.ts`, followed by `<pre tabIndex={0} role="region" aria-label="Code sample: minimal.ts"><code>…</code></pre>`. The content is that file, verbatim, imported with `?raw` (the same mechanism `src/docs/ThemingGuide.mdx` uses for the guide). It is never retyped, so it cannot drift. The `pre` scrolls sideways when the code is wider than the box, so it must be focusable (axe `scrollable-region-focusable`). No copy button: it would need clipboard code that nothing else in the system has.

### Band 6: Every component

h2 "Every component", with `id="components"` and `tabIndex={-1}` so "Browse components" moves focus here. It shows no focus ring, because it is a programmatic target, not a control. Intro: "All 25 families exported from `src/index.ts`, each with a docs page, a story per state and tests. Parts exported with a family are listed beside it."

This replaces the hand-kept list (`const components = ['Button', 'IconButton', …]`, 7 entries). Groups are laid out in CSS columns (3 on desktop, 2 on tablet, 1 on phone; `break-inside-avoid` per group). Each group has an h3 and a `<ul>` of link rows. A row shows the family name, the other exports of that family (mono, muted, right-aligned, wrapping under the name on narrow widths) and a decorative `chevron-right` glyph (`useIcon('chevron-right')`, `aria-hidden`). The row's accessible name is the family name followed by its parts, which is fine. If the builder wants the name only, put the parts in a `<span aria-hidden>` and add nothing else.

| Group (h3) | Family → docs id | Also exported with it |
| --- | --- | --- |
| Actions | Button → `components-button--docs` | |
| | IconButton → `components-iconbutton--docs` | |
| | ButtonGroup → `components-buttongroup--docs` | |
| Forms | Input → `components-input--docs` | Field, TextField |
| | Textarea → `components-textarea--docs` | TextareaField, TextareaCounter |
| | Select → `components-select--docs` | SelectField |
| | Checkbox → `components-checkbox--docs` | CheckboxGroup |
| | RadioGroup → `components-radiogroup--docs` | RadioGroupItem |
| | Switch → `components-switch--docs` | |
| | SegmentedControl → `components-segmentedcontrol--docs` | |
| | TileGroup → `components-tilegroup--docs` | |
| | Slider → `components-slider--docs` | SliderField |
| Overlays | Dialog → `components-dialog--docs` | DialogClose |
| | Drawer → `components-drawer--docs` | DrawerClose |
| | Popover → `components-popover--docs` | |
| | Tooltip → `components-tooltip--docs` | TooltipProvider |
| | InfoTip → `components-infotip--docs` | |
| Feedback | Alert → `components-alert--docs` | |
| | Toast → `components-toast--docs` | ToastProvider, Toaster, useToast |
| | Tag → `components-tag--docs` | Badge |
| Navigation | Breadcrumb → `components-breadcrumb--docs` | BreadcrumbLink |
| | Tabs → `components-tabs--docs` | |
| Layout | Stack → `layout-stack--docs` | |
| | Grid → `layout-grid--docs` | |
| Icons | Icon → `foundations-icon--docs` | IconProvider, createIcon, useIcon |

Every href is `./?path=/docs/<id>` with `target="_top"`. Stack and Grid live under `Layout/` and Icon under `Foundations/` in Storybook, which is why their ids differ.

The 25 families are the 25 component folders that `src/index.ts` re-exports (`ChoiceGroup` is internal and not exported). Together, the families and their parts cover all 40 PascalCase runtime exports of `src/index.ts`. `Toast` is a family name for the `src/components/Toast` folder; there is no `Toast` export, so its row names the folder and lists the three real exports.

Under the groups, a muted `<p>`: "Also exported: the hooks `useMediaQuery` and `useToast`; the theme tools `createTheme`, `checkContrast` and `generateScale`; the role lists `themeRoles`, `themeRoleGroups`, `colorRoles`, `fontRoles`, `fontWeightRoles`, `typeScaleRoles`, `radiusRoles`, `shadowRoles` and `shapeRoles`."

**Derivation (DS-71):** keep the list as data in the story file, `{ group, family, docsId, parts[] }[]`. A test imports `* as pkg from '../src/index'`, takes every key that starts with an uppercase letter, and fails if a key is neither a `family` nor in some `parts` (except `Toast`, which is not a key). It also fails if a `family` or a part is not a key of `pkg`, again except `Toast`. Adding a component without listing it, or listing one that does not exist, then fails CI. The "25" fact is `families.length`.

### Removed from today's page

The three rules ("No hue", "No decoration", "Theme later"), the "Real screens, no styling" band (its demo moves into the showcase panel), the Tailwind install snippet, and the hand-kept 7-item component list. The foundations links move into "Read first".

## Sizes

The page has no size prop. It has three layouts, set by Tailwind's default breakpoints (`md` 768 px, `lg` 1024 px). The canvas draws desktop at a 1248 px artboard (section 01) and phone at 375 px (section 02). Tablet is described here only.

| Property | Phone (< 768, designed at 375, min 320) | Tablet (768–1023) | Desktop (≥ 1024) |
| --- | --- | --- | --- |
| Side gutter | 24 px (`px-6`) | 48 px (`md:px-12`) | 48 px |
| Band padding | 64 px (`py-16`) | 96 px (`md:py-24`) | 96 px |
| h1 | `heading-lg` (h2 size) | `md:heading-xl` | `lg:heading-2xl` (display), max width 16ch |
| Band h2 | `heading-md` (h3 size) | `md:heading-xl` | same |
| Card and step h3 | `heading-sm` | `md:heading-md` | same |
| Group h3 (band 6) | `heading-sm` | same | same |
| Lede and intros | `body-md` | `md:body-lg` | same |
| Hero CTAs | stacked, full width (`flex-col`, `w-full`) | in a row (`md:flex-row`, `md:w-auto`) | row |
| Facts | 2 × 2 | 4 in a row | 4 in a row |
| Why cards | 1 column | 2 columns | 4 columns |
| Showcase bar | SegmentedControl above the link | side by side, wrapping | side by side |
| Showcase panel | padding 16 px, one column | padding 32 px, two columns | two columns |
| Start from it | steps, then Read first | same as phone | 2 : 1 columns |
| Customize | steps and links, then code | same as phone | 5 : 7 columns |
| Step number | above the h3 | beside (64 px column) | beside |
| Component groups | 1 column | 2 columns | 3 columns |

The h1 steps down to the h2 size on phone because the bold display face (uppercase, weight 800, 56 px at h1) cannot fit "ACCESSIBLE" in a 327 px column. Headings also get `break-words` as a guard for long words at 320 px.

The SegmentedControl keeps its default `md` size on phone (`sm` is for fine pointers only). If the four options are wider than the column, which happens in bold and bold-dark at 375 px, the strip scrolls sideways with its built-in fade. The code sample scrolls inside its focusable box.

## States

The page itself has no states. Its interactive parts are listed here, matching canvas section 03 (rest, hover, focus-visible in each theme) and section 04 (each showcase selection).

| Part | Rest | Hover | Focus-visible | Other |
| --- | --- | --- | --- | --- |
| CTA primary (Button) | fill and border `primary`, label `primary-contrast` | fill and border `primary-hover` | shared ring: `focus-width` solid `focus`, `focus-offset` | From Button. Disabled and loading are not used |
| CTA secondary (Button) | fill `surface`, border `border-strong`, label `text-emphasis` | fill `fill` | shared ring | From Button |
| CTA ghost (Button) | transparent, underlined label `text-emphasis` | fill `fill` | shared ring | From Button |
| Text link (`<a>`) | label `text-emphasis`, underline at `border-width` thickness, 4 px offset; chevron in `icon` | underline at `border-width-strong` thickness; no fill | shared ring around the 44 px (bold 48 px) box | No visited style. The color never changes, so the underline carries the link |
| Link row (`<a>`, bands 4 and 6) | name `text-emphasis`, parts `text-muted`, chevron `icon`; bottom rule `divider` | fill `fill` | shared ring | Whole row is the target (min height `control-height`) |
| Theme switcher (SegmentedControl) | strip `fill`; selected segment has `surface` fill, `border-strong` border, `text-emphasis` label; others `text` | unselected segment gets `divider` fill and `text-emphasis` label | ring on the focused segment (Tab lands on the selected one) | From SegmentedControl. The selected segment moves with arrows; the panel retheme follows immediately |
| Preview panel | `data-theme` = selection; panel border `border-strong`, radius `radius-lg`, shadow `shadow-lg`, ground `background` of the selected theme | none | none (not focusable) | Caption code updates with the selection |
| Demo controls (TextField, Switch, Buttons) | as shipped | as shipped | as shipped | Fully interactive, but they do nothing |
| Code sample (`<pre>`) | `surface-subtle` fill, `divider` border, `text-strong` text | none | shared ring on the box | Scrolls with arrow keys when focused and overflowing |
| "Every component" h2 | | | no ring (`focus:outline-none`); receives focus after "Browse components" | |

The same CSS applies in all four themes, so the states change only through roles. In bold and bold-dark, borders are 2 px and strong borders 3 px, the ring is 3 px, and controls are 48 px tall.

## Keyboard

There is no custom key handling. Everything comes from native links and the shipped components.

| Key | Where | Does |
| --- | --- | --- |
| Tab / Shift+Tab | page | Next / previous stop in the order below |
| Enter | link, CTA, row | Follows it. Storybook and GitHub links load in the top window. "Browse components" scrolls to band 6 and moves focus to its h2 (native fragment navigation plus `tabIndex={-1}`) |
| Arrow keys | Preview theme | Move and select (Radix RadioGroup through SegmentedControl); wraps at the ends. The panel retheme follows |
| Home / End | Preview theme | Move focus to the first / last segment (shipped SegmentedControl behavior) |
| Space | segment, switch, demo button | Selects / toggles / activates (demo buttons do nothing) |
| Arrow keys | focused code sample | Scroll it sideways when it overflows |

**Tab order** (canvas section 05). It is DOM order, nothing uses a positive `tabIndex`, and it is the same at every width.

1. Use this template
2. Create your own theme
3. Browse components
4–7. The four card links, left to right
8. Preview theme (selected segment)
9. Compare all four side by side
10. Owner (TextField)
11. Notify the team (Switch)
12–14. Publish, Save draft, Cancel
15. Use this template on GitHub
16–17. Contact form pattern, Configurator pattern
18–22. Read first rows: Consumer guide, Colors, Typography, Spacing, Shape and line (one more if the starter guide row is added)
23–24. Follow the step-by-step guide, Apply a theme: consumer guide
25. minimal.ts code sample
26–50. The 25 component rows, in data order: Actions, Forms, Overlays, Feedback, Navigation, Layout, Icons

The component list is last on purpose, so its 25 stops never stand between a keyboard user and the guides. DOM order matches visual order at every breakpoint: columns are source-ordered, and CSS columns flow top to bottom in DOM order.

## Radix

No new primitive. The page is content: headings, text and native `<a>` links, which need no Radix behavior. The interactive parts are shipped wrappers that already sit on Radix:

- SegmentedControl → Radix `RadioGroup` (arrow keys, roving focus, `aria-checked`)
- Switch → Radix `Switch` and `Label`
- Button with `asChild` → Radix `Slot`, so the CTAs render as `<a>` with the button look
- TextField → Field and Input (Radix `Label`)

The theme switcher tip only points at the Storybook toolbar (`@storybook/addon-themes`); the page does not drive it. Driving it would mean calling Storybook's globals API from the story. That was rejected for now: it couples the page to Storybook internals and makes the jest render harder. See the open question in the hand-off.

## Tokens

Style through Tailwind utilities that read roles, or through inline `style` with `var(...)` on a role, as `src/foundations/Themes.stories.tsx` does. Tailwind scans all of `src`, so every new utility used only on this page is added to the shipped `dist/styles.css`. Prefer utilities that already exist (the ones the current page, the components or `tailwind.css` use), and use inline role styles for one-offs. No raw colors, sizes or shadows.

| Property | Token | Utility (or inline) |
| --- | --- | --- |
| Page ground | `--ds-color-background` | `bg-background` |
| Body text | `--ds-color-text` | `text-text`, `body-md` |
| Headings, link labels, row names | `--ds-color-text-emphasis` | `heading-*` (include it), `text-emphasis` |
| Eyebrow, kickers, facts labels, parts, step numbers, captions | `--ds-color-text-muted` | `text-muted` |
| Code text, npm commands | `--ds-color-text-strong` | `text-text-strong` |
| Cards, Read first card | `--ds-color-surface`, border `--ds-color-divider` at `--ds-border-width`, `--ds-radius-lg`, `--ds-shadow-sm` | `bg-surface border-line border-divider rounded-lg shadow-sm` |
| Theme switcher tip | `--ds-color-surface-subtle`, border `--ds-color-border` at `--ds-border-width`, `--ds-radius-md` | `bg-surface-subtle border-line border-border rounded-md` |
| Code box, command box | `--ds-color-surface-subtle`, border `--ds-color-divider`, `--ds-radius-lg` (code), `--ds-radius-md` (commands) | `bg-surface-subtle border-line border-divider rounded-lg` / `rounded-md` |
| Preview panel | border `--ds-color-border-strong` at `--ds-border-width`, `--ds-radius-lg`, `--ds-shadow-lg`, ground `--ds-color-background` (all from the selected theme) | `border-line border-strong rounded-lg shadow-lg bg-background` |
| Band rule, step rules, row rules | `--ds-border-width` solid `--ds-color-divider` | inline `borderBottom` / `borderTop` (`border-line` sets all four sides) |
| Facts top rule | `--ds-border-width` solid `--ds-color-divider` | inline `borderTop` |
| Row hover | `--ds-color-fill` | `hover:bg-fill` |
| Text link underline | thickness `--ds-border-width`, hover `--ds-border-width-strong`; offset `--ds-space-1` | `underline underline-offset-4` + thickness via `decoration-[length:var(--ds-border-width)] hover:decoration-[length:var(--ds-border-width-strong)]` |
| Focus ring | `--ds-focus-width`, `--ds-color-focus`, `--ds-focus-offset` | `focus-visible:focus-ring` |
| Link and row height | `--ds-control-height` | `min-h-control` |
| Chevron and icon color | `--ds-icon-size-md`, `--ds-color-icon` | `Icon size="md"`, `text-icon` |
| Eyebrow, kicker, tip title, facts labels | `--ds-font-label`, `--ds-text-label-size`, `--ds-text-label-line-height`, `--ds-text-label-weight`, `--ds-text-label-tracking`, `--ds-text-label-transform` | `font-label text-label case-label` |
| Link and row label | `--ds-font-label`, `--ds-text-ui-size`, `--ds-text-ui-line-height`, `--ds-text-ui-weight` | `font-label text-ui` |
| Parts, captions, code | `--ds-font-mono`, `--ds-text-ui-sm-size` (parts), `--ds-text-caption-size` and `--ds-text-caption-line-height` (code, captions) | `font-mono text-ui-sm` / `font-mono text-caption` |
| Facts numbers | `--ds-font-heading`, `--ds-text-h2-size`, `--ds-text-h2-line-height`, `--ds-text-heading-weight` | `font-heading text-h2 text-emphasis` |
| h1 / h2 / h3 | `--ds-text-display-size`, `--ds-text-h1-size`, `--ds-text-h2-size`, `--ds-text-h3-size` (with their line height and tracking), `--ds-text-body-lg-size` (h4 look), `--ds-text-heading-weight`, `--ds-text-heading-transform`, `--ds-font-heading` | `heading-2xl`, `heading-xl`, `heading-lg`, `heading-md`, `heading-sm` per Sizes |
| Lede and intros | `--ds-text-body-lg-size`, `--ds-text-body-lg-line-height` | `body-lg` |
| Tip text, "Also exported" | `--ds-text-body-sm-size`, `--ds-text-body-sm-line-height` | `body-sm` |
| Gaps | `--ds-space-2`, `--ds-space-3`, `--ds-space-4`, `--ds-space-6`, `--ds-space-8`, `--ds-space-12` | `gap-2` … `gap-12`, `mt-*` |
| Band padding | `--ds-space-16` (phone), `--ds-space-24` | `py-16 md:py-24` |
| Gutters | `--ds-space-6`, `--ds-space-12` | `px-6 md:px-12` |
| Card padding | `--ds-space-6` | `p-6` |
| Panel padding | `--ds-space-4` (phone), `--ds-space-8` | `p-4 md:p-8` |
| Step number column | `--ds-space-16` | `md:grid-cols-[var(--ds-space-16)_1fr]` or inline |
| Content max width | none (layout constant, 1280 px, as today) | `max-w-[1280px]` (already on the current page) |

## Accessibility

**Structure**
- One `<main>`. Each band is a `<section aria-labelledby>` pointing at its heading, so it is a named region.
- Heading outline (canvas section 05): h1 (hero); then h2 per band; then h3 under each h2 (cards, "Launch plan" inside the panel, steps, "Read first", the component groups). One h1 and no skipped levels. The eyebrow, kickers, tip title, step numbers and facts are not headings.
- Lists: Why cards (`<ul>`), steps (`<ol>`), Read first and each component group (`<ul>`), theme names in the tip (`<ul>`). If list styling is removed with `list-none`, add `role="list"` so Safari keeps the list semantics.
- Facts are a `<dl>`; the reverse visual order keeps term before value in the DOM.
- Step numbers are `aria-hidden`; the `<ol>` carries the order.
- The showcase is a `<figure>`. Its `<figcaption>` names the active theme, and the SegmentedControl group label is "Preview theme".
- The demo Breadcrumb is a second `nav` named "Breadcrumb". It has no links. The demo Alert is `role="status"` and is not re-announced when the theme changes, because its content does not change.
- The code sample is `<pre tabIndex={0} role="region" aria-label="Code sample: minimal.ts">`.
- Every glyph (chevrons, Alert icon) is decorative and `aria-hidden`.

**Links**
- Link text names the destination on its own ("Read the theming guide on GitHub", not "Read more").
- "Create your own theme" (hero) and "Follow the step-by-step guide" (band 5) go to the same page under different names. "Use this template" and "Use this template on GitHub" share a destination and nearly the same name. Both pairs are acceptable.
- Targets are at least 44 px tall (48 px in bold), from `min-h-control`.

**Contrast** (canvas section 06). Computed from the token values and rounded down. Every page-level pair passes in all four themes.

| Pair | default | dark | bold | bold-dark |
| --- | --- | --- | --- | --- |
| text on background | 10.3 | 10.8 | 11.7 | 12.1 |
| text-muted on background | 7.0 | 7.3 | 6.9 | 8.8 |
| text-emphasis on background | 21.0 | 17.1 | 16.2 | 17.0 |
| text on surface | 10.3 | 10.8 | 13.1 | 11.4 |
| text-muted on surface | 7.0 | 7.3 | 7.6 | 8.2 |
| text on surface-subtle | 9.6 | 9.7 | 10.7 | 10.4 |
| text-strong on surface-subtle | 14.1 | 12.4 | 12.8 | 12.3 |
| text-muted on surface-subtle | 6.5 | 6.5 | 6.3 | 7.5 |
| primary-contrast on primary | 21.0 | 17.1 | 9.1 | 6.8 |
| text-emphasis on fill (row hover) | 18.0 | 14.1 | 13.7 | 13.0 |
| text on fill (unselected segment) | 8.9 | 8.9 | 9.9 | 9.3 |
| focus on background (3:1 needed) | 21.0 | 17.1 | 8.2 | 6.8 |

The lowest pair is 6.3:1 (bold, muted text on surface-subtle), above the 4.5:1 that text needs. The components inside the preview panel are covered by their own specs and by `checkContrast()` (bold and bold-dark pass every required pair). The bold panel shown on a bold-dark page is a separate theme scope, so no page color sits on a panel color.

**What DS-71's tests should verify**
- `jest-axe` has no violations with `document.documentElement.dataset.theme` set to each of `default`, `dark`, `bold` and `bold-dark` (four runs), and with the showcase set to each selection. jsdom cannot compute color contrast, so contrast is covered by the table above and the Storybook a11y addon, not by jest.
- Tab order matches the list above (`userEvent.tab()` through all 50 stops, checking each accessible name).
- Arrow keys in "Preview theme" change the panel's `data-theme` and the caption, and the reset wrapper has `data-theme="default"`.
- "Browse components" has `href="#components"`, and `#components` is the band 6 h2 with `tabIndex=-1`.
- Exactly one h1, and no heading level skips.
- Every Storybook href's id exists: build the id set from the story and MDX titles, or from `storybook-static/index.json` when it is present. Every `GH/blob/main/<path>` resolves to a file in the repo (anchor part ignored). Every link has `target="_top"`.
- The component list covers every PascalCase runtime export of `src/index.ts` and nothing else (see Band 6, Derivation).
- The code sample text equals `docs/theming-guide/samples/minimal.ts`.

## Token requests

None. Every value maps to an existing role token. The 1280 px content width is a layout constant the current page already uses.
