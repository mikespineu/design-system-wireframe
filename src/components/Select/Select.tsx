import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { Popover, Select as RadixSelect } from 'radix-ui';
import { cx } from '../../lib/cx';
import { Field, useFieldControl, useFieldLabelId } from '../Input';
import { Icon } from '../Icon';
import './Select.css';

export interface SelectOption {
  /** Non-empty and unique (Radix reserves '' for "no value"). */
  value: string;
  /** Plain text: accessible name, typeahead, search, native option text. */
  label: string;
  /** Leading decorative emoji, e.g. a flag. */
  emoji?: string;
  disabled?: boolean;
  /** Extra search terms (search variant only). */
  keywords?: string[];
}

interface OwnProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  topValues?: string[];
  topLabel?: string;
  restLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsText?: (query: string) => string;
  native?: 'auto' | boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  className?: string;
}

export interface SelectProps
  extends OwnProps,
    Omit<ComponentPropsWithoutRef<'button'>, keyof OwnProps | 'children' | 'type'> {}

export interface SelectFieldProps extends SelectProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Class for the Field wrapper; `className` goes to the trigger. */
  fieldClassName?: string;
}

interface Group {
  label?: string;
  options: SelectOption[];
}

const NATIVE_QUERY = '(hover: none) and (pointer: coarse)';
const subscribeNative = (cb: () => void) => {
  const mql = window.matchMedia(NATIVE_QUERY);
  mql.addEventListener?.('change', cb);
  return () => mql.removeEventListener?.('change', cb);
};
const nativeSnapshot = () => window.matchMedia(NATIVE_QUERY).matches;
const nativeServerSnapshot = () => false;

const normalize = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();

const buildGroups = (options: SelectOption[], topValues: string[] | undefined, topLabel: string, restLabel: string): Group[] => {
  if (!topValues || topValues.length === 0) return [{ options }];
  const byValue = new Map(options.map((o) => [o.value, o]));
  const seen = new Set<string>();
  const top: SelectOption[] = [];
  for (const v of topValues) {
    const o = byValue.get(v);
    if (o && !seen.has(v)) {
      seen.add(v);
      top.push(o);
    }
  }
  const rest = options.filter((o) => !seen.has(o.value));
  return [
    ...(top.length ? [{ label: topLabel, options: top }] : []),
    ...(rest.length ? [{ label: restLabel, options: rest }] : []),
  ];
};

const EmojiSlot = ({ emoji }: { emoji?: string }) => (
  <span className="ds-select-emoji" aria-hidden="true">
    {emoji}
  </span>
);

const setRef = <T,>(ref: Ref<T> | undefined, node: T | null) => {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
};

type Common = {
  options: SelectOption[];
  groups: Group[];
  hasEmoji: boolean;
  placeholder: string;
  className?: string;
  rest: Record<string, unknown>;
  controlProps: Record<string, unknown>;
  name?: string;
  required?: boolean;
  disabled?: boolean;
};

/* ---------- Native ---------- */

const NativeSelect = forwardRef<HTMLSelectElement, Common & Pick<OwnProps, 'value' | 'defaultValue' | 'onValueChange'>>(
  ({ options, groups, hasEmoji, placeholder, className, rest, controlProps, name, required, disabled, value, defaultValue, onValueChange }, ref) => {
    const { onChange: _ignored, ...restProps } = rest as Record<string, unknown>;
    void _ignored;
    const text = (o: SelectOption) => (o.emoji ? `${o.emoji} ${o.label}` : o.label);
    void hasEmoji;
    void options;
    const valueProps = value !== undefined ? { value } : { defaultValue: defaultValue ?? '' };
    return (
      <span className="ds-select-native-wrap">
        <select
          ref={ref}
          className={cx('ds-select-native', className)}
          name={name}
          required={required}
          disabled={disabled}
          {...(restProps as object)}
          {...controlProps}
          {...valueProps}
          onChange={(e) => onValueChange?.(e.target.value)}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {groups.map((g, i) => {
            const opts = g.options.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {text(o)}
              </option>
            ));
            return g.label ? (
              <optgroup key={i} label={g.label}>
                {opts}
              </optgroup>
            ) : (
              opts
            );
          })}
        </select>
        <Icon name="chevron-down" size={16} className="ds-select-chevron ds-select-native-chevron" />
      </span>
    );
  },
);
NativeSelect.displayName = 'NativeSelect';

/* ---------- Default list (Radix Select) ---------- */

const ListSelect = forwardRef<
  HTMLButtonElement,
  Common & Pick<OwnProps, 'value' | 'defaultValue' | 'onValueChange' | 'open' | 'defaultOpen' | 'onOpenChange'>
>(({ groups, hasEmoji, placeholder, className, rest, controlProps, name, required, disabled, value, defaultValue, onValueChange, open, defaultOpen, onOpenChange }, ref) => {
  const renderItem = (o: SelectOption) => (
    <RadixSelect.Item key={o.value} value={o.value} textValue={o.label} disabled={o.disabled} className="ds-select-item">
      <RadixSelect.ItemText className="ds-select-item-text">
        {hasEmoji && <EmojiSlot emoji={o.emoji} />}
        <span className="ds-select-label">{o.label}</span>
      </RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="ds-select-check">
        <Icon name="check" size={16} strokeWidth={2} />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
  return (
    <RadixSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      name={name}
      required={required}
      disabled={disabled}
    >
      <RadixSelect.Trigger ref={ref} className={cx('ds-select-trigger', className)} {...rest} {...controlProps}>
        <RadixSelect.Value
          placeholder={
            <>
              {hasEmoji && <EmojiSlot />}
              <span className="ds-select-label">{placeholder}</span>
            </>
          }
        />
        <RadixSelect.Icon asChild>
          <Icon name="chevron-down" size={16} className="ds-select-chevron" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className="ds-select-content"
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
        >
          <RadixSelect.ScrollUpButton className="ds-select-scroll ds-select-scroll-up">
            <Icon name="chevron-down" size={16} />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="ds-select-viewport">
            {groups.map((g, i) => {
              const items = g.options.map(renderItem);
              return g.label ? (
                <RadixSelect.Group key={i}>
                  {i > 0 && <RadixSelect.Separator className="ds-select-separator" />}
                  <RadixSelect.Label className="ds-select-group-label">{g.label}</RadixSelect.Label>
                  {items}
                </RadixSelect.Group>
              ) : (
                items
              );
            })}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="ds-select-scroll ds-select-scroll-down">
            <Icon name="chevron-down" size={16} />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
});
ListSelect.displayName = 'ListSelect';

/* ---------- Searchable (Radix Popover + ARIA combobox) ---------- */

type SearchProps = Common &
  Pick<OwnProps, 'value' | 'defaultValue' | 'onValueChange' | 'open' | 'defaultOpen' | 'onOpenChange' | 'searchPlaceholder' | 'noResultsText'> & {
    labelledBy?: string;
    ariaLabel?: string;
  };

const SearchSelect = forwardRef<HTMLButtonElement, SearchProps>(
  (
    {
      options,
      groups,
      hasEmoji,
      placeholder,
      className,
      rest,
      controlProps,
      name,
      disabled,
      value,
      defaultValue,
      onValueChange,
      open: openProp,
      defaultOpen,
      onOpenChange,
      searchPlaceholder = 'Search',
      noResultsText = (q) => `No results for “${q}”`,
      labelledBy,
      ariaLabel,
    },
    ref,
  ) => {
    const listId = useId();
    const [innerValue, setInnerValue] = useState(defaultValue ?? '');
    const current = value ?? innerValue;
    const [innerOpen, setInnerOpen] = useState(defaultOpen ?? false);
    const open = openProp ?? innerOpen;
    const [query, setQuery] = useState('');
    const [activeValue, setActiveValue] = useState<string | null>(null);
    const [announced, setAnnounced] = useState<{ query: string; text: string }>({ query: '', text: '' });
    const announce = open && query && announced.query === query ? announced.text : '';
    const inputRef = useRef<HTMLInputElement>(null);

    const ordered = useMemo(() => groups.flatMap((g) => g.options), [groups]);
    const filtered = useMemo(() => {
      const q = normalize(query.trim());
      if (!q) return ordered;
      return ordered.filter((o) => [o.label, ...(o.keywords ?? [])].some((t) => normalize(t).includes(q)));
    }, [ordered, query]);
    const enabled = filtered.filter((o) => !o.disabled);
    const active =
      enabled.find((o) => o.value === activeValue) ??
      (query ? undefined : enabled.find((o) => o.value === current)) ??
      enabled[0];
    const selected = options.find((o) => o.value === current);
    const optId = (o: SelectOption) => `${listId}-opt-${ordered.indexOf(o)}`;

    const setOpen = (next: boolean) => {
      if (!next) {
        setQuery('');
        setActiveValue(null);
      }
      if (openProp === undefined) setInnerOpen(next);
      onOpenChange?.(next);
    };
    const choose = (o: SelectOption) => {
      if (o.disabled) return;
      if (value === undefined) setInnerValue(o.value);
      onValueChange?.(o.value);
      setOpen(false);
    };

    useEffect(() => {
      if (!open || !active) return;
      document.getElementById(optId(active))?.scrollIntoView?.({ block: 'nearest' });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, active?.value]);

    useEffect(() => {
      if (!open || !query) return;
      const n = filtered.length;
      const text = n === 0 ? 'No results' : `${n} ${n === 1 ? 'result' : 'results'}`;
      const t = setTimeout(() => setAnnounced({ query, text }), 300);
      return () => clearTimeout(t);
    }, [open, query, filtered.length]);

    const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      (rest.onKeyDown as ((e: KeyboardEvent<HTMLButtonElement>) => void) | undefined)?.(e);
      if (e.defaultPrevented || open) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setQuery(e.key);
        setOpen(true);
      }
    };

    const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!enabled.length) return;
        const idx = active ? enabled.indexOf(active) : -1;
        const next = e.key === 'ArrowDown' ? Math.min(idx + 1, enabled.length - 1) : Math.max(idx - 1, 0);
        setActiveValue(enabled[next]?.value ?? null);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (active) choose(active);
      }
    };

    const renderOption = (o: SelectOption) => {
      const isSelected = o.value === current;
      const isActive = active?.value === o.value;
      return (
        <div
          key={o.value}
          id={optId(o)}
          role="option"
          aria-selected={isSelected}
          aria-disabled={o.disabled || undefined}
          data-state={isSelected ? 'checked' : 'unchecked'}
          data-highlighted={isActive ? '' : undefined}
          data-disabled={o.disabled ? '' : undefined}
          className="ds-select-item"
          onMouseDown={(e) => e.preventDefault()}
          onMouseMove={() => !o.disabled && !isActive && setActiveValue(o.value)}
          onClick={() => choose(o)}
        >
          {hasEmoji && <EmojiSlot emoji={o.emoji} />}
          <span className="ds-select-label">{o.label}</span>
          <span className="ds-select-check">{isSelected && <Icon name="check" size={16} strokeWidth={2} />}</span>
        </div>
      );
    };

    const grouped = !query && groups.some((g) => g.label);
    const { onKeyDown: _k, ...restNoKey } = rest as Record<string, unknown>;
    void _k;

    return (
      <Popover.Root modal open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            data-placeholder={selected ? undefined : ''}
            data-disabled={disabled ? '' : undefined}
            disabled={disabled}
            className={cx('ds-select-trigger', className)}
            {...restNoKey}
            {...controlProps}
            onKeyDown={onTriggerKeyDown}
          >
            <span className="ds-select-value">
              {hasEmoji && <EmojiSlot emoji={selected?.emoji} />}
              <span className="ds-select-label">{selected ? selected.label : placeholder}</span>
            </span>
            <Icon name="chevron-down" size={16} className="ds-select-chevron" />
          </button>
        </Popover.Trigger>
        {name && <input type="hidden" name={name} value={current} />}
        <Popover.Portal>
          <Popover.Content
            className="ds-select-content ds-select-content-search"
            side="bottom"
            align="start"
            sideOffset={4}
            collisionPadding={8}
            avoidCollisions={!query}
            aria-label={searchPlaceholder}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
          >
            <div className="ds-select-search">
              <Icon name="search" size={16} />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={active ? optId(active) : undefined}
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                autoComplete="off"
                className="ds-select-search-input"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveValue(null);
                }}
                onKeyDown={onInputKeyDown}
              />
            </div>
            <div
              id={listId}
              role="listbox"
              aria-labelledby={labelledBy}
              aria-label={labelledBy ? undefined : ariaLabel}
              className="ds-select-viewport"
              hidden={filtered.length === 0}
            >
              {grouped
                ? groups.map((g, i) => {
                    const gid = `${listId}-g${i}`;
                    return (
                      <div key={i} role="group" aria-labelledby={g.label ? gid : undefined}>
                        {i > 0 && <div className="ds-select-separator" role="presentation" />}
                        {g.label && (
                          <div id={gid} className="ds-select-group-label">
                            {g.label}
                          </div>
                        )}
                        {g.options.map(renderOption)}
                      </div>
                    );
                  })
                : filtered.map(renderOption)}
            </div>
            {filtered.length === 0 && <div className="ds-select-empty">{noResultsText(query)}</div>}
            <div role="status" aria-live="polite" className="ds-select-sr">
              {announce}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);
SearchSelect.displayName = 'SearchSelect';

/* ---------- Public ---------- */

export const Select = forwardRef<HTMLButtonElement | HTMLSelectElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      placeholder = 'Select an option',
      topValues,
      topLabel = 'Top choices',
      restLabel = 'All options',
      searchable = false,
      searchPlaceholder,
      noResultsText,
      native = 'auto',
      open,
      defaultOpen,
      onOpenChange,
      name,
      required,
      disabled,
      invalid,
      id,
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const field = useFieldControl();
    const fieldLabelId = useFieldLabelId();
    const autoNative = useSyncExternalStore(subscribeNative, nativeSnapshot, nativeServerSnapshot);
    const isNative = native === 'auto' ? autoNative : native;

    const groups = useMemo(() => buildGroups(options, topValues, topLabel, restLabel), [options, topValues, topLabel, restLabel]);
    const hasEmoji = options.some((o) => o.emoji);

    const normalizeValue = (v: string | undefined) => {
      if (v === undefined || v === '') return v;
      if (options.some((o) => o.value === v)) return v;
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Select: value "${v}" matches no option; showing the placeholder.`);
      }
      return '';
    };
    const safeValue = normalizeValue(value);
    const safeDefault = normalizeValue(defaultValue);

    const isDisabled = disabled ?? field?.disabled;
    const isRequired = required;
    const controlProps: Record<string, unknown> = {
      id: id ?? field?.id,
      'aria-invalid': invalid ? true : field?.['aria-invalid'],
      'aria-describedby': (rest['aria-describedby'] as string | undefined) ?? field?.['aria-describedby'],
      'aria-required': isRequired ? true : field?.['aria-required'],
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    };
    for (const k of Object.keys(controlProps)) if (controlProps[k] === undefined) delete controlProps[k];
    const restProps = { ...rest } as Record<string, unknown>;
    delete restProps['aria-describedby'];

    const common: Common = {
      options,
      groups,
      hasEmoji,
      placeholder,
      className,
      rest: restProps,
      controlProps,
      name,
      required: isRequired,
      disabled: isDisabled,
    };

    if (isNative) {
      return (
        <NativeSelect
          ref={ref as Ref<HTMLSelectElement>}
          {...common}
          value={safeValue}
          defaultValue={safeDefault}
          onValueChange={onValueChange}
        />
      );
    }
    if (searchable) {
      return (
        <SearchSelect
          ref={(n) => setRef(ref as Ref<HTMLButtonElement>, n)}
          {...common}
          value={safeValue}
          defaultValue={safeDefault}
          onValueChange={onValueChange}
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
          searchPlaceholder={searchPlaceholder}
          noResultsText={noResultsText}
          labelledBy={ariaLabelledBy ?? fieldLabelId ?? undefined}
          ariaLabel={ariaLabel}
        />
      );
    }
    return (
      <ListSelect
        ref={ref as Ref<HTMLButtonElement>}
        {...common}
        value={safeValue}
        defaultValue={safeDefault}
        onValueChange={onValueChange}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      />
    );
  },
);
Select.displayName = 'Select';

/** Field + Select in one. */
export const SelectField = forwardRef<HTMLButtonElement | HTMLSelectElement, SelectFieldProps>(
  ({ label, hint, error, fieldClassName, id, disabled, required, ...rest }, ref) => (
    <Field label={label} hint={hint} error={error} id={id} disabled={disabled} required={required} className={fieldClassName}>
      <Select ref={ref} required={required} {...rest} />
    </Field>
  ),
);
SelectField.displayName = 'SelectField';
