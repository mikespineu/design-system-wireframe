import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname)

function collect(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return collect(p)
    const isSource = /\.(tsx|css)$/.test(name) && !/\.(stories|test)\./.test(name)
    return isSource ? [p] : []
  })
}

const PALETTE_UTILITY =
  /\b[a-z-]*:?(?:bg|text|border|ring|outline|fill|stroke|from|to|via|divide|placeholder|decoration|accent|caret)-(?:white|black|gray-\d+)\b/
const PALETTE_VAR = /--ds-color-(?:white|black|gray-\d+)\b/

describe('components use only semantic color roles', () => {
  const files = collect(root)

  it('finds component sources', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files.map((f) => [f.slice(root.length + 1), f]))('%s has no palette utilities or vars', (_n, file) => {
    const src = readFileSync(file, 'utf8')
    expect(src).not.toMatch(PALETTE_UTILITY)
    expect(src).not.toMatch(PALETTE_VAR)
  })
})
