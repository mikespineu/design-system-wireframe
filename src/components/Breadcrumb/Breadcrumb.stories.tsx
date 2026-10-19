import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Breadcrumb, BreadcrumbLink } from './Breadcrumb';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  args: {
    items: [{ label: 'Archive', href: '#archive' }, { label: '2026', href: '#2026' }, { label: 'Coastline' }],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongTrail: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Archive', href: '#archive' },
      { label: '2026', href: '#2026' },
      { label: 'Series', href: '#series' },
      { label: 'Coastline', href: '#coastline' },
      { label: 'Plate 04 — Low tide' },
    ],
  },
};

/** Pass `renderLink` to use your router's link; the label and styling are merged in. */
export const CustomLink: Story = {
  args: {
    renderLink: (item) => <a href={`#custom-${item.label}`} data-router="true" />,
  },
};

/** Compose manually with `BreadcrumbLink asChild`. */
export const ComposedLink: Story = {
  render: () => (
    <BreadcrumbLink asChild>
      <a href="#archive">Archive</a>
    </BreadcrumbLink>
  ),
};

/** Keyboard: Tab moves through the links (2 px ring); the current page is not focusable. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.tab();
    await expect(c.getByRole('link', { name: 'Archive' })).toHaveFocus();
    await userEvent.tab();
    await expect(c.getByRole('link', { name: '2026' })).toHaveFocus();
  },
};
