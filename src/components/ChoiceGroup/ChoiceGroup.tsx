import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { RadioGroup } from 'radix-ui';
import { cx } from '../../lib/cx';
import './ChoiceGroup.css';

/**
 * Internal base for SegmentedControl and TileGroup (not exported from the package).
 * Owns the label row, hint, help slot, Radix RadioGroup wiring, horizontal scroll,
 * selected-item-in-view and the edge fade. Spec: docs/specs/Toggle.md.
 */

export interface ChoiceOption<V extends string = string> {
  value: V;
  /** Visible text and accessible name. */
  label: string;
  disabled?: boolean;
}

export type ChoiceSize = 'sm' | 'md';

export interface ChoiceGroupBaseProps<V extends string = string> {
  /** Controlled value. */
  value?: V;
  /** Uncontrolled value; defaults to the first enabled option. */
  defaultValue?: V;
  /** Only ever called with a real option value. */
  onValueChange?: (value: V) => void;
  /** Group label; names the radiogroup. */
  label: ReactNode;
  labelPosition?: 'start' | 'top';
  /** Caption shown under the label when `labelPosition="top"`; wired to aria-describedby. */
  hint?: ReactNode;
  /**
   * Trailing slot outside the arrow-key order, e.g. an `IconButton`.
   * A help button needs its own `aria-label` (for example "About views").
   */
  help?: ReactNode;
  size?: ChoiceSize;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

type RootProps = Omit<
  ComponentPropsWithoutRef<typeof RadioGroup.Root>,
  'value' | 'defaultValue' | 'onValueChange' | 'orientation' | 'children' | 'asChild' | 'dir'
> & { dir?: 'ltr' | 'rtl' };

export interface ChoiceGroupProps<V extends string = string>
  extends ChoiceGroupBaseProps<V>,
    Omit<RootProps, keyof ChoiceGroupBaseProps> {
  options: readonly ChoiceOption<V>[];
  /** Item look: a sliding-pill segmented strip or separate tiles. */
  variant: 'segmented' | 'tile';
  /** Content of one item (text, or icon + text). */
  renderContent: (option: ChoiceOption<V>) => ReactNode;
  /** Segments share the width equally; never scrolls. */
  fullWidth?: boolean;
}

type Overflow = 'start' | 'end' | 'both' | undefined;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

function ChoiceGroupInner<V extends string>(
  {
    options,
    variant,
    renderContent,
    fullWidth,
    value: valueProp,
    defaultValue,
    onValueChange,
    label,
    labelPosition = 'start',
    hint,
    help,
    size = 'md',
    disabled,
    required,
    name,
    id,
    className,
    ...rest
  }: ChoiceGroupProps<V>,
  ref: Ref<ElementRef<typeof RadioGroup.Root>>,
) {
  const generated = useId();
  const baseId = id ?? generated;
  const labelId = `${baseId}-label`;
  const hintId = hint && labelPosition === 'top' ? `${baseId}-hint` : undefined;

  const [inner, setInner] = useState<V | undefined>(
    () => defaultValue ?? options.find((o) => !o.disabled)?.value,
  );
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : inner;

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && controlled && !options.some((o) => o.value === valueProp)) {
      console.error(`ChoiceGroup: value "${valueProp}" matches no option.`);
    }
  }, [controlled, valueProp, options]);

  const handleValueChange = (next: string) => {
    if (!next) return;
    if (!controlled) setInner(next as V);
    onValueChange?.(next as V);
  };

  const rootRef = useRef<HTMLDivElement | null>(null);
  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      setRef(ref, node);
    },
    [ref],
  );
  const indicatorRef = useRef<HTMLSpanElement | null>(null);

  const getChecked = () => rootRef.current?.querySelector<HTMLElement>('[role="radio"][data-state="checked"]') ?? null;
  const scrollTo = (el: HTMLElement | null) =>
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

  // Selected item in view: on mount and whenever the value changes.
  useEffect(() => {
    scrollTo(getChecked());
  }, [value]);

  // Overflow attribute (the one piece of JS state).
  const [overflow, setOverflow] = useState<Overflow>(undefined);
  const measureOverflow = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const pos = Math.abs(el.scrollLeft);
    const atStart = pos <= 1;
    const atEnd = pos + el.clientWidth >= el.scrollWidth - 1;
    setOverflow(atStart && atEnd ? undefined : atStart ? 'end' : atEnd ? 'start' : 'both');
  }, []);

  // Sliding indicator (segmented only).
  const [indicatorReady, setIndicatorReady] = useState(false);
  const placeIndicator = useCallback(() => {
    const ind = indicatorRef.current;
    const item = getChecked();
    if (!ind || !item) {
      setIndicatorReady(false);
      return;
    }
    ind.style.transform = `translateX(${item.offsetLeft}px)`;
    ind.style.width = `${item.offsetWidth}px`;
    setIndicatorReady(true);
  }, []);

  const withIndicator = variant === 'segmented';

  useLayoutEffect(() => {
    if (withIndicator) placeIndicator();
  }, [withIndicator, placeIndicator, value, options, size, fullWidth]);

  // Enable transitions only after the first placement has painted.
  useEffect(() => {
    const ind = indicatorRef.current;
    if (!indicatorReady || !ind || ind.hasAttribute('data-animate')) return;
    const raf = requestAnimationFrame(() => ind.setAttribute('data-animate', ''));
    return () => cancelAnimationFrame(raf);
  }, [indicatorReady]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    measureOverflow();
    const ro = new ResizeObserver(() => {
      measureOverflow();
      if (withIndicator) placeIndicator();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureOverflow, placeIndicator, withIndicator, options]);

  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    rest.onFocus?.(e);
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') === 'radio') scrollTo(target);
  };

  const control = (
    <RadioGroup.Root
      {...rest}
      ref={setRootRef}
      id={baseId}
      className="ds-choice-control"
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth ? '' : undefined}
      data-overflow={fullWidth ? undefined : overflow}
      data-indicator-ready={withIndicator && indicatorReady ? '' : undefined}
      aria-labelledby={labelId}
      aria-describedby={[rest['aria-describedby'], hintId].filter(Boolean).join(' ') || undefined}
      value={value}
      onValueChange={handleValueChange}
      onScroll={(e) => {
        rest.onScroll?.(e);
        measureOverflow();
      }}
      onFocus={handleFocus}
      disabled={disabled}
      required={required}
      name={name}
    >
      {withIndicator && <span ref={indicatorRef} aria-hidden="true" data-indicator="" className="ds-choice-indicator" />}
      {options.map((o) => (
        <RadioGroup.Item key={o.value} value={o.value} disabled={o.disabled} className="ds-choice-item">
          {renderContent(o)}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );

  return (
    <div
      className={cx('ds-choice', className)}
      data-label-position={labelPosition}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
    >
      <div className="ds-choice-heading">
        <span id={labelId} className="ds-choice-label">
          {label}
        </span>
        {hint && labelPosition === 'top' && (
          <span id={hintId} className="ds-choice-hint">
            {hint}
          </span>
        )}
      </div>
      <div className="ds-choice-field">
        {control}
        {help && <div className="ds-choice-help">{help}</div>}
      </div>
    </div>
  );
}

export const ChoiceGroup = forwardRef(ChoiceGroupInner) as <V extends string>(
  props: ChoiceGroupProps<V> & { ref?: Ref<ElementRef<typeof RadioGroup.Root>> },
) => ReturnType<typeof ChoiceGroupInner>;
