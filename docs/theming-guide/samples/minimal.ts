import { createTheme } from 'design-system-test'

// The smallest useful input: one brand color, nothing else chosen.
// Unset radius is 0, unset shadow is none, unset neutral gives pure grays.
export const acme = createTheme({
  name: 'acme',
  brand: '#0b6e4f',
  fonts: { heading: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  radius: {},
  shadow: {},
  mode: 'both',
})

// acme.css holds two blocks: [data-theme="acme"] (light, every role) and
// [data-theme="acme-dark"] (dark, color roles only).
export const selectors: string[] = acme.blocks.map((block) => block.selector)
