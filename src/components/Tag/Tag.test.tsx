import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Badge, Tag } from './Tag';

describe('Tag', () => {
  it('renders solid by default at 28px', () => {
    render(<Tag data-testid="t">New</Tag>);
    expect(screen.getByTestId('t')).toHaveClass('bg-primary', 'h-7', 'px-2.5');
  });

  it.each([
    ['subtle', 'bg-fill'],
    ['outline', 'border-ink'],
    ['neutral', 'border-border'],
  ] as const)('applies the %s variant', (variant, cls) => {
    render(<Tag variant={variant} data-testid="t">X</Tag>);
    expect(screen.getByTestId('t')).toHaveClass(cls);
    expect(screen.getByTestId('t')).not.toHaveClass('bg-primary');
  });

  it('supports the small size and custom className', () => {
    render(<Tag size="sm" className="extra" data-testid="t">X</Tag>);
    expect(screen.getByTestId('t')).toHaveClass('h-6', 'px-2', 'extra');
  });

  it('has no button without onRemove', () => {
    render(<Tag>New</Tag>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('removes via click, Enter and Space', async () => {
    const onRemove = jest.fn();
    const user = userEvent.setup();
    render(<Tag variant="neutral" onRemove={onRemove}>landscape</Tag>);
    const btn = screen.getByRole('button', { name: 'Remove landscape' });
    await user.click(btn);
    await user.tab();
    expect(btn).not.toHaveFocus();
    btn.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onRemove).toHaveBeenCalledTimes(3);
  });

  it('allows a custom remove label', () => {
    render(<Tag onRemove={() => {}} removeLabel="Delete tag">x</Tag>);
    expect(screen.getByRole('button', { name: 'Delete tag' })).toBeInTheDocument();
  });

  it('forwards ref and rest props', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Tag ref={ref} data-foo="bar">X</Tag>);
    expect(ref.current).toHaveAttribute('data-foo', 'bar');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <>
        <Tag>New</Tag>
        <Tag variant="neutral" onRemove={() => {}}>landscape</Tag>
        <Badge count={12} aria-label="12 unread" role="img" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Badge', () => {
  it('renders the count and forwards ref/rest', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref} count={12} data-foo="bar" />);
    expect(screen.getByText('12')).toHaveClass('bg-primary', 'h-5.5', 'min-w-5.5');
    expect(ref.current).toHaveAttribute('data-foo', 'bar');
  });
});
