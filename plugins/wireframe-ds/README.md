# wireframe-ds

Claude Code plugin for people who use the Wireframe design system in their own app. This is the scaffold: skills and the MCP server are added in later releases. See `docs/specs/ClaudePlugin.md` for the scope and layout.

## UI-review agent

The `ui-review` agent audits UI code for design-system misuse and reports `file:line`, a rule and a fix. It runs `scripts/ui-review.cjs`, a dependency-free checker whose component, prop, Radix and token knowledge comes from the installed design system's `manifest.json` (`design-system-test` today, `@mikespineu/design-system` after the rename; pass `--manifest` if it is not installed). Rules: `hardcoded-color`, `hardcoded-spacing`, `hand-rolled-primitive`, `direct-radix-import`, `missing-label`, `missing-required-prop`, `field-wiring`. Try it directly with `node plugins/wireframe-ds/scripts/ui-review.cjs src/`.

## Install

```
/plugin marketplace add mikespineu/design-system-wireframe
/plugin install wireframe-ds@wireframe-ds
```

## Manual check from a local path

Run this from a clone of the repository whenever the manifests change. The `factory` plugin is not in this marketplace.

1. `claude plugin validate .` and `claude plugin validate ./plugins/wireframe-ds` both print "Validation passed".
2. In Claude Code, run `/plugin marketplace add ./`. The marketplace `wireframe-ds` is added and lists one plugin, `wireframe-ds`.
3. Run `/plugin install wireframe-ds@wireframe-ds`. The plugin shows as installed and enabled in `/plugin`.
4. Clean up with `/plugin uninstall wireframe-ds@wireframe-ds` and `/plugin marketplace remove wireframe-ds`.

The factory marketplace is added separately with `/plugin marketplace add ./factory`.
