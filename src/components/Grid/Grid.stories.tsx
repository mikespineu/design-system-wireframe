import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid } from './Grid';

const cells = (n: number) =>
  Array.from({ length: n }, (_, i) => (
    <div key={i} className="border border-ink px-3 py-2">{i + 1}</div>
  ));

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  tags: ['autodocs'],
  args: { children: cells(6) },
  argTypes: {
    columns: { control: 'select', options: [1, 2, 3, 4, 6, 12] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'stretch'] },
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24] },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneColumn: Story = { args: { columns: 1 } };
export const TwoColumns: Story = { args: { columns: 2 } };
export const ThreeColumns: Story = { args: { columns: 3 } };
export const FourColumns: Story = { args: { columns: 4 } };
export const SixColumns: Story = { args: { columns: 6 } };
export const TwelveColumns: Story = { args: { columns: 12, children: cells(12) } };

export const Spans: Story = {
  render: () => (
    <Grid columns={12}>
      <div className="col-span-12 md:col-span-8 border border-ink px-3 py-2">Main</div>
      <div className="col-span-12 md:col-span-4 border border-ink px-3 py-2">Aside</div>
    </Grid>
  ),
};

export const GapSteps: Story = {
  render: () => (
    <Grid columns={1} gap={8}>
      {([0, 2, 4, 8, 12] as const).map((g) => (
        <Grid key={g} columns={3} gap={g}>{cells(3)}</Grid>
      ))}
    </Grid>
  ),
};

export const Align: Story = {
  render: () => (
    <Grid columns={2} gap={8}>
      {(['stretch', 'start', 'center', 'end'] as const).map((a) => (
        <Grid key={a} columns={3} align={a}>
          <div className="border border-ink p-2" style={{ height: 64 }}>{a}</div>
          <div className="border border-ink p-2">B</div>
          <div className="border border-ink p-2">C</div>
        </Grid>
      ))}
    </Grid>
  ),
};

/** 1 column below 640 px, 2 from 640, 3 from 768, 4 from 1024. Use the viewport toolbar. */
export const Responsive: Story = {
  args: { columns: { base: 1, sm: 2, md: 3, lg: 4 }, gap: { base: 4, md: 6 }, children: cells(8) },
};

export const AsList: Story = {
  render: () => (
    <Grid as="ol" columns={3}>
      <li>One</li><li>Two</li><li>Three</li>
    </Grid>
  ),
};

export const AsChild: Story = {
  render: () => (
    <Grid asChild columns={2}>
      <section aria-label="Cards">{cells(4)}</section>
    </Grid>
  ),
};

/** Keyboard: Tab visits the links row by row; the Grid itself is never focusable. */
export const KeyboardOrder: Story = {
  render: () => (
    <Grid columns={3}>
      {[1, 2, 3, 4, 5, 6].map((n) => <a key={n} href={`#${n}`}>Link {n}</a>)}
    </Grid>
  ),
};
