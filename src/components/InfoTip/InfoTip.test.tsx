import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { axe } from 'jest-axe';
import { InfoTip } from './InfoTip';

const TEXT = 'Charged every cycle';
type Listener = () => void;
let listeners: Listener[] = [];
let coarse = false;
const original = window.matchMedia;

const stub = () => {
  listeners = [];
  window.matchMedia = ((q: string) => ({
    media: q,
    get matches() {
      return q === '(pointer: coarse)' ? coarse : false;
    },
    addEventListener: (_: string, l: Listener) => listeners.push(l),
    removeEventListener: (_: string, l: Listener) => {
      listeners = listeners.filter((x) => x !== l);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  })) as unknown as typeof window.matchMedia;
};
const setCoarse = (v: boolean) => {
  coarse = v;
  act(() => listeners.forEach((l) => l()));
};

beforeEach(() => {
  coarse = false;
  stub();
});
afterEach(() => {
  window.matchMedia = original;
});

const ui = (props = {}) => <InfoTip label="About billing" content={TEXT} {...props} />;

describe('InfoTip, non-touch', () => {
  it('renders a tooltip trigger and opens on focus', async () => {
    const user = userEvent.setup();
    render(ui());
    const btn = screen.getByRole('button', { name: 'About billing' });
    expect(btn).toHaveAttribute('data-mode', 'tooltip');
    await user.tab();
    expect(await screen.findByRole('tooltip', { hidden: true })).toHaveTextContent(TEXT);
    expect(btn).toHaveAttribute('aria-describedby');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
    expect(btn).toHaveFocus();
  });

  it('opens on hover and closes on unhover', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.hover(screen.getByRole('button'));
    expect(await screen.findByRole('tooltip', { hidden: true })).toBeInTheDocument();
    await user.unhover(screen.getByRole('button'));
    fireEvent.pointerMove(document.body, { clientX: 900, clientY: 900 }); // leave the grace area
    await waitFor(() => expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument());
  });

  it('keeps the tip open after a click and after Enter/Space', async () => {
    const user = userEvent.setup();
    render(ui());
    const btn = screen.getByRole('button');
    await user.click(btn);
    expect(await screen.findByRole('tooltip', { hidden: true })).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('tooltip', { hidden: true })).toBeInTheDocument();
    await user.keyboard(' ');
    expect(screen.getByRole('tooltip', { hidden: true })).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
  });

  it('calls consumer handlers and forwards the ref', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const fnRef = jest.fn();
    render(ui({ onClick, onPointerDown: jest.fn(), onKeyDown: jest.fn(), onFocus: jest.fn(), onBlur: jest.fn(), ref: fnRef }));
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
    expect(fnRef).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('forwards an object ref and supports sm size', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<InfoTip ref={ref} label="L" content="c" size="sm" />);
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(ref.current).toHaveAttribute('data-size', 'sm');
  });

  it('ignores viewport width', () => {
    window.innerWidth = 320;
    render(ui());
    expect(screen.getByRole('button')).toHaveAttribute('data-mode', 'tooltip');
  });

  it('has no a11y violations, closed and open', async () => {
    const { container } = render(ui());
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.setup().tab();
    await screen.findByRole('tooltip', { hidden: true });
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('InfoTip, touch', () => {
  beforeEach(() => {
    coarse = true;
  });

  it('renders a popover opened by click, named by label', async () => {
    const user = userEvent.setup();
    render(ui());
    const btn = screen.getByRole('button', { name: 'About billing' });
    expect(btn).toHaveAttribute('data-mode', 'popover');
    await user.tab();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(btn);
    const dialog = await screen.findByRole('dialog', { name: 'About billing' });
    expect(dialog).toHaveTextContent(TEXT);
    await user.click(btn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Esc returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('has no a11y violations when open', async () => {
    await userEvent.setup().click(render(ui()).getByRole('button'));
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('InfoTip stylesheet', () => {
  it('compensates the coarse hit-area inset for the border', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const css = require('fs').readFileSync(require('path').join(__dirname, 'InfoTip.css'), 'utf8') as string;
    expect(css).toMatch(/inset:\s*calc\(var\(--ds-infotip-inset\) - var\(--ds-border-width\)\)/);
  });
});

describe('InfoTip live switching', () => {
  it('switches mode on change, closes an open tip and keeps focus', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    await screen.findByRole('tooltip', { hidden: true });
    setCoarse(true);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-mode', 'popover');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(btn).toHaveFocus();
    setCoarse(false);
    expect(screen.getByRole('button')).toHaveAttribute('data-mode', 'tooltip');
  });

  it('does not steal focus when the trigger is not focused', () => {
    render(ui());
    setCoarse(true);
    expect(screen.getByRole('button')).not.toHaveFocus();
  });

  it('is unaffected by width media queries', () => {
    const mm = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...mm(q), matches: q.includes('max-width') })) as typeof window.matchMedia;
    render(ui());
    expect(screen.getByRole('button')).toHaveAttribute('data-mode', 'tooltip');
  });
});

describe('InfoTip server render', () => {
  it('renders the tooltip-mode trigger, closed', () => {
    coarse = true;
    const html = renderToString(ui());
    expect(html).toContain('data-mode="tooltip"');
    expect(html).not.toContain('role="tooltip"');
  });
});
