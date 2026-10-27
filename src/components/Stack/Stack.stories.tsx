import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './Stack';
import { Grid } from '../Grid';
import { Button } from '../Button';

const Box = ({ children, h }: { children: React.ReactNode; h?: number }) => (
  <div className="border border-ink px-3 py-2" style={h ? { height: h } : undefined}>{children}</div>
);

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  args: { children: [<Box key="1">One</Box>, <Box key="2">Two</Box>, <Box key="3">Three</Box>] },
  argTypes: {
    direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24] },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};
export const Horizontal: Story = { args: { direction: 'horizontal' } };

const GAPS = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24] as const;
export const GapSteps: Story = {
  render: () => (
    <Stack gap={8}>
      {GAPS.map((g) => (
        <Stack key={g} direction="horizontal" gap={g} align="center">
          <span className="w-12 font-mono text-sm">gap {g}</span>
          <Box>A</Box><Box>B</Box><Box>C</Box>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Align: Story = {
  render: () => (
    <Stack gap={6}>
      {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((a) => (
        <Stack key={a} direction="horizontal" align={a}>
          <span className="w-24 font-mono text-sm">{a}</span>
          <Box h={24}>Short</Box><Box h={64}>Tall</Box>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Justify: Story = {
  render: () => (
    <Stack gap={6}>
      {(['start', 'center', 'end', 'between'] as const).map((j) => (
        <Stack key={j} direction="horizontal" justify={j}>
          <Box>A</Box><Box>B</Box><Box>C</Box>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Nowrap: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <Stack direction="horizontal">
        {Array.from({ length: 6 }, (_, i) => <Box key={i}>Item {i + 1}</Box>)}
      </Stack>
    </div>
  ),
};

export const Wrap: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <Stack direction="horizontal" wrap>
        {Array.from({ length: 6 }, (_, i) => <Box key={i}>Item {i + 1}</Box>)}
      </Stack>
    </div>
  ),
};

/** Vertical below 768 px, horizontal from 768 px. Use the viewport toolbar. */
export const Responsive: Story = {
  render: () => (
    <Stack direction={{ base: 'vertical', md: 'horizontal' }} gap={{ base: 2, md: 6 }}>
      <Box>One</Box><Box>Two</Box><Box>Three</Box>
    </Stack>
  ),
};

export const AsList: Story = {
  render: () => (
    <Stack as="ul" gap={2}>
      <li>First</li><li>Second</li><li>Third</li>
    </Stack>
  ),
};

export const AsChild: Story = {
  render: () => (
    <Stack asChild gap={2}>
      <nav aria-label="Primary"><a href="#a">Home</a><a href="#b">Docs</a></nav>
    </Stack>
  ),
};

/** Keyboard: Tab moves through the buttons in DOM order; the Stack is never focusable. */
export const KeyboardOrder: Story = {
  render: () => (
    <Stack direction="horizontal" gap={3}>
      <Button>First</Button><Button variant="secondary">Second</Button><Button variant="ghost">Third</Button>
    </Stack>
  ),
};

export const Composed: Story = {
  render: () => (
    <Grid columns={{ base: 1, md: 3 }} gap={6}>
      {['Alpha', 'Beta', 'Gamma'].map((t) => (
        <Stack key={t} gap={3} className="border border-border p-4">
          <strong>{t}</strong>
          <p>Card body text.</p>
          <Stack direction="horizontal" gap={2} justify="end">
            <Button variant="secondary">Cancel</Button><Button>Save</Button>
          </Stack>
        </Stack>
      ))}
    </Grid>
  ),
};
