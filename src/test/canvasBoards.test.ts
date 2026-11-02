import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(__dirname, '..', '..', 'docs', 'design-system-wireframe')
const boardsOnDisk = readdirSync(dir).filter((f) => f.endsWith('.dc.html')).sort()
const canvas = JSON.parse(readFileSync(join(dir, 'canvas.json'), 'utf8')) as {
  boards: Record<string, unknown>
  order: string[]
}

const root = join(__dirname, '..', '..')
const read = (file: string) => readFileSync(file, 'utf8')

/** Boards that are not held to the role-token rule (DS-63): Theming shows custom themes, AllComponents already reads var(--ds-*). */
const EXEMPT = ['AllComponents.dc.html', 'Theming.dc.html']
const roleBoards = boardsOnDisk.filter((b) => !EXEMPT.includes(b))

const START = '/* ds-tokens:start */'
const END = '/* ds-tokens:end */'
/** Extra theme files a board's token block also carries, after tokens.css. */
const EXTRA_THEMES: Record<string, string[]> = {
  'Themes.dc.html': [join(root, 'src', 'themes', 'bold.css')],
}

const squash = (css: string) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, '')
    .toLowerCase()

/** tokens.css without its `@layer ds { ... }` wrapper, so it works unlayered in a board. */
function unlayered(css: string): string {
  const open = css.indexOf('@layer ds')
  const body = css.slice(css.indexOf('{', open) + 1, css.lastIndexOf('}'))
  return body
}

function expectedTokens(board: string): string {
  const parts = [unlayered(read(join(root, 'src', 'styles', 'tokens.css')))]
  for (const extra of EXTRA_THEMES[board] ?? []) parts.push(read(extra))
  return squash(parts.join('\n'))
}

function tokenBlock(html: string): string | null {
  const start = html.indexOf(START)
  const end = html.indexOf(END)
  if (start === -1 || end === -1 || end < start) return null
  return html.slice(start + START.length, end)
}

/** Documented sample code (createTheme() inputs) keeps its literal values in <pre data-ds-code>; listed in the canvas README. */
const CODE = /<pre\b[^>]*\bdata-ds-code\b[^>]*>[\s\S]*?<\/pre>/g
/** Illustration-only fills (photo stand-ins) live in <svg data-ds-illustration>; listed in the canvas README. */
const ILLUSTRATION = /<svg\b[^>]*\bdata-ds-illustration\b[^>]*>[\s\S]*?<\/svg>/g
const HEX = /(?<![&\w])#[0-9a-fA-F]{3,8}(?![\w-])/g
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/g

function outsideTokens(html: string): string {
  const block = tokenBlock(html)
  const rest = block === null ? html : html.replace(START + block + END, '')
  return rest.replace(ILLUSTRATION, '').replace(CODE, '')
}

describe('design-system-wireframe canvas', () => {
  it('canvas.json lists exactly the boards on disk', () => {
    expect(Object.keys(canvas.boards).sort()).toEqual(boardsOnDisk)
    expect([...canvas.order].sort()).toEqual(boardsOnDisk)
  })

  it.each([
    ['canvas README', join(dir, 'README.md')],
    ['root README', join(dir, '..', '..', 'README.md')],
  ])('%s lists every board', (_name, file) => {
    const text = readFileSync(file, 'utf8')
    boardsOnDisk.forEach((b) => expect(text).toContain(`\`${b}\``))
  })

  it('Components.dc.html is gone', () => {
    expect(existsSync(join(dir, 'Components.dc.html'))).toBe(false)
  })

  it('AllComponents.dc.html only uses tokens that exist in tokens.css', () => {
    const tokens = readFileSync(join(__dirname, '..', 'styles', 'tokens.css'), 'utf8')
    const html = readFileSync(join(dir, 'AllComponents.dc.html'), 'utf8')
    const used = new Set([...html.matchAll(/var\((--ds-[a-z0-9-]+)/g)].map((m) => m[1]))
    const missing = [...used].filter((t) => !new RegExp(`${t}\\s*:`).test(tokens))
    expect(missing).toEqual([])
  })

  describe.each(roleBoards)('%s role tokens', (board) => {
    const html = read(join(dir, board))

    it('carries one token block identical to tokens.css', () => {
      const block = tokenBlock(html)
      expect(block).not.toBeNull()
      expect(html.split(START)).toHaveLength(2)
      expect(squash(block ?? '')).toBe(expectedTokens(board))
    })

    it('has no hex color outside the token block and illustration fills', () => {
      expect(outsideTokens(html).match(HEX) ?? []).toEqual([])
    })

    it('has no rgb(), hsl() or other color function outside the token block', () => {
      expect(outsideTokens(html).match(COLOR_FN) ?? []).toEqual([])
    })

    it('only reads tokens that exist', () => {
      const tokens = unlayered(read(join(root, 'src', 'styles', 'tokens.css')))
      const used = new Set([...outsideTokens(html).matchAll(/var\((--ds-[a-z0-9-]+)/g)].map((m) => m[1]))
      const missing = [...used].filter((t) => !new RegExp(`${t}\\s*:`).test(tokens))
      expect(missing).toEqual([])
    })
  })

  it.each(boardsOnDisk)('%s does not mention the deleted Components.dc.html', (board) => {
    expect(read(join(dir, board))).not.toMatch(/\bComponents\.dc\.html/)
  })

  it('canvas README lists every board that uses illustration fills', () => {
    const readme = read(join(dir, 'README.md'))
    const section = readme.slice(readme.indexOf('Illustration-only fills'))
    const using = roleBoards.filter((b) => {
      const html = read(join(dir, b))
      return html.match(ILLUSTRATION) !== null || html.match(CODE) !== null
    })
    expect(readme).toContain('Illustration-only fills')
    using.forEach((b) => expect(section).toContain(`\`${b}\``))
  })
})
