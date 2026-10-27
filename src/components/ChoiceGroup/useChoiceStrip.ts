import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type RefObject } from 'react';

/** Internal (not exported from the package): strip behaviour shared by ChoiceGroup and Tabs. */

export type Overflow = 'start' | 'end' | 'both' | undefined;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scroll `container` (not page ancestors) so `item` sits inside the container's
 * box inset by its scroll-padding (the edge-fade clearance). Works in LTR and RTL
 * because it uses on-screen rect deltas; the browser clamps to the scroll range.
 */
export function scrollItemIntoView(container: HTMLElement, item: HTMLElement, behavior: ScrollBehavior) {
  const c = container.getBoundingClientRect();
  const i = item.getBoundingClientRect();
  const style = window.getComputedStyle(container);
  const pad = (v: string) => Number.parseFloat(v) || 0;
  const padStart = pad(style.scrollPaddingLeft);
  const padEnd = pad(style.scrollPaddingRight);
  const minLeft = c.left + padStart;
  const maxRight = c.right - padEnd;
  let delta = 0;
  if (i.right - i.left > maxRight - minLeft || i.left < minLeft) delta = i.left - minLeft;
  else if (i.right > maxRight) delta = i.right - maxRight;
  if (!delta) return;
  // Round away from the current position so the item never ends up a sub-pixel short of the clearance.
  const target = container.scrollLeft + delta;
  const left = delta > 0 ? Math.ceil(target) : Math.floor(target);
  if (typeof container.scrollTo === 'function') container.scrollTo({ left, behavior });
  else container.scrollLeft = left;
}

export interface UseChoiceStripOptions {
  /** The scroll container (the radiogroup or tablist). */
  rootRef: RefObject<HTMLElement | null>;
  /** Selector of the selected item, e.g. '[role="radio"][data-state="checked"]'. */
  selectedSelector: string;
  /** Role of the items to observe and scroll to on focus. */
  itemRole: 'radio' | 'tab';
  withIndicator: boolean;
  /** Current value; changes re-place the indicator and scroll the selected item into view. */
  value: string | undefined;
  /** Anything else that changes item layout (options, size, fullWidth). */
  layoutDeps: readonly unknown[];
}

export function useChoiceStrip({ rootRef, selectedSelector, itemRole, withIndicator, value, layoutDeps }: UseChoiceStripOptions) {
  const indicatorRef = useRef<HTMLSpanElement | null>(null);

  const getSelected = useCallback(
    () => rootRef.current?.querySelector<HTMLElement>(selectedSelector) ?? null,
    [rootRef, selectedSelector],
  );
  const scrollTo = useCallback(
    (el: HTMLElement | null, behavior?: ScrollBehavior) => {
      if (el && rootRef.current) scrollItemIntoView(rootRef.current, el, behavior ?? (prefersReducedMotion() ? 'auto' : 'smooth'));
    },
    [rootRef],
  );

  // Selected item in view: on mount and whenever the value changes.
  useEffect(() => {
    scrollTo(getSelected());
  }, [value, scrollTo, getSelected]);

  const [overflow, setOverflow] = useState<Overflow>(undefined);
  const measureOverflow = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const pos = Math.abs(el.scrollLeft);
    const atStart = pos <= 1;
    const atEnd = pos + el.clientWidth >= el.scrollWidth - 1;
    setOverflow(atStart && atEnd ? undefined : atStart ? 'end' : atEnd ? 'start' : 'both');
  }, [rootRef]);

  // Sliding indicator (segmented only).
  const [indicatorReady, setIndicatorReady] = useState(false);
  const placeIndicator = useCallback(() => {
    const ind = indicatorRef.current;
    const item = getSelected();
    if (!ind || !item) {
      setIndicatorReady(false);
      return;
    }
    ind.style.transform = `translateX(${item.offsetLeft}px)`;
    ind.style.width = `${item.offsetWidth}px`;
    setIndicatorReady(true);
  }, [getSelected]);

  useLayoutEffect(() => {
    if (withIndicator) placeIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withIndicator, placeIndicator, value, ...layoutDeps]);

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
    // Layout settled (resize, item size change, web fonts): re-measure and
    // re-scroll the selected item into view. Never runs on plain scroll events.
    const settle = () => {
      measureOverflow();
      if (withIndicator) placeIndicator();
      scrollTo(getSelected(), 'auto');
      measureOverflow();
    };
    const ro = new ResizeObserver(settle);
    ro.observe(el);
    Array.from(el.children).forEach((c) => {
      if ((c as HTMLElement).getAttribute('role') === itemRole) ro.observe(c);
    });
    let cancelled = false;
    document.fonts?.ready?.then(() => {
      if (!cancelled) settle();
    });
    return () => {
      cancelled = true;
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef, measureOverflow, placeIndicator, scrollTo, getSelected, withIndicator, itemRole, ...layoutDeps]);

  const onFocus = (e: FocusEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.getAttribute('role') === itemRole) scrollTo(target);
  };

  return { indicatorRef, overflow, indicatorReady, measureOverflow, onFocus };
}
