import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { icons, type IconName } from './icons';

const meta = {
  title: 'Foundations/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { name: 'plus', size: 16, strokeWidth: 1.5 },
  argTypes: { name: { control: 'select', options: Object.keys(icons) } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllIcons: Story = {
  render: (args) => (
    <ul className="grid grid-cols-5 gap-6 list-none p-0">
      {(Object.keys(icons) as IconName[]).map((name) => (
        <li key={name} className="flex flex-col items-center gap-2 border border-divider p-4">
          <Icon {...args} name={name} size={24} />
          <span className="font-mono text-caption text-muted">{name}</span>
        </li>
      ))}
    </ul>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      {[12, 14, 16, 18, 20, 24].map((size) => (
        <Icon key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const Labeled: Story = { args: { name: 'info', label: 'Information' } };
export const Heavy: Story = { args: { name: 'warning', size: 20, strokeWidth: 2 } };
