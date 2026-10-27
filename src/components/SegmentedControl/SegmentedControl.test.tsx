import { createRef, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SegmentedControl } from './SegmentedControl';
import { IconButton } from '../IconButton';
import { InfoIcon } from '../../lib/sampleIcons';

const options = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'board', label: 'Board', disabled: true },
  { value: 'table', label: 'Table' },
] as const;

const many = Array.from({ length: 8 }, (_, i) => ({ value: `v${i}`, label: `Option ${i}` }));

type User = ReturnType<typeof userEvent.setup>;
/** Radix selects on focus while an arrow key is held, and moves focus in a timeout, so hold the key. */
const arrow = async (user: User, key: 'ArrowRight' | 'ArrowLeft') => {
  await user.keyboard(`{${key}>}`);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });
  await user.keyboard(`{/${key}}`);
};

describe('SegmentedControl', () => {
  let scrollIntoView: jest.Mock;
  beforeEach(() => {
    scrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    Element.prototype.scrollTo = scrollIntoView;
  });

  it('renders a named radiogroup, forwards ref, selects first enabled option', () => {
    const ref = createRef<HTMLDivElement>();
    render(<SegmentedControl ref={ref} label="View" options={options} data-testid="g" />);
    const group = screen.getByRole('radiogroup', { name: 'View' });
    expect(ref.current).toBe(group);
    expect(group).toHaveAttribute('data-testid', 'g');
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    expect(group).toHaveAttribute('data-size', 'md');
  });

  it('first enabled option is default when first is disabled', () => {
    render(<SegmentedControl label="View" options={[{ value: 'a', label: 'A', disabled: true }, { value: 'b', label: 'B' }]} />);
    expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
  });

  it('honours defaultValue and fullWidth', () => {
    render(<SegmentedControl label="View" options={options} defaultValue="table" fullWidth />);
    expect(screen.getByRole('radio', { name: 'Table' })).toBeChecked();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-full-width');
  });

  it('Tab lands on the selected item; Arrow Right selects next, skips disabled, wraps', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<SegmentedControl label="View" options={options} defaultValue="grid" onValueChange={onValueChange} />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveFocus();
    await arrow(user, 'ArrowRight');
    expect(screen.getByRole('radio', { name: 'Table' })).toBeChecked();
    await arrow(user, 'ArrowRight');
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    expect(onValueChange).toHaveBeenNthCalledWith(1, 'table');
    expect(onValueChange).toHaveBeenNthCalledWith(2, 'list');
  });

  it('Arrow Left goes forward in RTL', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl label="View" options={options} dir="rtl" />);
    await user.tab();
    await arrow(user, 'ArrowLeft');
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeChecked();
  });

  it('Home and End move focus without selecting; Space then selects', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl label="View" options={options} />);
    await user.tab();
    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Table' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    await user.keyboard(' ');
    expect(screen.getByRole('radio', { name: 'Table' })).toBeChecked();
  });

  it('clicking the selected item does not fire onValueChange or clear', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<SegmentedControl label="View" options={options} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: 'List' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Grid' }));
    expect(onValueChange).toHaveBeenCalledWith('grid');
  });

  it('works controlled', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [v, setV] = useState<(typeof options)[number]['value']>('list');
      return <SegmentedControl label="View" options={options} value={v} onValueChange={setV} />;
    };
    render(<Controlled />);
    await user.click(screen.getByRole('radio', { name: 'Grid' }));
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeChecked();
  });

  it('console.errors when a controlled value matches no option', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<SegmentedControl label="View" options={options} value={'nope' as 'list'} />);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('matches no option'));
    spy.mockRestore();
  });

  it('Enter does not submit the form; hidden input carries name', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e.preventDefault());
    const { container } = render(
      <form onSubmit={onSubmit}>
        <SegmentedControl label="View" options={options} name="view" required />
      </form>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-required', 'true');
    expect(container.querySelector('input[name="view"]')).toHaveAttribute('value', 'list');
  });

  it('disabled group is out of tab order and keeps selection', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl label="View" options={options} disabled />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'List' })).not.toHaveFocus();
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked();
  });

  it('labelPosition and hint', () => {
    const { rerender } = render(<SegmentedControl label="View" options={options} hint="Pick one" />);
    expect(document.querySelector('.ds-choice')).toHaveAttribute('data-label-position', 'start');
    expect(screen.queryByText('Pick one')).not.toBeInTheDocument();
    rerender(<SegmentedControl label="View" options={options} hint="Pick one" labelPosition="top" />);
    expect(document.querySelector('.ds-choice')).toHaveAttribute('data-label-position', 'top');
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription('Pick one');
  });

  it('help slot is outside the arrow-key order; Tab goes there', async () => {
    const user = userEvent.setup();
    render(<SegmentedControl label="View" options={options} help={<IconButton icon={InfoIcon} aria-label="About views" />} />);
    expect(screen.getByRole('radiogroup')).not.toContainElement(screen.getByRole('button', { name: 'About views' }));
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'About views' })).toHaveFocus();
    await user.tab({ shift: true });
    await arrow(user, 'ArrowRight');
    expect(screen.getByRole('radio', { name: 'Grid' })).toBeChecked();
  });

  /** Strip is on screen from x=100 to x=400 (24px scroll-padding); a stub places every item. */
  const rect = (left: number, right: number) =>
    ({ left, right, top: 0, bottom: 0, width: right - left, height: 0, x: left, y: 0, toJSON: () => ({}) }) as DOMRect;
  const stubLayout = (place: (el: HTMLElement) => [number, number]) => {
    const real = window.getComputedStyle.bind(window);
    jest.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
      const style = real(el, pseudo);
      if (el.getAttribute('role') !== 'radiogroup') return style;
      return new Proxy(style, {
        get: (t, k) =>
          k === 'scrollPaddingLeft' || k === 'scrollPaddingRight' ? '24px' : (Reflect.get(t, k) as unknown),
      });
    });
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      if (this.getAttribute('role') === 'radiogroup') return rect(100, 400);
      if (this.getAttribute('role') === 'radio') return rect(...place(this as HTMLElement));
      return rect(0, 0);
    });
  };
  afterEach(() => jest.restoreAllMocks());

  it('scrolls the container so the selected item clears the scroll-padding', () => {
    stubLayout(() => [380, 480]); // 80px past the padded right edge (376)
    render(<SegmentedControl label="View" options={options} />);
    expect(scrollIntoView).toHaveBeenCalledWith({ left: 104, behavior: 'smooth' });
    expect(scrollIntoView.mock.contexts[0]).toBe(screen.getByRole('radiogroup'));
  });

  it('scrolls back when the item is hidden before the padded start edge, and rounds outward', () => {
    stubLayout(() => [110.4, 200]); // padded start edge is 124
    render(<SegmentedControl label="View" options={options} />);
    expect(scrollIntoView).toHaveBeenCalledWith({ left: -14, behavior: 'smooth' });
  });

  it('does not scroll when the item is already inside the padded box', () => {
    stubLayout(() => [150, 250]);
    render(<SegmentedControl label="View" options={options} />);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrolls on value change and on focus (Home/End)', async () => {
    stubLayout(() => [380, 480]);
    const user = userEvent.setup();
    render(<SegmentedControl label="View" options={options} />);
    scrollIntoView.mockClear();
    await user.click(screen.getByRole('radio', { name: 'Grid' }));
    expect(scrollIntoView).toHaveBeenCalled();
    scrollIntoView.mockClear();
    await user.tab({ shift: true });
    await user.tab();
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('falls back to scrollLeft where scrollTo is missing', () => {
    stubLayout(() => [380, 480]);
    Element.prototype.scrollTo = undefined as unknown as typeof Element.prototype.scrollTo;
    render(<SegmentedControl label="View" options={options} />);
    expect(screen.getByRole('radiogroup').scrollLeft).toBe(104);
  });

  it('uses auto behaviour under prefers-reduced-motion', () => {
    stubLayout(() => [380, 480]);
    const mm = window.matchMedia;
    window.matchMedia = ((q: string) => ({ ...mm(q), matches: true })) as typeof window.matchMedia;
    render(<SegmentedControl label="View" options={options} />);
    expect(scrollIntoView).toHaveBeenCalledWith({ left: 104, behavior: 'auto' });
    window.matchMedia = mm;
  });

  describe('overflow', () => {
    const setDims = (el: HTMLElement, dims: { scrollWidth: number; clientWidth: number }) => {
      Object.defineProperty(el, 'scrollWidth', { configurable: true, value: dims.scrollWidth });
      Object.defineProperty(el, 'clientWidth', { configurable: true, value: dims.clientWidth });
    };
    let trigger: (() => void) | undefined;
    const RO = window.ResizeObserver;
    beforeEach(() => {
      window.ResizeObserver = class {
        constructor(cb: () => void) {
          trigger = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      } as unknown as typeof ResizeObserver;
    });
    afterEach(() => {
      window.ResizeObserver = RO;
    });

    it('re-scrolls the checked item into view when layout settles, not on scroll', () => {
      render(<SegmentedControl label="View" options={many} defaultValue={many.at(-1)!.value} />);
      const group = screen.getByRole('radiogroup');
      stubLayout(() => [380, 480]);
      scrollIntoView.mockClear();
      fireEvent.scroll(group);
      expect(scrollIntoView).not.toHaveBeenCalled();
      act(() => trigger?.());
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView.mock.contexts[0]).toBe(group);
      expect(scrollIntoView).toHaveBeenCalledWith({ left: 104, behavior: 'auto' });
    });

    it('re-scrolls after web fonts load', async () => {
      let resolve: () => void = () => {};
      const ready = new Promise<void>((r) => {
        resolve = r;
      });
      Object.defineProperty(document, 'fonts', { configurable: true, value: { ready } });
      render(<SegmentedControl label="View" options={many} defaultValue={many.at(-1)!.value} />);
      stubLayout(() => [380, 480]);
      scrollIntoView.mockClear();
      await act(async () => {
        resolve();
        await ready;
      });
      expect(scrollIntoView).toHaveBeenCalledWith({ left: 104, behavior: 'auto' });
      Object.defineProperty(document, 'fonts', { configurable: true, value: undefined });
    });

    it('sets data-overflow from scroll position', () => {
      render(<SegmentedControl label="View" options={many} />);
      const group = screen.getByRole('radiogroup');
      expect(group).not.toHaveAttribute('data-overflow');
      setDims(group, { scrollWidth: 800, clientWidth: 300 });
      act(() => trigger?.());
      expect(group).toHaveAttribute('data-overflow', 'end');
      group.scrollLeft = 200;
      fireEvent.scroll(group);
      expect(group).toHaveAttribute('data-overflow', 'both');
      group.scrollLeft = 500;
      fireEvent.scroll(group);
      expect(group).toHaveAttribute('data-overflow', 'start');
      setDims(group, { scrollWidth: 300, clientWidth: 300 });
      group.scrollLeft = 0;
      act(() => trigger?.());
      expect(group).not.toHaveAttribute('data-overflow');
    });

    it('never sets data-overflow when fullWidth', () => {
      render(<SegmentedControl label="View" options={options} fullWidth />);
      const group = screen.getByRole('radiogroup');
      setDims(group, { scrollWidth: 800, clientWidth: 300 });
      act(() => trigger?.());
      expect(group).not.toHaveAttribute('data-overflow');
    });
  });

  describe('indicator', () => {
    it('is aria-hidden, placed on the checked item and has no animation on first render', async () => {
      const raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(0);
        return 1;
      });
      const user = userEvent.setup();
      render(<SegmentedControl label="View" options={options} />);
      const ind = document.querySelector<HTMLElement>('[data-indicator]')!;
      expect(ind).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-indicator-ready');
      expect(ind.style.transform).toBe('translateX(0px)');
      await user.click(screen.getByRole('radio', { name: 'Grid' }));
      expect(ind).toHaveAttribute('data-animate');
      raf.mockRestore();
    });

    it('does not animate before the first frame', () => {
      const raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
      render(<SegmentedControl label="View" options={options} />);
      expect(document.querySelector('[data-indicator]')).not.toHaveAttribute('data-animate');
      raf.mockRestore();
    });

    it('re-places on resize', () => {
      let trigger: (() => void) | undefined;
      const RO = window.ResizeObserver;
      window.ResizeObserver = class {
        constructor(cb: () => void) {
          trigger = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      } as unknown as typeof ResizeObserver;
      render(<SegmentedControl label="View" options={options} />);
      const item = screen.getByRole('radio', { name: 'List' });
      Object.defineProperty(item, 'offsetWidth', { configurable: true, value: 90 });
      act(() => trigger?.());
      expect(document.querySelector<HTMLElement>('[data-indicator]')!.style.width).toBe('90px');
      window.ResizeObserver = RO;
    });
  });

  describe('a11y', () => {
    it.each([
      ['md', {}],
      ['sm', { size: 'sm' as const }],
      ['fullWidth', { fullWidth: true }],
      ['label top with hint', { labelPosition: 'top' as const, hint: 'Pick one' }],
      ['disabled group', { disabled: true }],
    ])('has no violations: %s', async (_n, props) => {
      const { container } = render(<SegmentedControl label="View" options={options} {...props} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations with help and when overflowing', async () => {
      const { container } = render(
        <div style={{ width: 200 }}>
          <SegmentedControl label="View" options={many} help={<IconButton icon={InfoIcon} aria-label="About views" />} />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
