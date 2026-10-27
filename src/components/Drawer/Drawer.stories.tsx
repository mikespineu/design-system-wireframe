import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Drawer, DrawerClose } from './Drawer';
import { Button } from '../Button';

/**
 * Modal side panel on Radix `Dialog`. `title` and `description` are required.
 * Slides from `side`; `size` sets the extent along the slide axis (sm 320, md 480, lg 640).
 */
const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { story: { inline: false, iframeHeight: 640 } } },
  args: {
    trigger: <Button>Open drawer</Button>,
    title: 'Edit profile',
    description: 'Change how you appear to others.',
    children: <input aria-label="Name" defaultValue="Ada Lovelace" style={{ width: '100%', height: 44 }} />,
    footer: (
      <>
        <DrawerClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DrawerClose>
        <Button>Save</Button>
      </>
    ),
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const long = Array.from({ length: 30 }, (_, i) => <p key={i}>Paragraph {i + 1} of long content.</p>);

/** Closed: only the trigger renders. */
export const Closed: Story = {};
/** Open, right side, md (defaults). */
export const Open: Story = { args: { defaultOpen: true } };
export const Right: Story = { args: { defaultOpen: true, side: 'right' } };
export const Left: Story = { args: { defaultOpen: true, side: 'left' } };
export const Top: Story = { args: { defaultOpen: true, side: 'top' } };
export const Bottom: Story = { args: { defaultOpen: true, side: 'bottom' } };
export const Small: Story = { args: { defaultOpen: true, size: 'sm' } };
export const Medium: Story = { args: { defaultOpen: true, size: 'md' } };
export const Large: Story = { args: { defaultOpen: true, size: 'lg' } };
export const NoFooter: Story = { args: { defaultOpen: true, footer: undefined } };
export const HideCloseButton: Story = { args: { defaultOpen: true, hideCloseButton: true } };
/** Overlay click does nothing; Esc and the close button still close. */
export const NotDismissible: Story = { args: { defaultOpen: true, dismissible: false } };

/** Only the body scrolls; header and footer stay fixed. */
export const ScrollingRight: Story = { args: { defaultOpen: true, side: 'right', size: 'sm', children: long } };
export const ScrollingLeft: Story = { args: { defaultOpen: true, side: 'left', size: 'sm', children: long } };
export const ScrollingTop: Story = { args: { defaultOpen: true, side: 'top', size: 'sm', children: long } };
export const ScrollingBottom: Story = { args: { defaultOpen: true, side: 'bottom', size: 'sm', children: long } };
export const ScrollingNoFooter: Story = {
  args: {
    defaultOpen: true,
    side: 'left',
    size: 'sm',
    footer: undefined,
    children: (
      <nav aria-label="Sections">
        <ul>
          {Array.from({ length: 40 }, (_, i) => (
            <li key={i}>
              <a href={`#s${i}`}>Section {i + 1}</a>
            </li>
          ))}
        </ul>
      </nav>
    ),
  },
};
export const ScrollingFullMobile: Story = {
  args: { defaultOpen: true, children: long },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
/** Tab to the body region and press End to show the scrolled state. */
export const ScrolledToEnd: Story = {
  args: { defaultOpen: true, size: 'sm', children: long },
  play: async () => {
    await userEvent.tab();
    await userEvent.keyboard('{End}');
  },
};

/** Keyboard: Enter opens and focuses the body input; Esc closes and returns focus to the trigger. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Open drawer' });
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
