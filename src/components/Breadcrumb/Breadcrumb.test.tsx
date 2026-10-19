import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Breadcrumb, BreadcrumbLink } from './Breadcrumb';

const items = [{ label: 'Archive', href: '/archive' }, { label: '2026', href: '/2026' }, { label: 'Coastline' }];

describe('Breadcrumb', () => {
  it('renders nav landmark with ordered list', () => {
    render(<Breadcrumb items={items} />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toHaveClass('h-control');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('marks last item as current page and not a link', () => {
    render(<Breadcrumb items={items} />);
    const current = screen.getByText('Coastline');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Coastline' })).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('hides separators from assistive tech', () => {
    const { container } = render(<Breadcrumb items={items} />);
    const seps = container.querySelectorAll('[aria-hidden="true"]');
    expect(seps).toHaveLength(2);
    seps.forEach((s) => expect(s).toHaveTextContent('/'));
  });

  it('renders non-last items without href as text', () => {
    render(<Breadcrumb items={[{ label: 'A' }, { label: 'B' }]} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('tabs through links only, with focus ring class', async () => {
    const user = userEvent.setup();
    render(<Breadcrumb items={items} />);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Archive' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Archive' })).toHaveClass('focus-visible:focus-ring');
    await user.tab();
    expect(screen.getByRole('link', { name: '2026' })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('supports a custom link renderer', () => {
    render(<Breadcrumb items={items} renderLink={(i) => <a data-custom href={`/x${i.href}`} />} />);
    const link = screen.getByRole('link', { name: 'Archive' });
    expect(link).toHaveAttribute('data-custom');
    expect(link).toHaveAttribute('href', '/x/archive');
    expect(link).toHaveClass('text-muted');
  });

  it('BreadcrumbLink supports asChild', () => {
    render(
      <BreadcrumbLink asChild>
        <a href="/a">Go</a>
      </BreadcrumbLink>,
    );
    expect(screen.getByRole('link', { name: 'Go' })).toHaveClass('text-muted');
  });

  it('forwards ref, className and rest props', () => {
    const ref = createRef<HTMLElement>();
    render(<Breadcrumb ref={ref} items={items} className="w-full" data-testid="bc" />);
    expect(ref.current).toBe(screen.getByTestId('bc'));
    expect(ref.current).toHaveClass('w-full', 'h-control');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Breadcrumb items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
