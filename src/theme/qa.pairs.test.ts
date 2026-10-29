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

describe('QA sweep', () => {
  const hex = (h: number, l: number, s: number) => {
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
      return Math.round(v * 255).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }
  it('sweeps hues/levels/neutrals/modes: no failures, monotonic scale', () => {
    const neutrals = [undefined, '#336699', '#ff00ff', '#808080', '#00ff00', '#ffff00', '#a0522d', '#000000', '#ffffff']
    const fails: string[] = []
    let n = 0
    for (let h = 0; h < 360; h += 15) {
      for (const l of [0.05, 0.15, 0.3, 0.5, 0.7, 0.85, 0.95]) {
        for (const s of [0.1, 0.5, 1]) {
          const b = hex(h, l, s)
          for (const nh of neutrals) {
            for (const mode of ['light', 'dark', 'both'] as const) {
              n++
              const t = createTheme(cfg(b, mode, nh))
              const rep = checkContrast(t)
              if (rep.failures.length) fails.push(`${b}/${nh}/${mode}: ${rep.failures.map((f) => `${f.foreground}/${f.background}`).join(',')}`)
              const ls = Object.values(t.scale).map((e) => e.l)
              for (let i = 1; i < ls.length; i++) if (!(ls[i]! < ls[i - 1]!)) fails.push(`${b} scale non-monotonic`)
            }
          }
        }
      }
    }
    expect(n).toBeGreaterThan(500)
    expect(fails.slice(0, 20)).toEqual([])
  })
})
