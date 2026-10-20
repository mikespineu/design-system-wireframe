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

## Commands

- `npm run storybook` – dev server on :6006 (primary checkout only; worktrees use their own port, see below)
- `npm run build-storybook` – static build
- `npm test` / `npm run test:watch` / `npm run test:coverage` – Jest
- `npm run typecheck` – `tsc --noEmit`

## Preview link (required)

Every time an agent finishes work in a worktree, its last message must end with a clickable preview link to that worktree's local Storybook, e.g. `http://localhost:6137`. Link only, no extra prose needed.

- Start Storybook from the worktree in the background before replying: `npx storybook dev -p "$PORT" --no-open`.
- Verify the server answers (`curl -sf "http://localhost:$PORT" >/dev/null`) before sending the link. Never send a dead link.
- Leave the server running so the user can visit it. Stop it when the worktree is removed.

## Port isolation between worktrees (required)

Worktrees run side by side, so never use the shared default `:6006`. Each worktree gets its own deterministic port:

```sh
PORT=$((6100 + $(basename "$PWD" | cksum | cut -d' ' -f1) % 900))   # 6100-6999
```

- Same worktree name always maps to the same port, so the link stays stable.
- If `$PORT` is already taken by another process (`lsof -i :$PORT`), increment until free; do not kill the other process.
- Applies to every dev server (Storybook, Vite, any test UI). Do not hardcode ports in configs or scripts.
- Do not share caches or state across worktrees: each has its own `node_modules` and `storybook-static`.

## Conventions

- Components live in `src/components/<Name>/` with `<Name>.tsx`, `<Name>.css`, `<Name>.stories.tsx`, `<Name>.test.tsx`, `index.ts`. Export from `src/index.ts`.
- Style only with tokens from `src/styles/tokens.css` (`--ds-*` variables); no hardcoded colors or spacing.
- Every component needs a story and a test, including a `jest-axe` a11y check. Coverage threshold is 80%.
- Run `npm test` and `npm run typecheck` before declaring work done.
