import { AccessibleIcon } from 'radix-ui';
import { iconSize, iconStroke } from './constants';
import type { IconComponent, IconComponentProps } from './types';

export interface IconProps extends Omit<IconComponentProps, 'width' | 'height'> {
  /** The icon to render. Any `IconComponent`. */
  icon: IconComponent;
  /** `sm` 12, `md` 16, `lg` 20, or any number of px. */
  size?: 'sm' | 'md' | 'lg' | number;
  /** Stroke width in the 24 grid. Defaults from size: 2 at 16 px and below, 1.5 above. */
  strokeWidth?: number;
  /** Accessible name. When omitted the icon is decorative and hidden from assistive tech. */
  label?: string;
}

export const Icon = ({ icon: IconComp, size = 'md', strokeWidth, label, ...rest }: IconProps) => {
  const px = typeof size === 'number' ? size : iconSize[size];
  const stroke = strokeWidth ?? (px <= 16 ? iconStroke.strong : iconStroke.regular);
  const svg = (
    <IconComp
      width={px}
      height={px}
      strokeWidth={stroke}
      focusable="false"
      aria-hidden="true"
      {...rest}
    />
  );
  return label ? <AccessibleIcon.Root label={label}>{svg}</AccessibleIcon.Root> : svg;
};
