import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';
import { RoleIcon } from '../Icon/RoleIcon';
import type { IconComponent } from '../Icon';

export type TagVariant = 'solid' | 'subtle' | 'outline' | 'neutral';
export type TagSize = 'md' | 'sm';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Variants differ by border and fill only: solid (New), subtle (Draft), outline (Archived), neutral (removable). */
  variant?: TagVariant;
  /** md is 28px (default); sm is 24px for table cells. */
  size?: TagSize;
  /** When set, renders a close button after the label. */
  onRemove?: () => void;
  /** Accessible name for the close button. Defaults to "Remove <label>" for string children. */
  removeLabel?: string;
  /** Replaces the remove glyph (prop > IconProvider > default). */
  removeIcon?: IconComponent;
}

const base = 'inline-flex items-center rounded-sm font-label text-ui-sm font-normal';

const variants: Record<TagVariant, string> = {
  solid: 'border border-transparent bg-primary text-primary-contrast',
  subtle: 'border border-transparent bg-fill text-text-strong',
  outline: 'border border-strong bg-transparent text-emphasis',
  neutral: 'border border-border bg-transparent text-text-strong',
};

const sizes: Record<TagSize, string> = {
  md: 'h-7 px-2.5',
  sm: 'h-6 px-2',
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ variant = 'solid', size = 'md', onRemove, removeLabel, removeIcon, className, children, ...rest }, ref) => {
    const removable = typeof onRemove === 'function';
    const label = removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove');
    return (
      <span
        ref={ref}
        className={cx(base, variants[variant], sizes[size], removable && 'gap-1.5 pr-1', className)}
        {...rest}
      >
        {children}
        {removable && (
          <button
            type="button"
            aria-label={label}
            onClick={onRemove}
            className="flex size-5.5 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-muted focus-visible:focus-ring"
          >
            <RoleIcon role="close" size="sm" override={removeIcon} />
          </button>
        )}
      </span>
    );
  },
);
Tag.displayName = 'Tag';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** The count to display. */
  count: number | string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ count, className, children, ...rest }, ref) => (
  <span
    ref={ref}
    className={cx(
      'box-border inline-flex h-5.5 rounded-full min-w-5.5 items-center justify-center bg-primary px-1.5 font-label text-ui-xs font-medium text-primary-contrast',
      className,
    )}
    {...rest}
  >
    {children ?? count}
  </span>
));
Badge.displayName = 'Badge';
