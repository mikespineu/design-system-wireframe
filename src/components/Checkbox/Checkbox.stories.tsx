import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox, CheckboxGroup, type CheckedState } from './Checkbox';

/**
 * A square box with the label on its right, built on Radix `Checkbox`.
 * `CheckboxGroup` is a `fieldset` with a `legend`, hint and error.
 * Indeterminate is set from code with `checked="indeterminate"`; a click makes it checked.
 */
const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { label: 'Subscribe to the newsletter' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = {
  args: { defaultChecked: 'indeterminate' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  },
};
/** Hover shows a gray fill (use the Hover pseudo-state addon). */
export const Hover: Story = {};
export const WithDescription: Story = { args: { description: 'One email a week. Unsubscribe any time.' } };
export const Small: Story = { args: { size: 'sm', defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };
export const Invalid: Story = { args: { invalid: true } };
export const InvalidChecked: Story = { args: { invalid: true, defaultChecked: true } };

export const LongLabel: Story = {
  args: { label: 'I agree that my details are stored to answer this request and kept for no longer than twelve months.' },
  decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>],
};

/** Tab focuses the box (2 px ring); Space toggles; Enter does nothing. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox');
    await userEvent.tab();
    await expect(box).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(box).toHaveAttribute('aria-checked', 'false');
    await userEvent.keyboard(' ');
    await expect(box).toHaveAttribute('aria-checked', 'true');
  },
};

export const Group: StoryObj<typeof CheckboxGroup> = {
  render: () => (
    <CheckboxGroup legend="Topics" hint="Pick any that apply.">
      <Checkbox label="Design" defaultChecked />
      <Checkbox label="Engineering" />
      <Checkbox label="Research" disabled />
    </CheckboxGroup>
  ),
};

export const GroupHorizontal: StoryObj<typeof CheckboxGroup> = {
  render: () => (
    <CheckboxGroup legend="Days" orientation="horizontal" required>
      <Checkbox label="Mon" />
      <Checkbox label="Tue" />
      <Checkbox label="Wed" />
    </CheckboxGroup>
  ),
};

export const GroupInvalid: StoryObj<typeof CheckboxGroup> = {
  render: () => (
    <CheckboxGroup legend="Topics" hint="Pick at least one." error="Choose at least one topic" required>
      <Checkbox label="Design" />
      <Checkbox label="Engineering" />
    </CheckboxGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group');
    await expect(group).toHaveAccessibleDescription(/Choose at least one topic/);
  },
};

export const GroupDisabled: StoryObj<typeof CheckboxGroup> = {
  render: () => (
    <CheckboxGroup legend="Topics" hint="Not available." disabled>
      <Checkbox label="Design" defaultChecked />
      <Checkbox label="Engineering" />
    </CheckboxGroup>
  ),
};

const SelectAllDemo = () => {
  const [items, setItems] = useState([true, false, false]);
  const all: CheckedState = items.every(Boolean) ? true : items.some(Boolean) ? 'indeterminate' : false;
  return (
    <CheckboxGroup legend="Notifications">
      <Checkbox label="Select all" checked={all} onCheckedChange={(c) => setItems(items.map(() => c === true))} />
      <div style={{ paddingInlineStart: 36 }}>
        {['Email', 'SMS', 'Push'].map((name, i) => (
          <Checkbox
            key={name}
            label={name}
            checked={items[i]}
            onCheckedChange={(c) => setItems(items.map((x, j) => (j === i ? c === true : x)))}
          />
        ))}
      </div>
    </CheckboxGroup>
  );
};

/** The parent is indeterminate when only some children are checked. */
export const SelectAll: StoryObj<typeof CheckboxGroup> = {
  render: () => <SelectAllDemo />,
  play: async ({ canvasElement }) => {
    const parent = within(canvasElement).getByRole('checkbox', { name: 'Select all' });
    await expect(parent).toHaveAttribute('aria-checked', 'mixed');
    await userEvent.click(parent);
    await expect(parent).toHaveAttribute('aria-checked', 'true');
  },
};
