# MONO/00 — Monochrome Design System

Minimal black / gray / white system. White ground, gray accents, black for ink and action. Photography is always monochrome. Titles in Red Hat Mono, body in Red Hat Text.

Live canvas: https://claude.ai/artifact/4R5XwSAJ1Hj8gTqgLdwTmK

## Files

| File | Contents |
| --- | --- |
| `Main.dc.html` | Foundations — color, typography, spacing, shape & line, photography |
| `Components.dc.html` | Buttons, inputs, selection controls, tags, navigation, cards, feedback, table |
| `canvas.json` | Canvas layout (artboard sizes and positions) |

## Tailwind

Tokens live in `src/styles/tokens.css` (`--ds-*`). `src/styles/tailwind.css` imports them and maps them into the Tailwind v4 theme. Import that one file, as `.storybook/preview.tsx` does, to get the fonts, tokens and utilities.

The default Tailwind palette, radii and shadows are cleared. Off-system classes such as `bg-blue-500`, `rounded-lg` or `shadow-md` generate no CSS.

| Need | Utilities |
| --- | --- |
| Palette | `bg-white`, `bg-gray-50` … `bg-gray-900`, `bg-black` (also `text-*`, `border-*`, …) |
| Semantic color | `bg-background`, `bg-surface`, `bg-surface-subtle`, `bg-fill`, `border-divider`, `border-border`, `text-disabled`, `placeholder:text-placeholder`, `text-muted`, `text-text`, `text-ink`, `bg-inverse`, `bg-primary`, `hover:bg-primary-hover`, `text-primary-contrast` |
| Fonts | `font-mono` (titles; `h1`–`h6` default to it), `font-sans` (body, default) |
| Type scale | `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-label` (add `uppercase`), `text-caption` |
| Spacing | Tailwind's numeric scale is the 4 px base: `p-1` = 4, `p-4` = 16, `gap-6` = 24, `py-24` = 96. `h-control` = 44 px |
| Shape | `rounded-md` (= 0), `border` (1 px), `focus-visible:focus-ring` (2 px black, 2 px offset) |
| Photos | `photo` (applies `grayscale(1) contrast(1.1)`) |

```tsx
<button className="h-control px-6 bg-primary hover:bg-primary-hover text-primary-contrast font-mono text-sm font-medium focus-visible:focus-ring">
  Continue
</button>
<img className="photo aspect-[4/5] object-cover" src={src} alt="" />
<span className="font-mono text-label uppercase text-muted">Series</span>
```

## Color

| Token | Hex | Role |
| --- | --- | --- |
| white | `#FFFFFF` | Background |
| gray-50 | `#F7F7F7` | Surface subtle |
| gray-100 | `#EEEEEE` | Hover / fill |
| gray-200 | `#E0E0E0` | Divider |
| gray-300 | `#C7C7C7` | Border |
| gray-400 | `#A3A3A3` | Disabled (2.5:1, non-text) |
| gray-500 | `#767676` | Placeholder (4.5:1, minimum for text) |
| gray-600 | `#595959` | Muted text (7:1) |
| gray-700 | `#404040` | Body text (10.4:1) |
| gray-800 | `#262626` | Hover on black |
| gray-900 | `#141414` | Inverse surface |
| black | `#000000` | Ink, primary action (21:1) |

No hue anywhere. Severity (error, success) is shown by border weight, fill and icon, never by color.

## Typography

| Style | Font | Size / line | Notes |
| --- | --- | --- | --- |
| display | Red Hat Mono 500 | 72 / 72 | −4% tracking |
| h1 | Red Hat Mono 500 | 48 / 53 | −3% |
| h2 | Red Hat Mono 500 | 32 / 38 | −2% |
| h3 | Red Hat Mono 500 | 22 / 29 | |
| body-lg | Red Hat Text 400 | 18 / 29 | |
| body | Red Hat Text 400 | 16 / 26 | |
| label | Red Hat Mono 500 | 12 / 16 | +8%, uppercase |
| caption | Red Hat Text 400 | 13 / 20 | gray-600 |

## Spacing

4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96.

## Shape & line

```css
--ds-radius: 0;
--ds-shadow: none; /* depth = borders + gray fills */
--ds-border: 1px solid #E0E0E0;
--ds-border-strong: 1px solid #000000;
--ds-focus: 2px solid #000000; /* outline-offset: 2px */
--ds-motion: 120ms cubic-bezier(.2, 0, 0, 1);
```

Controls are 44 px tall at default size.

## Photography

```css
--ds-photo-filter: grayscale(1) contrast(1.1);
```

- **Do:** 100% grayscale, slight contrast lift, visible grain, square corners, crops 4:5 / 1:1 / 16:9, mono caption below the image.
- **Don't:** color or partial color, sepia, duotone, gradient overlays, drop shadows, rounded corners, text over busy areas.

The canvas uses abstract SVG stand-ins in place of real photos.
