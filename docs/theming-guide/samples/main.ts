import 'design-system-test/styles.css'
import 'design-system-test/themes/bold-fonts.css'
import './bold.css'
import { followSystem } from './apply-theme'

export const stopFollowing = followSystem(window.matchMedia('(prefers-color-scheme: dark)'))
