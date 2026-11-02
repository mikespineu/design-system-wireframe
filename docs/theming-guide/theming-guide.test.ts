import { existsSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkContrast, createTheme, themeRoles } from 'design-system-test'
import { boldConfig as shippedConfig, boldDarkConfig as shippedDarkConfig, bold as shippedBold, boldCss } from '../../src/themes/bold'
import { applyTheme, followSystem, themeName } from './samples/apply-theme'
import { boldConfig, boldDarkConfig } from './samples/bold.config'
import { boldColors } from './samples/bold.colors'
import { boldDarkColors } from './samples/bold.dark-colors'
import { boldShape } from './samples/bold.shape'
import { buildTheme, writeCss } from './samples/build-theme'
import { broken, report } from './samples/check-contrast'
import { acme, selectors } from './samples/minimal'
import { bold, boldDark } from './samples/themes'
import { writeBold } from './samples/write-bold'

const docs = join(__dirname, '..')
const themesDir = join(docs, '..', 'src', 'themes')
const samplesDir = join(__dirname, 'samples')
const guide = readFileSync(join(docs, 'theming-guide.md'), 'utf8')
const shipped = readFileSync(join(themesDir, 'bold.css'), 'utf8')
const spec = readFileSync(join(docs, 'specs', 'Themes.md'), 'utf8')

const fenceRe = /<!-- (sample|excerpt): ([\w.-]+) -->\n```(\w+)\n([\s\S]*?)\n```/g
const marked = [...guide.matchAll(fenceRe)].map((m) => ({ kind: m[1]!, file: m[2]!, lang: m[3]!, body: m[4]! }))

describe('the guide', () => {
  it('covers every step and the topics the task lists', () => {
    for (const heading of [
      'Step 1: choose your values',
      'Step 2: write the `createTheme()` input',
      'Step 3: generate the `[data-theme]` block',
      'Step 4: add an override block',
      'Step 5: check contrast with `checkContrast()`',
      'Step 6: ship light and dark',
      'Step 7: load the fonts',
      'Step 8: turn it on with `data-theme`',
    ]) {
      expect(guide).toContain(`## ${heading}`)
    }
    for (const word of ['brand', 'neutral', 'fonts', 'radius', 'shadow', 'mode', 'createTheme(', 'checkContrast(', 'data-theme']) {
      expect(guide).toContain(word)
    }
  })

  it('has a table of contents whose anchors all exist', () => {
    const slug = (h: string) => h.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-')
    const anchors = new Set([...guide.matchAll(/^## (.+)$/gm)].map((m) => slug(m[1]!)))
    const links = [...guide.matchAll(/\]\(#([\w-]+)\)/g)].map((m) => m[1]!)
    expect(links.length).toBeGreaterThan(5)
    for (const link of links) expect(anchors).toContain(link)
  })

  it('has no TypeScript code block that is not tied to a sample file', () => {
    const tsFences = [...guide.matchAll(/^```(ts|tsx|typescript)$/gm)]
    expect(tsFences).toHaveLength(marked.filter((m) => m.kind === 'sample').length)
  })

  it.each(readdirSync(samplesDir))('reproduces samples/%s verbatim', (file) => {
    const source = readFileSync(join(samplesDir, file), 'utf8').replace(/\n$/, '')
    const blocks = marked.filter((m) => m.kind === 'sample' && m.file === file)
    expect(blocks.length).toBeGreaterThan(0)
    for (const block of blocks) expect(block.body).toBe(source)
  })

  it('names only sample files that exist', () => {
    const files = new Set(readdirSync(samplesDir))
    for (const m of marked.filter((x) => x.kind === 'sample')) expect(files).toContain(m.file)
  })

  it.each(['bold.css', 'bold-fonts.css'])('shows excerpts of %s that the shipped file contains', (file) => {
    const source = readFileSync(join(themesDir, file), 'utf8')
    const excerpts = marked.filter((m) => m.kind === 'excerpt' && m.file === file)
    expect(excerpts.length).toBeGreaterThan(0)
    for (const excerpt of excerpts) {
      for (const line of excerpt.body.split('\n')) expect(source).toContain(line)
    }
  })

  it('links only files that exist', () => {
    const links = [...guide.matchAll(/\]\(((?!#|https?:)[^)#]+)(?:#[^)]*)?\)/g)].map((m) => m[1]!)
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) expect(existsSync(join(docs, link))).toBe(true)
  })
})

describe('the samples run', () => {
  it('minimal: createTheme() with mode "both" emits a light and a dark selector', () => {
    expect(selectors).toEqual(['acme', 'acme-dark'])
    expect(acme.css).toContain('[data-theme="acme-dark"]')
    expect(acme.blocks[1]!.values['--ds-font-heading']).toBeUndefined()
  })

  it('every override role is a real role', () => {
    for (const overrides of [boldColors, boldDarkColors, boldShape]) {
      for (const role of Object.keys(overrides)) expect(themeRoles).toContain(role)
    }
    expect(Object.keys(boldColors)).toHaveLength(24)
    expect(Object.keys(boldDarkColors)).toHaveLength(24)
  })

  it('the override block comes after the generated block and wins by source order', () => {
    const first = bold.css.indexOf('[data-theme="bold"]')
    const second = bold.css.indexOf('[data-theme="bold"]', first + 1)
    expect(second).toBeGreaterThan(first)
    expect(bold.blocks[0]!.values['--ds-color-background']).toBe('#f4f1ff')
    expect(createTheme(boldConfig).blocks[0]!.values['--ds-color-background']).not.toBe('#f4f1ff')
    expect(Object.keys(bold.blocks[0]!.values)).toHaveLength(themeRoles.length)
  })

  it('checkContrast: the worked example passes and a weak muted text color fails with role names', () => {
    expect(report.ok).toBe(true)
    expect(report.failures).toEqual([])
    expect(report.checked).toBeGreaterThan(0)
    expect(broken.ok).toBe(false)
    expect(broken.failures).toHaveLength(7)
    expect(broken.failures[0]).toEqual({
      foreground: 'color-text-muted',
      background: 'color-background',
      kind: 'text',
      ratio: 2.57,
      required: 4.5,
      mode: 'light',
      selector: 'bold',
    })
    expect(checkContrast({ blocks: bold.blocks }).ok).toBe(true)
  })

  it('writeBold writes both themes to one file', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'ds-theming-guide-')), 'bold.css')
    writeBold(path)
    expect(readFileSync(path, 'utf8')).toBe(`${bold.css}\n${boldDark.css}`)
    writeCss(path, [bold])
    expect(readFileSync(path, 'utf8')).toBe(bold.css)
  })

  it('buildTheme with no overrides returns the generated block', () => {
    const built = buildTheme(boldConfig, {})
    expect(built.blocks[0]!.values).toEqual(createTheme(boldConfig).blocks[0]!.values)
  })

  it('createTheme() rejects a bad value with a message that names it', () => {
    expect(() => createTheme({ ...boldConfig, name: 'Bold!' })).toThrow('Invalid theme name')
  })

  describe('apply-theme', () => {
    afterEach(() => document.documentElement.removeAttribute('data-theme'))

    it('applyTheme sets data-theme on <html> for each mode', () => {
      applyTheme('light')
      expect(document.documentElement).toHaveAttribute('data-theme', 'bold')
      applyTheme('dark')
      expect(document.documentElement).toHaveAttribute('data-theme', 'bold-dark')
      expect(themeName('light')).toBe('bold')
    })

    it('applyTheme can target a subtree', () => {
      const card = document.createElement('div')
      applyTheme('dark', card)
      expect(card.dataset.theme).toBe('bold-dark')
    })

    it('followSystem follows the media query and stops on request', () => {
      const target = new EventTarget()
      const query = Object.assign(target, { matches: false })
      const stop = followSystem(query as unknown as MediaQueryList)
      expect(document.documentElement).toHaveAttribute('data-theme', 'bold')
      query.matches = true
      target.dispatchEvent(new Event('change'))
      expect(document.documentElement).toHaveAttribute('data-theme', 'bold-dark')
      stop()
      query.matches = false
      target.dispatchEvent(new Event('change'))
      expect(document.documentElement).toHaveAttribute('data-theme', 'bold-dark')
    })

    it('main.ts imports the CSS and starts following the system setting', async () => {
      const listeners: string[] = []
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: (media: string) => ({
          media,
          matches: true,
          addEventListener: (type: string) => listeners.push(type),
          removeEventListener: () => {},
        }),
      })
      const { stopFollowing } = await import('./samples/main')
      expect(document.documentElement).toHaveAttribute('data-theme', 'bold-dark')
      expect(listeners).toEqual(['change'])
      expect(typeof stopFollowing).toBe('function')
    })
  })
})

describe('the worked example rebuilds bold from its spec input', () => {
  /** The `createTheme({...})` calls in the spec's "createTheme() input" section, evaluated to plain objects. */
  const specInputs = Object.fromEntries(
    [...spec.matchAll(/```ts\ncreateTheme\((\{[\s\S]*?\n\})\)\n```/g)].map((m) => {
      const config = new Function(`return ${m[1]}`)() as { name: string }
      return [config.name, config]
    }),
  )

  it('the samples use the spec input for bold and bold-dark', () => {
    expect(boldConfig).toEqual(specInputs['bold'])
    expect(boldDarkConfig).toEqual(specInputs['bold-dark'])
  })

  it('the samples match the config the package builds its theme from', () => {
    expect(boldConfig).toEqual(shippedConfig)
    expect(boldDarkConfig).toEqual(shippedDarkConfig)
  })

  it('the rebuilt CSS is the CSS the package ships (bold.css, after its header comment)', () => {
    const rebuilt = `${bold.css}\n${boldDark.css}`
    expect(shipped.endsWith(rebuilt)).toBe(true)
    expect(boldCss.endsWith(rebuilt)).toBe(true)
    expect(shipped.slice(0, shipped.length - rebuilt.length)).toMatch(/^\/\* Opt-in demo theme[\s\S]*\*\/\n\n$/)
  })

  it('the rebuilt merged values equal the ones the package checks', () => {
    expect(bold.blocks).toEqual(shippedBold.blocks)
  })

  it('bold-fonts.css loads every family the config names', () => {
    const fonts = readFileSync(join(themesDir, 'bold-fonts.css'), 'utf8').replace(/\+/g, ' ')
    for (const stack of Object.values(boldConfig.fonts)) {
      const family = /'([^']+)'/.exec(stack)![1]!
      expect(fonts).toContain(family)
    }
  })
})
