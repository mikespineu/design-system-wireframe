import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactElement } from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import * as pkg from './index';
import { Intro, COVERAGE_FLOOR, REPO_URL, families } from './Introduction.stories';
import { storybookThemes } from '../.storybook/themes';
import { themeRoles } from './styles/roles';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const jestConfig = require('../jest.config.cjs') as { coverageThreshold: { global: { lines: number } } };

const root = join(__dirname, '..');
const themes = Object.keys(storybookThemes);
const renderPage = () => render((Intro.render as unknown as () => ReactElement)());
/** Radix selects on focus while an arrow key is held, and moves focus in a timeout, so hold the key. */
const arrow = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.keyboard('{ArrowRight>}');
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });
  await user.keyboard('{/ArrowRight}');
};
const links = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href]'));

/* ---- Storybook ids, built from the story and MDX titles in this repo ---- */
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
/** Storybook's id rule: lower case, runs of other characters become one dash. Export names are split at humps first. */
const sanitize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const storybookIds = () => {
  const ids = new Set<string>();
  for (const file of walk(join(root, 'src'))) {
    const text = readFileSync(file, 'utf8');
    if (file.endsWith('.stories.tsx')) {
      const title = /^ {2}title: (['"])(.+?)\1/m.exec(text)?.[2];
      if (!title) continue;
      if (/['"]autodocs['"]/.test(text)) ids.add(`${sanitize(title)}--docs`);
      for (const [, name] of text.matchAll(/^export const (\w+)\b/gm)) ids.add(`${sanitize(title)}--${sanitize(name!.replace(/([a-z0-9])([A-Z])/g, '$1 $2'))}`);
    } else if (file.endsWith('.mdx')) {
      const title = /<Meta title="([^"]+)"/.exec(text)?.[1];
      if (title) ids.add(`${sanitize(title)}--docs`);
    }
  }
  return ids;
};

describe('Introduction page', () => {
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  describe('structure', () => {
    it('has one main, one h1 and six named bands in order', () => {
      renderPage();
      expect(screen.getAllByRole('main')).toHaveLength(1);
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      const bands = within(screen.getByRole('main')).getAllByRole('region');
      const named = bands.filter((b) => b.tagName === 'SECTION');
      expect(named.map((b) => b.getAttribute('aria-labelledby'))).toEqual(['intro-hero', 'why', 'themes', 'start', 'customize', 'components']);
      expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'intro-hero');
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Accessible React components. Your look, in minutes.');
      for (const id of ['why', 'themes', 'start', 'customize', 'components']) {
        expect(document.getElementById(id)?.tagName).toBe('H2');
      }
    });

    it('never skips a heading level', () => {
      renderPage();
      const levels = screen.getAllByRole('heading').map((h) => Number(h.tagName.slice(1)));
      expect(levels[0]).toBe(1);
      levels.forEach((level, i) => {
        if (i > 0) expect(level - levels[i - 1]!).toBeLessThanOrEqual(1);
      });
    });

    it('computes the facts instead of typing them', () => {
      renderPage();
      const facts = Object.fromEntries(
        screen.getAllByRole('term').map((dt) => [dt.textContent, dt.parentElement?.querySelector('dd')?.textContent]),
      );
      expect(facts).toEqual({
        'Component families': String(families.length),
        'Themes included': String(themes.length),
        'Themeable roles': String(themeRoles.length),
        'Coverage floor': '80 %',
      });
      expect(families).toHaveLength(25);
      expect(themes).toHaveLength(4);
      expect(themeRoles).toHaveLength(87);
    });

    it('keeps the coverage floor constant equal to the jest threshold', () => {
      expect(COVERAGE_FLOOR).toBe(jestConfig.coverageThreshold.global.lines);
    });

    it('lists the four themes in the switcher tip', () => {
      renderPage();
      const tip = screen.getByText('Theme switcher').parentElement!;
      expect(within(tip).getAllByRole('listitem').map((li) => li.textContent)).toEqual(themes);
    });

    it('shows the code sample verbatim from docs/theming-guide/samples/minimal.ts', () => {
      renderPage();
      const sample = screen.getByRole('region', { name: 'Code sample: minimal.ts' });
      expect(sample.tagName).toBe('PRE');
      expect(sample).toHaveAttribute('tabindex', '0');
      expect(sample.textContent).toBe(readFileSync(join(root, 'docs/theming-guide/samples/minimal.ts'), 'utf8'));
      expect(screen.getByText('docs/theming-guide/samples/minimal.ts').tagName).toBe('FIGCAPTION');
    });

    it('marks step numbers and chevrons as decorative', () => {
      const { container } = renderPage();
      expect(screen.getAllByText(/^0[1-3]$/).every((n) => n.getAttribute('aria-hidden') === 'true')).toBe(true);
      expect(container.querySelectorAll('svg:not([aria-hidden="true"])')).toHaveLength(0);
    });
  });

  describe('component list', () => {
    const runtimeExports = Object.keys(pkg).filter((key) => /^[A-Z]/.test(key));
    const listed = families.flatMap((f) => [f.family, ...f.parts]);

    it('fails if an export of src/index.ts is missing from the list', () => {
      const missing = runtimeExports.filter((key) => !listed.includes(key));
      expect(missing).toEqual([]);
    });

    it('fails if a listed family or part is not exported (Toast names a folder)', () => {
      const exported = new Set(Object.keys(pkg));
      const unknown = listed.filter((name) => name !== 'Toast' && !exported.has(name));
      expect(unknown).toEqual([]);
      expect(exported.has('Toast')).toBe(false);
    });

    it('lists no name twice', () => {
      expect(new Set(listed).size).toBe(listed.length);
    });

    it('covers the 40 PascalCase runtime exports', () => {
      expect(runtimeExports).toHaveLength(40);
    });

    it('renders one row per family, grouped, in data order', () => {
      renderPage();
      const section = screen.getByRole('heading', { name: 'Every component' }).closest('section')!;
      const groups = Array.from(new Set(families.map((f) => f.group)));
      expect(groups).toEqual(['Actions', 'Forms', 'Overlays', 'Feedback', 'Navigation', 'Layout', 'Icons']);
      expect(within(section).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(groups);
      const rows = within(section).getAllByRole('link');
      expect(rows).toHaveLength(families.length);
      rows.forEach((row, i) => {
        expect(row).toHaveAttribute('href', `./?path=/docs/${families[i]!.docsId}`);
        expect(row.textContent).toContain(families[i]!.family);
        for (const part of families[i]!.parts) expect(row.textContent).toContain(part);
      });
    });
  });

  describe('links', () => {
    it('opens every Storybook and GitHub link in the top window; the in-page link stays in the frame', () => {
      const { container } = renderPage();
      for (const a of links(container)) {
        if (a.getAttribute('href')!.startsWith('#')) expect(a).not.toHaveAttribute('target');
        else expect(a).toHaveAttribute('target', '_top');
      }
    });

    it('resolves every Storybook id, GitHub path and fragment', () => {
      const { container } = renderPage();
      const ids = storybookIds();
      const hrefs = links(container).map((a) => a.getAttribute('href')!);
      expect(hrefs.length).toBeGreaterThan(families.length);
      const broken: string[] = [];
      for (const href of hrefs) {
        const story = /^\.\/\?path=\/(?:docs|story)\/([a-z0-9-]+)$/.exec(href);
        if (story) {
          if (!ids.has(story[1]!)) broken.push(href);
        } else if (href.startsWith('#')) {
          if (!document.getElementById(href.slice(1))) broken.push(href);
        } else if (href === `${REPO_URL}/generate`) {
          continue;
        } else if (href.startsWith(`${REPO_URL}/blob/main/`)) {
          const path = href.slice(`${REPO_URL}/blob/main/`.length).split('#')[0]!;
          if (!existsSync(join(root, path))) broken.push(href);
        } else {
          broken.push(href);
        }
      }
      expect(broken).toEqual([]);
    });

    it('builds the id set from real titles (sanity check of the helper)', () => {
      const ids = storybookIds();
      expect(ids.has('components-dialog--keyboard')).toBe(true);
      expect(ids.has('foundations-theming-create-your-own-theme--docs')).toBe(true);
      expect(ids.has('components-nope--docs')).toBe(false);
    });

    it('uses the repository from package.json', () => {
      expect(REPO_URL).toBe('https://github.com/mikespineu/design-system-wireframe');
    });

    it('points "Browse components" at the band 6 heading, which is a focus target without a ring', () => {
      renderPage();
      expect(screen.getByRole('link', { name: 'Browse components' })).toHaveAttribute('href', '#components');
      const target = document.getElementById('components')!;
      expect(target).toHaveAttribute('tabindex', '-1');
      expect(target.className).toContain('focus:outline-none');
    });
  });

  describe('theme showcase', () => {
    const panel = () => screen.getByTestId('showcase-panel');

    it('opens on bold inside a default reset wrapper', () => {
      renderPage();
      expect(panel()).toHaveAttribute('data-theme', 'bold');
      expect(panel().parentElement).toHaveAttribute('data-theme', 'default');
      const figure = panel().closest('figure')!;
      expect(figure.querySelector('figcaption')).toHaveTextContent(/^Preview/);
      expect(figure.querySelector('figcaption code')).toHaveTextContent('data-theme="bold"');
      expect(screen.getByRole('radiogroup', { name: 'Preview theme' })).toBeInTheDocument();
      expect(screen.getAllByRole('radio').map((r) => r.getAttribute('aria-label') ?? r.textContent)).toEqual(themes);
    });

    it('retheme the panel with the arrow keys and keeps typed text and switch state', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.type(screen.getByRole('textbox', { name: 'Owner' }), 'Ada');
      await user.click(screen.getByRole('switch', { name: 'Notify the team' }));
      expect(screen.getByRole('switch', { name: 'Notify the team' })).not.toBeChecked();
      act(() => screen.getByRole('radio', { name: 'bold' }).focus());
      await arrow(user);
      expect(panel()).toHaveAttribute('data-theme', 'bold-dark');
      expect(panel().closest('figure')!.querySelector('figcaption code')).toHaveTextContent('data-theme="bold-dark"');
      await arrow(user);
      expect(panel()).toHaveAttribute('data-theme', 'default');
      await arrow(user);
      expect(panel()).toHaveAttribute('data-theme', 'dark');
      expect(panel().parentElement).toHaveAttribute('data-theme', 'default');
      expect(screen.getByRole('textbox', { name: 'Owner' })).toHaveValue('Ada');
      expect(screen.getByRole('switch', { name: 'Notify the team' })).not.toBeChecked();
      expect(document.documentElement).not.toHaveAttribute('data-theme');
    });

    it('holds the stock components from the spec', () => {
      renderPage();
      const p = within(panel());
      expect(p.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
      expect(p.queryAllByRole('link')).toHaveLength(0);
      expect(p.getByRole('heading', { level: 3, name: 'Launch plan' })).toBeInTheDocument();
      for (const tag of ['New', 'Q4', 'Shared']) expect(p.getByText(tag)).toBeInTheDocument();
      expect(p.getByText('Stock parts only: no custom CSS, nothing to restyle by hand.')).toBeInTheDocument();
      expect(p.getByText('Who signs this off?')).toBeInTheDocument();
      expect(p.getByRole('switch', { name: 'Notify the team' })).toBeChecked();
      expect(p.getByRole('status')).toHaveTextContent('SavedYour changes are live.');
      expect(p.getAllByRole('button').map((b) => b.textContent)).toEqual(['Publish', 'Save draft', 'Cancel']);
      for (const b of p.getAllByRole('button')) expect(b).toHaveAttribute('type', 'button');
    });
  });

  describe('keyboard', () => {
    it('tabs through the spec order (51 stops, with the starter guide row)', async () => {
      const user = userEvent.setup();
      renderPage();
      const rowNames = families.map((f) => new RegExp(`^${f.family}`));
      const expected: Array<[string, string | RegExp]> = [
        ['link', 'Use this template'],
        ['link', 'Create your own theme'],
        ['link', 'Browse components'],
        ['link', /^Try the Dialog keyboard story/],
        ['link', /^Read the theming contract/],
        ['link', /^Read the theming guide on GitHub/],
        ['link', /^See the CI workflow on GitHub/],
        ['radio', 'bold'],
        ['link', 'Compare all four side by side'],
        ['textbox', 'Owner'],
        ['switch', 'Notify the team'],
        ['button', 'Publish'],
        ['button', 'Save draft'],
        ['button', 'Cancel'],
        ['link', 'Use this template on GitHub'],
        ['link', 'Contact form pattern'],
        ['link', 'Configurator pattern'],
        ['link', /^Starter guide/],
        ['link', /^Consumer guide/],
        ['link', /^Colors/],
        ['link', /^Typography/],
        ['link', /^Spacing/],
        ['link', /^Shape and line/],
        ['link', 'Follow the step-by-step guide'],
        ['link', 'Apply a theme: consumer guide'],
        ['region', 'Code sample: minimal.ts'],
        ...rowNames.map((name): [string, RegExp] => ['link', name]),
      ];
      expect(expected).toHaveLength(26 + 25);
      for (const [role, name] of expected) {
        await user.tab();
        const active = document.activeElement as HTMLElement;
        expect(active).toHaveRole(role);
        expect(active).toHaveAccessibleName(name);
      }
      await user.tab();
      expect(document.body).toHaveFocus();
    });

    it('uses no positive tabIndex', () => {
      const { container } = renderPage();
      for (const el of Array.from(container.querySelectorAll('[tabindex]'))) {
        expect(Number(el.getAttribute('tabindex'))).toBeLessThanOrEqual(0);
      }
    });

    it('lets the band 6 heading take programmatic focus', () => {
      renderPage();
      const target = document.getElementById('components')!;
      target.focus();
      expect(target).toHaveFocus();
    });
  });

  describe('accessibility', () => {
    it.each(themes)('has no axe violations with data-theme=%s on <html>', async (theme) => {
      document.documentElement.dataset.theme = theme;
      const { container } = renderPage();
      expect(await axe(container)).toHaveNoViolations();
    });

    it.each(themes)('has no axe violations with the showcase set to %s', async (theme) => {
      const user = userEvent.setup();
      const { container } = renderPage();
      const radio = screen.getByRole('radio', { name: theme });
      await user.click(radio);
      expect(radio).toBeChecked();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
