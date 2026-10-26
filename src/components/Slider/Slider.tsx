import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ElementRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Slider as RadixSlider } from 'radix-ui';
import { cx } from '../../lib/cx';
import { Field, Input, useFieldControl, useFieldLabelId } from '../Input';
import {
  allowedValues,
  defaultFormat,
  firstAllowed,
  lastAllowed,
  neighbour,
  parseTyped,
  positionOf,
  snapToScale,
  type Scale,
} from './scale';
import './Slider.css';

export type SliderValue = number;

export type SliderScale =
  | { min?: number; max?: number; step?: number; values?: never }
  | { values: readonly number[]; min?: never; max?: never; step?: never };

export type SliderBubble = 'auto' | 'always' | 'off';
export type SliderMarks = 'none' | 'steps' | 'ends' | readonly number[];

export type SliderEntry =
  | { bubble?: 'auto' | 'off'; showInput?: boolean }
  | { bubble: 'always'; showInput?: never };

export interface SliderOwnProps {
  /** Controlled value. Always a real value, never an index. */
  value?: SliderValue;
  /** Uncontrolled initial value. Defaults to min (custom list: values[0]). */
  defaultValue?: SliderValue;
  /** Every change: drag move, key, stepper, input commit. */
  onValueChange?: (value: SliderValue) => void;
  /** End of an interaction: pointer up, key, stepper, input commit. */
  onValueCommit?: (value: SliderValue) => void;
  /** `lg` is the touch size. */
  size?: 'sm' | 'md' | 'lg';
  /** Default: `steps` for `values`, `none` for a uniform scale. */
  marks?: SliderMarks;
  /** Minus / plus buttons riding with a value pill. */
  stepper?: boolean;
  /** Appended to displayed values, e.g. `%`, `cm`. */
  unit?: string;
  /** Labels, bubble, pill and aria-valuetext. Overrides the unit rule. */
  formatValue?: (value: number) => string;
  invalid?: boolean;
  disabled?: boolean;
  /** Form name; a hidden input submits the real value. */
  name?: string;
  dir?: 'ltr' | 'rtl';
  id?: string;
  className?: string;
  /** Needed outside a Field. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export type SliderProps = SliderOwnProps & SliderScale & SliderEntry;

export type SliderFieldProps = SliderProps & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Class for the Field wrapper; `className` goes to the slider. */
  fieldClassName?: string;
};

type Loose = SliderOwnProps & {
  values?: readonly number[];
  min?: number;
  max?: number;
  step?: number;
  bubble?: SliderBubble;
  showInput?: boolean;
};

const MAX_STEP_MARKS = 21;
const dev = process.env.NODE_ENV !== 'production';

/** Draft text of a numeric input; applied on Enter / blur, dropped on Esc or when the value changes elsewhere. */
const useNumericEntry = (current: number, display: string, apply: (text: string) => void) => {
  const [draft, setDraft] = useState<{ text: string; base: number } | null>(null);
  const draftRef = useRef<{ text: string; base: number } | null>(null);
  const live = draft && draft.base === current ? draft.text : null;

  const set = (text: string | null) => {
    draftRef.current = text === null ? null : { text, base: current };
    setDraft(draftRef.current);
  };
  const commit = () => {
    const d = draftRef.current;
    draftRef.current = null;
    setDraft(null);
    if (d && d.base === current) apply(d.text);
  };

  return {
    hasDraft: live !== null,
    discard: () => set(null),
    props: {
      value: live ?? display,
      onChange: (e: ChangeEvent<HTMLInputElement>) => set(e.target.value),
      onBlur: commit,
      onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        } else if (e.key === 'Escape' && live !== null) {
          e.stopPropagation();
          set(null);
        }
      },
    },
    commit,
    set,
  };
};

export const Slider = forwardRef<ElementRef<typeof RadixSlider.Root>, SliderProps>((rawProps, ref) => {
  const {
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    size = 'md',
    marks,
    stepper = false,
    unit,
    formatValue,
    invalid,
    disabled,
    name,
    dir,
    id,
    className,
    values,
    min = 0,
    max = 100,
    step = 1,
    bubble = 'auto',
    showInput: showInputProp = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
  } = rawProps as Loose;

  const field = useFieldControl();
  const labelId = useFieldLabelId();
  const baseId = useId();
  const unitId = `${baseId}-unit`;
  const verbDownId = `${baseId}-dec`;
  const verbUpId = `${baseId}-inc`;

  const always = bubble === 'always';
  const showInput = showInputProp && !always;
  const scale: Scale = values ? { values, min: values[0] ?? 0, max: values[values.length - 1] ?? 0, step: 1 } : { min, max, step };
  const first = firstAllowed(scale);
  const last = lastAllowed(scale);

  const isDisabled = Boolean(disabled ?? field?.disabled);
  const isInvalid = Boolean(invalid || field?.['aria-invalid']);

  const controlId = id ?? field?.id ?? baseId;
  const inputInPlace = showInput || (always && !stepper);
  const thumbId = inputInPlace ? `${baseId}-thumb` : controlId;
  const thumbRef = useRef<HTMLSpanElement | null>(null);

  const fmt = (v: number) => (formatValue ? formatValue(v) : defaultFormat(v, unit));
  const bare = (v: number) => String(v);

  // value state
  const controlled = value !== undefined;
  const [inner, setInner] = useState<number>(defaultValue ?? first);
  const current = snapToScale(scale, controlled ? value : inner);
  const [message, setMessage] = useState('');

  const change = (next: number, commit: boolean) => {
    if (!controlled) setInner(next);
    onValueChange?.(next);
    if (commit) onValueCommit?.(next);
  };

  const toRadix = (v: number) => (values ? Math.max(0, values.indexOf(v)) : v);
  const fromRadix = (i: number) => (values ? (values[i] ?? current) : i);

  const applyTyped = (text: string) => {
    const raw = parseTyped(text, unit);
    if (raw === null) return;
    const snapped = snapToScale(scale, raw);
    if (snapped !== current) change(snapped, true);
    if (snapped !== raw) setMessage(`Set to ${fmt(snapped)}`);
  };

  const stepBy = (dir2: -1 | 1) => {
    const next = neighbour(scale, current, dir2);
    if (next === current) return;
    change(next, true);
    setMessage(fmt(next));
  };

  // entries (attached input, bubble input, stepper edit input)
  const attached = useNumericEntry(current, bare(current), applyTyped);
  const [editing, setEditing] = useState(false);
  const editEntry = useNumericEntry(current, bare(current), applyTyped);
  const stepperEdit = stepper && always;

  const closeEdit = (refocus: boolean) => {
    setEditing(false);
    if (refocus) thumbRef.current?.focus();
  };

  // marks
  const all = allowedValues(scale);
  let markMode: 'none' | 'steps' | 'ends' | 'list' = Array.isArray(marks) ? 'list' : ((marks as string | undefined) as 'none' | 'steps' | 'ends') ?? (values ? 'steps' : 'none');
  const tooMany = markMode === 'steps' && all.length > MAX_STEP_MARKS;
  if (tooMany) markMode = 'ends';
  const listed = Array.isArray(marks) ? (marks as readonly number[]).map((m) => snapToScale(scale, m)) : [];
  let ticks: number[] = [];
  let labels: number[] = [];
  if (markMode === 'steps') {
    ticks = all;
    labels = values ? all : [first, last];
  } else if (markMode === 'ends') {
    ticks = [first, last];
    labels = [first, last];
  } else if (markMode === 'list') {
    ticks = values ? all : listed;
    labels = listed;
  }

  // dev warnings
  const valuesKey = values ? values.join(',') : '';
  const marksKey = Array.isArray(marks) ? (marks as readonly number[]).join(',') : String(marks);
  useEffect(() => {
    if (!dev) return;
    if (values) {
      const bad = values.length === 0 || values.some((v, i) => !Number.isFinite(v) || (i > 0 && v <= (values[i - 1] ?? 0)));
      if (bad) console.warn('Slider: `values` must be a non-empty, sorted list of unique finite numbers.');
    } else if (Math.abs((max - min) / step - Math.round((max - min) / step)) > 1e-9) {
      console.warn('Slider: (max - min) is not a multiple of `step`; the largest reachable value is below `max`.');
    }
    if (Array.isArray(marks)) {
      const set = new Set(allowedValues(scale));
      if ((marks as readonly number[]).some((m) => !set.has(m))) console.warn('Slider: a `marks` entry is not an allowed value; it was snapped.');
    }
    if (tooMany) console.warn(`Slider: more than ${MAX_STEP_MARKS} allowed values, \`marks="steps"\` falls back to \`"ends"\`.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesKey, min, max, step, marksKey, tooMany]);

  useEffect(() => {
    if (!dev) return;
    if (showInputProp && always) console.warn('Slider: `showInput` is ignored with `bubble="always"`.');
  }, [showInputProp, always]);

  useEffect(() => {
    if (!dev) return;
    if (!field && !ariaLabel && !ariaLabelledby) console.warn('Slider: outside a Field it needs `aria-label` or `aria-labelledby`.');
  }, [field, ariaLabel, ariaLabelledby]);

  useEffect(() => {
    if (!dev || value === undefined) return;
    if (snapToScale(scale, value) !== value) console.warn('Slider: `value` is not an allowed value; it is snapped for display.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, valuesKey, min, max, step]);

  // clicking the Field label focuses the thumb when there is no input to focus
  useEffect(() => {
    if (!labelId || inputInPlace) return;
    const label = document.getElementById(labelId);
    if (!label) return;
    const focus = () => thumbRef.current?.focus();
    label.addEventListener('click', focus);
    return () => label.removeEventListener('click', focus);
  }, [labelId, inputInPlace]);

  // geometry
  const p = positionOf(scale, current);
  const fmtLengths = all.length > 200 ? [first, last] : all;
  const pillCh = Math.max(...fmtLengths.map((v) => fmt(v).length));
  const bareCh = Math.max(...fmtLengths.map((v) => bare(v).length));
  const style = {
    '--slider-p': p,
    '--slider-ch': pillCh,
    '--slider-bare-ch': bareCh,
    '--slider-unit-ch': unit ? unit.length : 0,
  } as CSSProperties;

  // accessibility wiring
  const describedBy = field?.['aria-describedby'];
  const required = field?.['aria-required'];
  const naming = (extra?: string) => {
    const lab = labelId ?? ariaLabelledby;
    if (lab) return { 'aria-labelledby': extra ? `${lab} ${extra}` : lab };
    if (ariaLabel) return { 'aria-label': extra && unit ? `${ariaLabel} ${unit}` : ariaLabel };
    return {};
  };
  const thumbNaming = labelId
    ? { 'aria-labelledby': labelId }
    : { 'aria-labelledby': ariaLabelledby, 'aria-label': ariaLabel };
  const inputProps = {
    ...naming(unit ? unitId : undefined),
    'aria-invalid': isInvalid || undefined,
    'aria-describedby': describedBy,
    'aria-required': required,
    disabled: isDisabled,
    type: 'text' as const,
    inputMode: 'decimal' as const,
  };
  const buttonNaming = (verbId: string, verb: string) => {
    const lab = labelId ?? ariaLabelledby;
    if (lab) return { 'aria-labelledby': `${verbId} ${lab}` };
    if (ariaLabel) return { 'aria-label': `${verb} ${ariaLabel}` };
    return { 'aria-labelledby': verbId };
  };

  const valueText = fmt(current);
  const thumbValueProps = values
    ? { 'aria-valuemin': first, 'aria-valuemax': last, 'aria-valuenow': current, 'aria-valuetext': valueText }
    : { 'aria-valuetext': valueText };

  // pointer tracking for the stepper pill: a click that does not move it opens edit mode
  const downRef = useRef<{ x: number; v: number } | null>(null);

  const mark = (v: number) => ({ '--slider-p': positionOf(scale, v) }) as CSSProperties;

  const bubbleInput = (entry: ReturnType<typeof useNumericEntry>, extra: Record<string, unknown>, inPill: boolean, onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void, onBlur?: () => void) => (
    <span className="ds-slider-bubble-input" data-in-pill={inPill || undefined}>
      <input
        {...inputProps}
        {...entry.props}
        {...extra}
        onKeyDown={onKeyDown ?? entry.props.onKeyDown}
        onBlur={onBlur ?? entry.props.onBlur}
        className="ds-slider-bubble-field"
        data-testid={undefined}
      />
      {unit && (
        <span aria-hidden="true" className="ds-slider-unit">
          {unit}
        </span>
      )}
    </span>
  );

  const button = (dir2: -1 | 1) => {
    const atEnd = dir2 === -1 ? current <= first : current >= last;
    return (
      <button
        type="button"
        className="ds-slider-step"
        data-dir={dir2 === -1 ? 'dec' : 'inc'}
        tabIndex={-1}
        disabled={isDisabled || atEnd}
        aria-controls={thumbId}
        {...(dir2 === -1 ? buttonNaming(verbDownId, 'Decrease') : buttonNaming(verbUpId, 'Increase'))}
        onClick={() => stepBy(dir2)}
      >
        <svg
          width={size === 'sm' ? 12 : 16}
          height={size === 'sm' ? 12 : 16}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d={dir2 === -1 ? 'M2 8h12' : 'M2 8h12M8 2v12'} />
        </svg>
      </button>
    );
  };

  return (
    <div
      className={cx('ds-slider', className)}
      data-size={size}
      data-bubble={bubble}
      data-stepper={stepper || undefined}
      data-marks={labels.length ? 'labels' : undefined}
      data-disabled={isDisabled ? '' : undefined}
      data-invalid={isInvalid || undefined}
      data-dir={dir ?? 'ltr'}
      style={style}
    >
      <div className="ds-slider-row">
        <div className="ds-slider-main">
          <div className="ds-slider-box">
            {stepper && button(-1)}
            <RadixSlider.Root
              ref={ref}
              className="ds-slider-root"
              min={values ? 0 : min}
              max={values ? values.length - 1 : max}
              step={values ? 1 : step}
              value={[toRadix(current)]}
              onValueChange={([i]) => {
                if (i === undefined) return;
                const next = fromRadix(i);
                if (next === current) return;
                attached.discard();
                change(next, false);
              }}
              onValueCommit={([i]) => i !== undefined && onValueCommit?.(fromRadix(i))}
              disabled={isDisabled}
              orientation="horizontal"
              inverted={false}
              dir={dir}
            >
              <RadixSlider.Track className="ds-slider-track">
                <RadixSlider.Range className="ds-slider-range" />
              </RadixSlider.Track>
              <RadixSlider.Thumb
                ref={thumbRef}
                id={thumbId}
                className="ds-slider-thumb"
                data-editing={editing || undefined}
                {...thumbNaming}
                {...thumbValueProps}
                aria-invalid={isInvalid || undefined}
                aria-describedby={describedBy}
                aria-required={required}
                onKeyDown={(e) => {
                  if (stepperEdit && e.key === 'Enter' && !isDisabled) {
                    e.preventDefault();
                    editEntry.set(bare(current));
                    setEditing(true);
                  }
                }}
                onPointerDown={(e: ReactPointerEvent) => {
                  downRef.current = { x: e.clientX, v: current };
                }}
                onPointerUp={(e: ReactPointerEvent) => {
                  const d = downRef.current;
                  downRef.current = null;
                  if (stepperEdit && d && !isDisabled && Math.abs(e.clientX - d.x) <= 4 && d.v === current) {
                    editEntry.set(bare(current));
                    setEditing(true);
                  }
                }}
              >
                {stepper && (
                  <span aria-hidden="true" className="ds-slider-pill-text">
                    {valueText}
                  </span>
                )}
                {bubble === 'auto' && (
                  <span aria-hidden="true" className="ds-slider-bubble">
                    {valueText}
                  </span>
                )}
              </RadixSlider.Thumb>
            </RadixSlider.Root>
            {ticks.length > 0 && (
              <span aria-hidden="true" className="ds-slider-ticks">
                {ticks.map((v, i) => (
                  <span key={i} className="ds-slider-tick" style={mark(v)} data-filled={v <= current || undefined} />
                ))}
              </span>
            )}
            {labels.length > 0 && (
              <span aria-hidden="true" className="ds-slider-labels">
                {labels.map((v, i) => (
                  <span key={i} className="ds-slider-mark-label" style={mark(v)} data-current={v === current || undefined}>
                    {fmt(v)}
                  </span>
                ))}
              </span>
            )}
            {stepper && button(1)}
            {stepperEdit && editing && (
              <span className="ds-slider-edit">
                {bubbleInput(
                  editEntry,
                  {
                    autoFocus: true,
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.select(),
                  },
                  true,
                  (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      editEntry.commit();
                      closeEdit(true);
                    } else if (e.key === 'Escape') {
                      e.stopPropagation();
                      editEntry.discard();
                      closeEdit(true);
                    }
                  },
                  () => {
                    editEntry.commit();
                    closeEdit(false);
                  },
                )}
              </span>
            )}
          </div>
          {always && !stepper && (
            <span className="ds-slider-above">
              {bubbleInput(attached, { id: controlId }, false, (e) => attached.props.onKeyDown(e))}
            </span>
          )}
        </div>
        {showInput && (
          <span className="ds-slider-input">
            <Input
              {...inputProps}
              {...attached.props}
              id={controlId}
              invalid={isInvalid}
              className="ds-slider-input-field"
            />
            {unit && (
              <span aria-hidden="true" className="ds-slider-unit">
                {unit}
              </span>
            )}
          </span>
        )}
      </div>
      {unit && (
        <span id={unitId} className="ds-slider-sr">
          {unit}
        </span>
      )}
      {stepper && (
        <>
          <span id={verbDownId} className="ds-slider-sr">
            Decrease
          </span>
          <span id={verbUpId} className="ds-slider-sr">
            Increase
          </span>
        </>
      )}
      {name && <input type="hidden" name={name} value={current} />}
      <span aria-live="polite" className="ds-slider-sr">
        {message}
      </span>
    </div>
  );
});
Slider.displayName = 'Slider';

/** Field + Slider in one. */
export const SliderField = forwardRef<ElementRef<typeof RadixSlider.Root>, SliderFieldProps>((props, ref) => {
  const { label, hint, error, required, fieldClassName, id, disabled, ...rest } = props;
  return (
    <Field label={label} hint={hint} error={error} id={id} disabled={disabled} required={required} className={fieldClassName}>
      <Slider ref={ref} {...(rest as SliderProps)} />
    </Field>
  );
});
SliderField.displayName = 'SliderField';
