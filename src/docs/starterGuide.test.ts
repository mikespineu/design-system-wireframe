import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const guidePath = join(root, 'docs/starter-guide.md');
const guide = readFileSync(guidePath, 'utf8');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { scripts: Record<string, string> };

/** Markdown text without fenced code blocks, so links inside samples are not checked. */
const prose = guide.replace(/```[\s\S]*?```/g, '');

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

const relativeLinks = [...prose.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)]
  .map((m) => m[1] as string)
  .filter((href) => !/^[a-z][a-z0-9+.-]*:/i.test(href));

describe('starter guide links', () => {
  it('has relative links to check', () => {
    expect(relativeLinks.length).toBeGreaterThan(0);
  });

  it.each(relativeLinks)('%s resolves to a file in the repo', (href) => {
    const [file = '', fragment] = href.split('#') as [string, string | undefined];
    const target = file === '' ? guidePath : resolve(dirname(guidePath), file.split('?')[0] as string);
    expect(target.startsWith(root)).toBe(true);
    expect(existsSync(target)).toBe(true);
    if (fragment && target.endsWith('.md')) {
      expect([...anchorsOf(readFileSync(target, 'utf8'))]).toContain(fragment);
    }
  });
});

describe('starter guide npm scripts', () => {
  const mentioned = [
    ...new Set([...guide.matchAll(/npm (?:run|run-script) ([\w:.-]+)/g)].map((m) => m[1] as string)),
  ];

  it('mentions npm scripts', () => {
    expect(mentioned.length).toBeGreaterThan(0);
  });

  it.each(mentioned)('npm run %s exists in package.json', (script) => {
    expect(Object.keys(pkg.scripts)).toContain(script);
  });

  it('only uses `npm test` when package.json has a test script', () => {
    if (/npm (?:run-script )?test\b/.test(guide) || /npm t\b/.test(guide)) expect(pkg.scripts).toHaveProperty('test');
  });

  it('shows the full green-build command', () => {
    expect(guide).toContain('npm ci && npm run lint && npm run typecheck && npm test && npm run build-storybook');
  });
});

describe('starter guide workflows', () => {
  const dir = join(root, '.github/workflows');
  const workflows = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));

  it.each(workflows)('lists %s', (file) => {
    expect(guide).toContain(file);
  });

  it('only names workflow files that exist', () => {
    const named = [...guide.matchAll(/\b([\w-]+\.ya?ml)\b/g)].map((m) => m[1] as string);
    for (const file of named) expect(workflows).toContain(file);
  });

  it.each(workflows)('names every secret and variable that %s reads', (file) => {
    const source = readFileSync(join(dir, file), 'utf8');
    const names = [...source.matchAll(/\b(?:secrets|vars)\.([A-Z][A-Z0-9_]*)/g)]
      .map((m) => m[1] as string)
      // GITHUB_TOKEN is provided by GitHub; it needs no setup.
      .filter((name) => name !== 'GITHUB_TOKEN');
    for (const name of new Set(names)) expect(guide).toContain(name);
  });

  it('says release.yml is inert until NPM_PUBLISH_ENABLED is set', () => {
    expect(guide).toMatch(/release\.yml[^\n]*NPM_PUBLISH_ENABLED|NPM_PUBLISH_ENABLED[^\n]*release\.yml/);
    expect(guide).toMatch(/inert/i);
  });

  it('says storybook-vercel.yml fails on every push without the Vercel secrets', () => {
    expect(guide).toMatch(/storybook-vercel\.yml/);
    expect(guide).toMatch(/fails on every push/i);
  });
});

describe('starter guide covers the setup steps', () => {
  it.each([
    'Use this template',
    '"name"',
    '"repository"',
    'src/styles/tokens.css',
    '.storybook/themes.ts',
    'theming-guide.md',
    ':root',
    'factory/',
    'roadmap.md',
    'docs/specs/',
    'docs/design-system-wireframe/',
  ])('mentions %s', (text) => {
    expect(guide).toContain(text);
  });
});

describe('starter guide names the tests that an edit turns red', () => {
  const read = (file: string) => readFileSync(join(root, file), 'utf8');

  it.each([
    ['src/theme/createTheme.test.ts', 'matches the non-color defaults in tokens.css'],
    ['src/styles/tokens.test.ts', 'contrast in the %s theme'],
    ['src/themes/bold.test.tsx', 'the shipped dark block in tokens.css (var() refs resolved against :root) passes checkContrast()'],
    ['src/docs/consumerGuide.test.ts', 'consumer guide install'],
  ])('%s: the guide names it, and the test "%s" still exists', (file, title) => {
    expect(guide).toContain(file.split('/').pop() as string);
    expect(read(file)).toContain(title);
  });

  it('lists the phrases that consumerGuide.test.ts requires in the Install section', () => {
    const test = read('src/docs/consumerGuide.test.ts');
    const install = test.slice(test.indexOf("explains today's options"));
    const required = [...install.matchAll(/toContain\('([^']+)'\)/g)].map((m) => m[1] as string);
    expect(required.length).toBeGreaterThan(0);
    for (const phrase of required) expect(guide).toContain(`\`${phrase}\``);
  });

  it('names the defaults file that createTheme.test.ts compares with tokens.css', () => {
    expect(guide).toContain('src/theme/defaults.ts');
    expect(existsSync(join(root, 'src/theme/defaults.ts'))).toBe(true);
  });
});
