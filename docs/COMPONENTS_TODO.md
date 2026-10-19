# Component build plan

Source of truth: `docs/mono-design-system/Components.dc.html` (visual spec, sections 01–06), `docs/mono-design-system/README.md` (tokens, Tailwind utilities), `src/styles/tokens.css`.
Rules: `CLAUDE.md` (worktrees, Radix for interaction, `--ds-*` tokens, story + test + jest-axe per component).

## How agents use this file

1. Pick the first unchecked task whose **Deps** are all merged to `main`. Skip tasks already claimed.
2. Claim it: replace `—` in **Owner** with your agent name and open a one-line PR to `main` containing only that edit, or ask the user to do so. Do not start before the claim is on `main`.
3. `git worktree add .worktrees/feat-<name> -b feat/<name> main`, then `npm ci`.
4. Open the spec section in `Components.dc.html` and match every state shown (Default / Hover / Focus / Disabled / Error ...).
5. Build to the Definition of Done below. One component per PR, one PR per worktree.
6. In the same PR, tick the box here. Remove the worktree after merge.

## Definition of done (every component)

- `src/components/<Name>/{<Name>.tsx, <Name>.stories.tsx, <Name>.test.tsx, index.ts}`; exported from `src/index.ts`.
- Built on a Radix primitive where the **Radix** column names one (import from `radix-ui`); wrapped in a typed API, refs and rest props forwarded.
- Styled only with tokens / Tailwind utilities from the README: 0 radius, no shadows, 1 px borders, 44 px control height, `focus-visible:focus-ring`, no hue. Severity by border weight, fill, icon; never color.
- Story per state in the spec, plus keyboard / open-closed stories for Radix components. Autodocs on.
- Tests: render, variants, interaction via `userEvent` (keyboard too), disabled, `jest-axe` clean. Coverage stays >= 80%.
- `npm run lint && npm run typecheck && npm test` pass (the pre-push hook enforces lint + tests).
- PR title `feat: add <Name>`; description links the spec section.

## Phase 0: foundations (sequential, land first)

| ✓ | ID | Task | Deps | Owner | Notes |
|---|----|------|------|-------|-------|
| [ ] | F1 | Test infra: stubs in `jest.setup.ts` for `ResizeObserver`, `PointerEvent`/pointer capture, `scrollIntoView`, `matchMedia` | — | — | Needed by every Radix component. Verify with a throwaway Dialog test. |
| [ ] | F2 | `Icon` + icon set used in spec (arrow, check, info, alert, close, search, chevron, image/landscape) | — | — | Inline SVG, `currentColor`, 16/20/24 sizes, `aria-hidden` unless labeled. Everything below uses it. |
| [ ] | F3 | Rework existing `Button` to spec (see C1) | F1 | — | Existing one is a placeholder (primary/secondary only, old CSS). |

## Phase 1: parallel components (one agent each, one worktree each)

### 01 Buttons
| ✓ | ID | Component | Radix | Deps | Owner | Spec notes |
|---|----|-----------|-------|------|-------|-----------|
| [ ] | C1 | Button (primary, secondary, ghost) | `Slot` (`asChild`) | F3 | — | States: default, hover, focus, disabled. Primary = black, hover gray-800. Mono font. |
| [ ] | C2 | IconButton | `Slot` | F2, C1 | — | Square 44 px, `aria-label` required (type-enforced). |

### 02 Inputs
| ✓ | ID | Component | Radix | Deps | Owner | Spec notes |
|---|----|-----------|-------|------|-------|-----------|
| [ ] | C3 | Field + Input (label, hint, error) | `Label` | F2 | — | Establishes the form-field pattern: states default / focus / error (icon + message, heavier border) / disabled. `aria-invalid`, `aria-describedby`. |
| [ ] | C4 | Textarea ("Message") | `Label` | C3 | — | Reuses Field. |
| [ ] | C5 | SearchInput | — | C3, F2 | — | Input with leading search icon. |
| [ ] | C6 | Select ("Plan") | `Select` | C3, F2, F1 | — | Trigger styled as Input; popover list, keyboard typeahead, square corners. |

### 03 Selection
| ✓ | ID | Component | Radix | Deps | Owner | Spec notes |
|---|----|-----------|-------|------|-------|-----------|
| [ ] | C7 | Checkbox (+ label, group) | `Checkbox` | F2, F1 | — | Checked / unchecked / indeterminate / disabled. |
| [ ] | C8 | RadioGroup | `RadioGroup` | F1 | — | Arrow-key navigation, roving tabindex. |
| [ ] | C9 | Switch | `Switch` | F1 | — | Label left, e.g. "Notifications". |
| [ ] | C10 | Tag / Badge | — | F2 | — | Text tags ("New", "Draft", "Archived"), icon tag ("landscape"), count badge ("12"). Variants by border/fill, not color. |

### 04 Navigation
| ✓ | ID | Component | Radix | Deps | Owner | Spec notes |
|---|----|-----------|-------|------|-------|-----------|
| [ ] | C11 | Tabs | `Tabs` | F1 | — | Grid / List / Map. Active = black underline/ink. |
| [ ] | C12 | Breadcrumb | — | F2 | — | `<nav aria-label>` + `<ol>`, `/` separators, last item `aria-current="page"`. |
| [ ] | C13 | Pagination | — | C2, F2 | — | Prev / next icon buttons + page numbers, `aria-current`. |
| [ ] | C14 | NavBar (header) | `NavigationMenu` | C1 | — | Wordmark "MONO/00" + links (Work, Archive, Journal, About, Contact). Mobile collapse optional follow-up. |

### 05 Cards & feedback
| ✓ | ID | Component | Radix | Deps | Owner | Spec notes |
|---|----|-----------|-------|------|-------|-----------|
| [ ] | C15 | Card (default, inverse) | `Slot` | C1 | — | Monochrome image slot (`photo` utility), mono label, title, body, link CTA. Inverse = gray-900 surface. |
| [ ] | C16 | Alert / Notice (info, success, error) | — | F2 | — | `role="status"` / `role="alert"` for error. Severity by icon + border weight. |
| [ ] | C17 | Toast (with Undo action) | `Toast` | F1, C1 | — | Provider + `useToast`. Action slot, dismiss, swipe, timer pause on hover/focus. |

### 06 Data
| ✓ | ID | Component | Radix | Deps | Owner | Spec notes |
|---|----|-----------|-------|------|-------|-----------|
| [ ] | C18 | Table | — | C10 | — | Semantic `<table>`, `scope="col"`, 1 px dividers, status column uses Tag. Optional sortable header follow-up. |

## Phase 2: after Phase 1

| ✓ | ID | Task | Deps | Owner | Notes |
|---|----|------|------|-------|-------|
| [ ] | P1 | Primitives not in spec but implied by Radix rule: Dialog, Tooltip, DropdownMenu, Popover | F1, C1 | — | Only if a consumer needs them; confirm with the user first. |
| [ ] | P2 | Storybook: Foundations docs page (color, type, spacing, shape, photo) and a composed "Kitchen sink" page | all C* | — | MDX in `src/**`. |
| [ ] | P3 | Public API audit: `src/index.ts` exports, types, `package.json` `exports`, build config | all C* | — | |
| [ ] | P4 | Visual regression (Chromatic is already installed) | P2 | — | Needs a Chromatic project token from the user. |

## Parallelism map

- Start immediately: F1, F2. (F3 after F1.)
- After F2: C3, C7, C8, C9, C10, C11, C12, C16 can all run in parallel.
- After C1: C2, C14, C15, C17. After C3: C4, C5, C6. After C2: C13. After C10: C18.
- Suggested cap: 4–5 agents at once. Merge conflicts to expect: `src/index.ts` (append-only, resolve by keeping both lines) and this file.

## Open questions for the user

1. Is the spec's `[Short description of the series.]` / `[DATE]` placeholder copy meant to stay as story fixtures?
2. Mobile / responsive behavior is not in the spec. Define it, or desktop-only for now?
3. Dark mode: none in the spec (inverse surface only). Skip?
