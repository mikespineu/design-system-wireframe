import { contrastRatio, isHex } from './color'
import type { Theme } from './createTheme'

export type PairKind = 'text' | 'ui'

export interface ContrastFailure {
  /** Foreground role, e.g. `color-text-muted`. */
  foreground: string
  /** Background role, e.g. `color-background`. */
  background: string
  kind: PairKind
  ratio: number
  /** 4.5 for text, 3 for UI. */
  required: number
  mode: 'light' | 'dark'
  selector: string
}

export interface ContrastReport {
  ok: boolean
  failures: ContrastFailure[]
  /** Number of pairs checked across all blocks. */
  checked: number
}

const text = (foreground: string, background: string): Pair => [foreground, background, 'text']
const ui = (foreground: string, background: string): Pair => [foreground, background, 'ui']
type Pair = [string, string, PairKind]

/**
 * Required pairs from docs/specs/Theming.md (Accessibility). Disabled roles, dividers and status
 * borders are exempt; `color-border` on `color-surface` is a known gap kept for Wireframe parity.
 */
const TEXT_ROLES = [
  'color-text-emphasis',
  'color-text-strong',
  'color-text',
  'color-text-muted',
  'color-placeholder',
] as const
const TEXT_GROUNDS = [
  'color-background',
  'color-surface',
  'color-fill',
  'color-info-bg',
  'color-success-bg',
  'color-error-bg',
] as const

export const requiredPairs: readonly Pair[] = [
  // Every text role on every ground it sits on.
  ...TEXT_ROLES.flatMap((role) => TEXT_GROUNDS.map((ground) => text(role, ground))),
  text('color-primary-contrast', 'color-primary'),
  text('color-primary-contrast', 'color-primary-hover'),
  text('color-text-inverse', 'color-inverse'),
  // Each status fg on its bg and on background.
  text('color-info', 'color-info-bg'),
  text('color-info', 'color-background'),
  text('color-success', 'color-success-bg'),
  text('color-success', 'color-background'),
  text('color-error', 'color-error-bg'),
  text('color-error', 'color-background'),
  ui('color-primary-contrast', 'color-error'),
  ui('color-border-strong', 'color-background'),
  ui('color-border-strong', 'color-surface'),
  ui('color-icon', 'color-background'),
  ui('color-icon', 'color-surface'),
  ui('color-focus', 'color-background'),
  ui('color-focus', 'color-surface'),
  ui('color-primary', 'color-background'),
  ui('color-primary', 'color-surface'),
  ui('color-error', 'color-background'),
  ui('color-error', 'color-surface'),
  ui('color-placeholder', 'color-background'),
  ui('color-placeholder', 'color-surface'),
  ui('color-text-muted', 'color-background'),
]

const REQUIRED = { text: 4.5, ui: 3 } as const

/** Checks every required pair in every block of the theme and reports the WCAG failures with role names. */
export function checkContrast(theme: Pick<Theme, 'blocks'>): ContrastReport {
  const failures: ContrastFailure[] = []
  let checked = 0
  for (const block of theme.blocks) {
    // A dark block of a `both` theme only carries colors, which is all the pairs need.
    for (const [fg, bg, kind] of requiredPairs) {
      const f = block.values[`--ds-${fg}`]
      const b = block.values[`--ds-${bg}`]
      if (!f || !b || !isHex(f) || !isHex(b)) continue
      checked++
      const ratio = contrastRatio(f, b)
      if (ratio < REQUIRED[kind]) {
        failures.push({
          foreground: fg,
          background: bg,
          kind,
          ratio: Math.round(ratio * 100) / 100,
          required: REQUIRED[kind],
          mode: block.mode,
          selector: block.selector,
        })
      }
    }
  }
  return { ok: failures.length === 0, failures, checked }
}
