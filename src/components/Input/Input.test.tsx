import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Field, Input, TextField } from './Input';

describe('Input', () => {
  it('renders standalone with token classes and forwards ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Name" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByRole('textbox')).toHaveClass('h-control', 'rounded-md', 'border');
  });

  it('accepts typing', async () => {
    const user = userEvent.setup();
    render(<TextField label="Email" type="email" />);
    await user.type(screen.getByLabelText('Email'), 'ada@studio');
    expect(screen.getByLabelText('Email')).toHaveValue('ada@studio');
  });

  it('focuses the input when the label is clicked', async () => {
    const user = userEvent.setup();
    render(<TextField label="Email" />);
    await user.click(screen.getByText('Email'));
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('is disabled and skipped by Tab', async () => {
    const user = userEvent.setup();
    render(<TextField label="Email" disabled placeholder="Unavailable" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeDisabled();
    await user.tab();
    expect(input).not.toHaveFocus();
    await user.type(input, 'x');
    expect(input).toHaveValue('');
  });

  it('wires error: aria-invalid, describedby, icon and message', () => {
    render(<TextField label="Email" hint="We never share it" error="enter a full email address" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/We never share it.*Error: enter a full email address/);
    const msg = screen.getByText('enter a full email address').closest('span[id]')!;
    expect(msg.querySelector('svg')).toBeInTheDocument();
    expect(input.getAttribute('aria-describedby')).toContain(msg.id);
  });

  it('has no invalid state or description without error/hint', () => {
    render(<TextField label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('Field wires any Input child, honours custom id and required', () => {
    render(
      <Field label="Name" id="custom" required>
        <Input />
      </Field>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('supports invalid prop outside a Field', () => {
    render(<Input aria-label="x" invalid />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it.each([
    ['default', {}],
    ['error', { error: 'Bad' }],
    ['disabled', { disabled: true }],
    ['hint + required', { hint: 'Help', required: true }],
  ])('has no a11y violations (%s)', async (_n, props) => {
    const { container } = render(<TextField label="Email" {...props} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
