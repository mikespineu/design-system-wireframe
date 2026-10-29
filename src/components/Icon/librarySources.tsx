import {
  X as LucideX,
  Check as LucideCheck,
  Minus as LucideMinus,
  Info as LucideInfo,
  CircleAlert,
  CircleCheck,
  TriangleAlert,
} from 'lucide-react';
import { IconX } from '@tabler/icons-react';
import { X as PhosphorX } from '@phosphor-icons/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createIcon } from './createIcon';
import type { IconComponent, IconComponentProps, IconSet } from './types';

/** Docs and test sources. These libraries are devDependencies only and never reach `dist/`. */
export const CustomClose = createIcon('CustomClose', <path d="M5 5l14 14M19 5L5 19" />);

/** Phosphor is fill-based: pick the weight in a wrapper, the system `strokeWidth` has no effect. */
export const PhosphorClose: IconComponent = (p: IconComponentProps) => <PhosphorX {...p} weight="bold" />;

export const iconSources: ReadonlyArray<{ name: string; icon: IconComponent }> = [
  { name: 'Lucide', icon: LucideX },
  { name: 'Tabler', icon: IconX },
  { name: 'Phosphor', icon: PhosphorClose },
  { name: 'Heroicons', icon: XMarkIcon },
  { name: 'Custom (createIcon)', icon: CustomClose },
];

/** A full Lucide icon set for `IconProvider`. Defined at module level so its identity is stable. */
export const lucideIconSet: IconSet = {
  close: LucideX,
  check: LucideCheck,
  minus: LucideMinus,
  plus: createIcon('LucidePlus', <path d="M12 5v14M5 12h14" />),
  alert: CircleAlert,
  info: LucideInfo,
  success: CircleCheck,
  warning: TriangleAlert,
  'chevron-down': createIcon('D', <path d="M6 9l6 6 6-6" />),
  'chevron-left': createIcon('L', <path d="M15 6l-6 6 6 6" />),
  'chevron-right': createIcon('R', <path d="M9 6l6 6-6 6" />),
};
