import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders defaults', () => {
    render(<Grid data-testid="g" />);
    const el = screen.getByTestId('g');
    expect(el).toHaveClass('ds-grid');
    expect(el).toHaveAttribute('data-columns', '1');
    expect(el).toHaveAttribute('data-gap', '6');
    expect(el).toHaveAttribute('data-align', 'stretch');
  });

  it('renders responsive columns', () => {
    render(<Grid data-testid="g" columns={{ base: 1, md: 3, lg: 12 }} gap={{ sm: 2 }} align="end" />);
    const el = screen.getByTestId('g');
    expect(el).toHaveAttribute('data-columns', '1');
    expect(el).toHaveAttribute('data-columns-md', '3');
    expect(el).toHaveAttribute('data-columns-lg', '12');
    expect(el).toHaveAttribute('data-gap', '6');
    expect(el).toHaveAttribute('data-gap-sm', '2');
    expect(el).toHaveAttribute('data-align', 'end');
  });

  it('as / role / asChild / ref', () => {
    const ref = createRef<HTMLElement>();
    const { rerender } = render(<Grid as="ol" ref={ref} data-testid="g" />);
    expect(screen.getByTestId('g')).toHaveAttribute('role', 'list');
    expect(ref.current).toBe(screen.getByTestId('g'));
    rerender(<Grid asChild ref={ref} className="x" data-testid="g"><ul className="own" /></Grid>);
    const el = screen.getByTestId('g');
    expect(el.tagName).toBe('UL');
    expect(el).not.toHaveAttribute('role');
    expect(el).toHaveClass('ds-grid', 'x', 'own');
    expect(ref.current).toBe(el);
  });

  it('tabs through six links in DOM order', async () => {
    const user = userEvent.setup();
    render(
      <Grid columns={3} data-testid="g">
        {[1, 2, 3, 4, 5, 6].map((n) => <a key={n} href={`#${n}`}>L{n}</a>)}
      </Grid>,
    );
    for (let n = 1; n <= 6; n++) {
      await user.tab();
      expect(screen.getByRole('link', { name: `L${n}` })).toHaveFocus();
    }
    expect(screen.getByTestId('g')).not.toHaveFocus();
  });

  it('has type-level restrictions', () => {
    // @ts-expect-error columns must be 1|2|3|4|6|12
    render(<Grid columns={5} />);
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Grid><p>a</p><p>b</p></Grid>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
