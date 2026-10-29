import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { PlusIcon, SearchIcon } from '../../lib/sampleIcons';


describe('Button', () => {
  it('renders children as a primary button by default', () => {
    render(<Button>Continue</Button>);
    const btn = screen.getByRole('button', { name: 'Continue' });
    expect(btn).toHaveClass('bg-primary', 'h-control', 'rounded-md');
  });

  it.each([
    ['secondary', 'border-strong'],
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
    expect(link).toHaveClass('border-strong', 'h-control');
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

  describe('icons', () => {
    it('renders leading and trailing createIcon icons at 16px, aria-hidden, around the label', () => {
      render(<Button leadingIcon={PlusIcon} trailingIcon={SearchIcon}>Add</Button>);
      const btn = screen.getByRole('button', { name: 'Add' });
      const svgs = btn.querySelectorAll('svg');
      expect(svgs).toHaveLength(2);
      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute('width', '16');
        expect(svg).toHaveAttribute('aria-hidden', 'true');
      });
      expect(btn.firstElementChild).toBe(svgs[0]);
      expect(btn.lastElementChild).toBe(svgs[1]);
    });

    it('accepts an icon from a library (lucide-react)', () => {
      render(<Button leadingIcon={Plus} trailingIcon={ArrowRight}>Add</Button>);
      const btn = screen.getByRole('button', { name: 'Add' });
      expect(btn.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
    });

    it('keeps icons and label with asChild', () => {
      render(
        <Button asChild leadingIcon={PlusIcon}>
          <a href="/x">Go</a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'Go' });
      expect(link.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('loading', () => {
    it('sets aria-busy, aria-disabled and data-loading, keeps name and content, renders a hidden spinner', () => {
      render(<Button loading leadingIcon={PlusIcon}>Add to cart</Button>);
      const btn = screen.getByRole('button', { name: 'Add to cart' });
      expect(btn).toHaveAttribute('aria-busy', 'true');
      expect(btn).toHaveAttribute('aria-disabled', 'true');
      expect(btn).toHaveAttribute('data-loading');
      expect(btn).not.toBeDisabled();
      expect(btn).toHaveTextContent('Add to cart');
      const spinner = btn.querySelector('[data-spinner]');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('blocks click, Enter and Space', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<Button loading onClick={onClick}>Go</Button>);
      await user.click(screen.getByRole('button'));
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not submit a form', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn((e) => e.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <Button type="submit" loading>Send</Button>
        </form>,
      );
      await user.click(screen.getByRole('button'));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('stays focusable, and Tab moves past it', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Button loading>One</Button>
          <Button>Two</Button>
        </>,
      );
      await user.tab();
      expect(screen.getByRole('button', { name: 'One' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
    });

    it('keeps focus when loading starts', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Button>Go</Button>);
      await user.tab();
      rerender(<Button loading>Go</Button>);
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('disabled wins over loading', () => {
      render(<Button loading disabled>Go</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn).not.toHaveAttribute('aria-busy');
      expect(btn).not.toHaveAttribute('data-loading');
      expect(btn.querySelector('[data-spinner]')).not.toBeInTheDocument();
    });

    it('blocks navigation of an asChild link', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(
        <Button asChild loading onClick={onClick}>
          <a href="#x">Go</a>
        </Button>,
      );
      await user.click(screen.getByRole('link'));
      expect(onClick).not.toHaveBeenCalled();
      expect(screen.getByRole('link')).toHaveAttribute('aria-busy', 'true');
    });
  });

  it.each(['primary', 'secondary', 'ghost'] as const)('has no a11y violations with icons, loading and link (%s)', async (variant) => {
    const { container } = render(
      <>
        <Button variant={variant} leadingIcon={PlusIcon}>Lead</Button>
        <Button variant={variant} trailingIcon={PlusIcon}>Trail</Button>
        <Button variant={variant} leadingIcon={PlusIcon} trailingIcon={SearchIcon}>Both</Button>
        <Button variant={variant} loading>Loading</Button>
        <Button variant={variant} asChild leadingIcon={PlusIcon}><a href="/x">Link</a></Button>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
