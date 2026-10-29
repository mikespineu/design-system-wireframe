import {
  forwardRef,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Slot, Toggle } from 'radix-ui';
import { cx } from '../../lib/cx';
import { Icon, type IconComponent } from '../Icon';
import { Spinner } from '../Button/Spinner';
import { useButtonGroupDisabled } from '../ButtonGroup/context';
import type { ButtonVariant } from '../Button/Button';
import './IconButton.css';

interface IconButtonBaseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  /** Accessible name. Required because the button has no visible text. Never changes with `pressed`. */
  'aria-label': string;
  /** Icon rendered inside the button (18 px). */
  icon: IconComponent;
  /** Default `secondary`. */
  variant?: ButtonVariant;
  /** Busy state: keeps size and name, blocks clicks and toggling. Ignored when `disabled`. */
  loading?: boolean;
}

interface IconButtonActionProps extends IconButtonBaseProps {
  /** Render the child element (e.g. an anchor) with icon button styling instead of a <button>. */
  asChild?: boolean;
  /** Only used with `asChild`: the element (e.g. <a>) that receives the styling and the icon. */
  children?: ReactNode;
  pressed?: never;
  defaultPressed?: never;
  onPressedChange?: never;
  pressedIcon?: never;
}

interface IconButtonToggleProps extends IconButtonBaseProps {
  /** Controlled pressed state. Defining `pressed` or `defaultPressed` makes this a toggle. */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Shown instead of `icon` while pressed. */
  pressedIcon?: IconComponent;
  asChild?: never;
  children?: never;
}

export type IconButtonProps = IconButtonActionProps | IconButtonToggleProps;

const base =
  'inline-flex h-control w-11 items-center justify-center rounded-md border ' +
  'cursor-pointer transition-colors duration-[120ms] ease-ds focus-visible:focus-ring ' +
  'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed';

const variants: Record<ButtonVariant, string> = {
  primary: 'border-primary bg-primary text-primary-contrast',
  secondary: 'border-strong bg-surface text-icon disabled:border-border disabled:text-disabled',
  ghost: 'border-transparent bg-transparent text-icon disabled:text-disabled',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const {
    icon,
    variant = 'secondary',
    loading = false,
    asChild = false,
    className,
    type,
    children,
    onClick,
    pressed,
    defaultPressed,
    onPressedChange,
    pressedIcon,
    disabled: disabledProp,
    ...restProps
  } = props;
  const groupDisabled = useButtonGroupDisabled();
  const disabled = disabledProp || groupDisabled;
  const rest = { ...restProps, ...(disabled ? { disabled } : {}) };

  const isToggle = pressed !== undefined || defaultPressed !== undefined;
  const [inner, setInner] = useState(defaultPressed ?? false);
  const current = pressed ?? inner;

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && isToggle && variant === 'primary' && !pressedIcon) {
      console.warn(
        'IconButton: a primary toggle without `pressedIcon` cannot show its pressed state. Pass `pressedIcon` or use another variant.',
      );
    }
  }, [isToggle, variant, pressedIcon]);

  const busy = loading && !rest.disabled;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (busy) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const common = {
    className: cx('ds-icon-button', base, variants[variant], className),
    'data-variant': variant,
    ...(busy ? { 'aria-busy': true, 'aria-disabled': true, 'data-loading': '' } : {}),
    ...rest,
    onClick: handleClick,
  };
  const shown = isToggle && current && pressedIcon ? pressedIcon : icon;
  const iconEl = <Icon icon={shown} size={18} />;
  const spinnerEl = busy ? <Spinner /> : null;

  if (isToggle) {
    return (
      <Toggle.Root
        ref={ref}
        type={type ?? 'button'}
        pressed={current}
        onPressedChange={(next) => {
          setInner(next);
          onPressedChange?.(next);
        }}
        {...common}
      >
        {iconEl}
        {spinnerEl}
      </Toggle.Root>
    );
  }

  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp ref={ref} {...(asChild ? {} : { type: type ?? 'button' })} {...common}>
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
      {iconEl}
      {spinnerEl}
    </Comp>
  );
});
IconButton.displayName = 'IconButton';
