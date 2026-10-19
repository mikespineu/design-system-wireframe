import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Shape and line',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Cell = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    {children}
    <p className="mt-2 font-mono text-caption text-muted">{label}</p>
  </div>
);

export const Borders: Story = {
  render: () => (
    <div className="grid gap-6 sm:grid-cols-3">
      <Cell label="--ds-border · divider">
        <div className="h-24 border border-divider" />
      </Cell>
      <Cell label="--ds-border-strong · black">
        <div className="h-24 border border-ink" />
      </Cell>
      <Cell label="--ds-color-fill · hover / fill">
        <div className="h-24 bg-fill" />
      </Cell>
    </div>
  ),
};

export const RadiusAndShadow: Story = {
  render: () => (
    <p className="max-w-prose text-body text-text">
      Radius is <code>0</code> and shadows are <code>none</code>. Depth comes from borders and gray
      fills. <code>rounded-md</code> resolves to 0; <code>shadow-*</code> utilities generate no CSS.
    </p>
  ),
};

export const Focus: Story = {
  render: () => (
    <button
      type="button"
      className="h-control border border-ink px-6 font-mono text-body focus-visible:focus-ring"
    >
      Tab to focus: 2 px black ring, 2 px offset
    </button>
  ),
};

export const Photography: Story = {
  render: () => (
    <figure className="max-w-xs">
      <svg
        viewBox="0 0 80 100"
        className="photo aspect-[4/5] w-full object-cover"
        role="img"
        aria-label="Abstract colored shapes rendered in grayscale"
      >
        <rect width="80" height="100" fill="#d9a441" />
        <circle cx="30" cy="40" r="22" fill="#3a7bd5" />
        <rect x="35" y="55" width="40" height="40" fill="#c0392b" />
      </svg>
      <figcaption className="mt-2 font-mono text-caption text-muted">
        .photo · grayscale(1) contrast(1.1) · 4:5
      </figcaption>
    </figure>
  ),
};
