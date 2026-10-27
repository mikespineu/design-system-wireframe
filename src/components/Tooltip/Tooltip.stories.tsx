import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, screen } from 'storybook/test';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { InfoIcon } from '../../lib/sampleIcons';

/**
 * Short plain-text hint on Radix `Tooltip`. Opens on hover (400 ms) and on keyboard focus,
 * closes on Esc. The trigger must be focusable and keeps its own styles.
 */
const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { layout: 'centered', docs: { story: { inline: false, iframeHeight: 240 } } },
  decorators: [(Story) => <div style={{ padding: 80 }}><Story /></div>],
  args: {
    content: 'Add a photo',
    children: <IconButton icon={InfoIcon} aria-label="Add photo" />,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: only the trigger renders. */
export const Closed: Story = {};
/** Open, default side top. */
export const Open: Story = { args: { defaultOpen: true } };
export const SideTop: Story = { args: { defaultOpen: true, side: 'top' } };
export const SideRight: Story = { args: { defaultOpen: true, side: 'right' } };
export const SideBottom: Story = { args: { defaultOpen: true, side: 'bottom' } };
export const SideLeft: Story = { args: { defaultOpen: true, side: 'left' } };
export const AlignStart: Story = { args: { defaultOpen: true, align: 'start', children: <Button>Save</Button> } };
export const AlignEnd: Story = { args: { defaultOpen: true, align: 'end', children: <Button>Save</Button> } };
/** Wraps at 240 px. */
export const LongText: Story = {
  args: {
    defaultOpen: true,
    side: 'bottom',
    content: 'This label is long enough that it has to wrap onto several lines at the maximum width.',
  },
};

/** Tab to the trigger: opens at once. Esc closes; focus stays. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Add a photo'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    await expect(canvasElement.querySelector('button')).toHaveFocus();
  },
};
