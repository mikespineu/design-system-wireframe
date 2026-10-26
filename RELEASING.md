# Releasing

Status: PROPOSAL. The release workflow is merged but inert until a human
completes the steps below and sets `NPM_PUBLISH_ENABLED=true`.

## How it works

1. Contributors add a changeset (`npm run changeset`) in their PR.
2. On push to `main`, `.github/workflows/release.yml` runs lint, typecheck and
   tests, then `changesets/action` opens/updates a "Version Packages" PR
   (version bump + `CHANGELOG.md`).
3. Merging that PR runs `npm run release` (build + `changeset publish`), which
   publishes to npm with provenance using OIDC trusted publishing. No
   long-lived `NPM_TOKEN` exists.

The job only runs on `mikespineu/design-system-wireframe` and only when the
repository variable `NPM_PUBLISH_ENABLED` is `'true'`.

## One-time setup (human)

1. TODO: choose a free package name, preferably scoped (e.g. `@your-scope/design-system`).
   The current name `design-system-test` is TAKEN on npm. Update `name` in `package.json`.
2. TODO: confirm the license. `package.json` currently says MIT and `LICENSE` exists; verify this is intended.
3. Do a first manual publish (a package must exist before a trusted publisher can be configured):
   `npm login && npm run build && npm publish --access public`
4. On npmjs.com open the package, Settings, Trusted Publisher, GitHub Actions:
   organization/user `mikespineu`, repository `design-system-wireframe`,
   workflow filename `release.yml` (no environment unless you add one).
5. In GitHub repo Settings, Actions, General: allow workflows read/write
   permissions and "Allow GitHub Actions to create pull requests".
6. In Settings, Secrets and variables, Actions, Variables: add
   `NPM_PUBLISH_ENABLED` = `true`.

Trusted publishing requires npm >= 11.5.1 (the workflow upgrades npm) and a
GitHub-hosted runner.
