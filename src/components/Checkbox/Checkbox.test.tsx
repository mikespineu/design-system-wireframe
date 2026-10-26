import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Checkbox, CheckboxGroup } from './Checkbox';

describe('Checkbox', () => {
  it('renders role checkbox named by its label, forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} label="Accept" />);
    const box = screen.getByRole('checkbox', { name: 'Accept' });
    expect(ref.current).toBe(box);
    expect(box).toHaveAttribute('aria-checked', 'false');
    expect(box).toHaveAttribute('data-size', 'md');
  });

  it('Space toggles; Enter does nothing and does not submit', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Checkbox label="Accept" />
      </form>,
    );
    await user.tab();
    const box = screen.getByRole('checkbox');
    expect(box).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(box).toHaveAttribute('aria-checked', 'false');
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard(' ');
    expect(box).toHaveAttribute('aria-checked', 'true');
    await user.keyboard(' ');
    expect(box).toHaveAttribute('aria-checked', 'false');
  });

  it('clicking the label toggles', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    render(<Checkbox label="Accept" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByText('Accept'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'checked');
  });

  it('indeterminate is mixed and a click makes it checked', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="All" defaultChecked="indeterminate" />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAttribute('aria-checked', 'mixed');
    expect(box).toHaveAttribute('data-state', 'indeterminate');
    await user.click(box);
    expect(box).toHaveAttribute('aria-checked', 'true');
  });

  it('controlled checked', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [c, setC] = useState<boolean | 'indeterminate'>(false);
      return <Checkbox label="C" checked={c} onCheckedChange={setC} />;
    };
    render(<Controlled />);
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('description is referenced by aria-describedby', () => {
    render(<Checkbox label="Accept" description="Weekly only" />);
    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('Weekly only');
  });

  it('size sm, invalid and required', () => {
    render(<Checkbox label="Accept" size="sm" invalid required />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAttribute('data-size', 'sm');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toBeRequired();
  });

  it('disabled is not toggled and skipped by Tab', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox label="A" />
        <Checkbox label="B" disabled />
        <Checkbox label="C" />
      </>,
    );
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'A' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'C' })).toHaveFocus();
    await user.click(screen.getByText('B'));
    expect(screen.getByRole('checkbox', { name: 'B' })).toHaveAttribute('data-disabled');
    expect(screen.getByRole('checkbox', { name: 'B' })).toHaveAttribute('aria-checked', 'false');
  });

  it('submits name/value when checked', async () => {
    const user = userEvent.setup();
    render(
      <form data-testid="f">
        <Checkbox label="News" name="topics" value="news" />
      </form>,
    );
    await user.click(screen.getByRole('checkbox'));
    const data = new FormData(screen.getByTestId('f') as HTMLFormElement);
    expect(data.get('topics')).toBe('news');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultChecked description="Caption" />
        <Checkbox label="Mixed" defaultChecked="indeterminate" />
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Invalid" invalid />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('CheckboxGroup', () => {
  it('is named by the legend and described by hint and error', async () => {
    render(
      <CheckboxGroup legend="Topics" hint="Pick one" error="Choose at least one" required>
        <Checkbox label="A" />
        <Checkbox label="B" />
      </CheckboxGroup>,
    );
    const group = screen.getByRole('group', { name: /Topics/ });
    expect(group).toHaveAccessibleDescription('Pick one Error: Choose at least one');
    screen.getAllByRole('checkbox').forEach((b) => expect(b).toHaveAttribute('aria-invalid', 'true'));
  });

  it('passes size and disabled to children', () => {
    render(
      <CheckboxGroup legend="Topics" size="sm" disabled orientation="horizontal">
        <Checkbox label="A" />
      </CheckboxGroup>,
    );
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAttribute('data-size', 'sm');
    expect(box).toBeDisabled();
    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('a child can override size', () => {
    render(
      <CheckboxGroup legend="T" size="sm">
        <Checkbox label="A" size="md" />
      </CheckboxGroup>,
    );
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-size', 'md');
  });

  it('supports a select-all parent', async () => {
    const user = userEvent.setup();
    const Tree = () => {
      const [items, setItems] = useState([true, false]);
      const all = items.every(Boolean) ? true : items.some(Boolean) ? 'indeterminate' : false;
      return (
        <CheckboxGroup legend="Items">
          <Checkbox label="All" checked={all} onCheckedChange={(c) => setItems(items.map(() => c === true))} />
          {items.map((v, i) => (
            <Checkbox
              key={i}
              label={`Item ${i}`}
              checked={v}
              onCheckedChange={(c) => setItems(items.map((x, j) => (j === i ? c === true : x)))}
            />
          ))}
        </CheckboxGroup>
      );
    };
    render(<Tree />);
    expect(screen.getByRole('checkbox', { name: 'All' })).toHaveAttribute('aria-checked', 'mixed');
    await user.click(screen.getByRole('checkbox', { name: 'All' }));
    expect(screen.getByRole('checkbox', { name: 'Item 1' })).toBeChecked();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <CheckboxGroup legend="Default">
          <Checkbox label="A" />
        </CheckboxGroup>
        <CheckboxGroup legend="Hint" hint="Pick" orientation="horizontal">
          <Checkbox label="A" />
          <Checkbox label="B" />
        </CheckboxGroup>
        <CheckboxGroup legend="Invalid" error="Required" required>
          <Checkbox label="A" />
        </CheckboxGroup>
        <CheckboxGroup legend="Disabled" disabled>
          <Checkbox label="A" />
        </CheckboxGroup>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
