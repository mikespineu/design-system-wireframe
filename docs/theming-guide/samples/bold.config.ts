import type { ThemeConfig, ThemeFonts, ThemeRadius } from 'design-system-test'

const fonts: ThemeFonts = {
  heading: "'Bricolage Grotesque', 'Arial Black', system-ui, sans-serif",
  body: "'Figtree', system-ui, sans-serif",
  label: "'Figtree', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
}

const radius: ThemeRadius = { sm: '8px', md: '14px', lg: '24px', full: '9999px' }

export const boldConfig: ThemeConfig = {
  name: 'bold',
  brand: '#4318D1',
  neutral: '#140E3D',
  fonts,
  radius,
  shadow: { sm: '0 2px 0 #140e3d', md: '0 4px 0 #140e3d', lg: '8px 8px 0 #140e3d' },
  mode: 'light',
}

export const boldDarkConfig: ThemeConfig = {
  name: 'bold-dark',
  brand: '#4318D1',
  neutral: '#140E3D',
  fonts,
  radius,
  shadow: { sm: '0 2px 0 rgb(0 0 0 / 0.6)', md: '0 4px 0 rgb(0 0 0 / 0.6)', lg: '8px 8px 0 #4318d1' },
  mode: 'dark',
}
