import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import { Checkbox as RadixCheckbox, Label } from 'radix-ui';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon';
import './Checkbox.css';

export type CheckboxSize = 'sm' | 'md';
export type CheckedState = boolean | 'indeterminate';

interface GroupContextValue {
  size?: CheckboxSize;
  invalid?: boolean;
  disabled?: boolean;
  describedBy?: string;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixCheckbox.Root>, 'children' | 'asChild'> {
  /** Label shown to the right of the box. */
  label: ReactNode;
  /** Caption under the label; wired to aria-describedby. */
  description?: ReactNode;
  size?: CheckboxSize;
  invalid?: boolean;
}

export const Checkbox = forwardRef<ElementRef<typeof RadixCheckbox.Root>, CheckboxProps>(
  ({ label, description, size, invalid, disabled, id, className, 'aria-describedby': describedBy, ...rest }, ref) => {
    const group = useContext(GroupContext);
    const generated = useId();
    const boxId = id ?? generated;
    const descId = description ? `${boxId}-description` : undefined;
    const isDisabled = disabled ?? group?.disabled;
    const isInvalid = invalid ?? group?.invalid;
    const describedIds = [describedBy, descId, group?.describedBy].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cx('ds-checkbox', className)} data-size={size ?? group?.size ?? 'md'} data-disabled={isDisabled ? '' : undefined}>
        <RadixCheckbox.Root
          ref={ref}
          id={boxId}
          className="ds-checkbox-box"
          data-size={size ?? group?.size ?? 'md'}
          disabled={isDisabled}
          aria-invalid={isInvalid ? true : undefined}
          aria-describedby={describedIds}
          {...rest}
        >
          <RadixCheckbox.Indicator className="ds-checkbox-indicator">
            <span className="ds-checkbox-mark ds-checkbox-mark-check">
              <Icon name="check" size={16} strokeWidth={2} />
            </span>
            <span className="ds-checkbox-mark ds-checkbox-mark-dash">
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
                <path d="M5 12h14" />
              </svg>
            </span>
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
        <div className="ds-checkbox-text">
          <Label.Root htmlFor={boxId} className="ds-checkbox-label">
            {label}
          </Label.Root>
          {description && (
            <span id={descId} className="ds-checkbox-description">
              {description}
            </span>
          )}
        </div>
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export interface CheckboxGroupProps extends Omit<ComponentPropsWithoutRef<'fieldset'>, 'children'> {
  legend: ReactNode;
  /** Hide the legend visually; it still names the group for assistive tech. */
  hideLegend?: boolean;
  hint?: ReactNode;
  /** Sets invalid on every child. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  size?: CheckboxSize;
  children: ReactNode;
}

export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  ({ legend, hideLegend, hint, error, required, disabled, orientation = 'vertical', size, children, className, id, ...rest }, ref) => {
    const generated = useId();
    const baseId = id ?? generated;
    const hintId = hint ? `${baseId}-hint` : undefined;
    const errorId = error ? `${baseId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <GroupContext.Provider value={{ size, disabled, invalid: error ? true : undefined }}>
        <fieldset
          ref={ref}
          id={baseId}
          className={cx('ds-checkbox-group', className)}
          data-orientation={orientation}
          data-disabled={disabled ? '' : undefined}
          disabled={disabled}
          aria-describedby={describedBy}
          {...rest}
        >
          <legend className={cx('ds-checkbox-legend', hideLegend && 'sr-only')}>
            {legend}
            {required && <span aria-hidden="true"> *</span>}
          </legend>
          {hint && (
            <span id={hintId} className="ds-checkbox-hint">
              {hint}
            </span>
          )}
          <div className="ds-checkbox-options">{children}</div>
          {error && (
            <span id={errorId} className="ds-checkbox-error">
              <Icon name="alert" size={14} strokeWidth={2} />
              <span>
                <span className="sr-only">Error: </span>
                {error}
              </span>
            </span>
          )}
        </fieldset>
      </GroupContext.Provider>
    );
  },
);
CheckboxGroup.displayName = 'CheckboxGroup';
