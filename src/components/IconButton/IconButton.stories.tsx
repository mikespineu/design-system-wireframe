import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconButton } from './IconButton';
import type { ButtonVariant } from '../Button/Button';
import { HeartFilledIcon, HeartIcon, PlusIcon } from '../../lib/sampleIcons';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  args: { icon: PlusIcon, 'aria-label': 'Add', onClick: fn() },
  argTypes: { variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] } },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost'];
const Row = ({ children }: { children: (v: ButtonVariant) => React.ReactNode }) => (
  <div className="flex gap-6">
    {variants.map((v) => (
      <span key={v}>{children(v)}</span>
    ))}
  </div>
);

const Wishlist = () => {
  const [pressed, setPressed] = useState(false);
  return (
    <IconButton
      icon={HeartIcon}
      pressedIcon={HeartFilledIcon}
      aria-label="Add to wishlist"
      pressed={pressed}
      onPressedChange={setPressed}
    />
  );
};

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => <Row>{(v) => <IconButton {...args} variant={v} aria-label={`Add ${v}`} />}</Row>,
};

/** Hover: gray-800 (primary) or gray-100 fill. */
export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
  render: (args) => <Row>{(v) => <IconButton {...args} variant={v} aria-label={`Add ${v}`} />}</Row>,
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getAllByRole('button')[0]!);
  },
};

/** Focus: 2 px black ring with 2 px offset. */
export const Focus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Row>{(v) => <IconButton {...args} variant={v} aria-label={`Add ${v}`} />}</Row>,
};

/** Loading: icon hidden, 18 px spinner, aria-busy; the box keeps its size. */
export const Loading: Story = {
  args: { loading: true },
  render: (args) => <Row>{(v) => <IconButton {...args} variant={v} aria-label={`Add ${v}`} />}</Row>,
};

/** Toggle, unpressed: outline heart, aria-pressed="false". */
export const Unpressed: Story = {
  args: { icon: HeartIcon, pressedIcon: HeartFilledIcon, 'aria-label': 'Add to wishlist', pressed: false },
  render: (args) => <Row>{(v) => <IconButton {...args} variant={v} />}</Row>,
};

/** Toggle, pressed: filled heart; secondary and ghost also get a 2 px border. */
export const Pressed: Story = {
  args: { icon: HeartIcon, pressedIcon: HeartFilledIcon, 'aria-label': 'Add to wishlist', pressed: true },
  render: (args) => <Row>{(v) => <IconButton {...args} variant={v} />}</Row>,
};

export const PressedDisabled: Story = {
  args: { icon: HeartIcon, pressedIcon: HeartFilledIcon, 'aria-label': 'Add to wishlist', pressed: true, disabled: true },
  render: (args) => <Row>{(v) => <IconButton {...args} variant={v} />}</Row>,
};

export const PressedLoading: Story = {
  args: { icon: HeartIcon, pressedIcon: HeartFilledIcon, 'aria-label': 'Add to wishlist', pressed: true, loading: true },
  render: (args) => <Row>{(v) => <IconButton {...args} variant={v} />}</Row>,
};

/** Wishlist heart (consumer icons built with createIcon): click or Enter/Space toggles outline and filled. */
export const WishlistToggle: Story = {
  render: () => <Wishlist />,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Add to wishlist' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  },
};

export const AsLink: Story = {
  render: () => (
    <IconButton asChild icon={PlusIcon} aria-label="Open archive">
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
