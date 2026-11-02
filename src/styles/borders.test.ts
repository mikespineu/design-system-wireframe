/**
 * @jest-environment node
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Border widths are theme roles (--ds-border-width, --ds-border-width-strong): bold sets 2px / 3px.
// A literal Tailwind `border` or `border-2` would pin a component to 1px / 2px in every theme.

const components = join(__dirname, '..', 'components')
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
const files = walk(components).filter((f) => !/\.(test|stories)\.tsx?$/.test(f))

describe('border width utilities (compiled CSS)', () => {
  let css = ''
  beforeAll(() => {
    css = execFileSync('node', [join(process.cwd(), 'test/compile-tailwind.mjs'), 'border-line', 'border-line-strong', 'aria-[invalid=true]:border-line-strong'], {
      encoding: 'utf8',
    })
  })
  const rule = (sel: string) => css.match(new RegExp(`${sel.replace(/[[\]().=]/g, '\\$&')}[^{]*\\{([^}]*)\\}`))?.[1] ?? ''

  it('border-line draws a solid border at --ds-border-width', () => {
    expect(rule('.border-line')).toMatch(/border-style:\s*solid/)
    expect(rule('.border-line')).toMatch(/border-width:\s*var\(--ds-border-width\)/)
  })

  it('border-line-strong draws a solid border at --ds-border-width-strong', () => {
    expect(rule('.border-line-strong')).toMatch(/border-width:\s*var\(--ds-border-width-strong\)/)
  })

  it('works behind a variant', () => {
    expect(css).toMatch(/aria-\\\[invalid\\=true\\\]\\:border-line-strong/)
  })
})

/** A class token (optionally behind variants) that is Tailwind's literal border width: `border`, `border-2`, `border-t`, `border-y-4`. */
const literalBorder = /^(?:[\w[\]=-]+:)*border(?:-(?:2|4|8|[xytblrse](?:-(?:2|4|8))?))?$/
const literalIn = (classes: string) => classes.split(/\s+/).filter((c) => literalBorder.test(c))

describe('components take border widths from the roles', () => {
  it.each(files.filter((f) => f.endsWith('.tsx')).map((f) => [f.slice(components.length + 1), f]))(
    '%s has no literal Tailwind border width on a themed border',
    (_name, file) => {
      const src = readFileSync(file, 'utf8')
      const classes = [...src.matchAll(/(["'`])((?:(?!\1)[^\n])*)\1/g)].map((m) => m[2]!).filter((s) => /\s/.test(s) || s.startsWith('border'))
      expect(classes.flatMap(literalIn)).toEqual([])
    },
  )

  it('the detector flags the old classes', () => {
    expect(literalIn('flex border bg-surface')).toEqual(['border'])
    expect(literalIn('aria-[invalid=true]:border-2 border-t')).toEqual(['aria-[invalid=true]:border-2', 'border-t'])
    expect(literalIn('border-strong border-line border-transparent border-0 border-line-strong')).toEqual([])
  })

  it.each(files.filter((f) => f.endsWith('.css')).map((f) => [f.slice(components.length + 1), f]))(
    '%s sets border widths with the roles, not px values',
    (_name, file) => {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      const bad = [...css.matchAll(/border(?:-(?:top|right|bottom|left|inline|block)[\w-]*)?(?:-width)?\s*:\s*([^;]+);/g)]
        .map((m) => m[0])
        .filter((d) => /(^|[\s:])[1-9]\d*px/.test(d.replace(/^[^:]+:/, '')))
      expect(bad).toEqual([])
    },
  )

  it('Input invalid uses the strong width and Button/Alert/Tag/IconButton the base width', () => {
    const read = (n: string) => readFileSync(join(components, n, `${n}.tsx`), 'utf8')
    expect(read('Input')).toContain('aria-[invalid=true]:border-line-strong')
    for (const n of ['Input', 'Button', 'IconButton', 'Alert', 'Tag']) expect(read(n)).toMatch(/border-line(?![-\w])/)
  })
})
