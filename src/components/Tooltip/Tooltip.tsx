import { createContext, forwardRef, useContext, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from 'react';
import { Tooltip as RadixTooltip } from 'radix-ui';
import { cx } from '../../lib/cx';
import './Tooltip.css';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
export type TooltipAlign = 'start' | 'center' | 'end';

const DEFAULT_DELAY = 400;
const DEFAULT_SKIP_DELAY = 300;

const ProviderContext = createContext(false);

export interface TooltipProviderProps {
  /** ms of hover before a tip opens. */
  delayDuration?: number;
  /** ms after a tip closes during which the next opens at once. */
  skipDelayDuration?: number;
  children: ReactNode;
}

/** Mount once near the app root so neighbouring tooltips share the skip delay. */
export const TooltipProvider = ({
  delayDuration = DEFAULT_DELAY,
  skipDelayDuration = DEFAULT_SKIP_DELAY,
  children,
}: TooltipProviderProps) => (
  <ProviderContext.Provider value={true}>
    <RadixTooltip.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent={false}
    >
      {children}
    </RadixTooltip.Provider>
  </ProviderContext.Provider>
);

export interface TooltipProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixTooltip.Content>, 'content' | 'children' | 'asChild' | 'side' | 'align'> {
  /** Plain text only. */
  content: string;
  /** The trigger. Must be focusable. */
  children: ReactElement;
  side?: TooltipSide;
  align?: TooltipAlign;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, side = 'top', align = 'center', open, defaultOpen, onOpenChange, className, ...rest }, ref) => {
    const hasProvider = useContext(ProviderContext);
    const tip = (
      <RadixTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            ref={ref}
            className={cx('ds-tooltip', className)}
            side={side}
            align={align}
            sideOffset={4}
            collisionPadding={8}
            arrowPadding={8}
            sticky="partial"
            hideWhenDetached
            {...rest}
          >
            {content}
            <RadixTooltip.Arrow className="ds-tooltip-arrow" width={12} height={6} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    );
    return hasProvider ? tip : <TooltipProvider>{tip}</TooltipProvider>;
  },
);
Tooltip.displayName = 'Tooltip';
