export type ColorMode = 'light' | 'dark'

/** The `data-theme` value for a mode. */
export const themeName = (mode: ColorMode): string => (mode === 'dark' ? 'bold-dark' : 'bold')

/** Switches the whole app: roles resolve from the nearest ancestor with the attribute, here <html>. */
export function applyTheme(mode: ColorMode, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = themeName(mode)
}

/** Follows the OS setting. Returns a function that stops following. */
export function followSystem(query: MediaQueryList, root: HTMLElement = document.documentElement): () => void {
  const update = () => applyTheme(query.matches ? 'dark' : 'light', root)
  update()
  query.addEventListener('change', update)
  return () => query.removeEventListener('change', update)
}
