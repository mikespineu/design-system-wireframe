import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button } from './Button';

describe('Button', () => {
  it('renders children as a primary button by default', () => {
    render(<Button>Continue</Button>);
    const btn = screen.getByRole('button', { name: 'Continue' });
    expect(btn).toHaveClass('bg-primary', 'h-control', 'rounded-md');
  });

  it.each([
    ['secondary', 'border-ink'],
    ['ghost', 'underline'],
  ] as const)('applies the %s variant', (variant, cls) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass(cls);
    expect(screen.getByRole('button')).not.toHaveClass('bg-primary');
  });

  it('merges custom className', () => {
    render(<Button className="w-full">Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full', 'h-control');
  });

  it('defaults type to "button" and allows override', () => {
    const { rerender } = render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    rerender(<Button type="submit">Go</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Go</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('activates by click, Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    // click already focused it; keyboard activation works on the focused button
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not fire when disabled and is skipped by Tab', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick} disabled>Go</Button>);
    await user.click(screen.getByRole('button'));
    await user.tab();
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).not.toHaveFocus();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders the child element with asChild and no type attribute', () => {
    render(
      <Button asChild variant="secondary">
        <a href="/archive">Archive</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Archive' });
    expect(link).toHaveClass('border-ink', 'h-control');
    expect(link).not.toHaveAttribute('type');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each(['primary', 'secondary', 'ghost'] as const)('has no a11y violations (%s, enabled + disabled)', async (variant) => {
    const { container } = render(
      <>
        <Button variant={variant}>Enabled</Button>
        <Button variant={variant} disabled>Disabled</Button>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
