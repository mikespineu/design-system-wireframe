import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Dialog, DialogClose } from './Dialog';
import { Button } from '../Button';

/**
 * Modal panel on Radix `Dialog`. `title` is required; `description` is optional.
 * Wrap Cancel in `DialogClose asChild`. Esc closes and focus returns to the trigger.
 */
const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    trigger: <Button>Open dialog</Button>,
    title: 'Edit profile',
    description: 'Change how you appear to others.',
    children: <input aria-label="Name" defaultValue="Ada Lovelace" style={{ width: '100%', height: 44 }} />,
    footer: (
      <>
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>
        <Button>Save</Button>
      </>
    ),
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const long = Array.from({ length: 30 }, (_, i) => <p key={i}>Paragraph {i + 1} of long content.</p>);

/** Closed: only the trigger renders. */
export const Closed: Story = {};
/** Open at the default md size. */
export const Open: Story = { args: { defaultOpen: true } };
export const Small: Story = {
  args: { defaultOpen: true, size: 'sm', title: 'Discard changes?', description: undefined, children: 'This cannot be undone.' },
};
export const Medium: Story = { args: { defaultOpen: true, size: 'md' } };
export const Large: Story = { args: { defaultOpen: true, size: 'lg' } };
/** Header and footer stay fixed; only the body scrolls. */
export const Scrolling: Story = { args: { defaultOpen: true, children: long } };
export const NoDescription: Story = { args: { defaultOpen: true, description: undefined } };
export const NoFooter: Story = { args: { defaultOpen: true, footer: undefined } };
export const HideCloseButton: Story = { args: { defaultOpen: true, hideCloseButton: true } };
/** Overlay click does nothing; Esc and the close button still close. */
export const NotDismissible: Story = { args: { defaultOpen: true, dismissible: false } };

/** Keyboard: Enter opens and focuses the body input; Esc closes and returns focus to the trigger. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Open dialog' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const body = within(document.body);
    await waitFor(() => expect(body.getByLabelText('Name')).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** Keyboard: Tab wraps inside the panel. */
export const KeyboardTrap: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const body = within(document.body);
    await waitFor(() => expect(body.getByLabelText('Name')).toHaveFocus());
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(body.getByRole('button', { name: 'Close' })).toHaveFocus();
  },
};
