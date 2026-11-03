// Jest stand-in for Vite's `?raw` import of docs/theming-guide/samples/minimal.ts: the file's text as the default export.
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

module.exports = {
  __esModule: true,
  default: readFileSync(join(__dirname, '..', 'docs', 'theming-guide', 'samples', 'minimal.ts'), 'utf8'),
};
