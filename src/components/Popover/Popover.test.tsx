import { createRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Popover } from './Popover';
import { Button } from '../Button';

describe('Popover', () => {
  it('opens on click and Enter, named by title', async () => {
    const user = userEvent.setup();
    render(<Popover trigger={<Button>Open</Button>} title="Details">Body text</Popover>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveTextContent('Body text');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    screen.getByRole('button', { name: 'Open' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('is named by aria-label and focuses the panel when nothing is focusable', async () => {
    const user = userEvent.setup();
    render(<Popover trigger={<Button>Open</Button>} aria-label="About billing">Text only</Popover>);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'About billing' });
    await waitFor(() => expect(dialog).toHaveFocus());
  });

  it('focuses the first focusable inside, wraps with Tab, Esc returns focus to trigger', async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<Button>Open</Button>} title="Form" showClose>
        <button>One</button>
        <button>Two</button>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'One' })).toHaveFocus());
    await user.tab();
    expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'One' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <p>outside</p>
        <Popover trigger={<Button>Open</Button>} title="T">Body</Popover>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByText('outside'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('close button closes and calls onOpenChange(false)', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    render(
      <Popover trigger={<Button>Open</Button>} title="T" showClose defaultOpen onOpenChange={onOpenChange}>
        Body
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('forwards ref, side and className to the content', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Popover trigger={<Button>Open</Button>} aria-label="x" defaultOpen side="top" className="extra" ref={ref}>
        Body
      </Popover>,
    );
    const dialog = screen.getByRole('dialog');
    expect(ref.current).toBe(dialog);
    expect(dialog).toHaveClass('ds-popover', 'extra');
    expect(dialog).toHaveAttribute('data-side', 'top');
  });

  it('has no axe violations', async () => {
    const a = render(<Popover trigger={<Button>Open</Button>} title="T" showClose defaultOpen>Body</Popover>);
    expect(await axe(a.baseElement)).toHaveNoViolations();
    a.unmount();
    const b = render(<Popover trigger={<Button>Open</Button>} aria-label="Info" defaultOpen>Text</Popover>);
    expect(await axe(b.baseElement)).toHaveNoViolations();
    b.unmount();
    const c = render(
      <Popover trigger={<Button>Open</Button>} aria-label="Info" defaultOpen>
        <button>Act</button>
      </Popover>,
    );
    expect(await axe(c.baseElement)).toHaveNoViolations();
  });

  describe('height-limited body', () => {
    afterEach(() => jest.restoreAllMocks());
    const mockOverflow = () => {
      jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(780);
      jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(192);
    };

    it('makes an overflowing body a focusable named region reachable by keyboard', async () => {
      mockOverflow();
      const user = userEvent.setup();
      render(<Popover trigger={<Button>Open</Button>} title="Long">Lots of text</Popover>);
      await user.click(screen.getByRole('button', { name: 'Open' }));
      const region = await screen.findByRole('region', { name: 'Long' });
      expect(region).toHaveAttribute('tabindex', '0');
      await user.tab();
      expect(region).toHaveFocus();
      expect(await axe(document.body)).toHaveNoViolations();
    });

    it('uses aria-label for the region when there is no title', async () => {
      mockOverflow();
      render(<Popover trigger={<Button>Open</Button>} aria-label="Notes" defaultOpen>Text</Popover>);
      expect(await screen.findByRole('region', { name: 'Notes' })).toHaveAttribute('tabindex', '0');
    });

    it('stays out of the tab order when nothing overflows', async () => {
      render(<Popover trigger={<Button>Open</Button>} aria-label="Notes" defaultOpen>Text</Popover>);
      expect(screen.queryByRole('region')).not.toBeInTheDocument();
    });
  });
});
