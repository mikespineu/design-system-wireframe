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

// `ink` was the single pre-theming color for text, borders, icons and focus. It is a deprecated alias now.
const INK_UTILITY = /\b[a-z-]*:?(?:bg|text|border|ring|outline|fill|stroke|divide|decoration|accent|caret)-ink\b/
const INK_VAR = /--ds-color-ink\b/

// Tailwind classes that carry a raw font size, weight, tracking, leading, case or shadow.
// Role-backed utilities (text-body, text-ui, font-label, font-medium, rounded-*) are fine.
const RAW_CLASS =
  /(?<![\w-])(?:[a-z-]+:)*(?:text-(?:xs|sm|base|lg|xl|[2-9]xl)|text-\[[^\]]*\]|font-(?:thin|extralight|light|semibold|extrabold|black|mono)|uppercase|lowercase|capitalize|normal-case|tracking-[\w[\].-]+|leading-[\w[\].-]+|shadow(?:-[\w[\].-]+)?)(?![\w-])/

const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, '')

/** Typography and depth declarations in CSS whose value is not a role (`var(...)`). */
const literalDeclarations = (css: string) => {
  const found: string[] = []
  const decl = /([\w-]+)\s*:\s*([^;{}]+)(?=[;}])/g
  for (const [, prop = "", value = ""] of stripComments(css).matchAll(decl)) {
    const v = value.trim()
    const typed =
      /^(?:font-size|font-weight|line-height|letter-spacing|text-transform|box-shadow|font-family)$/.test(prop) ||
      /^--[\w-]+-(?:font|line|weight|tracking)$/.test(prop)
    if (typed && !v.includes('var(') && !/^(?:inherit|0|1)$/.test(v)) found.push(`${prop}: ${v}`)
  }
  return found
}

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

  it.each(files.map((f) => [f.slice(root.length + 1), f]))('%s does not use the deprecated ink color', (_n, file) => {
    const src = readFileSync(file, 'utf8')
    expect(src).not.toMatch(INK_UTILITY)
    expect(src).not.toMatch(INK_VAR)
  })
})

describe('components set typography and depth only through roles', () => {
  const files = collect(root)

  it.each(files.filter((f) => f.endsWith('.css')).map((f) => [f.slice(root.length + 1), f]))(
    '%s has no literal font, leading, tracking, case or shadow values',
    (_n, file) => {
      expect(literalDeclarations(readFileSync(file, 'utf8'))).toEqual([])
    },
  )

  it.each(files.filter((f) => f.endsWith('.tsx')).map((f) => [f.slice(root.length + 1), f]))(
    '%s has no raw typography or shadow classes',
    (_n, file) => {
      const src = readFileSync(file, 'utf8')
      expect(src.match(new RegExp(RAW_CLASS.source, 'g')) ?? []).toEqual([])
    },
  )

  it('detects literals and accepts roles (self-check)', () => {
    expect(literalDeclarations('a { font-size: 12px; box-shadow: none; --x-line: 20px }')).toEqual([
      'font-size: 12px',
      'box-shadow: none',
      '--x-line: 20px',
    ])
    expect(literalDeclarations('a { font-size: var(--ds-text-body-size); line-height: 0; --a-font: var(--b) }')).toEqual([])
    expect('text-sm font-bold uppercase'.match(new RegExp(RAW_CLASS.source, 'g'))).toEqual(['text-sm', 'uppercase'])
    expect('text-ui font-label font-medium rounded-lg'.match(new RegExp(RAW_CLASS.source, 'g'))).toBeNull()
  })
})
