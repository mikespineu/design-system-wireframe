import { forwardRef, type ButtonHTMLAttributes, type MouseEvent } from 'react';
import { Slot } from 'radix-ui';
import { cx } from '../../lib/cx';
import { Icon, type IconComponent } from '../Icon';
import { Spinner } from './Spinner';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Icon before the label (16 px, decorative). */
  leadingIcon?: IconComponent;
  /** Icon after the label (16 px, decorative). */
  trailingIcon?: IconComponent;
  /** Busy state: keeps width and name, blocks clicks, stays focusable. Ignored when `disabled`. */
  loading?: boolean;
  /** Render the child element (e.g. an anchor) with button styling instead of a <button>. */
  asChild?: boolean;
}

const base =
  'inline-flex h-control items-center justify-center rounded-md border font-mono text-sm font-medium ' +
  'cursor-pointer transition-colors duration-[120ms] ease-ds focus-visible:focus-ring ' +
  'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed';

const variants: Record<ButtonVariant, string> = {
  primary:
    'px-6 border-primary bg-primary text-primary-contrast ' +
    'disabled:border-divider disabled:bg-divider disabled:text-placeholder',
  secondary:
    'px-6 border-ink bg-surface text-ink disabled:border-border disabled:bg-surface disabled:text-placeholder',
  ghost: 'px-4 border-transparent bg-transparent text-ink underline disabled:text-placeholder',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      asChild = false,
      leadingIcon,
      trailingIcon,
      loading = false,
      className,
      type,
      children,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const Comp = asChild ? Slot.Root : 'button';
    // `disabled` wins over `loading`: native disabled look, no spinner, no aria-busy.
    const busy = loading && !rest.disabled;
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (busy) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };
    return (
      <Comp
        ref={ref}
        {...(asChild ? {} : { type: type ?? 'button' })}
        className={cx('ds-button', base, variants[variant], className)}
        data-variant={variant}
        {...(busy ? { 'aria-busy': true, 'aria-disabled': true, 'data-loading': '' } : {})}
        {...rest}
        onClick={handleClick}
      >
        {leadingIcon ? <Icon icon={leadingIcon} size={16} className="ds-button-icon" /> : null}
        {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}
        {trailingIcon ? <Icon icon={trailingIcon} size={16} className="ds-button-icon" /> : null}
        {busy ? <Spinner /> : null}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
