import { useState, type ComponentType, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Slider, SliderField as SliderFieldTyped, type SliderOwnProps } from './Slider';
import { lucideIconSet } from '../Icon/librarySources';

/** Stories pass loose props so one `args` object can cover both scale modes; the real component keeps the strict union. */
type StoryProps = SliderOwnProps & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  values?: readonly number[];
  spacing?: 'index' | 'value';
  min?: number;
  max?: number;
  step?: number;
  bubble?: 'auto' | 'always' | 'off';
  showInput?: boolean;
  marks?: 'none' | 'steps' | 'ends' | readonly number[];
};
const SliderField = SliderFieldTyped as ComponentType<StoryProps>;

/**
 * Pick one number with a single thumb, built on Radix `Slider`. Works on a uniform scale
 * (`min` / `max` / `step`) or a custom list (`values`); both snap only to allowed values.
 * The value bubble shows while dragging or focused. `showInput` adds a typed field that snaps on Enter or blur.
 * `SliderField` adds the label, hint and error; a bare `Slider` needs `aria-label`.
 */
const meta = {
  title: 'Components/Slider',
  component: SliderField,
  tags: ['autodocs'],
  args: { label: 'Volume', defaultValue: 40 },
  decorators: [(Story) => <div style={{ maxWidth: 480, padding: 'var(--ds-space-12) var(--ds-space-6)' }}><Story /></div>],
} satisfies Meta<typeof SliderField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: 'Applies to all rooms.' } };
export const Invalid: Story = { args: { error: 'volume is too loud for night mode' } };
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg', hint: 'Touch size: 48 px hit area.' } };

export const WithInput: Story = { args: { showInput: true, step: 5 } };
export const WithUnitInput: Story = { args: { showInput: true, unit: 'cm', label: 'Height', min: 100, max: 250, defaultValue: 180 } };
export const InputInvalid: Story = { args: { showInput: true, error: 'pick a value below 80' } };
export const InputDisabled: Story = { args: { showInput: true, disabled: true } };

export const BubbleAlways: Story = { args: { bubble: 'always', unit: '%' } };
export const BubbleAlwaysInvalid: Story = { args: { bubble: 'always', error: 'too loud' } };
export const BubbleAlwaysDisabled: Story = { args: { bubble: 'always', disabled: true } };
export const BubbleOff: Story = { args: { bubble: 'off' } };

export const CustomValues: Story = {
  args: { label: 'Rating', values: [1, 2, 3, 5, 8, 10], defaultValue: 3, showInput: true },
};
export const CustomValuesNoMarks: Story = { args: { label: 'Rating', values: [1, 2, 3, 5, 8, 10], marks: 'none' } };
export const CustomValuesEnds: Story = { args: { label: 'Rating', values: [1, 2, 3, 5, 8, 10], marks: 'ends' } };
export const CustomValuesSomeLabels: Story = { args: { label: 'Rating', values: [1, 2, 3, 5, 8, 10], marks: [1, 5, 10] } };
/** Mixed steps: 200, 240, then every cm from 241 to 280, placed at their real positions with `spacing="value"` (240 is mid-track). */
const MIXED_STEP_VALUES = [200, 240, ...Array.from({ length: 40 }, (_, i) => 241 + i)];
/** Same list with the default index spacing: each value gets an equal slot, so 200 sits right next to 240. */
export const MixedStepsIndexSpacing: Story = {
  args: { label: 'Length', values: MIXED_STEP_VALUES, unit: 'cm', showInput: true, marks: [200, 260, 280], defaultValue: 240 },
};
export const MixedSteps: Story = {
  args: { label: 'Length', values: MIXED_STEP_VALUES, unit: 'cm', showInput: true, spacing: 'value', marks: [200, 240, 280], defaultValue: 240 },
};
export const UniformSteps: Story = { args: { marks: 'steps', step: 25, unit: '%', defaultValue: 50 } };
export const UniformEnds: Story = { args: { marks: 'ends', unit: '%' } };
export const MarksDisabled: Story = { args: { marks: 'steps', step: 25, disabled: true, defaultValue: 50 } };

export const Stepper: Story = {
  args: { label: 'Height', stepper: true, unit: 'cm', min: 100, max: 250, step: 10, defaultValue: 180 },
};
export const StepperAtMin: Story = { args: { label: 'Height', stepper: true, unit: 'cm', min: 100, max: 250, step: 10, defaultValue: 100 } };
export const StepperDisabled: Story = { args: { label: 'Height', stepper: true, unit: 'cm', disabled: true } };
export const StepperInvalid: Story = { args: { label: 'Height', stepper: true, unit: 'cm', error: 'too tall' } };
export const StepperCustomValues: Story = { args: { label: 'Shoe size', stepper: true, values: [24, 27, 32, 43, 55, 65], defaultValue: 43 } };
export const StepperEditable: Story = {
  args: { label: 'Height', stepper: true, bubble: 'always', unit: 'cm', min: 100, max: 250, step: 10, defaultValue: 180 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('slider').focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('textbox')).toHaveFocus();
  },
};

export const RightToLeft: Story = { args: { dir: 'rtl' } };

/** Outside a Field the slider needs `aria-label` or `aria-labelledby`. */
export const BareWithAriaLabel: Story = {
  render: () => <Slider aria-label="Zoom" defaultValue={25} unit="%" />,
};

export const Controlled: Story = {
  render: function Render() {
    const [value, setValue] = useState(30);
    return (
      <div className="flex flex-col gap-4">
        <SliderField label="Brightness" value={value} onValueChange={setValue} unit="%" />
        <output>Value: {value}</output>
        <button type="button" onClick={() => setValue(80)}>Set to 80</button>
      </div>
    );
  },
};

/** Keyboard: Tab to the thumb, then arrows, Page keys, Home and End. */
export const Keyboard: Story = {
  args: { label: 'Level', defaultValue: 50 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const thumb = canvas.getByRole('slider', { name: 'Level' });
    await expect(thumb).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '51');
    await userEvent.keyboard('{PageUp}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '61');
    await userEvent.keyboard('{Home}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{End}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');
  },
};

/** Typing 4 in the list [1, 2, 3, 5, 8, 10] snaps to 5; 120 clamps to the end. */
export const InputSnapping: Story = {
  args: { label: 'Rating', values: [1, 2, 3, 5, 8, 10], showInput: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Rating' });
    await userEvent.clear(input);
    await userEvent.type(input, '4{Enter}');
    await expect(input).toHaveValue('5');
    await userEvent.clear(input);
    await userEvent.type(input, '120{Enter}');
    await expect(input).toHaveValue('10');
  },
};

/** Default stepper glyphs (top) against Lucide overrides (bottom). */
export const CustomIcons: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <SliderField label="Default" stepper defaultValue={5} min={0} max={10} />
      <SliderField label="Lucide" stepper defaultValue={5} min={0} max={10} decrementIcon={lucideIconSet.minus} incrementIcon={lucideIconSet.plus} />
    </div>
  ),
};
