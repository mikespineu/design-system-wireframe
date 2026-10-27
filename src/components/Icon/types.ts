import type { AriaAttributes, ComponentType, SVGProps } from 'react';

/** Props the system passes to every icon. */
export interface IconComponentProps extends AriaAttributes {
  /** Always passed by the system, in px. */
  width?: number | string;
  /** Always passed by the system, in px. */
  height?: number | string;
  className?: string;
  style?: SVGProps<SVGSVGElement>['style'];
  /** Always passed. Stroke sets honor it, fill sets ignore it. */
  strokeWidth?: number | string;
  role?: SVGProps<SVGSVGElement>['role'];
  focusable?: SVGProps<SVGSVGElement>['focusable'];
}

/** Any component that renders one root svg, spreads these props onto it and paints with currentColor. */
export type IconComponent = ComponentType<IconComponentProps>;

export type IconRole =
  | 'close'
  | 'check'
  | 'minus'
  | 'plus'
  | 'alert'
  | 'info'
  | 'success'
  | 'warning'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right';

export type IconSet = Record<IconRole, IconComponent>;
