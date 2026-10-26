# Roadmap

Planned work for the Design System Wireframe, grouped into epics. Move tasks to **Done** once merged, with a link to the PR.

Each task has a unique ID (`DS-<n>`). IDs are never reused or renumbered; new tasks take the next free number. Use the ID in branch names and PR titles, e.g. `feat/DS-3-textarea-design`.

Status: `[ ]` not started · `[~]` in progress · `[x]` done

Each task carries its fields in an indented line, read by the [software factory](docs/factory/README.md):
`type` (`design | build | infra | docs`) · `has_ui` · `depends_on` · `needs_human` · `status` (`todo | ready | in-progress | review | done | blocked`), plus a `done_when` list. A `build` task with `has_ui: yes` depends on its `design` task. Add or change tasks with `/factory:add` and `/factory:edit`.

## Backlog

### Epic: Theming

- [x] **DS-1 Theming infrastructure with a default theme.** Make themes switchable (e.g. `data-theme` on a root element) and register the current gray Wireframe tokens in `src/styles/tokens.css` as the `default` theme. Components keep reading semantic `--ds-*` roles only, so no component changes should be needed.
  - type: build · has_ui: no · depends_on: – · needs_human: no · status: done
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
- [x] **DS-4 Textarea — implementation.** Build `Textarea` and `TextareaField` in `src/components/Textarea/` per the approved spec `docs/specs/Textarea.md` ([canvas](https://claude.ai/artifact/2xzRy5QSUXVA3FGCTy25N2)): native `<textarea>` wired to the existing `Field` via `useFieldControl()`, with component, CSS, stories, tests (incl. `jest-axe`), and export from `src/index.ts`.
  - type: build · has_ui: yes · depends_on: DS-3 · needs_human: no · status: done
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
- [ ] **DS-13 Checkbox — design.** Define checked, unchecked, indeterminate, disabled, focus and invalid states, the label, and a group with a legend, all matched to Field tokens.
  - type: design · has_ui: yes · depends_on: – · needs_human: no · status: todo
  - done_when:
    - Canvas covers checked, unchecked, indeterminate, disabled, focus and invalid
    - Spec defines label placement and a CheckboxGroup with fieldset/legend, hint and error
    - Spec names Radix `Checkbox` and maps every state to `--ds-*` tokens
- [ ] **DS-14 Checkbox — implementation.** Build `Checkbox` and `CheckboxGroup` in `src/components/Checkbox/` on Radix `Checkbox` (`import { Checkbox } from 'radix-ui'`), styled via `[data-state]` / `[data-disabled]`.
  - type: build · has_ui: yes · depends_on: DS-13 · needs_human: no · status: todo
  - done_when:
    - Matches the approved spec in every state
    - Indeterminate state supported via `checked="indeterminate"`
    - Story per state, keyboard story, `jest-axe` test, exported from `src/index.ts`
- [ ] **DS-15 RadioGroup — design.** Define item states, vertical and horizontal orientation, and the group label, hint and error, consistent with Checkbox.
  - type: design · has_ui: yes · depends_on: DS-13 · needs_human: no · status: todo
  - done_when:
    - Canvas covers selected, unselected, disabled, focus and invalid, in both orientations
    - Spec names Radix `RadioGroup` and maps every state to tokens
    - Spec documents arrow-key and roving-tabindex behavior
- [ ] **DS-16 RadioGroup — implementation.** Build `RadioGroup` in `src/components/RadioGroup/` on Radix `RadioGroup`, styled via `[data-state]` / `[data-disabled]`.
  - type: build · has_ui: yes · depends_on: DS-15 · needs_human: no · status: todo
  - done_when:
    - Matches the approved spec in every state
    - Arrow keys move selection; Tab enters and leaves the group once
    - Story per state, keyboard story, `jest-axe` test, exported from `src/index.ts`
- [ ] **DS-17 Select — design.** Define a trigger styled as Input, the open listbox, item states (highlighted, selected, disabled), groups, and the placeholder, inside Field.
  - type: design · has_ui: yes · depends_on: – · needs_human: no · status: todo
  - done_when:
    - Canvas covers trigger default, hover, focus, open, disabled and invalid, plus item highlighted, selected and disabled
    - Spec names Radix `Select` and defines portal layering and max height
    - Spec matches `Input` / `TextField` tokens and the 44 px height
- [ ] **DS-18 Select — implementation.** Build `Select` and `SelectField` in `src/components/Select/` on Radix `Select`, wired to `Field` via `useFieldControl()`, styled via `[data-state]` / `[data-highlighted]`.
  - type: build · has_ui: yes · depends_on: DS-17 · needs_human: no · status: todo
  - done_when:
    - Matches the approved spec in every state
    - Keyboard typeahead, arrow navigation and Escape-to-close covered by `userEvent` tests
    - Story per state, keyboard story, open/closed stories, `jest-axe` test, exported from `src/index.ts`
- [ ] **DS-19 Dialog — design.** Define overlay, panel sizes, header/title, body, footer actions and close button, within the 0-radius, no-shadow wireframe rules.
  - type: design · has_ui: yes · depends_on: – · needs_human: no · status: todo
  - done_when:
    - Canvas covers open dialog in sm, md and lg, with overlay, title, description, actions and close button
    - Spec names Radix `Dialog` and defines focus trap, Escape and outside-click behavior
    - Spec maps overlay and panel to existing `--ds-*` tokens or lists Token requests
- [ ] **DS-20 Dialog — implementation.** Build `Dialog` in `src/components/Dialog/` on Radix `Dialog` with a narrow typed API (`Dialog`, `DialogTrigger` via `asChild`, `DialogContent`, title and description required), styled via `[data-state]`.
  - type: build · has_ui: yes · depends_on: DS-19 · needs_human: no · status: todo
  - done_when:
    - Matches the approved spec in every state
    - Focus moves into the dialog on open and returns to the trigger on close; Escape closes
    - Story per state, keyboard story, open/closed stories, `jest-axe` test, exported from `src/index.ts`
- [ ] **DS-21 Tabs — design.** Define the tab list and triggers (default, hover, focus, active, disabled), the active underline/ink treatment, and the panel spacing.
  - type: design · has_ui: yes · depends_on: – · needs_human: no · status: todo
  - done_when:
    - Canvas covers trigger default, hover, focus, active and disabled
    - Spec names Radix `Tabs` and defines automatic vs manual activation
    - Spec maps every state to `--ds-*` tokens
- [ ] **DS-22 Tabs — implementation.** Build `Tabs` in `src/components/Tabs/` on Radix `Tabs`, styled via `[data-state="active"]` / `[data-disabled]`.
  - type: build · has_ui: yes · depends_on: DS-21 · needs_human: no · status: todo
  - done_when:
    - Matches the approved spec in every state
    - Arrow keys move between tabs, Home/End jump; tested with `userEvent`
    - Story per state, keyboard story, `jest-axe` test, exported from `src/index.ts`
- [x] **DS-23 Slider — design.** Explore and settle the Slider design in one task: a canvas with 3–4 bold visual directions in the `--ds-*` token language (track/fill, thumb shape, ticks/marks, value bubble, attached numeric input, two-thumb range, sizes), on desktop and at a touch size; iterate with the user to one direction; then write the full spec `docs/specs/Slider.md` for it on Radix `Slider`, covering every state, uniform steps and custom value lists (e.g. 1, 2, 3, 5, 8, 10), and a numeric input that snaps to the nearest allowed value.
  - type: design · has_ui: yes · depends_on: – · needs_human: yes · status: done
  - done_when:
    - Canvas shows ≥ 3 explored directions plus the chosen one, each with uniform steps (e.g. step 5) and a custom value list with ticks/marks, on desktop and touch (hit targets ≥ 44 px)
    - Chosen direction covers default, hover, focus-visible, dragging, disabled and invalid; optional variants (value bubble, range, sm/md/lg) shown or marked out of scope
    - Spec defines the typed API (`min`/`max`/`step` or `values[]`, `value`/`defaultValue`, `onValueChange`/`onValueCommit`, `showInput`, `marks`, `size`)
    - Spec defines snapping: custom values map to Radix index steps; typed input snaps to nearest allowed value on blur/Enter, with clamping and tie-breaking
    - Spec names Radix `Slider`, maps every state to `--ds-*` tokens (new raw values under Token requests), and defines keyboard (arrows, Page Up/Down, Home/End) and Field wiring (label, hint, error, `aria-valuetext`)
- [ ] **DS-24 Slider — implementation.** Build `Slider` and `SliderField` in `src/components/Slider/` on Radix `Slider` (`import { Slider } from 'radix-ui'`), styled via `[data-orientation]` / `[data-disabled]`. The numeric input reuses `Input`, is wired through `Field` / `useFieldControl()`, and snaps to the nearest allowed value.
  - type: build · has_ui: yes · depends_on: DS-23 · needs_human: no · status: todo
  - done_when:
    - Matches the approved spec in every state
    - Uniform `step` and custom `values[]` modes both snap only to allowed values; typing in the numeric input snaps to the nearest allowed value on commit
    - Touch hit targets ≥ 44 px; `jest.setup.ts` gets `ResizeObserver` / `PointerEvent` stubs if missing
    - Story per state, keyboard story, `jest-axe` test, exported from `src/index.ts`
    - `userEvent` tests cover arrow/Home/End keys, input snapping and clamping

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
- [x] **DS-25 README — Claude Design & Software Factory.** Create the root `README.md` (the repo has none yet) with two sections. **Claude Design**: how components are designed before they're built: canvases in `docs/design-system-wireframe/*.dc.html`, specs in `docs/specs/<Name>.md`, the design → approved spec → build handoff, and how `--ds-*` tokens connect the design to code. **Software Factory**: how the roadmap works: `roadmap.md` task format, the `/factory:*` skills (`add`, `plan`, `next`, `design`, `build`, `approve`, `status`…), the agent pipeline (planner → designer → builder → QA → reviewer), the hard gates (lint, typecheck, test, Storybook build), job files in `factory/jobs/`, and the steps that need human approval. Also links Storybook and the stack overview so the README reads as one page. Add screenshots to illustrate: the Storybook Introduction page, the factory status page (`/factory:status` / `npm run factory:status`), and one Claude Design canvas. Store them as PNGs in `docs/images/readme/`.
  - type: docs · has_ui: no · depends_on: – · needs_human: no · status: done
  - done_when:
    - `README.md` has a "Claude Design" section covering canvases (`*.dc.html`), specs (`docs/specs/`), and the design → spec → build handoff
    - `README.md` has a "Software Factory" section listing every skill in `factory/plugin/skills/`, the agent pipeline, the gates, job files, and the human-approval points
    - The Storybook section explains how to run it locally (`npm run storybook`, per-worktree port) and links the deployed Storybook if `vercel.json` defines one
    - Screenshots of the Storybook Introduction page, the factory status page and one Claude Design canvas are committed in `docs/images/readme/` (PNG, ≤ 500 KB each) and embedded in their sections, each with descriptive alt text
    - Every skill, path, image and command named in the README exists in the repo (all relative links resolve)

## Done

- **DS-1** Theming infrastructure with a default theme — https://github.com/mikespineu/design-system-wireframe/pull/31
- **DS-4** Textarea — implementation — https://github.com/mikespineu/design-system-wireframe/pull/33
- [x] **DS-3 Textarea — design.** [PR #27](https://github.com/mikespineu/design-system-wireframe/pull/27)
- **DS-23** Slider — design — https://github.com/mikespineu/design-system-wireframe/pull/35
