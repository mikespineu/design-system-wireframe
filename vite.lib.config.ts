import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

// Library build. Kept out of vite.config.ts so Storybook (which auto-loads that file) is unaffected.
// Run via `npm run build` (this config + tsc for declarations).
const indexEntry = fileURLToPath(new URL('./src/index.ts', import.meta.url));
const stylesEntry = fileURLToPath(new URL('./src/styles/tailwind.css', import.meta.url));

// Pull the stylesheet (fonts, tokens, Tailwind utilities) into the build graph without a new source file.
// With cssCodeSplit off, it merges with component CSS into a single dist/styles.css. The JS entry
// gets a side-effect-free css import that Vite strips from the output.
const includeStyles = (): Plugin => ({
  name: 'ds-include-styles',
  enforce: 'pre',
  transform(code, id) {
    if (id === indexEntry) return `import ${JSON.stringify(stylesEntry)};\n${code}`;
    return null;
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), includeStyles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: true,
    lib: {
      entry: indexEntry,
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, 'react/jsx-runtime', /^radix-ui($|\/)/],
      output: {
        assetFileNames: (asset) =>
          asset.names.some((n) => n.endsWith('.css')) ? 'styles.css' : 'assets/[name][extname]',
      },
    },
  },
});
