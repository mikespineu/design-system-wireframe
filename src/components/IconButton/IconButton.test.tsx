import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Plus as LucidePlus } from 'lucide-react';
import { IconButton } from './IconButton';
import { CloseIcon, PlusIcon, SearchIcon, HeartIcon, HeartFilledIcon } from '../../lib/sampleIcons';

describe('IconButton', () => {
  it('renders a labeled square button with an 18px icon', () => {
    render(<IconButton icon={PlusIcon} aria-label="Add" />);
    const btn = screen.getByRole('button', { name: 'Add' });
    expect(btn).toHaveClass('h-control', 'w-11', 'border-strong', 'rounded-md');
    expect(btn).toHaveAttribute('type', 'button');
    const svg = btn.querySelector('svg');
    expect(svg).toHaveAttribute('width', '18');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges custom className and allows type override', () => {
    render(<IconButton icon={CloseIcon} aria-label="Close" className="mt-2" type="submit" />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('mt-2', 'h-control');
    expect(btn).toHaveAttribute('type', 'submit');
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} icon={PlusIcon} aria-label="Add" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('activates by click, Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<IconButton icon={PlusIcon} aria-label="Add" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not fire when disabled and is skipped by Tab', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<IconButton icon={PlusIcon} aria-label="Add" onClick={onClick} disabled />);
    await user.click(screen.getByRole('button'));
    await user.tab();
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).not.toHaveFocus();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders the child element with asChild, keeping the icon inside', () => {
    render(
      <IconButton asChild icon={SearchIcon} aria-label="Search">
        <a href="/search" />
      </IconButton>,
    );
    const link = screen.getByRole('link', { name: 'Search' });
    expect(link).toHaveClass('h-control', 'border-strong');
    expect(link).not.toHaveAttribute('type');
    expect(link.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has no a11y violations (enabled + disabled)', async () => {
    const { container } = render(
      <>
        <IconButton icon={PlusIcon} aria-label="Add" />
        <IconButton icon={PlusIcon} aria-label="Add disabled" disabled />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('plain action has no aria-pressed', () => {
    render(<IconButton icon={PlusIcon} aria-label="Add" />);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
  });

  it.each(['primary', 'secondary', 'ghost'] as const)('applies the %s variant', (variant) => {
    render(<IconButton icon={PlusIcon} aria-label="Add" variant={variant} />);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant);
  });

  describe('toggle', () => {
    it('is controlled and swaps to pressedIcon, keeping aria-label', async () => {
      const user = userEvent.setup();
      const onPressedChange = jest.fn();
      const { rerender } = render(
        <IconButton icon={HeartIcon} pressedIcon={HeartFilledIcon} aria-label="Add to wishlist" pressed={false} onPressedChange={onPressedChange} />,
      );
      const btn = screen.getByRole('button', { name: 'Add to wishlist' });
      expect(btn).toHaveAttribute('aria-pressed', 'false');
      expect(btn.querySelector('[data-testid="outline"]')).toBeInTheDocument();
      await user.click(btn);
      expect(onPressedChange).toHaveBeenCalledWith(true);
      rerender(
        <IconButton icon={HeartIcon} pressedIcon={HeartFilledIcon} aria-label="Add to wishlist" pressed onPressedChange={onPressedChange} />,
      );
      expect(btn).toHaveAttribute('aria-pressed', 'true');
      expect(btn).toHaveAttribute('data-state', 'on');
      expect(btn.querySelector('[data-testid="filled"]')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add to wishlist' })).toBe(btn);
    });

    it('is uncontrolled with defaultPressed; click, Enter and Space toggle', async () => {
      const user = userEvent.setup();
      const onPressedChange = jest.fn();
      render(<IconButton icon={HeartIcon} pressedIcon={HeartFilledIcon} aria-label="Wish" defaultPressed onPressedChange={onPressedChange} />);
      const btn = screen.getByRole('button');
      expect(btn).toHaveAttribute('aria-pressed', 'true');
      await user.click(btn);
      expect(btn).toHaveAttribute('aria-pressed', 'false');
      await user.keyboard('{Enter}');
      expect(btn).toHaveAttribute('aria-pressed', 'true');
      await user.keyboard(' ');
      expect(btn).toHaveAttribute('aria-pressed', 'false');
      expect(onPressedChange).toHaveBeenCalledTimes(3);
    });

    it('shows the same icon when no pressedIcon is given', () => {
      render(<IconButton icon={HeartIcon} aria-label="Wish" variant="secondary" defaultPressed />);
      expect(screen.getByRole('button').querySelector('[data-testid="outline"]')).toBeInTheDocument();
    });

    it('warns for a primary toggle without pressedIcon', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      render(<IconButton icon={HeartIcon} aria-label="Wish" variant="primary" defaultPressed />);
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('loading', () => {
    it('sets aria-busy, keeps name and renders a spinner', () => {
      render(<IconButton icon={PlusIcon} aria-label="Add" loading />);
      const btn = screen.getByRole('button', { name: 'Add' });
      expect(btn).toHaveAttribute('aria-busy', 'true');
      expect(btn).toHaveAttribute('aria-disabled', 'true');
      expect(btn).not.toBeDisabled();
      expect(btn.querySelector('[data-spinner]')).toHaveAttribute('aria-hidden', 'true');
      expect(btn.querySelectorAll('svg')).toHaveLength(2);
    });

    it('blocks onClick and toggling, keeps aria-pressed', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      const onPressedChange = jest.fn();
      render(<IconButton icon={HeartIcon} aria-label="Wish" loading onClick={onClick} defaultPressed={false} onPressedChange={onPressedChange} />);
      const btn = screen.getByRole('button');
      await user.click(btn);
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(onClick).not.toHaveBeenCalled();
      expect(onPressedChange).not.toHaveBeenCalled();
      expect(btn).toHaveAttribute('aria-pressed', 'false');
    });

    it('disabled wins over loading', () => {
      render(<IconButton icon={PlusIcon} aria-label="Add" loading disabled />);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn).not.toHaveAttribute('aria-busy');
    });
  });

  it('accepts a library icon', () => {
    render(<IconButton icon={LucidePlus} aria-label="Add" />);
    expect(screen.getByRole('button').querySelector('svg')).toHaveAttribute('width', '18');
  });

  it.each(['primary', 'secondary', 'ghost'] as const)('has no a11y violations (%s: plain, disabled, loading, toggles, link)', async (variant) => {
    const { container } = render(
      <>
        <IconButton variant={variant} icon={PlusIcon} aria-label="Plain" />
        <IconButton variant={variant} icon={PlusIcon} aria-label="Disabled" disabled />
        <IconButton variant={variant} icon={PlusIcon} aria-label="Loading" loading />
        <IconButton variant={variant} icon={HeartIcon} pressedIcon={HeartFilledIcon} aria-label="Off" pressed={false} />
        <IconButton variant={variant} icon={HeartIcon} pressedIcon={HeartFilledIcon} aria-label="On" pressed />
        <IconButton variant={variant} icon={HeartIcon} aria-label="On no icon" defaultPressed />
        <IconButton variant={variant} icon={HeartIcon} pressedIcon={HeartFilledIcon} aria-label="On disabled" pressed disabled />
        <IconButton variant={variant} asChild icon={SearchIcon} aria-label="Search"><a href="/s" /></IconButton>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// @ts-expect-error aria-label is required
void (() => <IconButton icon={PlusIcon} />);
