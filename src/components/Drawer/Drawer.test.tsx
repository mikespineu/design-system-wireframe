import { createRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Drawer, DrawerClose, type DrawerSide } from './Drawer';
import { Button } from '../Button';

const setup = (props: Partial<React.ComponentProps<typeof Drawer>> = {}) =>
  render(
    <Drawer
      trigger={<Button>Open</Button>}
      title="Edit profile"
      description="Change your details."
      footer={
        <>
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          <Button>Save</Button>
        </>
      }
      {...props}
    >
      <input aria-label="Name" />
    </Drawer>,
  );

describe('Drawer', () => {
  it('is named and described when open, closed by default', async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit profile' });
    expect(dialog).toHaveAccessibleDescription('Change your details.');
    expect(dialog).toHaveAttribute('data-state', 'open');
    expect(dialog).toHaveAttribute('data-side', 'right');
    expect(dialog).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Edit profile');
  });

  it.each<DrawerSide>(['left', 'right', 'top', 'bottom'])('sets data-side=%s', (side) => {
    setup({ defaultOpen: true, side, size: 'lg' });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-side', side);
    expect(dialog).toHaveAttribute('data-size', 'lg');
  });

  it('Enter opens and focuses first body input; Esc closes and returns focus', async () => {
    const user = userEvent.setup();
    setup();
    screen.getByRole('button', { name: 'Open' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('Name')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('focuses the close button when the body has no focusables', async () => {
    const user = userEvent.setup();
    render(
      <Drawer trigger={<Button>Open</Button>} title="T" description="D">
        text
      </Drawer>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('tab order: close, body region, input, actions, wraps', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.tab({ shift: true });
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('region', { name: 'Edit profile' })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Name')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  });

  it('first Tab stop is the body region with hideCloseButton and no controls', async () => {
    const user = userEvent.setup();
    render(
      <Drawer defaultOpen hideCloseButton title="Terms" description="D">
        long text
      </Drawer>,
    );
    const region = screen.getByRole('region', { name: 'Terms' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    await waitFor(() => expect(region).toHaveFocus());
    await user.tab();
    expect(region).toHaveFocus();
  });

  it('close button and DrawerClose call onOpenChange(false)', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    setup({ onOpenChange });
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledTimes(4);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('overlay click closes; not when dismissible=false (Esc still does)', async () => {
    const user = userEvent.setup();
    const { unmount } = setup({ defaultOpen: true });
    await user.click(document.querySelector('.ds-drawer-overlay')!);
    expect(screen.queryByRole('dialog')).toBeNull();
    unmount();

    setup({ defaultOpen: true, dismissible: false });
    await user.click(document.querySelector('.ds-drawer-overlay')!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('forwards ref, className and rest props to Content', () => {
    const ref = createRef<HTMLDivElement>();
    setup({ defaultOpen: true, ref, className: 'extra', 'data-testid': 'd' } as never);
    expect(ref.current).toBe(screen.getByTestId('d'));
    expect(ref.current).toHaveClass('ds-drawer', 'extra');
  });

  it('has no axe violations', async () => {
    setup({ defaultOpen: true });
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no axe violations for left nav without footer and top sm', async () => {
    const { unmount } = render(
      <Drawer defaultOpen side="left" size="sm" title="Menu" description="Navigate">
        <nav aria-label="Main"><a href="#a">A</a></nav>
      </Drawer>,
    );
    expect(await axe(document.body)).toHaveNoViolations();
    unmount();
    render(
      <Drawer defaultOpen side="top" size="sm" title="Search" description="Find">
        long text
      </Drawer>,
    );
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
