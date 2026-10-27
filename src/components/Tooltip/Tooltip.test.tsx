import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureAxe } from 'jest-axe';

// Portaled content sits outside landmarks by design.
const axe = configureAxe({ rules: { region: { enabled: false } } });

import { Tooltip, TooltipProvider } from './Tooltip';
import { IconButton } from '../IconButton';
import { InfoIcon } from '../../lib/sampleIcons';

// jsdom has no layout, so Radix marks the tip detached (hideWhenDetached): query with hidden: true.
const trigger = <IconButton icon={InfoIcon} aria-label="Add photo" />;

describe('Tooltip', () => {
  it('is closed by default with no description', () => {
    render(<Tooltip content="Add a photo">{trigger}</Tooltip>);
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby');
  });

  it('opens on keyboard focus and sets aria-describedby', async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Add a photo">{trigger}</Tooltip>);
    await user.tab();
    expect(await screen.findByRole('tooltip', { hidden: true })).toHaveTextContent('Add a photo');
    expect(screen.getByRole('button')).toHaveAttribute('aria-describedby');
    expect(screen.getByRole('button')).toHaveAttribute('data-state', 'instant-open');
  });

  it('closes on Escape and keeps focus on the trigger', async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Add a photo">{trigger}</Tooltip>);
    await user.tab();
    await screen.findByRole('tooltip', { hidden: true });
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('opens on hover after 400 ms and closes on unhover', async () => {
    jest.useFakeTimers();
    try {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<Tooltip content="Add a photo">{trigger}</Tooltip>);
      await user.hover(screen.getByRole('button'));
      act(() => { jest.advanceTimersByTime(399); });
      expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
      act(() => { jest.advanceTimersByTime(1); });
      expect(screen.getByRole('tooltip', { hidden: true })).toBeInTheDocument();
      await user.unhover(screen.getByRole('button'));
      fireEvent.pointerMove(document.body, { clientX: 900, clientY: 900 }); // leave the grace area
      act(() => { jest.runAllTimers(); });
      expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('supports controlled open, side, className and ref', () => {
    const ref = createRef<HTMLDivElement>();
    const onOpenChange = jest.fn();
    render(
      <TooltipProvider>
        <Tooltip content="Hi" open side="right" className="x" ref={ref} onOpenChange={onOpenChange} data-testid="c">
          {trigger}
        </Tooltip>
      </TooltipProvider>,
    );
    const c = screen.getByTestId('c');
    expect(c).toHaveClass('ds-tooltip', 'x');
    expect(c).toHaveAttribute('data-side', 'right');
    expect(ref.current).toBe(c);
  });

  it('has no axe violations closed or open', async () => {
    const closed = render(<Tooltip content="Add a photo">{trigger}</Tooltip>);
    expect(await axe(closed.container)).toHaveNoViolations();
    closed.unmount();
    const open = render(<Tooltip content="Add a photo" defaultOpen>{trigger}</Tooltip>);
    expect(await axe(open.baseElement)).toHaveNoViolations();
  });
});
