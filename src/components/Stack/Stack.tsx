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
import './Stack.css';

export type StackDirection = 'vertical' | 'horizontal';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export type StackProps = LayoutBaseProps &
  LayoutElementProps & {
    /** Default 'vertical'. */
    direction?: Responsive<StackDirection>;
    /** --ds-space-* step, default 4 (16 px). */
    gap?: Responsive<Space>;
    /** Cross axis, default 'stretch'. */
    align?: Responsive<StackAlign>;
    /** Main axis, default 'start'. */
    justify?: Responsive<StackJustify>;
    /** Wrap onto new lines; only has an effect when horizontal. */
    wrap?: boolean;
  };

export const Stack = forwardRef<HTMLElement, StackProps>(
  (
    { as, asChild = false, direction, gap, align, justify, wrap = false, className, ...rest },
    ref,
  ) => {
    const Comp: React.ElementType = asChild ? Slot.Root : (as ?? 'div');
    const role = listRole(as, asChild);
    return (
      <Comp
        ref={ref}
        {...(role ? { role } : {})}
        {...rest}
        className={cx('ds-stack', className)}
        {...responsiveAttrs('direction', direction, 'vertical')}
        {...responsiveAttrs('gap', gap, 4)}
        {...responsiveAttrs('align', align, 'stretch')}
        {...responsiveAttrs('justify', justify, 'start')}
        {...(wrap ? { 'data-wrap': '' } : {})}
      />
    );
  },
);
Stack.displayName = 'Stack';
