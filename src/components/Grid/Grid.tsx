import { forwardRef } from 'react';
import { Slot } from 'radix-ui';
import { cx } from '../../lib/cx';
import {
  listRole,
  responsiveAttrs,
  type LayoutBaseProps,
  type LayoutElementProps,
  type Responsive,
  type Space,
} from '../../lib/layout';
import './Grid.css';

export type GridColumns = 1 | 2 | 3 | 4 | 6 | 12;
export type GridAlign = 'start' | 'center' | 'end' | 'stretch';

export type GridProps = LayoutBaseProps &
  LayoutElementProps & {
    /** Equal columns, default 1. */
    columns?: Responsive<GridColumns>;
    /** --ds-space-* step for rows and columns, default 6 (24 px). */
    gap?: Responsive<Space>;
    /** align-items in each row, default 'stretch'. */
    align?: Responsive<GridAlign>;
  };

export const Grid = forwardRef<HTMLElement, GridProps>(
  ({ as, asChild = false, columns, gap, align, className, ...rest }, ref) => {
    const Comp: React.ElementType = asChild ? Slot.Root : (as ?? 'div');
    const role = listRole(as, asChild);
    return (
      <Comp
        ref={ref}
        {...(role ? { role } : {})}
        {...rest}
        className={cx('ds-grid', className)}
        {...responsiveAttrs('columns', columns, 1)}
        {...responsiveAttrs('gap', gap, 6)}
        {...responsiveAttrs('align', align, 'stretch')}
      />
    );
  },
);
Grid.displayName = 'Grid';
