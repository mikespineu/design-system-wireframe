// Generates dist/manifest.json: components exported from src/index.ts (props from the TS types,
// spec path, Radix primitives) and every --ds-* custom property from tokens.css.
// Run by `npm run build` (node scripts/generate-manifest.cjs); consumed by the Claude plugin (docs/specs/ClaudePlugin.md).
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const ROOT = path.join(__dirname, '..')

/** Every `--ds-*` declaration: default value from :root, optional dark override. */
function parseTokens(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const blocks = [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  const tokens = new Map()
  for (const [, selector, body] of blocks) {
    const sel = selector.trim()
    const isDefault = sel.includes(':root')
    const isDark = sel.includes('[data-theme="dark"]')
    if (!isDefault && !isDark) continue
    for (const m of body.matchAll(/(--ds-[\w-]+)\s*:\s*([^;]+);/g)) {
      const [, name, value] = m
      const entry = tokens.get(name) ?? { name }
      if (isDefault) entry.default = value.trim()
      else entry.dark = value.trim()
      tokens.set(name, entry)
    }
  }
  return [...tokens.values()].filter((t) => t.default !== undefined)
}

/** Radix primitives imported from 'radix-ui' by the sources in a component folder. */
function radixPrimitives(dir) {
  const found = new Set()
  if (!fs.existsSync(dir)) return []
  for (const file of fs.readdirSync(dir)) {
    if (!/\.tsx?$/.test(file) || /\.(test|stories)\./.test(file)) continue
    const src = fs.readFileSync(path.join(dir, file), 'utf8')
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]radix-ui['"]/g)) {
      for (const part of m[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/)[0]
        if (name) found.add(name)
      }
    }
  }
  return [...found].sort()
}

/** Spec file for a component: docs/specs/<Name>.md, else the spec that mentions `Name` in backticks most often. */
// Components whose spec the mention heuristic gets wrong (null: no spec yet).
const SPEC_OVERRIDES = { SegmentedControl: 'Toggle', TileGroup: 'Toggle', Alert: null, Badge: null, Tag: null }

function findSpec(name, root = ROOT) {
  const dir = path.join(root, 'docs', 'specs')
  if (!fs.existsSync(dir)) return null
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()
  if (name in SPEC_OVERRIDES) {
    const o = SPEC_OVERRIDES[name]
    return o && files.includes(`${o}.md`) ? `docs/specs/${o}.md` : null
  }
  if (files.includes(`${name}.md`)) return `docs/specs/${name}.md`
  const re = new RegExp('`' + name + '[`<. ]', 'g')
  let hit
  let best = 0
  for (const f of files) {
    if (f === 'Introduction.md') continue
    const n = (fs.readFileSync(path.join(dir, f), 'utf8').match(re) ?? []).length
    if (n > best) {
      best = n
      hit = f
    }
  }
  return hit ? `docs/specs/${hit}` : null
}

function isComponentName(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name)
}

/** Components are PascalCase value exports that are callable and take a props object. */
function collectComponents(entry, root = ROOT) {
  const configPath = path.join(root, 'tsconfig.json')
  const cfg = ts.readConfigFile(configPath, ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, root)
  const program = ts.createProgram([entry], { ...parsed.options, noEmit: true })
  const checker = program.getTypeChecker()
  const source = program.getSourceFile(entry)
  if (!source) throw new Error(`Cannot read ${entry}`)
  const moduleSymbol = checker.getSymbolAtLocation(source)
  const exportsList = moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : []
  const components = []

  for (const sym of exportsList) {
    const name = sym.getName()
    if (!isComponentName(name)) continue
    const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym
    if (!(target.flags & ts.SymbolFlags.Value)) continue
    const decl = target.valueDeclaration ?? target.declarations?.[0]
    if (!decl) continue
    const type = checker.getTypeOfSymbolAtLocation(target, decl)
    const sig = type.getCallSignatures()[0]
    if (!sig) continue
    const returnsJsx = /ReactNode|ReactElement|Element/.test(checker.typeToString(checker.getReturnTypeOfSignature(sig)))
    if (!returnsJsx) continue

    const param = sig.getParameters()[0]
    const props = []
    if (param) {
      const paramType = checker.getTypeOfSymbolAtLocation(param, param.valueDeclaration ?? decl)
      for (const prop of checker.getPropertiesOfType(paramType)) {
        const pdecl = prop.valueDeclaration ?? prop.declarations?.[0]
        if (!pdecl || pdecl.getSourceFile().fileName.includes('node_modules')) continue
        const ptype = checker.getTypeOfSymbolAtLocation(prop, pdecl)
        props.push({
          name: prop.getName(),
          type: checker.typeToString(ptype, undefined, ts.TypeFormatFlags.NoTruncation),
          required: !(prop.flags & ts.SymbolFlags.Optional),
          description: ts.displayPartsToString(prop.getDocumentationComment(checker)).trim(),
        })
      }
    }
    props.sort((a, b) => a.name.localeCompare(b.name))
    const file = decl.getSourceFile().fileName
    const rel = path.relative(root, file)
    const m = /^src\/components\/([^/]+)\//.exec(rel.split(path.sep).join('/'))
    const folder = m ? m[1] : null
    components.push({
      name,
      source: rel.split(path.sep).join('/'),
      spec: findSpec(folder ?? name, root) ?? findSpec(name, root),
      radix: folder ? radixPrimitives(path.join(root, 'src', 'components', folder)) : [],
      props,
    })
  }
  return components.sort((a, b) => a.name.localeCompare(b.name))
}

function buildManifest(root = ROOT) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  const css = fs.readFileSync(path.join(root, 'src', 'styles', 'tokens.css'), 'utf8')
  return {
    name: pkg.name,
    version: pkg.version,
    components: collectComponents(path.join(root, 'src', 'index.ts'), root),
    tokens: parseTokens(css),
  }
}

function writeManifest(root = ROOT, out = path.join(root, 'dist', 'manifest.json')) {
  const manifest = buildManifest(root)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n')
  return manifest
}

module.exports = { parseTokens, radixPrimitives, findSpec, collectComponents, buildManifest, writeManifest }

if (require.main === module) {
  const m = writeManifest()
  console.log(`manifest.json: ${m.components.length} components, ${m.tokens.length} tokens`)
}
