import { createRef, useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Textarea, TextareaField } from './Textarea';
import { Field } from '../Input';

describe('Textarea', () => {
  it('renders a native textarea, forwards ref, defaults to md (4 rows)', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="Notes" />);
    const el = screen.getByRole('textbox');
    expect(ref.current).toBe(el);
    expect(el.tagName).toBe('TEXTAREA');
    expect(el).toHaveAttribute('rows', '4');
    expect(el).toHaveAttribute('data-resize', 'vertical');
  });

  it.each([
    ['sm', '2'],
    ['md', '4'],
    ['lg', '8'],
  ] as const)('size %s starts at %s rows', (size, rows) => {
    render(<Textarea aria-label="Notes" size={size} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', rows);
  });

  it('rows overrides size', () => {
    render(<Textarea aria-label="Notes" size="lg" rows={1} />);
    const el = screen.getByRole('textbox');
    expect(el).toHaveAttribute('rows', '1');
    expect(el.style.getPropertyValue('--ds-textarea-rows')).toBe('1');
  });

  it('resize modes set data-resize and maxRows only for auto', () => {
    const { rerender } = render(<Textarea aria-label="Notes" resize="none" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('data-resize', 'none');
    rerender(<Textarea aria-label="Notes" resize="auto" />);
    const el = screen.getByRole('textbox');
    expect(el).toHaveAttribute('data-resize', 'auto');
    expect(el.style.getPropertyValue('--ds-textarea-max-rows')).toBe('6');
    rerender(<Textarea aria-label="Notes" resize="auto" maxRows={10} />);
    expect(screen.getByRole('textbox').style.getPropertyValue('--ds-textarea-max-rows')).toBe('10');
  });

  it('invalid prop sets aria-invalid', () => {
    render(<Textarea aria-label="Notes" invalid />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('label click focuses; Tab leaves without inserting a tab', async () => {
    const user = userEvent.setup();
    render(
      <>
        <TextareaField label="Notes" />
        <button>after</button>
      </>,
    );
    await user.click(screen.getByText('Notes'));
    const el = screen.getByLabelText('Notes');
    expect(el).toHaveFocus();
    await user.keyboard('a');
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    expect(el).toHaveValue('a');
  });

  it('Enter inserts a newline and does not submit the form', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <TextareaField label="Notes" />
      </form>,
    );
    await user.type(screen.getByLabelText('Notes'), 'a{Enter}b');
    expect(screen.getByLabelText('Notes')).toHaveValue('a\nb');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disabled is skipped by Tab; read-only is a tab stop and not editable', async () => {
    const user = userEvent.setup();
    render(
      <>
        <TextareaField label="Off" disabled />
        <TextareaField label="Ro" readOnly defaultValue="fixed" />
      </>,
    );
    await user.tab();
    expect(screen.getByLabelText('Off')).not.toHaveFocus();
    expect(screen.getByLabelText('Ro')).toHaveFocus();
    await user.keyboard('x');
    expect(screen.getByLabelText('Ro')).toHaveValue('fixed');
  });

  it('wires hint and error into the description, plus required', () => {
    render(<TextareaField label="Notes" hint="Be brief" error="too short" required />);
    const el = screen.getByLabelText(/Notes/);
    expect(el).toHaveAttribute('aria-invalid', 'true');
    expect(el).toHaveAttribute('aria-required', 'true');
    expect(el).toHaveAccessibleDescription('Be brief Error: too short');
  });

  it('explicit props win over Field wiring', () => {
    render(
      <Field label="Notes">
        <Textarea id="own" aria-describedby="x" />
      </Field>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'own');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'x');
  });

  describe('counter', () => {
    it('is hidden without maxLength and never sets native maxlength', () => {
      render(<TextareaField label="Notes" />);
      expect(screen.queryByText(/\//)).not.toBeInTheDocument();
      expect(screen.getByLabelText('Notes')).not.toHaveAttribute('maxlength');
    });

    it('shows n / max, states by threshold, and no native maxlength', () => {
      const { container } = render(<TextareaField label="Notes" maxLength={10} defaultValue="abc" />);
      const counter = () => container.querySelector('.ds-textarea-counter')!;
      expect(screen.getByLabelText('Notes')).not.toHaveAttribute('maxlength');
      expect(counter()).toHaveTextContent('3 / 10');
      expect(counter()).toHaveAttribute('data-state', 'under');
      fireEvent.change(screen.getByLabelText('Notes'), { target: { value: '123456789' } });
      expect(counter()).toHaveAttribute('data-state', 'near');
      fireEvent.change(screen.getByLabelText('Notes'), { target: { value: '1234567890' } });
      expect(counter()).toHaveAttribute('data-state', 'at');
      expect(screen.getByLabelText('Notes')).not.toHaveAttribute('aria-invalid');
      fireEvent.change(screen.getByLabelText('Notes'), { target: { value: '12345678901' } });
      expect(counter()).toHaveAttribute('data-state', 'over');
    });

    it('typing past the limit keeps text, marks invalid and announces after a debounce', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<TextareaField label="Notes" hint="Be brief" maxLength={3} error={undefined} />);
      const el = screen.getByLabelText('Notes');
      await user.type(el, 'hello');
      expect(el).toHaveValue('hello');
      expect(el).toHaveAttribute('aria-invalid', 'true');
      const live = document.querySelector('[aria-live="polite"]')!;
      expect(live).toHaveTextContent('');
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(live).toHaveTextContent('2 characters too many');
      await user.clear(el);
      await user.type(el, 'a');
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(live).toHaveTextContent('2 characters remaining');
      jest.useRealTimers();
    });

    it('description lists hint, limit sentence then error', () => {
      render(<TextareaField label="Notes" hint="Be brief" error="nope" maxLength={5} />);
      expect(screen.getByLabelText('Notes')).toHaveAccessibleDescription(
        'Be brief You can enter up to 5 characters Error: nope',
      );
    });

    it('bare Textarea renders its own counter, controlled value', async () => {
      const user = userEvent.setup();
      const Controlled = () => {
        const [v, setV] = useState('ab');
        return <Textarea aria-label="Notes" maxLength={4} value={v} onChange={(e) => setV(e.target.value)} />;
      };
      const { container } = render(<Controlled />);
      expect(container.querySelector('.ds-textarea-counter')).toHaveTextContent('2 / 4');
      await user.type(screen.getByLabelText('Notes'), 'cde');
      expect(container.querySelector('.ds-textarea-counter')).toHaveTextContent('5 / 4');
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(screen.getByLabelText('Notes')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('a11y', () => {
    it.each([
      ['default', <TextareaField key="a" label="Notes" />],
      ['hint', <TextareaField key="b" label="Notes" hint="Be brief" />],
      ['invalid', <TextareaField key="c" label="Notes" error="Required" />],
      ['disabled', <TextareaField key="d" label="Notes" disabled />],
      ['read-only', <TextareaField key="e" label="Notes" readOnly defaultValue="x" />],
      ['counter under', <TextareaField key="f" label="Notes" maxLength={10} defaultValue="abc" />],
      ['counter over', <TextareaField key="g" label="Notes" maxLength={2} defaultValue="abc" />],
      ['bare counter', <Textarea key="h" aria-label="Notes" maxLength={2} />],
    ])('has no violations: %s', async (_name, ui) => {
      const { container } = render(ui);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
