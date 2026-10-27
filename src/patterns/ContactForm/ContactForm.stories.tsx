import {
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
  type SelectHTMLAttributes,
} from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Checkbox, CheckboxGroup } from '../../components/Checkbox';
import { Icon } from '../../components/Icon';
import { Field, TextField, useFieldControl } from '../../components/Input';
import { TextareaField } from '../../components/Textarea';
import { CheckIcon } from '../../lib/sampleIcons';

/*
 * Example form layout from docs/design-system-wireframe (artboard "Example form").
 * Text fields use the real TextField/Field, the message uses TextareaField and consent uses Checkbox in a
 * one-item CheckboxGroup. Select and RadioGroup are not built yet (docs/COMPONENTS_TODO.md C3-C9), so those are native elements;
 * the select is wired to Field through useFieldControl so errors and hints behave like Input.
 * Swap them for the real components when those land.
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
  'box-border w-full border border-border bg-surface px-3 text-body text-ink rounded-md ' +
  'placeholder:text-placeholder focus-visible:focus-ring ' +
  'aria-[invalid=true]:border-2 aria-[invalid=true]:border-error';
const legendClass = 'mb-6 p-0 font-mono text-h3';

/** Stand-in until Select exists; wired to the surrounding Field. */
const NativeSelect = (props: SelectHTMLAttributes<HTMLSelectElement>) => {
  const field = useFieldControl();
  return <select {...field} {...props} className={`${controlClass} h-control`} />;
};

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
      <rect width="400" height="500" fill="var(--ds-color-fill)" />
      <rect x="50" y="80" width="214" height="420" fill="var(--ds-color-border)" />
      <rect x="264" y="160" width="96" height="340" fill="var(--ds-color-placeholder)" />
      {[120, 214, 308].flatMap((y) =>
        [78, 142, 206].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="38" height="54" fill="var(--ds-color-text)" />),
      )}
      <polygon points="50,400 264,240 264,500 50,500" fill="var(--ds-color-ink)" opacity="0.55" />
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
        <span>Design System Wireframe — Patterns</span>
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
              <Icon icon={CheckIcon} size={32} />
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
                <Alert severity="error" title={`${errorCount} fields need attention`}>
                  Fix the marked fields and send again.
                </Alert>
              )}

              <fieldset className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0">
                <legend className={legendClass}>About you</legend>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <TextField
                    label="First name"
                    autoComplete="given-name"
                    value={values.first}
                    onChange={text('first')}
                    error={show('first') && 'enter your first name'}
                  />
                  <TextField
                    label="Last name"
                    autoComplete="family-name"
                    value={values.last}
                    onChange={text('last')}
                    error={show('last') && 'enter your last name'}
                  />
                </div>
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@domain.com"
                  value={values.email}
                  onChange={text('email')}
                  hint="We only use this to reply."
                  error={show('email') && 'enter a full email address'}
                />
              </fieldset>

              <fieldset className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0">
                <legend className={legendClass}>Your request</legend>
                <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
                  <Field label="Topic" error={show('topic') && 'choose a topic'}>
                    <NativeSelect value={values.topic} onChange={text('topic')}>
                      <option value="">Choose a topic</option>
                      <option value="project">New project</option>
                      <option value="print">Print order</option>
                      <option value="press">Press</option>
                      <option value="other">Other</option>
                    </NativeSelect>
                  </Field>
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
                <TextareaField
                  label="Message"
                  rows={6}
                  maxLength={MESSAGE_MAX}
                  placeholder="A few lines about the project"
                  value={values.message}
                  onChange={text('message')}
                  hint={`At least ${MESSAGE_MIN} characters.`}
                  error={show('message') && `write at least ${MESSAGE_MIN} characters`}
                />
              </fieldset>

              <div className="border-t border-divider pt-6">
                <CheckboxGroup
                  legend="Consent"
                  hideLegend
                  error={show('consent') && 'consent is required to send'}
                >
                  <Checkbox
                    label="I agree that my details are stored to answer this request. [LINK TO PRIVACY POLICY]"
                    checked={values.consent}
                    onCheckedChange={(c) => setValues((v) => ({ ...v, consent: c === true }))}
                  />
                </CheckboxGroup>
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
    await userEvent.type(canvas.getByRole('textbox', { name: 'Message' }), 'A few lines about a new project.');
    await userEvent.click(canvas.getByRole('checkbox', { name: /I agree/ }));
    await userEvent.click(canvas.getByRole('button', { name: 'Send message' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Thanks, Ada. We will reply to ada@example.com.');
  },
};
