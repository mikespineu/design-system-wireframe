import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { themeRoleGroups, themeRoles } from '../styles/roles'
import { checkContrast, requiredPairs } from '../theme/checkContrast'
import { contrastRatio, isHex } from '../theme/color'
import { Button } from '../components/Button'
import { Checkbox } from '../components/Checkbox'
import { Dialog } from '../components/Dialog'
import { Slider } from '../components/Slider'
import { Tag } from '../components/Tag'
import { TextField } from '../components/Input'
import { bold, boldCss, boldDark, boldDarkConfig, boldConfig, checkDemoTheme } from './bold'

const root = join(__dirname, '..', '..')
const cssPath = join(__dirname, 'bold.css')

// Regenerate the shipped file with `npm run themes:generate` (UPDATE_THEMES=1).
if (process.env.UPDATE_THEMES) writeFileSync(cssPath, boldCss)

const shipped = readFileSync(cssPath, 'utf8')

/** Declarations of every block with this selector, merged in source order (later wins), like the cascade. */
const resolved = (css: string, selector: string) => {
  const out = new Map<string, string>()
  const re = new RegExp(`\\[data-theme="${selector}"\\]\\s*\\{([^}]*)\\}`, 'g')
  for (const block of css.matchAll(re)) {
    for (const d of block[1]!.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out.set(d[1]!, d[2]!.trim())
  }
  return out
}

// Values from docs/specs/Themes.md, "Tokens > Every role per theme". Written out here on purpose, not
// derived from src/themes/bold.ts, so the test checks the implementation against the spec.
const colorTable: Record<string, [string, string]> = {
  '--ds-color-background': ['#F4F1FF', '#120D2E'],
  '--ds-color-surface': ['#FFFFFF', '#19133A'],
  '--ds-color-surface-subtle': ['#EBE6FC', '#211A4A'],
  '--ds-color-fill': ['#E3DCFB', '#2A2259'],
  '--ds-color-divider': ['#D5CCF5', '#3A3170'],
  '--ds-color-border': ['#8478B8', '#7C70C2'],
  '--ds-color-disabled': ['#B3AAD9', '#4D4485'],
  '--ds-color-placeholder': ['#63579A', '#9A90D6'],
  '--ds-color-text-muted': ['#554A8A', '#B3ABE6'],
  '--ds-color-text': ['#2F2766', '#D2CCF5'],
  '--ds-color-text-strong': ['#221B52', '#E3DFFA'],
  '--ds-color-text-emphasis': ['#140E3D', '#F5F3FF'],
  '--ds-color-text-inverse': ['#F4F1FF', '#120D2E'],
  '--ds-color-border-strong': ['#140E3D', '#F5F3FF'],
  '--ds-color-icon': ['#140E3D', '#F5F3FF'],
  '--ds-color-focus': ['#4318D1', '#A08CFF'],
  '--ds-color-overlay': ['rgb(20 14 61 / 0.6)', 'rgb(8 5 26 / 0.75)'],
  '--ds-color-inverse': ['#140E3D', '#E3DFFA'],
  '--ds-color-primary': ['#4318D1', '#A08CFF'],
  '--ds-color-primary-hover': ['#3510A8', '#8B73FF'],
  '--ds-color-primary-contrast': ['#FFFFFF', '#120D2E'],
  '--ds-color-info': ['#2F2766', '#D2CCF5'],
  '--ds-color-info-border': ['#D5CCF5', '#4D4485'],
  '--ds-color-info-bg': ['#EBE6FC', '#211A4A'],
  '--ds-color-success': ['#2E6B45', '#9CC7AB'],
  '--ds-color-success-border': ['#9CC7AB', '#2E6B45'],
  '--ds-color-success-bg': ['#EDF5EF', '#13261A'],
  '--ds-color-error': ['#A3302B', '#E3AAA6'],
  '--ds-color-error-border': ['#E3AAA6', '#A3302B'],
  '--ds-color-error-bg': ['#FBEDEC', '#2D1414'],
}

const shared: Record<string, string> = {
  '--ds-font-heading': "'Bricolage Grotesque', 'Arial Black', system-ui, sans-serif",
  '--ds-font-body': "'Figtree', system-ui, sans-serif",
  '--ds-font-label': "'Figtree', system-ui, sans-serif",
  '--ds-font-mono': "'IBM Plex Mono', ui-monospace, monospace",
  '--ds-font-weight-regular': '400',
  '--ds-font-weight-medium': '600',
  '--ds-font-weight-bold': '700',
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
  '--ds-radius-sm': '8px',
  '--ds-radius-md': '14px',
  '--ds-radius-lg': '24px',
  '--ds-radius-full': '9999px',
  '--ds-border-width': '2px',
  '--ds-border-width-strong': '3px',
  '--ds-focus-width': '3px',
  '--ds-focus-offset': '2px',
  '--ds-control-height': '48px',
  '--ds-motion': '160ms cubic-bezier(0.34, 1.56, 0.64, 1)',
}

const expected = (i: 0 | 1): Record<string, string> => ({
  ...Object.fromEntries(Object.entries(colorTable).map(([role, v]) => [role, v[i]])),
  ...shared,
  ...(i === 0
    ? {
        '--ds-shadow-sm': '0 2px 0 #140e3d',
        '--ds-shadow-md': '0 4px 0 #140e3d',
        '--ds-shadow-lg': '8px 8px 0 #140e3d',
        '--ds-photo-filter': 'none',
      }
    : {
        '--ds-shadow-sm': '0 2px 0 rgb(0 0 0 / 0.6)',
        '--ds-shadow-md': '0 4px 0 rgb(0 0 0 / 0.6)',
        '--ds-shadow-lg': '8px 8px 0 #4318d1',
        '--ds-photo-filter': 'brightness(0.9)',
      }),
})

const themes = [
  ['bold', bold, 0],
  ['bold-dark', boldDark, 1],
] as const

describe('bold themes are generated by createTheme() plus the spec override block', () => {
  it('uses the spec inputs', () => {
    expect(boldConfig).toMatchObject({ name: 'bold', brand: '#4318D1', neutral: '#140E3D', mode: 'light' })
    expect(boldDarkConfig).toMatchObject({ name: 'bold-dark', brand: '#4318D1', neutral: '#140E3D', mode: 'dark' })
    expect(boldConfig.radius).toEqual({ sm: '8px', md: '14px', lg: '24px', full: '9999px' })
  })

  it.each(themes)('%s: the shipped CSS is the generator output followed by the override block', (name, theme) => {
    const selector = `[data-theme="${name}"]`
    expect(theme.generated.css.startsWith(`${selector} {`)).toBe(true)
    expect(shipped).toContain(`${theme.generated.css}\n${selector} {`)
    const blocks = shipped.split(`${selector} {`)
    // Generated block first, override block after it.
    expect(blocks).toHaveLength(3)
  })

  it('shipped bold.css equals the generator output (run `npm run themes:generate` after changing bold.ts)', () => {
    expect(shipped).toBe(boldCss)
  })

  it('does not override status triples or roles the generator already gets right', () => {
    for (const theme of [bold, boldDark]) {
      for (const role of themeRoleGroups.font) expect(theme.overrides).not.toHaveProperty(role)
      for (const role of [...themeRoleGroups.radius, ...themeRoleGroups.shadow]) expect(theme.overrides).not.toHaveProperty(role)
      for (const role of Object.keys(theme.overrides)) expect(themeRoles).toContain(role)
      expect(Object.keys(theme.overrides)).not.toContain('--ds-color-success')
      expect(Object.keys(theme.overrides)).not.toContain('--ds-color-error-bg')
    }
  })
})

describe.each(themes)('%s role values match the spec', (name, _theme, i) => {
  const values = resolved(shipped, name)

  it('sets all 87 roles (self-contained)', () => {
    expect([...values.keys()].filter((r) => themeRoles.includes(r)).sort()).toEqual([...themeRoles].sort())
    expect(themeRoles).toHaveLength(87)
  })

  it.each(themeRoles.map((r) => [r]))('%s', (role) => {
    const want = expected(i)[role]
    expect(want).toBeDefined()
    expect(values.get(role)!.toLowerCase()).toBe(want!.toLowerCase())
  })

  it('has no roles outside the contract', () => {
    expect([...values.keys()].filter((r) => !themeRoles.includes(r))).toEqual([])
  })
})

describe('bold-dark works on its own', () => {
  const standalone = resolved(shipped.slice(shipped.indexOf('[data-theme="bold-dark"]')), 'bold-dark')

  it('is a separate selector with color-scheme dark and every role, with no dependency on bold', () => {
    expect(shipped).toMatch(/\[data-theme="bold-dark"\] \{\n {2}color-scheme: dark;/)
    expect(shipped).not.toMatch(/\[data-theme="bold"\]\s*\[data-theme="bold-dark"\]/)
    expect(themeRoles.every((r) => standalone.has(r))).toBe(true)
    expect(shipped).not.toMatch(/\[data-theme="bold"\][^{]*,/)
  })

  it('bold is a light theme without color-scheme', () => {
    const boldPart = shipped.slice(shipped.indexOf('[data-theme="bold"]'), shipped.indexOf('[data-theme="bold-dark"]'))
    expect(boldPart).not.toContain('color-scheme')
  })
})

describe('contrast', () => {
  it.each(themes)('%s passes checkContrast() with no failures', (_name, theme) => {
    const report = checkDemoTheme(theme)
    expect(report.failures).toEqual([])
    expect(report.ok).toBe(true)
    // Every required pair is checked (all values are hex).
    expect(report.checked).toBe(requiredPairs.length)
  })

  it.each(themes)('%s: the CSS as shipped passes the same pairs', (name) => {
    const values = Object.fromEntries(resolved(shipped, name))
    const report = checkContrast({ blocks: [{ mode: name === 'bold' ? 'light' : 'dark', selector: name, values }] })
    expect(report.ok).toBe(true)
    expect(report.checked).toBe(requiredPairs.length)
  })

  it('keeps the field rest border above 3:1 on the surface in both themes', () => {
    for (const [name] of themes) {
      const v = resolved(shipped, name)
      expect(contrastRatio(v.get('--ds-color-border')!, v.get('--ds-color-surface')!)).toBeGreaterThanOrEqual(3)
    }
  })

  it('every hex role is a real color', () => {
    for (const [name] of themes) for (const [role, v] of resolved(shipped, name)) if (role.startsWith('--ds-color-') && v.startsWith('#')) expect(isHex(v)).toBe(true)
  })
})

describe('no gray neutrals', () => {
  const neutrals = [
    'background', 'surface', 'surface-subtle', 'fill', 'divider', 'border', 'disabled', 'placeholder', 'text-muted', 'text',
    'text-strong', 'text-emphasis', 'text-inverse', 'border-strong', 'icon', 'inverse', 'info', 'info-border', 'info-bg',
  ].map((r) => `--ds-color-${r}`)

  it.each(themes)('%s: R, G and B are never all equal for a neutral', (name, _t, i) => {
    const values = resolved(shipped, name)
    for (const role of neutrals) {
      const hex = values.get(role)!
      if (hex.toLowerCase() === '#ffffff') {
        // White is the one allowed exception: the light surface sitting on the lavender ground.
        expect(role).toBe('--ds-color-surface')
        expect(i).toBe(0)
        continue
      }
      const [r, g, b] = [1, 3, 5].map((s) => hex.slice(s, s + 2))
      expect(r === g && g === b).toBe(false)
    }
  })
})

describe('dark theme photo filter', () => {
  const tokens = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8')
  const dark = tokens.slice(tokens.indexOf('[data-theme="dark"]'))

  it('dims the photos in [data-theme="dark"]', () => {
    expect(dark).toMatch(/--ds-photo-filter:\s*grayscale\(1\) contrast\(1\.1\) brightness\(0\.85\);/)
  })

  it('leaves the default photo filter unchanged', () => {
    expect(tokens.slice(0, tokens.indexOf('[data-theme="dark"]'))).toMatch(/--ds-photo-filter:\s*grayscale\(1\) contrast\(1\.1\);/)
  })
})

describe('opt-in exports', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

  it('exports the theme CSS and fonts', () => {
    expect(pkg.exports['./themes/bold.css']).toBe('./dist/themes/bold.css')
    expect(pkg.exports['./themes/bold-fonts.css']).toBe('./dist/themes/bold-fonts.css')
  })

  it('copies the files to dist/themes in the build script', () => {
    expect(pkg.scripts.build).toContain('scripts/copy-themes.mjs')
    const script = readFileSync(join(root, 'scripts/copy-themes.mjs'), 'utf8')
    expect(script).toContain("'bold.css'")
    expect(script).toContain("'bold-fonts.css'")
    expect(script).toContain('dist/themes')
  })

  it('keeps the themes and their fonts out of the library styles', () => {
    for (const f of ['tokens.css', 'tailwind.css']) {
      const css = readFileSync(join(root, 'src/styles', f), 'utf8')
      expect(css).not.toMatch(/data-theme="bold|Bricolage|Figtree/)
    }
  })

  it('bold-fonts.css loads the three families with the weights the spec needs', () => {
    const fonts = readFileSync(join(__dirname, 'bold-fonts.css'), 'utf8')
    expect(fonts).toMatch(/Bricolage\+Grotesque:wght@800/)
    expect(fonts).toMatch(/Figtree:wght@400;600;700/)
    expect(fonts).toMatch(/IBM\+Plex\+Mono:wght@400;600/)
    expect(fonts).toMatch(/display=swap/)
  })

  it('the copy step puts both files where the exports point', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ds-themes-'))
    mkdirSync(join(dir, 'src'))
    cpSync(__dirname, join(dir, 'src/themes'), { recursive: true })
    execFileSync('node', [join(root, 'scripts/copy-themes.mjs')], { cwd: dir })
    for (const file of ['bold.css', 'bold-fonts.css']) {
      expect(existsSync(join(dir, 'dist/themes', file))).toBe(true)
      expect(readFileSync(join(dir, 'dist/themes', file), 'utf8')).toBe(readFileSync(join(__dirname, file), 'utf8'))
    }
  })
})

describe('components under the bold themes', () => {
  const Set = () => (
    <div>
      <Button>Save</Button>
      <Button variant="secondary">Cancel</Button>
      <TextField label="Name" />
      <Checkbox label="Accept" />
      <Slider aria-label="Volume" defaultValue={30} />
      <Tag>Draft</Tag>
      <Dialog open title="Delete item" description="This cannot be undone.">
        <Button>Confirm</Button>
      </Dialog>
    </div>
  )

  const tabOrder = async (theme?: string) => {
    const user = userEvent.setup()
    const { unmount } = render(
      <div data-theme={theme}>
        <Button>Save</Button>
        <Button variant="secondary">Cancel</Button>
        <TextField label="Name" />
        <Checkbox label="Accept" />
        <Slider aria-label="Volume" defaultValue={30} />
      </div>,
    )
    const order: string[] = []
    for (let n = 0; n < 5; n++) {
      await user.tab()
      order.push(document.activeElement!.getAttribute('role') ?? document.activeElement!.tagName.toLowerCase())
    }
    unmount()
    return order
  }

  it.each(['bold', 'bold-dark'])('has no axe violations inside data-theme="%s"', async (theme) => {
    const { container } = render(
      <div data-theme={theme}>
        <Set />
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it.each(['bold', 'bold-dark'])('keeps the default focus order inside data-theme="%s"', async (theme) => {
    const base = await tabOrder()
    expect(base).toEqual(['button', 'button', 'input', 'checkbox', 'slider'])
    expect(await tabOrder(theme)).toEqual(base)
  })

  it('draws the focus ring from the focus roles, which both themes set to 3px / 2px', () => {
    for (const file of ['Checkbox/Checkbox.css', 'Slider/Slider.css', 'Dialog/Dialog.css']) {
      const css = readFileSync(join(root, 'src/components', file), 'utf8')
      expect(css).toMatch(/:focus-visible[\s\S]*?outline: var\(--ds-focus-width\) solid var\(--ds-color-focus\)/)
    }
    expect(readFileSync(join(root, 'src/styles/tailwind.css'), 'utf8')).toMatch(/outline: var\(--ds-focus-width\) solid var\(--ds-color-focus\)/)
    for (const [name] of themes) {
      const v = resolved(shipped, name)
      expect(v.get('--ds-focus-width')).toBe('3px')
      expect(v.get('--ds-focus-offset')).toBe('2px')
    }
  })
})
