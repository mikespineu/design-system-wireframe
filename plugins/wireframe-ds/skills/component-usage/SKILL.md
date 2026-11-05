---
name: component-usage
description: Pick components from the design system manifest for a UI need and show correct usage. Use when the user builds or edits UI with design-system-test (forms, dialogs, toasts, layout), asks which component to use, how to import the CSS, wire Field and inputs, use custom icons, or replace hardcoded colors with --ds-* roles.
---

# Use the design system

Turn a UI need into components from the installed package. Never rely on a remembered component list: read the manifest of the version the project has installed.

## 1. Read the manifest

Resolve `design-system-test/manifest.json` from the consumer project (`node_modules/design-system-test/dist/manifest.json`). It lists every exported component with its props, spec path and Radix primitives, plus every `--ds-*` role with default and dark values.

1. Read the file. If it is missing, the package is not installed or is too old: tell the user to run `npm install design-system-test@latest` and stop.
2. Match the need to components by name, props and spec. Read the spec path for behavior and states when unsure.
3. Check props against the manifest entry before writing JSX. Do not invent props.
4. Prefer one component with the right props over composing primitives by hand.

## 2. Install and import CSS

```sh
npm install design-system-test react react-dom
```

Import the styles once, at the entry point, before your own CSS:

```ts
import 'design-system-test/styles.css'
import 'design-system-test/fonts.css' // optional web fonts
```

Everything else comes from the package entry: `import { Button, Field, Input } from 'design-system-test'`. The package is ESM only and ships its own types. All library CSS is in `@layer ds`, so your unlayered rules always win. Do not import files from `dist/` or `src/`.

## 3. Theming

Components read only `--ds-*` roles. Theme with a `data-theme` attribute on `html` (overlays render in a portal on `body`, so a scoped theme does not reach them):

```html
<html data-theme="dark">
```

- Built in: default and `dark`. Optional: `import 'design-system-test/themes/bold.css'` for `bold` and `bold-dark`.
- A custom brand is a `[data-theme="acme"]` block that overrides roles. Hand off to the `create-theme` skill for it.
- Replace hardcoded colors, fonts, radii and shadows in the user's code with the matching role from the manifest, for example `#0b6e4f` on a button becomes `var(--ds-color-primary)`, body text `var(--ds-color-text)`, borders `var(--ds-color-border)`, errors `var(--ds-color-error)`. Choose by meaning, not by nearest color. Never write a raw hex value or invent a `--ds-*` name that is not in the manifest.

## 4. Forms: `Field` and `useFieldControl`

`Field` owns the label, hint, error, `required` and `disabled`, and generates the ids. Any child that calls `useFieldControl()` is wired automatically: `id`, `aria-describedby` (hint and error), `aria-invalid`, `aria-required`, `disabled`. `Input` and `Textarea` already do this.

- Put exactly one control in a `Field`. Do not add your own `<label>`.
- Show errors through `error`, not custom markup. The message is announced with the control.
- For your own control, spread `useFieldControl()` on it and let explicit props win. It returns `null` outside a `Field`.
- Controls that cannot use `htmlFor` (a slider thumb) use `useFieldLabelId()` with `aria-labelledby`.
- `TextField` is `Field` plus `Input` in one when no extra wiring is needed.

Full example: `examples/SignupForm.tsx`.

## 5. Custom icons: `IconProvider`

Components use default glyphs by role (`close`, `check`, `alert`, `info`, `success`, `warning`, chevrons, ...). To re-skin them, wrap the app in `IconProvider` with a `Partial<IconSet>`, defined at module level or memoized. Make glyphs with `createIcon(name, svgChildren)` or pass any component that renders one root `svg`, spreads the props and paints with `currentColor`. A single instance can use the component's icon prop (`closeIcon`, `errorIcon`, `leadingIcon`). Order: prop, then provider, then default.

## 6. Accessibility rules

- Every control has a visible label (`Field`) or an accessible name (`aria-label` on icon-only buttons and `IconButton`).
- `Dialog` requires a `title`; give a `description` when the body needs context, and keep Cancel inside `DialogClose asChild`. Do not turn off the close button unless there is another way out.
- Toast actions need `altText`. Errors stay until closed. Use toasts for results of an action, not for content the user must read.
- Do not remove focus rings; they come from `--ds-color-focus`.
- Do not rely on color alone for state; the components pair color with icons and text.
- Keep contrast: use a text role on its matching surface role.

## Worked examples

Each file compiles against the published API and is tested in the repository.

- Form with validation: `examples/SignupForm.tsx`
- Confirm dialog flow: `examples/DialogFlow.tsx`
- Toast with action and custom icon: `examples/ToastExample.tsx`
