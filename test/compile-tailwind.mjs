// Compiles src/styles/tailwind.css for the given candidates and prints the CSS.
// Runs outside Jest because @tailwindcss/node registers module hooks Jest forbids.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { compile } from '@tailwindcss/node'

const base = join(process.cwd(), 'src/styles')
const src = readFileSync(join(base, 'tailwind.css'), 'utf8').replace(/@import url\([^)]*\);/, '')
const compiler = await compile(src, { base, onDependency: () => {} })
process.stdout.write(compiler.build(process.argv.slice(2)))
