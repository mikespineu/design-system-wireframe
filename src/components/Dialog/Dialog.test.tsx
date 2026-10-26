import { createRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Dialog, DialogClose } from './Dialog';
import { Button } from '../Button';

const setup = (props: Partial<React.ComponentProps<typeof Dialog>> = {}) =>
  render(
    <Dialog
      trigger={<Button>Open</Button>}
      title="Edit profile"
      description="Change your details."
      footer={
        <>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </>
      }
      {...props}
    >
      <input aria-label="Name" />
    </Dialog>,
  );

describe('Dialog', () => {
  it('is closed by default and named by its title when open', async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' });
    expect(dialog).toHaveAttribute('data-state', 'open');
    expect(dialog).toHaveAccessibleDescription('Change your details.');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Edit profile');
  });

  it('Enter on trigger opens, focuses first body input; Esc closes and returns focus', async () => {
    const user = userEvent.setup();
    setup();
    screen.getByRole('button', { name: 'Open' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('Name')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('traps and wraps Tab and Shift+Tab', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveFocus());
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  });

  it('close button and DialogClose close and call onOpenChange(false)', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    setup({ onOpenChange });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledTimes(4);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('overlay click closes unless dismissible is false; Esc still closes', async () => {
    const user = userEvent.setup();
    const { unmount } = setup();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(document.querySelector('.ds-dialog-overlay')!);
    expect(screen.queryByRole('dialog')).toBeNull();
    unmount();

    setup({ dismissible: false });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(document.querySelector('.ds-dialog-overlay')!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('size, className, ref and rest props go to the content', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dialog ref={ref} defaultOpen size="lg" className="x" title="T" data-testid="c">
        body
      </Dialog>,
    );
    const el = screen.getByTestId('c');
    expect(ref.current).toBe(el);
    expect(el).toHaveClass('ds-dialog', 'x');
    expect(el).toHaveAttribute('data-size', 'lg');
  });

  it('defaults to md; omits description, footer and close button as asked', () => {
    render(<Dialog defaultOpen title="T" hideCloseButton>body</Dialog>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-size', 'md');
    expect(dialog).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    expect(document.querySelector('.ds-dialog-footer')).toBeNull();
  });

  it('works controlled without a trigger', async () => {
    const onOpenChange = jest.fn();
    render(<Dialog open onOpenChange={onOpenChange} title="T">x</Dialog>);
    await userEvent.setup().keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it.each([
    ['md with all parts', {}],
    ['sm without description', { size: 'sm' as const, description: undefined }],
    ['hideCloseButton', { hideCloseButton: true }],
  ])('has no a11y violations: %s', async (_n, props) => {
    setup({ defaultOpen: true, ...props });
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no a11y violations: lg with long body', async () => {
    setup({ defaultOpen: true, size: 'lg', children: <p style={{ height: 3000 }}>Long</p> });
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
