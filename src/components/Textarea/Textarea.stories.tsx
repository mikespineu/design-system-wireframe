import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Textarea, TextareaField } from './Textarea';
import { lucideIconSet } from '../Icon/librarySources';

/**
 * Multi-line twin of `Input`. `Textarea` is the control (works inside `Field`);
 * `TextareaField` is `Field` + `Textarea`.
 *
 * A bare `Textarea` outside a Field needs `aria-label` or `aria-labelledby`.
 * `maxLength` shows a counter and is not passed as the native attribute, so typing past it is allowed.
 */
const meta = {
  title: 'Components/Textarea',
  component: TextareaField,
  tags: ['autodocs'],
  args: { label: 'Message', placeholder: 'Write a message' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextareaField>;

export default meta;
type Story = StoryObj<typeof meta>;

const long = 'A longer note that carries on for a while.\nSecond line.\nThird line.\nFourth line.\nFifth line.\nSixth line.\nSeventh line.\nEighth line.';

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: 'Thanks, see you Friday.' } };
export const WithHint: Story = { args: { hint: 'Plain text only.' } };
/** Hover shows a black border (use the Hover pseudo-state addon). */
export const Hover: Story = { args: { defaultValue: 'Hover me' } };

/** Keyboard focus: 2 px black ring, 2 px offset. */
export const Focus: Story = {
  args: { defaultValue: 'Focused' },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByLabelText('Message')).toHaveFocus();
  },
};

export const Invalid: Story = {
  args: { defaultValue: 'hi', error: 'write at least 10 characters' },
  play: async ({ canvasElement }) => {
    const el = within(canvasElement).getByLabelText('Message');
    await expect(el).toHaveAttribute('aria-invalid', 'true');
  },
};

export const InvalidFocus: Story = {
  args: { defaultValue: 'hi', error: 'write at least 10 characters' },
  play: async () => {
    await userEvent.tab();
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Unavailable' } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 'Copy me, you cannot edit me.' } };
export const ReadOnlyFocus: Story = {
  args: { readOnly: true, defaultValue: 'Copy me, you cannot edit me.' },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByLabelText('Message')).toHaveFocus();
  },
};

export const SizeSmall: Story = { args: { size: 'sm' } };
export const SizeMedium: Story = { args: { size: 'md' } };
export const SizeLarge: Story = { args: { size: 'lg' } };
/** One row is 44 px, lined up with an Input. */
export const OneRow: Story = { args: { rows: 1 } };

export const ResizeVertical: Story = { args: { resize: 'vertical', defaultValue: long } };
export const ResizeNone: Story = { args: { resize: 'none', defaultValue: long } };
/** Grows up to `maxRows` (default 6), then scrolls. Needs `field-sizing` support. */
export const ResizeAuto: Story = { args: { resize: 'auto', rows: 2, defaultValue: long } };
export const ResizeAutoMaxRows: Story = { args: { resize: 'auto', rows: 2, maxRows: 3, defaultValue: long } };

export const CounterUnder: Story = { args: { maxLength: 160, defaultValue: 'Short note' } };
export const CounterNear: Story = { args: { maxLength: 20, defaultValue: 'Eighteen characters' } };
export const CounterAtLimit: Story = { args: { maxLength: 10, defaultValue: '0123456789' } };
export const CounterOver: Story = { args: { maxLength: 10, hint: 'Keep it short.', defaultValue: '0123456789 and more' } };

/** Bare control outside a Field needs an accessible name. */
export const BareTextarea: StoryObj<typeof Textarea> = {
  render: () => <Textarea aria-label="Notes" maxLength={50} />,
};

/** Tab in, type with Enter for a new line, Tab out. */
export const Keyboard: Story = {
  args: { maxLength: 20 },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    const el = within(canvasElement).getByLabelText('Message');
    await expect(el).toHaveFocus();
    await userEvent.keyboard('one{Enter}two');
    await expect(el).toHaveValue('one\ntwo');
  },
};

/** Default error glyph (top) against a Lucide `errorIcon` (bottom). */
export const CustomIcons: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <TextareaField label="Default" error="Required." maxLength={5} defaultValue="too long" />
      <TextareaField label="Lucide" error="Required." maxLength={5} defaultValue="too long" errorIcon={lucideIconSet.alert} />
    </div>
  ),
};
