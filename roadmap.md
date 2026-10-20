# Roadmap

Planned work for the Design System Wireframe, grouped into epics. Move tasks to **Done** once merged, with a link to the PR.

Each task has a unique ID (`DS-<n>`). IDs are never reused or renumbered; new tasks take the next free number. Use the ID in branch names and PR titles, e.g. `feat/DS-3-textarea-design`.

Status: `[ ]` not started · `[~]` in progress · `[x]` done

Each task carries its fields in an indented line, read by the [software factory](docs/factory/README.md):
`type` (`design | build | infra | docs`) · `has_ui` · `depends_on` · `needs_human` · `status` (`todo | ready | in-progress | review | done | blocked`), plus a `done_when` list. A `build` task with `has_ui: yes` depends on its `design` task. Add or change tasks with `/factory:add` and `/factory:edit`.

## Backlog

### Epic: Theming

- [ ] **DS-1 Theming infrastructure with a default theme.** Make themes switchable (e.g. `data-theme` on a root element) and register the current gray Wireframe tokens in `src/styles/tokens.css` as the `default` theme. Components keep reading semantic `--ds-*` roles only, so no component changes should be needed.
  - type: build · has_ui: no · depends_on: – · needs_human: no · status: todo
  - done_when:
    - Themes switch via `data-theme` on a root element
    - Current Wireframe tokens are registered as the `default` theme in `src/styles/tokens.css`
    - Components read only semantic `--ds-*` roles; no component changes
    - Existing stories and tests pass unchanged
- [ ] **DS-2 Add a second theme.** Create a new theme on top of the same semantic roles (e.g. a "Blueprint" theme: navy ground, cyan accents, white ink) to prove the theming layer works. Add a Storybook theme switcher.
  - type: design · has_ui: yes · depends_on: DS-1 · needs_human: yes · status: todo
  - done_when:
    - Canvas shows the second theme applied to existing components
    - Spec lists every semantic role with its new raw value and contrast ratio
    - New raw values listed under Token requests for approval
- [ ] **DS-12 Second theme — implementation.** Add the approved theme on top of the same semantic roles and a Storybook theme switcher.
  - type: build · has_ui: yes · depends_on: DS-2 · needs_human: no · status: todo
  - done_when:
    - Theme block matches the approved DS-2 spec in `docs/specs/`
    - Storybook toolbar switches between `default` and the new theme
    - All component stories render and pass `jest-axe` in both themes

### Epic: Components

- [x] **DS-3 Textarea — design.** Define sizes, states (default, hover, focus, disabled, invalid, read-only), resize behavior, and character counter. Match `Input` / `TextField`.
  - type: design · has_ui: yes · depends_on: – · needs_human: no · status: done
  - done_when:
    - Canvas covers sizes and states: default, hover, focus, disabled, invalid, read-only
    - Spec defines resize behavior and the character counter
    - Spec matches `Input` / `TextField` tokens and keyboard behavior
- [ ] **DS-4 Textarea — implementation.** Build `Textarea` and `TextareaField` in `src/components/Textarea/` per the approved spec `docs/specs/Textarea.md` ([canvas](https://claude.ai/artifact/2xzRy5QSUXVA3FGCTy25N2)): native `<textarea>` wired to the existing `Field` via `useFieldControl()`, with component, CSS, stories, tests (incl. `jest-axe`), and export from `src/index.ts`.
  - type: build · has_ui: yes · depends_on: DS-3 · needs_human: no · status: todo
  - done_when:
    - Matches approved spec `docs/specs/Textarea.md` in every state: default, filled, hover, focus, invalid, invalid + focus, disabled, read-only, read-only + focus
    - Sizes `sm` / `md` / `lg` = 2 / 4 / 8 rows; `rows` overrides; `rows={1}` is 44 px and lines up with `Input`
    - `resize`: `vertical` (default), `none`, `auto` (grows to `maxRows`, default 6, via `field-sizing: content`); disabled and read-only never resize
    - Counter shows when `maxLength` is set, without native `maxlength`: "n / max", black at ≥ 90 %, error + icon and `aria-invalid` past the limit, polite debounced live region
    - `TextareaField` mirrors `TextField` (label, hint, error); counter ids appended to Field's `aria-describedby`
    - Story per state, size, resize mode and counter state, plus a keyboard story; `userEvent` tests and a `jest-axe` check; exported from `src/index.ts`
- [ ] **DS-5 Toggle — design.** Define on/off, disabled, focus, sizes, and label placement.
  - type: design · has_ui: yes · depends_on: – · needs_human: no · status: todo
  - done_when:
    - Canvas covers on/off, disabled, focus, sizes, and label placement
    - Spec names Radix `Switch` and maps every state to tokens
- [ ] **DS-6 Toggle — implementation.** Build on Radix `Switch` (`import { Switch } from 'radix-ui'`), style via `[data-state]` / `[data-disabled]`. Stories cover keyboard and on/off states; tests use `userEvent` and `jest-axe`.
  - type: build · has_ui: yes · depends_on: DS-5 · needs_human: no · status: todo
  - done_when:
    - Built on Radix `Switch`, styled via `[data-state]` / `[data-disabled]`
    - Matches approved spec `docs/specs/Toggle.md` in every state
    - Stories cover keyboard and on/off; tests use `userEvent` and `jest-axe`

### Epic: Publishing

- [ ] **DS-7 Library build.** Package is `private` with no build today. Add a Vite library build (ESM + type declarations) and a compiled CSS entry (tokens + Tailwind utilities). Set `name`, `exports`, `files`, `sideEffects`, and `peerDependencies` (`react`, `react-dom`) in `package.json`.
  - type: infra · has_ui: no · depends_on: – · needs_human: no · status: todo
  - done_when:
    - `npm run build` produces ESM + type declarations in `dist/`
    - A compiled CSS entry (tokens + Tailwind utilities) is emitted
    - `package.json` sets `name`, `exports`, `files`, `sideEffects`, `peerDependencies`
- [ ] **DS-8 CI pipeline.** GitHub Actions workflow on every PR and push to `main`: `npm ci`, lint, typecheck, test with coverage, library build. Only `claude-code-review.yml` and `storybook-vercel.yml` exist now.
  - type: infra · has_ui: no · depends_on: DS-7 · needs_human: no · status: todo
  - done_when:
    - Workflow runs on every PR and push to `main`
    - Runs `npm ci`, lint, typecheck, test with coverage, and the library build
    - Shows up as a GitHub check on PRs
- [ ] **DS-9 Release pipeline to npm.** Versioning and changelog (e.g. Changesets), plus a workflow that publishes to npm on release, preferably with npm trusted publishing (OIDC) and provenance rather than a long-lived token.
  - type: infra · has_ui: no · depends_on: DS-7, DS-8 · needs_human: yes · status: todo
  - done_when:
    - Changesets (or similar) handles versions and changelog
    - Publish workflow uses npm trusted publishing (OIDC) with provenance
    - Proposal only until a human approves the release setup
- [ ] **DS-10 "Create your own theme" skill.** A Claude skill shipped with the package that guides consumers through creating a custom theme: choose the raw values, generate the `[data-theme]` block, check contrast, and register the theme.
  - type: docs · has_ui: no · depends_on: DS-1, DS-7 · needs_human: no · status: todo
  - done_when:
    - Skill ships with the package
    - Guides choosing raw values, generating the `[data-theme]` block, checking contrast, registering the theme
- [ ] **DS-11 Consumer docs.** Install and usage guide (import CSS, use components, apply a theme), linked from the README and the Storybook Introduction page.
  - type: docs · has_ui: no · depends_on: DS-1, DS-7 · needs_human: no · status: todo
  - done_when:
    - Install and usage guide covers importing CSS, using components, applying a theme
    - Linked from the README and the Storybook Introduction page

## Done

- [x] **DS-3 Textarea — design.** [PR #27](https://github.com/mikespineu/design-system-wireframe/pull/27)
