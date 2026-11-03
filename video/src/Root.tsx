import { Composition } from 'remotion';
import { compositions } from './compositions';

export const Root = () => (
  <>
    {compositions.map(({ id, component, width, height, fps, durationInFrames, defaultProps }) => (
      <Composition
        key={id}
        id={id}
        component={component}
        width={width}
        height={height}
        fps={fps}
        durationInFrames={durationInFrames}
        defaultProps={defaultProps}
      />
    ))}
  </>
);
