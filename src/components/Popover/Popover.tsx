import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from 'react';
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
      ...rest
    },
    ref,
  ) => {
    const titleId = useId();
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
          {...rest}
        >
          {title !== undefined && (
            <h2 id={titleId} className="ds-popover-title">
              {title}
            </h2>
          )}
          <div className="ds-popover-body">{children}</div>
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
