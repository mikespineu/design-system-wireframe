import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, screen } from 'storybook/test';
import { InfoTip } from './InfoTip';

/**
 * Info icon button. Renders a Tooltip unless `(pointer: coarse)` matches, then a Popover.
 * Switches on that media query only, never on viewport width. Use devtools touch emulation
 * to see Popover mode.
 */
const meta = {
  title: 'Components/InfoTip',
  component: InfoTip,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { story: { inline: false, iframeHeight: 240 } } },
  decorators: [(Story) => <div style={{ padding: 80 }}><Story /></div>],
  args: { label: 'About billing period', content: 'How often you are charged. Changes apply from the next cycle.' },
} satisfies Meta<typeof InfoTip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Non-touch (Tooltip mode): hover or focus the icon. */
export const TooltipMode: Story = {};
/** Touch (Popover mode): emulate a coarse pointer in devtools, then tap the icon. */
export const PopoverMode: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };
export const SideBottom: Story = { args: { side: 'bottom' } };

/** Keyboard: Tab opens the tip at once, Esc closes it and focus stays. */
export const Keyboard: Story = {
  play: async () => {
    await userEvent.tab();
    const trigger = screen.getByRole('button', { name: 'About billing period' });
    await expect(trigger).toHaveFocus();
    await waitFor(() => expect(screen.getAllByRole('tooltip', { hidden: true }).length).toBeGreaterThan(0));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
