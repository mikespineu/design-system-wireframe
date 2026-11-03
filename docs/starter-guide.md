# Starter guide

How to start your own design system from this repository: click "Use this template", rename the package, make your own theme the default, decide which parts of the repository you keep, set up (or switch off) the GitHub workflows, and end with a green build. Every command and file name here was run or read in this repository; the deletion results in step 5 were checked by deleting each item and running the commands.

The target is this one line passing on your copy:

```bash
npm ci && npm run lint && npm run typecheck && npm test && npm run build-storybook
```

- [1. Create your repository](#1-create-your-repository)
- [2. Get a green baseline](#2-get-a-green-baseline)
- [3. Rename the package](#3-rename-the-package)
- [4. Make your theme the default](#4-make-your-theme-the-default)
- [5. Decide what to keep](#5-decide-what-to-keep)
- [6. Set up or disable the workflows](#6-set-up-or-disable-the-workflows)
- [7. Finish with a green build](#7-finish-with-a-green-build)

If you only want to use the components in an app, you do not need this guide: see the [consumer guide](consumer-guide.md).

## 1. Create your repository

1. On the GitHub page of this repository, click **Use this template**, then **Create a new repository**. Pick an owner and a name, and choose public or private.
2. Clone your new repository and use Node 22 (the version the workflows use).

"Use this template" copies the files of the default branch as one fresh commit. It does not copy the history, issues, branch protection, secrets, variables or environments. The workflows in `.github/workflows/` come along, but anything they need from repository settings does not (step 6).

## 2. Get a green baseline

Before you change anything, check that your copy builds:

```bash
npm ci && npm run lint && npm run typecheck && npm test && npm run build-storybook
```

`npm ci` also installs the Husky `pre-push` hook (`npm run prepare`). The hook runs `npm run lint && npm test` before each push. Keep it; do not skip it with `--no-verify`.

If the baseline is not green, stop and fix that first, so every later failure is yours.

## 3. Rename the package

The package name `design-system-test` is taken on npm by an unrelated package, and the repository URL in `package.json` points at the template. Change both.

1. In [`package.json`](../package.json) set `"name"` (a scoped name such as `@your-scope/design-system` is the safest) and `"repository"`:

   ```json
   "name": "@your-scope/design-system",
   "repository": {
     "type": "git",
     "url": "git+https://github.com/your-owner/your-repo.git"
   }
   ```

   Also set `"version"` to where you want to start, and replace the copyright holder in [`LICENSE`](../LICENSE) (and `"license"` in `package.json` if you do not want MIT).

2. The old name is also written in files that must agree with `package.json`. Replace it everywhere except the template's own history (`roadmap.md`, `factory/jobs/`) and this guide. On macOS, with your new name in place of `@your-scope/design-system`:

   ```bash
   git grep -l design-system-test -- . ':!factory/jobs' ':!roadmap.md' ':!docs/starter-guide.md' \
     | xargs sed -i '' 's#design-system-test#@your-scope/design-system#g'
   ```

   On Linux use `sed -i` without the empty `''`. This touches, among others:

   | File | Why it matters |
   | --- | --- |
   | [`jest.config.cjs`](../jest.config.cjs) | `moduleNameMapper` maps the package name to `src/index.ts` for tests |
   | [`tsconfig.json`](../tsconfig.json) | `paths` maps the package name to `src/index.ts` for the type checker |
   | `docs/theming-guide/` and `docs/theming-guide.md` | The sample code imports from the package name; a test keeps the guide and the samples in sync |
   | [`docs/consumer-guide.md`](consumer-guide.md) | `src/docs/consumerGuide.test.ts` checks that every import in the guide uses the name in `package.json` |
   | `package-lock.json` | Its top two `"name"` entries |

   If you only edit `package.json`, `npm test` fails in `src/docs/consumerGuide.test.ts`. If you edit the files above but not `jest.config.cjs` or `tsconfig.json`, the sample imports stop resolving.

3. Delete the pending changesets in `.changeset/` (every `.md` file except `README.md`). They describe changes of the template, not of your package, and would end up in your first changelog and version bump. Add your own with `npm run changeset` when you change something.

4. Update the repository guard and name in the release workflow and in [`RELEASING.md`](../RELEASING.md) (step 6).

The replace also rewrites the Install section of `docs/consumer-guide.md`, which explains why the old name must not be installed from npm. Rewrite that section for your package, but know that `src/docs/consumerGuide.test.ts` ("consumer guide install") requires the section to contain the phrases `Use this template`, `npm run build`, `npm pack` and `starter-guide.md`, and not to tell readers to `npm install design-system-test`. Either keep those four phrases in your rewrite, or change that test (or delete its "explains today's options" case) in the same commit; otherwise `npm test` stays red. The rename was checked with the name `@acme/ds`: after the replace above and the `repository` change, `npm ci --dry-run`, lint, typecheck, `npm test` and `npm run build-storybook` all pass.

## 4. Make your theme the default

A theme is a block of semantic roles (`--ds-color-*`, `--ds-font-*`, `--ds-radius-*` and so on). The built-in default theme is the gray Wireframe look; your theme replaces it, so components, Storybook and consumers see it without any `data-theme` attribute.

### 4.1 Generate your theme

Follow the [Create your own theme guide](theming-guide.md): choose a brand color, neutrals, fonts, radius and shadow ([step 1](theming-guide.md#step-1-choose-your-values)), run `createTheme()` ([step 3](theming-guide.md#step-3-generate-the-data-theme-block)), add an override block for roles it does not design ([step 4](theming-guide.md#step-4-add-an-override-block)), and check contrast with `checkContrast()` ([step 5](theming-guide.md#step-5-check-contrast-with-checkcontrast)). Make a light and a dark version ([step 6](theming-guide.md#step-6-ship-light-and-dark)). You end with the values of your light theme and of your dark theme for all 87 roles.

### 4.2 Put the values into `tokens.css`

Open [`src/styles/tokens.css`](../src/styles/tokens.css). The whole file is inside `@layer ds`. Two blocks matter:

- `:root, [data-theme="default"] { ... }` is the default theme. It holds the raw palette first (`--ds-color-gray-*`, not part of the theme contract) and then the roles. Replace the value of every role you changed with your light value. Keep the selector as it is: a test checks it, and `:root` is what makes the theme apply with no attribute.
- `[data-theme="dark"] { ... }` is the dark theme (color roles, `--ds-color-ink` and `--ds-photo-filter`). Replace the color values with your dark ones.

Do not make your theme the default by adding `:root` to a separate, unlayered block (for example `:root, [data-theme="acme"] { ... }` in your own CSS file). Unlayered CSS beats `@layer ds`, so that block would also win over the `dark` block and dark mode would stop working.

Fonts are values here too (`--ds-font-heading`, `--ds-font-body`, `--ds-font-label`, `--ds-font-mono`), but the font files are not loaded by the token file. Load yours as described in [step 7 of the theming guide](theming-guide.md#step-7-load-the-fonts). [`src/styles/fonts.css`](../src/styles/fonts.css) loads Red Hat Mono and Red Hat Text for the old default look, and `src/styles/tokens.test.ts` expects those two families in it, so change that file and that test together if you replace the fonts.

After this edit the repository is not green until you update what pins the old default values:

| What fails | Why | Fix |
| --- | --- | --- |
| `src/styles/tokens.test.ts`, two tests in the "cascade layer" group | They assert the old default and dark values (`var(--ds-color-white)`, `var(--ds-color-gray-900)`, `var(--ds-color-gray-800)`) | Change the expected values to yours |
| `src/test/canvasBoards.test.ts`, "carries one token block identical to tokens.css" for every board | Every canvas in `docs/design-system-wireframe/` carries a copy of `tokens.css` between `/* ds-tokens:start */` and `/* ds-tokens:end */` | Delete the canvases and the two canvas tests (step 5), or paste the new `tokens.css` into each board |
| `src/theme/createTheme.test.ts`, "matches the non-color defaults in tokens.css" | The test compares the font weights, type scale and shape values that `createTheme()` emits (`src/theme/defaults.ts`) with the `:root` block. It fails as soon as you put your own non-color values (the weights, type scale and shape from the override block of [theming guide step 4](theming-guide.md#step-4-add-an-override-block)) into `:root` | Put the same values into `fontWeightDefaults`, `typeScaleDefaults` and `shapeDefaults` in `src/theme/defaults.ts`, then run `npm run themes:generate` to rewrite `src/themes/bold.css`, which is built from those defaults (until you do, `src/themes/bold.test.tsx` "shipped bold.css equals the generator output" and `docs/theming-guide/theming-guide.test.ts` "the worked example rebuilds bold from its spec input" fail on the stale file). If you changed a role that the bold demo theme does not override itself (for example `--ds-focus-offset`), `src/themes/bold.test.tsx` fails after regeneration, because it pins bold to the old value: the "bold role values match the spec › --ds-focus-offset" and "bold-dark role values match the spec › --ds-focus-offset" cases (one per changed role) and "components under the bold themes › draws the focus ring from the focus roles, which both themes set to 3px / 2px" (focus width and offset only). Change the matching expected values in `bold.test.tsx` (the `shared` table at the top, and the focus ring case), or delete the `createTheme.test.ts` case if you do not want the generator defaults tied to `tokens.css` |
| `src/styles/tokens.test.ts`, "contrast in the default theme" and "contrast in the dark theme" | They check the text pairs (4.5:1) and the interface pairs (3:1) on the resolved light and dark values. They fail when one of your values misses its ratio, for example a `text-muted` that is too pale on your `background` | Fix the value (see [step 5 of the theming guide](theming-guide.md#step-5-check-contrast-with-checkcontrast)). Do not relax the test |
| `src/themes/bold.test.tsx`, "the shipped dark block in tokens.css (var() refs resolved against :root) passes checkContrast()" | It resolves the `var()` references of the `dark` block against `:root` and runs `checkContrast()` on the result. It fails when your dark values, or the `:root` values they refer to (for example a changed `--ds-color-gray-*`), miss a required pair | Run `checkContrast()` on your dark theme, as in the theming guide, and fix the values it reports |

### 4.3 The Storybook theme list

Storybook's toolbar list is `storybookThemes` in [`.storybook/themes.ts`](../.storybook/themes.ts). Its keys are the labels in the toolbar and its values are `data-theme` values:

```ts
export const storybookThemes = {
  default: 'default',
  dark: 'dark',
  bold: 'bold',
  'bold-dark': 'bold-dark',
}
```

Because `default` points to `data-theme="default"`, which now reads your edited block, Storybook already opens in your theme and `dark` shows your dark theme. Leave the `default` key and `defaultTheme: 'default'` in `.storybook/preview.tsx` alone: they are the fallback, and `src/test/storybookThemes.test.tsx` checks them.

To list an extra theme next to them (for example a brand variant written as its own `[data-theme="acme"]` block):

1. Save the block as `src/themes/acme.css` and import it in `.storybook/preview.tsx` next to `../src/themes/bold.css`.
2. Add `acme: 'acme'` to `storybookThemes`.
3. Add `'acme'` to the `themes` list at the top of `src/test/storybookThemes.test.tsx`. That test checks the exact list, and renders every story under every theme in it.

These three edits were checked: lint, typecheck, `npm test` and `npm run build-storybook` pass. `bold` and `bold-dark` are opt-in demo themes that only Storybook loads; you can keep them as a worked example. Removing them touches the package exports, `scripts/copy-themes.mjs`, `src/themes/` and their tests, and is not covered here.

## 5. Decide what to keep

The repository holds a design system and also the software factory that built it. The factory, the planning files and the design canvases are not needed to run, test or build the design system. For each item below the item was deleted in a worktree, ran `npm run lint`, `npm run typecheck`, `npm test` and `npm run build-storybook`, and then restored.

| Delete | Lint | Typecheck | `npm test` | Storybook build | Notes |
| --- | --- | --- | --- | --- | --- |
| `factory/` | pass | pass | **fail** | pass | `src/docs/readme.test.ts` checks the skill links in `docs/factory/README.md`. Delete that test file too and `npm test` passes. Also delete the `factory:status` script in `package.json`, which points into it |
| `roadmap.md` | pass | pass | **fail** | pass | `src/docs/readme.test.ts` checks the `roadmap.md` link in `docs/factory/README.md`. Delete that test file too and `npm test` passes. Only the factory reads the file itself |
| `CLAUDE.md` and `AGENTS.md` | pass | pass | **fail** | pass | `src/docs/readme.test.ts` checks the three links to `CLAUDE.md` in `README.md`. Delete that test file too and `npm test` passes. These are instructions for coding agents. Keep them if you work with Claude Code or another agent; edit their rules to match your project |
| `docs/specs/` | pass | pass | **fail** | pass | `docs/theming-guide/theming-guide.test.ts` reads `docs/specs/Themes.md`, and `src/docs/readme.test.ts` checks the links to `docs/specs/` in `README.md` and `docs/claude-design.md`. Delete both test files too and `npm test` passes |
| `docs/design-system-wireframe/` | pass | pass | **fail** | pass | `src/test/canvasBoards.test.ts` and `src/test/canvasBoardsNamedColors.test.ts` read the canvases, and `src/docs/readme.test.ts` checks the canvas links in `docs/claude-design.md`. Delete those three test files too and `npm test` passes |

Deleting all of the following together, `factory/`, `roadmap.md`, `CLAUDE.md`, `AGENTS.md`, `docs/factory/`, `.claude/`, `.claude-plugin/`, `docs/specs/`, `docs/design-system-wireframe/` and the four test files named above (`src/docs/readme.test.ts`, `docs/theming-guide/theming-guide.test.ts`, `src/test/canvasBoards.test.ts`, `src/test/canvasBoardsNamedColors.test.ts`), also passes all four commands.

What else goes with each choice:

- **`factory/`** is the plugin with the `/factory:*` commands. `.claude/settings.json` enables it and `.claude-plugin/marketplace.json` registers it, so delete those two as well. `docs/factory/` documents it. Remove the "How it's built" section of `README.md`, which links to `docs/factory/README.md` and `docs/claude-design.md`.
- **`docs/specs/`** are the approved component specs and the theming contract. `README.md`, `docs/claude-design.md` and several guides link to `docs/specs/`, so fix those links when you delete it. The specs are also useful as written documentation of every component, so consider keeping them.
- **`docs/design-system-wireframe/`** are the design canvases (`*.dc.html`) and their `README.md`. The `README.md` there is the documentation of the token set, and `docs/claude-design.md` links to the canvases, so remove or edit it when you delete them. If you keep the canvases and change `tokens.css`, you have to keep them in sync (step 4.2).
- **Always keep:** `src/`, `.storybook/`, `docs/theming-guide.md` with `docs/theming-guide/` (its samples are type-checked by `npm run typecheck` and run by `npm test`), `docs/consumer-guide.md`, `.husky/`, `.github/workflows/ci.yml`, and the config files in the root.

Coverage is not part of `npm test`. The CI workflow runs `npm test -- --coverage --ci` against an 80 % threshold, so if you delete tests along with code, run `npm run test:coverage` to check it still passes.

## 6. Set up or disable the workflows

There are four workflows in `.github/workflows/`. A workflow's secrets and variables are set in your repository under Settings, Secrets and variables, Actions. You switch a workflow off by deleting its file, or in the Actions tab (pick the workflow, then "Disable workflow"), or with `gh workflow disable <file>`.

| Workflow | Runs on | Needs | If you do nothing | Disable |
| --- | --- | --- | --- | --- |
| [`ci.yml`](../.github/workflows/ci.yml) | Every pull request, and pushes to `main` | Nothing | Works. Runs `npm ci`, `npm run lint`, `npm run typecheck`, `npm test -- --coverage --ci`, `npm run build` and the Icon packaging test | Keep it |
| [`release.yml`](../.github/workflows/release.yml) | Pushes to `main` | The repository variable `NPM_PUBLISH_ENABLED` set to `true`; npm trusted publishing; no `NPM_TOKEN` (see [`RELEASING.md`](../RELEASING.md)). It uses the built-in `GITHUB_TOKEN` | Inert: the job is skipped, with no failure | Delete the file, or leave it inert |
| [`storybook-vercel.yml`](../.github/workflows/storybook-vercel.yml) | Every push to every branch | The repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` | Fails on every push (it builds Storybook, then cannot deploy) | Delete the file, or add the three secrets |
| [`claude-code-review.yml`](../.github/workflows/claude-code-review.yml) | Pull requests from the same repository | The repository secret `CLAUDE_CODE_OAUTH_TOKEN` | The review step cannot authenticate, so the job does not review | Delete the file, or add the secret |

Details that are easy to miss:

- **`release.yml` is inert until `NPM_PUBLISH_ENABLED` is set.** It also checks `github.repository == 'mikespineu/design-system-wireframe'`. In your copy that is false, so it stays inert even when you set the variable. Change that string to `your-owner/your-repo` before you enable it. Publishing needs a package name you own (step 3), a first manual publish, a trusted publisher configured on npmjs.com for the file name `release.yml`, and Actions permission to create pull requests; the steps are in [`RELEASING.md`](../RELEASING.md).
- **`storybook-vercel.yml` fails on every push without the Vercel secrets.** It deploys `main` to production and every other branch to a preview, using the GitHub environments `storybook-production` and `storybook-preview`, which GitHub creates the first time the job runs. Create a Vercel project, then add the three secrets. The root `vercel.json` only turns off Vercel's own Git deployment, so that this workflow is the only thing that deploys.
- **`claude-code-review.yml`** uses the Claude Code action to comment on pull requests. It needs a Claude Code OAuth token; without one, delete the workflow rather than leave a red check on every pull request.

## 7. Finish with a green build

When you have made the choices above, run the full line again from a clean install:

```bash
npm ci && npm run lint && npm run typecheck && npm test && npm run build-storybook
```

Then also run what CI runs and the build that creates the package:

```bash
npm run test:coverage
npm run build
```

If a step fails, the most common causes are:

| Symptom | Cause |
| --- | --- |
| `src/docs/consumerGuide.test.ts` fails | The package name in `package.json` and the imports in `docs/consumer-guide.md` differ, or your rewritten Install section lacks `Use this template`, `npm run build`, `npm pack` or `starter-guide.md` (step 3) |
| Imports of the package name do not resolve in tests or in `npm run typecheck` | `jest.config.cjs` or `tsconfig.json` still holds the old name (step 3) |
| `tokens.test.ts` or `canvasBoards.test.ts` fails after you edit the tokens | Tests pin the old default values (step 4.2) |
| `createTheme.test.ts` fails ("matches the non-color defaults in tokens.css") after you edit the tokens | `src/theme/defaults.ts` still holds the old weights, type scale and shape (step 4.2) |
| A "contrast in the ... theme" test in `tokens.test.ts`, or the dark-block `checkContrast()` test in `bold.test.tsx`, fails after you edit the tokens | One of your light or dark color values misses its contrast ratio (step 4.2) |
| `storybookThemes.test.tsx` fails after you edit `.storybook/themes.ts` | The test lists the themes (step 4.3) |
| `npm test` fails after you delete a folder | A test reads that folder (step 5) |

Commit, push, and open a pull request to see `ci.yml` pass on GitHub. To use the package in an app before it is published, follow the install options in the [consumer guide](consumer-guide.md#install).
