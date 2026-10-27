import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Dialog as RadixDialog } from 'radix-ui';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon';
import './Drawer.css';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg';

export interface DrawerProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixDialog.Content>, 'title' | 'children' | 'asChild' | 'dir'> {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Rendered through `Drawer.Trigger asChild`. */
  trigger?: ReactNode;
  /** Required: names the drawer. */
  title: ReactNode;
  /** Required: describes the drawer. */
  description: ReactNode;
  /** Body. */
  children?: ReactNode;
  /** Actions. Wrap Cancel in `DrawerClose asChild`. */
  footer?: ReactNode;
  /** Edge the panel slides from. */
  side?: DrawerSide;
  /** Extent along the slide axis: sm 320, md 480, lg 640. */
  size?: DrawerSize;
  /** false: overlay click does not close (Esc and close button still do). */
  dismissible?: boolean;
  hideCloseButton?: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const DrawerClose = RadixDialog.Close;

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      defaultOpen,
      onOpenChange,
      trigger,
      title,
      description,
      children,
      footer,
      side = 'right',
      size = 'md',
      dismissible = true,
      hideCloseButton = false,
      className,
      onPointerDownOutside,
      onInteractOutside,
      onOpenAutoFocus,
      ...rest
    },
    ref,
  ) => {
    const titleTextId = useId();
    return (
      <RadixDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="ds-drawer-overlay" />
          <RadixDialog.Content
            ref={ref}
            className={cx('ds-drawer', className)}
            data-side={side}
            data-size={size}
            onPointerDownOutside={(e) => {
              onPointerDownOutside?.(e);
              if (!dismissible) e.preventDefault();
            }}
            onInteractOutside={(e) => {
              onInteractOutside?.(e);
              if (!dismissible) e.preventDefault();
            }}
            onOpenAutoFocus={(e) => {
              onOpenAutoFocus?.(e);
              if (e.defaultPrevented) return;
              // Skip the close button (first in DOM) in favor of body content.
              const target = e.currentTarget as HTMLElement | null;
              const first = target?.querySelector<HTMLElement>(`.ds-drawer-body :is(${FOCUSABLE})`);
              if (first) {
                e.preventDefault();
                first.focus();
              }
            }}
            {...rest}
          >
            <div className="ds-drawer-header">
              <div className="ds-drawer-heading">
                <RadixDialog.Title className="ds-drawer-title">
                  <span id={titleTextId}>{title}</span>
                </RadixDialog.Title>
                <RadixDialog.Description className="ds-drawer-description">{description}</RadixDialog.Description>
              </div>
              {!hideCloseButton && (
                <RadixDialog.Close asChild>
                  <button type="button" className="ds-drawer-close" aria-label="Close">
                    <Icon name="close" size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                </RadixDialog.Close>
              )}
            </div>
            <div className="ds-drawer-body" role="region" tabIndex={0} aria-labelledby={titleTextId}>
              {children}
            </div>
            {footer && <div className="ds-drawer-footer">{footer}</div>}
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    );
  },
);
Drawer.displayName = 'Drawer';
