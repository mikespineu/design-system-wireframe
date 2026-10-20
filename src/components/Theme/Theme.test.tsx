import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../Button';
import { Theme, applyTheme, defaultTheme, themes } from './Theme';

describe('Theme', () => {
  it('renders a div with the default theme', () => {
    render(<Theme data-testid="t">Content</Theme>);
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveAttribute('data-theme', 'wireframe');
    expect(defaultTheme).toBe('wireframe');
  });

  it('applies the given theme', () => {
    render(<Theme theme="wireframe" data-testid="t" />);
    expect(screen.getByTestId('t')).toHaveAttribute('data-theme', 'wireframe');
  });

  it('applies the theme to the child with asChild', () => {
    render(
      <Theme asChild>
        <section aria-label="Panel">Content</section>
      </Theme>,
    );
    const section = screen.getByRole('region', { name: 'Panel' });
    expect(section).toHaveAttribute('data-theme', 'wireframe');
    expect(section.parentElement).not.toHaveAttribute('data-theme');
  });

  it('forwards ref and rest props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Theme ref={ref} className="extra" data-foo="bar" />);
    expect(ref.current).toHaveClass('extra');
    expect(ref.current).toHaveAttribute('data-foo', 'bar');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <Theme>
        <Button>Continue</Button>
      </Theme>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('applyTheme', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('sets data-theme on <html> by default', () => {
    applyTheme('wireframe');
    expect(document.documentElement).toHaveAttribute('data-theme', 'wireframe');
  });

  it('sets data-theme on a given root', () => {
    const root = document.createElement('div');
    applyTheme('wireframe', root);
    expect(root).toHaveAttribute('data-theme', 'wireframe');
  });
});

describe('tokens.css', () => {
  const css = readFileSync(join(__dirname, '../../styles/tokens.css'), 'utf8');

  it.each(themes)('defines a block for the %s theme', (name) => {
    expect(css).toContain(`[data-theme='${name}']`);
  });

  it('applies the default theme at :root', () => {
    expect(css).toMatch(new RegExp(`:root,\\s*\\[data-theme='${defaultTheme}'\\]`));
  });
});
