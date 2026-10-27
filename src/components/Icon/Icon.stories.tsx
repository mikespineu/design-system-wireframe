import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { IconProvider } from './IconProvider';
import { RoleIcon } from './RoleIcon';
import { defaultGlyphs } from './glyphs';
import type { IconRole } from './types';
import { PlusIcon, InfoIcon, WarningIcon, SearchIcon } from '../../lib/sampleIcons';

const meta = {
  title: 'Foundations/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { icon: PlusIcon, size: 'md' },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg', 24] } },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const roles = Object.keys(defaultGlyphs) as IconRole[];

/** The 11 default glyphs, rendered through their roles at 24 px. */
export const DefaultGlyphs: Story = {
  render: () => (
    <ul className="grid grid-cols-5 gap-6 list-none p-0">
      {roles.map((role) => (
        <li key={role} className="flex flex-col items-center gap-2 border border-divider p-4">
          <RoleIcon role={role} size={24} />
          <span className="font-mono text-caption text-muted">{role}</span>
        </li>
      ))}
    </ul>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-6">
      {(['sm', 'md', 'lg', 24] as const).map((size) => (
        <Icon key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const Labeled: Story = { args: { icon: InfoIcon, label: 'Information' } };
export const Heavy: Story = { args: { icon: WarningIcon, size: 20, strokeWidth: 2 } };

/** Resolution: default glyph, provider, prop override, nested providers. */
export const Resolution: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <RoleIcon role="close" size={24} />
      <IconProvider icons={{ close: SearchIcon }}>
        <RoleIcon role="close" size={24} />
        <RoleIcon role="close" size={24} override={PlusIcon} />
        <IconProvider icons={{ check: InfoIcon }}>
          <RoleIcon role="close" size={24} />
          <RoleIcon role="check" size={24} />
        </IconProvider>
      </IconProvider>
    </div>
  ),
};
