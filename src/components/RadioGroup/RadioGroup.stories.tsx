import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

/**
 * Pick exactly one option. Built on Radix `RadioGroup`: one tab stop, arrow keys move focus and selection.
 * No preselection unless `defaultValue` is set.
 */
const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: { label: 'Delivery', children: null },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="standard" label="Standard" />
      <RadioGroupItem value="express" label="Express" />
      <RadioGroupItem value="pickup" label="Pickup" />
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { defaultValue: 'express' } };
export const WithHint: Story = { args: { hint: 'Choose how it arrives.', defaultValue: 'standard' } };
export const Required: Story = { args: { required: true, hint: 'Required.' } };
export const HiddenLabel: Story = { args: { hideLabel: true } };
export const Horizontal: Story = { args: { orientation: 'horizontal', defaultValue: 'standard' } };
export const Small: Story = { args: { size: 'sm', defaultValue: 'standard' } };
export const DisabledGroup: Story = { args: { disabled: true, defaultValue: 'standard' } };
export const Invalid: Story = { args: { error: 'Choose a delivery option.' } };
export const InvalidSelected: Story = { args: { error: 'This option is not available.', defaultValue: 'express' } };

export const WithDescriptions: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="standard" label="Standard" description="3 to 5 working days." />
      <RadioGroupItem value="express" label="Express" description="Next working day." />
    </RadioGroup>
  ),
  args: { defaultValue: 'standard' },
};

export const DisabledItem: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="standard" label="Standard" />
      <RadioGroupItem value="express" label="Express (unavailable)" disabled />
      <RadioGroupItem value="pickup" label="Pickup" />
    </RadioGroup>
  ),
  args: { defaultValue: 'standard' },
};

export const DisabledSelectedItem: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="standard" label="Standard" disabled />
      <RadioGroupItem value="express" label="Express" />
    </RadioGroup>
  ),
  args: { defaultValue: 'standard' },
};

const ControlledDemo = (args: ComponentProps<typeof RadioGroup>) => {
  const [value, setValue] = useState('express');
  return (
    <RadioGroup {...args} value={value} onValueChange={setValue}>
      <RadioGroupItem value="standard" label="Standard" />
      <RadioGroupItem value="express" label="Express" />
    </RadioGroup>
  );
};

export const Controlled: Story = { render: (args) => <ControlledDemo {...args} /> };

export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole('radio', { name: 'Standard' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(c.getByRole('radio', { name: 'Express' })).toBeChecked();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(c.getByRole('radio', { name: 'Pickup' })).toBeChecked();
  },
};
