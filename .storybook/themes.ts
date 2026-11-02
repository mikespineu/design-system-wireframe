import type { Decorator } from '@storybook/react-vite'

/** Themes offered by the Storybook toolbar (docs/specs/Themes.md). Keys are labels, values are `data-theme` values. */
export const storybookThemes = {
  default: 'default',
  dark: 'dark',
  bold: 'bold',
  'bold-dark': 'bold-dark',
}

/**
 * Puts the selected theme on <html> while the story renders. `withThemeByDataAttribute` does the same in an
 * effect, which runs after the first paint (and after slow open Drawer or Dialog stories settle), so without
 * this the story would show in the default theme first. The toolbar choice is in `globals.theme` from the
 * first render, because Storybook restores it from the URL.
 */
type ThemeName = keyof typeof storybookThemes

export const isThemeName = (name: unknown): name is ThemeName => typeof name === 'string' && name in storybookThemes

/** The `theme:<name>` entry of a `globals` query value (`a:1;theme:dark`), if it names a known theme. */
export const themeFromGlobalsParam = (globals: string | null | undefined): ThemeName | undefined => {
  const name = (globals ?? '').split(';').find((pair) => pair.startsWith('theme:'))?.slice('theme:'.length)
  return isThemeName(name) ? name : undefined
}

/**
 * Stories with `parameters.docs.story.inline: false` (Dialog, Drawer, Popover, Select, InfoTip, Tooltip, Toast)
 * render in their own iframe inside the docs page, and that iframe loads without the toolbar's `globals` param,
 * so it would start on the default theme. This returns the theme of the docs page that embeds us: its live
 * `data-theme` first, its URL `globals` second. It is undefined outside an embedding docs page (the manager
 * is not one), so ordinary story and docs frames are not affected.
 */
export const inheritedTheme = (win: Window = window): ThemeName | undefined => {
  try {
    const parent = win.parent
    if (!parent || parent === win) return undefined
    const params = new URLSearchParams(parent.location.search)
    if (params.get('viewMode') !== 'docs') return undefined
    const live = parent.document.documentElement.getAttribute('data-theme')
    return (isThemeName(live) ? live : undefined) ?? themeFromGlobalsParam(params.get('globals'))
  } catch {
    // A cross-origin parent: nothing to inherit.
    return undefined
  }
}

export const withThemeAtRender: Decorator = (Story, context) => {
  const { themeOverride } = (context.parameters.themes ?? {}) as { themeOverride?: string }
  const selected = themeOverride || inheritedTheme() || (context.globals.theme as string | undefined) || 'default'
  const theme = storybookThemes[selected as keyof typeof storybookThemes] ?? storybookThemes.default
  document.documentElement.setAttribute('data-theme', theme)
  return Story()
}
