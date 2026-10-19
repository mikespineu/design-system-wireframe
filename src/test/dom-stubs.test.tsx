import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, Select } from 'radix-ui';

describe('jsdom stubs for Radix', () => {
  it('provides the browser APIs Radix needs', () => {
    expect(new ResizeObserver(() => {})).toBeDefined();
    expect(window.PointerEvent).toBeDefined();
    expect(window.matchMedia('(min-width: 1px)').matches).toBe(false);
    const el = document.createElement('div');
    expect(el.hasPointerCapture(1)).toBe(false);
    expect(() => {
      el.setPointerCapture(1);
      el.releasePointerCapture(1);
      el.scrollIntoView();
    }).not.toThrow();
    expect(new PointerEvent('pointerdown', { pointerId: 7, pointerType: 'touch' })).toMatchObject({
      pointerId: 7,
      pointerType: 'touch',
    });
  });

  it('opens and closes a Radix Dialog with the keyboard', async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Content>
            <Dialog.Title>Title</Dialog.Title>
            <Dialog.Description>Body</Dialog.Description>
            <Dialog.Close>Close</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens a Radix Select and picks an option', async () => {
    const user = userEvent.setup();
    render(
      <Select.Root>
        <Select.Trigger aria-label="Plan">
          <Select.Value placeholder="Pick" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            <Select.Viewport>
              <Select.Item value="studio">
                <Select.ItemText>Studio</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Plan' }));
    await user.click(await screen.findByRole('option', { name: 'Studio' }));
    expect(screen.getByRole('combobox', { name: 'Plan' })).toHaveTextContent('Studio');
  });
});
