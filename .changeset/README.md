# Changesets

Every user-facing change gets a changeset: run `npm run changeset`, pick the
bump type (patch/minor/major), write a short summary and commit the generated
file with your PR. On merge to `main` the Release workflow opens a
"Version Packages" PR that bumps the version and updates `CHANGELOG.md`.

See `RELEASING.md` at the repo root for the full release setup.
