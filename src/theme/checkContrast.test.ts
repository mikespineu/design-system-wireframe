import { checkContrast, requiredPairs } from './checkContrast'
import { createTheme, type ThemeConfig } from './createTheme'

const base: ThemeConfig = {
  name: 'acme',
  brand: '#be185d',
  fonts: { heading: 'serif', body: 'sans-serif' },
  radius: {},
  shadow: {},
  mode: 'both',
}

const brands = ['#be185d', '#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#06b6d4', '#facc15', '#0a0a1a', '#808080', '#ffffff']

describe('checkContrast', () => {
  it.each(brands)('generated themes pass every required pair for brand %s', (brand) => {
    for (const neutral of [undefined, brand]) {
      const report = checkContrast(createTheme({ ...base, brand: brand as '#fff', neutral: neutral as '#fff' | undefined }))
      expect(report.failures).toEqual([])
      expect(report.ok).toBe(true)
      expect(report.checked).toBe(requiredPairs.length * 2)
    }
  })

  it('flags text pairs under 4.5:1 with role names', () => {
    const theme = createTheme({ ...base, mode: 'light' })
    theme.blocks[0]!.values['--ds-color-text-muted'] = '#bbbbbb'
    const report = checkContrast(theme)
    expect(report.ok).toBe(false)
    const hit = report.failures.find((f) => f.foreground === 'color-text-muted' && f.background === 'color-background')
    expect(hit).toMatchObject({ kind: 'text', required: 4.5, mode: 'light', selector: 'acme' })
    expect(hit!.ratio).toBeLessThan(4.5)
  })

  it('flags UI pairs under 3:1 but passes them at 3:1 or more', () => {
    const theme = createTheme({ ...base, mode: 'light' })
    theme.blocks[0]!.values['--ds-color-border-strong'] = '#cccccc'
    theme.blocks[0]!.values['--ds-color-icon'] = '#949494' // 3.03:1
    const report = checkContrast(theme)
    expect(report.failures.filter((f) => f.kind === 'ui').map((f) => f.foreground)).toEqual(['color-border-strong', 'color-border-strong'])
    expect(report.failures[0]).toMatchObject({ required: 3, background: 'color-background' })
  })

  it('reports the dark block mode', () => {
    const theme = createTheme(base)
    theme.blocks[1]!.values['--ds-color-primary-contrast'] = theme.blocks[1]!.values['--ds-color-primary']!
    const report = checkContrast(theme)
    expect(report.failures.every((f) => f.mode === 'dark' && f.selector === 'acme-dark')).toBe(true)
    expect(report.failures.map((f) => f.foreground)).toContain('color-primary-contrast')
  })

  it('skips pairs it cannot resolve to hex colors', () => {
    const report = checkContrast({ blocks: [{ mode: 'light', selector: 'x', values: { '--ds-color-text': 'var(--x)' } }] })
    expect(report).toEqual({ ok: true, failures: [], checked: 0 })
  })
})
