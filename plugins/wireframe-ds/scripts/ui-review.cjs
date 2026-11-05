#!/usr/bin/env node
// Deterministic rule checker behind the `ui-review` agent (DS-54, docs/specs/ClaudePlugin.md).
// Plain Node, zero dependencies. Components, props, Radix primitives and tokens all come from the
// design system's manifest.json, never from a hardcoded list.
//
//   node ui-review.cjs [--manifest <path>] [--json] <file-or-dir>...
//
// Prints `file:line  rule  message  Fix: ...` per finding. Exit code 1 when there are findings.
const fs = require('node:fs')
const path = require('node:path')

const SOURCE_EXT = /\.(tsx|jsx|ts|js|mjs|cjs|css|scss|html|vue|svelte)$/
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.git', 'storybook-static', 'coverage', '.next'])
// @mikespineu/design-system is the planned published name; until the rename (RELEASING.md) the package is design-system-test.
const MANIFEST_SPECIFIERS = ['@mikespineu/design-system/manifest.json', 'design-system-test/manifest.json']

/** Native element patterns (and ARIA roles) that a Radix-backed component replaces, keyed by Radix primitive. */
const PRIMITIVE_PATTERNS = {
  Dialog: [/<dialog\b/, /role=["'](?:alert)?dialog["']/],
  Checkbox: [/type=["']checkbox["']/, /role=["']checkbox["']/],
  RadioGroup: [/type=["']radio["']/, /role=["']radiogroup["']/],
  Switch: [/role=["']switch["']/],
  Select: [/<select\b/, /role=["'](?:listbox|combobox)["']/],
  Tabs: [/role=["']tablist["']/],
  Slider: [/type=["']range["']/, /role=["']slider["']/],
  Tooltip: [/role=["']tooltip["']/],
  Toast: [/role=["']log["']/],
}

/** Native elements replaced by a DS component of the same name, when the manifest ships it. */
const NATIVE_ELEMENTS = [
  { component: 'Button', pattern: /<button\b/ },
  { component: 'Textarea', pattern: /<textarea\b/ },
  { component: 'Input', pattern: /<input\b(?![^>]*type=["'](?:checkbox|radio|range|hidden|file|submit|button)["'])/ },
]

const NAMED_COLORS = 'white|black|red|green|blue|gray|grey|orange|yellow|purple|pink|teal|navy|silver'
const SPACING_PROP = '(?:padding|margin|gap|row-?gap|column-?gap|inset|top|right|bottom|left)(?:-?(?:top|right|bottom|left|block|inline|x|y))?'

// ---------------------------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------------------------

function loadManifest(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

/** Manifest of the design system installed in the consumer project, else the plugin's snapshot. */
function resolveManifest(cwd = process.cwd()) {
  for (const spec of MANIFEST_SPECIFIERS) {
    try {
      return loadManifest(require.resolve(spec, { paths: [cwd] }))
    } catch {
      // not installed under this name
    }
  }
  const snapshot = path.join(__dirname, '..', 'mcp', 'manifest.json')
  if (fs.existsSync(snapshot)) return loadManifest(snapshot)
  throw new Error(
    `No design-system manifest found. Install the design system in this project (tried ${MANIFEST_SPECIFIERS.join(', ')}) or pass --manifest <path to manifest.json>.`,
  )
}

const toPx = (value) => {
  const m = /^(-?\d*\.?\d+)(px|rem)$/.exec(String(value).trim())
  return m ? Math.round(parseFloat(m[1]) * (m[2] === 'rem' ? 16 : 1) * 100) / 100 : null
}

const normHex = (hex) => {
  let h = hex.toLowerCase().replace('#', '')
  if (h.length <= 4) h = [...h].map((c) => c + c).join('')
  return h.length === 8 && h.endsWith('ff') ? h.slice(0, 6) : h
}

/** Everything the rules need, derived once from the manifest. */
function buildContext(manifest) {
  const byName = new Map(manifest.components.map((c) => [c.name, c]))
  const tokens = new Map(manifest.tokens.map((t) => [t.name, t]))
  const resolve = (value, depth = 0) => {
    const m = /^var\((--ds-[\w-]+)\)$/.exec(String(value).trim())
    if (!m || depth > 8) return value
    const t = tokens.get(m[1])
    return t ? resolve(t.default, depth + 1) : value
  }
  const isRaw = (name) => /^--ds-color-(?:gray|white|black)/.test(name)
  const colorTokens = manifest.tokens.filter((t) => t.name.startsWith('--ds-color-'))
  const colorByHex = new Map()
  for (const t of [...colorTokens].sort((a, b) => Number(isRaw(a.name)) - Number(isRaw(b.name)))) {
    const v = resolve(t.default)
    if (/^#[0-9a-f]{3,8}$/i.test(v) && !colorByHex.has(normHex(v))) colorByHex.set(normHex(v), t.name)
  }
  const spaceByPx = new Map()
  for (const t of manifest.tokens.filter((x) => x.name.startsWith('--ds-space-'))) {
    const px = toPx(resolve(t.default))
    if (px !== null && !spaceByPx.has(px)) spaceByPx.set(px, t.name)
  }
  // Which component wraps a Radix primitive: the one named like it, or the only one using it.
  // Shared utilities (Slot, Label, AccessibleIcon...) have no clear owner and return null.
  const wrapperFor = (primitive) => {
    const owners = manifest.components.filter((c) => c.radix.includes(primitive)).map((c) => c.name)
    if (owners.includes(primitive)) return primitive
    return owners.length === 1 ? owners[0] : null
  }
  return {
    manifest,
    byName,
    colorByHex,
    colorRoles: colorTokens.filter((t) => !isRaw(t.name)).map((t) => t.name),
    spaceByPx,
    spaceTokens: manifest.tokens.filter((t) => t.name.startsWith('--ds-space-')).map((t) => t.name),
    wrapperFor,
    fieldName: byName.has('Field') ? 'Field' : null,
    // Components that carry their own label and wrap Field: TextField, SelectField, ...
    fieldWrappers: manifest.components.map((c) => c.name).filter((n) => n.endsWith('Field') && n !== 'Field'),
    // Bare controls: take Field wiring (`invalid`) but have no `label` prop: Input, Textarea.
    bareControls: manifest.components
      .filter((c) => c.props.some((p) => p.name === 'invalid') && !c.props.some((p) => p.name === 'label'))
      .map((c) => c.name),
  }
}

// ---------------------------------------------------------------------------------------------
// JSX scanning
// ---------------------------------------------------------------------------------------------

function lineIndex(src) {
  const starts = [0]
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') starts.push(i + 1)
  return (offset) => {
    let lo = 0
    let hi = starts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid] <= offset) lo = mid
      else hi = mid - 1
    }
    return { line: lo + 1, column: offset - starts[lo] + 1 }
  }
}

/** Attribute names written directly on a tag (top level only), plus whether it spreads props. */
function parseAttrs(text) {
  const names = new Set()
  let spread = false
  let depth = 0
  let quote = null
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      if (ch === quote) quote = null
    } else if (depth > 0) {
      if (ch === '"' || ch === "'" || ch === '`') quote = ch
      else if (ch === '{') depth++
      else if (ch === '}') depth--
    } else if (ch === '"' || ch === "'") quote = ch
    else if (ch === '{') {
      depth++
      if (/^\{\s*\.\.\./.test(text.slice(i))) spread = true
    } else if (/[A-Za-z_]/.test(ch) && (i === 0 || /\s/.test(text[i - 1]))) {
      const m = /^[A-Za-z_][\w:-]*/.exec(text.slice(i))
      names.add(m[0])
      i += m[0].length - 1
    }
  }
  return { names, spread }
}

/** Every JSX-looking opening tag: `<Name attrs>` or `<Name attrs />`, across lines. */
function findTags(src) {
  const tags = []
  const re = /<([A-Za-z][\w.]*)/g
  let m
  while ((m = re.exec(src))) {
    if (m.index > 0 && /[\w$)\]]/.test(src[m.index - 1])) continue // generics and comparisons
    let i = m.index + m[0].length
    let depth = 0
    let quote = null
    let end = -1
    for (; i < src.length; i++) {
      const ch = src[i]
      if (quote) {
        if (ch === quote) quote = null
      } else if (ch === '"' || ch === "'" || (depth > 0 && ch === '`')) quote = ch
      else if (ch === '{') depth++
      else if (ch === '}') depth--
      else if (ch === '>' && depth === 0 && src[i - 1] !== '=') {
        end = i
        break
      } else if (ch === '<' && depth === 0) break // not a tag
    }
    if (end < 0) continue
    const body = src.slice(m.index + m[0].length, end)
    const selfClosing = body.trimEnd().endsWith('/')
    tags.push({ name: m[1], start: m.index, end, selfClosing, ...parseAttrs(body) })
  }
  return tags
}

/** [start, end] source ranges of every `<name>...</name>` element, nesting aware. */
function elementRanges(src, tags, name) {
  const events = tags
    .filter((t) => t.name === name && !t.selfClosing)
    .map((t) => ({ at: t.start, open: true, tagEnd: t.end }))
  for (const m of src.matchAll(new RegExp(`</${name}\\s*>`, 'g'))) events.push({ at: m.index, open: false })
  events.sort((a, b) => a.at - b.at)
  const ranges = []
  const stack = []
  for (const e of events) {
    if (e.open) stack.push(e)
    else if (stack.length) ranges.push({ start: stack.pop().tagEnd, end: e.at })
  }
  return ranges
}

// ---------------------------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------------------------

const RULES = {
  'hardcoded-color': 'A literal color instead of a --ds-color-* token.',
  'hardcoded-spacing': 'A literal padding, margin or gap instead of a --ds-space-* token.',
  'hand-rolled-primitive': 'A native element or ARIA role the design system already ships as a component.',
  'direct-radix-import': 'A Radix primitive imported directly while the design system ships a wrapper.',
  'missing-label': 'A control or icon-only button with no accessible name.',
  'missing-required-prop': 'A design-system component used without a prop its type requires.',
  'field-wiring': 'A control inside Field that repeats or overrides the wiring Field already provides.',
}

const isComment = (line) => /^\s*(?:\/\/|\/\*|\*)/.test(line)

function review(file, src, ctx) {
  const findings = []
  const at = lineIndex(src)
  const lines = src.split('\n')
  const addLine = (rule, lineNo, column, message, fix) =>
    findings.push({ file, line: lineNo, column, rule, message, fix })
  const isMarkup = /\.(tsx|jsx|html|vue|svelte)$/.test(file) || /\.(ts|js|mjs|cjs)$/.test(file)

  // --- line based: colors, spacing, native primitives, Radix imports
  lines.forEach((line, idx) => {
    if (isComment(line)) return
    const no = idx + 1
    const code = line.replace(/var\(--ds-[\w-]+\s*,[^)]*\)/g, 'var(--ds)') // fallbacks inside token refs are tolerated

    // Hex only counts in a color context: a CSS value, a color-ish style prop/attribute or a Tailwind arbitrary value.
    // Anchors (href="#2026") and text ("Issue #123") are not colors.
    const colorContext = /(?:colou?r|background|fill|stroke|border|outline|shadow|gradient|--[\w-]+|\w+-\[)\s*[:=]?\s*[^;]*$|\b(?:color|bg|text|border|fill|stroke)-\[$/i
    for (const m of code.matchAll(/(?<![\w&#/-])#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g)) {
      const before = code.slice(0, m.index)
      if (/url\(\s*$/.test(before) || /(?:href|to|src)\s*=\s*["'{]*$/.test(before)) continue
      if (!(/\.(?:css|scss)$/.test(file) ? /:\s*[^;]*$/.test(before) : colorContext.test(before))) continue
      const token = ctx.colorByHex.get(normHex(m[0]))
      addLine(
        'hardcoded-color',
        no,
        m.index + 1,
        `Hardcoded color ${m[0]}.`,
        token
          ? `Use var(${token}).`
          : `Use a role token: ${ctx.colorRoles.slice(0, 6).map((t) => `var(${t})`).join(', ')} (all ${ctx.colorRoles.length} in the manifest).`,
      )
    }
    for (const m of code.matchAll(/\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(\s*[\d.]/g)) {
      addLine('hardcoded-color', no, m.index + 1, `Hardcoded color ${m[0]}...).`, `Use a var(--ds-color-*) role token, e.g. var(${ctx.colorRoles[0]}).`)
    }
    for (const m of code.matchAll(new RegExp(`\\b(?:color|background(?:-?[cC]olor)?|border(?:-?[cC]olor)?|fill|stroke)\\s*:\\s*['"]?(${NAMED_COLORS})\\b`, 'g'))) {
      addLine('hardcoded-color', no, m.index + 1, `Hardcoded color name "${m[1]}".`, `Use a var(--ds-color-*) role token, e.g. var(${ctx.colorRoles[0]}).`)
    }

    const spacing = new RegExp(`(?<![\\w-])${SPACING_PROP.replace(/-\?/g, '-?')}\\s*:\\s*([^;}]*)`, 'gi')
    for (const m of code.matchAll(spacing)) {
      const value = m[1]
      if (/var\(/.test(value) && !/\d+(?:\.\d+)?(?:px|rem|em)\b/.test(value.replace(/var\([^)]*\)/g, ''))) continue
      const literal = /(?<![\w.-])(\d*\.?\d+)(px|rem|em)\b/g
      const bare = /^\s*['"]?(\d+)['"]?\s*,?\s*$/.exec(value) // style={{ padding: 12 }}
      const hits = [...value.matchAll(literal)].filter((l) => parseFloat(l[1]) !== 0)
      if (!hits.length && !(bare && Number(bare[1]) !== 0)) continue
      const px = hits.length ? toPx(hits[0][0]) : Number(bare[1])
      const token = ctx.spaceByPx.get(px)
      addLine(
        'hardcoded-spacing',
        no,
        m.index + 1,
        `Hardcoded spacing "${m[0].trim()}".`,
        token ? `Use var(${token}) (${px}px).` : `Use a spacing token: ${ctx.spaceTokens.map((t) => `var(${t})`).join(', ')}.`,
      )
    }

    if (!isMarkup) return
    for (const [primitive, patterns] of Object.entries(PRIMITIVE_PATTERNS)) {
      const wrapper = ctx.wrapperFor(primitive)
      if (!wrapper) continue
      for (const p of patterns) {
        const m = p.exec(line)
        if (m) addLine('hand-rolled-primitive', no, m.index + 1, `Hand-rolled ${primitive.toLowerCase()} (${m[0]}).`, `Use <${wrapper}> from the design system; it owns focus, keyboard and ARIA.`)
      }
    }
    for (const { component, pattern } of NATIVE_ELEMENTS) {
      const m = ctx.byName.has(component) ? pattern.exec(line) : null
      if (m) addLine('hand-rolled-primitive', no, m.index + 1, `Native ${m[0]}> used where the design system ships ${component}.`, `Use <${component}> from the design system.`)
    }
    const imp = /import\s*(?:\{([^}]*)\}|\*\s+as\s+(\w+))\s*from\s*['"](radix-ui|@radix-ui\/[\w-]+)['"]/.exec(line)
    if (imp) {
      const names = (imp[1] ?? '').split(',').map((n) => n.trim().split(/\s+as\s+/)[0]).filter(Boolean)
      const wrappers = [...new Set(names.map((n) => ctx.wrapperFor(n)).filter(Boolean))]
      addLine(
        'direct-radix-import',
        no,
        imp.index + 1,
        `Direct import from '${imp[3]}'.`,
        wrappers.length
          ? `Use ${wrappers.join(', ')} from the design system instead.`
          : 'Check whether the design system ships a component for this primitive and use it; keep the import only if none does.',
      )
    }
  })

  // --- JSX based: required props, labels, Field wiring
  const tags = findTags(src)
  const fields = ctx.fieldName ? elementRanges(src, tags, ctx.fieldName) : []
  const inField = (t) => fields.some((r) => t.start > r.start && t.start < r.end)
  const where = (t) => at(t.start)
  const report = (rule, t, message, fix) => {
    const pos = where(t)
    findings.push({ file, line: pos.line, column: pos.column, rule, message, fix })
  }

  for (const t of tags) {
    const comp = ctx.byName.get(t.name)
    if (comp && !t.spread) {
      for (const prop of comp.props) {
        if (!prop.required || prop.name === 'children' || t.names.has(prop.name)) continue
        if (prop.name === 'label' || prop.name === 'aria-label') {
          report('missing-label', t, `<${t.name}> has no \`${prop.name}\`.`, `Add ${prop.name}="..." so the control has an accessible name.`)
        } else {
          report('missing-required-prop', t, `<${t.name}> is missing required prop \`${prop.name}\` (${prop.type}).`, `Pass \`${prop.name}\`.`)
        }
      }
    }
    if (comp && ctx.bareControls.includes(t.name) && !t.spread && !inField(t) && !t.names.has('aria-label') && !t.names.has('aria-labelledby')) {
      report('missing-label', t, `<${t.name}> is outside a ${ctx.fieldName ?? 'Field'} and has no aria-label.`, `Wrap it in <${ctx.fieldName ?? 'Field'} label="...">, or use ${ctx.fieldWrappers.find((n) => n.startsWith(t.name)) ?? 'a labelled field component'}, or add aria-label.`)
    }
    if (!comp && /^(input|textarea|select)$/.test(t.name) && !t.spread && !t.names.has('aria-label') && !t.names.has('aria-labelledby') && !t.names.has('id')) {
      const type = /^input$/.test(t.name) ? /type=["'](hidden|submit|button)["']/.exec(src.slice(t.start, t.end)) : null
      if (!type) report('missing-label', t, `<${t.name}> has no label association (no id, aria-label or aria-labelledby).`, `Use the design-system field component (Field + control) so the label is wired.`)
    }
    if (inField(t) && t.name !== ctx.fieldName) {
      const isControl = ctx.bareControls.includes(t.name) || /^(input|textarea|select)$/.test(t.name)
      if (isControl) {
        for (const attr of ['invalid', 'aria-invalid', 'aria-describedby', 'aria-required', 'id']) {
          if (t.names.has(attr)) report('field-wiring', t, `<${t.name}> inside ${ctx.fieldName} sets \`${attr}\`, which ${ctx.fieldName} already wires.`, attr === 'id' ? `Remove it and pass \`id\` to <${ctx.fieldName}> if you need a fixed id; the label's htmlFor follows the Field id.` : `Remove \`${attr}\`; use <${ctx.fieldName} error="..." hint="..." required> instead.`)
        }
      }
      if (ctx.fieldWrappers.includes(t.name)) report('field-wiring', t, `<${t.name}> is nested inside <${ctx.fieldName}>; it already renders its own ${ctx.fieldName}, so the label is duplicated.`, `Use <${t.name}> on its own, or <${ctx.fieldName}> with a bare control.`)
      if (t.name === 'label' || t.name === 'Label') report('field-wiring', t, `Extra <${t.name}> inside <${ctx.fieldName}>; Field renders the label.`, `Pass the text as <${ctx.fieldName} label="...">.`)
    }
  }
  findings.sort((a, b) => a.line - b.line || a.column - b.column)
  return findings
}

// ---------------------------------------------------------------------------------------------
// Running
// ---------------------------------------------------------------------------------------------

function collectFiles(target, out = []) {
  const stat = fs.statSync(target)
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target).sort()) {
      if (!SKIP_DIRS.has(entry)) collectFiles(path.join(target, entry), out)
    }
  } else if (SOURCE_EXT.test(target) || /\.(tsx|jsx|ts|js|mjs|cjs|css|scss|html|vue|svelte)\.fixture$/.test(target)) out.push(target)
  return out
}

/** Review files or directories. A `.fixture` suffix is ignored when picking the language. */
function reviewPaths(targets, manifest) {
  const ctx = buildContext(manifest)
  const findings = []
  for (const target of targets) {
    for (const file of collectFiles(target)) {
      findings.push(...review(file.replace(/\.fixture$/, ''), fs.readFileSync(file, 'utf8'), ctx).map((f) => ({ ...f, file })))
    }
  }
  return findings
}

const formatFinding = (f) => `${f.file}:${f.line}  ${f.rule}  ${f.message}  Fix: ${f.fix}`

function main(argv) {
  const args = argv.slice()
  const flag = (name) => {
    const i = args.indexOf(name)
    if (i < 0) return null
    const v = name === '--json' ? true : args[i + 1]
    args.splice(i, name === '--json' ? 1 : 2)
    return v
  }
  const manifestPath = flag('--manifest')
  const json = flag('--json')
  if (!args.length) {
    console.error('usage: ui-review.cjs [--manifest <path>] [--json] <file-or-dir>...')
    return 2
  }
  let manifest
  try {
    manifest = manifestPath ? loadManifest(manifestPath) : resolveManifest()
  } catch (e) {
    console.error(e.message)
    return 2
  }
  const missing = args.filter((a) => !fs.existsSync(a))
  if (missing.length) {
    console.error(`Path not found: ${missing.join(', ')}`)
    return 2
  }
  const findings = reviewPaths(args, manifest)
  if (json) console.log(JSON.stringify(findings, null, 2))
  else if (findings.length) console.log(findings.map(formatFinding).join('\n'))
  else console.log('No design-system findings.')
  return findings.length ? 1 : 0
}

module.exports = { RULES, buildContext, review, reviewPaths, resolveManifest, formatFinding, findTags, main }

if (require.main === module) process.exitCode = main(process.argv.slice(2))
