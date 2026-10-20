import type { Preview } from '@storybook/react-vite'
import '../src/styles/tailwind.css'
import { applyTheme, defaultTheme, themes, type ThemeName } from '../src/components/Theme'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Design system theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: themes.map((value) => ({ value, title: value })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: defaultTheme },
  decorators: [
    (Story, context) => {
      applyTheme((context.globals.theme as ThemeName | undefined) ?? defaultTheme)
      return <Story />
    },
  ],
  parameters: {
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
