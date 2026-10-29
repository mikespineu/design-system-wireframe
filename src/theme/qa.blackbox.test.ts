import { createTheme, checkContrast, type ThemeConfig } from '../index';
import { themeRoles, colorRoles } from '../styles/roles';

const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = (hex: string) => {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};
const base = (brand: string, mode: ThemeConfig['mode'], neutral?: string): ThemeConfig => ({
  name: 'qa', brand: brand as `#${string}`, neutral: neutral as `#${string}` | undefined,
  fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' }, radius: {}, shadow: {}, mode,
});
const brands = ['#ff0000','#00ff00','#0000ff','#ffff00','#00ffff','#ff00ff','#ffffff','#000000','#808080','#777','#fefefe','#010101','#fff700','#1a73e8','#e91e63','#9c27b0'];

describe.each(brands)('brand %s', (brand) => {
  for (const mode of ['light', 'dark', 'both'] as const) {
    it(`mode ${mode}: roles, css parse, contrast`, () => {
      const t = createTheme(base(brand, mode, brand === '#808080' ? '#336699' : undefined));
      const first = t.blocks[0]!;
      for (const r of themeRoles) expect(first.values).toHaveProperty([r]);
      if (mode === 'both') for (const r of colorRoles) expect(t.blocks[1]!.values).toHaveProperty([r]);
      const css = t.css;
      expect((css.match(/\{/g) ?? []).length).toBe(t.blocks.length);
      expect((css.match(/\}/g) ?? []).length).toBe(t.blocks.length);
      expect(css).not.toMatch(/NaN|undefined|\[object/);
      for (const b of t.blocks) for (const [k, v] of Object.entries(b.values)) {
        expect(v.trim()).not.toBe('');
        if (k.startsWith('--ds-color') && v.startsWith('#')) expect(v).toMatch(/^#[0-9a-f]{6}$/);
      }
      const rep = checkContrast(t);
      // independent verification of reported ratios, and that generated themes mostly pass
      for (const f of rep.failures) {
        const blk = t.blocks.find((b) => b.selector === f.selector)!;
        const r = ratio(blk.values['--ds-' + f.foreground]!, blk.values['--ds-' + f.background]!);
        expect(r).toBeLessThan(f.required);
      }
      if (!rep.ok) console.log(brand, mode, JSON.stringify(rep.failures.map((f) => `${f.mode} ${f.foreground}/${f.background} ${f.ratio}`)));
    });
  }
  it('scale monotonic', () => {
    const s = createTheme(base(brand, 'light')).scale;
    const steps = [50,100,200,300,400,500,600,700,800,900] as const;
    for (let i = 1; i < steps.length; i++) expect(s[steps[i]!].l).toBeLessThan(s[steps[i-1]!].l);
  });
});

describe('checkContrast independent', () => {
  it('flags bad theme, none missed', () => {
    const t = createTheme(base('#1a73e8', 'both'));
    for (const b of t.blocks) {
      b.values['--ds-color-text'] = b.values['--ds-color-background']!;
      b.values['--ds-color-focus'] = b.values['--ds-color-background']!;
      b.values['--ds-color-text-muted'] = '#cccccc';
    }
    const rep = checkContrast(t);
    expect(rep.ok).toBe(false);
    const names = rep.failures.map((f) => f.foreground);
    expect(names).toEqual(expect.arrayContaining(['color-text', 'color-focus', 'color-text-muted']));
    expect(rep.failures.some((f) => f.mode === 'dark')).toBe(true);
  });
  it('boundary 4.5 / 3', () => {
    const t = createTheme(base('#1a73e8', 'light'));
    t.blocks[0]!.values['--ds-color-background'] = '#ffffff';
    t.blocks[0]!.values['--ds-color-surface'] = '#ffffff';
    t.blocks[0]!.values['--ds-color-text'] = '#767676'; // 4.54
    expect(checkContrast(t).failures.find((f) => f.foreground === 'color-text' && f.background === 'color-background')).toBeUndefined();
    t.blocks[0]!.values['--ds-color-text'] = '#777777'; // 4.48
    expect(checkContrast(t).failures.find((f) => f.foreground === 'color-text' && f.background === 'color-background')).toBeDefined();
    t.blocks[0]!.values['--ds-color-text'] = '#777'; // shorthand: should still be evaluated
    expect(checkContrast(t).failures.find((f) => f.foreground === 'color-text' && f.background === 'color-background')).toBeDefined();
  });
  it('rejects bad input', () => {
    expect(() => createTheme(base('red', 'light'))).toThrow();
    expect(() => createTheme({ ...base('#fff', 'light'), name: 'Bad Name' })).toThrow();
    expect(() => createTheme({ ...base('#fff', 'light'), fonts: { heading: 'a;}', body: 'b' } })).toThrow();
  });
});
