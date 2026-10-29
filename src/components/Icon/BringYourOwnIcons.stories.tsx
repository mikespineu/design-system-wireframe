import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import { IconProvider } from './IconProvider';
import { IconButton } from '../IconButton';
import { Dialog } from '../Dialog';
import { Checkbox } from '../Checkbox';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { iconSources, lucideIconSet } from './librarySources';

/** Live examples of third-party and custom icons. See the "Bring your own icons" docs page. */
const meta = {
  title: 'Foundations/Icon/Bring your own icons',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each source rendered through `Icon` at the three system sizes. */
export const InIcon: Story = {
  render: () => (
    <ul className="flex list-none flex-col gap-4 p-0">
      {iconSources.map(({ name, icon }) => (
        <li key={name} className="flex items-center gap-4">
          <span className="w-48 text-caption text-muted">{name}</span>
          <Icon icon={icon} size="sm" />
          <Icon icon={icon} size="md" />
          <Icon icon={icon} size="lg" />
        </li>
      ))}
    </ul>
  ),
};

/** Each source as the `icon` of an `IconButton`. Tab stops on the button, never on the svg. */
export const InIconButton: Story = {
  render: () => (
    <ul className="flex list-none gap-4 p-0">
      {iconSources.map(({ name, icon }) => (
        <li key={name}>
          <IconButton icon={icon} aria-label={`Close (${name})`} variant="secondary" />
        </li>
      ))}
    </ul>
  ),
};

/** One `IconProvider` re-skins Dialog, Checkbox and Alert with Lucide. */
export const ProviderWithLucide: Story = {
  render: () => (
    <IconProvider icons={lucideIconSet}>
      <div className="flex flex-col items-start gap-6">
        <Dialog
          trigger={<Button>Open dialog</Button>}
          title="Lucide close"
          description="The close button uses the Lucide X."
        >
          <p>Content</p>
        </Dialog>
        <Checkbox defaultChecked label="Checked with Lucide" />
        <Checkbox checked="indeterminate" label="Indeterminate with Lucide" />
        <Alert severity="success" title="Saved">
          Success uses the Lucide circle check.
        </Alert>
      </div>
    </IconProvider>
  ),
};
