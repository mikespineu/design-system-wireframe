import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from 'radix-ui';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Accessible name. Required because the button has no visible text. */
  'aria-label': string;
  /** Icon rendered inside the button. */
  icon: IconName;
  /** Render the child element (e.g. an anchor) with icon button styling instead of a <button>. */
  asChild?: boolean;
  /** Only used with `asChild`: the element (e.g. <a>) that receives the styling and the icon. */
  children?: ReactNode;
}

const base =
  'inline-flex h-control w-11 items-center justify-center rounded-md border border-ink bg-surface text-ink ' +
  'cursor-pointer transition-colors duration-[120ms] ease-ds focus-visible:focus-ring ' +
  'enabled:hover:bg-fill disabled:cursor-not-allowed disabled:border-border disabled:text-disabled ' +
  'aria-disabled:cursor-not-allowed';

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, asChild = false, className, type, children, ...rest }, ref) => {
    const Comp = asChild ? Slot.Root : 'button';
    return (
      <Comp
        ref={ref}
        {...(asChild ? {} : { type: type ?? 'button' })}
        className={cx(base, className)}
        {...rest}
      >
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
        <Icon name={icon} size={18} />
      </Comp>
    );
  },
);
IconButton.displayName = 'IconButton';
