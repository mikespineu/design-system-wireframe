import type { ComponentType, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, screen } from 'storybook/test';
import { Popover, type PopoverProps } from './Popover';
import { Button } from '../Button';

/**
 * Non-modal panel on Radix `Popover`. Opens on click; Esc and outside click close it.
 * Focus moves inside on open and returns to the trigger on Esc / close button.
 * Name it with `title` or `aria-label`.
 */
type LooseProps = Omit<PopoverProps, 'title' | 'aria-label'> & { title?: ReactNode; 'aria-label'?: string };

const meta: Meta<LooseProps> = {
  title: 'Components/Popover',
  component: Popover as ComponentType<LooseProps>,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { story: { inline: false, iframeHeight: 360 } } },
  decorators: [(Story) => <div style={{ padding: 120 }}><Story /></div>],
  args: {
    trigger: <Button>Open popover</Button>,
    title: 'Billing period',
    children: 'Charges are calculated per calendar month.',
  },
};

export default meta;
type Story = StoryObj<LooseProps>;

const long = Array.from({ length: 30 }, (_, i) => <p key={i}>Line {i + 1}</p>);

/** Closed: only the trigger renders. */
export const Closed: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
export const TitleAndClose: Story = { args: { defaultOpen: true, showClose: true } };
/** No heading: named by `aria-label`; the panel itself takes focus. */
export const TextOnly: Story = {
  args: { defaultOpen: true, title: undefined, 'aria-label': 'About billing' },
};
export const WithFields: Story = {
  args: {
    defaultOpen: true,
    showClose: true,
    title: 'Rename',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input aria-label="Name" defaultValue="Report" style={{ height: 44 }} />
        <Button>Save</Button>
      </div>
    ),
  },
};
export const SideTop: Story = { args: { defaultOpen: true, side: 'top' } };
export const SideRight: Story = { args: { defaultOpen: true, side: 'right' } };
export const SideBottom: Story = { args: { defaultOpen: true, side: 'bottom' } };
export const SideLeft: Story = { args: { defaultOpen: true, side: 'left' } };
/** Body scrolls when the content is taller than the available height. */
export const HeightLimited: Story = { args: { defaultOpen: true, showClose: true, children: long } };

/** Enter opens, focus moves inside, Esc closes and focus returns to the trigger. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('button') as HTMLButtonElement;
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('dialog', { name: 'Billing period' })).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};
