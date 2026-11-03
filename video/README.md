# Promo video (Remotion)

A standalone [Remotion](https://www.remotion.dev) project that renders the design system's real components to video. It is **not** an npm workspace: it has its own `package.json` and `package-lock.json`, and the root package, its lockfile and `dist/` contain no Remotion code.

## License

Remotion is not MIT. Its license is free for individuals, non-profits, and for-profit companies with up to 3 employees. Larger companies need a company license. Read the terms before you use or render anything from this folder: <https://www.remotion.dev/docs/license>.

`remotion` and every `@remotion/*` package are pinned to one exact version (currently `4.0.540`, no `^`). Bump them together.

## Install

From the repository root:

```bash
npm ci                 # root dependencies
npm run build          # builds dist/
npm run video:install  # npm pack -> video/.pack/, npm ci in video/, installs the tarball
```

`video:install` installs the library from the `npm pack` output, the same way a consumer would, with `--no-save`, so `video/package.json` and its lockfile do not change when the tarball does. Re-run it after every library change. `video/` imports only public exports:

- `design-system-test` (components)
- `design-system-test/styles.css`, `design-system-test/fonts.css`
- `design-system-test/themes/bold.css`, `design-system-test/themes/bold-fonts.css`

React is a peer dependency of the library. `video/` depends on `react` and `react-dom` (same major as the root), so there is a single React copy; `npm test` in `video/` checks this.

## Commands

From the repository root:

| Command | What it does |
| --- | --- |
| `npm run video:studio` | Remotion Studio on this worktree's port (`6100 + cksum(dirname) % 900`, incremented while taken; never 3000 or 6006). The URL is printed on start. |
| `npm run video:still` | One PNG per composition in `video/out/`. Pass ids to render only some: `npm run video:still -- placeholder-bold` |
| `npm run video:render` | Renders `placeholder-default` to `video/out/placeholder-default.mp4`. Pass other Remotion render args after `--`. |

Inside `video/`: `npm run typecheck`, `npm test` (Vitest), `npm run studio`, `npm run still`, `npm run render`.

Rendering needs a browser. Remotion downloads Chrome Headless Shell on first use (`npx remotion browser ensure`). If that binary cannot start on your machine, point Remotion at an installed Chrome with `REMOTION_BROWSER_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` (read in `remotion.config.ts`).

## The placeholder

`src/compositions.ts` lists the compositions and `src/Root.tsx` registers exactly that list, so a new scene is one new entry.

- `placeholder-default` and `placeholder-bold`: 1920x1080, 30 fps, 90 frames. Both render `src/Placeholder.tsx`, a `TextField` and a `Button` from the packed library. The bold one sets `data-theme="bold"` on the stage, the way a consumer turns the theme on.
- The scene fades in and the field "types" its value, both computed from `useCurrentFrame()`.
- Fonts: `useFontsReady()` holds the render with `delayRender()` until the `fonts.css` / `bold-fonts.css` families are declared and loaded, then releases it with `continueRender()`. No frame is captured with a fallback font. The font files come from Google Fonts, so rendering needs network access.

## Motion rules

Remotion renders each frame on its own, so time-based CSS gives wrong or missing frames.

- No CSS `transition` or `animation`, and no `setTimeout`/`requestAnimationFrame` movement. Drive every movement from `useCurrentFrame()` (`interpolate`, `spring`).
- `src/MotionOff.tsx` is mounted in every scene. It sets `--ds-motion: 0ms` and forces `transition: none` and `animation: none` (the library also has Tailwind utilities with a fixed duration, which the token does not reach). Do not remove it.
- Do not use `loading` buttons: the spinner is a CSS animation.
- This package adds no `.css` files; the overrides live in TSX.
