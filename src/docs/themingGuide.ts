/** GitHub location of the docs folder, used to resolve relative links of `docs/theming-guide.md`. */
export const GUIDE_DOCS_BASE = 'https://github.com/mikespineu/design-system-test';

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
 * relative links to absolute GitHub URLs. In-page `#anchor` links and links inside code fences stay as they are.
 */
export function prepareGuideForStorybook(markdown: string): string {
  let inFence = false;
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line
        .replace(/^\s*<!--.*?-->\s*$/, '')
        .replace(/<!--.*?-->/g, '')
        .replace(/(\[[^\]]*\])\(([^)\s]+)\)/g, (_m, text: string, href: string) => `${text}(${resolveHref(href)})`);
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}
