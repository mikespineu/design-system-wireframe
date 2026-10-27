import { forwardRef, type ReactNode } from 'react';
import type { IconComponent, IconComponentProps } from './types';

/** Makes an `IconComponent` from SVG children drawn on the grid. */
export function createIcon(
  displayName: string,
  children: ReactNode,
  options: { viewBox?: string } = {},
): IconComponent {
  const Component = forwardRef<SVGSVGElement, IconComponentProps>(
    ({ width, height, strokeWidth, ...rest }, ref) => {
      const hasAccessibleName = Boolean(rest['aria-label'] || rest['aria-labelledby']);
      return (
        <svg
          ref={ref}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={options.viewBox ?? '0 0 24 24'}
          width={width ?? 24}
          height={height ?? 24}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth ?? 1.5}
          strokeLinecap="butt"
          strokeLinejoin="miter"
          focusable="false"
          aria-hidden={hasAccessibleName ? undefined : true}
          {...rest}
        >
          {children}
        </svg>
      );
    },
  );
  Component.displayName = displayName;
  return Component;
}
