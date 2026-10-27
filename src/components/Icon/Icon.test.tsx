import { forwardRef, type ForwardRefExoticComponent, type RefAttributes } from 'react';
import { readFileSync } from 'node:fs';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Icon } from './Icon';
import { createIcon } from './createIcon';
import { IconProvider, useIcon } from './IconProvider';
import { RoleIcon } from './RoleIcon';
import { defaultGlyphs } from './glyphs';
import { iconSize, iconStroke } from './constants';
import type { IconComponent, IconComponentProps, IconRole } from './types';
import * as pkg from '../../index';
import { PlusIcon, InfoIcon } from '../../lib/sampleIcons';

const roles = Object.keys(defaultGlyphs) as IconRole[];

const Fake: IconComponent = forwardRef<SVGSVGElement, IconComponentProps>(
  ({ width, height, strokeWidth, ...rest }, ref) => (
    <svg ref={ref} data-testid="fake" width={width} height={height} strokeWidth={strokeWidth} {...rest} />
  ),
);
const Fake2: IconComponent = (p) => <svg data-testid="fake2" {...p} />;

describe('Icon', () => {
  it('renders a decorative svg with system props', () => {
    const { container } = render(<Icon icon={PlusIcon} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveAttribute('stroke-width', '2');
  });

  it.each([
    ['sm', 12, 2],
    ['md', 16, 2],
    ['lg', 20, 1.5],
    [18, 18, 1.5],
    [24, 24, 1.5],
  ] as const)('size %s gives %s px and stroke %s', (size, px, stroke) => {
    const { container } = render(<Icon icon={PlusIcon} size={size} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', String(px));
    expect(svg).toHaveAttribute('stroke-width', String(stroke));
  });

  it('applies an explicit strokeWidth', () => {
    const { container } = render(<Icon icon={PlusIcon} size="lg" strokeWidth={2} />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '2');
  });

  it('labeled: hidden svg plus visually hidden text', () => {
    const { container } = render(<Icon icon={InfoIcon} label="Information" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toHaveAttribute('focusable', 'false');
    expect(screen.getByText('Information')).toBeInTheDocument();
  });

  it('forwards className and rest props', () => {
    const { container } = render(<Icon icon={PlusIcon} className="text-ink" />);
    expect(container.querySelector('svg')).toHaveClass('text-ink');
  });

  it('has no a11y violations (decorative and labeled)', async () => {
    const { container } = render(
      <>
        <Icon icon={PlusIcon} />
        <Icon icon={InfoIcon} label="Error" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('createIcon', () => {
  it('sets displayName and defaults', () => {
    const Icn = createIcon('MyIcon', <path d="M0 0" />);
    expect(Icn.displayName).toBe('MyIcon');
    const { container } = render(<Icn />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('stroke-width', '1.5');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
    expect(svg).toHaveAttribute('stroke-linecap', 'butt');
    expect(svg).toHaveAttribute('stroke-linejoin', 'miter');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('accepts a custom viewBox', () => {
    const Icn = createIcon('Big', <path d="M0 0" />, { viewBox: '0 0 256 256' });
    const { container } = render(<Icn />);
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 256 256');
  });

  it.each([{ 'aria-label': 'Name' }, { 'aria-labelledby': 'x' }])('drops aria-hidden with %o', (props) => {
    const Icn = createIcon('A', <path d="M0 0" />);
    const { container } = render(<Icn {...props} />);
    expect(container.querySelector('svg')).not.toHaveAttribute('aria-hidden');
  });

  it('lets given props win and forwards the ref', () => {
    const Icn = createIcon('A', <path d="M0 0" />) as ForwardRefExoticComponent<IconComponentProps & RefAttributes<SVGSVGElement>>;
    const ref = { current: null as SVGSVGElement | null };
    const { container } = render(<Icn ref={ref} focusable="true" aria-hidden={false} width={10} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('focusable', 'true');
    expect(svg).toHaveAttribute('aria-hidden', 'false');
    expect(svg).toHaveAttribute('width', '10');
    expect(ref.current).toBe(svg);
  });
});

describe('default glyphs', () => {
  it.each(roles)('%s renders stroked paths', (role) => {
    const { container } = render(<RoleIcon role={role} />);
    expect(container.querySelector('svg')?.children.length).toBeGreaterThan(0);
  });
  it('has the 11 roles', () => expect(roles).toHaveLength(11));
});

const Probe = ({ role, override }: { role: IconRole; override?: IconComponent }) => (
  <RoleIcon role={role} override={override} />
);

describe('useIcon', () => {
  it('uses the default glyph with no provider or prop', () => {
    const { container } = render(<Probe role="close" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByTestId('fake')).not.toBeInTheDocument();
  });

  it('provider beats default', () => {
    render(
      <IconProvider icons={{ close: Fake }}>
        <Probe role="close" />
      </IconProvider>,
    );
    expect(screen.getByTestId('fake')).toBeInTheDocument();
  });

  it('prop beats provider', () => {
    render(
      <IconProvider icons={{ close: Fake }}>
        <Probe role="close" override={Fake2} />
      </IconProvider>,
    );
    expect(screen.getByTestId('fake2')).toBeInTheDocument();
    expect(screen.queryByTestId('fake')).not.toBeInTheDocument();
  });

  it('partial provider leaves other roles at default', () => {
    const { container } = render(
      <IconProvider icons={{ close: Fake }}>
        <Probe role="check" />
      </IconProvider>,
    );
    expect(screen.queryByTestId('fake')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('nested providers merge and the inner one wins', () => {
    render(
      <IconProvider icons={{ close: Fake, check: Fake }}>
        <IconProvider icons={{ close: Fake2 }}>
          <Probe role="close" />
          <Probe role="check" />
        </IconProvider>
      </IconProvider>,
    );
    expect(screen.getByTestId('fake2')).toBeInTheDocument();
    expect(screen.getByTestId('fake')).toBeInTheDocument();
  });

  it('returns null for a null override', () => {
    const { result } = renderHook(() => useIcon('close', null));
    expect(result.current).toBeNull();
  });
});

describe('RoleIcon', () => {
  it('passes system props to the winning icon', () => {
    const spy = jest.fn(() => null);
    render(<RoleIcon role="alert" size={14} className="c" override={spy as unknown as IconComponent} />);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ width: 14, height: 14, strokeWidth: 2, className: 'c', 'aria-hidden': 'true', focusable: 'false' }),
      undefined,
    );
  });

  it('keeps the control name and focus order with an override', async () => {
    const onClick = jest.fn();
    render(
      <button type="button" aria-label="Close" onClick={onClick}>
        <RoleIcon role="close" override={Fake} />
      </button>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
    await userEvent.tab();
    expect(document.querySelector('svg')).not.toHaveFocus();
  });

  it('a11y: default, provider, override', async () => {
    const { container } = render(
      <div>
        <button type="button" aria-label="a"><RoleIcon role="close" /></button>
        <IconProvider icons={{ close: Fake }}>
          <button type="button" aria-label="b"><RoleIcon role="close" /></button>
        </IconProvider>
        <button type="button" aria-label="c"><RoleIcon role="close" override={Fake2} /></button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('tokens and exports', () => {
  it('constants mirror tokens.css', () => {
    const css = readFileSync('src/styles/tokens.css', 'utf8');
    const get = (name: string) => css.match(new RegExp(`--ds-${name}:\\s*([\\d.]+)`))?.[1];
    expect(Number(get('icon-size-sm'))).toBe(iconSize.sm);
    expect(Number(get('icon-size-md'))).toBe(iconSize.md);
    expect(Number(get('icon-size-lg'))).toBe(iconSize.lg);
    expect(Number(get('icon-stroke'))).toBe(iconStroke.regular);
    expect(Number(get('icon-stroke-strong'))).toBe(iconStroke.strong);
  });

  it('exports the public API only', () => {
    expect(pkg).toEqual(
      expect.objectContaining({
        Icon: expect.anything(),
        IconProvider: expect.anything(),
        createIcon: expect.any(Function),
        useIcon: expect.any(Function),
      }),
    );
    expect(pkg).not.toHaveProperty('icons');
    expect(pkg).not.toHaveProperty('defaultGlyphs');
    expect(pkg).not.toHaveProperty('RoleIcon');
  });
});
