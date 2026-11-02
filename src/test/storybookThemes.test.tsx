/**
 * DS-64: the Storybook theme switcher is Storybook-only tooling.
 * - the preview registers `withThemeByDataAttribute` for default, dark, bold and bold-dark
 * - every story renders under each theme without console errors
 * - nothing ships: no new component folder, no new export, the addon is a devDependency
 *
 * Stories are composed by hand (args, render, decorators, preview decorators) because Storybook's own
 * composeStories is ESM-only and Jest runs CommonJS. `play` functions are not run here.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { render } from '@testing-library/react';
// Loaded up front: story files reach it through the `storybook/test` stub, and it registers Jest hooks on first import.
import '@testing-library/user-event';
import type { ComponentType, ReactElement } from 'react';
import preview from '../../.storybook/preview';
import { storybookThemes } from '../../.storybook/themes';

jest.mock('@storybook/addon-themes', () => {
  type Config = { themes: Record<string, string>; defaultTheme: string; parentSelector?: string; attributeName?: string };
  const configs: Config[] = [];
  // Miniature of the real decorator: applies data-theme (or `attributeName`) on the parent element.
  const withThemeByDataAttribute = (config: Config) => {
    configs.push(config);
    return (Story: ComponentType, context: { globals: { theme?: string } }) => {
      const name = context.globals.theme ?? config.defaultTheme;
      document
        .querySelector(config.parentSelector ?? 'html')
        ?.setAttribute(config.attributeName ?? 'data-theme', config.themes[name] ?? name);
      return <Story />;
    };
  };
  return { __configs: configs, withThemeByDataAttribute };
});

const root = join(__dirname, '..', '..');
const themes = ['default', 'dark', 'bold', 'bold-dark'] as const;

describe('preview registers the theme switcher', () => {
  const { __configs } = jest.requireMock('@storybook/addon-themes') as {
    __configs: { themes: Record<string, string>; defaultTheme: string; attributeName?: string; parentSelector?: string }[];
  };

  it('registers one withThemeByDataAttribute decorator on data-theme with the four themes', () => {
    expect(__configs).toHaveLength(1);
    const [config] = __configs;
    expect(config?.attributeName).toBe('data-theme');
    expect(config?.defaultTheme).toBe('default');
    expect(Object.keys(config?.themes ?? {})).toEqual([...themes]);
    expect(Object.values(config?.themes ?? {})).toEqual([...themes]);
    expect(config?.themes).toBe(storybookThemes);
    // The default parent is <html>, which keeps docs pages and portaled content on the chosen theme.
    expect(config?.parentSelector).toBeUndefined();
  });

  it('no longer hard-codes data-theme="default" in the preview', () => {
    const source = readFileSync(join(root, '.storybook/preview.tsx'), 'utf8');
    expect(source).not.toContain("setAttribute('data-theme'");
  });

  it('loads the opt-in bold theme CSS and fonts from .storybook only', () => {
    const source = readFileSync(join(root, '.storybook/preview.tsx'), 'utf8');
    expect(source).toContain("'../src/themes/bold.css'");
    expect(source).toContain("'../src/themes/bold-fonts.css'");
    expect(readFileSync(join(root, 'src/index.ts'), 'utf8')).not.toMatch(/themes\/bold/);
  });

  it('registers the addon in main.ts', () => {
    expect(readFileSync(join(root, '.storybook/main.ts'), 'utf8')).toContain('"@storybook/addon-themes"');
  });
});

type Ctx = { args: Record<string, unknown>; globals: { theme: string }; parameters: Record<string, unknown> };
type StoryFn = (args: Record<string, unknown>, ctx: Ctx) => ReactElement;
type Decorator = (Story: ComponentType, ctx: Ctx) => ReactElement;
type StoryObj = { args?: Record<string, unknown>; render?: StoryFn; decorators?: Decorator[] };
type Meta = StoryObj & { component?: ComponentType<Record<string, unknown>>; excludeStories?: RegExp | string[] };

const findStoryFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return findStoryFiles(path);
    return /\.stories\.(t|j)sx?$/.test(name) ? [path] : [];
  });

const storyFiles = findStoryFiles(join(root, 'src')).sort();

const compose = (meta: Meta, story: StoryObj, theme: string): ComponentType | undefined => {
  const args = { ...meta.args, ...story.args };
  const ctx: Ctx = { args, globals: { theme }, parameters: {} };
  const renderFn = story.render ?? meta.render;
  const Component = meta.component;
  if (!renderFn && !Component) return undefined;
  const Base: ComponentType = () => (renderFn ? renderFn(args, ctx) : Component ? <Component {...args} /> : <></>);
  // Later decorators wrap earlier ones: story, then component, then the preview (global).
  const decorators = [...(story.decorators ?? []), ...(meta.decorators ?? []), ...((preview.decorators ?? []) as unknown as Decorator[])];
  return decorators.reduce<ComponentType>((Inner, decorator) => {
    const Wrapped: ComponentType = () => decorator(Inner, ctx);
    return Wrapped;
  }, Base);
};

describe('every story renders in every theme without console errors', () => {
  it('finds the story files', () => {
    expect(storyFiles.length).toBeGreaterThan(30);
  });

  describe.each(storyFiles.map((file) => [relative(join(root, 'src'), file), file]))('%s', (_name, file) => {
    it.each(themes)('under %s', async (theme) => {
      const mod = (await import(file as string)) as Record<string, unknown>;
      const meta = (mod.default ?? {}) as Meta;
      const exclude = meta.excludeStories;
      const stories = Object.entries(mod).filter(
        ([key, value]) =>
          key !== 'default' &&
          typeof value === 'object' &&
          value !== null &&
          !(Array.isArray(exclude) ? exclude.includes(key) : exclude?.test(key)),
      );
      expect(stories.length).toBeGreaterThan(0);

      const problems: string[] = [];
      const spies = (['error', 'warn'] as const).map((level) =>
        jest.spyOn(console, level).mockImplementation((...parts: unknown[]) => {
          problems.push(`console.${level}: ${parts.map(String).join(' ').slice(0, 300)}`);
        }),
      );
      try {
        for (const [key, value] of stories) {
          const Story = compose(meta, value as StoryObj, theme);
          if (!Story) continue;
          const before = problems.length;
          const { unmount } = render(<Story />);
          expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
          unmount();
          if (problems.length > before) problems.splice(before, 0, `story ${key}:`);
        }
      } finally {
        spies.forEach((spy) => spy.mockRestore());
      }
      expect(problems).toEqual([]);
    });
  });
});

describe('the theme switcher ships nothing', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  it('has the addon as a devDependency only', () => {
    expect(pkg.devDependencies).toHaveProperty('@storybook/addon-themes');
    expect(pkg.dependencies ?? {}).not.toHaveProperty('@storybook/addon-themes');
    expect(pkg.peerDependencies ?? {}).not.toHaveProperty('@storybook/addon-themes');
  });

  it('adds no component folder: every folder in src/components is a known component', () => {
    const known = [
      'Alert', 'Breadcrumb', 'Button', 'ButtonGroup', 'Checkbox', 'ChoiceGroup', 'Dialog', 'Drawer', 'Grid', 'Icon',
      'IconButton', 'InfoTip', 'Input', 'Popover', 'RadioGroup', 'SegmentedControl', 'Select', 'Slider', 'Stack',
      'Switch', 'Tabs', 'Tag', 'Textarea', 'TileGroup', 'Toast', 'Tooltip',
    ];
    const folders = readdirSync(join(root, 'src/components')).filter((name) => statSync(join(root, 'src/components', name)).isDirectory());
    expect(folders.sort()).toEqual(known);
  });

  it('keeps the library entry free of Storybook and theme-switcher code', () => {
    const index = readFileSync(join(root, 'src/index.ts'), 'utf8');
    expect(index).not.toMatch(/storybook|\.storybook|Themes|themeSwitcher/i);
  });

  it('ships only dist, and the library build has no Storybook input', () => {
    const published = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { files?: string[] };
    expect(published.files).toEqual(['dist']);
    const lib = readFileSync(join(root, 'vite.lib.config.ts'), 'utf8');
    expect(lib).toContain("new URL('./src/index.ts'");
    expect(lib).not.toMatch(/import .*storybook/i);
  });
});
