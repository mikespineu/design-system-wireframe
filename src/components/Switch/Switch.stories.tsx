import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Switch } from './Switch';

/**
 * One boolean setting applied at once, built on Radix `Switch`.
 * `labelPosition="start"` pushes the track to the far edge, for settings lists.
 * Hover and focus-visible are driven by the pointer and keyboard (see the Keyboard story).
 */
const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { label: 'Wi-Fi' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Small: Story = { args: { size: 'sm', defaultChecked: true } };
export const SmallOff: Story = { args: { size: 'sm' } };
export const WithDescription: Story = { args: { description: 'Join known networks automatically.' } };
export const LabelStart: Story = {
  args: { labelPosition: 'start', description: 'Join known networks automatically.' },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
};
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { disabled: true, defaultChecked: true } };
export const AriaLabelOnly: Story = { args: { label: undefined, 'aria-label': 'Row enabled' } as never };
export const LongLabel: Story = {
  args: { label: 'Send me a summary of activity on my projects every Monday morning, including mentions.' },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};

/** Tab focuses the track (2 px ring); Space and Enter toggle. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const sw = within(canvasElement).getByRole('switch');
    await userEvent.tab();
    await expect(sw).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(sw).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(sw).toHaveAttribute('aria-checked', 'false');
  },
};
