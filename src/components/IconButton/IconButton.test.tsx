import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { IconButton } from './IconButton';
import { CloseIcon, PlusIcon, SearchIcon } from '../../lib/sampleIcons';

describe('IconButton', () => {
  it('renders a labeled square button with an 18px icon', () => {
    render(<IconButton icon={PlusIcon} aria-label="Add" />);
    const btn = screen.getByRole('button', { name: 'Add' });
    expect(btn).toHaveClass('h-control', 'w-11', 'border-ink', 'rounded-md');
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
    expect(link).toHaveClass('h-control', 'border-ink');
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
});

// @ts-expect-error aria-label is required
void (() => <IconButton icon={PlusIcon} />);
