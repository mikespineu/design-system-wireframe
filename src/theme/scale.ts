import { clampToGamut, hexToOklch, oklchToHex, type Oklch } from './color'

export const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const
export type ScaleStep = (typeof scaleSteps)[number]

export interface ScaleEntry extends Oklch {
  hex: string
}

export type ColorScale = Record<ScaleStep, ScaleEntry>

/** Lightness per step: strictly decreasing, 50 is near white and 900 near black. */
const lightness: Record<ScaleStep, number> = {
  50: 0.975,
  100: 0.94,
  200: 0.88,
  300: 0.8,
  400: 0.71,
  500: 0.62,
  600: 0.54,
  700: 0.46,
  800: 0.37,
  900: 0.28,
}

/** Share of the brand chroma kept per step: pale and very dark steps are less saturated. */
const chromaShare: Record<ScaleStep, number> = {
  50: 0.15,
  100: 0.3,
  200: 0.55,
  300: 0.8,
  400: 0.95,
  500: 1,
  600: 1,
  700: 0.95,
  800: 0.8,
  900: 0.6,
}

/** Generates a 50 to 900 scale in OKLCH from one brand color, keeping its hue. */
export function generateScale(brand: string): ColorScale {
  const { c, h } = hexToOklch(brand)
  const scale = {} as ColorScale
  for (const step of scaleSteps) {
    const color = clampToGamut({ l: lightness[step], c: c * chromaShare[step], h })
    scale[step] = { ...color, hex: oklchToHex(color) }
  }
  return scale
}
