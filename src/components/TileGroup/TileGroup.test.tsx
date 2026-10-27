import { createRef, useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TileGroup } from './TileGroup';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { AlertIcon, InfoIcon, PlusIcon, SearchIcon } from '../../lib/sampleIcons';

const options = [
  { value: 'add', label: 'Add', icon: <Icon icon={PlusIcon} /> },
  { value: 'search', label: 'Search', icon: <Icon icon={SearchIcon} /> },
  { value: 'info', label: 'Details', icon: <Icon icon={InfoIcon} />, disabled: true },
  { value: 'alert', label: 'Alerts', icon: <Icon icon={AlertIcon} /> },
] as const;

const many = Array.from({ length: 8 }, (_, i) => ({
  value: `v${i}`,
  label: `Option ${i}`,
  icon: <Icon icon={PlusIcon} />,
}));

type User = ReturnType<typeof userEvent.setup>;
/** Radix selects on focus while an arrow key is held, and moves focus in a timeout, so hold the key. */
const arrow = async (user: User, key: 'ArrowRight' | 'ArrowLeft') => {
  await user.keyboard(`{${key}>}`);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5));
  });
  await user.keyboard(`{/${key}}`);
};

describe('TileGroup', () => {
  beforeEach(() => {
    Element.prototype.scrollTo = jest.fn();
  });

  it('renders a named radiogroup with tile variant, forwards ref and rest props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<TileGroup ref={ref} label="Action" options={options} data-testid="g" />);
    const group = screen.getByRole('radiogroup', { name: 'Action' });
    expect(ref.current).toBe(group);
    expect(group).toHaveAttribute('data-testid', 'g');
    expect(group).toHaveAttribute('data-variant', 'tile');
    expect(group).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('radio', { name: 'Add' })).toBeChecked();
  });

  it('defaults the label to the top and supports start, hint and help', () => {
    const { rerender } = render(
      <TileGroup label="Action" options={options} hint="Pick one" help={<IconButton icon={InfoIcon} aria-label="About actions" />} />,
    );
    expect(document.querySelector('.ds-choice')).toHaveAttribute('data-label-position', 'top');
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription('Pick one');
    expect(screen.getByRole('radiogroup')).not.toContainElement(screen.getByRole('button', { name: 'About actions' }));
    rerender(<TileGroup label="Action" options={options} labelPosition="start" />);
    expect(document.querySelector('.ds-choice')).toHaveAttribute('data-label-position', 'start');
  });

  it('icon is aria-hidden and the label is the accessible name', () => {
    render(<TileGroup label="Action" options={options} />);
    const radio = screen.getByRole('radio', { name: 'Add' });
    const icon = radio.querySelector('.ds-tile-icon')!;
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon.querySelector('svg')).toBeInTheDocument();
    expect(radio).toHaveAccessibleName('Add');
  });

  it('does not show the sliding indicator', () => {
    render(<TileGroup label="Action" options={options} />);
    expect(document.querySelector('[data-indicator]')).not.toBeInTheDocument();
  });

  it('Tab lands on the selected tile; Arrow Right selects next, skips disabled, wraps', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<TileGroup label="Action" options={options} defaultValue="search" onValueChange={onValueChange} />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Search' })).toHaveFocus();
    await arrow(user, 'ArrowRight');
    expect(screen.getByRole('radio', { name: 'Alerts' })).toBeChecked();
    await arrow(user, 'ArrowRight');
    expect(screen.getByRole('radio', { name: 'Add' })).toBeChecked();
    expect(onValueChange).toHaveBeenNthCalledWith(1, 'alert');
    expect(onValueChange).toHaveBeenNthCalledWith(2, 'add');
  });

  it('Arrow Left goes forward in RTL', async () => {
    const user = userEvent.setup();
    render(<TileGroup label="Action" options={options} dir="rtl" />);
    await user.tab();
    await arrow(user, 'ArrowLeft');
    expect(screen.getByRole('radio', { name: 'Search' })).toBeChecked();
  });

  it('Home and End move focus without selecting; Space then selects', async () => {
    const user = userEvent.setup();
    render(<TileGroup label="Action" options={options} />);
    await user.tab();
    await user.keyboard('{End}');
    expect(screen.getByRole('radio', { name: 'Alerts' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Add' })).toBeChecked();
    await user.keyboard(' ');
    expect(screen.getByRole('radio', { name: 'Alerts' })).toBeChecked();
  });

  it('clicking the selected tile does not fire onValueChange; works controlled', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    const Controlled = () => {
      const [v, setV] = useState<(typeof options)[number]['value']>('add');
      return (
        <TileGroup
          label="Action"
          options={options}
          value={v}
          onValueChange={(n) => {
            onValueChange(n);
            setV(n);
          }}
        />
      );
    };
    render(<Controlled />);
    await user.click(screen.getByRole('radio', { name: 'Add' }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('radio', { name: 'Search' }));
    expect(onValueChange).toHaveBeenCalledWith('search');
    expect(screen.getByRole('radio', { name: 'Search' })).toBeChecked();
  });

  it('disabled item is skipped and disabled group is out of tab order', async () => {
    const user = userEvent.setup();
    render(<TileGroup label="Action" options={options} disabled />);
    expect(screen.getByRole('radio', { name: 'Details' })).toBeDisabled();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Add' })).not.toHaveFocus();
    expect(screen.getByRole('radio', { name: 'Add' })).toBeChecked();
  });

  describe('a11y', () => {
    it.each([
      ['md', {}],
      ['sm', { size: 'sm' as const }],
      ['label start', { labelPosition: 'start' as const }],
      ['hint', { hint: 'Pick one' }],
      ['disabled group', { disabled: true }],
    ])('has no violations: %s', async (_n, props) => {
      const { container } = render(<TileGroup label="Action" options={options} {...props} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations with help and when overflowing', async () => {
      const { container } = render(
        <div style={{ width: 200 }}>
          <TileGroup label="Action" options={many} help={<IconButton icon={InfoIcon} aria-label="About actions" />} />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
