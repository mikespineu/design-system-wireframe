import { forwardRef, type HTMLAttributes } from 'react';
import { Slot } from 'radix-ui';

/** Every theme defined in src/styles/tokens.css. The first entry is the default. */
export const themes = ['wireframe'] as const;

export type ThemeName = (typeof themes)[number];

export const defaultTheme: ThemeName = themes[0];

export interface ThemeProps extends HTMLAttributes<HTMLDivElement> {
  /** Theme applied to this subtree. Defaults to `wireframe`. */
  theme?: ThemeName;
  /** Apply the theme to the child element instead of rendering a wrapping <div>. */
  asChild?: boolean;
}

/**
 * Scopes a theme to its subtree by setting `data-theme`. The subtree gets the
 * theme's background and ink, and every `--ds-*` token inside resolves against it.
 * To theme the whole page, set `data-theme` on <html> (see `applyTheme`).
 */
export const Theme = forwardRef<HTMLDivElement, ThemeProps>(
  ({ theme = defaultTheme, asChild = false, ...rest }, ref) => {
    const Comp = asChild ? Slot.Root : 'div';
    return <Comp ref={ref} data-theme={theme} {...rest} />;
  },
);
Theme.displayName = 'Theme';

/** Sets the page-wide theme on <html> (or on `root`, if given). */
export function applyTheme(theme: ThemeName, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = theme;
}
