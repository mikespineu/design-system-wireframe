import { useEffect, useState, type ComponentProps } from 'react'
import { DocsContainer } from '@storybook/addon-docs/blocks'
import { GLOBALS_UPDATED } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'
import { themes } from 'storybook/theming'
import { isThemeName, storybookThemes, themeFromGlobalsParam } from './themes'

/** The toolbar choice at load time: the `globals=theme:<name>` iframe param, else the default theme. */
const initialTheme = () => themeFromGlobalsParam(new URLSearchParams(window.location.search).get('globals')) ?? 'default'

const isDark = (name: string) => name === 'dark' || name === 'bold-dark'

/**
 * Docs container that follows the toolbar theme: it keeps `data-theme` on <html> in step with the toolbar
 * (so pages with no story, such as MDX-only pages, also switch), carries the theme into the story iframes
 * of `inline: false` stories, and gives Storybook's own docs blocks its
 * dark theme for `dark` and `bold-dark`. Colors of the canvas and the page come from docs-theme.css.
 */
export const ThemedDocsContainer = (props: ComponentProps<typeof DocsContainer>) => {
  const [name, setName] = useState(initialTheme)

  useEffect(() => {
    const channel = addons.getChannel()
    const onGlobals = ({ userGlobals }: { userGlobals?: { theme?: unknown } }) => {
      // The inner story iframes of `inline: false` stories report their own globals here too, and they
      // start with no theme (''): only a real theme name may change the page, never an empty one.
      if (isThemeName(userGlobals?.theme)) setName(userGlobals.theme)
    }
    channel.on(GLOBALS_UPDATED, onGlobals)
    return () => channel.off(GLOBALS_UPDATED, onGlobals)
  }, [])

  useEffect(() => {
    const theme = storybookThemes[name]
    document.documentElement.setAttribute('data-theme', theme)
    // `inline: false` stories live in same-origin iframes that the toolbar does not reach: keep them in step.
    document.querySelectorAll('iframe').forEach((frame) => {
      try {
        frame.contentDocument?.documentElement.setAttribute('data-theme', theme)
      } catch {
        // Not same-origin: leave it.
      }
    })
  }, [name])

  return <DocsContainer {...props} theme={isDark(name) ? themes.dark : themes.light} />
}
