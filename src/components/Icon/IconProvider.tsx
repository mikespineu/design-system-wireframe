import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { defaultGlyphs } from './glyphs';
import type { IconComponent, IconRole, IconSet } from './types';

const IconContext = createContext<Partial<IconSet>>({});

export interface IconProviderProps {
  /** Replacement glyphs by role. Define at module level or memoize: the merge is memoized on its identity. */
  icons: Partial<IconSet>;
  children: ReactNode;
}

/** Replaces the default glyphs for a subtree. Nested providers merge, the inner one wins per role. */
export const IconProvider = ({ icons, children }: IconProviderProps) => {
  const outer = useContext(IconContext);
  const value = useMemo(() => ({ ...outer, ...icons }), [outer, icons]);
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
};

/** Resolves one role: prop > provider > default. `null` is returned as is (hidden). */
export function useIcon(role: IconRole): IconComponent;
export function useIcon(role: IconRole, override: IconComponent | undefined): IconComponent;
export function useIcon(role: IconRole, override: IconComponent | null | undefined): IconComponent | null;
export function useIcon(role: IconRole, override?: IconComponent | null): IconComponent | null {
  const icons = useContext(IconContext);
  if (override !== undefined) return override;
  return icons[role] ?? defaultGlyphs[role];
}
