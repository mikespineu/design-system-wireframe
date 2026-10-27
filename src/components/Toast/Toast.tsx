import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { Toast as RadixToast, VisuallyHidden } from 'radix-ui';
import { cx } from '../../lib/cx';
import { Button } from '../Button';
import { RoleIcon } from '../Icon/RoleIcon';
import type { IconRole } from '../Icon';
import './Toast.css';

export type ToastSeverity = 'info' | 'success' | 'error';

export interface ToastAction {
  /** Visible Button text, e.g. 'Undo'. */
  label: string;
  /** How to do this without the toast (screen-reader alternative). */
  altText: string;
  /** Runs, then the toast closes. */
  onClick: () => void;
}

export interface ToastOptions {
  severity?: ToastSeverity;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  /** ms. Defaults depend on severity and action. `Infinity` stays until closed. */
  duration?: number;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Announcement prefix. */
  label?: string;
}

export interface ToasterProps extends ComponentPropsWithoutRef<typeof RadixToast.Viewport> {
  className?: string;
}

export interface UseToast {
  toast: (options: ToastOptions) => string;
  update: (id: string, options: Partial<ToastOptions>) => void;
  dismiss: (id?: string) => void;
}

interface Entry {
  id: string;
  /** Changes when the toast is replaced (severity change), remounting it. */
  rev: number;
  open: boolean;
  options: ToastOptions;
}

const MAX_VISIBLE = 3;
const PRUNE_DELAY = 400;

const config: Record<ToastSeverity, { icon: IconRole; strokeWidth: number; prefix?: string; type: 'foreground' | 'background' }> = {
  info: { icon: 'info', strokeWidth: 1.5, type: 'background' },
  success: { icon: 'success', strokeWidth: 2, prefix: 'Success: ', type: 'background' },
  error: { icon: 'warning', strokeWidth: 2, prefix: 'Error: ', type: 'foreground' },
};

const defaultDuration = (o: ToastOptions) =>
  (o.severity ?? 'info') === 'error' ? Infinity : o.action ? 8000 : 5000;

interface Ctx extends UseToast {
  entries: Entry[];
  remove: (id: string) => void;
  setOpen: (id: string, open: boolean) => void;
}

const ToastContext = createContext<Ctx | null>(null);

const useCtx = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast and Toaster must be used inside <ToastProvider>');
  return ctx;
};

export const ToastProvider = ({ children, label = 'Notification' }: ToastProviderProps) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const counter = useRef(0);

  const toast = useCallback((options: ToastOptions) => {
    const id = `toast-${++counter.current}`;
    setEntries((prev) => {
      const next = [...prev, { id, rev: 0, open: true, options }];
      let toClose = next.filter((e) => e.open).length - MAX_VISIBLE;
      return next.map((e) => {
        if (e.open && toClose > 0) {
          toClose -= 1;
          return { ...e, open: false };
        }
        return e;
      });
    });
    return id;
  }, []);

  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const merged = { ...e.options, ...options } as ToastOptions;
        const replaced = (merged.severity ?? 'info') !== (e.options.severity ?? 'info');
        return { ...e, options: merged, rev: replaced ? e.rev + 1 : e.rev };
      }),
    );
  }, []);

  const dismiss = useCallback((id?: string) => {
    setEntries((prev) => prev.map((e) => (id === undefined || e.id === id ? { ...e, open: false } : e)));
  }, []);

  const setOpen = useCallback((id: string, open: boolean) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, open } : e)));
  }, []);

  const remove = useCallback((id: string) => setEntries((prev) => prev.filter((e) => e.id !== id)), []);

  // Drop closed entries once their exit motion has had time to finish.
  const hasClosed = entries.some((e) => !e.open);
  useEffect(() => {
    if (!hasClosed) return;
    const t = setTimeout(() => setEntries((prev) => prev.filter((e) => e.open)), PRUNE_DELAY);
    return () => clearTimeout(t);
  }, [hasClosed, entries]);

  const value = useMemo<Ctx>(
    () => ({ entries, toast, update, dismiss, remove, setOpen }),
    [entries, toast, update, dismiss, remove, setOpen],
  );

  return (
    <ToastContext.Provider value={value}>
      <RadixToast.Provider label={label} swipeDirection="right" swipeThreshold={50}>
        {children}
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = (): UseToast => {
  const { toast, update, dismiss } = useCtx();
  return useMemo(() => ({ toast, update, dismiss }), [toast, update, dismiss]);
};

const ToastItem = ({ entry, onOpenChange }: { entry: Entry; onOpenChange: (open: boolean) => void }) => {
  const { options, open } = entry;
  const severity = options.severity ?? 'info';
  const c = config[severity];
  return (
    <RadixToast.Root
      className="ds-toast"
      data-severity={severity}
      type={c.type}
      duration={options.duration ?? defaultDuration(options)}
      open={open}
      onOpenChange={onOpenChange}
    >
      <RoleIcon role={c.icon} size="lg" strokeWidth={c.strokeWidth} className="ds-toast-icon" />
      <div className="ds-toast-content">
        <RadixToast.Title className="ds-toast-title">
          {c.prefix && <VisuallyHidden.Root>{c.prefix}</VisuallyHidden.Root>}
          {options.title}
        </RadixToast.Title>
        {options.description !== undefined && (
          <RadixToast.Description className="ds-toast-description">{options.description}</RadixToast.Description>
        )}
        {options.action && (
          <div className="ds-toast-action">
            <RadixToast.Action altText={options.action.altText} asChild>
              <Button variant="secondary" onClick={options.action.onClick}>
                {options.action.label}
              </Button>
            </RadixToast.Action>
          </div>
        )}
      </div>
      <RadixToast.Close asChild>
        <button type="button" className="ds-toast-close" aria-label="Close">
          <RoleIcon role="close" size="md" />
        </button>
      </RadixToast.Close>
    </RadixToast.Root>
  );
};

/** Renders the viewport and the current toasts. Render once, inside `ToastProvider`. */
export const Toaster = forwardRef<HTMLOListElement, ToasterProps>(({ className, ...rest }, ref) => {
  const { entries, setOpen } = useCtx();
  return (
    <>
      {entries.map((e) => (
        <ToastItem key={`${e.id}:${e.rev}`} entry={e} onOpenChange={(o) => setOpen(e.id, o)} />
      ))}
      <RadixToast.Viewport ref={ref} className={cx('ds-toaster', className)} {...rest} />
    </>
  );
});
Toaster.displayName = 'Toaster';
