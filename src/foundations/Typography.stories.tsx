import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const styles = [
  { name: 'display', spec: 'Red Hat Mono 500 · 72 / 72 · −4%', cls: 'font-mono text-display text-ink' },
  { name: 'h1', spec: 'Red Hat Mono 500 · 48 / 53 · −3%', cls: 'font-mono text-h1 text-ink' },
  { name: 'h2', spec: 'Red Hat Mono 500 · 32 / 38 · −2%', cls: 'font-mono text-h2 text-ink' },
  { name: 'h3', spec: 'Red Hat Mono 500 · 22 / 29', cls: 'font-mono text-h3 text-ink' },
  { name: 'body-lg', spec: 'Red Hat Text 400 · 18 / 29', cls: 'text-body-lg text-text' },
  { name: 'body', spec: 'Red Hat Text 400 · 16 / 26', cls: 'text-body text-text' },
  { name: 'label', spec: 'Red Hat Mono 500 · 12 / 16 · +8% · uppercase', cls: 'font-mono text-label uppercase text-ink' },
  { name: 'caption', spec: 'Red Hat Text 400 · 13 / 20 · gray-600', cls: 'text-caption text-muted' },
];

export const Scale: Story = {
  render: () => (
    <ul className="divide-y divide-divider border-y border-divider">
      {styles.map((s) => (
        <li key={s.name} className="grid items-baseline gap-2 py-6 md:grid-cols-[14rem_1fr] md:gap-8">
          <div>
            <p className="font-mono text-label uppercase text-ink">{s.name}</p>
            <p className="font-mono text-caption text-muted">{s.spec}</p>
          </div>
          <p className={s.cls}>Quiet type for a loud world</p>
        </li>
      ))}
    </ul>
  ),
};

export const Families: Story = {
  render: () => (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="border border-divider p-6">
        <p className="font-mono text-label uppercase text-muted">Titles · font-mono</p>
        <p className="mt-4 font-mono text-h2 text-ink">Red Hat Mono</p>
        <p className="mt-2 font-mono text-body text-text">ABCDEFGHIJKLM abcdefghijklm 0123456789</p>
      </div>
      <div className="border border-divider p-6">
        <p className="font-mono text-label uppercase text-muted">Body · font-sans</p>
        <p className="mt-4 text-h2 text-ink">Red Hat Text</p>
        <p className="mt-2 text-body text-text">ABCDEFGHIJKLM abcdefghijklm 0123456789</p>
      </div>
    </div>
  ),
};

export const Specimen: Story = {
  render: () => (
    <article className="max-w-prose">
      <p className="font-mono text-label uppercase text-muted">Series / 01</p>
      <h1 className="mt-2 text-h1 text-ink">Headings default to Red Hat Mono</h1>
      <p className="mt-4 text-body-lg text-text">
        Lead paragraphs use body-lg. Everything else reads in body, set in Red Hat Text at 16 / 26
        for a comfortable measure.
      </p>
      <h2 className="mt-8 text-h3 text-ink">Section heading</h2>
      <p className="mt-2 text-body text-text">
        Body copy sits in gray-700 for a 10.4:1 contrast ratio. Secondary notes use{' '}
        <span className="text-muted">muted gray-600</span>.
      </p>
      <p className="mt-4 text-caption text-muted">Caption: image credit or helper text.</p>
    </article>
  ),
};

const headingStyles = [
  { cls: 'heading-2xl', spec: '72 / 72 · −4% · no default element', el: 'p' },
  { cls: 'heading-xl', spec: '48 / 53 · −3% · default for h1', el: 'h1' },
  { cls: 'heading-lg', spec: '32 / 38 · −2% · default for h2', el: 'h2' },
  { cls: 'heading-md', spec: '22 / 29 · default for h3', el: 'h3' },
  { cls: 'heading-sm', spec: '18 / 26 · default for h4', el: 'h4' },
  { cls: 'heading-xs', spec: '16 / 24 · default for h5 and h6', el: 'h5' },
] as const;

const bodyStyles = [
  { cls: 'body-lg', spec: '18 / 28.8 · intros' },
  { cls: 'body-md', spec: '16 / 26 · paragraphs' },
  { cls: 'body-sm', spec: '15 / 24 · dense tables' },
  { cls: 'body-xs', spec: '13 / 20 · captions' },
  { cls: 'body-2xs', spec: '12 / 16 · meta only' },
] as const;

export const HeadingStyles: Story = {
  render: () => (
    <section aria-labelledby="heading-styles-title">
      <h2 id="heading-styles-title" className="sr-only">
        Heading styles
      </h2>
      <ul className="divide-y divide-divider border-y border-divider">
        {headingStyles.map(({ cls, spec, el: El }) => (
          <li key={cls} className="grid items-baseline gap-2 py-6 md:grid-cols-[14rem_1fr] md:gap-8">
            <div>
              <p className="body-xs font-mono font-medium text-ink">{cls}</p>
              <p className="body-xs font-mono text-muted">{spec}</p>
            </div>
            <El className={cls}>Quiet type for a loud world</El>
          </li>
        ))}
      </ul>
    </section>
  ),
};

export const BodyStyles: Story = {
  render: () => (
    <ul className="divide-y divide-divider border-y border-divider">
      {bodyStyles.map(({ cls, spec }) => (
        <li key={cls} className="grid items-baseline gap-2 py-6 md:grid-cols-[14rem_1fr] md:gap-8">
          <div>
            <p className="body-xs font-mono font-medium text-ink">{cls}</p>
            <p className="body-xs font-mono text-muted">{spec}</p>
          </div>
          <p className={cls}>Quiet type for a loud world</p>
        </li>
      ))}
    </ul>
  ),
};

export const Outline: Story = {
  render: () => (
    <article className="max-w-prose">
      <h1 className="heading-xl">Account settings</h1>
      <p className="body-lg mt-4">Manage your profile, plan and billing.</p>
      <h2 className="heading-lg mt-8">Profile</h2>
      <h3 className="heading-md mt-4">Display name</h3>
      <p className="body-md mt-2">Your name appears on invoices.</p>
      <h2 className="heading-sm mt-8">Plan (outline h2, small look)</h2>
      <h3 className="heading-md mt-4">Billing</h3>
      <p className="body-xs mt-2 text-muted">Updated 2 hours ago</p>
    </article>
  ),
};

export const Modifiers: Story = {
  render: () => (
    <div className="grid max-w-prose gap-4">
      <p className="body-lg font-mono font-medium text-ink">1,284</p>
      <p className="body-md text-muted">Muted tone</p>
      <p className="body-md font-bold">Bold weight</p>
      <p className="body-md text-ink">Ink tone</p>
      <div className="bg-primary p-4">
        <p className="body-md text-inherit text-primary-contrast">Inherited tone</p>
      </div>
      <form className="grid gap-2">
        <label htmlFor="typo-name" className="body-md font-medium text-ink">
          Display name
        </label>
        <input id="typo-name" className="border border-border p-2" />
        <fieldset>
          <legend className="body-sm font-medium text-ink">Notifications</legend>
          <a href="#typo" className="body-md font-medium text-ink">
            Manage
          </a>
        </fieldset>
      </form>
    </div>
  ),
};

export const TruncateAndClamp: Story = {
  render: () => (
    <div className="grid max-w-xs gap-4">
      <p className="body-md truncate">A very long single line of text that must be cut off with an ellipsis</p>
      <p className="body-md line-clamp-2">
        A long card description that runs over many lines so that only the first two lines are shown
        and the rest is cut off with an ellipsis at the end of the second line.
      </p>
    </div>
  ),
};

export const FocusTarget: Story = {
  render: () => (
    <div>
      <a href="#typo-target" className="body-md font-medium text-ink focus-visible:focus-ring">
        Skip to content
      </a>
      <h2 id="typo-target" tabIndex={-1} className="heading-lg mt-4 focus-visible:focus-ring">
        Content
      </h2>
    </div>
  ),
};
