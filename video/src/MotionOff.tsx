/**
 * Turns the design system's own motion off inside compositions. Remotion renders each frame as a still,
 * so a CSS transition or animation would be sampled at an arbitrary point (or skipped). All movement
 * comes from `useCurrentFrame()` instead.
 *
 * - `--ds-motion: 0ms` zeroes the token the CSS components read.
 * - The blanket rule also covers Tailwind utilities with a fixed duration (`duration-[120ms]`) and the
 *   Button spinner, which is never shown here (no `loading` prop).
 *
 * Kept in TSX because the video package must not add `.css` files.
 */
export const MOTION_OFF_CSS = `
:root, [data-theme] { --ds-motion: 0ms; }
*, *::before, *::after {
  transition: none !important;
  animation: none !important;
  scroll-behavior: auto !important;
  caret-color: transparent !important;
}
`;

export const MotionOff = () => <style data-ds-motion-off="">{MOTION_OFF_CSS}</style>;
