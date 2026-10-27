import { createRef, useEffect } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ToastProvider, Toaster, useToast, type UseToast, type ToastOptions } from './Toast';

const holder: { api?: UseToast } = {};
const Capture = () => {
  const value = useToast();
  useEffect(() => {
    holder.api = value;
  }, [value]);
  return null;
};
const api = new Proxy({} as UseToast, { get: (_, k) => holder.api![k as keyof UseToast] });

const setup = () => {
  const user = userEvent.setup(jest.isMockFunction(setTimeout) || 'clock' in setTimeout ? { advanceTimers: jest.advanceTimersByTime } : {});
  const utils = render(
    <ToastProvider>
      <button>page</button>
      <Capture />
      <Toaster />
    </ToastProvider>,
  );
  return { user, ...utils };
};
const show = (o: ToastOptions) => {
  let id = '';
  act(() => {
    id = api.toast(o);
  });
  return id;
};
const advance = (ms: number) => act(() => void jest.advanceTimersByTime(ms));
/** Radix puts the F8 focus on the list inside the named region. */
const viewport = () => screen.getByRole('region', { name: 'Notifications (F8)' }).querySelector('ol')!;
const toasts = () => screen.queryAllByRole('listitem');

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('Toast', () => {
  it('throws outside a provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Toaster />)).toThrow();
    jest.restoreAllMocks();
  });

  it('renders severities with data attribute and hidden prefix', () => {
    setup();
    show({ title: 'Saved info' });
    show({ severity: 'success', title: 'Saved' });
    show({ severity: 'error', title: 'Failed', description: 'Try again' });
    const items = toasts();
    expect(items.map((i) => i.getAttribute('data-severity'))).toEqual(['info', 'success', 'error']);
    expect(items[1]).toHaveTextContent('Success: Saved');
    expect(items[2]).toHaveTextContent('Error: Failed');
    expect(items[0]).not.toHaveTextContent(/Info:/);
    expect(items[2]).toHaveTextContent('Try again');
  });

  it('auto-dismisses info/success at 5s, 8s with action, errors never', () => {
    setup();
    show({ title: 'a' });
    show({ severity: 'success', title: 'b', action: { label: 'Undo', altText: 'Undo b', onClick: () => {} } });
    show({ severity: 'error', title: 'c' });
    advance(4900);
    expect(toasts()).toHaveLength(3);
    advance(200);
    expect(toasts()).toHaveLength(2);
    advance(3000);
    expect(toasts()).toHaveLength(1);
    advance(60000);
    expect(toasts()).toHaveLength(1);
    expect(screen.getByText('c')).toBeInTheDocument();
  });

  it('pauses on hover and resumes on unhover', async () => {
    const { user } = setup();
    show({ title: 'hover me' });
    await user.hover(screen.getByRole('region'));
    advance(10000);
    expect(toasts()).toHaveLength(1);
    await user.unhover(screen.getByRole('region'));
    advance(5100);
    expect(toasts()).toHaveLength(0);
  });

  it('pauses while focus is inside the viewport', async () => {
    const { user } = setup();
    show({ title: 'focus me' });
    await user.keyboard('[F8]');
    advance(10000);
    expect(toasts()).toHaveLength(1);
  });

  it('F8 focuses the region; Tab walks newest first: root, action, close, older', async () => {
    const { user } = setup();
    show({ title: 'older', severity: 'error' });
    show({ title: 'newer', severity: 'error', action: { label: 'Undo', altText: 'Undo', onClick: () => {} } });
    await user.keyboard('[F8]');
    expect(viewport()).toHaveFocus();
    await user.tab();
    expect(toasts()[1]).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus();
    await user.tab();
    expect(screen.getAllByRole('button', { name: 'Close' })[1]).toHaveFocus();
    await user.tab();
    expect(toasts()[0]).toHaveFocus();
  });

  it('action runs onClick once, closes the toast; focus lands on the viewport', async () => {
    const { user } = setup();
    const onClick = jest.fn();
    show({ severity: 'error', title: 'Gone', action: { label: 'Retry', altText: 'Retry', onClick } });
    await user.keyboard('[F8]');
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(toasts()).toHaveLength(0);
    expect(viewport()).toHaveFocus();
  });

  it('close button and Esc close the toast', async () => {
    const { user } = setup();
    show({ severity: 'error', title: 'x' });
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(toasts()).toHaveLength(0);
    show({ severity: 'error', title: 'y' });
    await user.keyboard('[F8]');
    await user.tab();
    await user.keyboard('{Escape}');
    expect(toasts()).toHaveLength(0);
    expect(viewport()).toHaveFocus();
  });

  it('a 4th toast closes the oldest of three', () => {
    setup();
    ['1', '2', '3', '4'].forEach((t) => show({ severity: 'error', title: t }));
    expect(toasts().map((i) => i.textContent)).toEqual(['Error: 2', 'Error: 3', 'Error: 4'].map((s) => expect.stringContaining(s)));
  });

  it('update changes content in place; severity change replaces', () => {
    setup();
    const id = show({ title: 'Saving', severity: 'info' });
    const before = toasts()[0];
    act(() => api.update(id, { title: 'Still saving', description: 'wait' }));
    expect(toasts()).toHaveLength(1);
    expect(toasts()[0]).toBe(before);
    expect(toasts()[0]).toHaveTextContent('Still saving');
    act(() => api.update(id, { severity: 'error', title: 'Failed' }));
    expect(toasts()).toHaveLength(1);
    expect(toasts()[0]).toHaveAttribute('data-severity', 'error');
    expect(toasts()[0]).toHaveTextContent('Error: Failed');
  });

  it('dismiss(id) closes one, dismiss() closes all', () => {
    setup();
    const a = show({ title: 'a', severity: 'error' });
    show({ title: 'b', severity: 'error' });
    act(() => api.dismiss(a));
    expect(toasts()).toHaveLength(1);
    show({ title: 'c', severity: 'error' });
    act(() => api.dismiss());
    expect(toasts()).toHaveLength(0);
  });

  it('announces with the right politeness', () => {
    setup();
    show({ title: 'i' });
    show({ severity: 'success', title: 's' });
    show({ severity: 'error', title: 'e' });
    advance(100);
    const live = Array.from(document.querySelectorAll('[role="status"]'));
    const text = (el: Element) => el.textContent ?? '';
    expect(live.find((l) => text(l).includes('Error: e'))).toHaveAttribute('aria-live', 'assertive');
    expect(live.find((l) => text(l).includes('Success: s'))).toHaveAttribute('aria-live', 'polite');
    expect(live.find((l) => text(l).includes('Notification i'))).toHaveAttribute('aria-live', 'polite');
  });

  it('forwards ref and className to the viewport', () => {
    const ref = createRef<HTMLOListElement>();
    render(
      <ToastProvider label="Msg">
        <Toaster ref={ref} className="custom" />
      </ToastProvider>,
    );
    expect(ref.current).toHaveClass('custom');
  });

  describe('a11y', () => {
    beforeEach(() => jest.useRealTimers());
    const action = { label: 'Undo', altText: 'Undo it', onClick: () => {} };
    it.each([
      ['info', undefined],
      ['info', action],
      ['success', undefined],
      ['success', action],
      ['error', undefined],
      ['error', action],
    ] as const)('%s with action=%s has no violations', async (severity, a) => {
      const { container } = setup();
      show({ severity, title: 'Title', description: 'Body', action: a });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('title only, stack, and focused viewport', async () => {
      const { container, user } = setup();
      show({ title: 'Only' });
      expect(await axe(container)).toHaveNoViolations();
      show({ severity: 'success', title: 'S', description: 'd' });
      show({ severity: 'error', title: 'E', action });
      expect(await axe(container)).toHaveNoViolations();
      await user.keyboard('[F8]');
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
