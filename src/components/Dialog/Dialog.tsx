import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Dialog as RadixDialog } from 'radix-ui';
import { cx } from '../../lib/cx';
import { RoleIcon } from '../Icon/RoleIcon';
import './Dialog.css';

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixDialog.Content>, 'title' | 'children' | 'asChild'> {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Rendered through `Dialog.Trigger asChild`. */
  trigger?: ReactNode;
  /** Required: names the dialog. */
  title: ReactNode;
  description?: ReactNode;
  /** Body. */
  children?: ReactNode;
  /** Actions. Wrap Cancel in `DialogClose asChild`. */
  footer?: ReactNode;
  /** Sets max width only: sm 400, md 560, lg 720. */
  size?: DialogSize;
  /** false: overlay click does not close (Esc and close button still do). */
  dismissible?: boolean;
  hideCloseButton?: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const DialogClose = RadixDialog.Close;

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
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
  ) => (
    <RadixDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="ds-dialog-overlay" />
        <div className="ds-dialog-positioner">
          <RadixDialog.Content
            ref={ref}
            className={cx('ds-dialog', className)}
            data-size={size}
            {...(description === undefined ? { 'aria-describedby': undefined } : {})}
            onPointerDownOutside={(e) => {
              onPointerDownOutside?.(e);
              if (!dismissible) e.preventDefault();
            }}
            onOpenAutoFocus={(e) => {
              onOpenAutoFocus?.(e);
              if (e.defaultPrevented) return;
              // Skip the close button (first in DOM) in favor of body content.
              const target = e.currentTarget as HTMLElement | null;
              const first = target?.querySelector<HTMLElement>(`.ds-dialog-body :is(${FOCUSABLE})`);
              if (first) {
                e.preventDefault();
                first.focus();
              }
            }}
            onInteractOutside={(e) => {
              onInteractOutside?.(e);
              if (!dismissible) e.preventDefault();
            }}
            {...rest}
          >
            <div className="ds-dialog-header">
              <div className="ds-dialog-heading">
                <RadixDialog.Title className="ds-dialog-title">{title}</RadixDialog.Title>
                {description !== undefined && (
                  <RadixDialog.Description className="ds-dialog-description">{description}</RadixDialog.Description>
                )}
              </div>
              {!hideCloseButton && (
                <RadixDialog.Close asChild>
                  <button type="button" className="ds-dialog-close" aria-label="Close">
                    <RoleIcon role="close" size="md" />
                  </button>
                </RadixDialog.Close>
              )}
            </div>
            <div className="ds-dialog-body">{children}</div>
            {footer && <div className="ds-dialog-footer">{footer}</div>}
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  ),
);
Dialog.displayName = 'Dialog';
