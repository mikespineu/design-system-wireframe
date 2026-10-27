import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Plus, ArrowRight } from 'lucide-react';
import { Button, type ButtonVariant } from './Button';
import { PlusIcon, SearchIcon } from '../../lib/sampleIcons';

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost'];

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

const row = (render: (v: ButtonVariant) => React.ReactNode) => (
  <div className="flex flex-col gap-4">
    {variants.map((v) => (
      <div key={v} className="flex gap-6">
        {render(v)}
      </div>
    ))}
  </div>
);

/** Leading, trailing and both icons (16 px, decorative), every variant. */
export const WithIcons: Story = {
  render: (args) =>
    row((v) => (
      <>
        <Button {...args} variant={v} leadingIcon={PlusIcon}>Add to cart</Button>
        <Button {...args} variant={v} trailingIcon={SearchIcon}>Search</Button>
        <Button {...args} variant={v} leadingIcon={PlusIcon} trailingIcon={SearchIcon}>Both</Button>
      </>
    )),
};

/** Any icon component works, here two from lucide-react. */
export const LibraryIcons: Story = {
  args: { leadingIcon: Plus, trailingIcon: ArrowRight, children: 'Add to cart' },
};

/** Hover: gray-800 (primary) or gray-100 fill. */
export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
  render: (args) => row((v) => <Button {...args} variant={v} leadingIcon={PlusIcon}>Hover</Button>),
};

/** Focus: 2 px black ring with 2 px offset. */
export const Focus: Story = {
  args: { leadingIcon: PlusIcon },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};

export const DisabledWithIcons: Story = {
  args: { disabled: true },
  render: (args) => row((v) => <Button {...args} variant={v} leadingIcon={PlusIcon} trailingIcon={SearchIcon}>Disabled</Button>),
};

/** Loading: content hidden but keeps its width, spinner centred, aria-busy. */
export const Loading: Story = {
  args: { loading: true },
  render: (args) =>
    row((v) => (
      <>
        <Button {...args} variant={v}>Add to cart</Button>
        <Button {...args} variant={v} leadingIcon={PlusIcon} trailingIcon={SearchIcon}>Add to cart</Button>
      </>
    )),
};

/** Loading + focus: stays focusable and shows the ring; click does nothing. */
export const LoadingFocus: Story = {
  args: { loading: true, children: 'Add to cart' },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
  },
};

export const AsLinkWithIcons: Story = {
  args: { asChild: true, variant: 'secondary', leadingIcon: PlusIcon },
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
