/** GitHub location of the docs folder, used to resolve relative links of `docs/theming-guide.md`. */
export const GUIDE_DOCS_BASE = 'https://github.com/mikespineu/design-system-wireframe';

const isExternal = (href: string) => /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href);

function resolveHref(href: string): string {
  if (isExternal(href)) return href;
  const clean = href.replace(/^\.\//, '');
  const kind = /(^|\/)$/.test(clean.split('#')[0] ?? '') ? 'tree' : 'blob';
  return `${GUIDE_DOCS_BASE}/${kind}/main/docs/${clean}`;
}

/**
 * Prepares `docs/theming-guide.md` for the Storybook docs page without changing the file, so it keeps
 * working on GitHub: strips the `<!-- sample -->` / `<!-- excerpt -->` HTML comments and rewrites
 * relative links to absolute GitHub URLs, and turns `- [ ]` task-list items into plain bullets (Storybook would render
 * them as unlabelled checkboxes, an axe `label` violation). In-page `#anchor` links and links inside code fences stay as they are.
 */
export function prepareGuideForStorybook(markdown: string): string {
  let inFence = false;
  const out: string[] = [];
  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
    } else if (inFence) {
      out.push(line);
    } else if (!/^\s*<!--.*?-->\s*$/.test(line)) {
      out.push(
        line
          .replace(/^(\s*)([-*+])\s+\[[ xX]\]\s+/, '$1$2 ')
          .replace(/<!--.*?-->/g, '')
          .replace(/(\[[^\]]*\])\(([^)\s]+)\)/g, (_m, text: string, href: string) => `${text}(${resolveHref(href)})`),
      );
    }
  }
  return out.join('\n');
}
