// Renders one still per composition (or just the ids given as arguments) to out/<id>.png.
// The ids come from src/compositionIds.json, which compositions.test.ts keeps equal to the registered
// compositions. Nothing is scraped from CLI output (it can start with notices such as "Cached bundle").
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const all = JSON.parse(readFileSync(resolve(cwd, 'src/compositionIds.json'), 'utf8'))
const wanted = process.argv.slice(2)
const ids = wanted.length > 0 ? wanted : all

for (const id of ids) {
  if (!all.includes(id)) throw new Error(`Unknown composition "${id}". Available: ${all.join(', ')}`)
  execFileSync(npx, ['remotion', 'still', 'src/index.ts', id, `out/${id}.png`, '--frame=60'], { cwd, stdio: 'inherit' })
}
