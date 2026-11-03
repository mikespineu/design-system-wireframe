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

  it('findSpec prefers exact file, then most mentions, honours overrides, else null', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ds-spec-'))
    mkdirSync(join(dir, 'docs/specs'), { recursive: true })
    writeFileSync(join(dir, 'docs/specs/Foo.md'), 'x')
    writeFileSync(join(dir, 'docs/specs/Intro.md'), '`Bar` and `Bar` `Baz`')
    writeFileSync(join(dir, 'docs/specs/Other.md'), '`Bar`')
    expect(gen.findSpec('Foo', dir)).toBe('docs/specs/Foo.md')
    expect(gen.findSpec('Bar', dir)).toBe('docs/specs/Intro.md')
    expect(gen.findSpec('Nothing', dir)).toBeNull()
    expect(gen.findSpec('Tag', dir)).toBeNull()
    expect(gen.findSpec('Foo', join(dir, 'missing'))).toBeNull()
  })

  it('writeManifest writes JSON to the given path', () => {
    const out = join(mkdtempSync(join(tmpdir(), 'ds-out-')), 'sub', 'manifest.json')
    const m = gen.writeManifest(root, out)
    expect(JSON.parse(readFileSync(out, 'utf8')).components).toHaveLength(m.components.length)
  })

  it('collectComponents throws when the entry cannot be read', () => {
    expect(() => gen.collectComponents(join(root, 'nope.ts'))).toThrow('Cannot read')
  })
})
