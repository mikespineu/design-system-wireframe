/** Color math with no dependencies: sRGB hex, OKLCH (Ottosson) and WCAG 2.x contrast. */

export interface Oklch {
  /** Lightness 0 to 1. */
  l: number
  /** Chroma, roughly 0 to 0.4. */
  c: number
  /** Hue in degrees, 0 to 360. */
  h: number
}

type Rgb = [number, number, number]

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export const isHex = (value: string): boolean => HEX.test(value)

export function parseHex(hex: string): Rgb {
  if (!isHex(hex)) throw new Error(`Invalid hex color: ${hex}`)
  let h = hex.slice(1)
  if (h.length === 3) h = [...h].map((ch) => ch + ch).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
const fromLinear = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055)

export function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b]
    .map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0'))
    .join('')}`
}

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = parseHex(hex).map(toLinear) as Rgb
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(a, bb)
  const h = c < 1e-4 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
  return { l: L, c, h }
}

/** Linear sRGB, unclamped. */
function oklchToLinear({ l: L, c, h }: Oklch): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const EPS = 0.0005
const inGamut = (rgb: Rgb) => rgb.every((v) => v >= -EPS && v <= 1 + EPS)

export function oklchToHex(color: Oklch): string {
  return toHex(oklchToLinear(color).map(fromLinear) as Rgb)
}

/** Reduces chroma (keeping lightness and hue) until the color fits in sRGB. */
export function clampToGamut(color: Oklch): Oklch {
  const l = Math.min(1, Math.max(0, color.l))
  if (inGamut(oklchToLinear({ ...color, l }))) return { ...color, l }
  let lo = 0
  let hi = color.c
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(oklchToLinear({ l, c: mid, h: color.h }))) lo = mid
    else hi = mid
  }
  return { l, c: lo, h: color.h }
}

/** WCAG 2.x relative luminance. */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(toLinear) as Rgb
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.x contrast ratio, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Moves lightness toward `direction` in small steps until `fg` reaches `min` contrast on `bg`. */
export function ensureContrast(fg: string, bg: string, min: number, direction: 'darker' | 'lighter'): string {
  let color = hexToOklch(fg)
  let out = fg
  for (let i = 0; i < 200 && contrastRatio(out, bg) < min; i++) {
    color = { ...color, l: color.l + (direction === 'darker' ? -0.005 : 0.005) }
    out = oklchToHex(clampToGamut(color))
  }
  return out
}
