import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import type { ReactElement } from 'react';
import { Icon } from './Icon';
import { IconButton } from '../IconButton';
import { iconSources, lucideIconSet } from './librarySources';
import * as stories from './BringYourOwnIcons.stories';

describe.each(iconSources)('$name contract through Icon', ({ icon }) => {
  it('forwards size', () => {
    const { container } = render(<Icon icon={icon} size={20} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });

  it('paints with currentColor', () => {
    const { container } = render(<Icon icon={icon} />);
    const painted = [container.querySelector('svg'), ...container.querySelectorAll('svg *')].some(
      (el) => ['stroke', 'fill'].some((a) => el?.getAttribute(a) === 'currentColor'),
    );
    expect(painted).toBe(true);
  });

  it('is decorative: aria-hidden, no title, not focusable', () => {
    const { container } = render(<Icon icon={icon} />);
    const svg = container.querySelector('svg');
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('tabindex');
    expect(svg?.querySelector('title')).toBeNull();
  });

  it('exposes role="img" and the name when given', () => {
    const { container } = render(<Icon icon={icon} role="img" aria-hidden={undefined} aria-label="Close" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Close');
    expect(svg).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the button name and never takes focus in IconButton', async () => {
    const user = userEvent.setup();
    const { container } = render(<IconButton icon={icon} aria-label="Close" />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('strokeWidth handling the wrapper does not normalize', () => {
  const stroke = (name: string) => {
    const { icon } = iconSources.find((s) => s.name === name)!;
    const { container } = render(<Icon icon={icon} size={24} strokeWidth={1.75} />);
    return container.querySelector('svg')!.getAttribute('stroke-width');
  };
  it.each(['Lucide', 'Tabler', 'Heroicons'])('%s honors strokeWidth', (name) => {
    expect(stroke(name)).toBe('1.75');
  });
  it('Phosphor is fill-based: the attribute is forwarded but nothing is stroked', () => {
    const { icon } = iconSources.find((s) => s.name === 'Phosphor')!;
    const { container } = render(<Icon icon={icon} size={24} strokeWidth={3} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg.querySelector('[stroke]:not([stroke="none"])')).toBeNull();
  });
});

describe('lucideIconSet', () => {
  it('covers all 11 roles', () => {
    expect(Object.keys(lucideIconSet)).toHaveLength(11);
  });
});

describe('example stories', () => {
  const { default: _meta, ...named } = stories;
  void _meta;
  it.each(Object.keys(named))('%s has no axe violations', async (name) => {
    const story = named[name as keyof typeof named] as { render: () => ReactElement };
    const { container } = render(story.render());
    expect(await axe(container)).toHaveNoViolations();
  });
});
