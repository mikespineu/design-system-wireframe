import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Dialog, DialogClose } from '../components/Dialog';
import { TextField } from '../components/Input';
import { SliderField } from '../components/Slider';
import { Badge, Tag } from '../components/Tag';

/**
 * The four example themes on one component set (docs/specs/Themes.md, canvas section 01). The markup is
 * identical in every panel; only the `data-theme` on the panel root differs. Use the toolbar theme switcher
 * to put the whole of Storybook (every story and docs page) on one of them.
 *
 * `bold` and `bold-dark` are opt-in: load `themes/bold.css` and `themes/bold-fonts.css` in your app.
 * Storybook loads them for you in `.storybook/preview.tsx`.
 */
const meta = {
  title: 'Foundations/Themes',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const themePanels = [
  { name: 'default', note: 'Wireframe. White ground, black ink and action, square, flat, 44 px.' },
  { name: 'dark', note: 'Same system, ground inverted. Photos dimmed to 85 % brightness.' },
  { name: 'bold', note: 'Ultramarine on lavender, uppercase 800 headings, 14 px corners, hard shadows, 48 px.' },
  { name: 'bold-dark', note: 'Indigo night with a raised surface, light violet brand, brand-colored dialog shadow.' },
] as const;

const Panel = ({ name, note, children }: { name: string; note: string; children: ReactNode }) => (
  <figure className="m-0 flex flex-col">
    <figcaption className="mb-2 flex justify-between font-mono text-caption text-muted">
      <span>{name}</span>
      <code>data-theme=&quot;{name}&quot;</code>
    </figcaption>
    <div
      data-theme={name}
      data-testid={`theme-panel-${name}`}
      className="flex flex-1 flex-col gap-6 border border-divider bg-background p-6 font-body text-body text-text"
    >
      {children}
    </div>
    <p className="mt-2 text-caption text-muted">{note}</p>
  </figure>
);

/** The same component set as the canvas, rendered once per theme. */
const ComponentSet = () => (
  <>
    <div className="flex flex-col gap-1">
      <h3 className="font-heading text-h3 text-emphasis">Order prints</h3>
      <p>Archival paper, shipped flat. Choose a format, then confirm.</p>
    </div>
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Continue</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="ghost">Learn more</Button>
    </div>
    <TextField label="Email" defaultValue="ada@studio.com" hint="Only used for the receipt." />
    <TextField label="Postcode" defaultValue="12" error="Enter a 5-digit postcode." />
    <div className="flex flex-wrap gap-6">
      <Checkbox label="Print" defaultChecked />
      <Checkbox label="Framed" />
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <Tag variant="solid">New</Tag>
      <Tag variant="subtle">Draft</Tag>
      <Tag variant="outline">Archived</Tag>
      <Badge count={3} />
    </div>
    <Alert severity="success" title="Order placed">
      Prints ship in 3 working days.
    </Alert>
    <Alert severity="error" title="Payment failed">
      Your card was declined. Try another card.
    </Alert>
    <SliderField label="Brightness" defaultValue={60} unit="%" bubble="always" />
    <Dialog
      trigger={<Button variant="secondary">Delete print</Button>}
      title="Delete print?"
      description="It is removed from every collection."
      footer={
        <>
          <DialogClose asChild>
            <Button variant="secondary">Keep</Button>
          </DialogClose>
          <Button>Delete</Button>
        </>
      }
    >
      You can restore it from the archive for 30 days.
    </Dialog>
  </>
);

/** Four panels, each scoped with its own `data-theme`, so they all show at once whatever the toolbar says. */
export const SideBySide: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
      {themePanels.map(({ name, note }) => (
        <Panel key={name} name={name} note={note}>
          <ComponentSet />
        </Panel>
      ))}
    </div>
  ),
};

/** Tab through one panel: focus order is identical in every theme, only the ring color and width change. */
export const Keyboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {themePanels.map(({ name, note }) => (
        <Panel key={name} name={name} note={note}>
          <TextField label="Email" defaultValue="ada@studio.com" />
          <Checkbox label="Print" />
          <div className="flex gap-3">
            <Button variant="primary">Continue</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </Panel>
      ))}
    </div>
  ),
};
