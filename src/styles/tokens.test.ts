import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(__dirname, 'tokens.css'), 'utf8')

const themeStyle = (extra = '') => {
  const style = document.createElement('style')
  style.textContent = css + extra
  document.head.appendChild(style)
  return style
}

const read = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim()

describe('theming', () => {
  afterEach(() => {
    document.head.innerHTML = ''
    document.documentElement.removeAttribute('data-theme')
  })

  it('registers the default theme on :root and [data-theme="default"]', () => {
    expect(css).toMatch(/:root,\s*\[data-theme='default'\]|:root,\s*\[data-theme="default"\]/)
  })

  it('applies default tokens with no data-theme set', () => {
    themeStyle()
    expect(read(document.documentElement, '--ds-color-white')).toBe('#ffffff')
  })

  it('applies default tokens under data-theme="default"', () => {
    themeStyle()
    document.documentElement.setAttribute('data-theme', 'default')
    expect(read(document.documentElement, '--ds-color-white')).toBe('#ffffff')
  })

  it('lets another data-theme scope override roles', () => {
    themeStyle(`[data-theme='other'] { --ds-color-white: #000000; }`)
    document.documentElement.setAttribute('data-theme', 'other')
    expect(read(document.documentElement, '--ds-color-white')).toBe('#000000')
  })
})
