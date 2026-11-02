import { useEffect, useState, type ComponentProps } from 'react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { GLOBALS_UPDATED } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'
import { themes } from 'storybook/theming'
import { storybookThemes } from './themes'

const isTheme = (name: unknown): name is keyof typeof storybookThemes =>
  typeof name === 'string' && name in storybookThemes

/** The toolbar choice at load time: the `globals=theme:<name>` iframe param, else the default theme. */
const initialTheme = (): keyof typeof storybookThemes => {
  const globals = new URLSearchParams(window.location.search).get('globals') ?? ''
  const name = globals.split(';').find((pair) => pair.startsWith('theme:'))?.slice('theme:'.length)
  return isTheme(name) ? name : 'default'
}

const isDark = (name: string) => name === 'dark' || name === 'bold-dark'

/**
 * Docs container that follows the toolbar theme: it keeps `data-theme` on <html> in step with the toolbar
 * (so pages with no story, such as MDX-only pages, also switch) and gives Storybook's own docs blocks its
 * dark theme for `dark` and `bold-dark`. Colors of the canvas and the page come from docs-theme.css.
 */
export const ThemedDocsContainer = (props: ComponentProps<typeof DocsContainer>) => {
  const [name, setName] = useState(initialTheme)

  useEffect(() => {
    const channel = addons.getChannel()
    const onGlobals = ({ userGlobals }: { userGlobals?: { theme?: unknown } }) => {
      setName(isTheme(userGlobals?.theme) ? userGlobals.theme : 'default')
    }
    channel.on(GLOBALS_UPDATED, onGlobals)
    return () => channel.off(GLOBALS_UPDATED, onGlobals)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', storybookThemes[name])
  }, [name])

  return <DocsContainer {...props} theme={isDark(name) ? themes.dark : themes.light} />
}
