import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** QA complement to canvasBoards.test.ts: named CSS colors and literal color-mix() inputs must not bypass the token rule. */
const dir = join(__dirname, '..', '..', 'docs', 'design-system-wireframe')
const EXEMPT = ['AllComponents.dc.html', 'Theming.dc.html']
const boards = readdirSync(dir)
  .filter((f) => f.endsWith('.dc.html') && !EXEMPT.includes(f))
  .sort()

const NAMED =
  'white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|navy|teal|maroon|lime|aqua|fuchsia|olive|brown|gold|crimson|tomato|coral|salmon'
const PROP = '(?:color|background(?:-color)?|border(?:-[a-z]+)*|fill|stroke|outline(?:-color)?|box-shadow|text-shadow|stop-color|accent-color|caret-color)'
const NAMED_VALUE = new RegExp(`(?<![\\w-])${PROP}\\s*:[^;}"'<>]*?(?<![\\w-])(?:${NAMED})(?![\\w-])`, 'gi')
const NAMED_ATTR = new RegExp(`\\b(?:fill|stroke|stop-color|flood-color)="(?:${NAMED})"`, 'gi')

function strip(html: string): string {
  return html
    .replace(/\/\* ds-tokens:start \*\/[\s\S]*?\/\* ds-tokens:end \*\//, '')
    .replace(/<svg\b[^>]*\bdata-ds-illustration\b[^>]*>[\s\S]*?<\/svg>/g, '')
    .replace(/<pre\b[^>]*\bdata-ds-code\b[^>]*>[\s\S]*?<\/pre>/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
}

describe.each(boards)('%s named colors', (board) => {
  const html = strip(readFileSync(join(dir, board), 'utf8'))
  it('uses no named CSS color as a style value', () => {
    expect(html.match(NAMED_VALUE) ?? []).toEqual([])
    expect(html.match(NAMED_ATTR) ?? []).toEqual([])
  })
  it('keeps color-mix() inputs on var(--ds-*) or transparent', () => {
    const bad = [...html.matchAll(/color-mix\(([^;}]*)\)/g)].filter((m) =>
      new RegExp(`(?<![\\w-])(?:${NAMED})(?![\\w-])`, 'i').test((m[1] ?? '').replace(/var\(--ds-[a-z0-9-]+\)/g, '')),
    )
    expect(bad.map((m) => m[0])).toEqual([])
  })
})
