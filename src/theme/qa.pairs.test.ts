import { createTheme, checkContrast, type ThemeConfig } from '../index'

const cfg = (brand: string, mode: ThemeConfig['mode'], neutral?: string): ThemeConfig => ({
  name: 'qa', brand: brand as `#${string}`, neutral: neutral as `#${string}` | undefined,
  fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' }, radius: {}, shadow: {}, mode,
})
const brands = ['#ff0000','#00ff00','#0000ff','#ffff00','#00ffff','#ff00ff','#ffffff','#000000','#808080','#777','#fefefe','#010101','#fff700','#1a73e8','#e91e63','#9c27b0','#c2185b','#2e7d32','#ffeb3b','#050505']
describe('QA expanded pair checks', () => {
  it.each(brands)('brand %s passes every required pair', (b) => {
    for (const mode of ['light', 'dark', 'both'] as const) {
      for (const neutral of [undefined, '#336699', '#ff00ff']) {
        const rep = checkContrast(createTheme(cfg(b, mode, neutral)))
        expect(rep.failures).toEqual([])
        expect(rep.checked).toBeGreaterThanOrEqual(53)
      }
    }
  })
  it('flags a failing status-bg text pair with role names', () => {
    const t = createTheme(cfg('#1a73e8', 'light'))
    const blk = t.blocks[0]!
    blk.values['--ds-color-placeholder'] = '#cccccc'
    const rep = checkContrast(t)
    const names = rep.failures.map((f) => `${f.foreground}/${f.background}`)
    for (const g of ['color-background', 'color-surface', 'color-fill', 'color-info-bg', 'color-success-bg', 'color-error-bg'])
      expect(names).toContain(`color-placeholder/${g}`)
  })
})
