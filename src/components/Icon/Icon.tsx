import type { SVGAttributes } from 'react';
import { icons, type IconName } from './icons';

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  name: IconName;
  /** Pixel width and height. */
  size?: number;
  /** Stroke width in the 24px viewBox. The spec uses 1.5, and 2 for small or severity icons. */
  strokeWidth?: number;
  /** Accessible name. When omitted the icon is decorative and hidden from assistive tech. */
  label?: string;
}

export const Icon = ({ name, size = 16, strokeWidth = 1.5, label, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    focusable="false"
    {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    {...rest}
  >
    {icons[name]}
  </svg>
);
