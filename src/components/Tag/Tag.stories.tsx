import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Badge, Tag } from './Tag';
import { lucideIconSet } from '../Icon/librarySources';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  args: { children: 'New' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['solid', 'subtle', 'outline', 'neutral'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = { args: { variant: 'solid', children: 'New' } };
export const Subtle: Story = { args: { variant: 'subtle', children: 'Draft' } };
export const Outline: Story = { args: { variant: 'outline', children: 'Archived' } };
export const Small: Story = { args: { variant: 'subtle', size: 'sm', children: 'Draft' } };

export const Removable: Story = {
  args: { variant: 'neutral', children: 'landscape', onRemove: fn() },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Remove landscape' }));
    await expect(args.onRemove).toHaveBeenCalled();
  },
};

export const CountBadge: StoryObj<typeof Badge> = {
  render: () => <Badge count={12} aria-label="12 unread" />,
};

export const All: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag variant="solid">New</Tag>
      <Tag variant="subtle">Draft</Tag>
      <Tag variant="outline">Archived</Tag>
      <Tag variant="neutral" onRemove={fn()}>landscape</Tag>
      <Badge count={12} />
    </div>
  ),
};

/** Default remove glyph (left) against a Lucide `removeIcon` (right). */
export const CustomIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tag variant="neutral" onRemove={() => {}}>landscape</Tag>
      <Tag variant="neutral" onRemove={() => {}} removeIcon={lucideIconSet.close}>landscape</Tag>
    </div>
  ),
};
