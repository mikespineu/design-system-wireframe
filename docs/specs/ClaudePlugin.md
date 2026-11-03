# Claude Code consumer plugin

- task: DS-50
- canvas: none (decision record, no UI)
- approved: yes
- approved_by: mikespin
- approved_at: 2026-11-03
- approval_hash:
- status: approved

This is a decision record, not a component spec. It fixes the scope, names, layout and version policy of the consumer Claude Code plugin so that DS-51 to DS-57, DS-59, DS-60 and DS-10 can build against one source of truth. Verified facts are marked with the date they were checked (2026-11-03). Anything not verified is marked "to confirm in DS-57" (or the task named).

## Scope

A Claude Code plugin for people who **use** the design system in their own app. It is separate from the `factory` plugin, which is the maintainers' tool for building the system and stays in this repo only.

| Kind | Name (invoked as) | One-line purpose | Ships in |
| --- | --- | --- | --- |
| Skill | `component-usage` (`/wireframe-ds:component-usage`) | Picks components for a UI need from the manifest and shows correct imports (CSS + components), Field wiring, custom icons and a11y rules; swaps hardcoded colors for `--ds-*` roles. | DS-53 |
| Skill | `theme` (`/wireframe-ds:theme`) | Guides a consumer through a custom theme: raw values, `createTheme()`, `checkContrast()`, registering the theme, saving it to `ds.theme.json`. | DS-10 (uses DS-60 file and CLI, DS-55 tools) |
| Agent | `ui-review` | Reviews a consumer's UI code for design-system misuse: hardcoded colors or spacing, hand-rolled primitives the DS already ships, missing labels, wrong Field wiring. | DS-54 |
| MCP tool | `list_components` | Lists every exported component with a short description and Radix primitive. | DS-55 |
| MCP tool | `get_component` | Returns one component's props, spec path and a usage example. | DS-55 |
| MCP tool | `list_tokens` | Lists the `--ds-*` role tokens with their purpose. | DS-55 |
| MCP tool | `search` | Finds components and tokens by a plain-language need. | DS-55 |
| MCP tool | `get_theme` | Reads the consumer's saved theme from `ds.theme.json`. | DS-55 (file format: DS-60) |
| MCP tool | `save_theme` | Validates and writes the consumer's theme to `ds.theme.json`. | DS-55 (file format: DS-60) |

Supporting pieces (not plugin components, but the plugin depends on them):

| Piece | Purpose | Ships in |
| --- | --- | --- |
| `dist/manifest.json`, exported as `./manifest.json` | Generated list of components, props, spec paths, Radix primitives and `--ds-*` roles; the data behind the skills, agent and MCP tools. | DS-51 |
| `ds.theme.json` + `npx @mikespineu/design-system theme build` | The consumer's saved theme and the CLI that validates it and writes `theme.css`. | DS-60 |
| Scoped npm package | The library itself. | DS-59 |

Out of scope: a `factory` skill or command in the consumer plugin, hooks, LSP servers, and any remote (hosted) MCP server.

## Names

| What | Decision | Rationale |
| --- | --- | --- |
| Plugin `name` | `wireframe-ds` | Official directory rules make `name` an immutable slug and want a distinctive product name, not a reserved word (`claude`, `anthropic`, `official`, `plugin`, `mcp`, `test`) or a lookalike of another listing. "Wireframe" is this system's look (see `docs/specs/Theming.md`); `-ds` keeps it clear this is the design system. Skills are namespaced `wireframe-ds:<skill>`. `displayName` ("Wireframe Design System") can change later; `name` cannot. Name uniqueness in the directory is checked by the portal: to confirm in DS-57. |
| MCP server key in `.mcp.json` | `wireframe-ds` | Same slug, so tools appear as `mcp__plugin_wireframe-ds_wireframe-ds__*`; one name to remember. |
| Marketplace `name` | `wireframe-ds` | Install line reads `/plugin install wireframe-ds@wireframe-ds`. Not on Anthropic's reserved marketplace names list (list: see links): to re-check in DS-52 with `claude plugin validate`. |
| Scoped npm package | `@mikespineu/design-system` | Matches the GitHub owner `mikespineu` and the repo's trusted-publisher setup in `RELEASING.md`. `npm view @mikespineu/design-system` returned E404 (free) on 2026-11-03; so did `@mikespineu/ds` and the unscoped `design-system-wireframe`. A 404 on one package name does not prove the `@mikespineu` scope exists or is owned by us: the owner must create or confirm the npm user/org `mikespineu` in DS-59 before the first publish. If the scope is unavailable, fall back to `@mikespin/design-system`; this spec is then amended. |
| Current name `design-system-test` | Replaced in DS-59 | Taken on npm (see `RELEASING.md`). |

## Marketplace

The consumer plugin has **its own marketplace**. `factory` is not listed in it and `wireframe-ds` is not listed in the factory marketplace.

Today the repo root `.claude-plugin/marketplace.json` is the factory marketplace (`design-system-factory`, lists only `factory`). Claude Code reads a GitHub marketplace from the repo root, so the root file is the only location users can add with `/plugin marketplace add mikespineu/design-system-wireframe`. Decision:

1. The root `.claude-plugin/marketplace.json` becomes the **consumer marketplace** `wireframe-ds` and lists only `wireframe-ds` (source `./plugins/wireframe-ds`).
2. The factory marketplace **moves** to `factory/.claude-plugin/marketplace.json`, keeps its name `design-system-factory`, lists only `factory` (source `./plugin`), and is added locally with `/plugin marketplace add ./factory`.
3. DS-52 makes the move and updates every reference found by `grep design-system-factory` (today: `.claude/settings.json`, `docs/factory/README.md`, `docs/factory/design.md`), and CI fails if `factory` appears in the root marketplace.

Rationale: a second marketplace in a subfolder would not be addable from GitHub, and listing both plugins in one marketplace would put maintainer tooling in front of consumers.

## Folder layout

The directory requires the plugin folder (the one holding `.claude-plugin/plugin.json`) to be self-contained: everything the plugin runs must be inside it, at most 512 files, every non-image file under 256 KiB, no symlinks, no `.npmrc`. The MCP server is therefore a single committed bundle.

```
.claude-plugin/
  marketplace.json            # consumer marketplace "wireframe-ds" (root; no factory)
plugins/
  wireframe-ds/               # plugin folder (what is submitted to the directory)
    .claude-plugin/
      plugin.json             # name, version, description, author, homepage, keywords, license
    skills/
      component-usage/SKILL.md   # DS-53
      theme/SKILL.md             # DS-10
    agents/
      ui-review.md               # DS-54
    .mcp.json                 # declares the wireframe-ds MCP server (DS-55)
    mcp/
      server.mjs              # single-file bundle, committed, < 256 KiB (DS-55)
      manifest.json           # snapshot of dist/manifest.json, fallback only (DS-51, DS-56)
    README.md                 # at least 40 words outside code blocks (DS-56)
    LICENSE                   # MIT, same as the package
mcp-server/                   # source of the MCP server (DS-55), not shipped in the plugin
  src/
factory/
  .claude-plugin/marketplace.json   # factory marketplace (moved by DS-52)
  plugin/                           # existing factory plugin, unchanged
```

Rules:

- Skills, agents and the MCP server read component data from the **consumer's installed** `@mikespineu/design-system/manifest.json` (resolved from the consumer project), so answers always match the installed version. The snapshot at `mcp/manifest.json` is only a fallback when the package is not installed.
- The bundle is generated (esbuild or similar, already in the Vite toolchain: to confirm in DS-55) and committed, because the plugin is installed from git with no build step.

## How the MCP server is launched

No extra install and no `npx` launcher. `.mcp.json`:

```json
{
  "mcpServers": {
    "wireframe-ds": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/mcp/server.mjs"]
    }
  }
}
```

Why: the directory validation holds or blocks `npx`/`uvx` launchers unless pinned to an exact version, flags `npm run`, `-c` inline programs and shells, and holds a `package.json` + lockfile in the plugin folder. `node ${CLAUDE_PLUGIN_ROOT}/<file>` with plain arguments is the form it documents as accepted, and it needs only Node, which Claude Code users already have. The bundle has zero runtime dependencies. The server works in the consumer's current directory: `get_theme` and `save_theme` read and write `./ds.theme.json` there (format and validation shared with the DS-60 CLI). It speaks MCP over stdio and makes no network calls. `save_theme` is the only tool that writes, and it writes only `ds.theme.json`.

## Version policy

- **Single source of truth: the `version` in `package.json`**, bumped only by Changesets (`npm run version-packages`, DS-9; see `RELEASING.md`). One version number covers the npm package and the plugin; they are released together.
- `plugins/wireframe-ds/.claude-plugin/plugin.json` carries the same `version`. The "Version Packages" PR from `changesets/action` also rewrites that field (and regenerates `mcp/server.mjs` and `mcp/manifest.json`) through a script chained after `changeset version` in `npm run version-packages`. DS-56 implements it.
- The marketplace entry in the root `marketplace.json` does **not** repeat a version so there is one place to sync (how Claude Code resolves a version set in both places: to confirm in DS-52 against the marketplace reference).
- A CI check (DS-52, extended by DS-56) fails when `plugin.json` `version` differs from `package.json` `version`, or when the committed bundle is out of date.
- Claude Code updates an installed plugin only when `version` changes, and the directory wants `version` raised every release, so every release (even docs-only changes to the plugin) goes through a changeset.
- Semver follows the package: a breaking change to a skill, tool name or `ds.theme.json` format is a major bump. The plugin `name` never changes.
- The plugin works with the same or newer minor of the package it shipped with; the skills tell users to upgrade the package when the manifest is older than the plugin.

## Anthropic marketplace submission requirements

Submission goes through the developer portal (not a pull request). Checked 2026-11-03.

Account and process (DS-57, needs a human):

- A claude.ai account on a paid plan (Pro, Max, Ultra, Team or Enterprise); free accounts cannot submit; on Team and Enterprise the role must be an Owner or have the Directory permission. [Publish to the directory](https://claude.com/docs/directory/publish)
- A GitHub repository with the plugin, GitHub account connected on claude.ai, push access checked; the repo may be private while validating but must be public before the listing goes live. Each plugin folder is its own submission, entered as repository + plugin path (`plugins/wireframe-ds`) + tracked branch or tag. [Submit your plugin](https://claude.com/docs/plugins/submit)
- Submit from the organization that should own the listing long term (first organization to submit a repo folder holds it).
- Compliance with the [Software Directory Terms](https://support.claude.com/en/articles/13145338-anthropic-software-directory-terms) and [Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy). Review: automated validation and security scan on every version, a person reviews the new listing. The `https://clau.de/plugin-directory-submission` link in the official repo README now redirects to the publish page above.
- Our MCP server is local (bundled), so it ships inside the plugin bundle. There is no remote server, so no separate MCP connector submission is needed. Local servers packaged as MCPB/desktop extensions are not accepted; ours is a plain `command` + `args`.

Automated checks (full table: [Plugin pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist)); what this means for us:

| Requirement | Our plan | Task |
| --- | --- | --- |
| Plugin folder contains `.claude-plugin/plugin.json`; everything it runs is inside it; no symlinks, submodules, LFS, `.DS_Store` | Layout above | DS-52 |
| `name`: lowercase letters, digits, hyphens, up to 64 chars; distinctive; not reserved or taken; not look-alike of another listing or brand | `wireframe-ds`; portal "Validate" confirms | DS-52, DS-57 |
| `description`, `author`, `version` set | In `plugin.json`, version synced | DS-52, DS-56 |
| README of at least 40 words (outside code blocks) in the plugin folder | `plugins/wireframe-ds/README.md` | DS-56 |
| `LICENSE` file in the plugin folder or `license` in `plugin.json` | Both (MIT) | DS-52 |
| Non-image files under 256 KiB; at most 512 files; only text, SVG, PNG, JPEG, GIF, WebP and fonts | MCP bundle and manifest snapshot kept under the limit (measure in DS-55; if the snapshot is too large, drop it and require the installed package) | DS-55 |
| Local MCP server started as `node ${CLAUDE_PLUGIN_ROOT}/...` with plain arguments; `.mcp.json` valid JSON | See launch section | DS-55 |
| No unpinned `npx`/`uvx` launcher; no `.npmrc` or other registry config; no `package.json` + lockfile in the plugin folder | None used; the DS-60 CLI is documented for consumers but never launched by the plugin | DS-55 |
| No real credentials anywhere; credentials only via `userConfig` with `sensitive: true` | None needed | DS-55 |
| Valid YAML front matter with a text `description` in every skill and agent; exact folder names (`skills/`, `SKILL.md`, `agents/`) | Per layout | DS-53, DS-54, DS-10 |
| Listing assets: description and a preview image taken from the All components canvas | Image must be PNG/JPEG/GIF/WebP, under the repo and file limits | DS-57 |
| Optional local pre-check: `claude plugin validate ./plugins/wireframe-ds` | Added to the CI job | DS-52 |

Reviewer-held (allowed but slows review): a bundled `server.mjs` that the validator cannot read through is held for a person, because the plugin folder is a subfolder of the repo; keep it a single self-contained file and expect a hold ("Bundled MCP server not inspected" / "MCP server command wasn't read" are the documented finding names). To confirm in DS-57.

Not verified: `https://claude.ai/settings/plugins/submit` returned 403 to a script (no such page needed; the portal is `https://claude.ai/directory/manage`, which needs login and was not opened). Exact portal fields and any listing-image size rules: to confirm in DS-57.

## Reference links (all resolved on 2026-11-03)

- Create plugins: https://code.claude.com/docs/en/plugins
- Plugin marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
- Plugins reference (manifest, `${CLAUDE_PLUGIN_ROOT}`): https://code.claude.com/docs/en/plugins-reference
- Official directory repo: https://github.com/anthropics/claude-plugins-official
- Publish to the directory: https://claude.com/docs/directory/publish
- Pre-submission checklist: https://claude.com/docs/plugins/pre-submission-checklist
- Submit your plugin: https://claude.com/docs/plugins/submit
- Marketplace reserved names: https://code.claude.com/docs/en/plugins/marketplace-reference#reserved-names

## Open questions

- Is the npm scope `@mikespineu` owned by the maintainer? (DS-59, human)
- Does the directory accept the committed bundle without a hold, and is the plugin `name` free? (DS-57)
- Should the plugin be listed only in our marketplace first, and submitted to Anthropic after a first public release? Proposed: yes; DS-57 already depends on DS-59.
