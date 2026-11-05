import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { validate } = require('./validate-plugin-manifests.cjs') as { validate: (root: string) => string[] }

const repo = join(__dirname, '..')
let tmp: string

function edit(rel: string, fn: (json: Record<string, unknown>) => void) {
  const file = join(tmp, rel)
  const json = JSON.parse(readFileSync(file, 'utf8'))
  fn(json)
  writeFileSync(file, JSON.stringify(json))
}

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'plugin-manifests-'))
  for (const p of ['.claude-plugin', 'plugins', 'factory/.claude-plugin', 'factory/plugin/.claude-plugin', 'package.json']) {
    cpSync(join(repo, p), join(tmp, p), { recursive: true })
  }
})
afterEach(() => rmSync(tmp, { recursive: true, force: true }))

const PLUGIN = 'plugins/wireframe-ds/.claude-plugin/plugin.json'

describe('validate-plugin-manifests', () => {
  it('accepts the repository manifests', () => {
    expect(validate(repo)).toEqual([])
  })

  it('lists only wireframe-ds in the consumer marketplace', () => {
    const m = JSON.parse(readFileSync(join(repo, '.claude-plugin/marketplace.json'), 'utf8'))
    expect(m.plugins.map((p: { name: string }) => p.name)).toEqual(['wireframe-ds'])
  })

  it('fails when factory is added to the consumer marketplace', () => {
    edit('.claude-plugin/marketplace.json', (m) => {
      ;(m.plugins as unknown[]).push({ name: 'factory', source: './factory/plugin' })
    })
    expect(validate(tmp).join('\n')).toMatch(/must list only "wireframe-ds"/)
  })

  it('fails when the factory marketplace lists another plugin', () => {
    edit('factory/.claude-plugin/marketplace.json', (m) => {
      ;(m.plugins as unknown[]).push({ name: 'wireframe-ds', source: './x' })
    })
    expect(validate(tmp).join('\n')).toMatch(/must list only "factory"/)
  })

  it('fails when the version differs from package.json', () => {
    edit(PLUGIN, (p) => {
      p.version = '9.9.9'
    })
    expect(validate(tmp).join('\n')).toMatch(/must equal package.json version/)
  })

  it.each(['description', 'homepage', 'license', 'author', 'keywords', 'version'])('fails when %s is missing', (key) => {
    edit(PLUGIN, (p) => {
      delete p[key]
    })
    expect(validate(tmp).length).toBeGreaterThan(0)
  })

  it('fails on a bad or reserved name', () => {
    edit(PLUGIN, (p) => {
      p.name = 'Bad Name'
    })
    expect(validate(tmp).join('\n')).toMatch(/lowercase slug/)
    edit(PLUGIN, (p) => {
      p.name = 'plugin'
    })
    expect(validate(tmp).join('\n')).toMatch(/reserved/)
  })

  it('fails when a marketplace entry repeats the version or points at a missing plugin', () => {
    edit('.claude-plugin/marketplace.json', (m) => {
      const p = (m.plugins as Record<string, unknown>[])[0]!
      p.version = '0.1.0'
    })
    expect(validate(tmp).join('\n')).toMatch(/do not repeat "version"/)
    rmSync(join(tmp, PLUGIN))
    expect(validate(tmp).join('\n')).toMatch(/has no \.claude-plugin\/plugin\.json/)
  })

  it('reports invalid JSON, missing files and a bad owner', () => {
    writeFileSync(join(tmp, '.claude-plugin/marketplace.json'), '{ nope')
    rmSync(join(tmp, 'plugins/wireframe-ds/LICENSE'))
    edit('factory/.claude-plugin/marketplace.json', (m) => {
      delete m.owner
      m.plugins = 'x'
    })
    const out = validate(tmp).join('\n')
    expect(out).toMatch(/invalid JSON/)
    expect(out).toMatch(/LICENSE is missing/)
    expect(out).toMatch(/"owner.name" is required/)
    expect(out).toMatch(/"plugins" must be an array/)
    rmSync(join(tmp, 'package.json'))
    expect(validate(tmp).join('\n')).toMatch(/package.json: file is missing/)
  })
})
