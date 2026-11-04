import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as ds from 'design-system-test'

const root = join(__dirname, '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { files: string[] }
const skill = readFileSync(join(root, 'skills', 'create-theme', 'SKILL.md'), 'utf8')

describe('create-theme skill', () => {
  it('ships with the package', () => {
    expect(pkg.files).toContain('skills')
  })

  it('has valid frontmatter', () => {
    const match = /^---\n([\s\S]*?)\n---\n/.exec(skill)
    expect(match).not.toBeNull()
    const fm = match![1]!
    expect(fm).toMatch(/^name: create-theme$/m)
    expect(fm).toMatch(/^description: .{40,}$/m)
  })

  it('covers the four stages', () => {
    for (const heading of ['Choose the raw values', 'Generate the `[data-theme]` block', 'Check contrast', 'Register the theme']) {
      expect(skill).toContain(heading)
    }
  })

  it('only imports names the package really exports', () => {
    const exported = ds as Record<string, unknown>
    const names = [...skill.matchAll(/import \{([^}]+)\} from 'design-system-test'/g)].flatMap((m) =>
      m[1]!.split(',').map((n) => n.trim().replace(/^type /, '')),
    )
    expect(names).toEqual(expect.arrayContaining(['createTheme', 'checkContrast']))
    for (const name of names) {
      if (name === 'ThemeConfig') continue // type only
      expect(exported[name]).toBeDefined()
    }
  })

  it('example code runs against the real API', () => {
    const theme = ds.createTheme({
      name: 'acme',
      brand: '#0b6e4f',
      fonts: { heading: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
      radius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
      shadow: {},
      mode: 'both',
    })
    expect(theme.blocks.map((b) => b.selector)).toEqual(expect.arrayContaining(['acme', 'acme-dark']))
    expect(ds.checkContrast({ blocks: theme.blocks })).toEqual(
      expect.objectContaining({ ok: expect.any(Boolean), failures: expect.any(Array), checked: expect.any(Number) }),
    )
  })
})
