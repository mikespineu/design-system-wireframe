import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const guide = readFileSync(join(root, 'docs/consumer-guide.md'), 'utf8');
const readme = readFileSync(join(root, 'README.md'), 'utf8');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  name: string;
  exports: Record<string, unknown>;
};

describe('consumer guide', () => {
  it('is linked from the README', () => {
    expect(readme).toContain('(docs/consumer-guide.md)');
  });

  it('only imports package paths that package.json exports', () => {
    const re = new RegExp(`from '${pkg.name}(/[^']*)?'|import '${pkg.name}(/[^']*)?'`, 'g');
    const subpaths = [...guide.matchAll(re)].map((m) => `.${m[1] ?? m[2] ?? ''}`);
    expect(subpaths.length).toBeGreaterThan(0);
    for (const sub of subpaths) expect(Object.keys(pkg.exports)).toContain(sub);
  });

  it('covers CSS, components and theming', () => {
    for (const heading of ['## Import the CSS', '## Use components', '## Apply a theme']) {
      expect(guide).toContain(heading);
    }
    expect(guide).toContain('data-theme');
  });
});

describe('consumer guide exported components', () => {
  it('lists only names that src/index.ts really exports', async () => {
    const line = guide.split('\n').find((l) => l.startsWith('Exported components:')) ?? '';
    const names = [...line.matchAll(/`(\w+)`/g)].map((m) => m[1] as string);
    expect(names.length).toBeGreaterThan(0);
    const api = (await import('../index')) as Record<string, unknown>;
    for (const name of names) expect(api).toHaveProperty(name);
  });
});
