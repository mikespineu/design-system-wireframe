import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = join(__dirname, '..')
const checker = join(root, 'plugins', 'wireframe-ds', 'scripts', 'ui-review.cjs')
const fixtures = join(__dirname, 'fixtures', 'ui-review')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildManifest } = require('./generate-manifest.cjs')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ui = require(checker)

interface Finding { file: string; line: number; rule: string; message: string; fix: string }
const manifest = buildManifest(root)
const bad: Finding[] = ui.reviewPaths([join(fixtures, 'bad')], manifest)
const clean: Finding[] = ui.reviewPaths([join(fixtures, 'clean')], manifest)
const lineOf = (file: string, needle: string) =>
  readFileSync(join(fixtures, 'bad', file), 'utf8').split('\n').findIndex((l) => l.includes(needle)) + 1

describe('ui-review checker', () => {
  it('flags every rule in the bad sample', () => {
    expect(new Set(bad.map((f) => f.rule))).toEqual(new Set(Object.keys(ui.RULES)))
  })

  it('reports file, line, rule and a fix for each finding', () => {
    for (const f of bad) {
      expect(f.file).toMatch(/fixtures\/ui-review\/bad\//)
      expect(f.line).toBeGreaterThan(0)
      expect(f.fix.length).toBeGreaterThan(5)
      expect(ui.formatFinding(f)).toMatch(/Bad\.(tsx|css)\.fixture:\d+ {2}[a-z-]+ /)
    }
  })

  it.each([
    ['Bad.tsx.fixture', "style={{ padding", 'hardcoded-spacing'],
    ['Bad.tsx.fixture', "style={{ padding", 'hardcoded-color'],
    ['Bad.tsx.fixture', '<button', 'hand-rolled-primitive'],
    ['Bad.tsx.fixture', 'role="switch"', 'hand-rolled-primitive'],
    ['Bad.tsx.fixture', 'type="checkbox"', 'hand-rolled-primitive'],
    ['Bad.tsx.fixture', "from 'radix-ui'", 'direct-radix-import'],
    ['Bad.tsx.fixture', '<Input placeholder', 'missing-label'],
    ['Bad.tsx.fixture', '<IconButton', 'missing-label'],
    ['Bad.tsx.fixture', '<Input id="email"', 'field-wiring'],
    ['Bad.tsx.fixture', '<TextField label="Nested"', 'field-wiring'],
    ['Bad.css.fixture', 'padding: 13px', 'hardcoded-spacing'],
    ['Bad.css.fixture', 'background: #fff', 'hardcoded-color'],
    ['Bad.css.fixture', 'gap: 1rem', 'hardcoded-spacing'],
  ])('%s: line with %s gets %s', (file, needle, rule) => {
    const line = lineOf(file, needle)
    expect(bad.some((f) => f.file.endsWith(file) && f.line === line && f.rule === rule)).toBe(true)
  })

  it('flags missing required props and missing aria-label on IconButton', () => {
    const line = lineOf('Bad.tsx.fixture', '<IconButton aria-label="Close"')
    expect(bad.some((f) => f.rule === 'missing-required-prop' && f.line === line && f.message.includes('`icon`'))).toBe(true)
    expect(bad.some((f) => f.rule === 'missing-label' && f.message.includes('aria-label'))).toBe(true)
  })

  it('suggests the matching token from the manifest', () => {
    const color = bad.find((f) => f.rule === 'hardcoded-color' && f.message.includes('#a3302b'))
    expect(color?.fix).toContain('var(--ds-color-error)')
    const space = bad.find((f) => f.rule === 'hardcoded-spacing' && f.message.includes('16px'))
    expect(space?.fix).toContain('var(--ds-space-4)')
  })

  it('names the wrapper from the manifest, not a fixed list', () => {
    const slim = { ...manifest, components: manifest.components.filter((c: { name: string }) => c.name !== 'Button') }
    const findings: Finding[] = ui.reviewPaths([join(fixtures, 'bad', 'Bad.tsx.fixture')], slim)
    expect(findings.some((f) => f.message.includes('<button'))).toBe(false)
  })

  it('gives a generic fix for primitives without a clear owner', () => {
    const slot = bad.find((f) => f.rule === 'direct-radix-import' && f.line === lineOf('Bad.tsx.fixture', 'import { Slot }'))
    expect(slot?.fix).toMatch(/Check whether the design system ships/)
    expect(slot?.fix).not.toMatch(/Breadcrumb|Checkbox/)
    const dialog = bad.find((f) => f.rule === 'direct-radix-import' && f.line === lineOf('Bad.tsx.fixture', 'import { Dialog }'))
    expect(dialog?.fix).toContain('Use Dialog')
  })

  it('does not treat anchors or hex-like text as colors (clean sample has both)', () => {
    expect(readFileSync(join(fixtures, 'clean', 'Clean.tsx.fixture'), 'utf8')).toContain('href="#2026"')
    expect(clean.filter((f) => f.rule === 'hardcoded-color')).toEqual([])
  })

  it('finds nothing in the clean sample', () => {
    expect(clean).toEqual([])
  })

  describe('CLI', () => {
    const manifestFile = join(fixtures, '..', '..', '..', 'node_modules', '.cache-ui-review-manifest.json')
    beforeAll(() => {
      writeFileSync(manifestFile, JSON.stringify(manifest))
    })
    afterAll(() => rmSync(manifestFile, { force: true }))

    it('exits 1 and prints file:line for the bad sample', () => {
      let out = ''
      let code = 0
      try {
        execFileSync('node', [checker, '--manifest', manifestFile, join(fixtures, 'bad')], { encoding: 'utf8' })
      } catch (e) {
        const err = e as { status: number; stdout: string }
        code = err.status
        out = err.stdout
      }
      expect(code).toBe(1)
      expect(out).toMatch(/Bad\.tsx\.fixture:\d+ {2}hardcoded-color/)
    })

    it('exits 0 for the clean sample and supports --json', () => {
      const out = execFileSync('node', [checker, '--manifest', manifestFile, '--json', join(fixtures, 'clean')], { encoding: 'utf8' })
      expect(JSON.parse(out)).toEqual([])
    })

    it('explains how to proceed when no manifest is installed', () => {
      let err = ''
      try {
        execFileSync('node', [checker, join(fixtures, 'clean')], { encoding: 'utf8', stdio: 'pipe', cwd: fixtures })
      } catch (e) {
        err = (e as { stderr: string }).stderr
      }
      expect(err).toMatch(/pass --manifest/)
    })

    it('prints usage without paths', () => {
      expect(() => execFileSync('node', [checker, '--manifest', manifestFile], { stdio: 'pipe' })).toThrow()
    })
  })
})

describe('ui-review agent', () => {
  const agent = readFileSync(join(root, 'plugins', 'wireframe-ds', 'agents', 'ui-review.md'), 'utf8')
  it('has valid plugin agent frontmatter', () => {
    const fm = /^---\n([\s\S]*?)\n---\n/.exec(agent)![1]!
    expect(fm).toMatch(/^name: ui-review$/m)
    expect(fm).toMatch(/^description: .{40,}$/m)
    expect(fm).toMatch(/^tools: .*Bash/m)
  })
  it('reads the manifest and documents every rule', () => {
    expect(agent).toContain('manifest.json')
    expect(agent).toContain('file:line')
    for (const rule of Object.keys(ui.RULES)) expect(agent).toContain('`' + rule + '`')
  })
})
