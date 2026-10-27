import { forwardRef, useCallback, useEffect, useId, useState, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from 'react';
import { Popover as RadixPopover } from 'radix-ui';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon';
import './Popover.css';

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

type BaseProps = Omit<
  ComponentPropsWithoutRef<typeof RadixPopover.Content>,
  'title' | 'children' | 'asChild' | 'side' | 'align' | 'aria-label'
> & {
  /** Rendered through `Popover.Trigger asChild`; must be a button. */
  trigger: ReactElement;
  children: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  /** Shows a 32 x 32 close button, top right. */
  showClose?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type PopoverProps = BaseProps &
  (
    | { title: ReactNode; 'aria-label'?: never }
    | { title?: never; 'aria-label': string }
  );

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      trigger,
      children,
      title,
      side = 'bottom',
      align = 'center',
      showClose = false,
      open,
      defaultOpen,
      onOpenChange,
      className,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const titleId = useId();
    const [bodyEl, setBodyEl] = useState<HTMLDivElement | null>(null);
    const [scrollable, setScrollable] = useState(false);
    const measure = useCallback(() => {
      if (bodyEl) setScrollable(bodyEl.scrollHeight > bodyEl.clientHeight);
    }, [bodyEl]);
    // A scrolling region must be keyboard reachable (WCAG 2.1.1).
    useEffect(() => {
      if (!bodyEl) return;
      measure();
      if (typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(measure);
      ro.observe(bodyEl);
      return () => ro.disconnect();
    }, [bodyEl, measure]);
    return (
    <RadixPopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          ref={ref}
          className={cx('ds-popover', className)}
          side={side}
          align={align}
          sideOffset={4}
          collisionPadding={8}
          arrowPadding={8}
          sticky="partial"
          hideWhenDetached={false}
          data-show-close={showClose ? '' : undefined}
          aria-labelledby={title !== undefined ? titleId : undefined}
          aria-label={ariaLabel}
          {...rest}
        >
          {title !== undefined && (
            <h2 id={titleId} className="ds-popover-title">
              {title}
            </h2>
          )}
          <div
            ref={setBodyEl}
            className="ds-popover-body"
            {...(scrollable
              ? {
                  tabIndex: 0,
                  role: 'region',
                  ...(title !== undefined ? { 'aria-labelledby': titleId } : { 'aria-label': ariaLabel }),
                }
              : {})}
          >
            {children}
          </div>
          {showClose && (
            <RadixPopover.Close asChild>
              <button type="button" className="ds-popover-close" aria-label="Close">
                <Icon name="close" size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </RadixPopover.Close>
          )}
          <RadixPopover.Arrow asChild>
            <svg className="ds-popover-arrow" width={16} height={8} viewBox="0 0 16 8" aria-hidden="true">
              <path d="M0 8 L8 0 L16 8 Z" className="ds-popover-arrow-fill" />
              <path d="M0 8 L8 0 L16 8" className="ds-popover-arrow-edge" />
            </svg>
          </RadixPopover.Arrow>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
    );
  },
);
Popover.displayName = 'Popover';
