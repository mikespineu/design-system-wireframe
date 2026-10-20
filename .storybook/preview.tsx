import type { Preview } from '@storybook/react-vite'
import '../src/styles/tailwind.css'

document.documentElement.setAttribute('data-theme', 'default')

const preview: Preview = {
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