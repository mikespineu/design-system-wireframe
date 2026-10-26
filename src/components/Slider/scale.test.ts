import { allowedValues, defaultFormat, lastAllowed, neighbour, parseTyped, positionOf, snapToScale, type Scale } from './scale';

const uni = (min: number, max: number, step: number): Scale => ({ min, max, step });
const list: Scale = { values: [1, 2, 3, 5, 8, 10], min: 1, max: 10, step: 1 };

describe('scale helpers', () => {
  it('lists allowed values and the last reachable one', () => {
    expect(allowedValues(uni(0, 1, 0.1))).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
    expect(allowedValues(list)).toEqual([1, 2, 3, 5, 8, 10]);
    expect(lastAllowed(uni(0, 100, 30))).toBe(90);
  });

  it('snaps uniform values, ties up, with float noise removed', () => {
    const s = uni(0, 100, 5);
    expect(snapToScale(s, 42.5)).toBe(45);
    expect(snapToScale(s, 42.4)).toBe(40);
    expect(snapToScale(s, 120)).toBe(100);
    expect(snapToScale(s, -3)).toBe(0);
    expect(snapToScale(uni(0, 1, 0.1), 0.1 + 0.2)).toBe(0.3);
    expect(snapToScale(uni(0, 100, 30), 100)).toBe(90);
  });

  it('snaps custom lists to the nearest value, ties to the higher', () => {
    expect(snapToScale(list, 4)).toBe(5);
    expect(snapToScale(list, 2.4)).toBe(2);
    expect(snapToScale(list, 6)).toBe(5);
    expect(snapToScale(list, 6.5)).toBe(8);
    expect(snapToScale(list, 99)).toBe(10);
    expect(snapToScale(list, -4)).toBe(1);
  });

  it('computes equal spacing positions for lists', () => {
    expect([1, 2, 3, 5, 8, 10].map((v) => positionOf(list, v))).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(positionOf(uni(100, 250, 10), 175)).toBe(0.5);
    expect(positionOf({ values: [5], min: 5, max: 5, step: 1 }, 5)).toBe(0);
    expect(positionOf(uni(5, 5, 1), 5)).toBe(0);
  });

  it('finds neighbours', () => {
    expect(neighbour(list, 3, 1)).toBe(5);
    expect(neighbour(list, 3, -1)).toBe(2);
    expect(neighbour(list, 10, 1)).toBe(10);
    expect(neighbour(uni(100, 250, 10), 180, 1)).toBe(190);
    expect(neighbour(uni(100, 250, 10), 100, -1)).toBe(100);
  });

  it('parses typed text', () => {
    expect(parseTyped(' 239 ')).toBe(239);
    expect(parseTyped('239cm', 'cm')).toBe(239);
    expect(parseTyped('239 cm', 'cm')).toBe(239);
    expect(parseTyped('239 CM', 'cm')).toBe(239);
    expect(parseTyped('239 cm', 'cm')).toBe(239);
    expect(parseTyped('3,5')).toBe(3.5);
    expect(parseTyped('−3')).toBe(-3);
    expect(parseTyped('-3.5')).toBe(-3.5);
    expect(parseTyped('.5')).toBe(0.5);
    expect(parseTyped('abc')).toBeNull();
    expect(parseTyped('')).toBeNull();
    expect(parseTyped('1.2.3')).toBeNull();
    expect(parseTyped('12 cm')).toBeNull();
    expect(parseTyped('5%', '%')).toBe(5);
  });

  it('formats with unit separators', () => {
    expect(defaultFormat(40, '%')).toBe('40%');
    expect(defaultFormat(20, '°')).toBe('20°');
    expect(defaultFormat(239, 'cm')).toBe('239 cm');
    expect(defaultFormat(7)).toBe('7');
  });
});
