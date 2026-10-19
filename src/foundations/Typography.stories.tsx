import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const styles = [
  { name: 'display', spec: 'Red Hat Mono 500 · 72 / 72 · −4%', cls: 'font-mono text-display text-ink' },
  { name: 'h1', spec: 'Red Hat Mono 500 · 48 / 53 · −3%', cls: 'font-mono text-h1 text-ink' },
  { name: 'h2', spec: 'Red Hat Mono 500 · 32 / 38 · −2%', cls: 'font-mono text-h2 text-ink' },
  { name: 'h3', spec: 'Red Hat Mono 500 · 22 / 29', cls: 'font-mono text-h3 text-ink' },
  { name: 'body-lg', spec: 'Red Hat Text 400 · 18 / 29', cls: 'text-body-lg text-text' },
  { name: 'body', spec: 'Red Hat Text 400 · 16 / 26', cls: 'text-body text-text' },
  { name: 'label', spec: 'Red Hat Mono 500 · 12 / 16 · +8% · uppercase', cls: 'font-mono text-label uppercase text-ink' },
  { name: 'caption', spec: 'Red Hat Text 400 · 13 / 20 · gray-600', cls: 'text-caption text-muted' },
];

export const Scale: Story = {
  render: () => (
    <ul className="divide-y divide-divider border-y border-divider">
      {styles.map((s) => (
        <li key={s.name} className="grid items-baseline gap-2 py-6 md:grid-cols-[14rem_1fr] md:gap-8">
          <div>
            <p className="font-mono text-label uppercase text-ink">{s.name}</p>
            <p className="font-mono text-caption text-muted">{s.spec}</p>
          </div>
          <p className={s.cls}>Quiet type for a loud world</p>
        </li>
      ))}
    </ul>
  ),
};

export const Families: Story = {
  render: () => (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="border border-divider p-6">
        <p className="font-mono text-label uppercase text-muted">Titles · font-mono</p>
        <p className="mt-4 font-mono text-h2 text-ink">Red Hat Mono</p>
        <p className="mt-2 font-mono text-body text-text">ABCDEFGHIJKLM abcdefghijklm 0123456789</p>
      </div>
      <div className="border border-divider p-6">
        <p className="font-mono text-label uppercase text-muted">Body · font-sans</p>
        <p className="mt-4 text-h2 text-ink">Red Hat Text</p>
        <p className="mt-2 text-body text-text">ABCDEFGHIJKLM abcdefghijklm 0123456789</p>
      </div>
    </div>
  ),
};

export const Specimen: Story = {
  render: () => (
    <article className="max-w-prose">
      <p className="font-mono text-label uppercase text-muted">Series / 01</p>
      <h1 className="mt-2 text-h1 text-ink">Headings default to Red Hat Mono</h1>
      <p className="mt-4 text-body-lg text-text">
        Lead paragraphs use body-lg. Everything else reads in body, set in Red Hat Text at 16 / 26
        for a comfortable measure.
      </p>
      <h2 className="mt-8 text-h3 text-ink">Section heading</h2>
      <p className="mt-2 text-body text-text">
        Body copy sits in gray-700 for a 10.4:1 contrast ratio. Secondary notes use{' '}
        <span className="text-muted">muted gray-600</span>.
      </p>
      <p className="mt-4 text-caption text-muted">Caption: image credit or helper text.</p>
    </article>
  ),
};
