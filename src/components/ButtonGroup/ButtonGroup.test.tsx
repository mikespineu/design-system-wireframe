import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { ButtonGroup } from './ButtonGroup';
import { HeartFilledIcon, HeartIcon } from '../../lib/sampleIcons';

const Group = (props: { attached?: boolean; disabled?: boolean }) => (
  <ButtonGroup aria-label="Product actions" {...props}>
    <Button>Add to cart</Button>
    <IconButton
      icon={HeartIcon}
      pressedIcon={HeartFilledIcon}
      aria-label="Add to wishlist"
      defaultPressed={false}
    />
  </ButtonGroup>
);

describe('ButtonGroup', () => {
  it('renders a named group with role=group', () => {
    render(<Group />);
    expect(screen.getByRole('group', { name: 'Product actions' })).toHaveClass('ds-button-group');
  });

  it('supports aria-labelledby and forwards ref and props', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <>
        <span id="l">Actions</span>
        <ButtonGroup ref={ref} aria-labelledby="l" data-x="1" className="extra">
          <Button>A</Button>
        </ButtonGroup>
      </>,
    );
    const g = screen.getByRole('group', { name: 'Actions' });
    expect(ref.current).toBe(g);
    expect(g).toHaveAttribute('data-x', '1');
    expect(g).toHaveClass('extra');
  });

  it('is spaced by default and sets data-attached when attached', () => {
    const { rerender } = render(<Group />);
    expect(screen.getByRole('group')).not.toHaveAttribute('data-attached');
    rerender(<Group attached />);
    expect(screen.getByRole('group')).toHaveAttribute('data-attached');
  });

  it('disables every child when disabled', () => {
    render(<Group disabled />);
    expect(screen.getByRole('group')).toHaveAttribute('data-disabled');
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add to wishlist' })).toBeDisabled();
  });

  it('disabled group wins over a loading child', () => {
    render(
      <ButtonGroup aria-label="g" disabled>
        <Button loading>Save</Button>
      </ButtonGroup>,
    );
    const b = screen.getByRole('button', { name: 'Save' });
    expect(b).toBeDisabled();
    expect(b).not.toHaveAttribute('aria-busy');
  });

  it('leaves children enabled by default', () => {
    render(<Group />);
    expect(screen.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
  });

  it('Tab moves through each button in DOM order; arrows do nothing', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Group />
        <button>After</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Add to cart' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Add to cart' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Add to wishlist' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Add to wishlist' })).toHaveFocus();
  });

  it('keeps a loading child in the tab order', async () => {
    const user = userEvent.setup();
    render(
      <ButtonGroup aria-label="g">
        <Button loading>Save</Button>
        <Button>Other</Button>
      </ButtonGroup>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Other' })).toHaveFocus();
  });

  it('wishlist toggle works with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Group />);
    await user.tab();
    await user.tab();
    const heart = screen.getByRole('button', { name: 'Add to wishlist' });
    expect(heart).toHaveAttribute('aria-pressed', 'false');
    await user.keyboard('{Enter}');
    expect(heart).toHaveAttribute('aria-pressed', 'true');
  });

  it.each([false, true])('has no a11y violations (attached=%s)', async (attached) => {
    const { container } = render(<Group attached={attached} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no a11y violations when disabled', async () => {
    const { container } = render(<Group disabled />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
