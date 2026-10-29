import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(__dirname, 'tokens.css'), 'utf8')

// jsdom does not implement @layer and drops the block, so apply the rules unlayered here.
// Layer behavior is covered by the cascade tests below.
const unlayered = css.replace(/@layer ds \{/, '').replace(/\}\s*$/, '')

const themeStyle = (extra = '') => {
  const style = document.createElement('style')
  style.textContent = unlayered + extra
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

// Minimal model of the cascade pieces that matter here: layered rules lose to unlayered rules,
// then equal specificity falls back to source order. jsdom does not implement @layer, so the real
// file is parsed and resolved by hand.
type Rule = { selector: string; decls: Map<string, string>; layered: boolean; order: number }

const splitTop = (src: string) => {
  const out: { prelude: string; body: string }[] = []
  let depth = 0
  let start = 0
  let prelude = ''
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') {
      if (depth === 0) prelude = src.slice(start, i).trim()
      depth++
    } else if (src[i] === '}') {
      depth--
      if (depth === 0) {
        out.push({ prelude, body: src.slice(src.indexOf('{', start) + 1, i) })
        start = i + 1
      }
    }
  }
  return out
}

const rulesOf = (source: string, offset: number): Rule[] => {
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, '')
  const rules: Rule[] = []
  let order = offset
  for (const top of splitTop(stripped)) {
    const layered = top.prelude === '@layer ds'
    const inner = layered ? splitTop(top.body) : [top]
    for (const r of inner) {
      const decls = new Map([...r.body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m): [string, string] => [m[1]!, m[2]!.trim()]))
      rules.push({ selector: r.prelude, decls, layered, order: order++ })
    }
  }
  return rules
}

const matches = (selector: string, theme: string) =>
  selector.split(',').some((s) => {
    const t = s.trim()
    return t === ':root' || t === `[data-theme="${theme}"]` || t === `[data-theme='${theme}']`
  })

const resolve = (sheets: string[], theme: string, prop: string) => {
  const rules = sheets.flatMap((s, i) => rulesOf(s, i * 1000)).filter((r) => matches(r.selector, theme) && r.decls.has(prop))
  rules.sort((a, b) => Number(b.layered) - Number(a.layered) || a.order - b.order)
  return rules.at(-1)?.decls.get(prop)
}

describe('cascade layer', () => {
  const override = `[data-theme="acme"] { --ds-color-primary: #be185d; }`

  it('puts all of tokens.css in @layer ds', () => {
    const tops = splitTop(css.replace(/\/\*[\s\S]*?\*\//g, ''))
    expect(tops.length).toBeGreaterThan(0)
    for (const t of tops) expect(t.prelude).toBe('@layer ds')
  })

  it.each([
    ['after', [css, override]],
    ['before', [override, css]],
  ])('an unlayered [data-theme] block wins when it comes %s the library CSS', (_when, sheets) => {
    expect(resolve(sheets, 'acme', '--ds-color-primary')).toBe('#be185d')
  })

  it('falls back to the library default for roles the theme does not set', () => {
    expect(resolve([override, css], 'acme', '--ds-color-primary-hover')).toBe('var(--ds-color-gray-800)')
  })

  it('applies the dark block under data-theme="dark" and the default block otherwise', () => {
    expect(resolve([css], 'dark', '--ds-color-background')).toBe('var(--ds-color-gray-900)')
    expect(resolve([css], 'default', '--ds-color-background')).toBe('var(--ds-color-white)')
  })
})

describe('fonts are opt-in', () => {
  const root = join(__dirname, '..', '..')
  const fonts = readFileSync(join(__dirname, 'fonts.css'), 'utf8')

  it('keeps web font imports out of the library styles', () => {
    for (const f of ['tokens.css', 'tailwind.css']) {
      expect(readFileSync(join(__dirname, f), 'utf8')).not.toMatch(/fonts\.googleapis|@font-face|@import url/)
    }
  })

  it('ships the default fonts in fonts.css and exports it', () => {
    expect(fonts).toMatch(/Red\+Hat\+Mono/)
    expect(fonts).toMatch(/Red\+Hat\+Text/)
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    expect(pkg.exports['./fonts.css']).toBe('./dist/fonts.css')
    expect(pkg.exports['./styles.css']).toBe('./dist/styles.css')
    expect(pkg.scripts.build).toContain('fonts.css')
  })
})

// WCAG 2.x contrast between resolved default and dark values.
const hexOf = (theme: 'default' | 'dark', role: string, depth = 0): string => {
  const raw = resolve([css], theme, `--ds-color-${role}`) ?? resolve([css], 'default', `--ds-color-${role}`)
  if (!raw || depth > 5) throw new Error(`cannot resolve ${role}`)
  const ref = raw.match(/^var\(--ds-color-([\w-]+)\)$/)
  return ref?.[1] ? hexOf(theme, ref[1], depth + 1) : raw
}

const luminance = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

const textPairs: [string, string][] = [
  ['text-emphasis', 'background'], ['text-strong', 'background'], ['text', 'background'], ['text-muted', 'background'],
  ['placeholder', 'background'], ['text-emphasis', 'fill'], ['text-strong', 'fill'], ['primary-contrast', 'primary'],
  ['primary-contrast', 'primary-hover'], ['text-inverse', 'inverse'], ['info', 'info-bg'], ['text', 'info-bg'],
  ['success', 'success-bg'], ['text', 'success-bg'], ['success', 'background'], ['error', 'error-bg'],
  ['text-strong', 'error-bg'], ['error', 'background'], ['primary-contrast', 'error'],
]
const uiPairs: [string, string][] = [
  ['border-strong', 'background'], ['icon', 'background'], ['focus', 'background'], ['primary', 'background'],
  ['error', 'surface'], ['placeholder', 'background'], ['text-muted', 'background'], ['focus', 'surface'],
]

describe.each(['default', 'dark'] as const)('contrast in the %s theme', (theme) => {
  it.each(textPairs)('text %s on %s is at least 4.5:1', (fg, bg) => {
    expect(ratio(hexOf(theme, fg), hexOf(theme, bg))).toBeGreaterThanOrEqual(4.5)
  })
  it.each(uiPairs)('ui %s on %s is at least 3:1', (fg, bg) => {
    expect(ratio(hexOf(theme, fg), hexOf(theme, bg))).toBeGreaterThanOrEqual(3)
  })
})
