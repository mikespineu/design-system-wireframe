// Copies the opt-in theme CSS (src/themes) to dist/themes after the library build.
import { copyFileSync, mkdirSync } from 'node:fs'

mkdirSync('dist/themes', { recursive: true })
for (const file of ['bold.css', 'bold-fonts.css']) copyFileSync(`src/themes/${file}`, `dist/themes/${file}`)
