#!/usr/bin/env node
// Validates the consumer plugin manifests (DS-52, docs/specs/ClaudePlugin.md):
//   .claude-plugin/marketplace.json                    consumer marketplace, no `factory`
//   plugins/wireframe-ds/.claude-plugin/plugin.json    required fields, version synced to package.json
//   factory/.claude-plugin/marketplace.json            factory marketplace, only `factory`
const { existsSync, readFileSync } = require('node:fs')
const { join } = require('node:path')

const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/
const SEMVER_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/
const RESERVED = ['claude', 'anthropic', 'official', 'plugin', 'mcp', 'test']
const PLUGIN_DIR = 'plugins/wireframe-ds'

function readJson(root, rel, errors) {
  const file = join(root, rel)
  if (!existsSync(file)) {
    errors.push(`${rel}: file is missing`)
    return null
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    errors.push(`${rel}: invalid JSON (${e.message})`)
    return null
  }
}

const isText = (v) => typeof v === 'string' && v.trim().length > 0

function checkName(rel, name, errors) {
  if (!isText(name) || !NAME_RE.test(name)) errors.push(`${rel}: "name" must be a lowercase slug of up to 64 characters`)
  else if (RESERVED.includes(name)) errors.push(`${rel}: "name" must not be the reserved word "${name}"`)
}

function checkMarketplace(root, rel, { name, plugin, source }, errors) {
  const m = readJson(root, rel, errors)
  if (!m) return
  if (m.name !== name) errors.push(`${rel}: "name" must be "${name}"`)
  checkName(rel, m.name, errors)
  if (!m.owner || !isText(m.owner.name)) errors.push(`${rel}: "owner.name" is required`)
  if (!Array.isArray(m.plugins)) return errors.push(`${rel}: "plugins" must be an array`)
  const names = m.plugins.map((p) => p && p.name)
  if (names.length !== 1 || names[0] !== plugin) {
    errors.push(`${rel}: must list only "${plugin}" (found: ${names.join(', ') || 'none'})`)
  }
  for (const p of m.plugins) {
    if (!p || p.source !== source) errors.push(`${rel}: plugin source must be "${source}"`)
    else if (!existsSync(join(root, rel, '..', '..', source, '.claude-plugin', 'plugin.json'))) {
      errors.push(`${rel}: source "${source}" has no .claude-plugin/plugin.json`)
    }
    if (p && 'version' in p) errors.push(`${rel}: do not repeat "version" in the marketplace entry; plugin.json is the single place`)
  }
}

function validate(root) {
  const errors = []

  checkMarketplace(root, '.claude-plugin/marketplace.json', { name: 'wireframe-ds', plugin: 'wireframe-ds', source: './' + PLUGIN_DIR }, errors)
  checkMarketplace(root, 'factory/.claude-plugin/marketplace.json', { name: 'design-system-factory', plugin: 'factory', source: './plugin' }, errors)

  const rel = `${PLUGIN_DIR}/.claude-plugin/plugin.json`
  const plugin = readJson(root, rel, errors)
  if (plugin) {
    if (plugin.name !== 'wireframe-ds') errors.push(`${rel}: "name" must be "wireframe-ds"`)
    checkName(rel, plugin.name, errors)
    if (!isText(plugin.version) || !SEMVER_RE.test(plugin.version)) errors.push(`${rel}: "version" must be semver`)
    for (const key of ['description', 'homepage', 'license']) {
      if (!isText(plugin[key])) errors.push(`${rel}: "${key}" is required`)
    }
    if (!plugin.author || !isText(plugin.author.name)) errors.push(`${rel}: "author.name" is required`)
    if (!Array.isArray(plugin.keywords) || plugin.keywords.length === 0 || !plugin.keywords.every(isText)) {
      errors.push(`${rel}: "keywords" must be a non-empty array of strings`)
    }
    const pkg = readJson(root, 'package.json', errors)
    if (pkg && plugin.version !== pkg.version) {
      errors.push(`${rel}: "version" (${plugin.version}) must equal package.json version (${pkg.version})`)
    }
  }
  if (!existsSync(join(root, PLUGIN_DIR, 'LICENSE'))) errors.push(`${PLUGIN_DIR}/LICENSE is missing`)

  return errors
}

module.exports = { validate }

if (require.main === module) {
  const errors = validate(join(__dirname, '..'))
  if (errors.length) {
    console.error('Plugin manifest validation failed:\n' + errors.map((e) => '  - ' + e).join('\n'))
    process.exit(1)
  }
  console.log('Plugin manifests are valid.')
}
