/**
 * @jest-environment node
 */
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const heading = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'].map((s) => `heading-${s}`)
const body = ['lg', 'md', 'sm', 'xs', '2xs'].map((s) => `body-${s}`)
const composed = [...heading, ...body]
const modifiers = ['font-normal', 'font-medium', 'font-bold', 'font-sans', 'font-mono', 'text-text', 'text-muted', 'text-ink', 'text-inherit']
const roleUtilities = ['font-label', 'font-heading', 'text-emphasis', 'text-icon', 'text-inverse', 'border-strong', 'rounded-sm', 'rounded-lg', 'rounded-full', 'case-label', 'text-ui', 'text-ui-sm', 'text-ui-xs', 'text-body-xs', 'text-label']

let css = ''

beforeAll(() => {
  css = execFileSync(
    'node',
    [join(process.cwd(), 'test/compile-tailwind.mjs'), ...composed, ...modifiers, ...roleUtilities, 'truncate', 'line-clamp-2', 'md:heading-xl'],
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
    ['heading-2xl', 'display', 'var(--tw-tracking, var(--ds-text-display-tracking))'],
    ['heading-xl', 'h1', 'var(--tw-tracking, var(--ds-text-h1-tracking))'],
    ['heading-lg', 'h2', 'var(--tw-tracking, var(--ds-text-h2-tracking))'],
    ['heading-md', 'h3', 'var(--tracking-normal)'],
    ['heading-sm', 'body-lg', 'var(--tracking-normal)'],
    ['heading-xs', 'body', 'var(--tracking-normal)'],
    ['body-lg', 'body-lg', 'var(--tracking-normal)'],
    ['body-md', 'body', 'var(--tracking-normal)'],
    ['body-sm', 'body-sm', 'var(--tracking-normal)'],
    ['body-xs', 'caption', 'var(--tracking-normal)'],
    ['body-2xs', 'ui-sm', 'var(--tracking-normal)'],
  ])('%s reads the %s size role and tracking %s', (c, style, tracking) => {
    const r = rule(c)
    expect(r).toContain(`font-size: var(--ds-text-${style}-size)`)
    expect(r).toContain(`letter-spacing: ${tracking};`)
  })

  it('maps line heights to roles', () => {
    expect(rule('heading-md')).toContain('--ds-text-h3-line-height')
    expect(rule('body-md')).toContain('--ds-text-body-line-height')
    expect(rule('body-xs')).toContain('--ds-text-caption-line-height')
    expect(rule('body-2xs')).toContain('--ds-text-ui-sm-line-height')
  })

  it.each(heading)('%s uses the heading font role', (c) => {
    expect(rule(c)).toContain('font-family: var(--ds-font-heading)')
  })

  it.each([
    ['font-medium', 'var(--ds-font-weight-medium)'],
    ['font-bold', 'var(--ds-font-weight-bold)'],
    ['font-normal', 'var(--ds-font-weight-regular)'],
    ['font-label', 'var(--ds-font-label)'],
    ['font-heading', 'var(--ds-font-heading)'],
    ['font-sans', 'var(--ds-font-body)'],
    ['text-emphasis', 'var(--ds-color-text-emphasis)'],
    ['text-icon', 'var(--ds-color-icon)'],
    ['text-inverse', 'var(--ds-color-text-inverse)'],
    ['border-strong', 'var(--ds-color-border-strong)'],
    ['rounded-sm', 'var(--ds-radius-sm)'],
    ['rounded-lg', 'var(--ds-radius-lg)'],
    ['rounded-full', 'var(--ds-radius-full)'],
    ['case-label', 'var(--ds-text-label-transform)'],
  ])('%s resolves to its role %s', (c, role) => {
    expect(rule(c)).toContain(role)
  })

  it.each(['text-ui', 'text-ui-sm', 'text-ui-xs', 'text-body-xs', 'text-label'])('%s reads size and line-height roles', (c) => {
    expect(rule(c)).toMatch(/font-size: var\(--ds-text-[\w-]+-size\)/)
    expect(rule(c)).toMatch(/line-height: var\(--tw-leading, var\(--ds-text-[\w-]+-line-height\)\)/)
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
