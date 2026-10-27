import type { HTMLAttributes, ReactNode } from 'react';

/** Suffixes of the --ds-space-* scale, plus 0. gap={4} → var(--ds-space-4). */
export type Space = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24;

/** Mobile-first breakpoint keys (see docs/specs/Layout.md, "Breakpoints"). */
export type Breakpoint = 'base' | 'sm' | 'md' | 'lg';

/** A single value (all widths) or values per breakpoint. */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

/** Elements Stack and Grid may render through `as`. */
export type LayoutElement =
  | 'div' | 'span' | 'section' | 'article' | 'aside' | 'header' | 'footer'
  | 'main' | 'nav' | 'form' | 'ul' | 'ol' | 'li';

/** `as` and `asChild` are mutually exclusive at the type level. */
export type LayoutElementProps =
  | { as?: LayoutElement; asChild?: false }
  | { as?: never; asChild: true };

export type LayoutBaseProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode;
};

const BREAKPOINTS = ['sm', 'md', 'lg'] as const;

/**
 * Resolve a responsive prop into data attributes: `data-<name>` (base, falling back to
 * `fallback`) plus `data-<name>-<bp>` for each given breakpoint.
 */
export function responsiveAttrs<T extends string | number>(
  name: string,
  value: Responsive<T> | undefined,
  fallback: T,
): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (value === undefined || value === null || typeof value !== 'object') {
    attrs[`data-${name}`] = String(value ?? fallback);
    return attrs;
  }
  attrs[`data-${name}`] = String(value.base ?? fallback);
  for (const bp of BREAKPOINTS) {
    const v = value[bp];
    if (v !== undefined) attrs[`data-${name}-${bp}`] = String(v);
  }
  return attrs;
}

/** Default role for list elements: list-style none drops list semantics in Safari. */
export function listRole(as: LayoutElement | undefined, asChild: boolean): 'list' | undefined {
  return !asChild && (as === 'ul' || as === 'ol') ? 'list' : undefined;
}
