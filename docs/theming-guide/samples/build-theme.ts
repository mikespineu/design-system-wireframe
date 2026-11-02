import { createTheme, themeRoles, type ThemeBlock, type ThemeConfig } from 'design-system-test'
import { writeFileSync } from 'node:fs'

export interface BuiltTheme {
  name: string
  /** The generated block followed by the override block (same selector, so it wins by source order). */
  css: string
  /** The generated blocks with the overrides applied: what the browser resolves. Feed this to checkContrast(). */
  blocks: ThemeBlock[]
}

export function buildTheme(config: ThemeConfig, overrides: Record<string, string>): BuiltTheme {
  const generated = createTheme(config)

  // Keep the override roles in contract order, so the file reads the same as the generated block.
  const roles = themeRoles.filter((role) => role in overrides)
  const lines = roles.map((role) => `  ${role}: ${overrides[role]};`)
  const overrideBlock = `[data-theme="${config.name}"] {\n${lines.join('\n')}\n}`

  // The merged values: for each role the override if there is one, else the generated value.
  const blocks = generated.blocks.map((block) => ({
    ...block,
    values: Object.fromEntries(themeRoles.map((role) => [role, overrides[role] ?? block.values[role] ?? ''])),
  }))

  return { name: config.name, css: `${generated.css}\n${overrideBlock}\n`, blocks }
}

/** Writes one stylesheet with every theme in it. Run it from a build script. */
export function writeCss(path: string, themes: BuiltTheme[]): void {
  writeFileSync(path, themes.map((theme) => theme.css).join('\n'))
}
