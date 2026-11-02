import { writeCss } from './build-theme'
import { bold, boldDark } from './themes'

/** Writes both themes into one stylesheet. From a build script: `writeBold('bold.css')`. */
export const writeBold = (path: string): void => writeCss(path, [bold, boldDark])
