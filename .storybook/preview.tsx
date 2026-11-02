import type { Preview } from '@storybook/react-vite'
import { withThemeByDataAttribute } from '@storybook/addon-themes'
import '../src/styles/fonts.css'
import '../src/styles/tailwind.css'
// Opt-in demo themes (DS-12). Storybook-only: the library never loads them by itself.
import '../src/themes/bold.css'
import '../src/themes/bold-fonts.css'
import './docs-theme.css'
import { TooltipProvider } from '../src/components/Tooltip'
import { storybookThemes, withThemeAtRender } from './themes'
import { ThemedDocsContainer } from './ThemedDocsContainer'

const preview: Preview = {
  decorators: [
    // Applies the theme during render, so open Drawer and Dialog stories never show the default theme first.
    withThemeAtRender,
    // Sets data-theme on <html> (the addon's default parentSelector), so docs pages, portals and every story follow the toolbar.
    withThemeByDataAttribute({
      themes: storybookThemes,
      defaultTheme: 'default',
      attributeName: 'data-theme',
    }),
    (Story) => <TooltipProvider><Story /></TooltipProvider>,
  ],
  parameters: {
    docs: { container: ThemedDocsContainer },
    options: { storySort: { order: ['Introduction', 'Foundations', 'Components', 'Patterns'] } },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
