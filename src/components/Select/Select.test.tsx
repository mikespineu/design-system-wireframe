import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Dialog } from 'radix-ui';
import { Select, SelectField, type SelectOption } from './Select';

const countries: SelectOption[] = [
  { value: 'de', label: 'Germany', emoji: '🇩🇪', keywords: ['Deutschland'] },
  { value: 'fr', label: 'France', emoji: '🇫🇷' },
  { value: 'es', label: 'España', emoji: '🇪🇸' },
  { value: 'it', label: 'Italy', emoji: '🇮🇹', disabled: true },
  { value: 'pl', label: 'Poland', emoji: '🇵🇱' },
];
const fruit: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot', disabled: true },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

const setMedia = (matches: boolean) => {
  window.matchMedia = ((q: string) => ({
    matches, media: q, onchange: null, addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
};
afterEach(() => setMedia(false));

const noRegion = { rules: { region: { enabled: false } } };
const trigger = () => screen.getByRole('combobox');

describe('Select (list)', () => {
  it('shows the placeholder, opens with Enter / Space / ArrowDown and selects with Enter', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<Select aria-label="Fruit" options={fruit} onValueChange={onValueChange} />);
    expect(trigger()).toHaveTextContent('Select an option');
    expect(trigger()).toHaveAttribute('data-placeholder');
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('banana');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveTextContent('Banana');
    await user.keyboard(' ');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('moves with arrows skipping disabled, Home / End, stops at the ends, Esc keeps value', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<Select aria-label="Fruit" options={fruit} defaultValue="apple" onValueChange={onValueChange} />);
    await user.click(trigger());
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger()).toHaveFocus();
    expect(trigger()).toHaveTextContent('Apple');
  });

  it('typeahead on the closed and open trigger ignores the emoji and skips disabled', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<Select aria-label="Country" options={countries} onValueChange={onValueChange} />);
    trigger().focus();
    await user.keyboard('fr');
    expect(onValueChange).toHaveBeenLastCalledWith('fr');
    await user.keyboard('{Enter}');
    await user.keyboard('p');
    expect(screen.getByRole('option', { name: 'Poland' })).toHaveFocus();
    await user.keyboard('{Escape}');
  });

  it('does not close a parent Dialog on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Portal>
          <Dialog.Content aria-describedby={undefined}>
            <Dialog.Title>T</Dialog.Title>
            <Select aria-label="Fruit" options={fruit} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );
    await user.click(trigger());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('supports defaultValue, controlled value and value="" placeholder', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [v, setV] = useState('de');
      return (
        <>
          <Select aria-label="Country" options={countries} value={v} onValueChange={setV} />
          <button onClick={() => setV('')}>reset</button>
        </>
      );
    };
    render(<Controlled />);
    expect(trigger()).toHaveTextContent('Germany');
    await user.click(trigger());
    await user.click(screen.getByRole('option', { name: 'France' }));
    expect(trigger()).toHaveTextContent('France');
    await user.click(screen.getByText('reset'));
    expect(trigger()).toHaveTextContent('Select an option');
  });

  it('warns and shows the placeholder for an unknown value', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Select aria-label="Fruit" options={fruit} defaultValue="nope" />);
    expect(trigger()).toHaveTextContent('Select an option');
    expect(warn).toHaveBeenCalled();
  });

  it('renders topValues once, in order, in two groups; emoji is aria-hidden', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Country" options={countries} topValues={['pl', 'de']} />);
    await user.click(trigger());
    const opts = screen.getAllByRole('option').map((o) => o.textContent);
    expect(opts).toEqual(['🇵🇱Poland', '🇩🇪Germany', '🇫🇷France', '🇪🇸España', '🇮🇹Italy']);
    expect(screen.getByText('Top choices')).toBeInTheDocument();
    expect(screen.getByText('All options')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Poland' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Italy' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('is wired to Field: named by label, described by hint and error', () => {
    render(<SelectField label="Country" hint="Where you live" error="Required" required options={countries} />);
    expect(screen.getByRole('combobox', { name: /Country/ })).toHaveAccessibleDescription(/Where you live/);
    expect(trigger()).toHaveAccessibleDescription(/Error: Required/);
    expect(trigger()).toHaveAttribute('aria-invalid', 'true');
    expect(trigger()).toHaveAttribute('aria-required', 'true');
  });

  it('supports invalid, disabled and ref', () => {
    const ref = { current: null as HTMLButtonElement | HTMLSelectElement | null };
    render(<Select ref={ref} aria-label="x" invalid disabled options={fruit} className="extra" />);
    expect(trigger()).toHaveAttribute('aria-invalid', 'true');
    expect(trigger()).toBeDisabled();
    expect(trigger()).toHaveClass('extra');
    expect(ref.current).toBe(trigger());
  });

  it('submits name and value with a form', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Select aria-label="Fruit" name="fruit" defaultValue="cherry" options={fruit} />
      </form>,
    );
    const form = container.querySelector('form') as HTMLFormElement;
    expect(new FormData(form).get('fruit')).toBe('cherry');
    await user.click(trigger());
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    expect(new FormData(form).get('fruit')).toBe('apple');
  });

  it('has no axe violations in each state', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Select aria-label="Country" options={countries} />);
    expect(await axe(document.body, noRegion)).toHaveNoViolations();
    unmount();
    const r = render(<Select aria-label="Country" options={countries} defaultValue="de" topValues={['de']} />);
    await user.click(trigger());
    expect(await axe(document.body, noRegion)).toHaveNoViolations();
    r.unmount();
    render(<SelectField label="Country" hint="h" error="e" required options={countries} disabled />);
    expect(await axe(document.body, noRegion)).toHaveNoViolations();
  });
});

describe('Select (list) aria-hidden-focus', () => {
  const hiddenTrigger = () => screen.getByRole('combobox', { hidden: true });
  it('takes the trigger out of the tab order while open and restores it on close', async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Fruit" options={fruit} />);
    expect(hiddenTrigger()).not.toHaveAttribute('tabindex');
    await user.click(trigger());
    expect(hiddenTrigger()).toHaveAttribute('tabindex', '-1');
    expect(await axe(document.body, { ...noRegion, rules: { ...noRegion.rules, 'aria-hidden-focus': { enabled: true } } })).toHaveNoViolations();
    await user.keyboard('{Escape}');
    expect(hiddenTrigger()).not.toHaveAttribute('tabindex');
  });

  it('starts without a tab stop when defaultOpen', () => {
    render(<Select aria-label="Fruit" options={fruit} defaultOpen />);
    expect(hiddenTrigger()).toHaveAttribute('tabindex', '-1');
  });
});

describe('Select (searchable)', () => {
  const setup = (props = {}) => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<SelectField label="Country" searchable options={countries} onValueChange={onValueChange} topValues={['pl']} {...props} />);
    return { user, onValueChange };
  };

  it('opens, filters (case, accent, keywords), navigates with aria-activedescendant and selects with Enter', async () => {
    const { user, onValueChange } = setup();
    await user.click(trigger());
    const input = screen.getByPlaceholderText('Search');
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: /Poland/ }).id);
    await user.keyboard('ESPANA');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(await screen.findByText('1 result')).toBeInTheDocument();
    await user.clear(input);
    await user.keyboard('deutsch');
    expect(screen.getByRole('option', { name: /Germany/ })).toBeInTheDocument();
    await user.clear(input);
    await user.keyboard('a');
    await user.keyboard('{ArrowDown}');
    const active = input.getAttribute('aria-activedescendant');
    expect(document.getElementById(active as string)).toHaveAttribute('data-highlighted');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
  });

  it('skips disabled options, has no wrap, and shows a no-results row where Enter is a no-op', async () => {
    const { user, onValueChange } = setup();
    await user.click(trigger());
    const input = screen.getByPlaceholderText('Search');
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    await user.keyboard('{End}');
    await user.keyboard('zzz');
    expect(screen.getByText('No results for “zzz”')).toBeInTheDocument();
    expect(await screen.findByText('No results')).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toBeInTheDocument();
  });

  it('Escape closes without change and clears the query on reopen; printable char on trigger opens with it', async () => {
    const { user, onValueChange } = setup();
    await user.click(trigger());
    await user.keyboard('fr{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger()).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByPlaceholderText('Search')).toHaveValue('');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await user.keyboard('g');
    expect(screen.getByPlaceholderText('Search')).toHaveValue('g');
  });

  it('selects on click, submits name, and has no axe violations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <SelectField label="Country" searchable name="c" options={countries} topValues={['pl']} />
      </form>,
    );
    await user.click(trigger());
    expect(await axe(document.body, noRegion)).toHaveNoViolations();
    await user.keyboard('zzz');
    expect(await axe(document.body, noRegion)).toHaveNoViolations();
    await user.clear(screen.getByPlaceholderText('Search'));
    await user.click(screen.getByRole('option', { name: /France/ }));
    expect(trigger()).toHaveTextContent('France');
    expect(new FormData(container.querySelector('form') as HTMLFormElement).get('c')).toBe('fr');
  });
});

describe('Select (native)', () => {
  it('is chosen when matchMedia matches, and native={false} overrides', () => {
    setMedia(true);
    const { unmount } = render(<Select aria-label="x" options={fruit} />);
    expect(document.querySelector('select')).toBeInTheDocument();
    unmount();
    render(<Select aria-label="x" options={fruit} native={false} />);
    expect(document.querySelector('select')).not.toBeInTheDocument();
  });

  it('native={true} renders optgroups, emoji text, fires onValueChange, no search field', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    const ref = { current: null as HTMLButtonElement | HTMLSelectElement | null };
    render(
      <SelectField ref={ref} label="Country" native searchable options={countries} topValues={['pl']} onValueChange={onValueChange} name="c" />,
    );
    const select = screen.getByRole('combobox', { name: 'Country' }) as HTMLSelectElement;
    expect(ref.current).toBe(select);
    expect(select).toHaveValue('');
    expect(select.querySelectorAll('optgroup')).toHaveLength(2);
    expect(within(select).getByRole('option', { name: '🇩🇪 Germany' })).toBeInTheDocument();
    expect(within(select).getByRole('option', { name: '🇮🇹 Italy' })).toBeDisabled();
    await user.selectOptions(select, 'fr');
    expect(onValueChange).toHaveBeenCalledWith('fr');
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
  });

  it('supports value / defaultValue and has no axe violations', async () => {
    const { rerender } = render(<SelectField label="Fruit" native options={fruit} defaultValue="cherry" />);
    expect(screen.getByRole('combobox')).toHaveValue('cherry');
    rerender(<SelectField label="Fruit" native options={fruit} value="apple" onValueChange={() => {}} topValues={['apple']} />);
    expect(screen.getByRole('combobox')).toHaveValue('apple');
    expect(await axe(document.body, noRegion)).toHaveNoViolations();
  });
});
