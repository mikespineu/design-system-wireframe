import { createIcon } from '../components/Icon/createIcon';

/** Icons for stories, tests and docs. Built with the public `createIcon`, like consumer icons. Not exported from the package. */
export const PlusIcon = createIcon('PlusIcon', <path d="M12 5v14M5 12h14" />);
export const SearchIcon = createIcon(
  'SearchIcon',
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </>,
);
export const InfoIcon = createIcon(
  'InfoIcon',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 10.5v7M12 6.5v2" />
  </>,
);
export const AlertIcon = createIcon(
  'AlertIcon',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6.5v7M12 15.5v2" />
  </>,
);
export const WarningIcon = createIcon(
  'WarningIcon',
  <>
    <path d="M12 3.5l9.5 17h-19z" />
    <path d="M12 9.5v5M12 16v2" />
  </>,
);
export const CheckIcon = createIcon('CheckIcon', <path d="M5 12l5 5 9-10" />);
export const CloseIcon = createIcon('CloseIcon', <path d="M6 6l12 12M18 6L6 18" />);
export const ChevronDownIcon = createIcon('ChevronDownIcon', <path d="M6 9l6 6 6-6" />);

/** Consumer-style Wishlist heart (outline and filled), built with `createIcon`. Not a DS default glyph. */
const heartPath = 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z';
export const HeartIcon = createIcon('HeartIcon', <path data-testid="outline" d={heartPath} />);
export const HeartFilledIcon = createIcon(
  'HeartFilledIcon',
  <path data-testid="filled" d={heartPath} fill="currentColor" />,
);
