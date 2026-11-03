import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Button, TextField } from 'design-system-test';
import 'design-system-test/styles.css';
import 'design-system-test/fonts.css';
import 'design-system-test/themes/bold.css';
import 'design-system-test/themes/bold-fonts.css';
import { MotionOff } from './MotionOff';
import { useFontsReady } from './useFontsReady';

export type PlaceholderProps = {
  theme: 'default' | 'bold';
};

const TYPED = 'hello@example.com';

/**
 * Placeholder scene: real design system components, driven only by the frame number.
 * The theme is applied the way a consumer does it, with a `data-theme` attribute (the default look
 * has none). The scene fades and slides in over the first 20 frames and the field "types" its value.
 */
export const Placeholder = ({ theme }: PlaceholderProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fontsReady = useFontsReady();

  const enter = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const typed = TYPED.slice(0, Math.max(0, Math.floor(((frame - 20) / fps) * 12)));

  return (
    <AbsoluteFill
      data-theme={theme === 'bold' ? 'bold' : undefined}
      style={{
        backgroundColor: 'var(--ds-color-background)',
        color: 'var(--ds-color-text)',
        alignItems: 'center',
        justifyContent: 'center',
        // Also set inline so no theme rule can bring motion back for this subtree.
        ['--ds-motion' as string]: '0ms',
      }}
    >
      <MotionOff />
      {fontsReady ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-space-6)',
            width: 640,
            opacity: enter,
            transform: `translateY(${(1 - enter) * 40}px) scale(2)`,
            transformOrigin: 'center',
          }}
        >
          <TextField label="Email" hint="We never share it." placeholder="you@example.com" value={typed} readOnly />
          <Button>Get started</Button>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
