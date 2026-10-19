import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';

/*
 * Example form layout from docs/mono-design-system (artboard "Example form").
 * Field components (Input, Select, Textarea, Checkbox, RadioGroup) are not built yet
 * (docs/COMPONENTS_TODO.md C3-C9), so the fields here are native elements styled with
 * token utilities. Swap them for the real components when those land.
 */

type Values = {
  first: string;
  last: string;
  email: string;
  topic: string;
  reply: 'email' | 'call';
  message: string;
  consent: boolean;
};

const empty = (): Values => ({ first: '', last: '', email: '', topic: '', reply: 'email', message: '', consent: false });

const MESSAGE_MIN = 20;
const MESSAGE_MAX = 500;

const invalid = (v: Values) => ({
  first: !v.first.trim(),
  last: !v.last.trim(),
  email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()),
  topic: !v.topic,
  message: v.message.trim().length < MESSAGE_MIN,
  consent: !v.consent,
});

const labelClass = 'font-mono text-label uppercase';
const controlClass =
  'box-border w-full border border-border bg-white px-3 text-body text-ink rounded-md ' +
  'placeholder:text-placeholder focus-visible:focus-ring ' +
  'aria-invalid:border-2 aria-invalid:border-ink aria-invalid:bg-surface-subtle';
const inputClass = `${controlClass} h-control`;
const errorClass = 'text-caption font-medium';
const hintClass = 'text-caption text-muted';
const legendClass = 'mb-6 p-0 font-mono text-h3';

const Facade = () => {
  const filter = `grain-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 400 500" className="block h-auto w-full" role="img" aria-label="Photo stand-in: concrete building facade with hard shadows">
      <defs>
        <filter id={filter}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="400" height="500" fill="var(--ds-color-gray-100)" />
      <rect x="50" y="80" width="214" height="420" fill="var(--ds-color-gray-300)" />
      <rect x="264" y="160" width="96" height="340" fill="var(--ds-color-gray-500)" />
      {[120, 214, 308].flatMap((y) =>
        [78, 142, 206].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="38" height="54" fill="var(--ds-color-gray-700)" />),
      )}
      <polygon points="50,400 264,240 264,500 50,500" fill="var(--ds-color-black)" opacity="0.55" />
      <rect width="400" height="500" filter={`url(#${filter})`} opacity="0.18" />
    </svg>
  );
};

const ContactForm = () => {
  const [values, setValues] = useState<Values>(empty);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const errors = invalid(values);
  const show = (key: keyof Values & keyof typeof errors) => touched && errors[key];
  const errorCount = touched ? Object.values(errors).filter(Boolean).length : 0;

  const text =
    (key: 'first' | 'last' | 'email' | 'topic' | 'message') =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setSent(!Object.values(errors).some(Boolean));
  };

  const reset = () => {
    setValues(empty());
    setTouched(false);
    setSent(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-360 flex-col gap-16 p-6 lg:p-24">
      <header className="flex justify-between border-b border-ink pb-6 font-mono text-caption uppercase tracking-[0.08em] text-muted">
        <span>MONO/00 — Patterns</span>
        <span>Example form · v0.1</span>
      </header>

      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
        <aside className="flex flex-col gap-8">
          <span className="font-mono text-label uppercase text-muted">Contact</span>
          <h1 className="m-0 text-h1">Start a conversation</h1>
          <p className="m-0 text-body-lg text-text">Tell us what you are working on. We reply within [RESPONSE TIME].</p>
          <figure className="m-0 flex flex-col gap-2">
            <Facade />
            <figcaption className="font-mono text-label tracking-normal text-muted">Studio · [LOCATION]</figcaption>
          </figure>
        </aside>

        <div className="flex flex-col gap-8">
          {sent ? (
            <div role="status" className="flex flex-col gap-6 border border-divider bg-surface-subtle p-12">
              <Icon name="check" size={32} />
              <h2 className="m-0 text-h2">Message sent</h2>
              <p className="m-0 text-body text-text">
                Thanks, {values.first}. We will reply to {values.email}.
              </p>
              <Button variant="secondary" className="self-start" onClick={reset}>
                Send another
              </Button>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="flex flex-col gap-8">
              {errorCount > 0 && (
                <div role="alert" className="flex gap-3 border-2 border-ink bg-surface-subtle p-4">
                  <Icon name="warning" size={20} strokeWidth={2} className="flex-none" />
                  <div className="flex flex-col gap-1">
                    <strong className="font-mono text-sm font-bold">{errorCount} fields need attention</strong>
                    <span className="text-sm text-gray-800">Fix the marked fields and send again.</span>
                  </div>
                </div>
              )}

              <fieldset className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0">
                <legend className={legendClass}>About you</legend>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="f-first" className={labelClass}>First name</label>
                    <input
                      id="f-first"
                      type="text"
                      autoComplete="given-name"
                      value={values.first}
                      onChange={text('first')}
                      aria-invalid={show('first')}
                      aria-describedby="f-first-e"
                      className={inputClass}
                    />
                    {show('first') && <span id="f-first-e" className={errorClass}>Error: enter your first name</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="f-last" className={labelClass}>Last name</label>
                    <input
                      id="f-last"
                      type="text"
                      autoComplete="family-name"
                      value={values.last}
                      onChange={text('last')}
                      aria-invalid={show('last')}
                      aria-describedby="f-last-e"
                      className={inputClass}
                    />
                    {show('last') && <span id="f-last-e" className={errorClass}>Error: enter your last name</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="f-email" className={labelClass}>Email</label>
                  <input
                    id="f-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@domain.com"
                    value={values.email}
                    onChange={text('email')}
                    aria-invalid={show('email')}
                    aria-describedby="f-email-h"
                    className={inputClass}
                  />
                  {show('email') ? (
                    <span id="f-email-h" className={errorClass}>Error: enter a full email address</span>
                  ) : (
                    <span id="f-email-h" className={hintClass}>We only use this to reply.</span>
                  )}
                </div>
              </fieldset>

              <fieldset className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0">
                <legend className={legendClass}>Your request</legend>
                <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="f-topic" className={labelClass}>Topic</label>
                    <select
                      id="f-topic"
                      value={values.topic}
                      onChange={text('topic')}
                      aria-invalid={show('topic')}
                      aria-describedby="f-topic-e"
                      className={inputClass}
                    >
                      <option value="">Choose a topic</option>
                      <option value="project">New project</option>
                      <option value="print">Print order</option>
                      <option value="press">Press</option>
                      <option value="other">Other</option>
                    </select>
                    {show('topic') && <span id="f-topic-e" className={errorClass}>Error: choose a topic</span>}
                  </div>
                  <div role="radiogroup" aria-labelledby="f-reply-l" className="flex flex-col gap-2">
                    <span id="f-reply-l" className={labelClass}>Reply by</span>
                    <div className="flex gap-6">
                      {(['email', 'call'] as const).map((option) => (
                        <label key={option} className="flex min-h-control items-center gap-3 text-body">
                          <input
                            type="radio"
                            name="reply"
                            value={option}
                            checked={values.reply === option}
                            onChange={() => setValues((v) => ({ ...v, reply: option }))}
                            className="m-0 size-5 accent-ink focus-visible:focus-ring"
                          />
                          {option === 'email' ? 'Email' : 'Call'}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="f-msg" className={labelClass}>Message</label>
                    <span className="font-mono text-label tracking-normal text-muted">
                      {values.message.length} / {MESSAGE_MAX}
                    </span>
                  </div>
                  <textarea
                    id="f-msg"
                    rows={6}
                    maxLength={MESSAGE_MAX}
                    placeholder="A few lines about the project"
                    value={values.message}
                    onChange={text('message')}
                    aria-invalid={show('message')}
                    aria-describedby="f-msg-h"
                    className={`${controlClass} resize-y py-3 leading-normal`}
                  />
                  {show('message') ? (
                    <span id="f-msg-h" className={errorClass}>Error: write at least {MESSAGE_MIN} characters</span>
                  ) : (
                    <span id="f-msg-h" className={hintClass}>At least {MESSAGE_MIN} characters.</span>
                  )}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2 border-t border-divider pt-6">
                <label className="flex min-h-control items-start gap-3 text-body">
                  <input
                    type="checkbox"
                    checked={values.consent}
                    onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))}
                    aria-invalid={show('consent')}
                    aria-describedby="f-consent-e"
                    className="mt-0.5 size-5 flex-none accent-ink focus-visible:focus-ring"
                  />
                  I agree that my details are stored to answer this request. [LINK TO PRIVACY POLICY]
                </label>
                {show('consent') && (
                  <span id="f-consent-e" className={`${errorClass} pl-8`}>Error: consent is required to send</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit">Send message</Button>
                <Button variant="secondary" onClick={reset}>Clear</Button>
                <span className="ml-auto text-caption text-muted">All fields required</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const meta = {
  title: 'Patterns/Contact form',
  component: ContactForm,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Submitting an empty form shows the error summary and per-field messages. */
export const WithErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Send message' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('6 fields need attention');
    await expect(canvas.getByRole('textbox', { name: 'First name' })).toHaveAttribute('aria-invalid', 'true');
  },
};

/** Filling every field and submitting shows the confirmation. */
export const Sent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'First name' }), 'Ada');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Last name' }), 'Lovelace');
    await userEvent.type(canvas.getByRole('textbox', { name: 'Email' }), 'ada@example.com');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Topic' }), 'project');
    await userEvent.type(canvas.getByRole('textbox', { name: /^Message/ }), 'A few lines about a new project.');
    await userEvent.click(canvas.getByRole('checkbox', { name: /I agree/ }));
    await userEvent.click(canvas.getByRole('button', { name: 'Send message' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Thanks, Ada. We will reply to ada@example.com.');
  },
};
