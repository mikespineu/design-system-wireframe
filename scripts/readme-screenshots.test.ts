import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// The images `npm run readme:screenshots` writes (scripts/readme-screenshots.mjs) are committed, so check them.
const dir = join(__dirname, '..', 'docs', 'images', 'readme')
const files = [
  'themes-side-by-side.png',
  ...['default', 'dark', 'bold', 'bold-dark'].map((theme) => `contact-form-${theme}.png`),
]

describe('README screenshots', () => {
  it.each(files)('%s is committed, under 500 KB and at most 1600 px wide', (file) => {
    const path = join(dir, file)
    expect(existsSync(path)).toBe(true)
    expect(statSync(path).size).toBeLessThan(500 * 1024)
    const png = readFileSync(path)
    // PNG signature, then the IHDR chunk: width at byte 16, height at byte 20 (big endian).
    expect(png.subarray(1, 4).toString('latin1')).toBe('PNG')
    expect(png.readUInt32BE(16)).toBeLessThanOrEqual(1600)
    expect(png.readUInt32BE(20)).toBeGreaterThan(0)
  })

  it('has a script entry in package.json', () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as { scripts: Record<string, string> }
    expect(pkg.scripts['readme:screenshots']).toBe('node scripts/readme-screenshots.mjs')
  })
})
