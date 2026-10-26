import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TileGroup } from './TileGroup';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';

/**
 * Pick exactly one of several options shown as icon + label tiles, built on Radix `RadioGroup`.
 * A value is always selected (the first enabled option when none is given) and it can never be cleared.
 * Tiles hug their label (never truncated) and the row scrolls with an edge fade when it overflows.
 * The selected look cross-fades with `--ds-motion`. Icons are decorative; the label is the accessible name.
 * Arrow keys move and select; Home and End move focus only.
 */
const meta = {
  title: 'Components/TileGroup',
  component: TileGroup,
  tags: ['autodocs'],
  args: {
    label: 'Quick action',
    options: [
      { value: 'add', label: 'Add', icon: <Icon name="plus" size={24} /> },
      { value: 'search', label: 'Search', icon: <Icon name="search" size={24} /> },
      { value: 'info', label: 'Details', icon: <Icon name="info" size={24} /> },
    ],
  },
} satisfies Meta<typeof TileGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const icons = ['plus', 'search', 'info', 'alert', 'warning', 'check', 'close', 'chevron-down'] as const;
const eight = icons.map((name, i) => ({ value: `o${i + 1}`, label: `Option ${i + 1}`, icon: <Icon name={name} /> }));

export const Default: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const LabelStart: Story = { args: { labelPosition: 'start' } };
export const WithHint: Story = { args: { hint: 'What the button does.' } };
export const WithHelp: Story = {
  args: { help: <IconButton icon="info" aria-label="About quick actions" /> },
};
export const Selected: Story = { args: { defaultValue: 'search' } };
export const DisabledItem: Story = {
  args: {
    options: [
      { value: 'add', label: 'Add', icon: <Icon name="plus" /> },
      { value: 'search', label: 'Search', icon: <Icon name="search" />, disabled: true },
      { value: 'info', label: 'Details', icon: <Icon name="info" /> },
    ],
  },
};
export const DisabledGroup: Story = { args: { disabled: true, defaultValue: 'search' } };

/** A long label makes its tile grow; it never wraps or truncates. */
export const LongLabel: Story = {
  args: {
    options: [
      { value: 'add', label: 'Add', icon: <Icon name="plus" /> },
      { value: 'long', label: 'Notifications', icon: <Icon name="alert" /> },
    ],
  },
};

const ControlledDemo = (args: ComponentProps<typeof TileGroup>) => {
  const [value, setValue] = useState<string>('search');
  return <TileGroup {...args} value={value} onValueChange={setValue} />;
};

export const Controlled: Story = {
  render: (args) => <ControlledDemo {...args} />,
};

export const RightToLeft: Story = { args: { dir: 'rtl' } };

/** Eight tiles in a narrow container scroll on X with an edge fade on the side with hidden tiles. */
export const Overflow: Story = {
  args: { options: eight, defaultValue: 'o7' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
};

export const OverflowSmall: Story = {
  args: { options: eight, defaultValue: 'o2', size: 'sm' },
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
};

/** Tab lands on the selected tile; arrows move and select; Home/End move focus only; Space selects. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole('radio', { name: 'Add' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(c.getByRole('radio', { name: 'Search' })).toBeChecked());
    await userEvent.keyboard('{End}');
    await expect(c.getByRole('radio', { name: 'Details' })).toHaveFocus();
    await expect(c.getByRole('radio', { name: 'Search' })).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(c.getByRole('radio', { name: 'Details' })).toBeChecked();
  },
};
