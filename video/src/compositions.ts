import type { FC } from 'react';
import { Placeholder, type PlaceholderProps } from './Placeholder';

export interface CompositionConfig {
  id: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  component: FC<PlaceholderProps>;
  defaultProps: PlaceholderProps;
}

const base = { width: 1920, height: 1080, fps: 30, durationInFrames: 90, component: Placeholder };

/** Every composition in the project. Root.tsx registers exactly this list. */
export const compositions: readonly CompositionConfig[] = [
  { ...base, id: 'placeholder-default', defaultProps: { theme: 'default' } },
  { ...base, id: 'placeholder-bold', defaultProps: { theme: 'bold' } },
];
