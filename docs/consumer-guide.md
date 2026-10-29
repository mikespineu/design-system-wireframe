# Consumer guide

How to install the design system, load its CSS, use the components and apply a theme. Every path and name here comes from `package.json`, `src/index.ts` and `src/styles/tokens.css`.

- [Install](#install)
- [Import the CSS](#import-the-css)
- [Use components](#use-components)
- [Apply a theme](#apply-a-theme)
- [Bring your own icons](#bring-your-own-icons)
- [Reference](#reference)

## Install

The package is `design-system-test`. React 19 is a peer dependency; `radix-ui` is installed with the package.

```bash
npm install design-system-test react react-dom
```

It is ESM only (`"type": "module"`, one `import` entry) and ships its own TypeScript types. Your bundler must handle CSS imports from `node_modules` (Vite, webpack with css-loader and Next.js do).

## Import the CSS

The package exposes three entry points (see `exports` in `package.json`):

| Import | What it is |
| --- | --- |
| `design-system-test` | The components, hooks and types (JavaScript) |
| `design-system-test/styles.css` | Required. Tokens, component CSS and the Tailwind utilities the components use, in one file |
| `design-system-test/fonts.css` | Optional. Loads Red Hat Mono and Red Hat Text from Google Fonts for the default look |

Import the stylesheet once, at your app entry, next to the React root:

```tsx
// main.tsx
import 'design-system-test/styles.css';
import 'design-system-test/fonts.css'; // optional, see below
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);
```

Notes:

- The library never loads fonts by itself. Skip `fonts.css` if you set `--ds-font-heading`, `--ds-font-body` and `--ds-font-label` in your own theme (see below), otherwise text falls back to the system fonts in those variables.
- All library CSS is in `@layer ds`. Any unlayered rule of yours, such as a `[data-theme="acme"]` block, wins no matter the import order.
- Tokens are CSS custom properties (`--ds-*`) defined on `:root`, so they work without any wrapper element.

## Use components

Everything is a named export from the package root:

```tsx
import { Button, Stack, Dialog, DialogClose, Input } from 'design-system-test';

export function Example() {
  return (
    <Stack>
      <Input placeholder="Email" />
      <Button variant="primary">Save</Button>
      <Dialog
        trigger={<Button variant="secondary">Delete</Button>}
        title="Delete item?"
        description="This cannot be undone."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button>Delete</Button>
          </>
        }
      />
    </Stack>
  );
}
```

Exported components: Alert, Breadcrumb, Button, ButtonGroup, Checkbox, Dialog, Drawer, Grid, Icon, IconButton, InfoTip, Input, Popover, RadioGroup, SegmentedControl, Select, Slider, Stack, Switch, Tabs, Tag, Textarea, TileGroup, Toast, Tooltip. The hook `useMediaQuery` is exported too. The full list of props, states and keyboard behavior is in [Storybook](https://ds.mikespin.dev/), one story per state.

Conventions:

- Components forward refs and rest props to the underlying [Radix](https://www.radix-ui.com/primitives) primitive, so `className`, `data-*` and ARIA attributes pass through. Where it applies, `asChild` renders your element (for example a router link) with the component's styling.
- Radix owns focus, keyboard and ARIA. Required labels (a Dialog `title`, an `IconButton` label) are required props, not options.
- Variants are small unions, for example `Button` `variant`: `'primary' | 'secondary' | 'ghost'`.

### Toasts

Toasts need a provider and one `Toaster`, both near the app root, the `Toaster` after the page content:

```tsx
import { ToastProvider, Toaster, useToast, Button } from 'design-system-test';

function SaveButton() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ severity: 'success', title: 'Saved' })}>Save</Button>;
}

export const Root = () => (
  <ToastProvider>
    <SaveButton />
    <Toaster />
  </ToastProvider>
);
```

### Styling with the tokens

Use the `--ds-*` variables in your own CSS so your UI follows the active theme:

```css
.card {
  background: var(--ds-color-surface);
  color: var(--ds-color-text);
  border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-md);
}
```

## Apply a theme

A theme is a set of overrides of the semantic roles (colors, fonts, type scale, radii, shadows, shape) under a `[data-theme="<name>"]` selector. Components read only roles, never raw values. The contract is described in [`docs/specs/Theming.md`](specs/Theming.md).

### Built-in themes

The stylesheet contains two themes:

- `default` (also applied on `:root`, so no attribute is needed): white ground, gray accents, black ink.
- `dark`: overrides the color roles only.

Set the attribute on `html` to switch the whole app:

```html
<html data-theme="dark">
```

or in code:

```ts
document.documentElement.dataset.theme = 'dark';
```

### Your own theme

Write a block that overrides only the roles you want, and put it in your own CSS (any import order works because of `@layer ds`). Roles you leave out inherit from the default theme.

```css
/* acme.css */
[data-theme="acme"] {
  --ds-color-primary: #5b2a86;
  --ds-color-primary-hover: #451f66;
  --ds-color-primary-contrast: #ffffff;
  --ds-color-focus: #5b2a86;
  --ds-radius-md: 8px;
  --ds-font-body: 'Inter', system-ui, sans-serif;
}
```

```html
<html data-theme="acme">
```

Guidelines:

- Override related roles together: primary, primary-hover and primary-contrast; inverse and text-inverse; each status triple (`info`, `success`, `error`: color, border, bg); the background together with every text role it carries. Keep text contrast at WCAG AA.
- For a dark variant of your theme, add a second block such as `[data-theme="acme-dark"]`, starting from the `dark` values in `src/styles/tokens.css`.
- Fonts: set `--ds-font-heading`, `--ds-font-body`, `--ds-font-label` and load the font files yourself.
- Palette steps (`--ds-color-gray-*`), spacing, icon sizes and strokes are not part of the contract; do not override them.
- The list of themeable roles is exported as data from the package: `themeRoles`, `themeRoleGroups`, `colorRoles`, `fontRoles`, `fontWeightRoles`, `typeScaleRoles`, `radiusRoles`, `shadowRoles`, `shapeRoles`, and the type `ThemeRole`.

```ts
import { themeRoles } from 'design-system-test';
// e.g. validate a theme object: every key must be in themeRoles
```

### Scoped themes and portals

`data-theme` can also be set on a subtree (a dark card in a light page); roles resolve from the nearest ancestor with the attribute. Overlay components (Dialog, Drawer, Popover, Tooltip, Select, Toast) render into a portal on `document.body`, so a theme scoped to a subtree does not reach them. Set the theme on `html` (or `body`) when overlays must follow it.

## Bring your own icons

Components use a small built-in glyph set by role. Replace glyphs for a subtree with `IconProvider`; define the `icons` object at module level or memoize it:

```tsx
import { IconProvider } from 'design-system-test';
import { X } from 'lucide-react';

const icons = { close: X };

export const Root = ({ children }) => <IconProvider icons={icons}>{children}</IconProvider>;
```

`Icon` takes any component with the same props as an SVG icon (`<Icon icon={X} label="Close" />`), so Lucide, Heroicons, Phosphor and Tabler icons work. Role names and sizes are in the Icon stories and [`docs/specs/Icon.md`](specs/Icon.md).

## Reference

- Live catalogue: [ds.mikespin.dev](https://ds.mikespin.dev/)
- Theming contract: [`docs/specs/Theming.md`](specs/Theming.md)
- Tokens: [`src/styles/tokens.css`](../src/styles/tokens.css)
- Component specs: [`docs/specs/`](specs/)
