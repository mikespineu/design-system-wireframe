import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { RadioGroup as RadixRadioGroup, Label } from 'radix-ui';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon';
import './RadioGroup.css';

export type RadioGroupSize = 'sm' | 'md';

interface GroupContextValue {
  size: RadioGroupSize;
  invalid?: boolean;
}

const GroupContext = createContext<GroupContextValue>({ size: 'md' });

export interface RadioGroupItemProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>, 'children' | 'asChild'> {
  value: string;
  /** Label shown to the right of the box. */
  label: ReactNode;
  /** Caption under the label; wired to aria-describedby. */
  description?: ReactNode;
}

export const RadioGroupItem = forwardRef<ElementRef<typeof RadixRadioGroup.Item>, RadioGroupItemProps>(
  ({ label, description, disabled, id, className, 'aria-describedby': describedBy, ...rest }, ref) => {
    const { size, invalid } = useContext(GroupContext);
    const boxRef = useRef<HTMLButtonElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        boxRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    const generated = useId();
    const boxId = id ?? generated;
    const descId = description ? `${boxId}-description` : undefined;
    const describedIds = [describedBy, descId].filter(Boolean).join(' ') || undefined;

    /** Clicks on the row's empty area (gap, padding) select the item; the box and label already do. */
    const handleRowClick = (e: MouseEvent<HTMLDivElement>) => {
      if (boxRef.current?.disabled || (e.target as HTMLElement).closest('.ds-radio-box, .ds-radio-label, input')) return;
      boxRef.current?.click();
    };

    return (
      <div
        onClick={handleRowClick}
        className={cx('ds-radio', className)}
        data-size={size}
        data-disabled={disabled ? '' : undefined}
      >
        <RadixRadioGroup.Item
          ref={setRefs}
          id={boxId}
          className="ds-radio-box"
          disabled={disabled}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedIds}
          {...rest}
        >
          <RadixRadioGroup.Indicator className="ds-radio-dot" />
        </RadixRadioGroup.Item>
        <div className="ds-radio-text">
          <Label.Root htmlFor={boxId} className="ds-radio-label">
            {label}
          </Label.Root>
          {description && (
            <span id={descId} className="ds-radio-description">
              {description}
            </span>
          )}
        </div>
      </div>
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';

export interface RadioGroupProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>, 'children' | 'asChild' | 'orientation'> {
  /** Group label; names the radiogroup. */
  label: ReactNode;
  /** Visually hidden; still names the group. */
  hideLabel?: boolean;
  hint?: ReactNode;
  /** Sets invalid on the group and every item. */
  error?: ReactNode;
  /** Layout only; arrow keys work on both axes. */
  orientation?: 'vertical' | 'horizontal';
  size?: RadioGroupSize;
  children: ReactNode;
}

export const RadioGroup = forwardRef<ElementRef<typeof RadixRadioGroup.Root>, RadioGroupProps>(
  (
    { label, hideLabel, hint, error, required, disabled, orientation = 'vertical', size = 'md', children, className, id, 'aria-describedby': describedByProp, ...rest },
    ref,
  ) => {
    const generated = useId();
    const baseId = id ?? generated;
    const labelId = `${baseId}-label`;
    const hintId = hint ? `${baseId}-hint` : undefined;
    const errorId = error ? `${baseId}-error` : undefined;
    const describedBy = [describedByProp, hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <GroupContext.Provider value={{ size, invalid: error ? true : undefined }}>
        <div
          className={cx('ds-radio-group', className)}
          data-orientation={orientation}
          data-size={size}
          data-disabled={disabled ? '' : undefined}
        >
          <span id={labelId} className={cx('ds-radio-group-label', hideLabel && 'sr-only')}>
            {label}
            {required && <span aria-hidden="true"> *</span>}
          </span>
          {hint && (
            <span id={hintId} className="ds-radio-hint">
              {hint}
            </span>
          )}
          <RadixRadioGroup.Root
            ref={ref}
            id={baseId}
            className="ds-radio-options"
            required={required}
            disabled={disabled}
            aria-labelledby={labelId}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            {...rest}
          >
            {children}
          </RadixRadioGroup.Root>
          {error && (
            <span id={errorId} className="ds-radio-error">
              <Icon name="alert" size={14} strokeWidth={2} />
              <span>
                <span className="sr-only">Error: </span>
                {error}
              </span>
            </span>
          )}
        </div>
      </GroupContext.Provider>
    );
  },
);
RadioGroup.displayName = 'RadioGroup';
