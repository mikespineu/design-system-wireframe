# wireframe-ds

Claude Code plugin for people who use the Wireframe design system in their own app. This is the scaffold: skills, the UI-review agent and the MCP server are added in later releases. See `docs/specs/ClaudePlugin.md` for the scope and layout.

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
