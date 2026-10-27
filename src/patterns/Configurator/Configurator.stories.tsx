import { useState, type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { SliderField } from '../../components/Slider';
import { CheckIcon } from '../../lib/sampleIcons';

/*
 * Shelf configurator: dimensions picked with SliderField, all in cm.
 * Depth is a custom list (3 stops), height a uniform step of 10, width a step of 1 with a typed input that snaps.
 */

type Dims = { width: number; height: number; depth: number; length: number };

/** Mixed steps: 200, 240, then every cm from 241 to 280. */
const LENGTHS = [200, 240, ...Array.from({ length: 40 }, (_, i) => 241 + i)];

const DEPTHS = [20, 32, 40] as const;
const initial = (): Dims => ({ width: 120, height: 180, depth: 32, length: 240 });

const Shelf = ({ width, height, depth }: Dims) => {
  const scale = 1.2;
  const w = width * scale;
  const h = height * scale * 0.6;
  const d = depth * scale * 0.5;
  return (
    <svg
      viewBox="0 0 400 360"
      className="block h-auto w-full border border-divider bg-surface-subtle"
      role="img"
      aria-label={`Shelf sketch, ${width} by ${height} by ${depth} centimetres`}
    >
      <rect x="40" y={330 - h} width={w} height={h} fill="var(--ds-color-surface)" stroke="var(--ds-color-ink)" strokeWidth="2" />
      <polygon
        points={`${40 + w},${330 - h} ${40 + w + d},${330 - h - d} ${40 + d},${330 - h - d} 40,${330 - h}`}
        fill="var(--ds-color-fill)"
        stroke="var(--ds-color-ink)"
        strokeWidth="2"
      />
      <polygon
        points={`${40 + w},${330 - h} ${40 + w + d},${330 - h - d} ${40 + w + d},${330 - d} ${40 + w},330`}
        fill="var(--ds-color-border)"
        stroke="var(--ds-color-ink)"
        strokeWidth="2"
      />
      {[1, 2, 3].map((i) => (
        <line key={i} x1="40" x2={40 + w} y1={330 - (h / 4) * i} y2={330 - (h / 4) * i} stroke="var(--ds-color-placeholder)" strokeWidth="1" />
      ))}
    </svg>
  );
};

const Configurator = ({ mixedLength = false }: { mixedLength?: boolean }) => {
  const [dims, setDims] = useState<Dims>(initial);
  const [ordered, setOrdered] = useState(false);
  const set = (key: keyof Dims) => (v: number) => {
    setOrdered(false);
    setDims((d) => ({ ...d, [key]: v }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setOrdered(true);
  };

  const summary = `${dims.width} × ${dims.height} × ${dims.depth} cm${mixedLength ? `, length ${dims.length} cm` : ''}`;

  return (
    <div className="mx-auto flex w-full max-w-360 flex-col gap-16 p-6 lg:p-24">
      <header className="flex justify-between border-b border-ink pb-6 font-mono text-caption uppercase tracking-[0.08em] text-muted">
        <span>Design System Wireframe — Patterns</span>
        <span>Configurator · v0.1</span>
      </header>

      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
        <aside className="flex flex-col gap-8">
          <span className="font-mono text-label uppercase text-muted">Shelf</span>
          <h1 className="m-0 text-h1">Build your shelf</h1>
          <p className="m-0 text-body-lg text-text">Set the three dimensions. The sketch and the summary follow.</p>
          <Shelf {...dims} />
          <p className="m-0 font-mono text-h3" aria-live="polite">
            <span className="sr-only">Chosen size: </span>
            {summary}
          </p>
        </aside>

        <form onSubmit={submit} className="flex flex-col gap-8">
          <fieldset className="m-0 flex min-w-0 flex-col gap-12 border-0 p-0">
            <legend className="mb-6 p-0 font-mono text-h3">Dimensions</legend>
            <SliderField
              label="Depth"
              values={DEPTHS}
              marks="steps"
              unit="cm"
              value={dims.depth}
              onValueChange={set('depth')}
              hint="Three standard depths."
            />
            <SliderField
              label="Height"
              min={60}
              max={240}
              step={10}
              unit="cm"
              marks="ends"
              value={dims.height}
              onValueChange={set('height')}
              hint="In steps of 10 cm."
            />
            <SliderField
              label="Width"
              min={40}
              max={200}
              step={1}
              unit="cm"
              marks="ends"
              showInput
              value={dims.width}
              onValueChange={set('width')}
              hint="Type a width; it snaps to the nearest centimetre between 40 and 200."
            />
            {mixedLength && (
              <SliderField
                label="Length"
                values={LENGTHS}
                unit="cm"
                spacing="value"
                marks={[200, 240, 280]}
                showInput
                value={dims.length}
                onValueChange={set('length')}
                hint="Two standard lengths, then every centimetre from 241 to 280."
              />
            )}
          </fieldset>

          {ordered && (
            <div role="status" className="flex items-center gap-3 border border-divider bg-surface-subtle p-6">
              <Icon icon={CheckIcon} size={24} />
              <span className="text-body">Saved: {summary}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-divider pt-6">
            <Button type="submit">Save configuration</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDims(initial());
                setOrdered(false);
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const meta = {
  title: 'Patterns/Configurator',
  component: Configurator,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Configurator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Typing a width snaps it and updates the summary; Reset restores the defaults. */
export const TypeAWidth: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: /Width/ });
    await userEvent.clear(input);
    await userEvent.type(input, '999{Enter}');
    await expect(input).toHaveValue('200');
    await expect(canvas.getByText(/200 × 180 × 32 cm/)).toBeInTheDocument();
  },
};

/** Keyboard: Depth is a three-stop list, one arrow press per stop. */
export const DepthByKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const depth = canvas.getByRole('slider', { name: 'Depth' });
    depth.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(depth).toHaveAttribute('aria-valuenow', '40');
    await userEvent.keyboard('{ArrowRight}');
    await expect(depth).toHaveAttribute('aria-valuenow', '40');
  },
};

/** A fourth slider on a mixed scale: 200, 240, then every cm up to 280. */
export const WithMixedLength: Story = {
  args: { mixedLength: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: /Length/ });
    await userEvent.clear(input);
    await userEvent.type(input, '225{Enter}');
    await expect(input).toHaveValue('240');
    await userEvent.clear(input);
    await userEvent.type(input, '300{Enter}');
    await expect(input).toHaveValue('280');
  },
};

export const Saved: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Save configuration' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Saved: 120 × 180 × 32 cm');
  },
};
