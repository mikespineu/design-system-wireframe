/**
 * @jest-environment node
 */
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const heading = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'].map((s) => `heading-${s}`)
const body = ['lg', 'md', 'sm', 'xs', '2xs'].map((s) => `body-${s}`)
const composed = [...heading, ...body]
const modifiers = ['font-normal', 'font-medium', 'font-bold', 'font-sans', 'font-mono', 'text-text', 'text-muted', 'text-ink', 'text-inherit']

let css = ''

beforeAll(() => {
  css = execFileSync(
    'node',
    [join(process.cwd(), 'test/compile-tailwind.mjs'), ...composed, ...modifiers, 'truncate', 'line-clamp-2', 'md:heading-xl'],
    { encoding: 'utf8' },
  )
})

const rule = (cls: string) => {
  const esc = cls.replace(':', '\\:')
  const m = css.match(new RegExp(`\\.${esc}\\s*\\{([^}]*)\\}`))
  return m?.[1] ?? ''
}
const pos = (cls: string) => css.indexOf(`.${cls.replace(':', '\\:')} {`)

describe('typography utilities (compiled CSS)', () => {
  it.each(composed)('%s exists', (c) => {
    expect(rule(c)).not.toBe('')
  })

  it.each([
    ['heading-2xl', '4.5rem', '-0.04em'],
    ['heading-xl', '3rem', '-0.03em'],
    ['heading-lg', '2rem', '-0.02em'],
    ['heading-md', '1.375rem', 'var(--tracking-normal)'],
    ['heading-sm', '1.125rem', 'var(--tracking-normal)'],
    ['heading-xs', '1rem', 'var(--tracking-normal)'],
    ['body-lg', '1.125rem', 'var(--tracking-normal)'],
    ['body-md', '1rem', 'var(--tracking-normal)'],
    ['body-sm', '0.9375rem', 'var(--tracking-normal)'],
    ['body-xs', '0.8125rem', 'var(--tracking-normal)'],
    ['body-2xs', '0.75rem', 'var(--tracking-normal)'],
  ])('%s resolves size %s and tracking %s', (c, size, tracking) => {
    const r = rule(c)
    expect(r).toContain(`font-size: ${size}`)
    expect(r.includes(`letter-spacing: ${tracking};`) || r.includes(`letter-spacing: var(--tw-tracking, ${tracking});`)).toBe(true)
  })

  it('maps line heights', () => {
    expect(rule('heading-md')).toContain('--ds-line-height-xl')
    expect(rule('body-md')).toContain('--ds-line-height-lg')
    expect(rule('body-xs')).toContain('--ds-line-height-sm')
    expect(rule('body-2xs')).toContain('--ds-line-height-xs')
  })

  it.each(heading)('%s balances with the longhand only', (c) => {
    const r = rule(c)
    expect(r).toContain('text-wrap-style: balance')
    expect(r).not.toMatch(/text-wrap:/)
  })

  it.each(composed)('%s sets no layout or truncation properties', (c) => {
    expect(rule(c)).not.toMatch(/(margin|padding|display|overflow|white-space|text-overflow|text-transform)\s*:/)
  })

  it.each(modifiers)('%s is emitted after every composed class', (m) => {
    for (const c of composed) expect(pos(m)).toBeGreaterThan(pos(c))
  })

  it('md:heading-xl comes after heading-lg', () => {
    expect(pos('md:heading-xl')).toBeGreaterThan(pos('heading-lg'))
  })
})
