import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const readmePath = join(root, 'README.md');
const readme = readFileSync(readmePath, 'utf8');

/** Markdown text without fenced code blocks, so links inside samples are not checked. */
const prose = readme.replace(/```[\s\S]*?```/g, '');

/** GitHub-style heading anchor: lowercase, drop punctuation, spaces to hyphens. */
const slug = (heading: string) =>
  heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s/g, '-');

const anchorsOf = (markdown: string) =>
  new Set(
    [...markdown.replace(/```[\s\S]*?```/g, '').matchAll(/^#{1,6}\s+(.+)$/gm)].map((m) => slug(m[1] as string)),
  );

/** Target of every `[text](target)` and `![alt](target)` that is not an absolute URL. */
const relativeTargets = [...prose.matchAll(/!?\[[^\]]*\]\(([^)\s]+)\)/g)]
  .map((m) => m[1] as string)
  .filter((href) => !/^[a-z][a-z0-9+.-]*:/i.test(href));

const sections = (markdown: string) => markdown.split(/^(?=## )/m);
const sectionTitled = (markdown: string, title: string) =>
  sections(markdown).find((section) => section.startsWith(`## ${title}\n`)) ?? '';

describe('README links and images', () => {
  it('has relative links and images to check', () => {
    expect(relativeTargets.length).toBeGreaterThan(0);
    expect([...prose.matchAll(/!\[[^\]]+\]\(/g)].length).toBeGreaterThan(0);
  });

  it.each([...new Set(relativeTargets)])('%s resolves to a file in the repo', (href) => {
    const [file = '', fragment] = href.split('#') as [string, string | undefined];
    const target = file === '' ? readmePath : resolve(dirname(readmePath), file.split('?')[0] as string);
    expect(target.startsWith(root)).toBe(true);
    expect(existsSync(target)).toBe(true);
    if (fragment && target.endsWith('.md')) {
      expect([...anchorsOf(readFileSync(target, 'utf8'))]).toContain(fragment);
    }
  });

  it('gives every image alt text', () => {
    expect(prose).not.toMatch(/!\[\s*\]\(/);
  });
});

describe('README top of page', () => {
  const top = readme.split(/^## /m)[0] ?? '';

  it('has a one-line pitch, the four badges and the themed hero image before the first ## heading', () => {
    const pitch = top.split('\n').filter((line) => line.trim() !== '' && !line.startsWith('#') && !/^!?\[/.test(line));
    expect(pitch).toHaveLength(1);
    expect(top).toMatch(/\[!\[CI\]\([^)]*\/workflows\/ci\.yml\/badge\.svg\)\]\(/);
    expect(top).toMatch(/\[!\[License: MIT\]\([^)]*\)\]\(LICENSE\)/);
    expect(top).toMatch(/\[!\[Storybook\]\([^)]*\)\]\(https:\/\/ds\.mikespin\.dev\/\)/);
    expect(top).toMatch(/\[!\[Use this template\]\([^)]*\)\]\(https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/generate\)/);
    expect(top).toContain('](docs/images/readme/themes-side-by-side.png)');
  });

  it('points the CI badge at a workflow that exists and the license badge at a MIT license', () => {
    expect(existsSync(join(root, '.github/workflows/ci.yml'))).toBe(true);
    expect(readFileSync(join(root, 'LICENSE'), 'utf8')).toMatch(/^MIT License/);
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { license: string };
    expect(pkg.license).toBe('MIT');
  });
});

describe('README why, start, customize', () => {
  const why = sectionTitled(readme, 'Why use it');

  it('links each claim in "Why use it" to its proof', () => {
    const targets = [...why.matchAll(/!?\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1] as string);
    for (const proof of [
      'https://www.radix-ui.com/primitives',
      'CLAUDE.md#radix-primitives-required',
      'docs/specs/Dialog.md',
      'docs/specs/Theming.md',
      'src/styles/tokens.css',
      'docs/theming-guide.md',
      '#customize-in-minutes',
      'src/themes/bold.css',
      'CLAUDE.md#conventions',
      '.github/workflows/ci.yml',
      'jest.config.cjs',
    ]) {
      expect({ proof, linked: targets.includes(proof) }).toEqual({ proof, linked: true });
    }
    for (const word of ['@layer ds', '`createTheme()`', '`checkContrast()`', '`bold`', '`bold-dark`', 'jest-axe', '80 % coverage']) {
      expect(why).toContain(word);
    }
  });

  it('"Start from it" links the starter guide', () => {
    expect(sectionTitled(readme, 'Start from it')).toContain('(docs/starter-guide.md)');
  });

  it('"Customize in minutes" shows docs/theming-guide/samples/minimal.ts verbatim and every themed screenshot', () => {
    const customize = sectionTitled(readme, 'Customize in minutes');
    const sample = readFileSync(join(root, 'docs/theming-guide/samples/minimal.ts'), 'utf8').trimEnd();
    const blocks = [...customize.matchAll(/```ts\n([\s\S]*?)\n```/g)].map((m) => m[1]);
    expect(blocks).toEqual([sample]);
    expect(customize).toContain('(docs/theming-guide/samples/minimal.ts)');
    for (const theme of ['default', 'dark', 'bold', 'bold-dark']) {
      expect(customize).toContain(`](docs/images/readme/contact-form-${theme}.png)`);
    }
  });

  it('lists only components that src/index.ts exports, each linked to the live Storybook', async () => {
    const api = (await import('../index')) as Record<string, unknown>;
    const components = sectionTitled(readme, 'Components');
    const links = [...components.matchAll(/\[(\w+)\]\((https:\/\/ds\.mikespin\.dev\/\?path=\/docs\/[\w-]+)\)/g)];
    expect(links.length).toBeGreaterThan(0);
    // Toast is exported as Toaster / ToastProvider / useToast, so a name may be the prefix of an export.
    for (const [, name] of links) {
      expect({ name, exported: Object.keys(api).some((key) => key.startsWith(name as string)) }).toEqual({ name, exported: true });
    }
  });
});

describe("README 'How it's built' and the moved material", () => {
  const built = sectionTitled(readme, "How it's built");

  it('is at most 10 lines and links both docs', () => {
    expect(built.trimEnd().split('\n').length).toBeLessThanOrEqual(10);
    expect(built).toContain('(docs/claude-design.md)');
    expect(built).toContain('(docs/factory/README.md)');
  });

  it('no longer carries the Claude Design or factory sections', () => {
    expect(readme).not.toMatch(/^## (Claude Design|Software Factory)$/m);
  });

  it('keeps the Claude Design material in docs/claude-design.md', () => {
    const doc = readFileSync(join(root, 'docs/claude-design.md'), 'utf8');
    for (const heading of ['# Claude Design', '## Canvases', '## Specs', '## Design to spec to build', '## Tokens connect design and code']) {
      expect(doc).toMatch(new RegExp(`^${heading}$`, 'm'));
    }
    expect(doc).toContain('](images/readme/claude-design-canvas.png)');
  });

  it('keeps the factory material in docs/factory/README.md', () => {
    const doc = readFileSync(join(root, 'docs/factory/README.md'), 'utf8');
    for (const heading of ['### Roadmap task format', '### Skills', '### Agent pipeline', '### Hard gates', '### Human approval points']) {
      expect(doc).toMatch(new RegExp(`^${heading}$`, 'm'));
    }
    expect(doc).toContain('](../images/readme/factory-status.png)');
  });
});

describe('moved docs', () => {
  it.each(['docs/claude-design.md', 'docs/factory/README.md'])('%s: every relative link and image resolves', (file) => {
    const path = join(root, file);
    const text = readFileSync(path, 'utf8').replace(/```[\s\S]*?```/g, '');
    const targets = [...text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)\)/g)]
      .map((m) => m[1] as string)
      .filter((href) => !/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('#'));
    expect(targets.length).toBeGreaterThan(0);
    for (const href of targets) {
      const [rel = ''] = href.split('#');
      expect({ href, exists: existsSync(resolve(dirname(path), rel)) }).toEqual({ href, exists: true });
    }
  });

  it('lists every skill folder in docs/factory/README.md', () => {
    const doc = readFileSync(join(root, 'docs/factory/README.md'), 'utf8');
    const skills = ['status', 'next', 'plan', 'add', 'edit', 'design', 'build', 'approve', 'merge', 'retry'];
    for (const skill of skills) expect(doc).toContain(`(../../factory/plugin/skills/${skill}/SKILL.md)`);
  });
});
