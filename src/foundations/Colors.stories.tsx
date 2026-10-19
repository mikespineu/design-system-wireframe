import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Swatch = { token: string; hex: string; role: string; note?: string };

const palette: Swatch[] = [
  { token: 'white', hex: '#FFFFFF', role: 'Background' },
  { token: 'gray-50', hex: '#F7F7F7', role: 'Surface subtle' },
  { token: 'gray-100', hex: '#EEEEEE', role: 'Hover / fill' },
  { token: 'gray-200', hex: '#E0E0E0', role: 'Divider' },
  { token: 'gray-300', hex: '#C7C7C7', role: 'Border' },
  { token: 'gray-400', hex: '#A3A3A3', role: 'Disabled', note: '2.5:1, non-text' },
  { token: 'gray-500', hex: '#767676', role: 'Placeholder', note: '4.5:1' },
  { token: 'gray-600', hex: '#595959', role: 'Muted text', note: '7:1' },
  { token: 'gray-700', hex: '#404040', role: 'Body text', note: '10.4:1' },
  { token: 'gray-800', hex: '#262626', role: 'Hover on black' },
  { token: 'gray-900', hex: '#141414', role: 'Inverse surface' },
  { token: 'black', hex: '#000000', role: 'Ink, primary action', note: '21:1' },
];

const semantic = [
  'background',
  'surface',
  'surface-subtle',
  'fill',
  'divider',
  'border',
  'disabled',
  'placeholder',
  'text-muted',
  'text',
  'ink',
  'inverse',
  'primary',
  'primary-hover',
  'primary-contrast',
];

const status = [
  { name: 'info', hex: '#404040', label: 'Neutral information' },
  { name: 'success', hex: '#2E6B45', label: 'Saved successfully' },
  { name: 'error', hex: '#A3302B', label: 'Something went wrong' },
];

const Chip = ({ color }: { color: string }) => (
  <span
    className="block h-16 w-full border border-border"
    style={{ background: `var(--ds-color-${color})` }}
  />
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="mb-6 font-mono text-h3 text-ink">{title}</h2>
    {children}
  </section>
);

export const Palette: Story = {
  render: () => (
    <Section title="Palette">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {palette.map((s) => (
          <li key={s.token}>
            <Chip color={s.token} />
            <p className="mt-2 font-mono text-label uppercase text-ink">{s.token}</p>
            <p className="font-mono text-caption text-muted">{s.hex}</p>
            <p className="text-caption text-muted">
              {s.role}
              {s.note ? ` (${s.note})` : ''}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  ),
};

export const Semantic: Story = {
  render: () => (
    <Section title="Semantic roles">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {semantic.map((name) => (
          <li key={name}>
            <Chip color={name} />
            <p className="mt-2 font-mono text-caption text-ink">--ds-color-{name}</p>
          </li>
        ))}
      </ul>
    </Section>
  ),
};

export const Status: Story = {
  render: () => (
    <Section title="Status">
      <p className="mb-6 max-w-prose text-body text-text">
        The only hues in the system. Muted, used for feedback only, and always paired with an icon
        and a text label, never color alone.
      </p>
      <ul className="grid gap-4 sm:grid-cols-3">
        {status.map((s) => (
          <li
            key={s.name}
            className="border p-4"
            style={{
              color: `var(--ds-color-${s.name})`,
              background: `var(--ds-color-${s.name}-bg)`,
              borderColor: `var(--ds-color-${s.name}-border)`,
            }}
          >
            <p className="font-mono text-label uppercase">{s.name}</p>
            <p className="mt-1 text-body">{s.label}</p>
            <p className="mt-2 font-mono text-caption">fg {s.hex}</p>
          </li>
        ))}
      </ul>
    </Section>
  ),
};
