import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { cx } from '../../lib/cx';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { RoleIcon } from '../Icon/RoleIcon';
import { Tooltip } from '../Tooltip';
import { Popover } from '../Popover';
import './InfoTip.css';

export type InfoTipSide = 'top' | 'right' | 'bottom' | 'left';
export type InfoTipAlign = 'start' | 'center' | 'end';

export interface InfoTipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'content' | 'children'> {
  /** Accessible name of the trigger; also names the Popover. */
  label: string;
  /** Plain, non-interactive text. */
  content: string;
  side?: InfoTipSide;
  align?: InfoTipAlign;
  size?: 'sm' | 'md';
}

const COARSE = '(pointer: coarse)';

/** Info icon button: Tooltip when touch is not the primary input, Popover when `(pointer: coarse)` matches. */
export const InfoTip = forwardRef<HTMLButtonElement, InfoTipProps>(
  (
    { label, content, side = 'top', align = 'center', size = 'md', className, onPointerDown, onClick, onKeyDown, onFocus, onBlur, ...rest },
    ref,
  ) => {
    const coarse = useMediaQuery(COARSE, { defaultValue: false });
    const mode = coarse ? 'popover' : 'tooltip';
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const hadFocus = useRef(false);
    const prevMode = useRef(mode);

    const setRefs = useCallback(
      (el: HTMLButtonElement | null) => {
        triggerRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      },
      [ref],
    );

    // Live switch: close the tip and keep focus on the new trigger element.
    useLayoutEffect(() => {
      if (prevMode.current === mode) return;
      prevMode.current = mode;
      setOpen(false);
      if (hadFocus.current) triggerRef.current?.focus();
    }, [mode]);

    const tooltipMode = mode === 'tooltip';
    const trigger = (
      <button
        {...rest}
        ref={setRefs}
        type="button"
        aria-label={label}
        data-mode={mode}
        data-size={size}
        className={cx('ds-infotip', className)}
        onFocus={(e) => {
          hadFocus.current = true;
          onFocus?.(e);
        }}
        onBlur={(e) => {
          hadFocus.current = false;
          onBlur?.(e);
        }}
        onPointerDown={(e: PointerEvent<HTMLButtonElement>) => {
          onPointerDown?.(e);
          if (tooltipMode) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (tooltipMode) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(e);
          if (tooltipMode && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <RoleIcon role="info" size={size === 'sm' ? 16 : 18} strokeWidth={size === 'sm' ? 2 : 1.5} aria-hidden="true" />
      </button>
    );

    return tooltipMode ? (
      <Tooltip content={content} side={side} align={align} open={open} onOpenChange={setOpen}>
        {trigger}
      </Tooltip>
    ) : (
      <Popover trigger={trigger} aria-label={label} side={side} align={align}>
        {content}
      </Popover>
    );
  },
);
InfoTip.displayName = 'InfoTip';
