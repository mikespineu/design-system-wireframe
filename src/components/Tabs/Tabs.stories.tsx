import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tabs } from './Tabs';
import { Icon } from '../Icon';
import { InfoIcon, PlusIcon, SearchIcon } from '../../lib/sampleIcons';

/**
 * Switch which panel is shown below a tab list, built on Radix `Tabs` (tablist / tab / tabpanel).
 * The list wears the SegmentedControl look (`variant="segmented"`, default) or the TileGroup look (`variant="tile"`).
 * Arrow Left/Right move between tabs and activate them (`activationMode="automatic"`, default);
 * Home/End jump to the first/last. Use `manual` for slow or side-effecting panels.
 * Use `SegmentedControl` / `TileGroup` instead when the choice is a form value. The `sm` size is for fine pointers only.
 */
const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Sections',
    items: [
      { value: 'overview', label: 'Overview', panel: <p>Overview content.</p> },
      { value: 'activity', label: 'Activity', panel: <p>Activity content.</p> },
      { value: 'settings', label: 'Settings', panel: <p>Settings content.</p> },
    ],
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tileItems = [
  { value: 'add', label: 'Add', icon: <Icon icon={PlusIcon} size={24} />, panel: <p>Add content.</p> },
  { value: 'search', label: 'Search', icon: <Icon icon={SearchIcon} size={24} />, panel: <p>Search content.</p> },
  { value: 'info', label: 'Details', icon: <Icon icon={InfoIcon} size={24} />, panel: <p>Details content.</p> },
];

const eight = Array.from({ length: 8 }, (_, i) => ({
  value: `o${i + 1}`,
  label: `Option ${i + 1}`,
  icon: <Icon icon={PlusIcon} size={24} />,
  panel: <p>Option {i + 1} content.</p>,
}));

export const Default: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const FullWidth: Story = { args: { fullWidth: true } };
export const DisabledTab: Story = {
  args: {
    items: [
      { value: 'overview', label: 'Overview', panel: <p>Overview content.</p> },
      { value: 'activity', label: 'Activity', disabled: true, panel: <p>Activity content.</p> },
      { value: 'settings', label: 'Settings', panel: <p>Settings content.</p> },
    ],
  },
};
export const Tile: Story = { args: { variant: 'tile', items: tileItems } };
export const TileSmall: Story = { args: { variant: 'tile', size: 'sm', items: tileItems } };
export const TileDisabled: Story = {
  args: { variant: 'tile', items: tileItems.map((t, i) => (i === 1 ? { ...t, disabled: true } : t)) },
};
export const Manual: Story = { args: { activationMode: 'manual' } };
export const KeepMounted: Story = {
  args: {
    keepMounted: true,
    items: [
      { value: 'form', label: 'Form', panel: <input aria-label="Name" placeholder="Type, switch tabs, come back" /> },
      { value: 'other', label: 'Other', panel: <p>Other content.</p> },
    ],
  },
};
export const Overflow: Story = {
  args: { variant: 'tile', items: eight, activationMode: 'manual' },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};
export const Rtl: Story = { args: { dir: 'rtl' } };

export const Keyboard: Story = {
  args: {
    items: [
      { value: 'overview', label: 'Overview', panel: <p>Overview content.</p> },
      { value: 'activity', label: 'Activity', disabled: true, panel: <p>Activity content.</p> },
      { value: 'settings', label: 'Settings', panel: <p>Settings content.</p> },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true'));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(canvas.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true'));
    await userEvent.tab();
    await expect(canvas.getByRole('tabpanel')).toHaveFocus();
  },
};

export const KeyboardManual: Story = {
  args: { activationMode: 'manual' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveFocus());
    await expect(canvas.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true'));
  },
};
