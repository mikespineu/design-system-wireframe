import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { TextField } from '../components/Input';
import { themeRoleGroups } from '../styles/roles';

const meta = {
  title: 'Foundations/Theming',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const typeStyles = ['display', 'h1', 'h2', 'h3', 'body-lg', 'body', 'body-sm', 'body-xs', 'caption', 'label', 'ui', 'ui-sm', 'ui-xs'];
const headingStyles = new Set(['display', 'h1', 'h2', 'h3']);

const Section = ({ title, count, children }: { title: string; count: number; children: ReactNode }) => (
  <section className="mb-12">
    <h2 className="mb-1 font-heading text-h3 text-emphasis">{title}</h2>
    <p className="mb-6 text-caption text-muted">{count} roles</p>
    {children}
  </section>
);

const Name = ({ role }: { role: string }) => <code className="font-mono text-caption text-muted">{role}</code>;

const ColorRoles = () => (
  <Section title="Color" count={themeRoleGroups.color.length}>
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {themeRoleGroups.color.map((role) => (
        <li key={role}>
          <span className="block h-12 w-full border border-border" style={{ background: `var(${role})` }} />
          <Name role={role} />
        </li>
      ))}
    </ul>
  </Section>
);

const FontRoles = () => (
  <Section title="Font and weight" count={themeRoleGroups.font.length + themeRoleGroups.fontWeight.length}>
    <ul className="flex flex-col gap-4">
      {themeRoleGroups.font.map((role) => (
        <li key={role}>
          <p className="text-body-lg text-emphasis" style={{ fontFamily: `var(${role})` }}>
            Sphinx of black quartz, judge my vow
          </p>
          <Name role={role} />
        </li>
      ))}
      {themeRoleGroups.fontWeight.map((role) => (
        <li key={role}>
          <p className="text-body-lg text-emphasis" style={{ fontWeight: `var(${role})` }}>
            Sphinx of black quartz, judge my vow
          </p>
          <Name role={role} />
        </li>
      ))}
    </ul>
  </Section>
);

const TypeScale = () => (
  <Section title="Type scale" count={themeRoleGroups.typeScale.length}>
    <ul className="flex flex-col gap-4">
      {typeStyles.map((s) => {
        const own = (part: string) => `var(--ds-text-${s}-${part})`;
        const heading = headingStyles.has(s);
        const label = s === 'label';
        return (
          <li key={s}>
            <p
              className="text-emphasis"
              style={{
                fontFamily: heading ? 'var(--ds-font-heading)' : s.startsWith('body') || s === 'caption' ? 'var(--ds-font-body)' : 'var(--ds-font-label)',
                fontSize: own('size'),
                lineHeight: own('line-height'),
                letterSpacing: heading || label ? own('tracking') : undefined,
                fontWeight: heading ? 'var(--ds-text-heading-weight)' : label || s === 'ui' ? own('weight') : undefined,
                textTransform: label ? 'var(--ds-text-label-transform)' : heading ? 'var(--ds-text-heading-transform)' : undefined,
              }}
            >
              {s} The quick brown fox
            </p>
            <Name role={`--ds-text-${s}-*`} />
          </li>
        );
      })}
    </ul>
  </Section>
);

const ShapeRoles = () => (
  <Section title="Radius, shadow and shape" count={themeRoleGroups.radius.length + themeRoleGroups.shadow.length + themeRoleGroups.shape.length}>
    <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {themeRoleGroups.radius.map((role) => (
        <li key={role}>
          <span className="block h-12 w-full border-2 border-strong" style={{ borderRadius: `var(${role})` }} />
          <Name role={role} />
        </li>
      ))}
      {themeRoleGroups.shadow.map((role) => (
        <li key={role}>
          <span className="block h-12 w-full bg-surface" style={{ boxShadow: `var(${role})` }} />
          <Name role={role} />
        </li>
      ))}
    </ul>
    <ul className="mt-6 flex flex-col gap-1">
      {themeRoleGroups.shape.map((role) => (
        <li key={role}>
          <Name role={role} />
        </li>
      ))}
    </ul>
  </Section>
);

const Roles = () => (
  <>
    <ColorRoles />
    <FontRoles />
    <TypeScale />
    <ShapeRoles />
  </>
);

const Interactive = () => (
  <Section title="Keyboard" count={0}>
    <div className="flex max-w-md flex-col gap-4">
      <TextField label="Name" hint="Tab through the controls: the focus ring reads the color-focus role." />
      <Checkbox label="Remember me" />
      <div className="flex gap-3">
        <Button variant="primary">Save</Button>
        <Button variant="secondary">Cancel</Button>
      </div>
    </div>
  </Section>
);

export const Default: Story = {
  render: () => (
    <div className="bg-background p-6">
      <Roles />
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div data-theme="dark" className="bg-background p-6">
      <Roles />
    </div>
  ),
};

export const KeyboardDefault: Story = {
  render: () => (
    <div className="bg-background p-6">
      <Interactive />
    </div>
  ),
};

export const KeyboardDark: Story = {
  render: () => (
    <div data-theme="dark" className="bg-background p-6">
      <Interactive />
    </div>
  ),
};

export const Scoped: Story = {
  render: () => (
    <div className="bg-background p-6">
      <p className="mb-4 text-body text-emphasis">A dark card inside a light page.</p>
      <div data-theme="dark" className="bg-background p-6">
        <Interactive />
      </div>
    </div>
  ),
};
