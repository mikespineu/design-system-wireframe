import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Escape hatch for machines where the downloaded Chrome Headless Shell cannot start, e.g.
// REMOTION_BROWSER_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome".
// Unset in CI, which uses the Chrome Headless Shell that Remotion downloads.
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
if (browserExecutable) Config.setBrowserExecutable(browserExecutable);
