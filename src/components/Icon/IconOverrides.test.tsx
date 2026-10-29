import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Alert } from '../Alert';
import { Checkbox, CheckboxGroup } from '../Checkbox';
import { Dialog } from '../Dialog';
import { TextField } from '../Input';
import { Slider } from '../Slider';
import { Tag } from '../Tag';
import { TextareaField } from '../Textarea';
import { IconProvider } from './IconProvider';
import { createIcon } from './createIcon';
import type { IconRole } from './types';

const Prop = createIcon('PropIcon', <path data-testid="prop-glyph" d="M1 1h2" />);
const Prov = createIcon('ProvIcon', <path data-testid="prov-glyph" d="M1 1h2" />);
const allRoles: IconRole[] = [
  'close', 'check', 'minus', 'plus', 'alert', 'info', 'success', 'warning', 'chevron-down', 'chevron-left', 'chevron-right',
];
const icons = Object.fromEntries(allRoles.map((r) => [r, Prov])) as Record<IconRole, typeof Prov>;

interface Case {
  name: string;
  /** Renders the component, with the override prop when `withProp`. */
  ui: (withProp: boolean) => ReactElement;
  control: () => HTMLElement;
  /** Selector of the svgs belonging to the slot. */
  svgs: string;
}

const cases: Case[] = [
  {
    name: 'Dialog closeIcon',
    ui: (p) => <Dialog defaultOpen title="T" closeIcon={p ? Prop : undefined} />,
    control: () => screen.getByRole('button', { name: 'Close' }),
    svgs: '.ds-dialog-close svg',
  },
  {
    name: 'Checkbox checkIcon',
    ui: (p) => <Checkbox label="L" defaultChecked checkIcon={p ? Prop : undefined} />,
    control: () => screen.getByRole('checkbox', { name: 'L' }),
    svgs: '.ds-checkbox-mark-check svg',
  },
  {
    name: 'Checkbox indeterminateIcon',
    ui: (p) => <Checkbox label="L" checked="indeterminate" indeterminateIcon={p ? Prop : undefined} />,
    control: () => screen.getByRole('checkbox', { name: 'L' }),
    svgs: '.ds-checkbox-mark-dash svg',
  },
  {
    name: 'CheckboxGroup errorIcon',
    ui: (p) => (
      <CheckboxGroup legend="G" error="Bad" errorIcon={p ? Prop : undefined}>
        <Checkbox label="L" />
      </CheckboxGroup>
    ),
    control: () => screen.getByRole('checkbox', { name: 'L' }),
    svgs: '.ds-checkbox-error svg',
  },
  {
    name: 'TextField errorIcon',
    ui: (p) => <TextField label="Mail" error="Bad" errorIcon={p ? Prop : undefined} />,
    control: () => screen.getByRole('textbox', { name: 'Mail' }),
    svgs: 'span[id$="-error"] svg',
  },
  {
    name: 'TextareaField errorIcon (error line)',
    ui: (p) => <TextareaField label="Note" error="Bad" errorIcon={p ? Prop : undefined} />,
    control: () => screen.getByRole('textbox', { name: 'Note' }),
    svgs: 'span[id$="-error"] svg',
  },
  {
    name: 'TextareaField errorIcon (counter)',
    ui: (p) => <TextareaField label="Note" maxLength={2} defaultValue="abc" errorIcon={p ? Prop : undefined} />,
    control: () => screen.getByRole('textbox', { name: 'Note' }),
    svgs: '.ds-textarea-counter svg',
  },
  {
    name: 'Tag removeIcon',
    ui: (p) => <Tag onRemove={() => {}} removeIcon={p ? Prop : undefined}>cat</Tag>,
    control: () => screen.getByRole('button', { name: 'Remove cat' }),
    svgs: 'button svg',
  },
  {
    name: 'Alert icon',
    ui: (p) => <Alert title="Heads up" icon={p ? Prop : undefined} />,
    control: () => screen.getByRole('status'),
    svgs: '[role="status"] > svg',
  },
  {
    name: 'Slider decrementIcon',
    ui: (p) => <Slider aria-label="Vol" stepper decrementIcon={p ? Prop : undefined} defaultValue={5} min={0} max={10} />,
    control: () => screen.getByRole('slider', { name: 'Vol' }),
    svgs: '[data-dir="dec"] svg',
  },
  {
    name: 'Slider incrementIcon',
    ui: (p) => <Slider aria-label="Vol" stepper incrementIcon={p ? Prop : undefined} defaultValue={5} min={0} max={10} />,
    control: () => screen.getByRole('slider', { name: 'Vol' }),
    svgs: '[data-dir="inc"] svg',
  },
];

const q = (sel: string) => (document.body.querySelector(sel) as SVGElement | null);
const glyph = (sel: string, id: string) => q(sel)?.querySelector(`[data-testid="${id}"]`) ?? null;

describe.each(cases)('$name', ({ ui, control, svgs }) => {
  it('renders the default glyph', () => {
    render(ui(false));
    expect(q(svgs)).toBeInTheDocument();
    expect(glyph(svgs, 'prop-glyph')).toBeNull();
    expect(glyph(svgs, 'prov-glyph')).toBeNull();
  });

  it('renders the IconProvider glyph', () => {
    render(<IconProvider icons={icons}>{ui(false)}</IconProvider>);
    expect(glyph(svgs, 'prov-glyph')).toBeInTheDocument();
  });

  it('prop wins over the provider', () => {
    render(<IconProvider icons={icons}>{ui(true)}</IconProvider>);
    expect(glyph(svgs, 'prop-glyph')).toBeInTheDocument();
    expect(glyph(svgs, 'prov-glyph')).toBeNull();
  });

  it('passes decorative props and keeps size and accessible name', () => {
    const { unmount } = render(ui(false));
    const before = q(svgs)!;
    const size = [before.getAttribute('width'), before.getAttribute('height'), before.getAttribute('stroke-width')];
    const name = control().getAttribute('aria-label');
    unmount();
    render(ui(true));
    const after = q(svgs)!;
    expect(after.getAttribute('aria-hidden')).toBe('true');
    expect(after.getAttribute('focusable')).toBe('false');
    expect([after.getAttribute('width'), after.getAttribute('height'), after.getAttribute('stroke-width')]).toEqual(size);
    expect(control().getAttribute('aria-label')).toBe(name);
  });

  it('has no axe violations (default, provider, prop)', async () => {
    for (const el of [ui(false), <IconProvider icons={icons}>{ui(false)}</IconProvider>, ui(true)]) {
      const { unmount, container } = render(el);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });
});

describe('Alert icon={null}', () => {
  it.each(['info', 'success', 'error'] as const)('renders no svg for %s and keeps role and title', async (severity) => {
    const { container } = render(<Alert severity={severity} title="Error: upload failed" icon={null}>Body</Alert>);
    const box = screen.getByRole(severity === 'error' ? 'alert' : 'status');
    expect(box.querySelector('svg')).toBeNull();
    expect(box).toHaveTextContent('Error: upload failed');
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('keyboard with an override icon', () => {
  it('Tag remove: Tab lands on the button, never an svg; Enter activates', async () => {
    const onRemove = jest.fn();
    const user = userEvent.setup();
    render(<Tag onRemove={onRemove} removeIcon={Prop}>cat</Tag>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove cat' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(document.activeElement?.tagName).not.toBe('svg');
  });

  it('Checkbox toggles with Space', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="L" checkIcon={Prop} />);
    await user.tab();
    await user.keyboard(' ');
    expect(screen.getByRole('checkbox', { name: 'L' })).toBeChecked();
  });

  it('Dialog closes with Esc', async () => {
    const user = userEvent.setup();
    render(<Dialog defaultOpen title="T" closeIcon={Prop} />);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
