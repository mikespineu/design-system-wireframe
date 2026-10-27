import { createRef, type ComponentProps } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

type User = ReturnType<typeof userEvent.setup>;
/** Radix selects on focus while an arrow key is held, and moves focus in a timeout, so hold the key. */
const arrow = async (user: User, key: string) => {
  await user.keyboard(`{${key}>}`);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });
  await user.keyboard(`{/${key}}`);
};

const setup = (props: Partial<ComponentProps<typeof RadioGroup>> = {}, disabledSecond = false) =>
  render(
    <RadioGroup label="Delivery" {...props}>
      <RadioGroupItem value="a" label="Standard" description={props.hint ? 'Slow' : undefined} />
      <RadioGroupItem value="b" label="Express" disabled={disabledSecond} />
      <RadioGroupItem value="c" label="Pickup" />
    </RadioGroup>,
  );

describe('RadioGroup', () => {
  it('names the group by label, describes by hint and error, sets invalid and required', () => {
    const ref = createRef<HTMLDivElement>();
    setup({ ref, hint: 'Pick one', error: 'Required', required: true });
    const group = screen.getByRole('radiogroup', { name: /Delivery/ });
    expect(ref.current).toBe(group);
    expect(group).toHaveAccessibleDescription('Pick one Error: Required');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    screen.getAllByRole('radio').forEach((r) => expect(r).toHaveAttribute('aria-invalid', 'true'));
    expect(screen.getByRole('radio', { name: 'Standard' })).toHaveAccessibleDescription('Slow');
  });

  it('Tab enters without selecting, once; arrows select and wrap', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>before</button>
        <RadioGroup label="Delivery">
          <RadioGroupItem value="a" label="Standard" />
          <RadioGroupItem value="b" label="Express" />
          <RadioGroupItem value="c" label="Pickup" />
        </RadioGroup>
        <button>after</button>
      </>,
    );
    await user.tab();
    await user.tab();
    const [a, b, c] = screen.getAllByRole('radio');
    expect(a).toHaveFocus();
    expect(a).not.toBeChecked();
    await arrow(user, 'ArrowDown');
    expect(b).toHaveFocus();
    expect(b).toBeChecked();
    await arrow(user, 'ArrowRight');
    expect(c).toBeChecked();
    await arrow(user, 'ArrowDown');
    expect(a).toBeChecked();
    await arrow(user, 'ArrowUp');
    expect(c).toBeChecked();
    await arrow(user, 'ArrowLeft');
    expect(b).toBeChecked();
    await user.tab();
    expect(screen.getByText('after')).toHaveFocus();
    await user.tab({ shift: true });
    expect(b).toHaveFocus();
  });

  it('Home/End move focus without selecting; Space selects; Enter does not submit', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <RadioGroup label="Delivery" name="d">
          <RadioGroupItem value="a" label="Standard" />
          <RadioGroupItem value="b" label="Express" />
          <RadioGroupItem value="c" label="Pickup" />
        </RadioGroup>
      </form>,
    );
    const [a, , c] = screen.getAllByRole('radio');
    await user.tab();
    await user.keyboard('{End}');
    expect(c).toHaveFocus();
    expect(c).not.toBeChecked();
    await user.keyboard('{Home}');
    expect(a).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(a).not.toBeChecked();
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard(' ');
    expect(a).toBeChecked();
    expect(document.querySelector('input[name="d"]')).toBeChecked();
  });

  it('skips disabled items; disabled group is skipped by Tab', async () => {
    const user = userEvent.setup();
    const { unmount } = setup({ defaultValue: 'a' }, true);
    await user.tab();
    await arrow(user, 'ArrowDown');
    expect(screen.getByRole('radio', { name: 'Pickup' })).toBeChecked();
    unmount();
    render(
      <>
        <RadioGroup label="G" disabled>
          <RadioGroupItem value="a" label="One" />
        </RadioGroup>
        <button>after</button>
      </>,
    );
    await user.tab();
    expect(screen.getByText('after')).toHaveFocus();
  });

  it('clicking label or row selects; disabled row does not; fires onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    setup({ onValueChange }, true);
    await user.click(screen.getByText('Pickup'));
    expect(onValueChange).toHaveBeenCalledWith('c');
    const row = screen.getByRole('radio', { name: 'Standard' }).parentElement as HTMLElement;
    await user.click(row);
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked();
    await user.click(screen.getByText('Express'));
    expect(screen.getByRole('radio', { name: 'Express' })).not.toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Express' }).parentElement as HTMLElement);
    expect(screen.getByRole('radio', { name: 'Express' })).not.toBeChecked();
  });

  it('rtl mirrors left/right', async () => {
    const user = userEvent.setup();
    setup({ dir: 'rtl', defaultValue: 'a' });
    await user.tab();
    await arrow(user, 'ArrowLeft');
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
  });

  it('passes size and orientation, hides label visually', () => {
    const { container } = setup({ size: 'sm', orientation: 'horizontal', hideLabel: true });
    expect(container.firstElementChild).toHaveAttribute('data-orientation', 'horizontal');
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('data-state', 'unchecked');
    expect(container.querySelector('.ds-radio')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('radiogroup', { name: 'Delivery' })).toBeInTheDocument();
  });

  it.each([
    ['default', {}],
    ['selected', { defaultValue: 'a' }],
    ['hint', { hint: 'Pick one' }],
    ['invalid', { error: 'Oops' }],
    ['invalid selected', { error: 'Oops', defaultValue: 'a' }],
    ['required', { required: true }],
    ['hidden label', { hideLabel: true }],
    ['horizontal', { orientation: 'horizontal' as const }],
    ['sm', { size: 'sm' as const }],
    ['disabled group', { disabled: true }],
  ])('has no a11y violations: %s', async (_n, props) => {
    const { container } = setup(props);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no a11y violations with a disabled item', async () => {
    const { container } = setup({ defaultValue: 'a' }, true);
    expect(await axe(container)).toHaveNoViolations();
  });
});
