import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Icon } from './Icon';
import { icons, type IconName } from './icons';

const names = Object.keys(icons) as IconName[];

describe('Icon', () => {
  it.each(names)('renders "%s" as a decorative, stroked svg', (name) => {
    const { container } = render(<Icon name={name} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg?.children.length).toBeGreaterThan(0);
  });

  it('defaults to 16px and 1.5 stroke', () => {
    const { container } = render(<Icon name="plus" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveAttribute('stroke-width', '1.5');
  });

  it('applies size and strokeWidth', () => {
    const { container } = render(<Icon name="warning" size={20} strokeWidth={2} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('stroke-width', '2');
  });

  it('exposes an accessible name when label is given', () => {
    render(<Icon name="info" label="Information" />);
    const img = screen.getByRole('img', { name: 'Information' });
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('forwards rest props', () => {
    const { container } = render(<Icon name="check" className="text-ink" data-testid="i" />);
    expect(container.querySelector('svg')).toHaveClass('text-ink');
  });

  it('has no a11y violations (decorative and labeled)', async () => {
    const { container } = render(
      <>
        <Icon name="plus" />
        <Icon name="alert" label="Error" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
