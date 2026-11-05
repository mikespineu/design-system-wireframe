import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

const root = join(__dirname, '..')
const dir = join(root, 'plugins', 'wireframe-ds', 'skills', 'component-usage')
const skill = readFileSync(join(dir, 'SKILL.md'), 'utf8')
const exampleDir = join(dir, 'examples')
const examples = readdirSync(exampleDir).filter((f) => f.endsWith('.tsx'))

describe('component-usage skill', () => {
  it('has valid frontmatter', () => {
    const match = /^---\n([\s\S]*?)\n---\n/.exec(skill)
    expect(match).not.toBeNull()
    expect(match![1]).toMatch(/^name: component-usage$/m)
    expect(match![1]).toMatch(/^description: .{40,}$/m)
  })

  it('reads manifest.json instead of hardcoding a component list', () => {
    expect(skill).toContain('manifest.json')
    expect(skill).toMatch(/design-system-test\/manifest\.json/)
    // No table of component names: the manifest is the source of truth.
    const listed = ['Accordion', 'Breadcrumb', 'Checkbox', 'Drawer', 'Popover', 'RadioGroup', 'Slider', 'Tabs', 'Tooltip'].filter((n) =>
      new RegExp(`^\\s*[-|*]\\s*\`?${n}\`?\\b`, 'm').test(skill),
    )
    expect(listed).toEqual([])
  })

  it('covers the required topics', () => {
    for (const topic of [
      'npm install',
      "design-system-test/styles.css",
      'data-theme',
      '`Field`',
      '`useFieldControl`',
      '`IconProvider`',
      '`--ds-',
      'accessible name',
    ]) {
      expect(skill).toContain(topic)
    }
  })

  it('links the three worked examples', () => {
    expect(examples.sort()).toEqual(['DialogFlow.tsx', 'SignupForm.tsx', 'ToastExample.tsx'])
    for (const f of examples) expect(skill).toContain(`examples/${f}`)
  })

  it('worked examples typecheck against the public API', () => {
    const configPath = join(root, 'tsconfig.json')
    const cfg = ts.readConfigFile(configPath, ts.sys.readFile)
    const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, root)
    const files = examples.map((f) => join(exampleDir, f))
    const program = ts.createProgram(files, { ...parsed.options, noEmit: true })
    const diagnostics = files.flatMap((f) => [
      ...program.getSyntacticDiagnostics(program.getSourceFile(f)!),
      ...program.getSemanticDiagnostics(program.getSourceFile(f)!),
    ])
    const messages = diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
    expect(messages).toEqual([])
    for (const f of files) expect(readFileSync(f, 'utf8')).toMatch(/from 'design-system-test'/)
  })
})
