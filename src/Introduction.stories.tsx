import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './components/Alert';
import { Breadcrumb } from './components/Breadcrumb';
import { Button } from './components/Button';
import { TextField } from './components/Input';
import { Tag } from './components/Tag';

const meta = {
  title: 'Introduction',
  parameters: { layout: 'fullscreen', docs: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const rules = [
  { title: 'No hue', body: 'White ground, seven grays, black for ink and action. Green and red exist for feedback only, and always come with an icon and a word.' },
  { title: 'No decoration', body: 'Square corners, no shadows, no gradients. Depth comes from 1 px borders and gray fills, so every screen reads as a wireframe.' },
  { title: 'Theme later', body: 'Every color, space and radius is a --ds-* variable. Build the structure now. Restyle it in one place when the design is ready.' },
];

const components = ['Button', 'IconButton', 'Input', 'Alert', 'Tag', 'Breadcrumb', 'Icon'];

const foundations = [
  { name: 'Color', path: 'foundations-colors--docs' },
  { name: 'Typography', path: 'foundations-typography--docs' },
  { name: 'Spacing', path: 'foundations-spacing--docs' },
  { name: 'Shape and line', path: 'foundations-shape-and-line--docs' },
];

const install = `import './styles/tailwind.css'; // fonts, tokens, utilities

<button className="h-control px-6 bg-primary text-primary-contrast
  hover:bg-primary-hover font-mono focus-visible:focus-ring">
  Continue
</button>`;

const Frame = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <section className={`border-b border-ink ${className}`}>
    <div className="mx-auto max-w-[1280px] px-6 md:px-12">{children}</div>
  </section>
);

const WireframeDemo = () => (
  <div className="border border-ink bg-white p-6 md:p-8">
    <Breadcrumb items={[{ label: 'Projects', href: '#' }, { label: 'Launch plan' }]} />
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <h2 className="text-h2 text-ink">Launch plan</h2>
      <Tag variant="solid">New</Tag>
      <Tag variant="neutral">Q4</Tag>
    </div>
    <p className="mt-2 max-w-prose text-body text-text">
      A real screen from stock parts: no custom CSS, no color, nothing to decide yet.
    </p>
    <div className="mt-6 grid max-w-md gap-4">
      <TextField label="Owner" placeholder="Name or email" hint="Who signs this off?" />
      <Alert severity="success" title="Saved">Your changes are live.</Alert>
    </div>
    <div className="mt-6 flex flex-wrap gap-3">
      <Button>Publish</Button>
      <Button variant="secondary">Save draft</Button>
      <Button variant="ghost">Cancel</Button>
    </div>
  </div>
);

export const Intro: Story = {
  render: () => (
    <main className="bg-white font-sans text-text">
      <Frame>
        <div className="py-16 md:py-24">
          <p className="font-mono text-body text-muted">MONO/00 design system</p>
          <h1 className="mt-6 max-w-[14ch] text-[clamp(3rem,9vw,7.5rem)] font-medium leading-[0.95] tracking-[-0.04em] text-ink">
            Wireframe the whole app. Style it later.
          </h1>
          <p className="mt-8 max-w-[52ch] text-body-lg text-text">
            A black and white React component set for building an application fast. Screens come out as working
            wireframes, so structure and behavior get settled first. Theming is a separate step, done later with tokens.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href="?path=/docs/foundations-colors--docs">Browse foundations</a>
            </Button>
            <Button asChild variant="secondary">
              <a href="#example">See an example screen</a>
            </Button>
          </div>
        </div>
      </Frame>

      <Frame>
        <div className="grid divide-y divide-ink md:grid-cols-3 md:divide-x md:divide-y-0">
          {rules.map((r) => (
            <div key={r.title} className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <h2 className="text-h3 text-ink">{r.title}</h2>
              <p className="mt-3 max-w-[40ch] text-body text-text">{r.body}</p>
            </div>
          ))}
        </div>
      </Frame>

      <Frame>
        <div id="example" className="py-16 md:py-24">
          <h2 className="max-w-[20ch] text-h1 text-ink">Real screens, no styling</h2>
          <p className="mt-4 mb-10 max-w-[60ch] text-body-lg text-text">
            Everything below is stock components and utilities. Swap content, move blocks around, ship the flow.
          </p>
          <WireframeDemo />
        </div>
      </Frame>

      <Frame>
        <div className="grid gap-12 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h2 className="text-h2 text-ink">Start building</h2>
            <p className="mt-4 max-w-[44ch] text-body text-text">
              Import one stylesheet for the fonts, tokens and Tailwind utilities. Off-system classes such as{' '}
              <code className="font-mono text-body">bg-blue-500</code> or{' '}
              <code className="font-mono text-body">rounded-lg</code> generate nothing, so the system stays on
              rails until it is themed.
            </p>
            <h3 className="mt-10 text-h3 text-ink">Foundations</h3>
            <ul className="mt-4 border-t border-divider">
              {foundations.map((f) => (
                <li key={f.path} className="border-b border-divider">
                  <a
                    href={`?path=/docs/${f.path}`}
                    className="flex h-control items-center font-mono text-sm text-ink hover:bg-fill focus-visible:focus-ring"
                  >
                    {f.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <pre className="m-0 overflow-x-auto border border-ink bg-gray-50 p-6 font-mono text-caption leading-6 text-ink">
              <code>{install}</code>
            </pre>
            <h3 className="mt-10 text-h3 text-ink">Components</h3>
            <p className="mt-2 text-body text-text">Each one has states, keyboard behavior and an a11y test.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {components.map((c) => (
                <li key={c}>
                  <Tag variant="neutral">{c}</Tag>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Frame>
    </main>
  ),
};
