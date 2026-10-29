import { clampToGamut, contrastRatio, ensureContrast, hexToOklch, isHex, oklchToHex, parseHex, toHex } from './color'

describe('color math', () => {
  it('parses short and long hex and rejects junk', () => {
    expect(parseHex('#fff')).toEqual([1, 1, 1])
    expect(toHex(parseHex('#336699'))).toBe('#336699')
    expect(isHex('red')).toBe(false)
    expect(() => parseHex('nope')).toThrow('Invalid hex color')
  })

  it('round-trips hex through OKLCH', () => {
    for (const hex of ['#000000', '#ffffff', '#be185d', '#2563eb', '#16a34a', '#f59e0b', '#767676']) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex)
    }
  })

  it('matches known OKLCH values', () => {
    const white = hexToOklch('#ffffff')
    expect(white.l).toBeCloseTo(1, 3)
    expect(white.c).toBeLessThan(0.001)
    const red = hexToOklch('#ff0000')
    expect(red.l).toBeCloseTo(0.628, 2)
    expect(red.c).toBeCloseTo(0.258, 2)
    expect(red.h).toBeCloseTo(29.2, 0)
  })

  it('computes WCAG contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
    expect(contrastRatio('#fff', '#fff')).toBe(1)
  })

  it('clamps out-of-gamut chroma without changing lightness', () => {
    const out = clampToGamut({ l: 0.5, c: 0.4, h: 150 })
    expect(out.c).toBeLessThan(0.4)
    expect(out.l).toBe(0.5)
    expect(clampToGamut({ l: 0.5, c: 0.05, h: 150 }).c).toBe(0.05)
    expect(clampToGamut({ l: 1.4, c: 0, h: 0 }).l).toBe(1)
  })

  it('nudges a color until it reaches the contrast', () => {
    const out = ensureContrast('#999999', '#ffffff', 4.5, 'darker')
    expect(contrastRatio(out, '#ffffff')).toBeGreaterThanOrEqual(4.5)
    const light = ensureContrast('#555555', '#141414', 7, 'lighter')
    expect(contrastRatio(light, '#141414')).toBeGreaterThanOrEqual(7)
    expect(ensureContrast('#000000', '#ffffff', 4.5, 'darker')).toBe('#000000')
  })
})
