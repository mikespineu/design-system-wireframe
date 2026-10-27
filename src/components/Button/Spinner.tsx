import './Spinner.css';

/** Internal busy indicator for Button and IconButton. Decorative: the host carries `aria-busy`. */
export const Spinner = () => (
  <svg
    className="ds-spinner"
    data-spinner=""
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" strokeDasharray="47.124 15.708" strokeLinecap="butt" />
  </svg>
);
