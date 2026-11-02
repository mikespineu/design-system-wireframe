// Captures the README images into docs/images/readme/ from the static Storybook.
//   npm run readme:screenshots
// Builds storybook-static/ if it is missing, serves it on a free port chosen at runtime, captures with
// Playwright (Chromium) and stops the server when done. Needs a Chromium browser: `npx playwright install chromium`.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const staticDir = join(root, 'storybook-static')
const outDir = join(root, 'docs', 'images', 'readme')

export const MAX_WIDTH = 1600
export const MAX_BYTES = 500 * 1024

const themes = ['default', 'dark', 'bold', 'bold-dark']

/** Every image: output file, story id, theme global (if any) and viewport width. */
export const shots = [
  { file: 'themes-side-by-side.png', id: 'foundations-themes--side-by-side', width: 1600 },
  ...themes.map((theme) => ({ file: `contact-form-${theme}.png`, id: 'patterns-contact-form--default', theme, width: 1280 })),
]

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

/** Width and height from a PNG's IHDR chunk. */
export const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) })

/** Problems with a generated PNG (empty list when it is fine). */
export const pngProblems = (buffer) => {
  const problems = []
  if (buffer.length >= MAX_BYTES) problems.push(`${buffer.length} bytes, limit is ${MAX_BYTES - 1}`)
  if (buffer.subarray(1, 4).toString('latin1') !== 'PNG') return [...problems, 'not a PNG file']
  const { width } = pngSize(buffer)
  if (width > MAX_WIDTH) problems.push(`${width} px wide, limit is ${MAX_WIDTH}`)
  return problems
}

/** Storybook iframe URL for one story, with the `theme` global when given. */
export const storyUrl = (origin, { id, theme }) =>
  `${origin}/iframe.html?id=${id}&viewMode=story${theme ? `&globals=theme:${theme}` : ''}`

/** Serves `dir` on a free port (port 0, picked by the OS). Resolves with the server and its origin. */
export const serveStatic = (dir) =>
  new Promise((resolvePromise, reject) => {
    const server = createServer((req, res) => {
      const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname))
      const file = join(dir, path.endsWith(sep) || path.endsWith('/') ? `${path}index.html` : path)
      if (!file.startsWith(dir) || !existsSync(file) || !statSync(file).isFile()) {
        res.writeHead(404).end('Not found')
        return
      }
      res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
      res.end(readFileSync(file))
    })
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => resolvePromise({ server, origin: `http://127.0.0.1:${server.address().port}` }))
  })

const launchChromium = async () => {
  const { chromium } = await import('playwright')
  try {
    return await chromium.launch()
  } catch (error) {
    throw new Error(
      `Could not start Chromium for Playwright. Install it once with:\n  npx playwright install chromium\n\n${error.message}`,
      { cause: error },
    )
  }
}

const capture = async (browser, origin, shot) => {
  const context = await browser.newContext({
    viewport: { width: shot.width, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto(storyUrl(origin, shot), { waitUntil: 'networkidle' })
  await page.locator('#storybook-root > *').first().waitFor()
  if (shot.theme) await page.waitForFunction((t) => globalThis.document.documentElement.getAttribute('data-theme') === t, shot.theme)
  await page.evaluate(() => globalThis.document.fonts.ready)
  const buffer = await page.screenshot({ fullPage: true })
  await context.close()
  return buffer
}

const main = async () => {
  if (!existsSync(join(staticDir, 'index.html'))) {
    console.log('storybook-static/ is missing, building Storybook...')
    execFileSync('npm', ['run', 'build-storybook'], { cwd: root, stdio: 'inherit' })
  }
  mkdirSync(outDir, { recursive: true })
  const { server, origin } = await serveStatic(staticDir)
  console.log(`Serving storybook-static at ${origin}`)
  let browser
  try {
    browser = await launchChromium()
    for (const shot of shots) {
      const buffer = await capture(browser, origin, shot)
      const problems = pngProblems(buffer)
      if (problems.length) throw new Error(`${shot.file}: ${problems.join('; ')}`)
      writeFileSync(join(outDir, shot.file), buffer)
      const { width, height } = pngSize(buffer)
      console.log(`wrote docs/images/readme/${shot.file} (${width}x${height}, ${Math.round(buffer.length / 1024)} KB)`)
    }
  } finally {
    await browser?.close()
    await new Promise((done) => server.close(done))
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
