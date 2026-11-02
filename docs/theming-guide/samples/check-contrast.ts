import { checkContrast, type ContrastReport } from 'design-system-test'
import { bold, boldDark } from './themes'

// Check the merged values (generator output plus overrides), not the generator output alone.
export const report: ContrastReport = checkContrast({ blocks: [...bold.blocks, ...boldDark.blocks] })
// report.ok is true, report.failures is empty and report.checked counts every pair in both blocks.

// A deliberately weak muted text color shows what a failure looks like.
const weakMutedText = bold.blocks.map((block) => ({
  ...block,
  values: { ...block.values, '--ds-color-text-muted': '#9a90d6' },
}))

export const broken: ContrastReport = checkContrast({ blocks: weakMutedText })
// broken.ok is false and broken.failures lists 7 pairs. The first is
// { foreground: 'color-text-muted', background: 'color-background', kind: 'text', ratio: 2.57,
//   required: 4.5, mode: 'light', selector: 'bold' }
