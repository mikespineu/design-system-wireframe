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
    act(() => __handlers.forEach((h) => h({ userGlobals: {} })));
    expect(base()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('default');
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
