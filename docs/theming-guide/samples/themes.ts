import { boldConfig, boldDarkConfig } from './bold.config'
import { boldColors } from './bold.colors'
import { boldDarkColors } from './bold.dark-colors'
import { boldShape } from './bold.shape'
import { buildTheme } from './build-theme'

export const bold = buildTheme(boldConfig, { ...boldColors, ...boldShape, '--ds-photo-filter': 'none' })

export const boldDark = buildTheme(boldDarkConfig, {
  ...boldDarkColors,
  ...boldShape,
  '--ds-photo-filter': 'brightness(0.9)',
})
