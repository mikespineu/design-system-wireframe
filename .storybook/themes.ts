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
export const withThemeAtRender: Decorator = (Story, context) => {
  const { themeOverride } = (context.parameters.themes ?? {}) as { themeOverride?: string }
  const selected = themeOverride || (context.globals.theme as string | undefined) || 'default'
  const theme = storybookThemes[selected as keyof typeof storybookThemes] ?? storybookThemes.default
  document.documentElement.setAttribute('data-theme', theme)
  return Story()
}
