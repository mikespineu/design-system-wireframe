import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconButton } from './IconButton';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { icon: 'plus', 'aria-label': 'Add', onClick: fn() },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Hover: gray-100 fill. */
export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
  },
};

/** Focus: 2 px black ring with 2 px offset. */
export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const AsLink: Story = {
  args: { asChild: true, 'aria-label': 'Open archive' },
  render: (args) => (
    <IconButton {...args}>
      <a href="#archive" aria-label="Open archive" />
    </IconButton>
  ),
};

/** Keyboard: Tab focuses the button, Enter and Space activate it. */
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
