/**
 * The `bold` and `bold-dark` demo themes (docs/specs/Themes.md, "createTheme() input").
 *
 * Each theme is `createTheme()` output for the spec input, followed by a second block with the same
 * selector that sets the roles the generator cannot (hand-tuned colors, weights, type scale, shape).
 * The appended block wins by source order. `bold.css` is this file's `boldCss`, checked in a test, so the
 * shipped CSS cannot drift from the generator. To regenerate it: `npm run themes:generate`.
 */
import { checkContrast, type ContrastReport } from '../theme/checkContrast'
import { createTheme, type Theme, type ThemeBlock, type ThemeConfig } from '../theme/createTheme'
import { themeRoles } from '../styles/roles'

const fonts = {
  heading: "'Bricolage Grotesque', 'Arial Black', system-ui, sans-serif",
  body: "'Figtree', system-ui, sans-serif",
  label: "'Figtree', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
}
const radius = { sm: '8px', md: '14px', lg: '24px', full: '9999px' } as const

export const boldConfig: ThemeConfig = {
  name: 'bold',
  brand: '#4318D1',
  neutral: '#140E3D',
  fonts,
  radius,
  shadow: { sm: '0 2px 0 #140e3d', md: '0 4px 0 #140e3d', lg: '8px 8px 0 #140e3d' },
  mode: 'light',
}

export const boldDarkConfig: ThemeConfig = {
  name: 'bold-dark',
  brand: '#4318D1',
  neutral: '#140E3D',
  fonts,
  radius,
  shadow: { sm: '0 2px 0 rgb(0 0 0 / 0.6)', md: '0 4px 0 rgb(0 0 0 / 0.6)', lg: '8px 8px 0 #4318d1' },
  mode: 'dark',
}

/** The 24 non-status color roles (status triples come from the generator). */
const boldColors: Record<string, string> = {
  '--ds-color-background': '#f4f1ff',
  '--ds-color-surface': '#ffffff',
  '--ds-color-surface-subtle': '#ebe6fc',
  '--ds-color-fill': '#e3dcfb',
  '--ds-color-divider': '#d5ccf5',
  '--ds-color-border': '#8478b8',
  '--ds-color-disabled': '#b3aad9',
  '--ds-color-placeholder': '#63579a',
  '--ds-color-text-muted': '#554a8a',
  '--ds-color-text': '#2f2766',
  '--ds-color-text-strong': '#221b52',
  '--ds-color-text-emphasis': '#140e3d',
  '--ds-color-text-inverse': '#f4f1ff',
  '--ds-color-border-strong': '#140e3d',
  '--ds-color-icon': '#140e3d',
  '--ds-color-focus': '#4318d1',
  '--ds-color-overlay': 'rgb(20 14 61 / 0.6)',
  '--ds-color-inverse': '#140e3d',
  '--ds-color-primary': '#4318d1',
  '--ds-color-primary-hover': '#3510a8',
  '--ds-color-primary-contrast': '#ffffff',
  '--ds-color-info': '#2f2766',
  '--ds-color-info-border': '#d5ccf5',
  '--ds-color-info-bg': '#ebe6fc',
}

const boldDarkColors: Record<string, string> = {
  '--ds-color-background': '#120d2e',
  '--ds-color-surface': '#19133a',
  '--ds-color-surface-subtle': '#211a4a',
  '--ds-color-fill': '#2a2259',
  '--ds-color-divider': '#3a3170',
  '--ds-color-border': '#7c70c2',
  '--ds-color-disabled': '#4d4485',
  '--ds-color-placeholder': '#9a90d6',
  '--ds-color-text-muted': '#b3abe6',
  '--ds-color-text': '#d2ccf5',
  '--ds-color-text-strong': '#e3dffa',
  '--ds-color-text-emphasis': '#f5f3ff',
  '--ds-color-text-inverse': '#120d2e',
  '--ds-color-border-strong': '#f5f3ff',
  '--ds-color-icon': '#f5f3ff',
  '--ds-color-focus': '#a08cff',
  '--ds-color-overlay': 'rgb(8 5 26 / 0.75)',
  '--ds-color-inverse': '#e3dffa',
  '--ds-color-primary': '#a08cff',
  '--ds-color-primary-hover': '#8b73ff',
  '--ds-color-primary-contrast': '#120d2e',
  '--ds-color-info': '#d2ccf5',
  '--ds-color-info-border': '#4d4485',
  '--ds-color-info-bg': '#211a4a',
}

/** Weight, type scale and shape roles shared by both bold modes (except the photo filter). */
const boldShared: Record<string, string> = {
  '--ds-font-weight-medium': '600',
  '--ds-text-display-size': '5rem',
  '--ds-text-display-line-height': '0.95',
  '--ds-text-display-tracking': '-0.02em',
  '--ds-text-h1-size': '3.5rem',
  '--ds-text-h1-line-height': '1',
  '--ds-text-h1-tracking': '-0.015em',
  '--ds-text-h2-size': '2.25rem',
  '--ds-text-h2-line-height': '1.1',
  '--ds-text-h2-tracking': '-0.01em',
  '--ds-text-h3-size': '1.5rem',
  '--ds-text-h3-line-height': '28px',
  '--ds-text-h3-tracking': '0',
  '--ds-text-heading-weight': '800',
  '--ds-text-heading-transform': 'uppercase',
  '--ds-text-body-lg-size': '1.25rem',
  '--ds-text-body-lg-line-height': '1.5',
  '--ds-text-body-size': '1.0625rem',
  '--ds-text-body-line-height': '28px',
  '--ds-text-body-sm-size': '1rem',
  '--ds-text-body-sm-line-height': '24px',
  '--ds-text-body-xs-size': '0.9375rem',
  '--ds-text-body-xs-line-height': '1.5',
  '--ds-text-caption-size': '0.875rem',
  '--ds-text-caption-line-height': '20px',
  '--ds-text-label-size': '0.875rem',
  '--ds-text-label-line-height': '20px',
  '--ds-text-label-weight': 'var(--ds-font-weight-bold)',
  '--ds-text-label-tracking': '0.01em',
  '--ds-text-label-transform': 'none',
  '--ds-text-ui-size': '1rem',
  '--ds-text-ui-line-height': '24px',
  '--ds-text-ui-weight': 'var(--ds-font-weight-bold)',
  '--ds-text-ui-sm-size': '0.8125rem',
  '--ds-text-ui-sm-line-height': '18px',
  '--ds-text-ui-xs-size': '0.75rem',
  '--ds-text-ui-xs-line-height': '16px',
  '--ds-border-width': '2px',
  '--ds-border-width-strong': '3px',
  '--ds-focus-width': '3px',
  '--ds-control-height': '48px',
  '--ds-motion': '160ms cubic-bezier(0.34, 1.56, 0.64, 1)',
}

export const boldOverrides: Record<string, string> = { ...boldColors, ...boldShared, '--ds-photo-filter': 'none' }
export const boldDarkOverrides: Record<string, string> = {
  ...boldDarkColors,
  ...boldShared,
  '--ds-photo-filter': 'brightness(0.9)',
}

export interface DemoTheme {
  /** The `data-theme` value. */
  name: string
  /** `createTheme()` output for the spec input. */
  generated: Theme
  /** Roles of the appended override block, in contract order. */
  overrides: Record<string, string>
  /** The generated block with the overrides applied (what the browser resolves). */
  blocks: ThemeBlock[]
  /** Generated CSS followed by the override block. */
  css: string
}

function overrideCss(selector: string, overrides: Record<string, string>): string {
  const lines = themeRoles.filter((role) => role in overrides).map((role) => `  ${role}: ${overrides[role]};`)
  return `[data-theme="${selector}"] {\n${lines.join('\n')}\n}`
}

function buildDemoTheme(config: ThemeConfig, overrides: Record<string, string>): DemoTheme {
  const generated = createTheme(config)
  const ordered = Object.fromEntries(themeRoles.filter((role) => role in overrides).map((role) => [role, overrides[role]!]))
  const blocks = generated.blocks.map((block) => ({
    ...block,
    values: Object.fromEntries(themeRoles.map((role) => [role, ordered[role] ?? block.values[role]!])),
  }))
  return {
    name: config.name,
    generated,
    overrides: ordered,
    blocks,
    css: `${generated.css}\n${overrideCss(config.name, ordered)}\n`,
  }
}

export const bold: DemoTheme = buildDemoTheme(boldConfig, boldOverrides)
export const boldDark: DemoTheme = buildDemoTheme(boldDarkConfig, boldDarkOverrides)

const HEADER = `/* Opt-in demo theme. Generated by createTheme() plus the spec override block (src/themes/bold.ts).
   Do not edit by hand: run \`npm run themes:generate\`. Turn on with <html data-theme="bold"> or "bold-dark".
   Load the fonts with themes/bold-fonts.css. Unlayered, so it wins over the library CSS in any import order. */\n\n`

/** The full contents of `themes/bold.css`: both themes. `bold-dark` is self-contained. */
export const boldCss: string = `${HEADER}${bold.css}\n${boldDark.css}`

/** Contrast report for a demo theme's merged values (generator output plus overrides). */
export const checkDemoTheme = (theme: DemoTheme): ContrastReport => checkContrast({ blocks: theme.blocks })
