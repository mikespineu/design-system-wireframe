// Regenerates docs/images/readme/social-preview.png (1280x640) from themes-side-by-side.png.
// Takes source rows 0..800 at full width (1600), scaled by 0.8, via Playwright's Chromium (already a devDependency).
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'images', 'readme')
const src = pathToFileURL(resolve(dir, 'themes-side-by-side.png')).href

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 640 } })
  await page.goto(src)
  await page.addStyleTag({ content: 'body{margin:0;overflow:hidden}img{display:block;width:1280px!important;height:auto!important;max-width:none!important}' })
  await page.screenshot({ path: resolve(dir, 'social-preview.png'), clip: { x: 0, y: 0, width: 1280, height: 640 } })
} finally {
  await browser.close()
}
