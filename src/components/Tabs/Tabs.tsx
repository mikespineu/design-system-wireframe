import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { Tabs as RadixTabs } from 'radix-ui';
import { cx } from '../../lib/cx';
import '../ChoiceGroup/ChoiceGroup.css';
import '../SegmentedControl/SegmentedControl.css';
import '../TileGroup/TileGroup.css';
import './Tabs.css';
import { useChoiceStrip } from '../ChoiceGroup/useChoiceStrip';

interface TabItemBase<V extends string> {
  value: V;
  /** Visible text and the tab's accessible name. */
  label: string;
  disabled?: boolean;
  /** Content of this tab's tabpanel. */
  panel: ReactNode;
}
export interface SegmentedTabItem<V extends string = string> extends TabItemBase<V> {
  icon?: never;
}
export interface TileTabItem<V extends string = string> extends TabItemBase<V> {
  /** Decorative icon, rendered `aria-hidden`; 24 px md / 16 px sm. */
  icon: ReactNode;
}
export type TabItem<V extends string = string> = SegmentedTabItem<V> | TileTabItem<V>;

type TabsLabelling =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-labelledby': string; 'aria-label'?: never };

type TabsVariantProps<V extends string> =
  | { variant?: 'segmented'; items: readonly SegmentedTabItem<V>[]; fullWidth?: boolean }
  | { variant: 'tile'; items: readonly TileTabItem<V>[]; fullWidth?: never };

type RootRest = Omit<
  ComponentPropsWithoutRef<'div'>,
  'defaultValue' | 'dir' | 'children' | 'aria-label' | 'aria-labelledby' | 'onChange'
>;

export type TabsProps<V extends string = string> = RootRest &
  TabsLabelling &
  TabsVariantProps<V> & {
    /** Controlled value. */
    value?: V;
    /** Uncontrolled value; defaults to the first enabled item. */
    defaultValue?: V;
    /** Only ever called with a real item value. */
    onValueChange?: (value: V) => void;
    activationMode?: 'automatic' | 'manual';
    size?: 'sm' | 'md';
    /** Keep inactive panels mounted (hidden). */
    keepMounted?: boolean;
    dir?: 'ltr' | 'rtl';
  };

/**
 * Switch which panel is shown below a tab list. Built on Radix `Tabs` (tablist / tab / tabpanel),
 * wearing the SegmentedControl (`variant="segmented"`) or TileGroup (`variant="tile"`) look.
 * Arrow keys move between tabs (and activate in automatic mode); Home/End jump to the first/last.
 * The `sm` size is for fine pointers only.
 */
function TabsInner<V extends string>(
  {
    items,
    variant = 'segmented',
    fullWidth,
    value: valueProp,
    defaultValue,
    onValueChange,
    activationMode = 'automatic',
    size = 'md',
    keepMounted = false,
    dir,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...rest
  }: TabsProps<V>,
  ref: Ref<ElementRef<typeof RadixTabs.Root>>,
) {
  const list = items as readonly TabItem<V>[];
  const [inner, setInner] = useState<V | undefined>(() => defaultValue ?? list.find((o) => !o.disabled)?.value);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : inner;

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !controlled) return;
    const match = list.find((o) => o.value === valueProp);
    if (!match || match.disabled) {
      console.error(`Tabs: value "${valueProp}" matches no enabled item.`);
    }
  }, [controlled, valueProp, list]);

  // Radix reports both the pointer press and the focus that follows it before a re-render.
  const pending = useRef<string | undefined>(undefined);

  const handleValueChange = (next: string) => {
    if (!next || next === value || next === pending.current) return;
    pending.current = next;
    queueMicrotask(() => {
      pending.current = undefined;
    });
    if (!controlled) setInner(next as V);
    onValueChange?.(next as V);
  };

  const listRef = useRef<HTMLDivElement | null>(null);
  const withIndicator = variant === 'segmented';
  const { indicatorRef, overflow, indicatorReady, measureOverflow, onFocus } = useChoiceStrip({
    rootRef: listRef,
    selectedSelector: '[role="tab"][data-state="active"]',
    itemRole: 'tab',
    withIndicator,
    value,
    layoutDeps: [items, size, fullWidth],
  });

  return (
    <RadixTabs.Root
      {...rest}
      ref={ref}
      className={cx('ds-tabs', className)}
      data-size={size}
      value={value}
      onValueChange={handleValueChange}
      activationMode={activationMode}
      orientation="horizontal"
      dir={dir}
    >
      <RadixTabs.List
        ref={listRef}
        loop
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className="ds-choice-control"
        data-variant={variant}
        data-size={size}
        data-full-width={fullWidth ? '' : undefined}
        data-overflow={fullWidth ? undefined : overflow}
        data-indicator-ready={withIndicator && indicatorReady ? '' : undefined}
        onScroll={measureOverflow}
        onFocus={(e: FocusEvent<HTMLDivElement>) => onFocus(e)}
      >
        {withIndicator && <span ref={indicatorRef} aria-hidden="true" data-indicator="" className="ds-choice-indicator" />}
        {list.map((o) => (
          <RadixTabs.Trigger key={o.value} value={o.value} disabled={o.disabled} className="ds-choice-item">
            {variant === 'tile' ? (
              <>
                <span className="ds-tile-icon" aria-hidden="true">
                  {o.icon}
                </span>
                <span className="ds-tile-label">{o.label}</span>
              </>
            ) : (
              o.label
            )}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {list.map((o) => (
        <RadixTabs.Content key={o.value} value={o.value} forceMount={keepMounted ? true : undefined} className="ds-tabs-panel">
          {o.panel}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}

export const Tabs = forwardRef(TabsInner) as <V extends string>(
  props: TabsProps<V> & { ref?: Ref<ElementRef<typeof RadixTabs.Root>> },
) => ReturnType<typeof TabsInner>;
