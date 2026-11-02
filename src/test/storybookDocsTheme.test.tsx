/**
 * DS-64: docs pages follow the toolbar theme (Storybook-only). Storybook's ESM-only modules are mocked;
 * the container logic and the docs CSS are what is under test.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { ThemedDocsContainer } from '../../.storybook/ThemedDocsContainer';
import preview from '../../.storybook/preview';
import { inheritedTheme, themeFromGlobalsParam } from '../../.storybook/themes';

type Handler = (payload: { userGlobals?: { theme?: unknown } }) => void;

jest.mock('@storybook/addon-themes', () => ({ withThemeByDataAttribute: () => (Story: () => unknown) => Story() }));
jest.mock(
  '@storybook/addon-docs/blocks',
  () => ({
    DocsContainer: ({ theme, children }: { theme: { base: string }; children: ReactNode }) => (
      <div data-testid="docs" data-base={theme.base}>
        {children}
      </div>
    ),
  }),
  { virtual: true },
);
jest.mock('storybook/theming', () => ({ themes: { dark: { base: 'dark' }, light: { base: 'light' } } }), { virtual: true });
jest.mock('storybook/internal/core-events', () => ({ GLOBALS_UPDATED: 'globalsUpdated' }), { virtual: true });
jest.mock(
  'storybook/preview-api',
  () => {
    const handlers = new Set<Handler>();
    const channel = {
      on: (_event: string, handler: Handler) => handlers.add(handler),
      off: (_event: string, handler: Handler) => handlers.delete(handler),
    };
    return { addons: { getChannel: () => channel }, __handlers: handlers };
  },
  { virtual: true },
);

const { __handlers } = jest.requireMock('storybook/preview-api') as { __handlers: Set<Handler> };
const props = { context: {} } as unknown as Omit<ComponentProps<typeof ThemedDocsContainer>, 'children'>;
const base = () => screen.getByTestId('docs').getAttribute('data-base');

const withGlobals = (globals: string) => window.history.replaceState({}, '', `/iframe.html?viewMode=docs${globals}`);

describe('ThemedDocsContainer', () => {
  afterEach(() => {
    withGlobals('');
    document.documentElement.removeAttribute('data-theme');
  });

  it('is the docs container of the preview', () => {
    expect(preview.parameters?.docs?.container).toBe(ThemedDocsContainer);
  });

  it.each([
    ['default', 'light'],
    ['dark', 'dark'],
    ['bold', 'light'],
    ['bold-dark', 'dark'],
  ])('uses the %s toolbar choice from the URL: Storybook docs blocks in their %s theme, data-theme on html', (theme, expected) => {
    withGlobals(`&globals=theme:${theme}`);
    render(<ThemedDocsContainer {...props}>page</ThemedDocsContainer>);
    expect(base()).toBe(expected);
    expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
  });

  it('seeds from the current globals of the docs context, not only the URL (the container remounts on every docs render)', () => {
    withGlobals('');
    const context = { store: { userGlobals: { get: () => ({ theme: 'bold-dark' }) } } };
    render(<ThemedDocsContainer {...props} context={context as never}>page</ThemedDocsContainer>);
    expect(base()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('bold-dark');
  });

  it('prefers the context globals over a stale URL param, and falls back to the URL when the context has no theme', () => {
    withGlobals('&globals=theme:dark');
    const { unmount } = render(
      <ThemedDocsContainer {...props} context={{ store: { userGlobals: { get: () => ({ theme: 'bold' }) } } } as never}>page</ThemedDocsContainer>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('bold');
    unmount();
    render(
      <ThemedDocsContainer {...props} context={{ store: { userGlobals: { get: () => ({ theme: '' }) } } } as never}>page</ThemedDocsContainer>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('sets no initial theme outside an embedding docs page, so the toolbar default applies', () => {
    expect(preview.initialGlobals).toBeUndefined();
  });

  it('falls back to default for a missing or unknown theme', () => {
    withGlobals('&globals=theme:nope');
    render(<ThemedDocsContainer {...props}>page</ThemedDocsContainer>);
    expect(base()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('default');
  });

  it('follows the toolbar when it changes, including on pages with no story', () => {
    render(<ThemedDocsContainer {...props}>page</ThemedDocsContainer>);
    expect(__handlers.size).toBe(1);
    act(() => __handlers.forEach((h) => h({ userGlobals: { theme: 'bold-dark' } })));
    expect(base()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('bold-dark');
    act(() => __handlers.forEach((h) => h({ userGlobals: { theme: 'default' } })));
    expect(base()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('default');
  });

  it.each([[''], [undefined], ['nope'], [42]])(
    'ignores globals with theme %p, such as the ones an inline:false story iframe reports at start',
    (reported) => {
      withGlobals('&globals=theme:bold-dark');
      render(<ThemedDocsContainer {...props}>page</ThemedDocsContainer>);
      act(() => __handlers.forEach((h) => h({ userGlobals: { theme: reported } })));
      expect(base()).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('bold-dark');
    },
  );

  it('carries the theme into the story iframes of inline:false stories, on load and on every change', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    withGlobals('&globals=theme:bold');
    render(<ThemedDocsContainer {...props}>page</ThemedDocsContainer>);
    const inner = () => frame.contentDocument?.documentElement.getAttribute('data-theme');
    expect(inner()).toBe('bold');
    act(() => __handlers.forEach((h) => h({ userGlobals: { theme: 'dark' } })));
    expect(inner()).toBe('dark');
    frame.remove();
  });

  it('stops listening when it unmounts', () => {
    const { unmount } = render(<ThemedDocsContainer {...props}>page</ThemedDocsContainer>);
    unmount();
    expect(__handlers.size).toBe(0);
  });
});

describe('docs-theme.css', () => {
  const css = readFileSync(join(__dirname, '../../.storybook/docs-theme.css'), 'utf8');

  it('paints the docs page, canvas and story frames from the active theme roles, not white', () => {
    for (const selector of ['.sbdocs-wrapper', '.sbdocs-preview', '.docs-story']) expect(css).toContain(selector);
    expect(css).toContain('background: var(--ds-color-background)');
    expect(css).toContain('color: var(--ds-color-text)');
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(/i);
  });

  it('is loaded from the preview only', () => {
    expect(readFileSync(join(__dirname, '../../.storybook/preview.tsx'), 'utf8')).toContain("'./docs-theme.css'");
  });
});

describe('themeFromGlobalsParam', () => {
  it.each([
    ['theme:dark', 'dark'],
    ['measureEnabled:!true;theme:bold-dark', 'bold-dark'],
    ['theme:nope', undefined],
    ['theme:', undefined],
    ['', undefined],
    [null, undefined],
  ])('%p gives %p', (param, expected) => {
    expect(themeFromGlobalsParam(param)).toBe(expected);
  });
});

describe('inheritedTheme: the story iframe of an inline:false story takes the docs page theme', () => {
  const embedded = (search: string, live: string | null) => {
    const self = {} as Window;
    const parent = {
      location: { search },
      document: { documentElement: { getAttribute: () => live } },
      parent: {},
    } as unknown as Window;
    Object.assign(self, { parent });
    return self;
  };

  it('uses the docs page live data-theme first', () => {
    expect(inheritedTheme(embedded('?viewMode=docs&globals=theme:dark', 'bold-dark'))).toBe('bold-dark');
  });

  it('falls back to the docs page URL globals before its theme is applied', () => {
    expect(inheritedTheme(embedded('?viewMode=docs&globals=theme:bold', null))).toBe('bold');
    expect(inheritedTheme(embedded('?viewMode=docs&globals=theme:bold', 'nope'))).toBe('bold');
  });

  it('inherits nothing when the parent is not a docs page (the manager, a plain story frame)', () => {
    expect(inheritedTheme(embedded('?path=/story/x&globals=theme:bold', 'bold'))).toBeUndefined();
    expect(inheritedTheme(embedded('?viewMode=story&globals=theme:bold', 'bold'))).toBeUndefined();
  });

  it('inherits nothing when not embedded or when the parent is cross-origin', () => {
    const top = {} as Window;
    Object.assign(top, { parent: top });
    expect(inheritedTheme(top)).toBeUndefined();
    const blocked = {
      get parent() {
        return {
          get location(): never {
            throw new DOMException('Blocked a frame', 'SecurityError');
          },
        };
      },
    } as unknown as Window;
    expect(inheritedTheme(blocked)).toBeUndefined();
  });
});
