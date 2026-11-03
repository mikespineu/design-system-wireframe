import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compositions } from './compositions';
import { MOTION_OFF_CSS, MotionOff } from './MotionOff';
import { Root } from './Root';

describe('compositions', () => {
  it('registers the placeholder compositions with their ids and sizes', () => {
    expect(compositions.map(({ id, width, height, fps }) => ({ id, width, height, fps }))).toEqual([
      { id: 'placeholder-default', width: 1920, height: 1080, fps: 30 },
      { id: 'placeholder-bold', width: 1920, height: 1080, fps: 30 },
    ]);
  });

  it('has unique ids', () => {
    expect(new Set(compositions.map((c) => c.id)).size).toBe(compositions.length);
  });

  it('Root renders one <Composition> per config entry', () => {
    const tree = Root() as { props: { children: { key: string; props: { id: string; width: number } }[] } };
    expect(tree.props.children.map((el) => el.props.id)).toEqual(compositions.map((c) => c.id));
    expect(tree.props.children.every((el) => el.props.width === 1920)).toBe(true);
  });

  it('themes the default and bold compositions through props', () => {
    expect(compositions.map((c) => c.defaultProps.theme)).toEqual(['default', 'bold']);
  });
});

describe('motion off', () => {
  it('sets --ds-motion to 0ms and disables CSS transitions and animations', () => {
    expect(MOTION_OFF_CSS).toMatch(/--ds-motion:\s*0ms/);
    expect(MOTION_OFF_CSS).toMatch(/transition:\s*none\s*!important/);
    expect(MOTION_OFF_CSS).toMatch(/animation:\s*none\s*!important/);
  });

  it('renders the override as a style element', () => {
    const html = renderToStaticMarkup(MotionOff());
    expect(html).toContain('data-ds-motion-off');
    expect(html).toContain('--ds-motion: 0ms');
  });
});

describe('package setup', () => {
  it('resolves a single React copy shared with the design system', () => {
    const require = createRequire(import.meta.url);
    const fromVideo = require.resolve('react/package.json');
    const libEntry = require.resolve('design-system-test/package.json');
    const fromLib = createRequire(join(dirname(libEntry), 'package.json')).resolve('react/package.json');
    expect(fromLib).toBe(fromVideo);
  });
});
