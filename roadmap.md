# Roadmap

Planned work for the Design System Wireframe, grouped into epics. Move tasks to **Done** once merged, with a link to the PR.

Each task has a unique ID (`DS-<n>`). IDs are never reused or renumbered; new tasks take the next free number. Use the ID in branch names and PR titles, e.g. `feat/DS-3-textarea-design`.

Status: `[ ]` not started · `[~]` in progress · `[x]` done

## Backlog

### Epic: Theming

- [ ] **DS-1 Theming infrastructure with a default theme.** Make themes switchable (e.g. `data-theme` on a root element) and register the current gray Wireframe tokens in `src/styles/tokens.css` as the `default` theme. Components keep reading semantic `--ds-*` roles only, so no component changes should be needed.
- [ ] **DS-2 Add a second theme.** Create a new theme on top of the same semantic roles (e.g. a "Blueprint" theme: navy ground, cyan accents, white ink) to prove the theming layer works. Add a Storybook theme switcher.

### Epic: Components

- [ ] **DS-3 Textarea — design.** Define sizes, states (default, hover, focus, disabled, invalid, read-only), resize behavior, and character counter. Match `Input` / `TextField`.
- [ ] **DS-4 Textarea — implementation.** `src/components/Textarea/` with component, CSS, stories, tests (incl. `jest-axe`), and export from `src/index.ts`.
- [ ] **DS-5 Toggle — design.** Define on/off, disabled, focus, sizes, and label placement.
- [ ] **DS-6 Toggle — implementation.** Build on Radix `Switch` (`import { Switch } from 'radix-ui'`), style via `[data-state]` / `[data-disabled]`. Stories cover keyboard and on/off states; tests use `userEvent` and `jest-axe`.

### Epic: Publishing

- [ ] **DS-7 Library build.** Package is `private` with no build today. Add a Vite library build (ESM + type declarations) and a compiled CSS entry (tokens + Tailwind utilities). Set `name`, `exports`, `files`, `sideEffects`, and `peerDependencies` (`react`, `react-dom`) in `package.json`.
- [ ] **DS-8 CI pipeline.** GitHub Actions workflow on every PR and push to `main`: `npm ci`, lint, typecheck, test with coverage, library build. Only `claude-code-review.yml` and `storybook-vercel.yml` exist now.
- [ ] **DS-9 Release pipeline to npm.** Versioning and changelog (e.g. Changesets), plus a workflow that publishes to npm on release, preferably with npm trusted publishing (OIDC) and provenance rather than a long-lived token.
- [ ] **DS-10 "Create your own theme" skill.** A Claude skill shipped with the package that guides consumers through creating a custom theme: choose the raw values, generate the `[data-theme]` block, check contrast, and register the theme.
- [ ] **DS-11 Consumer docs.** Install and usage guide (import CSS, use components, apply a theme), linked from the README and the Storybook Introduction page.

## Done

_Nothing yet._
