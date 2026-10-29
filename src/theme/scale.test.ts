import { contrastRatio, hexToOklch } from './color'
import { generateScale, scaleSteps } from './scale'

const brands = { magenta: '#be185d', blue: '#2563eb', green: '#16a34a', amber: '#f59e0b', violet: '#7c3aed' }

describe('generateScale', () => {
  it.each(Object.entries(brands))('is a monotonic 50-900 OKLCH scale for %s', (_name, brand) => {
    const scale = generateScale(brand)
    expect(scaleSteps.map((s) => s)).toHaveLength(10)
    for (let i = 1; i < scaleSteps.length; i++) {
      const prev = scale[scaleSteps[i - 1]!]
      const cur = scale[scaleSteps[i]!]
      expect(cur.l).toBeLessThan(prev.l)
      // the emitted hex keeps the order too
      expect(hexToOklch(cur.hex).l).toBeLessThan(hexToOklch(prev.hex).l)
    }
  })

  it('keeps the brand hue', () => {
    const { h } = hexToOklch('#2563eb')
    const scale = generateScale('#2563eb')
    for (const step of [300, 500, 700]) {
      expect(Math.abs(hexToOklch(scale[step as 300]!.hex).h - h)).toBeLessThan(6)
    }
  })

  it('reaches 4.5:1 on white by the 700-900 steps', () => {
    for (const brand of Object.values(brands)) {
      expect(contrastRatio(generateScale(brand)[900].hex, '#ffffff')).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('stays gray for an achromatic brand', () => {
    expect(generateScale('#808080')[500].c).toBeLessThan(0.01)
  })
})
