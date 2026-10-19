import { cloneElement, forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactElement } from 'react';
import { Slot } from 'radix-ui';
import { cx } from '../../lib/cx';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last item (current page); items without href render as plain text. */
  href?: string;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: BreadcrumbItem[];
  /**
   * Render links with your router's component. Return an element without children,
   * e.g. `(item) => <RouterLink to={item.href!} />`; the label and link styling are merged in.
   */
  renderLink?: (item: BreadcrumbItem) => ReactElement;
}

export interface BreadcrumbLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Render the child element (e.g. a router link) with breadcrumb link styling. */
  asChild?: boolean;
}

const linkClass =
  'text-muted underline-offset-4 hover:text-ink hover:underline focus-visible:focus-ring';

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ asChild = false, className, ...rest }, ref) => {
    const Comp = asChild ? Slot.Root : 'a';
    return <Comp ref={ref} className={cx(linkClass, className)} {...rest} />;
  },
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, renderLink, className, ...rest }, ref) => (
    <nav
      aria-label="Breadcrumb"
      ref={ref}
      className={cx('flex h-control items-center font-mono text-[13px]', className)}
      {...rest}
    >
      <ol className="m-0 flex list-none items-center gap-2 p-0">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-ink">
                  {item.label}
                </span>
              ) : item.href || renderLink ? (
                renderLink ? (
                  <BreadcrumbLink asChild href={item.href}>
                    {cloneElement(renderLink(item), undefined, item.label)}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )
              ) : (
                <span className="text-muted">{item.label}</span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-gray-400">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  ),
);
Breadcrumb.displayName = 'Breadcrumb';
