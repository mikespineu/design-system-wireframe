// Renders one still per composition (or just the ids given as arguments) to out/<id>.png.
import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const run = (args) => execFileSync(npx, ['remotion', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })

// `--quiet` prints the composition ids separated by spaces. Keep only id-shaped words, so a CLI banner
// (e.g. an update notice) on stdout is ignored.
const all = run(['compositions', 'src/index.ts', '--quiet']).trim().split(/\s+/).filter((word) => /^[A-Za-z0-9_-]+$/.test(word))
const wanted = process.argv.slice(2)
const ids = wanted.length > 0 ? wanted : all

for (const id of ids) {
  if (!all.includes(id)) throw new Error(`Unknown composition "${id}". Available: ${all.join(', ')}`)
  console.log(run(['still', 'src/index.ts', id, `out/${id}.png`, '--frame=60']).trim())
}
