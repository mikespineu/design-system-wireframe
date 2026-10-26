import { forwardRef, useCallback, useId, useRef, type ComponentPropsWithoutRef, type ElementRef, type MouseEvent, type ReactNode } from 'react';
import { Switch as RadixSwitch, Label } from 'radix-ui';
import { cx } from '../../lib/cx';
import './Switch.css';

export type SwitchSize = 'sm' | 'md';
export type SwitchLabelPosition = 'end' | 'start';

interface SwitchBaseProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixSwitch.Root>, 'children' | 'asChild' | 'aria-label'> {
  /** Caption under the label; wired to aria-describedby. */
  description?: ReactNode;
  /** `end`: track then label. `start`: label first, track pushed to the far edge. */
  labelPosition?: SwitchLabelPosition;
  size?: SwitchSize;
}

export type SwitchProps = SwitchBaseProps &
  ({ label: ReactNode; 'aria-label'?: never } | { label?: never; 'aria-label': string });

export const Switch = forwardRef<ElementRef<typeof RadixSwitch.Root>, SwitchProps>(
  (
    { label, description, labelPosition = 'end', size = 'md', disabled, id, className, 'aria-describedby': describedBy, 'aria-label': ariaLabel, ...rest },
    ref,
  ) => {
    const trackRef = useRef<HTMLButtonElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        trackRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    const generated = useId();
    const switchId = id ?? generated;
    const descId = description ? `${switchId}-description` : undefined;
    const describedIds = [describedBy, descId].filter(Boolean).join(' ') || undefined;

    /** Clicks on the row's empty area toggle the switch; the track and label already do. */
    const handleRowClick = (e: MouseEvent<HTMLDivElement>) => {
      if (disabled || (e.target as HTMLElement).closest('.ds-switch-track, .ds-switch-label, input')) return;
      trackRef.current?.click();
    };

    return (
      <div
        onClick={handleRowClick}
        className={cx('ds-switch', className)}
        data-size={size}
        data-label-position={labelPosition}
        data-disabled={disabled ? '' : undefined}
      >
        <RadixSwitch.Root
          ref={setRefs}
          id={switchId}
          className="ds-switch-track"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-describedby={describedIds}
          {...rest}
        >
          <RadixSwitch.Thumb className="ds-switch-thumb" />
        </RadixSwitch.Root>
        {(label || description) && (
          <div className="ds-switch-text">
            {label && (
              <Label.Root htmlFor={switchId} className="ds-switch-label">
                {label}
              </Label.Root>
            )}
            {description && (
              <span id={descId} className="ds-switch-description">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);
Switch.displayName = 'Switch';
