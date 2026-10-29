import { clampToGamut, contrastRatio, ensureContrast, hexToOklch, isHex, oklchToHex } from './color'
import { defaultFonts, fontWeightDefaults, shapeDefaults, typeScaleDefaults } from './defaults'
import { generateScale, type ColorScale, type ScaleStep } from './scale'
import { themeRoles } from '../styles/roles'

/** `#rgb` or `#rrggbb`. */
export type HexColor = `#${string}`
/** `0` or a number with `px`, `rem`, `em` or `%`. */
export type CssLength = '0' | `${number}px` | `${number}rem` | `${number}em` | `${number}%`
/** `none` or a CSS box-shadow starting with an offset, e.g. `0 1px 2px rgb(0 0 0 / 0.1)`. */
export type CssShadow = 'none' | `${number}px ${string}` | `0 ${string}`
export type ThemeMode = 'light' | 'dark' | 'both'

export interface ThemeFonts {
  /** CSS font-family for display, h1 to h3 and the dialog title. */
  heading: string
  /** CSS font-family for body copy and inputs. */
  body: string
  /** CSS font-family for UI text (buttons, labels, tags). Defaults to the heading font. */
  label?: string
  /** CSS font-family for tabular numerals. Defaults to Red Hat Mono. */
  mono?: string
}

export interface ThemeRadius {
  sm?: CssLength
  md?: CssLength
  lg?: CssLength
  full?: CssLength
}

export interface ThemeShadow {
  sm?: CssShadow
  md?: CssShadow
  lg?: CssShadow
}

export interface ThemeConfig {
  /** Value of `data-theme`. Lowercase letters, digits and hyphens. */
  name: string
  /** One brand color; the 50 to 900 scale, primary and focus derive from it. */
  brand: HexColor
  /** Optional color whose hue tints the neutral ramp (ground, fills, borders, text). Omit for pure grays. */
  neutral?: HexColor
  fonts: ThemeFonts
  radius: ThemeRadius
  shadow: ThemeShadow
  /** `both` emits `[data-theme="name"]` (light) and `[data-theme="name-dark"]` (dark colors only). */
  mode: ThemeMode
}

/** One generated `[data-theme]` block. */
export interface ThemeBlock {
  mode: 'light' | 'dark'
  selector: string
  /** Role (full custom property name) to value. */
  values: Record<string, string>
}

export interface Theme {
  name: string
  mode: ThemeMode
  scale: ColorScale
  blocks: ThemeBlock[]
  /** Ready to inject into a stylesheet. */
  css: string
}

const NAME = /^[a-z][a-z0-9-]*$/
const UNSAFE = /[;{}]/

const ramp = {
  light: {
    white: '#ffffff', s50: '#f7f7f7', s100: '#eeeeee', s200: '#e0e0e0', s300: '#c7c7c7', s400: '#a3a3a3',
    s500: '#767676', s600: '#595959', s700: '#404040', s800: '#262626', s900: '#141414', black: '#000000',
  },
  dark: {
    ground: '#141414', subtle: '#1f1f1f', fill: '#262626', divider: '#333333', border: '#737373', disabled: '#595959',
    placeholder: '#8f8f8f', muted: '#a3a3a3', text: '#c7c7c7', strong: '#e0e0e0', emphasis: '#f7f7f7', inverse: '#eeeeee',
    infoBorder: '#595959',
  },
} as const

function assertValid(config: ThemeConfig) {
  if (!NAME.test(config.name)) throw new Error(`Invalid theme name "${config.name}": use lowercase letters, digits and hyphens`)
  for (const key of ['brand', 'neutral'] as const) {
    const value = config[key]
    if (value !== undefined && !isHex(value)) throw new Error(`Invalid ${key} color "${value}": expected #rgb or #rrggbb`)
  }
  const strings = [...Object.values(config.fonts), ...Object.values(config.radius), ...Object.values(config.shadow)]
  for (const value of strings) {
    if (value === undefined) continue
    if (typeof value !== 'string' || value.trim() === '' || UNSAFE.test(value)) throw new Error(`Invalid CSS value "${value}"`)
  }
}

/** Builds a neutral tint function: identity without a neutral color, hue-tinted with one. */
function makeTint(neutral?: string) {
  if (!neutral) return (hex: string) => hex
  const { c, h } = hexToOklch(neutral)
  const chroma = Math.min(c, 0.03)
  return (hex: string) => {
    const o = hexToOklch(hex)
    const share = o.l > 0.985 ? 0.6 : 1
    return oklchToHex(clampToGamut({ l: Math.min(0.985, Math.max(0.15, o.l)), c: chroma * share, h }))
  }
}

/** Nudges `fg` until it reaches `min` on every ground (each nudge keeps earlier grounds passing: it moves away from them). */
function ensureOnAll(fg: string, grounds: readonly string[], min: number, direction: 'darker' | 'lighter'): string {
  return grounds.reduce((acc, ground) => ensureContrast(acc, ground, min, direction), fg)
}

function colorRoles(scale: ColorScale, tint: (hex: string) => string, mode: 'light' | 'dark'): Record<string, string> {
  const at = (step: ScaleStep) => scale[step].hex
  if (mode === 'light') {
    const r = ramp.light
    const bg = tint(r.white)
    const primaryStep = (([500, 600, 700, 800, 900] as const).find((s) => contrastRatio(at(s), '#ffffff') >= 4.5) ?? 900)
    const hoverStep = (Math.min(900, primaryStep + 100) as ScaleStep)
    const primary = at(primaryStep)
    const hover =
      hoverStep === primaryStep ? oklchToHex({ ...scale[900], l: scale[900].l - 0.08 }) : at(hoverStep)
    const emphasis = tint(r.black)
    const grounds = [bg, tint(r.s100), tint(r.s50), '#edf5ef', '#fbedec']
    return {
      '--ds-color-background': bg,
      '--ds-color-surface': bg,
      '--ds-color-surface-subtle': tint(r.s50),
      '--ds-color-fill': tint(r.s100),
      '--ds-color-divider': tint(r.s200),
      '--ds-color-border': tint(r.s300),
      '--ds-color-disabled': tint(r.s400),
      '--ds-color-placeholder': ensureOnAll(tint(r.s500), grounds, 4.5, 'darker'),
      '--ds-color-text-muted': ensureOnAll(tint(r.s600), grounds, 4.5, 'darker'),
      '--ds-color-text': tint(r.s700),
      '--ds-color-text-strong': tint(r.s800),
      '--ds-color-text-emphasis': emphasis,
      '--ds-color-text-inverse': bg,
      '--ds-color-border-strong': emphasis,
      '--ds-color-icon': emphasis,
      '--ds-color-focus': primary,
      '--ds-color-overlay': 'rgb(0 0 0 / 0.5)',
      '--ds-color-inverse': tint(r.s900),
      '--ds-color-primary': primary,
      '--ds-color-primary-hover': hover,
      '--ds-color-primary-contrast': bg,
      '--ds-color-info': tint(r.s700),
      '--ds-color-info-border': tint(r.s300),
      '--ds-color-info-bg': tint(r.s50),
      '--ds-color-success': '#2e6b45',
      '--ds-color-success-border': '#9cc7ab',
      '--ds-color-success-bg': '#edf5ef',
      '--ds-color-error': '#a3302b',
      '--ds-color-error-border': '#e3aaa6',
      '--ds-color-error-bg': '#fbedec',
    }
  }
  const d = ramp.dark
  const bg = tint(ramp.light.s900)
  const primary = at(100)
  const grounds = [bg, tint(d.fill), tint(d.subtle), '#13261a', '#2d1414']
  return {
    '--ds-color-background': bg,
    '--ds-color-surface': bg,
    '--ds-color-surface-subtle': tint(d.subtle),
    '--ds-color-fill': tint(d.fill),
    '--ds-color-divider': tint(d.divider),
    '--ds-color-border': ensureContrast(tint(d.border), bg, 3, 'lighter'),
    '--ds-color-disabled': tint(d.disabled),
    '--ds-color-placeholder': ensureOnAll(tint(d.placeholder), grounds, 4.5, 'lighter'),
    '--ds-color-text-muted': ensureOnAll(tint(d.muted), grounds, 4.5, 'lighter'),
    '--ds-color-text': tint(d.text),
    '--ds-color-text-strong': tint(d.strong),
    '--ds-color-text-emphasis': tint(d.emphasis),
    '--ds-color-text-inverse': bg,
    '--ds-color-border-strong': tint(d.emphasis),
    '--ds-color-icon': tint(d.emphasis),
    '--ds-color-focus': primary,
    '--ds-color-overlay': 'rgb(0 0 0 / 0.7)',
    '--ds-color-inverse': tint(d.inverse),
    '--ds-color-primary': primary,
    '--ds-color-primary-hover': at(200),
    '--ds-color-primary-contrast': at(900),
    '--ds-color-info': tint(d.text),
    '--ds-color-info-border': tint(d.infoBorder),
    '--ds-color-info-bg': tint(d.subtle),
    '--ds-color-success': '#9cc7ab',
    '--ds-color-success-border': '#2e6b45',
    '--ds-color-success-bg': '#13261a',
    '--ds-color-error': '#e3aaa6',
    '--ds-color-error-border': '#a3302b',
    '--ds-color-error-bg': '#2d1414',
  }
}

function otherRoles(config: ThemeConfig): Record<string, string> {
  const { fonts, radius, shadow } = config
  const heading = fonts.heading
  return {
    '--ds-font-heading': heading,
    '--ds-font-body': fonts.body,
    '--ds-font-label': fonts.label ?? heading,
    '--ds-font-mono': fonts.mono ?? defaultFonts.mono,
    ...fontWeightDefaults,
    ...typeScaleDefaults,
    '--ds-radius-sm': radius.sm ?? '0',
    '--ds-radius-md': radius.md ?? '0',
    '--ds-radius-lg': radius.lg ?? '0',
    '--ds-radius-full': radius.full ?? '0',
    '--ds-shadow-sm': shadow.sm ?? 'none',
    '--ds-shadow-md': shadow.md ?? 'none',
    '--ds-shadow-lg': shadow.lg ?? 'none',
    ...shapeDefaults,
  }
}

const order = (values: Record<string, string>) =>
  Object.fromEntries(themeRoles.filter((role) => role in values).map((role) => [role, values[role]!]))

function toCss(block: ThemeBlock): string {
  const lines = block.mode === 'dark' ? ['  color-scheme: dark;'] : []
  for (const [role, value] of Object.entries(block.values)) lines.push(`  ${role}: ${value};`)
  return `[data-theme="${block.selector}"] {\n${lines.join('\n')}\n}`
}

/**
 * Builds a `[data-theme]` stylesheet that sets every role of the theme contract
 * (docs/specs/Theming.md) from one brand color. Throws on an invalid name, color or CSS value.
 */
export function createTheme(config: ThemeConfig): Theme {
  assertValid(config)
  const scale = generateScale(config.brand)
  const tint = makeTint(config.neutral)
  const rest = otherRoles(config)
  const blocks: ThemeBlock[] = []
  if (config.mode !== 'dark') {
    blocks.push({ mode: 'light', selector: config.name, values: order({ ...colorRoles(scale, tint, 'light'), ...rest }) })
  }
  if (config.mode === 'dark') {
    blocks.push({ mode: 'dark', selector: config.name, values: order({ ...colorRoles(scale, tint, 'dark'), ...rest }) })
  } else if (config.mode === 'both') {
    blocks.push({ mode: 'dark', selector: `${config.name}-dark`, values: order(colorRoles(scale, tint, 'dark')) })
  }
  return { name: config.name, mode: config.mode, scale, blocks, css: blocks.map(toCss).join('\n\n') + '\n' }
}
