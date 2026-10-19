import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Continue', onClick: fn() },
  argTypes: { variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] } },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Cancel' } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Learn more' } };

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex gap-6">
      <Button {...args} variant="primary" />
      <Button {...args} variant="secondary">Cancel</Button>
      <Button {...args} variant="ghost">Learn more</Button>
    </div>
  ),
};

export const AsLink: Story = {
  args: { asChild: true, variant: 'secondary' },
  render: (args) => (
    <Button {...args}>
      <a href="#archive">View archive</a>
    </Button>
  ),
};

/** Keyboard: Tab focuses the button (2 px ring), Enter and Space activate it. */
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
