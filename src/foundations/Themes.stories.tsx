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

/*
 * Layout uses inline styles on --ds-* tokens, not Tailwind classes: Tailwind scans all of src, so a utility
 * used only here would be added to the shipped dist/styles.css. Storybook-only code must not change the build.
 */
const row = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--ds-space-3)' } as const;
const grid = { display: 'grid', gap: 'var(--ds-space-6)', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))' } as const;

const Panel = ({ name, note, children }: { name: string; note: string; children: ReactNode }) => (
  <figure style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
    <figcaption
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 'var(--ds-space-2)',
        font: 'var(--ds-text-caption-size) / var(--ds-text-caption-line-height) var(--ds-font-mono)',
        color: 'var(--ds-color-text-muted)',
      }}
    >
      <span>{name}</span>
      <code>data-theme=&quot;{name}&quot;</code>
    </figcaption>
    {/*
      Reset: the toolbar puts a theme on <html>, and `dark` only sets color roles. Every panel sits in a
      `default` scope first, so the panel shows exactly its own theme whatever the toolbar says.
    */}
    <div data-theme="default" data-testid={`theme-reset-${name}`} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div
        data-theme={name}
        data-testid={`theme-panel-${name}`}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-space-6)',
          padding: 'var(--ds-space-6)',
          border: 'var(--ds-border-width) solid var(--ds-color-divider)',
          background: 'var(--ds-color-background)',
          color: 'var(--ds-color-text)',
          font: 'var(--ds-text-body-size) / var(--ds-text-body-line-height) var(--ds-font-body)',
        }}
      >
        {children}
      </div>
    </div>
    <p
      style={{
        margin: 'var(--ds-space-2) 0 0',
        fontSize: 'var(--ds-text-caption-size)',
        color: 'var(--ds-color-text-muted)',
      }}
    >
      {note}
    </p>
  </figure>
);

/** The same component set as the canvas, rendered once per theme. */
const ComponentSet = () => (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-1)' }}>
      <h3
        style={{
          margin: 0,
          font: 'var(--ds-text-heading-weight) var(--ds-text-h3-size) / var(--ds-text-h3-line-height) var(--ds-font-heading)',
          letterSpacing: 'var(--ds-text-h3-tracking)',
          textTransform: 'var(--ds-text-heading-transform)' as 'none',
          color: 'var(--ds-color-text-emphasis)',
        }}
      >
        Order prints
      </h3>
      <p style={{ margin: 0 }}>Archival paper, shipped flat. Choose a format, then confirm.</p>
    </div>
    <div style={row}>
      <Button variant="primary">Continue</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="ghost">Learn more</Button>
    </div>
    <TextField label="Email" defaultValue="ada@studio.com" hint="Only used for the receipt." />
    <TextField label="Postcode" defaultValue="12" error="Enter a 5-digit postcode." />
    <div style={{ ...row, gap: 'var(--ds-space-6)' }}>
      <Checkbox label="Print" defaultChecked />
      <Checkbox label="Framed" />
    </div>
    <div style={row}>
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
    <div style={grid}>
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
    <div style={grid}>
      {themePanels.map(({ name, note }) => (
        <Panel key={name} name={name} note={note}>
          <TextField label="Email" defaultValue="ada@studio.com" />
          <Checkbox label="Print" />
          <div style={row}>
            <Button variant="primary">Continue</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </Panel>
      ))}
    </div>
  ),
};
