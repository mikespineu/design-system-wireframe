// Installs the packed library into video/ (the Remotion project). Run after `npm run build`.
//   1. `npm pack` the root package into video/.pack/ (replacing any older tarball)
//   2. `npm ci` in video/ from its own lockfile
//   3. install the tarball with --no-save, so video/package.json and its lockfile stay stable (a
//      tarball's hash changes with every build). Not --no-package-lock: npm 10 crashes on that
//      combination with a tarball ("Cannot read properties of null (reading 'edgesOut')").
// video/ imports only the public exports, exactly like a consumer would.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const video = join(root, 'video')
const pack = join(video, '.pack')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const run = (args, cwd) => execFileSync(npm, args, { cwd, stdio: 'inherit' })

rmSync(pack, { recursive: true, force: true })
mkdirSync(pack, { recursive: true })
run(['pack', '--pack-destination', pack], root)

const [tarball] = readdirSync(pack).filter((file) => file.endsWith('.tgz'))
if (!tarball) throw new Error('npm pack produced no tarball in video/.pack')

run(['ci'], video)
const files = ['package.json', 'package-lock.json'].map((name) => join(video, name))
const before = files.map((file) => readFileSync(file, 'utf8'))
run(['install', '--no-save', join(pack, tarball)], video)

if (files.some((file, i) => readFileSync(file, 'utf8') !== before[i])) {
  throw new Error('Installing the tarball changed video/package.json or its lockfile; it must stay untouched.')
}
