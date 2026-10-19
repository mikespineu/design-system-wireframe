import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Field, Input, TextField } from './Input';

/**
 * ## Field API (reuse for Textarea, Select, SearchInput)
 *
 * `Field` owns the label, hint and error and the accessibility wiring; the control only styles itself.
 *
 * ```tsx
 * <Field label="Email" hint="Optional help" error={msg} disabled required id="optional">
 *   <Input type="email" />
 * </Field>
 * ```
 *
 * - `label` renders a Radix `Label` bound with `htmlFor` to a `useId()` id (override with `id`).
 * - `error` sets `aria-invalid`, adds an alert icon and a message (prefixed with a screen-reader "Error:"), plus a 2px error border and error-colored message. Never color alone.
 * - `hint` and `error` get ids and are joined into `aria-describedby`.
 * - `disabled` and `required` flow to the control and label.
 * - Controls read the wiring with `useFieldControl()` (returns `{ id, aria-invalid, aria-describedby, aria-required, disabled }`
 *   or `null` outside a Field). Spread it first, then explicit props:
 *   `const field = useFieldControl(); <textarea {...field} {...props} />`.
 * - `TextField` = `Field` + `Input` in one component.
 */
const meta = {
  title: 'Components/Input',
  component: TextField,
  tags: ['autodocs'],
  args: { label: 'Email', type: 'email', placeholder: 'name@domain.com' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = { args: { defaultValue: 'ada@studio' } };

export const WithHint: Story = { args: { hint: 'We only use it for receipts.' } };

/** Focus shows a 2 px black ring with 2 px offset. */
export const Focus: Story = {
  args: { defaultValue: 'ada@studio' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Email');
    await userEvent.click(input);
    await expect(input).toHaveFocus();
  },
};

/** Error: 2 px border, gray fill, alert icon and message. */
export const ErrorState: Story = {
  args: { defaultValue: 'ada@', error: 'enter a full email address' },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Email');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Error: enter a full email address');
  },
};

export const Disabled: Story = { args: { disabled: true, placeholder: 'Unavailable' } };

/** Clicking the label focuses the input. */
export const LabelClick: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByText('Email'));
    await expect(c.getByLabelText('Email')).toHaveFocus();
  },
};

/** Composing `Field` and `Input` directly. */
export const Composed: Story = {
  render: () => (
    <Field label="Name" hint="As on your passport" required>
      <Input placeholder="Ada Lovelace" />
    </Field>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8">
      <TextField label="Email" placeholder="name@domain.com" />
      <TextField label="Email" defaultValue="ada@studio" />
      <TextField label="Email" defaultValue="ada@" error="enter a full email address" />
      <TextField label="Email" disabled placeholder="Unavailable" />
    </div>
  ),
};
