import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Label } from 'radix-ui';
import { cx } from '../../lib/cx';
import { RoleIcon } from '../Icon/RoleIcon';

/** Wiring that Field hands to the control inside it. */
export interface FieldControlProps {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
  'aria-required'?: true;
  disabled?: true;
}

const FieldContext = createContext<FieldControlProps | null>(null);

/**
 * Props for wiring a control (Input, Textarea, Select trigger...) to the surrounding Field.
 * Returns `null` outside a Field. Spread the result on the control, letting explicit props win.
 */
export const useFieldControl = () => useContext(FieldContext);

const FieldLabelContext = createContext<string | null>(null);

/**
 * Id of the Field's label element, for controls that cannot be labelled with `htmlFor`
 * (e.g. a Slider thumb uses `aria-labelledby`). Returns `null` outside a Field.
 */
export const useFieldLabelId = () => useContext(FieldLabelContext);

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Visible label text (rendered uppercase mono). */
  label: ReactNode;
  /** Helper text shown under the control. */
  hint?: ReactNode;
  /** Error message. Presence marks the control invalid and shows an alert icon. */
  error?: ReactNode;
  /** Mark the control disabled (also dims the label). */
  disabled?: boolean;
  required?: boolean;
  /** Override the generated control id. */
  id?: string;
  /** Content aligned to the right of the hint row (e.g. a character counter). */
  hintAside?: ReactNode;
  /** The control. Any child calling `useFieldControl()` (e.g. Input) is wired automatically. */
  children: ReactNode;
}

export const Field = ({ label, hint, error, disabled, required, id, className, children, hintAside, ...rest }: FieldProps) => {
  const generated = useId();
  const controlId = id ?? generated;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control: FieldControlProps = {
    id: controlId,
    ...(error ? { 'aria-invalid': true as const } : {}),
    ...(describedBy ? { 'aria-describedby': describedBy } : {}),
    ...(required ? { 'aria-required': true as const } : {}),
    ...(disabled ? { disabled: true as const } : {}),
  };

  return (
    <FieldContext.Provider value={control}>
      <FieldLabelContext.Provider value={`${controlId}-label`}>
      <div className={cx('flex flex-col gap-2', className)} {...rest}>
        <Label.Root
          id={`${controlId}-label`}
          htmlFor={controlId}
          className={cx('font-mono text-label font-medium uppercase', disabled ? 'text-placeholder' : 'text-ink')}
        >
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </Label.Root>
        {children}
        {hintAside ? (
          <div className="flex items-start justify-between gap-4">
            {hint ? (
              <span id={hintId} className="text-caption text-muted">
                {hint}
              </span>
            ) : null}
            <span className="ml-auto">{hintAside}</span>
          </div>
        ) : (
          hint && (
            <span id={hintId} className="text-caption text-muted">
              {hint}
            </span>
          )
        )}
        {error && (
          <span id={errorId} className="flex items-center gap-1.5 text-caption font-medium text-error">
            <RoleIcon role="alert" size={14} />
            <span>
              <span className="sr-only">Error: </span>
              {error}
            </span>
          </span>
        )}
      </div>
      </FieldLabelContext.Provider>
    </FieldContext.Provider>
  );
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Mark invalid without a Field (Field sets this for you). 2px error border. */
  invalid?: boolean;
}

const inputBase =
  'box-border h-control w-full rounded-md border border-border bg-surface px-3 font-sans text-body text-ink ' +
  'placeholder:text-placeholder transition-colors duration-[120ms] ease-ds focus-visible:focus-ring ' +
  'aria-[invalid=true]:border-2 aria-[invalid=true]:border-error ' +
  'disabled:cursor-not-allowed disabled:border-divider disabled:bg-surface-subtle disabled:text-placeholder';

export const Input = forwardRef<HTMLInputElement, InputProps>(({ invalid, className, ...rest }, ref) => {
  const field = useFieldControl();
  const props = { ...field, ...(invalid ? { 'aria-invalid': true as const } : {}), ...rest };
  return <input ref={ref} className={cx(inputBase, className)} {...props} />;
});
Input.displayName = 'Input';

export interface TextFieldProps extends InputProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Class for the Field wrapper; `className` goes to the input. */
  fieldClassName?: string;
}

/** Field + Input in one. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, error, fieldClassName, id, disabled, required, ...rest }, ref) => (
    <Field label={label} hint={hint} error={error} id={id} disabled={disabled} required={required} className={fieldClassName}>
      <Input ref={ref} {...rest} />
    </Field>
  ),
);
TextField.displayName = 'TextField';
