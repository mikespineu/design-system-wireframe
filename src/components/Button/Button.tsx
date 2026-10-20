import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from 'radix-ui';
import { cx } from '../../lib/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Render the child element (e.g. an anchor) with button styling instead of a <button>. */
  asChild?: boolean;
}

const base =
  'inline-flex h-control items-center justify-center rounded-md border font-mono text-sm font-medium ' +
  'cursor-pointer transition-colors duration-[120ms] ease-ds focus-visible:focus-ring ' +
  'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed';

const variants: Record<ButtonVariant, string> = {
  primary:
    'px-6 border-primary bg-primary text-primary-contrast enabled:hover:border-primary-hover enabled:hover:bg-primary-hover ' +
    'disabled:border-divider disabled:bg-divider disabled:text-placeholder',
  secondary:
    'px-6 border-ink bg-surface text-ink enabled:hover:bg-fill ' +
    'disabled:border-border disabled:bg-surface disabled:text-placeholder',
  ghost:
    'px-4 border-transparent bg-transparent text-ink underline underline-offset-4 enabled:hover:bg-fill ' +
    'disabled:text-placeholder',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', asChild = false, className, type, ...rest }, ref) => {
    const Comp = asChild ? Slot.Root : 'button';
    return (
      <Comp
        ref={ref}
        {...(asChild ? {} : { type: type ?? 'button' })}
        className={cx(base, variants[variant], className)}
        {...rest}
      />
    );
  },
);
Button.displayName = 'Button';
