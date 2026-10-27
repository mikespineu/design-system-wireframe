import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../../lib/cx';
import { RoleIcon } from '../Icon/RoleIcon';
import { Field, useFieldControl } from '../Input';
import './Textarea.css';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'vertical' | 'none' | 'auto';

const SIZE_ROWS: Record<TextareaSize, number> = { sm: 2, md: 4, lg: 8 };
const ANNOUNCE_DELAY_MS = 500;

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows' | 'maxLength'> {
  /** Starting rows: sm 2, md 4, lg 8. */
  size?: TextareaSize;
  /** Starting rows; overrides `size`. `rows={1}` is 44 px, like Input. */
  rows?: number;
  /** `vertical` (handle), `none` (fixed), `auto` (grows to `maxRows`). Disabled and read-only never resize. */
  resize?: TextareaResize;
  /** Max rows for `resize="auto"`. */
  maxRows?: number;
  /** Shows a character counter. Not passed as native `maxlength`, so typing past it is allowed. */
  maxLength?: number;
  /** Mark invalid without a Field. */
  invalid?: boolean;
}

type CounterState = 'under' | 'near' | 'at' | 'over';

const counterState = (count: number, max: number): CounterState =>
  count > max ? 'over' : count === max ? 'at' : count >= max * 0.9 ? 'near' : 'under';

/** Tracks the UTF-16 length of a controlled or uncontrolled textarea. */
const useCharCount = (
  value: TextareaHTMLAttributes<HTMLTextAreaElement>['value'],
  defaultValue: TextareaHTMLAttributes<HTMLTextAreaElement>['defaultValue'],
  onChange: TextareaProps['onChange'],
) => {
  const [inner, setInner] = useState(() => String(defaultValue ?? '').length);
  const count = value !== undefined ? String(value).length : inner;
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInner(e.target.value.length);
    onChange?.(e);
  };
  return { count, handleChange };
};

export interface TextareaCounterProps {
  id: string;
  count: number;
  max: number;
  className?: string;
}

/** Visible "n / max" (aria-hidden), static limit description and a debounced polite live region. */
export const TextareaCounter = ({ id, count, max, className }: TextareaCounterProps) => {
  const state = counterState(count, max);
  const [message, setMessage] = useState('');
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const left = max - count;
      setMessage(left >= 0 ? `${left} characters remaining` : `${-left} characters too many`);
    }, ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [count, max]);

  return (
    <>
      <span id={id} className="sr-only">
        You can enter up to {max} characters
      </span>
      <span className={cx('ds-textarea-counter', className)} data-state={state} aria-hidden="true">
        {state === 'over' && <RoleIcon role="alert" size={14} />}
        <span>
          {count} / {max}
        </span>
      </span>
      <span className="sr-only" aria-live="polite">
        {message}
      </span>
    </>
  );
};

/** Put the counter description between the hint and the error ids. */
const mergeDescribedBy = (field: string | undefined, own: string | undefined, counterId: string | undefined) => {
  const ids = [...(field?.split(' ') ?? [])];
  if (own) ids.push(own);
  if (counterId) {
    const errorAt = ids.findIndex((i) => i.endsWith('-error'));
    ids.splice(errorAt === -1 ? ids.length : errorAt, 0, counterId);
  }
  return ids.join(' ') || undefined;
};

interface InternalProps {
  /** Internal: TextareaField renders the counter in the hint row. */
  counterInHintRow?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps & InternalProps>(
  (
    {
      size = 'md',
      rows,
      resize = 'vertical',
      maxRows = 6,
      maxLength,
      invalid,
      className,
      style,
      counterInHintRow,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const field = useFieldControl();
    const generated = useId();
    const id = rest.id ?? field?.id ?? generated;
    const { count, handleChange } = useCharCount(value, defaultValue, onChange);
    const hasCounter = maxLength !== undefined;
    const over = hasCounter && count > maxLength;
    const counterId = hasCounter ? `${id}-counter` : undefined;
    const startRows = rows ?? SIZE_ROWS[size];

    const { 'aria-describedby': ownDescribed, ...restProps } = rest;
    const props = {
      ...field,
      ...(invalid || over ? { 'aria-invalid': true as const } : {}),
      ...restProps,
      id,
      'aria-describedby': mergeDescribedBy(
        field?.['aria-describedby'],
        ownDescribed,
        counterId,
      ),
    };

    const textarea = (
      <textarea
        ref={ref}
        className={cx('ds-textarea', className)}
        data-resize={resize}
        rows={startRows}
        style={
          {
            '--ds-textarea-rows': startRows,
            ...(resize === 'auto' ? { '--ds-textarea-max-rows': maxRows } : {}),
            ...style,
          } as CSSProperties
        }
        value={value}
        defaultValue={defaultValue}
        onChange={hasCounter ? handleChange : onChange}
        {...props}
      />
    );

    if (!hasCounter) return textarea;
    if (counterInHintRow) return textarea;
    return (
      <div className="ds-textarea-wrap">
        {textarea}
        <TextareaCounter id={counterId!} count={count} max={maxLength} />
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export interface TextareaFieldProps extends TextareaProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Class for the Field wrapper; `className` goes to the textarea. */
  fieldClassName?: string;
}

/** Field + Textarea in one. The counter sits right of the hint. */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, hint, error, fieldClassName, id, disabled, required, maxLength, value, defaultValue, onChange, ...rest }, ref) => {
    const generated = useId();
    const fieldId = id ?? generated;
    const { count, handleChange } = useCharCount(value, defaultValue, onChange);
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        id={fieldId}
        disabled={disabled}
        required={required}
        className={fieldClassName}
        hintAside={
          maxLength !== undefined ? <TextareaCounter id={`${fieldId}-counter`} count={count} max={maxLength} /> : undefined
        }
      >
        <Textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={maxLength !== undefined ? handleChange : onChange}
          counterInHintRow
          {...rest}
        />
      </Field>
    );
  },
);
TextareaField.displayName = 'TextareaField';
