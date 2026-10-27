import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tabs } from './Tabs';

const items = [
  { value: 'a', label: 'Alpha', panel: <p>Alpha panel</p> },
  { value: 'b', label: 'Beta', panel: <p>Beta panel</p> },
  { value: 'c', label: 'Gamma', disabled: true, panel: <p>Gamma panel</p> },
  { value: 'd', label: 'Delta', panel: <p>Delta panel</p> },
] as const;

const tiles = items.map((i) => ({ ...i, icon: <svg data-testid={`icon-${i.value}`} /> }));
const many = Array.from({ length: 8 }, (_, i) => ({ value: `v${i}`, label: `Tab ${i}`, panel: <p>P{i}</p> }));

type User = ReturnType<typeof userEvent.setup>;
/** Radix activates on focus while a key is held and moves focus in a timeout, so hold the key. */
const press = async (user: User, key: string) => {
  await user.keyboard(`{${key}>}`);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });
  await user.keyboard(`{/${key}}`);
};

describe('Tabs', () => {
  beforeEach(() => {
    Element.prototype.scrollTo = jest.fn();
  });

  it('renders roles, forwards ref, activates first enabled tab', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Tabs ref={ref} aria-label="Sections" items={items} data-testid="root" />);
    const list = screen.getByRole('tablist', { name: 'Sections' });
    expect(list).toHaveAttribute('aria-orientation', 'horizontal');
    expect(ref.current).toBe(screen.getByTestId('root'));
    const tab = screen.getByRole('tab', { name: 'Alpha' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('aria-controls');
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    expect(panel).toHaveAttribute('tabindex', '0');
    expect(screen.queryByText('Beta panel')).not.toBeInTheDocument();
    expect(list).toHaveAttribute('data-variant', 'segmented');
    expect(list).toHaveAttribute('data-size', 'md');
  });

  it('skips a disabled first tab for the default and supports aria-labelledby', () => {
    render(
      <>
        <h2 id="h">Heading</h2>
        <Tabs aria-labelledby="h" items={[{ value: 'x', label: 'X', disabled: true, panel: 'px' }, { value: 'y', label: 'Y', panel: 'py' }]} />
      </>,
    );
    expect(screen.getByRole('tab', { name: 'Y' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tablist', { name: 'Heading' })).toBeInTheDocument();
  });

  it('Tab lands on the active trigger, next Tab the panel', async () => {
    const user = userEvent.setup();
    render(<Tabs aria-label="S" items={items} defaultValue="b" />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('tabpanel')).toHaveFocus();
  });

  it('automatic: arrows activate, skip disabled and wrap; Home/End jump', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<Tabs aria-label="S" items={items} onValueChange={onValueChange} />);
    await user.tab();
    await press(user, 'ArrowRight');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveFocus();
    expect(screen.getByText('Beta panel')).toBeInTheDocument();
    await press(user, 'ArrowRight');
    expect(screen.getByRole('tab', { name: 'Delta' })).toHaveFocus();
    expect(screen.getByText('Delta panel')).toBeInTheDocument();
    await press(user, 'ArrowRight');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveFocus();
    await press(user, 'ArrowLeft');
    expect(screen.getByRole('tab', { name: 'Delta' })).toHaveFocus();
    await press(user, 'Home');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    await press(user, 'End');
    expect(screen.getByRole('tab', { name: 'Delta' })).toHaveAttribute('aria-selected', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith('d');
    expect(onValueChange).not.toHaveBeenCalledWith('');
  });

  it('Arrow Up/Down do nothing', async () => {
    const user = userEvent.setup();
    render(<Tabs aria-label="S" items={items} />);
    await user.tab();
    await press(user, 'ArrowDown');
    await press(user, 'ArrowUp');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
  });

  it('manual: arrows and Home/End move focus only; Enter and Space activate', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<Tabs aria-label="S" items={items} activationMode="manual" onValueChange={onValueChange} />);
    await user.tab();
    await press(user, 'ArrowRight');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    await press(user, 'End');
    expect(screen.getByRole('tab', { name: 'Delta' })).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Delta panel')).toBeInTheDocument();
    await press(user, 'Home');
    await user.keyboard(' ');
    expect(screen.getByText('Alpha panel')).toBeInTheDocument();
  });

  it('RTL: Arrow Left moves forward', async () => {
    const user = userEvent.setup();
    render(<Tabs aria-label="S" items={items} dir="rtl" />);
    await user.tab();
    await press(user, 'ArrowLeft');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveFocus();
  });

  it('click activates; disabled cannot be clicked or focused; active click does not refire', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<Tabs aria-label="S" items={items} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('tab', { name: 'Gamma' }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Gamma' })).toBeDisabled();
    await user.click(screen.getByRole('tab', { name: 'Alpha' }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('tab', { name: 'Beta' }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('controlled value; logs an error for unknown or disabled value', () => {
    const err = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(<Tabs aria-label="S" items={items} value="d" />);
    expect(screen.getByText('Delta panel')).toBeInTheDocument();
    expect(err).not.toHaveBeenCalled();
    rerender(<Tabs aria-label="S" items={items} value="c" />);
    expect(err).toHaveBeenCalledTimes(1);
    rerender(<Tabs aria-label="S" items={items} value="zzz" />);
    expect(err).toHaveBeenCalledTimes(2);
    err.mockRestore();
  });

  it('keepMounted keeps typed input across switches; otherwise remounts', async () => {
    const user = userEvent.setup();
    const withInput = [
      { value: 'a', label: 'A', panel: <input aria-label="field" /> },
      { value: 'b', label: 'B', panel: <p>B</p> },
    ];
    const { rerender } = render(<Tabs aria-label="S" items={withInput} keepMounted />);
    await user.type(screen.getByLabelText('field'), 'hi');
    await user.click(screen.getByRole('tab', { name: 'B' }));
    await user.click(screen.getByRole('tab', { name: 'A' }));
    expect(screen.getByLabelText('field')).toHaveValue('hi');
    rerender(<Tabs aria-label="S" items={withInput} />);
    await user.click(screen.getByRole('tab', { name: 'B' }));
    await user.click(screen.getByRole('tab', { name: 'A' }));
    expect(screen.getByLabelText('field')).toHaveValue('');
  });

  it('tile variant renders aria-hidden icons and labels', () => {
    render(<Tabs aria-label="S" variant="tile" items={tiles} size="sm" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'tile');
    expect(screen.getByTestId('icon-a').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveClass('ds-choice-item');
    expect(document.querySelector('.ds-choice-indicator')).toBeNull();
    expect(screen.getByRole('tablist')).toHaveAttribute('data-size', 'sm');
  });

  it('fullWidth sets the attribute; indicator rendered for segmented', () => {
    render(<Tabs aria-label="S" items={items} fullWidth />);
    expect(screen.getByRole('tablist')).toHaveAttribute('data-full-width');
    expect(document.querySelector('.ds-choice-indicator')).toBeInTheDocument();
  });

  describe('overflow', () => {
    const defs: Array<[string, PropertyDescriptor | undefined]> = [];
    afterEach(() => {
      defs.length = 0;
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollWidth;
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth;
    });
    it('sets data-overflow and scrolls the focused tab into view', async () => {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get: () => 800 });
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 200 });
      const user = userEvent.setup();
      render(<Tabs aria-label="S" items={many} />);
      expect(screen.getByRole('tablist')).toHaveAttribute('data-overflow', 'end');
      await user.tab();
      expect(screen.getByRole('tab', { name: 'Tab 0' })).toHaveFocus();
    });
  });

  describe('a11y', () => {
    it.each([
      ['segmented md', <Tabs key="1" aria-label="S" items={items} />],
      ['segmented sm', <Tabs key="2" aria-label="S" items={items} size="sm" />],
      ['fullWidth', <Tabs key="3" aria-label="S" items={items} fullWidth />],
      ['tile md', <Tabs key="4" aria-label="S" variant="tile" items={tiles} />],
      ['tile sm', <Tabs key="5" aria-label="S" variant="tile" items={tiles} size="sm" />],
      ['manual', <Tabs key="6" aria-label="S" items={items} activationMode="manual" />],
      ['keepMounted', <Tabs key="7" aria-label="S" items={items} keepMounted />],
      ['overflow', <Tabs key="8" aria-label="S" items={many} />],
      ['disabled tab (segmented)', <Tabs key="9" aria-label="S" items={items} defaultValue="d" />],
      ['disabled tab (tile)', <Tabs key="10" aria-label="S" variant="tile" items={tiles} defaultValue="d" />],
      ['keepMounted tile manual', <Tabs key="11" aria-label="S" variant="tile" items={tiles} keepMounted activationMode="manual" />],
      [
        'aria-labelledby heading',
        <div key="12">
          <h2 id="qa-heading">Account</h2>
          <Tabs aria-labelledby="qa-heading" items={items} />
        </div>,
      ],
    ])('has no violations: %s', async (_n, ui) => {
      const { container } = render(ui);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
