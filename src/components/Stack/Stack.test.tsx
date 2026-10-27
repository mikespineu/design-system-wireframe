import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Stack } from './Stack';
import { Grid } from '../Grid';

describe('Stack', () => {
  it('renders defaults', () => {
    render(<Stack data-testid="s">x</Stack>);
    const el = screen.getByTestId('s');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('ds-stack');
    expect(el).toHaveAttribute('data-direction', 'vertical');
    expect(el).toHaveAttribute('data-gap', '4');
    expect(el).toHaveAttribute('data-align', 'stretch');
    expect(el).toHaveAttribute('data-justify', 'start');
    expect(el).not.toHaveAttribute('data-wrap');
  });

  it('scalar props render base attribute only', () => {
    render(<Stack data-testid="s" direction="horizontal" gap={8} align="center" justify="between" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('data-direction', 'horizontal');
    expect(el).toHaveAttribute('data-gap', '8');
    expect(el).toHaveAttribute('data-align', 'center');
    expect(el).toHaveAttribute('data-justify', 'between');
    expect(el.getAttributeNames().filter((n) => /-(sm|md|lg)$/.test(n))).toEqual([]);
  });

  it('responsive objects render base (or default) plus given keys', () => {
    render(<Stack data-testid="s" direction={{ md: 'horizontal' }} gap={{ base: 2, sm: 4, lg: 0 }} />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('data-direction', 'vertical');
    expect(el).toHaveAttribute('data-direction-md', 'horizontal');
    expect(el).not.toHaveAttribute('data-direction-sm');
    expect(el).toHaveAttribute('data-gap', '2');
    expect(el).toHaveAttribute('data-gap-sm', '4');
    expect(el).toHaveAttribute('data-gap-lg', '0');
  });

  it('renders data-wrap only when true', () => {
    const { rerender } = render(<Stack data-testid="s" wrap />);
    expect(screen.getByTestId('s')).toHaveAttribute('data-wrap');
    rerender(<Stack data-testid="s" wrap={false} />);
    expect(screen.getByTestId('s')).not.toHaveAttribute('data-wrap');
  });

  it('as renders the tag; lists get role=list unless overridden', () => {
    const { rerender } = render(<Stack as="nav" aria-label="Main" data-testid="s" />);
    expect(screen.getByTestId('s').tagName).toBe('NAV');
    rerender(<Stack as="ul" data-testid="s" />);
    expect(screen.getByTestId('s')).toHaveAttribute('role', 'list');
    rerender(<Stack as="ul" role="menu" data-testid="s" />);
    expect(screen.getByTestId('s')).toHaveAttribute('role', 'menu');
  });

  it('asChild merges onto the child', () => {
    render(
      <Stack asChild gap={2} className="extra" data-testid="s">
        <section className="own" aria-label="s" />
      </Stack>,
    );
    const el = screen.getByTestId('s');
    expect(el.tagName).toBe('SECTION');
    expect(el).toHaveClass('ds-stack', 'extra', 'own');
    expect(el).toHaveAttribute('data-gap', '2');
    expect(el.parentElement).toBe(document.body.firstElementChild);
  });

  it('forwards ref with and without asChild', () => {
    const a = createRef<HTMLElement>();
    const b = createRef<HTMLElement>();
    render(
      <>
        <Stack ref={a} />
        <Stack asChild ref={b}><p /></Stack>
      </>,
    );
    expect(a.current?.tagName).toBe('DIV');
    expect(b.current?.tagName).toBe('P');
  });

  it('tabs through children in DOM order, never focusing itself', async () => {
    const user = userEvent.setup();
    render(
      <Stack direction="horizontal" data-testid="s">
        <button>A</button><button>B</button><button>C</button>
      </Stack>,
    );
    for (const n of ['A', 'B', 'C']) {
      await user.tab();
      expect(screen.getByRole('button', { name: n })).toHaveFocus();
    }
    expect(screen.getByTestId('s')).not.toHaveFocus();
  });

  it('has type-level restrictions', () => {
    // @ts-expect-error gap must be a space step
    render(<Stack gap={5} />);
    // @ts-expect-error direction must be vertical | horizontal
    render(<Stack direction="row" />);
    // @ts-expect-error as and asChild are exclusive
    render(<Stack as="nav" asChild><div /></Stack>);
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <main>
        <Stack as="nav" aria-label="Main">
          <button>One</button>
        </Stack>
        <Stack as="ul"><li>a</li><li>b</li></Stack>
        <Grid as="ol"><li>a</li></Grid>
        <h2 id="h">Title</h2>
        <Grid asChild><section aria-labelledby="h"><Stack><p>x</p></Stack></section></Grid>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
