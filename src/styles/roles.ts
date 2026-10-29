/**
 * The theme contract: every role a `[data-theme]` block may override (docs/specs/Theming.md).
 * Names are full CSS custom properties. Palette primitives, spacing and component-local
 * properties are not part of the contract.
 */

const roles = <const T extends readonly string[]>(...names: T) => names;

export const colorRoles = roles(
  '--ds-color-background',
  '--ds-color-surface',
  '--ds-color-surface-subtle',
  '--ds-color-fill',
  '--ds-color-divider',
  '--ds-color-border',
  '--ds-color-disabled',
  '--ds-color-placeholder',
  '--ds-color-text-muted',
  '--ds-color-text',
  '--ds-color-text-strong',
  '--ds-color-text-emphasis',
  '--ds-color-text-inverse',
  '--ds-color-border-strong',
  '--ds-color-icon',
  '--ds-color-focus',
  '--ds-color-overlay',
  '--ds-color-inverse',
  '--ds-color-primary',
  '--ds-color-primary-hover',
  '--ds-color-primary-contrast',
  '--ds-color-info',
  '--ds-color-info-border',
  '--ds-color-info-bg',
  '--ds-color-success',
  '--ds-color-success-border',
  '--ds-color-success-bg',
  '--ds-color-error',
  '--ds-color-error-border',
  '--ds-color-error-bg',
);

export const fontRoles = roles('--ds-font-heading', '--ds-font-body', '--ds-font-label', '--ds-font-mono');

export const fontWeightRoles = roles('--ds-font-weight-regular', '--ds-font-weight-medium', '--ds-font-weight-bold');

const typeStyle = <S extends string>(style: S, parts: readonly string[]) =>
  parts.map((p) => `--ds-text-${style}-${p}` as const);

export const typeScaleRoles = [
  ...typeStyle('display', ['size', 'line-height', 'tracking']),
  ...typeStyle('h1', ['size', 'line-height', 'tracking']),
  ...typeStyle('h2', ['size', 'line-height', 'tracking']),
  ...typeStyle('h3', ['size', 'line-height', 'tracking']),
  '--ds-text-heading-weight',
  '--ds-text-heading-transform',
  ...typeStyle('body-lg', ['size', 'line-height']),
  ...typeStyle('body', ['size', 'line-height']),
  ...typeStyle('body-sm', ['size', 'line-height']),
  ...typeStyle('body-xs', ['size', 'line-height']),
  ...typeStyle('caption', ['size', 'line-height']),
  ...typeStyle('label', ['size', 'line-height', 'weight', 'tracking', 'transform']),
  ...typeStyle('ui', ['size', 'line-height', 'weight']),
  ...typeStyle('ui-sm', ['size', 'line-height']),
  ...typeStyle('ui-xs', ['size', 'line-height']),
] as readonly string[];

export const radiusRoles = roles('--ds-radius-sm', '--ds-radius-md', '--ds-radius-lg', '--ds-radius-full');

export const shadowRoles = roles('--ds-shadow-sm', '--ds-shadow-md', '--ds-shadow-lg');

export const shapeRoles = roles(
  '--ds-border-width',
  '--ds-border-width-strong',
  '--ds-focus-width',
  '--ds-focus-offset',
  '--ds-control-height',
  '--ds-motion',
  '--ds-photo-filter',
);

/** Role groups in contract order. */
export const themeRoleGroups = {
  color: colorRoles,
  font: fontRoles,
  fontWeight: fontWeightRoles,
  typeScale: typeScaleRoles,
  radius: radiusRoles,
  shadow: shadowRoles,
  shape: shapeRoles,
} as const;

export type ThemeRoleGroup = keyof typeof themeRoleGroups;

/** Every public theme role (87), as full CSS custom property names. */
export const themeRoles: readonly string[] = Object.values(themeRoleGroups).flat();

export type ThemeRole = (typeof colorRoles)[number] | (typeof fontRoles)[number] | (typeof fontWeightRoles)[number] | (typeof radiusRoles)[number] | (typeof shadowRoles)[number] | (typeof shapeRoles)[number];
