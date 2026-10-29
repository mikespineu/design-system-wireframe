import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as lib from '../index'
import { themeRoleGroups, themeRoles } from './roles'

const css = readFileSync(join(__dirname, 'tokens.css'), 'utf8')

/** Declarations of the first block whose selector contains `selector`. */
const block = (selector: string) => {
  const start = css.indexOf(selector)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('\n}', start))
  return new Map([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m): [string, string] => [m[1]!, m[2]!.trim()]))
}

describe('theme role list', () => {
  it('has 87 unique roles in the contract groups', () => {
    expect(themeRoles).toHaveLength(87)
    expect(new Set(themeRoles).size).toBe(87)
    expect(themeRoleGroups.color).toHaveLength(30)
    expect(themeRoleGroups.font).toHaveLength(4)
    expect(themeRoleGroups.fontWeight).toHaveLength(3)
    expect(themeRoleGroups.typeScale).toHaveLength(36)
    expect(themeRoleGroups.radius).toHaveLength(4)
    expect(themeRoleGroups.shadow).toHaveLength(3)
    expect(themeRoleGroups.shape).toHaveLength(7)
  })

  it('is exported from the package entry', () => {
    expect(lib.themeRoles).toBe(themeRoles)
    expect(lib.themeRoleGroups).toBe(themeRoleGroups)
  })

  it('has a default value in tokens.css for every role', () => {
    const defaults = block(':root,')
    for (const role of themeRoles) expect(defaults.has(role)).toBe(true)
  })

  it('overrides exactly the 30 color roles in the dark theme', () => {
    const dark = block('[data-theme="dark"]')
    for (const role of themeRoleGroups.color) expect(dark.has(role)).toBe(true)
    const others = [...dark.keys()].filter((k) => !(themeRoleGroups.color as readonly string[]).includes(k))
    expect(others).toEqual(['--ds-color-ink'])
    expect(css).toMatch(/\[data-theme="dark"\]\s*\{\s*color-scheme: dark;/)
  })

  it('keeps --ds-color-ink as a deprecated alias of the emphasis text color', () => {
    expect(block(':root,').get('--ds-color-ink')).toBe('var(--ds-color-text-emphasis)')
  })
})
