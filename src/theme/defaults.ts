/** Default values of the non-color roles (mirrors src/styles/tokens.css). */

export const defaultFonts = {
  mono: "'Red Hat Mono', ui-monospace, monospace",
  text: "'Red Hat Text', system-ui, sans-serif",
} as const

export const fontWeightDefaults: Record<string, string> = {
  '--ds-font-weight-regular': '400',
  '--ds-font-weight-medium': '500',
  '--ds-font-weight-bold': '700',
}

export const typeScaleDefaults: Record<string, string> = {
  '--ds-text-display-size': '4.5rem',
  '--ds-text-display-line-height': '1',
  '--ds-text-display-tracking': '-0.04em',
  '--ds-text-h1-size': '3rem',
  '--ds-text-h1-line-height': '1.1',
  '--ds-text-h1-tracking': '-0.03em',
  '--ds-text-h2-size': '2rem',
  '--ds-text-h2-line-height': '1.2',
  '--ds-text-h2-tracking': '-0.02em',
  '--ds-text-h3-size': '1.375rem',
  '--ds-text-h3-line-height': '29px',
  '--ds-text-h3-tracking': '0',
  '--ds-text-heading-weight': 'var(--ds-font-weight-medium)',
  '--ds-text-heading-transform': 'none',
  '--ds-text-body-lg-size': '1.125rem',
  '--ds-text-body-lg-line-height': '1.6',
  '--ds-text-body-size': '1rem',
  '--ds-text-body-line-height': '26px',
  '--ds-text-body-sm-size': '0.9375rem',
  '--ds-text-body-sm-line-height': '24px',
  '--ds-text-body-xs-size': '0.875rem',
  '--ds-text-body-xs-line-height': '1.5',
  '--ds-text-caption-size': '0.8125rem',
  '--ds-text-caption-line-height': '20px',
  '--ds-text-label-size': '0.75rem',
  '--ds-text-label-line-height': '16px',
  '--ds-text-label-weight': 'var(--ds-font-weight-medium)',
  '--ds-text-label-tracking': '0.08em',
  '--ds-text-label-transform': 'uppercase',
  '--ds-text-ui-size': '0.875rem',
  '--ds-text-ui-line-height': '20px',
  '--ds-text-ui-weight': 'var(--ds-font-weight-medium)',
  '--ds-text-ui-sm-size': '0.75rem',
  '--ds-text-ui-sm-line-height': '16px',
  '--ds-text-ui-xs-size': '0.6875rem',
  '--ds-text-ui-xs-line-height': '16px',
}

export const shapeDefaults: Record<string, string> = {
  '--ds-border-width': '1px',
  '--ds-border-width-strong': '2px',
  '--ds-focus-width': '2px',
  '--ds-focus-offset': '2px',
  '--ds-control-height': '44px',
  '--ds-motion': '120ms cubic-bezier(0.2, 0, 0, 1)',
  '--ds-photo-filter': 'grayscale(1) contrast(1.1)',
}
