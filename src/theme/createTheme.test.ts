import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as lib from '../index'
import { themeRoleGroups, themeRoles } from '../styles/roles'
import { contrastRatio } from './color'
import { createTheme, type ThemeConfig } from './createTheme'

const base: ThemeConfig = {
  name: 'acme',
  brand: '#be185d',
  fonts: { heading: 'Georgia, serif', body: 'system-ui, sans-serif' },
  radius: { sm: '2px', md: '4px', lg: '8px', full: '9999px' },
  shadow: { sm: '0 1px 2px rgb(0 0 0 / 0.1)', md: 'none', lg: '0 8px 24px rgb(0 0 0 / 0.2)' },
  mode: 'both',
}

const colorRoles = themeRoleGroups.color

describe('createTheme', () => {
  it('sets every role of the contract in a light theme', () => {
    const theme = createTheme({ ...base, mode: 'light' })
    expect(theme.blocks).toHaveLength(1)
    expect(Object.keys(theme.blocks[0]!.values)).toEqual([...themeRoles])
    expect(theme.css).toContain('[data-theme="acme"] {')
    for (const role of themeRoles) expect(theme.css).toContain(`  ${role}: `)
    expect(theme.css).not.toContain('color-scheme')
  })

  it('sets every role in a dark-only theme with color-scheme', () => {
    const theme = createTheme({ ...base, mode: 'dark' })
    expect(Object.keys(theme.blocks[0]!.values)).toEqual([...themeRoles])
    expect(theme.css).toContain('color-scheme: dark;')
    expect(theme.css).toContain('[data-theme="acme"]')
  })

  it('emits a light block and a color-only dark block for both', () => {
    const theme = createTheme(base)
    expect(theme.blocks.map((b) => b.selector)).toEqual(['acme', 'acme-dark'])
    expect(Object.keys(theme.blocks[1]!.values)).toEqual([...colorRoles])
    expect(theme.css).toContain('[data-theme="acme-dark"] {\n  color-scheme: dark;')
  })

  it('applies fonts, radius and shadow, with defaults for the rest', () => {
    const v = createTheme(base).blocks[0]!.values
    expect(v['--ds-font-heading']).toBe('Georgia, serif')
    expect(v['--ds-font-label']).toBe('Georgia, serif')
    expect(v['--ds-font-mono']).toContain('Red Hat Mono')
    expect(v['--ds-radius-full']).toBe('9999px')
    expect(v['--ds-shadow-lg']).toBe('0 8px 24px rgb(0 0 0 / 0.2)')
    const own = createTheme({ ...base, fonts: { heading: 'A', body: 'B', label: 'C', mono: 'D' }, radius: {}, shadow: {} }).blocks[0]!.values
    expect([own['--ds-font-label'], own['--ds-font-mono'], own['--ds-radius-md'], own['--ds-shadow-sm']]).toEqual(['C', 'D', '0', 'none'])
  })

  it('derives primary from the brand and keeps focus equal to primary', () => {
    const [light, dark] = createTheme(base).blocks
    expect(light!.values['--ds-color-primary']).toBe(light!.values['--ds-color-focus'])
    expect(contrastRatio(light!.values['--ds-color-primary']!, '#ffffff')).toBeGreaterThanOrEqual(4.5)
    expect(dark!.values['--ds-color-primary']).toBe(dark!.values['--ds-color-focus'])
  })

  it('reproduces the default gray ramp without a neutral color', () => {
    const v = createTheme({ ...base, mode: 'light' }).blocks[0]!.values
    expect(v['--ds-color-background']).toBe('#ffffff')
    expect(v['--ds-color-fill']).toBe('#eeeeee')
    expect(v['--ds-color-text-emphasis']).toBe('#000000')
  })

  it('tints the neutral ramp toward the neutral color', () => {
    const v = createTheme({ ...base, neutral: '#be185d', mode: 'light' }).blocks[0]!.values
    expect(v['--ds-color-background']).not.toBe('#ffffff')
    expect(v['--ds-color-text-emphasis']).not.toBe('#000000')
  })

  it('handles a very dark brand where primary and hover share the last step', () => {
    const v = createTheme({ ...base, brand: '#0a0a1a', mode: 'light' }).blocks[0]!.values
    expect(v['--ds-color-primary-hover']).not.toBe(v['--ds-color-primary'])
  })

  it('rejects invalid values at runtime', () => {
    expect(() => createTheme({ ...base, name: 'Bad Name' })).toThrow('Invalid theme name')
    expect(() => createTheme({ ...base, brand: '#12' })).toThrow('Invalid brand color')
    expect(() => createTheme({ ...base, neutral: '#zzz' })).toThrow('Invalid neutral color')
    expect(() => createTheme({ ...base, fonts: { heading: 'a; color: red', body: 'b' } })).toThrow('Invalid CSS value')
    expect(() => createTheme({ ...base, radius: { sm: ' ' as '0' } })).toThrow('Invalid CSS value')
  })

  it('rejects unknown keys and invalid values at compile time', () => {
    // These lines fail `tsc` if the @ts-expect-error is unused.
    // @ts-expect-error unknown key
    const a: ThemeConfig = { ...base, colour: '#fff' }
    // @ts-expect-error invalid mode
    const b: ThemeConfig = { ...base, mode: 'sepia' }
    // @ts-expect-error brand must be a hex color
    const c: ThemeConfig = { ...base, brand: 'red' }
    // @ts-expect-error unknown radius step
    const d: ThemeConfig = { ...base, radius: { xl: '4px' } }
    // @ts-expect-error invalid length
    const e: ThemeConfig = { ...base, radius: { sm: 'big' } }
    // @ts-expect-error missing required key
    const f: ThemeConfig = { name: 'x', brand: '#fff', fonts: base.fonts, radius: {}, mode: 'light' }
    expect([a, b, c, d, e, f]).toHaveLength(6)
  })

  it('matches the non-color defaults in tokens.css', () => {
    const css = readFileSync(join(__dirname, '../styles/tokens.css'), 'utf8')
    const defaults = css.slice(css.indexOf(':root,'), css.indexOf('[data-theme="dark"]'))
    const v = createTheme({
      ...base,
      fonts: { heading: 'var(--ds-font-mono)', body: 'var(--ds-font-text)' },
      radius: {},
      shadow: {},
      mode: 'light',
    }).blocks[0]!.values
    for (const group of ['fontWeight', 'typeScale', 'shape'] as const) {
      for (const role of themeRoleGroups[group]) {
        const m = defaults.match(new RegExp(`${role}:\\s*([^;]+);`))
        expect([role, v[role]]).toEqual([role, m![1]!.trim()])
      }
    }
  })

  it('exports createTheme and checkContrast from the package entry', () => {
    expect(lib.createTheme).toBe(createTheme)
    expect(typeof lib.checkContrast).toBe('function')
  })
})
