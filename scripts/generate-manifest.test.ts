import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as lib from '../src'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const gen = require('./generate-manifest.cjs')
const root = join(__dirname, '..')

type Component = { name: string; spec: string | null; radix: string[]; props: { name: string; required: boolean }[] }
type Token = { name: string; default: string; dark?: string }

describe('generated manifest (real repo)', () => {
  const manifest = gen.buildManifest(root) as { components: Component[]; tokens: Token[] }

  it('lists every component exported from src/index.ts (fails on drift)', () => {
    const runtime = Object.entries(lib)
      .filter(([name, value]) => /^[A-Z]/.test(name) && (typeof value === 'function' || (typeof value === 'object' && value !== null && '$$typeof' in value)))
      .map(([name]) => name)
    const listed = manifest.components.map((c) => c.name)
    // Components missing from the manifest, or manifest entries that no longer exist.
    expect(runtime.filter((n) => !listed.includes(n))).toEqual([])
    expect(listed.filter((n) => !runtime.includes(n))).toEqual([])
    expect(listed).toEqual(expect.arrayContaining(['Button', 'Dialog', 'Select']))
  })

  it('lists props with types, spec paths and Radix primitives', () => {
    const dialog = manifest.components.find((c) => c.name === 'Dialog')
    expect(dialog?.spec).toBe('docs/specs/Dialog.md')
    expect(dialog?.radix).toContain('Dialog')
    expect(dialog?.props.length).toBeGreaterThan(0)
    const button = manifest.components.find((c) => c.name === 'Button')
    expect(button?.props.map((p) => p.name)).toEqual(expect.arrayContaining(['variant']))
  })

  it('maps components to the right spec (null when none covers them)', () => {
    const spec = (n: string) => manifest.components.find((c) => c.name === n)?.spec
    const expected: Record<string, string | null> = {
      Field: null, Input: null, TextField: null, Alert: null, Badge: null, Tag: null, Breadcrumb: null,
      Switch: 'docs/specs/Toggle.md', SegmentedControl: 'docs/specs/Toggle.md', TileGroup: 'docs/specs/Toggle.md',
      Popover: 'docs/specs/InfoTip.md', Tooltip: 'docs/specs/InfoTip.md', InfoTip: 'docs/specs/InfoTip.md',
      IconButton: 'docs/specs/Button.md', ButtonGroup: 'docs/specs/Button.md', Button: 'docs/specs/Button.md',
      Stack: 'docs/specs/Layout.md', Grid: 'docs/specs/Layout.md', SelectField: 'docs/specs/Select.md',
      SliderField: 'docs/specs/Slider.md', Toaster: 'docs/specs/Toast.md', Dialog: 'docs/specs/Dialog.md',
    }
    for (const [name, want] of Object.entries(expected)) expect([name, spec(name)]).toEqual([name, want])
    expect(manifest.components.filter((c) => c.spec && /ClaudePlugin|Theming|Themes|Typography|Introduction/.test(c.spec))).toEqual([])
  })

  it('lists every --ds-* property in tokens.css with its default value', () => {
    const css = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8')
    const names = new Set([...css.matchAll(/^\s*(--ds-[\w-]+)\s*:/gm)].map((m) => m[1]))
    expect(new Set(manifest.tokens.map((t) => t.name))).toEqual(names)
    expect(manifest.tokens.every((t) => t.default !== '')).toBe(true)
    expect(manifest.tokens.find((t) => t.name === '--ds-color-white')?.default).toBe('#ffffff')
    expect(manifest.tokens.find((t) => t.name === '--ds-color-background')?.dark).toBeDefined()
  })

  it('exports ./manifest.json from package.json and builds it in npm run build', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    expect(pkg.exports['./manifest.json']).toBe('./dist/manifest.json')
    expect(pkg.scripts.build).toContain('generate-manifest')
  })
})

describe('helpers', () => {
  it('parseTokens reads defaults and dark overrides, ignoring comments', () => {
    const t = gen.parseTokens(`/* --ds-x: 1; */ :root { --ds-a: 1px; --ds-b: var(--ds-a); } [data-theme="dark"] { --ds-b: 2px; --ds-only-dark: 3; } .x { --ds-c: 4; }`)
    expect(t).toEqual([{ name: '--ds-a', default: '1px' }, { name: '--ds-b', default: 'var(--ds-a)', dark: '2px' }])
  })

  it('radixPrimitives finds imports and tolerates missing folders', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ds-radix-'))
    writeFileSync(join(dir, 'A.tsx'), "import { Dialog, Slot as S } from 'radix-ui'\n")
    writeFileSync(join(dir, 'A.test.tsx'), "import { Tabs } from 'radix-ui'\n")
    expect(gen.radixPrimitives(dir)).toEqual(['Dialog', 'Slot'])
    expect(gen.radixPrimitives(join(dir, 'nope'))).toEqual([])
  })

  it('findSpec uses overrides, then <Name>.md, else null', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ds-spec-'))
    mkdirSync(join(dir, 'docs/specs'), { recursive: true })
    for (const f of ['Foo', 'Toggle']) writeFileSync(join(dir, `docs/specs/${f}.md`), 'x')
    expect(gen.findSpec('Foo', dir)).toBe('docs/specs/Foo.md')
    expect(gen.findSpec('Switch', dir)).toBe('docs/specs/Toggle.md')
    expect(gen.findSpec('Nothing', dir)).toBeNull()
    expect(gen.findSpec('Tag', dir)).toBeNull()
    expect(gen.findSpec('Stack', dir)).toBeNull()
    expect(gen.findSpec('Foo', join(dir, 'missing'))).toBeNull()
  })

  it('writeManifest writes JSON to the given path', () => {
    const out = join(mkdtempSync(join(tmpdir(), 'ds-out-')), 'sub', 'manifest.json')
    const m = gen.writeManifest(root, out)
    expect(JSON.parse(readFileSync(out, 'utf8')).components).toHaveLength(m.components.length)
  })

  it('collectComponents handles odd exports in a fixture project', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ds-fix-'))
    mkdirSync(join(dir, 'src/components/Box'), { recursive: true })
    writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { lib: ['ES2022'], types: [], strict: true, module: 'ESNext', moduleResolution: 'Bundler', jsx: 'preserve' } }))
    writeFileSync(join(dir, 'src/components/Box/Box.tsx'), "import { Dialog } from 'radix-ui'\nexport interface Element { x?: number }\nexport interface BoxProps {\n  /** the a */\n  a: string\n  b?: number\n}\nexport function Box(p: BoxProps): Element { return {} }\nexport function Bare(): Element { return {} }\nexport function Num(): number { return 1 }\nexport const Five = 5\nexport function lower(): Element { return {} }\nexport type Ty = string\n")
    writeFileSync(join(dir, 'src/components/Box/index.ts'), "export * from './Box'\n")
    writeFileSync(join(dir, 'src/Loose.ts'), 'export interface Element {}\nexport function Loose(): Element { return {} }\n')
    writeFileSync(join(dir, 'src/index.ts'), "export * from './components/Box'\nexport { Loose } from './Loose'\n")
    const list = gen.collectComponents(join(dir, 'src/index.ts'), dir) as (Component & { source: string })[]
    expect(list.map((c) => c.name)).toEqual(['Bare', 'Box', 'Loose'])
    const box = list.find((c) => c.name === 'Box')
    expect(box?.props).toEqual([
      { name: 'a', type: 'string', required: true, description: 'the a' },
      { name: 'b', type: 'number | undefined', required: false, description: '' },
    ])
    expect(list.find((c) => c.name === 'Bare')?.props).toEqual([])
    expect(list.find((c) => c.name === 'Loose')?.radix).toEqual([])
    expect(list.find((c) => c.name === 'Loose')?.spec).toBeNull()
  })

  it('collectComponents throws when the entry cannot be read', () => {
    expect(() => gen.collectComponents(join(root, 'nope.ts'))).toThrow('Cannot read')
  })
})
