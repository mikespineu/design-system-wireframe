import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const libs = ['lucide-react', '@tabler/icons-react', '@phosphor-icons/react', '@heroicons/react'];
const root = process.cwd();
const dist = join(root, 'dist');

describe('icon libraries packaging', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

  it.each(libs)('%s is a devDependency only', (lib) => {
    expect(pkg.devDependencies).toHaveProperty(lib);
    expect(pkg.dependencies ?? {}).not.toHaveProperty(lib);
    expect(pkg.peerDependencies ?? {}).not.toHaveProperty(lib);
  });

  // Needs `npm run build` first; skipped when dist/ is absent.
  (existsSync(dist) ? it.each(libs) : it.skip.each(libs))('dist/ does not include %s', (lib) => {
    const files = (readdirSync(dist, { recursive: true }) as string[]).filter((f) => /\.(js|ts|css)$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) expect(readFileSync(join(dist, f), 'utf8')).not.toContain(lib);
  });
});
