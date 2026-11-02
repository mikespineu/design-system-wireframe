import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GUIDE_DOCS_BASE, prepareGuideForStorybook } from './themingGuide';

const root = process.cwd();
const guide = readFileSync(join(root, 'docs/theming-guide.md'), 'utf8');
const mdx = readFileSync(join(root, 'src/docs/ThemingGuide.mdx'), 'utf8');

describe('prepareGuideForStorybook', () => {
  it('strips HTML comments outside code fences', () => {
    const out = prepareGuideForStorybook('a\n\n<!-- sample: x.ts -->\n```ts\nx\n```\n\nb <!-- inline --> c');
    expect(out).not.toContain('<!--');
    expect(out).toContain('```ts\nx\n```');
    expect(out).toContain('b  c');
  });

  it('keeps comment-like text inside code fences', () => {
    const src = '```html\n<!-- keep -->\n[a](b.md)\n```';
    expect(prepareGuideForStorybook(src)).toBe(src);
  });

  it('rewrites relative links to GitHub URLs and keeps anchors', () => {
    const out = prepareGuideForStorybook(
      '[a](consumer-guide.md#apply-a-theme) [b](specs/Theming.md) [c](theming-guide/samples/) [d](./x.md) [e](#top) [f](https://example.com/p)',
    );
    expect(out).toContain(`[a](${GUIDE_DOCS_BASE}/blob/main/docs/consumer-guide.md#apply-a-theme)`);
    expect(out).toContain(`[b](${GUIDE_DOCS_BASE}/blob/main/docs/specs/Theming.md)`);
    expect(out).toContain(`[c](${GUIDE_DOCS_BASE}/tree/main/docs/theming-guide/samples/)`);
    expect(out).toContain(`[d](${GUIDE_DOCS_BASE}/blob/main/docs/x.md)`);
    expect(out).toContain('[e](#top)');
    expect(out).toContain('[f](https://example.com/p)');
  });

  it('leaves no relative links or HTML comments in the real guide', () => {
    const out = prepareGuideForStorybook(guide);
    const prose = out.replace(/```[\s\S]*?```/g, '');
    expect(prose).not.toContain('<!--');
    for (const m of prose.matchAll(/\]\(([^)\s]+)\)/g)) expect(m[1]).toMatch(/^(#|https:\/\/)/);
  });

  it('turns task-list items into plain bullets', () => {
    expect(prepareGuideForStorybook('- [ ] one\n- [x] two\n  * [X] three\n- [link](#a)')).toBe(
      '- one\n- two\n  * three\n- [link](#a)',
    );
  });

  it('leaves no task-list markers in the real guide output', () => {
    expect(guide).toMatch(/^- \[ \] /m);
    const out = prepareGuideForStorybook(guide);
    expect(out).not.toMatch(/^\s*[-*+]\s+\[[ xX]\]/m);
    expect(out).toContain('- Brand, neutral, fonts, radius and shadow chosen (step 1)');
  });

  it('does not alter code blocks', () => {
    const fences = (s: string) => s.match(/```[\s\S]*?```/g);
    expect(fences(prepareGuideForStorybook(guide))).toEqual(fences(guide));
  });
});

describe('ThemingGuide.mdx', () => {
  it('renders docs/theming-guide.md through the transform', () => {
    expect(mdx).toContain("docs/theming-guide.md?raw");
    expect(mdx).toContain('prepareGuideForStorybook(guide)');
    expect(mdx).toContain('<Meta title="Foundations/Theming/Create your own theme"');
  });
});
