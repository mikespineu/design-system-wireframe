import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import minimalSample from '../docs/theming-guide/samples/minimal.ts?raw';
import pkg from '../package.json';
import { storybookThemes } from '../.storybook/themes';
import { Alert } from './components/Alert';
import { Breadcrumb } from './components/Breadcrumb';
import { Button } from './components/Button';
import { Icon, useIcon } from './components/Icon';
import { TextField } from './components/Input';
import { SegmentedControl } from './components/SegmentedControl';
import { Switch } from './components/Switch';
import { Tag } from './components/Tag';
import { themeRoles } from './styles/roles';

/**
 * The Storybook landing page (docs/specs/Introduction.md, canvas Introduction.dc.html). A page, not a component:
 * it is built from shipped components, native elements and role-token utilities only. Everything that is not a
 * story is excluded from the CSF exports so the data can be tested.
 */
const meta = {
  title: 'Introduction',
  parameters: { layout: 'fullscreen', docs: { disable: true } },
  excludeStories: /^(?!Intro$)/,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ---------------------------------------------------------------- data */

/** Repository from package.json (`repository.url`), without the `git+` prefix and `.git` suffix. */
export const REPO_URL = pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
/** Mirrors `coverageThreshold.global.lines` in jest.config.cjs; a test keeps the two equal. */
export const COVERAGE_FLOOR = 80;

const gh = (path: string) => `${REPO_URL}/blob/main/${path}`;
const docs = (id: string) => `./?path=/docs/${id}`;
const story = (id: string) => `./?path=/story/${id}`;
const createThemeGuide = docs('foundations-theming-create-your-own-theme--docs');
const consumerGuide = gh('docs/consumer-guide.md');

export interface Family {
  group: string;
  /** Folder name in src/components (a family name, not always an export: Toast). */
  family: string;
  docsId: string;
  /** Other exports of the family. */
  parts: string[];
}

/** The component list. A test keeps it equal to the PascalCase runtime exports of src/index.ts. */
export const families: Family[] = [
  { group: 'Actions', family: 'Button', docsId: 'components-button--docs', parts: [] },
  { group: 'Actions', family: 'IconButton', docsId: 'components-iconbutton--docs', parts: [] },
  { group: 'Actions', family: 'ButtonGroup', docsId: 'components-buttongroup--docs', parts: [] },
  { group: 'Forms', family: 'Input', docsId: 'components-input--docs', parts: ['Field', 'TextField'] },
  { group: 'Forms', family: 'Textarea', docsId: 'components-textarea--docs', parts: ['TextareaField', 'TextareaCounter'] },
  { group: 'Forms', family: 'Select', docsId: 'components-select--docs', parts: ['SelectField'] },
  { group: 'Forms', family: 'Checkbox', docsId: 'components-checkbox--docs', parts: ['CheckboxGroup'] },
  { group: 'Forms', family: 'RadioGroup', docsId: 'components-radiogroup--docs', parts: ['RadioGroupItem'] },
  { group: 'Forms', family: 'Switch', docsId: 'components-switch--docs', parts: [] },
  { group: 'Forms', family: 'SegmentedControl', docsId: 'components-segmentedcontrol--docs', parts: [] },
  { group: 'Forms', family: 'TileGroup', docsId: 'components-tilegroup--docs', parts: [] },
  { group: 'Forms', family: 'Slider', docsId: 'components-slider--docs', parts: ['SliderField'] },
  { group: 'Overlays', family: 'Dialog', docsId: 'components-dialog--docs', parts: ['DialogClose'] },
  { group: 'Overlays', family: 'Drawer', docsId: 'components-drawer--docs', parts: ['DrawerClose'] },
  { group: 'Overlays', family: 'Popover', docsId: 'components-popover--docs', parts: [] },
  { group: 'Overlays', family: 'Tooltip', docsId: 'components-tooltip--docs', parts: ['TooltipProvider'] },
  { group: 'Overlays', family: 'InfoTip', docsId: 'components-infotip--docs', parts: [] },
  { group: 'Feedback', family: 'Alert', docsId: 'components-alert--docs', parts: [] },
  { group: 'Feedback', family: 'Toast', docsId: 'components-toast--docs', parts: ['ToastProvider', 'Toaster', 'useToast'] },
  { group: 'Feedback', family: 'Tag', docsId: 'components-tag--docs', parts: ['Badge'] },
  { group: 'Navigation', family: 'Breadcrumb', docsId: 'components-breadcrumb--docs', parts: ['BreadcrumbLink'] },
  { group: 'Navigation', family: 'Tabs', docsId: 'components-tabs--docs', parts: [] },
  { group: 'Layout', family: 'Stack', docsId: 'layout-stack--docs', parts: [] },
  { group: 'Layout', family: 'Grid', docsId: 'layout-grid--docs', parts: [] },
  { group: 'Icons', family: 'Icon', docsId: 'foundations-icon--docs', parts: ['IconProvider', 'createIcon', 'useIcon'] },
];

const groups = Array.from(new Set(families.map((f) => f.group)));
const themeNames = Object.keys(storybookThemes);
const themeOptions = themeNames.map((name) => ({ value: name, label: name }));

const whyCards = [
  {
    kicker: 'Radix UI',
    title: 'Accessible by default',
    body: 'Every interactive part is a Radix primitive, so focus, keyboard and ARIA come from Radix, not from hand-written handlers. Names a screen reader needs, like a Dialog title or an IconButton label, are required props.',
    link: { text: 'Try the Dialog keyboard story', href: story('components-dialog--keyboard') },
  },
  {
    kicker: 'Role tokens',
    title: 'Themed through roles',
    body: (
      <>
        Components read only the {themeRoles.length} semantic roles, never raw values. All library CSS sits in{' '}
        <code className="font-mono">@layer ds</code>, so one <code className="font-mono">[data-theme]</code> block of
        yours restyles everything, in any import order.
      </>
    ),
    link: { text: 'Read the theming contract', href: docs('foundations-theming--docs') },
  },
  {
    kicker: 'createTheme() · checkContrast()',
    title: 'Generate and verify a theme',
    body: (
      <>
        <code className="font-mono">createTheme()</code> turns one brand color, fonts, radius and shadow into a complete
        theme block. <code className="font-mono">checkContrast()</code> checks every text and UI pair against WCAG AA, so
        a failing theme never ships.
      </>
    ),
    link: { text: 'Read the theming guide on GitHub', href: gh('docs/theming-guide.md') },
  },
  {
    kicker: 'Stories · jest-axe · coverage',
    title: 'Tested like a product',
    body: (
      <>
        A story per state, keyboard stories for every interactive component, <code className="font-mono">userEvent</code>{' '}
        and <code className="font-mono">jest-axe</code> in every test file. CI runs lint, typecheck and the suite with an{' '}
        {COVERAGE_FLOOR} % coverage floor on every pull request.
      </>
    ),
    link: { text: 'See the CI workflow on GitHub', href: gh('.github/workflows/ci.yml') },
  },
];

const readFirst = [
  { name: 'Starter guide', tag: 'GitHub', href: gh('docs/starter-guide.md') },
  { name: 'Consumer guide', tag: 'GitHub', href: consumerGuide },
  { name: 'Colors', tag: 'Foundations', href: docs('foundations-colors--docs') },
  { name: 'Typography', tag: 'Foundations', href: docs('foundations-typography--docs') },
  { name: 'Spacing', tag: 'Foundations', href: docs('foundations-spacing--docs') },
  { name: 'Shape and line', tag: 'Foundations', href: docs('foundations-shape-and-line--docs') },
];

/* -------------------------------------------------------- shared parts */

const rule = 'var(--ds-border-width) solid var(--ds-color-divider)';

const label = 'font-label text-label case-label';
const linkBase = 'font-label text-ui text-emphasis focus-visible:focus-ring';
const textLink =
  `${linkBase} inline-flex min-h-control items-center gap-2 self-start underline underline-offset-4 ` +
  'decoration-[length:var(--ds-border-width)] hover:decoration-[length:var(--ds-border-width-strong)]';
const sectionH2 = 'heading-md md:heading-xl break-words';
const cardH3 = 'heading-sm md:heading-md break-words';
const intro = 'mt-4 max-w-[64ch] body-md md:body-lg';
const list = 'm-0 list-none p-0';

const Chevron = () => <Icon icon={useIcon('chevron-right')} size="md" className="flex-none text-icon" />;

const TextLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_top" className={textLink}>
    {children}
    <Chevron />
  </a>
);

/** A whole-row link: name, muted right-aligned parts, decorative chevron. */
const LinkRow = ({ href, name, parts }: { href: string; name: string; parts?: string }) => (
  <a
    href={href}
    target="_top"
    className={`${linkBase} flex min-h-control flex-wrap items-center gap-x-3 gap-y-1 p-2 no-underline hover:bg-fill`}
  >
    <span>{name}</span>
    {parts ? <span className="ml-auto text-right font-mono text-ui-sm font-normal text-muted">{parts}</span> : null}
    <span className={parts ? 'flex' : 'ml-auto flex'}>
      <Chevron />
    </span>
  </a>
);

const Rows = ({ children }: { children: ReactNode }) => (
  <ul role="list" className={list} style={{ borderTop: rule }}>
    {children}
  </ul>
);

const Band = ({ id, last, children }: { id: string; last?: boolean; children: ReactNode }) => (
  <section aria-labelledby={id} style={last ? undefined : { borderBottom: rule }}>
    <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-12 md:py-24">{children}</div>
  </section>
);

const Steps = ({ steps }: { steps: Array<{ title: string; body: ReactNode; extra?: ReactNode }> }) => (
  <ol role="list" className={list} style={{ borderBottom: rule }}>
    {steps.map((step, i) => (
      <li key={step.title} className="grid gap-2 py-6 md:grid-cols-[var(--ds-space-16)_1fr] md:gap-4" style={{ borderTop: rule }}>
        <span aria-hidden="true" className="font-mono text-h3 text-muted">
          {String(i + 1).padStart(2, '0')}
        </span>
        <div className="flex min-w-0 flex-col gap-2">
          <h3 className={cardH3}>{step.title}</h3>
          <p className="m-0 body-md">{step.body}</p>
          {step.extra}
        </div>
      </li>
    ))}
  </ol>
);

/* --------------------------------------------------------------- bands */

const Hero = () => (
  <Band id="intro-hero">
    <p className={`m-0 ${label} text-muted`}>Design System Wireframe · React 19 · Radix UI</p>
    <h1 id="intro-hero" className="heading-lg md:heading-xl lg:heading-2xl mt-6 max-w-[16ch] break-words">
      Accessible React components. Your look, in minutes.
    </h1>
    <p className="m-0 mt-8 max-w-[60ch] body-md md:body-lg">
      {families.length} component families on Radix primitives, styled only through role tokens. Build on the black and
      white wireframe today, then generate your own theme with <code className="font-mono">createTheme()</code>, check it
      with <code className="font-mono">checkContrast()</code> and ship it in light and dark, without touching a
      component.
    </p>
    <div className="mt-8 flex flex-col gap-3 md:flex-row">
      <Button asChild className="w-full md:w-auto">
        <a href={`${REPO_URL}/generate`} target="_top">
          Use this template
        </a>
      </Button>
      <Button asChild variant="secondary" className="w-full md:w-auto">
        <a href={createThemeGuide} target="_top">
          Create your own theme
        </a>
      </Button>
      <Button asChild variant="ghost" className="w-full md:w-auto">
        <a href="#components">Browse components</a>
      </Button>
    </div>
    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-md border-line border-border bg-surface-subtle p-4 body-sm">
      <span className={`${label} text-emphasis`}>Theme switcher</span>
      <p className="m-0 basis-80 flex-1 body-sm">
        Pick a theme from the paintbrush menu in the Storybook toolbar. This page, every story and every docs page
        follow it.
      </p>
      <ul role="list" className={`${list} flex flex-wrap gap-2`}>
        {themeNames.map((name) => (
          <li key={name}>
            <Tag variant="neutral">{name}</Tag>
          </li>
        ))}
      </ul>
    </div>
    <dl className="m-0 mt-12 grid grid-cols-2 gap-6 pt-6 md:grid-cols-4" style={{ borderTop: rule }}>
      {[
        ['Component families', String(families.length)],
        ['Themes included', String(themeNames.length)],
        ['Themeable roles', String(themeRoles.length)],
        ['Coverage floor', `${COVERAGE_FLOOR} %`],
      ].map(([term, value]) => (
        <div key={term} className="flex flex-col-reverse gap-1">
          <dt className={`${label} text-muted`}>{term}</dt>
          <dd className="m-0 font-heading text-h2 text-emphasis">{value}</dd>
        </div>
      ))}
    </dl>
  </Band>
);

const Why = () => (
  <Band id="why">
    <h2 id="why" className={sectionH2}>
      Why use it
    </h2>
    <p className={intro}>Four things you would otherwise build yourself, each with its proof one click away.</p>
    <ul role="list" className={`${list} mt-8 grid gap-6 md:mt-12 md:grid-cols-2 lg:grid-cols-4`}>
      {whyCards.map((card) => (
        <li
          key={card.title}
          className="flex flex-col gap-3 rounded-lg border-line border-divider bg-surface p-6 shadow-sm"
        >
          <p className={`m-0 ${label} text-muted`}>{card.kicker}</p>
          <h3 className={cardH3}>{card.title}</h3>
          <p className="m-0 body-md">{card.body}</p>
          <div className="mt-auto flex flex-col">
            <TextLink href={card.link.href}>{card.link.text}</TextLink>
          </div>
        </li>
      ))}
    </ul>
  </Band>
);

const Showcase = () => {
  const [theme, setTheme] = useState('bold');
  return (
    <Band id="themes">
      <h2 id="themes" className={sectionH2}>
        One component set, four themes
      </h2>
      <p className={intro}>
        The screen below is stock components. Pick a theme: only the <code className="font-mono">data-theme</code>{' '}
        attribute on the panel changes, never the markup. <code className="font-mono">bold</code> and{' '}
        <code className="font-mono">bold-dark</code> are opt-in (<code className="font-mono">themes/bold.css</code>);
        Storybook loads them for you.
      </p>
      <div className="mt-8 flex flex-col gap-6 md:mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SegmentedControl
            label="Preview theme"
            labelPosition="top"
            options={themeOptions}
            defaultValue="bold"
            onValueChange={setTheme}
          />
          <TextLink href={story('foundations-themes--side-by-side')}>Compare all four side by side</TextLink>
        </div>
        <figure className="m-0 flex flex-col gap-2">
          <figcaption className="flex justify-between gap-4 font-mono text-caption text-muted">
            <span>Preview</span>
            <code>data-theme=&quot;{theme}&quot;</code>
          </figcaption>
          {/* Reset: `dark` sets only color roles, so the panel sits in a default scope before its own theme. */}
          <div data-theme="default">
            <div
              data-theme={theme}
              data-testid="showcase-panel"
              className="rounded-lg border-line border-strong bg-background p-4 font-sans text-body text-text shadow-lg md:p-8"
            >
              <Breadcrumb items={[{ label: 'Projects' }, { label: 'Launch plan' }]} />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <h3 className={cardH3}>Launch plan</h3>
                <Tag variant="solid">New</Tag>
                <Tag variant="subtle">Q4</Tag>
                <Tag variant="outline">Shared</Tag>
              </div>
              <p className="m-0 mt-2 text-text">Stock parts only: no custom CSS, nothing to restyle by hand.</p>
              <div className="mt-6 grid items-start gap-6 md:grid-cols-2 md:gap-8">
                <div className="flex min-w-0 flex-col gap-4">
                  <TextField label="Owner" placeholder="Name or email" hint="Who signs this off?" />
                  <Switch label="Notify the team" defaultChecked />
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                  <Alert severity="success" title="Saved">
                    Your changes are live.
                  </Alert>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button">Publish</Button>
                    <Button type="button" variant="secondary">
                      Save draft
                    </Button>
                    <Button type="button" variant="ghost">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </figure>
      </div>
    </Band>
  );
};

const Start = () => (
  <Band id="start">
    <h2 id="start" className={sectionH2}>
      Start from it
    </h2>
    <p className={intro}>
      Make the repository yours and you get the components, tokens, Storybook, tests and CI in one step.
    </p>
    <div className="mt-8 grid items-start gap-8 md:mt-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-12">
      <Steps
        steps={[
          {
            title: 'Use the template',
            body: 'Create your own copy of the repository on GitHub with “Use this template”.',
            extra: <TextLink href={`${REPO_URL}/generate`}>Use this template on GitHub</TextLink>,
          },
          {
            title: 'Run it',
            body: 'Install and open Storybook. Lint, typecheck and tests run the same way locally and in CI.',
            extra: (
              <pre className="m-0 mt-2 overflow-x-auto rounded-md border-line border-divider bg-surface-subtle p-4 font-mono text-caption text-text-strong">
                <code>{'npm ci\nnpm run storybook'}</code>
              </pre>
            ),
          },
          {
            title: 'Build your screens',
            body: 'Compose pages from the components below and the Tailwind utilities, or start from a pattern.',
            extra: (
              <div className="flex flex-wrap gap-x-6">
                <TextLink href={story('patterns-contact-form--default')}>Contact form pattern</TextLink>
                <TextLink href={story('patterns-configurator--default')}>Configurator pattern</TextLink>
              </div>
            ),
          },
        ]}
      />
      <div className="flex flex-col gap-4 rounded-lg border-line border-divider bg-surface p-6 shadow-sm">
        <h3 className={cardH3}>Read first</h3>
        <Rows>
          {readFirst.map((row) => (
            <li key={row.name} style={{ borderBottom: rule }}>
              <LinkRow href={row.href} name={row.name} parts={row.tag} />
            </li>
          ))}
        </Rows>
      </div>
    </div>
  </Band>
);

const Customize = () => (
  <Band id="customize">
    <h2 id="customize" className={sectionH2}>
      Customize in minutes
    </h2>
    <p className={intro}>
      One brand color is enough. <code className="font-mono">createTheme()</code> derives the rest: neutrals, hover,
      focus, radius, shadow and a dark block.
    </p>
    <div className="mt-8 grid items-start gap-8 md:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      <div>
        <Steps
          steps={[
            {
              title: 'Generate',
              body: (
                <>
                  Call <code className="font-mono">createTheme()</code> with a name, a brand color and fonts. It returns a
                  stylesheet with every role set.
                </>
              ),
            },
            {
              title: 'Check',
              body: (
                <>
                  Run <code className="font-mono">checkContrast()</code> on the blocks. It lists every text and UI pair
                  under WCAG AA, so your build can fail on it.
                </>
              ),
            },
            {
              title: 'Turn it on',
              body: (
                <>
                  Import the CSS and set <code className="font-mono">data-theme=&quot;acme&quot;</code> on{' '}
                  <code className="font-mono">&lt;html&gt;</code>, or <code className="font-mono">&quot;acme-dark&quot;</code>{' '}
                  for dark.
                </>
              ),
            },
          ]}
        />
        <div className="mt-4 flex flex-wrap gap-x-6">
          <TextLink href={createThemeGuide}>Follow the step-by-step guide</TextLink>
          <TextLink href={`${consumerGuide}#apply-a-theme`}>Apply a theme: consumer guide</TextLink>
        </div>
      </div>
      <figure className="m-0 flex min-w-0 flex-col gap-2">
        <figcaption className="font-mono text-caption text-muted">docs/theming-guide/samples/minimal.ts</figcaption>
        <pre
          tabIndex={0}
          role="region"
          aria-label="Code sample: minimal.ts"
          className="m-0 overflow-x-auto rounded-lg border-line border-divider bg-surface-subtle p-4 font-mono text-caption text-text-strong focus-visible:focus-ring md:p-6"
        >
          <code>{minimalSample}</code>
        </pre>
      </figure>
    </div>
  </Band>
);

const Components = () => (
  <Band id="components" last>
    <h2 id="components" tabIndex={-1} className={`${sectionH2} focus:outline-none`}>
      Every component
    </h2>
    <p className={intro}>
      All {families.length} families exported from <code className="font-mono">src/index.ts</code>, each with a docs
      page, a story per state and tests. Parts exported with a family are listed beside it.
    </p>
    <div className="mt-8 columns-1 gap-8 md:mt-12 md:columns-2 lg:columns-3">
      {groups.map((group) => (
        <div key={group} className="mb-8 break-inside-avoid">
          <h3 className="heading-sm mb-3">{group}</h3>
          <Rows>
            {families
              .filter((f) => f.group === group)
              .map((f) => (
                <li key={f.family} style={{ borderBottom: rule }}>
                  <LinkRow href={docs(f.docsId)} name={f.family} parts={f.parts.join(', ')} />
                </li>
              ))}
          </Rows>
        </div>
      ))}
    </div>
    <p className="m-0 mt-4 max-w-[90ch] text-body-sm text-muted">
      Also exported: the hooks <code className="font-mono">useMediaQuery</code> and{' '}
      <code className="font-mono">useToast</code>; the theme tools <code className="font-mono">createTheme</code>,{' '}
      <code className="font-mono">checkContrast</code> and <code className="font-mono">generateScale</code>; the role
      lists <code className="font-mono">themeRoles</code>, <code className="font-mono">themeRoleGroups</code>,{' '}
      <code className="font-mono">colorRoles</code>, <code className="font-mono">fontRoles</code>,{' '}
      <code className="font-mono">fontWeightRoles</code>, <code className="font-mono">typeScaleRoles</code>,{' '}
      <code className="font-mono">radiusRoles</code>, <code className="font-mono">shadowRoles</code> and{' '}
      <code className="font-mono">shapeRoles</code>.
    </p>
  </Band>
);

/* ---------------------------------------------------------------- story */

export const Intro: Story = {
  render: () => (
    <main className="bg-background font-sans text-body text-text">
      <Hero />
      <Why />
      <Showcase />
      <Start />
      <Customize />
      <Components />
    </main>
  ),
};
