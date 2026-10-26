import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders role switch named by its label, forwards ref', () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(<Switch ref={ref} label="Wi-Fi" />);
    const sw = screen.getByRole('switch', { name: 'Wi-Fi' });
    expect(ref.current).toBe(sw);
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(container.firstChild).toHaveAttribute('data-size', 'md');
    expect(container.firstChild).toHaveAttribute('data-label-position', 'end');
  });

  it('Space and Enter toggle', async () => {
    const user = userEvent.setup();
    render(<Switch label="Wi-Fi" />);
    await user.tab();
    const sw = screen.getByRole('switch');
    expect(sw).toHaveFocus();
    await user.keyboard(' ');
    expect(sw).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{Enter}');
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('clicking the label toggles', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    render(<Switch label="Wi-Fi" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByText('Wi-Fi'));
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('the row gap toggles exactly once; the track too', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    const { container } = render(<Switch label="Wi-Fi" description="Caption" onCheckedChange={onCheckedChange} />);
    await user.click(container.firstChild as HTMLElement);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
  });

  it('supports controlled use', async () => {
    const user = userEvent.setup();
    render(<Switch label="Wi-Fi" checked onCheckedChange={() => {}} />);
    await user.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');
  });

  it('Tab skips a disabled switch and it does not toggle', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    const { container } = render(
      <>
        <Switch label="A" disabled onCheckedChange={onCheckedChange} />
        <Switch label="B" />
      </>,
    );
    await user.tab();
    expect(screen.getByRole('switch', { name: 'B' })).toHaveFocus();
    await user.click(container.firstChild as HTMLElement);
    await user.click(screen.getByText('A'));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(container.firstChild).toHaveAttribute('data-disabled');
  });

  it('description is wired to aria-describedby', () => {
    render(<Switch label="Wi-Fi" description="Join known networks" aria-describedby="extra" />);
    const sw = screen.getByRole('switch');
    const desc = screen.getByText('Join known networks');
    expect(sw.getAttribute('aria-describedby')).toBe(`extra ${desc.id}`);
  });

  it('applies size and labelPosition', () => {
    const { container } = render(<Switch label="Wi-Fi" size="sm" labelPosition="start" className="x" />);
    expect(container.firstChild).toHaveAttribute('data-size', 'sm');
    expect(container.firstChild).toHaveAttribute('data-label-position', 'start');
    expect(container.firstChild).toHaveClass('x');
  });

  it('submits name / value through the hidden input when on', () => {
    const { container } = render(
      <form>
        <Switch label="Wi-Fi" name="wifi" value="yes" defaultChecked />
      </form>,
    );
    const data = new FormData(container.querySelector('form') as HTMLFormElement);
    expect(data.get('wifi')).toBe('yes');
  });

  it('aria-label only names the switch', () => {
    render(<Switch aria-label="Row enabled" />);
    expect(screen.getByRole('switch', { name: 'Row enabled' })).toBeInTheDocument();
  });

  it.each([
    ['off', <Switch key="a" label="Wi-Fi" />],
    ['on', <Switch key="b" label="Wi-Fi" defaultChecked />],
    ['disabled off', <Switch key="c" label="Wi-Fi" disabled />],
    ['disabled on', <Switch key="d" label="Wi-Fi" disabled defaultChecked />],
    ['start', <Switch key="e" label="Wi-Fi" labelPosition="start" />],
    ['end sm', <Switch key="f" label="Wi-Fi" size="sm" />],
    ['description', <Switch key="g" label="Wi-Fi" description="Caption" />],
    ['aria-label', <Switch key="h" aria-label="Wi-Fi" />],
  ])('has no axe violations: %s', async (_n, ui) => {
    const { container } = render(ui);
    expect(await axe(container)).toHaveNoViolations();
  });
});
