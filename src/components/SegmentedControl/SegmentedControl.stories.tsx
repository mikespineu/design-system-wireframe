import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SegmentedControl } from './SegmentedControl';
import { IconButton } from '../IconButton';

/**
 * Pick exactly one of 2-7 short text options, built on Radix `RadioGroup`.
 * A value is always selected (the first enabled option when none is given) and it can never be cleared.
 * The selection pill slides between segments (not on first render, not under `prefers-reduced-motion`).
 * Arrow keys move and select; Home and End move focus only. The `sm` size is for fine pointers only.
 * `help` takes any node outside the arrow-key order; a help `IconButton` needs its own `aria-label`.
 */
const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: {
    label: 'View',
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
      { value: 'board', label: 'Board' },
    ],
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const eight = Array.from({ length: 8 }, (_, i) => ({ value: `o${i + 1}`, label: `Option ${i + 1}` }));

export const Default: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const FullWidth: Story = { args: { fullWidth: true, labelPosition: 'top' } };
export const LabelTop: Story = { args: { labelPosition: 'top', hint: 'How the items are laid out.' } };
export const WithHelp: Story = {
  args: { help: <IconButton icon="info" aria-label="About views" /> },
};
export const DisabledItem: Story = {
  args: {
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid', disabled: true },
      { value: 'board', label: 'Board' },
    ],
  },
};
export const DisabledGroup: Story = { args: { disabled: true, defaultValue: 'grid' } };

const ControlledDemo = (args: ComponentProps<typeof SegmentedControl>) => {
  const [value, setValue] = useState<string>('grid');
  return <SegmentedControl {...args} value={value} onValueChange={setValue} />;
};

export const Controlled: Story = {
  render: (args) => <ControlledDemo {...args} />,
};

export const RightToLeft: Story = { args: { dir: 'rtl' } };

/** Eight options in a narrow container scroll on X with an edge fade on the side with hidden items. */
export const Overflow: Story = {
  args: { options: eight, defaultValue: 'o7' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
};

/** Tab lands on the selected segment; arrows move and select; Home/End move focus only; Space selects. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole('radio', { name: 'List' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(c.getByRole('radio', { name: 'Grid' })).toBeChecked());
    await userEvent.keyboard('{End}');
    await expect(c.getByRole('radio', { name: 'Board' })).toHaveFocus();
    await expect(c.getByRole('radio', { name: 'Grid' })).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(c.getByRole('radio', { name: 'Board' })).toBeChecked();
  },
};
