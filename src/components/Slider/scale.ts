/** Pure scale helpers for Slider: allowed values, parsing, clamping and snapping. */

export interface Scale {
  /** Custom list of allowed values (sorted, unique). When set, min / max / step are derived. */
  values?: readonly number[];
  min: number;
  max: number;
  step: number;
}

export const decimalsOf = (n: number) => {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  if (s.includes('e-')) return Number(s.split('e-')[1]);
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
};

export const roundTo = (n: number, decimals: number) => Number(n.toFixed(Math.min(decimals, 20)));

export const scaleDecimals = (scale: Scale) =>
  scale.values
    ? Math.max(0, ...scale.values.map(decimalsOf))
    : Math.max(decimalsOf(scale.step), decimalsOf(scale.min));

/** Number of grid points of a uniform scale. */
const gridCount = (s: Scale) => Math.floor((s.max - s.min) / s.step + 1e-9) + 1;

/** Every allowed value, ascending. */
export const allowedValues = (scale: Scale): number[] => {
  if (scale.values) return [...scale.values];
  const d = scaleDecimals(scale);
  return Array.from({ length: gridCount(scale) }, (_, k) => roundTo(scale.min + k * scale.step, d));
};

export const firstAllowed = (scale: Scale) => (scale.values ? (scale.values[0] ?? 0) : scale.min);

export const lastAllowed = (scale: Scale) =>
  scale.values ? (scale.values[scale.values.length - 1] ?? 0) : roundTo(scale.min + (gridCount(scale) - 1) * scale.step, scaleDecimals(scale));

/** Clamp then snap to the nearest allowed value. Ties go to the higher value. */
export const snapToScale = (scale: Scale, raw: number): number => {
  const lo = firstAllowed(scale);
  const hi = lastAllowed(scale);
  const v = Math.min(hi, Math.max(lo, raw));
  if (scale.values) {
    let best = scale.values[0] ?? lo;
    for (const candidate of scale.values) {
      if (Math.abs(v - candidate) <= Math.abs(v - best)) best = candidate; // `<=`: later (higher) wins ties
    }
    return best;
  }
  const k = Math.floor((v - scale.min) / scale.step + 0.5 + 1e-9);
  return Math.min(hi, roundTo(scale.min + k * scale.step, scaleDecimals(scale)));
};

/** Position 0..1 of a real value on the track. */
export const positionOf = (scale: Scale, v: number): number => {
  if (scale.values) {
    const i = scale.values.indexOf(v);
    return scale.values.length < 2 ? 0 : Math.max(0, i) / (scale.values.length - 1);
  }
  return scale.max === scale.min ? 0 : (v - scale.min) / (scale.max - scale.min);
};

/** Previous (-1) or next (+1) allowed value from `current`, clamped. */
export const neighbour = (scale: Scale, current: number, dir: -1 | 1): number => {
  if (scale.values) {
    const i = Math.max(0, scale.values.indexOf(current));
    return scale.values[Math.min(scale.values.length - 1, Math.max(0, i + dir))] ?? current;
  }
  return snapToScale(scale, current + dir * scale.step);
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Parse typed text. Returns `null` for anything that is not a number (optionally followed by the unit). */
export const parseTyped = (text: string, unit?: string): number | null => {
  let t = text.trim().replace(/\u00A0/g, ' ');
  if (unit) t = t.replace(new RegExp(`\\s*${escapeRe(unit.trim())}$`, 'i'), '').trim();
  if (!/^[-−]?\d+(?:[.,]\d+)?$|^[-−]?[.,]\d+$/.test(t)) return null;
  const n = Number(t.replace('−', '-').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export const defaultFormat = (v: number, unit?: string) => {
  if (!unit) return String(v);
  const sep = unit === '%' || unit === '°' ? '' : '\u00A0';
  return `${v}${sep}${unit}`;
};
