import { createIcon } from './createIcon';
import type { IconSet } from './types';

/** Private default glyphs: 24 grid, 2 px padding, stroke only, butt caps, miter joins. Not exported from the package. */
export const defaultGlyphs: IconSet = {
  close: createIcon('CloseIcon', <path d="M6 6l12 12M18 6L6 18" />),
  check: createIcon('CheckIcon', <path d="M5 12l5 5 9-10" />),
  minus: createIcon('MinusIcon', <path d="M5 12h14" />),
  plus: createIcon('PlusIcon', <path d="M12 5v14M5 12h14" />),
  alert: createIcon(
    'AlertIcon',
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6.5v7M12 15.5v2" />
    </>,
  ),
  info: createIcon(
    'InfoIcon',
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 10.5v7M12 6.5v2" />
    </>,
  ),
  success: createIcon(
    'SuccessIcon',
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M7.5 12.5l3 3 6-7" />
    </>,
  ),
  warning: createIcon(
    'WarningIcon',
    <>
      <path d="M12 3.5l9.5 17h-19z" />
      <path d="M12 9.5v5M12 16v2" />
    </>,
  ),
  'chevron-down': createIcon('ChevronDownIcon', <path d="M6 9l6 6 6-6" />),
  'chevron-left': createIcon('ChevronLeftIcon', <path d="M15 6l-6 6 6 6" />),
  'chevron-right': createIcon('ChevronRightIcon', <path d="M9 6l6 6-6 6" />),
};
