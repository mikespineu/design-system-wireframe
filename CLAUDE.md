# design-system-test

React + TypeScript design system. Vite, Storybook 10, Jest 30 (jsdom, `@swc/jest`).

## Git worktrees (required)

Always do feature, fix, and refactor work in a git worktree. Never edit files directly on `main` in the primary checkout.

- Before starting any task that changes files, create a worktree (use the `superpowers:using-git-worktrees` skill or the `EnterWorktree` tool).
- Branch from an up-to-date `main`. Name branches `feat/<topic>`, `fix/<topic>`, or `chore/<topic>`.
- Keep worktrees under `.worktrees/` in the repo root (gitignored), e.g. `git worktree add .worktrees/feat-card -b feat/card main`.
- Run `npm ci` inside a new worktree; each one needs its own `node_modules`.
- One task per worktree. Do not reuse a worktree for unrelated work.
- When the work is merged or abandoned, remove the worktree (`git worktree remove .worktrees/<name>`) and delete the branch.
- Never commit or push from the primary checkout unless the user explicitly asks.

## Radix primitives (required)

Use [Radix UI](https://www.radix-ui.com/primitives) (`radix-ui` package) for all primitive UI interaction. Do not hand-roll behavior Radix already provides.

- Build interactive components (dialog, popover, dropdown menu, tooltip, select, tabs, accordion, checkbox, switch, slider, etc.) on top of Radix primitives. Radix owns focus management, keyboard navigation, ARIA attributes, and portal/layering.
- Import from the unified package: `import { Dialog } from 'radix-ui'`. Do not add individual `@radix-ui/react-*` packages.
- Radix primitives are unstyled. Style them with the design system's tokens (`--ds-*`) and classes; never rely on Radix Themes.
- Wrap primitives in our own components and expose a narrow, typed API. Do not re-export raw Radix parts as the public API unless the wrapper adds nothing.
- Use `asChild` for composition instead of wrapper elements, and forward refs and rest props to the underlying primitive.
- Style state through Radix data attributes (`[data-state="open"]`, `[data-disabled]`, `[data-highlighted]`), not extra JS state.
- Stories must cover keyboard and open/closed states. Tests must use `userEvent` for keyboard interaction and include a `jest-axe` check. Primitives that need browser APIs (`ResizeObserver`, `PointerEvent`, `scrollIntoView`) may need stubs in `jest.setup.ts`.

## Commands

- `npm run storybook` – dev server on :6006
- `npm run build-storybook` – static build
- `npm test` / `npm run test:watch` / `npm run test:coverage` – Jest
- `npm run typecheck` – `tsc --noEmit`
- `npm run lint` / `npm run lint:fix` – ESLint
- Husky `pre-push` hook runs `npm run lint && npm test`; never bypass it with `--no-verify`.

## Conventions

- Components live in `src/components/<Name>/` with `<Name>.tsx`, `<Name>.css`, `<Name>.stories.tsx`, `<Name>.test.tsx`, `index.ts`. Export from `src/index.ts`.
- Style only with tokens from `src/styles/tokens.css` (`--ds-*` variables); no hardcoded colors or spacing.
- Every component needs a story and a test, including a `jest-axe` a11y check. Coverage threshold is 80%.
- Run `npm test` and `npm run typecheck` before declaring work done.
