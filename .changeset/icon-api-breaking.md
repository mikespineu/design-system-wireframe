---
'design-system-test': major
---

Icon API rebuilt around `icon: IconComponent` (breaking).

New exports: `createIcon`, `IconProvider`, `useIcon`, and the types `IconComponent`, `IconComponentProps`, `IconRole`, `IconSet`. All icons inside components now come from private default glyphs that you can replace for a subtree with `IconProvider`.

Removed: `Icon`'s `name` prop, the `IconName` type and the built-in icon set. `Icon` `size` now also accepts `'sm' | 'md' | 'lg'`, and its default stroke follows size (2 at 16 px and below, 1.5 above). Alert success and error use stroke 2, and Alert success now draws a circled check.

Migration:

- `<Icon name="x" />` becomes `<Icon icon={X} />`, where `X` is any SVG icon component (Lucide, Tabler, Phosphor, Heroicons) or one made with `createIcon('X', <path d="..." />)`.
- `<IconButton icon="plus" />` becomes `<IconButton icon={Plus} />` (`icon` is now an `IconComponent`).
