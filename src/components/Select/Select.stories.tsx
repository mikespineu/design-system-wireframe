import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, screen } from 'storybook/test';
import { SelectField, type SelectFieldProps, type SelectOption } from './Select';

const countries: SelectOption[] = [
  { value: 'de', label: 'Germany', emoji: '🇩🇪', keywords: ['Deutschland', 'DE'] },
  { value: 'fr', label: 'France', emoji: '🇫🇷' },
  { value: 'es', label: 'Spain', emoji: '🇪🇸', keywords: ['España'] },
  { value: 'it', label: 'Italy', emoji: '🇮🇹', disabled: true },
  { value: 'pl', label: 'Poland', emoji: '🇵🇱' },
  { value: 'se', label: 'Sweden', emoji: '🇸🇪' },
  { value: 'no', label: 'Norway', emoji: '🇳🇴' },
  { value: 'nl', label: 'Netherlands', emoji: '🇳🇱' },
  { value: 'other', label: 'Other / not listed' },
];
const plans: SelectOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
  { value: 'ent', label: 'Enterprise', disabled: true },
];

/**
 * Pick one value from a list. Closed, it looks like `Input`. Default list on Radix `Select`;
 * `searchable` uses Radix `Popover` with an ARIA combobox; touch-first devices get a native `<select>`.
 */
const meta: Meta<SelectFieldProps> = {
  title: 'Components/Select',
  component: SelectField,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { story: { inline: false, iframeHeight: 420 } } },
  decorators: [(Story) => <div style={{ width: 320, padding: '24px 0 360px' }}><Story /></div>],
  args: { label: 'Plan', options: plans, native: false },
};
export default meta;
type Story = StoryObj<SelectFieldProps>;

export const Closed: Story = {};
export const Preselected: Story = { args: { defaultValue: 'pro' } };
export const WithHint: Story = { args: { hint: 'You can change this later.' } };
export const WithEmoji: Story = { args: { label: 'Country', options: countries, defaultValue: 'de' } };
export const Invalid: Story = { args: { error: 'Choose a plan to continue.' } };
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'pro' } };
export const DisabledPlaceholder: Story = { args: { disabled: true } };
export const LongValue: Story = {
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
  args: {
    options: [{ value: 'l', label: 'A very long option label that does not fit on one line of the trigger' }],
    defaultValue: 'l',
  },
};

/** Open list. */
export const Open: Story = { args: { defaultOpen: true, defaultValue: 'pro' } };
export const OpenWithDisabledOption: Story = { args: { defaultOpen: true } };
export const OpenWithTopChoices: Story = {
  args: { label: 'Country', options: countries, topValues: ['de', 'fr', 'pl'], defaultOpen: true, defaultValue: 'fr' },
};
export const OpenScrolling: Story = {
  args: {
    label: 'Country',
    options: [...countries, ...Array.from({ length: 20 }, (_, i) => ({ value: `x${i}`, label: `Option ${i + 1}` }))],
    defaultOpen: true,
  },
};

/** Searchable: type to filter by label or keywords, accents ignored. */
export const SearchableOpen: Story = {
  args: { label: 'Country', options: countries, topValues: ['de', 'fr'], searchable: true, defaultOpen: true },
};
export const SearchableFiltered: Story = {
  ...SearchableOpen,
  play: async () => {
    await userEvent.type(await screen.findByPlaceholderText('Search'), 'sp');
    await expect(screen.getAllByRole('option')).toHaveLength(1);
  },
};
export const SearchableNoResults: Story = {
  ...SearchableOpen,
  play: async () => {
    await userEvent.type(await screen.findByPlaceholderText('Search'), 'zzz');
    await expect(await screen.findByText('No results for “zzz”')).toBeVisible();
  },
};

/** The native `<select>` used on touch-first devices; forced here with `native`. */
export const Native: Story = { args: { native: true, label: 'Country', options: countries, topValues: ['de', 'fr'] } };
export const NativeInvalid: Story = { args: { native: true, error: 'Choose a plan.' } };
export const NativeDisabled: Story = { args: { native: true, disabled: true } };

/** Keyboard: Tab to the trigger, Enter opens, Arrow Down moves, Enter selects, focus returns. */
export const KeyboardSelect: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('combobox')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(canvas.getByRole('combobox')).toHaveTextContent('Pro'));
    await expect(canvas.getByRole('combobox')).toHaveFocus();
  },
};
/** Keyboard: Escape closes without changing the value. */
export const KeyboardEscape: Story = {
  args: { defaultValue: 'free' },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}{ArrowDown}{Escape}');
    await waitFor(() => expect(canvas.getByRole('combobox')).toHaveTextContent('Free'));
  },
};
/** Keyboard: typeahead selects a match without opening the list. */
export const KeyboardTypeahead: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard('te');
    await expect(canvas.getByRole('combobox')).toHaveTextContent('Team');
  },
};
