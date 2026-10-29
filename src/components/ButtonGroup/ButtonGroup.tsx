import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { ButtonGroupContext } from './context';
import './ButtonGroup.css';

interface ButtonGroupBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Join children into one unit with a shared 1 px seam. Default: spaced (8 px gap). */
  attached?: boolean;
  /** Disables every child Button and IconButton. */
  disabled?: boolean;
  /** Buttons and IconButtons. */
  children: ReactNode;
}

export type ButtonGroupProps = ButtonGroupBaseProps &
  (
    | { 'aria-label': string; 'aria-labelledby'?: never }
    | { 'aria-label'?: never; 'aria-labelledby': string }
  );

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ attached = false, disabled = false, className, children, ...rest }, ref) => (
    <ButtonGroupContext.Provider value={{ disabled }}>
      <div
        ref={ref}
        {...rest}
        role="group"
        className={cx('ds-button-group', className)}
        {...(attached ? { 'data-attached': '' } : {})}
        {...(disabled ? { 'data-disabled': '' } : {})}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  ),
);
ButtonGroup.displayName = 'ButtonGroup';
