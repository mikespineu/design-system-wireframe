import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(__dirname, '..', '..', 'docs', 'design-system-wireframe')
const boardsOnDisk = readdirSync(dir).filter((f) => f.endsWith('.dc.html')).sort()
const canvas = JSON.parse(readFileSync(join(dir, 'canvas.json'), 'utf8')) as {
  boards: Record<string, unknown>
  order: string[]
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
})
