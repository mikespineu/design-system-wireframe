import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button';
import { Tag } from '../Tag';
import { Theme, themes } from './Theme';

const meta = {
  title: 'Foundations/Theme',
  component: Theme,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { theme: 'wireframe' },
  argTypes: { theme: { control: 'inline-radio', options: themes } },
} satisfies Meta<typeof Theme>;

export default meta;
type Story = StoryObj<typeof meta>;

const Sample = () => (
  <div className="flex flex-col gap-4 border border-border p-6">
    <h3 className="text-h3">Theme preview</h3>
    <p className="text-body text-text">Every --ds-* token in this box resolves against the theme above.</p>
    <div className="flex flex-wrap items-center gap-2">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Tag variant="subtle">Draft</Tag>
    </div>
  </div>
);

/** Scope a theme to a subtree. Use the toolbar's Theme menu to switch the whole page. */
export const Default: Story = {
  render: (args) => (
    <Theme {...args}>
      <Sample />
    </Theme>
  ),
};

/** Every registered theme side by side. */
export const AllThemes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {themes.map((name) => (
        <Theme key={name} theme={name}>
          <p className="text-label uppercase text-muted">{name}</p>
          <Sample />
        </Theme>
      ))}
    </div>
  ),
};
