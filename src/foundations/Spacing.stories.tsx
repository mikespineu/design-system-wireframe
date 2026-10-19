import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Spacing',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = [
  { token: 1, px: 4, utility: 'p-1' },
  { token: 2, px: 8, utility: 'p-2' },
  { token: 3, px: 12, utility: 'p-3' },
  { token: 4, px: 16, utility: 'p-4' },
  { token: 6, px: 24, utility: 'p-6' },
  { token: 8, px: 32, utility: 'p-8' },
  { token: 12, px: 48, utility: 'p-12' },
  { token: 16, px: 64, utility: 'p-16' },
  { token: 24, px: 96, utility: 'p-24' },
];

export const Scale: Story = {
  render: () => (
    <div>
      <p className="mb-6 max-w-prose text-body text-text">
        4 px base. Tailwind&apos;s numeric scale maps straight onto it: <code>p-4</code> = 16 px,{' '}
        <code>gap-6</code> = 24 px.
      </p>
      <ul className="divide-y divide-divider border-y border-divider">
        {steps.map((s) => (
          <li key={s.token} className="grid grid-cols-[10rem_1fr] items-center gap-4 py-3">
            <div>
              <p className="font-mono text-caption text-ink">--ds-space-{s.token}</p>
              <p className="font-mono text-caption text-muted">
                {s.px}px · {s.utility}
              </p>
            </div>
            <span
              className="block h-4 bg-ink"
              style={{ width: `var(--ds-space-${s.token})` }}
              aria-label={`${s.px} pixels`}
            />
          </li>
        ))}
      </ul>
    </div>
  ),
};

export const ControlHeight: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <span className="flex h-control items-center border border-ink px-6 font-mono text-body">
        44 px control
      </span>
      <span className="font-mono text-caption text-muted">h-control · --ds-control-height</span>
    </div>
  ),
};
