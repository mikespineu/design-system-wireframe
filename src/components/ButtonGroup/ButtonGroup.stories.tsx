import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { HeartFilledIcon, HeartIcon, PlusIcon } from '../../lib/sampleIcons';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  args: { 'aria-label': 'Product actions', children: null },
  argTypes: { attached: { control: 'boolean' }, disabled: { control: 'boolean' } },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wishlist = ({ loading }: { loading?: boolean }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <IconButton
      icon={HeartIcon}
      pressedIcon={HeartFilledIcon}
      aria-label="Add to wishlist"
      pressed={pressed}
      onPressedChange={setPressed}
      loading={loading}
    />
  );
};

const AddToCart = (props: { attached?: boolean; disabled?: boolean }) => (
  <ButtonGroup aria-label="Product actions" {...props}>
    <Button>Add to cart</Button>
    <Wishlist />
  </ButtonGroup>
);

export const AddToCartAndWishlistSpaced: Story = { render: () => <AddToCart /> };
export const AddToCartAndWishlistAttached: Story = { render: () => <AddToCart attached /> };

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <AddToCart disabled />
      <AddToCart disabled attached />
    </div>
  ),
};

export const ChildLoading: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {[false, true].map((attached) => (
        <ButtonGroup key={String(attached)} aria-label="Product actions" attached={attached}>
          <Button loading>Add to cart</Button>
          <Wishlist />
        </ButtonGroup>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <ButtonGroup aria-label="Actions">
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Preview</Button>
      <Button variant="ghost">Cancel</Button>
      <IconButton icon={PlusIcon} aria-label="Add" />
    </ButtonGroup>
  ),
};

export const KeyboardTabOrder: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <AddToCart attached />
      <Button variant="ghost">Next control</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole('button', { name: 'Add to cart' })).toHaveFocus();
    await userEvent.tab();
    await expect(c.getByRole('button', { name: 'Add to wishlist' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(c.getByRole('button', { name: 'Add to wishlist' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.tab();
    await expect(c.getByRole('button', { name: 'Next control' })).toHaveFocus();
  },
};
