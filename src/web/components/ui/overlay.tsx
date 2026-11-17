import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, CircleCheck, CircleX, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { IconTile, type Tone } from './misc';
import { Orb } from './thinking-orbs/orb';

// Modal dialog: portal, Escape to close, focus moves inside, click outside closes.
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  footerStart,
  icon,
  tone = 'neutral',
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  // Left side of the footer: a note or a step counter.
  footerStart?: ReactNode;
  // An icon tile above the title, for confirmations.
  icon?: ReactNode;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useLayoutEffect(() => {
    if (!open) return;
    // Restore opener focus before React detaches the dialog's focused node.
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const focusable = panel.current?.querySelector<HTMLElement>('button[data-autofocus], [autofocus], input:not([disabled]), textarea:not([disabled]), select:not([disabled])');
      (focusable ?? panel.current)?.focus();
    }, 0);
    const onKey = (e: KeyboardEvent) => {
      // Only the topmost modal handles keyboard navigation when dialogs are nested.
      const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if (modals[modals.length - 1] !== panel.current) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []).filter((el) => el.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) {
        e.preventDefault();
        panel.current?.focus();
      } else if (e.shiftKey && (document.activeElement === first || !panel.current?.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !panel.current?.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  const width = { sm: 'max-w-[420px]', md: 'max-w-[520px]', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-scrim animate-fade-in">
      <div className="flex min-h-full items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} className={cn('max-h-[calc(100dvh-32px)] w-full overflow-y-auto rounded-[14px] border border-border bg-surface shadow-pop outline-none animate-pop-in', width)}>
          <div className={cn('flex items-start gap-4', icon ? 'px-[22px] pt-[22px]' : 'pt-5 pr-4 pl-[22px]')}>
            <div className="min-w-0 flex-1">
              {icon && (
                <IconTile tone={tone} size={40} className="mb-3.5">
                  {icon}
                </IconTile>
              )}
              <h2 id={titleId} className="text-base font-semibold text-fg">{title}</h2>
              {description && <p id={descriptionId} className="mt-0.5 text-[13px] text-muted text-pretty">{description}</p>}
            </div>
            {!icon && (
              <button type="button" onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md text-faint hover:bg-surface-2 hover:text-fg" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {children ? <div className="px-[22px] pt-4 pb-5">{children}</div> : <div className="h-5" />}
          {footer && (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface-2 px-[22px] py-3.5">
              {footerStart && <div className="mr-auto flex items-center gap-1.5 text-[12.5px] text-muted">{footerStart}</div>}
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Confirm',
  danger,
  loading,
  icon,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      icon={icon}
      tone={danger ? 'danger' : 'primary'}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} data-autofocus>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children && <div className="text-[13px] text-muted text-pretty">{children}</div>}
    </Dialog>
  );
}

// Dropdown menu anchored to its trigger.
export function Menu({ trigger, children, align = 'end', className }: { trigger: (props: { onClick: () => void; open: boolean }) => ReactNode; children: ReactNode; align?: 'start' | 'end'; className?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  return (
    <div ref={root} className="relative inline-block">
      {trigger({ onClick: () => setOpen((o) => !o), open })}
      {open && (
        <div
          className={cn(
            'absolute z-40 mt-1 min-w-[220px] rounded-[10px] border border-border bg-surface p-[5px] shadow-pop animate-fade-in',
            align === 'end' ? 'right-0' : 'left-0',
            className,
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  icon,
  children,
  onClick,
  danger,
  disabled,
  hint,
  checked,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  // Right-aligned: a shortcut key or a time.
  hint?: ReactNode;
  checked?: boolean;
}) {
  const short = typeof hint === 'string' && hint.length <= 3;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-[13px] whitespace-nowrap transition-colors disabled:opacity-50',
        danger ? 'text-danger hover:bg-danger-soft' : 'text-fg hover:bg-surface-2',
      )}
    >
      {icon && <span className={cn('flex [&>svg]:h-[15px] [&>svg]:w-[15px]', danger ? 'text-danger' : 'text-muted')}>{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {hint && <span className={cn('text-faint tabular-nums', short ? 'font-mono text-[11px] font-medium' : 'text-xs')}>{hint}</span>}
      {checked && <Check className="h-3.5 w-3.5 text-primary-text" />}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="mx-0.5 my-[5px] h-px bg-border" />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className="px-2 pt-[5px] pb-1 text-[11.5px] font-medium text-faint">{children}</div>;
}

// Toasts and quick in-app notifications -------------------------------------------------------
// One state system for Undo, success, error, information and real asynchronous work.
// Recent activity is memory-only; never store mail content or account data in localStorage.
type ToastTone = 'success' | 'error' | 'info' | 'pending' | 'loading' | 'retrying';
type FinishedTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  message: ReactNode;
  action?: { label: string; onClick: () => void };
  duration: number; // 0 means until explicitly dismissed or updated.
  version: number;
}
interface Notice {
  id: number;
  tone: FinishedTone;
  message: ReactNode;
  at: number;
  read: boolean;
}
type Push = (t: Omit<Toast, 'id' | 'duration' | 'version'> & { duration?: number }) => number;
type Update = (id: number, next: { tone: FinishedTone; message: ReactNode; action?: Toast['action']; duration?: number }) => void;
interface ToastControls {
  push: Push;
  update: Update;
  dismiss: (id: number) => void;
  clear: () => void;
}
interface NoticeControls {
  items: Notice[];
  markRead: () => void;
  clear: () => void;
}
const ToastContext = createContext<ToastControls>({
  push: () => 0, update: () => {}, dismiss: () => {}, clear: () => {},
});
const NoticeContext = createContext<NoticeControls>({ items: [], markRead: () => {}, clear: () => {} });

function statusIcon(tone: ToastTone, size = 'h-[16px] w-[16px]') {
  if (tone === 'pending' || tone === 'loading' || tone === 'retrying') {
    const state = tone === 'pending' ? 'waiting' : tone === 'retrying' ? 'retrying' : 'working';
    return <span data-thinking-orb className="inline-flex shrink-0 text-primary-text"><Orb state={state} size={20} /></span>;
  }
  const Icon = tone === 'success' ? CircleCheck : tone === 'error' ? CircleX : Info;
  return <Icon aria-hidden="true" className={cn(size, 'shrink-0', tone === 'success' ? 'text-success' : tone === 'error' ? 'text-danger' : 'text-primary-text')} />;
}

function ToastItem({ toast: t, dismiss }: { toast: Toast; dismiss: (id: number) => void }) {
  // Undo send is a genuine timed window. A generic loading state is not a countdown.
  const [left, setLeft] = useState(Math.ceil(t.duration / 1000));
  useEffect(() => {
    if (t.tone !== 'pending' || t.duration <= 0) return;
    const end = Date.now() + t.duration;
    const id = setInterval(() => setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000))), 250);
    return () => clearInterval(id);
  }, [t.tone, t.duration, t.version]);

  return (
    <div
      role={t.tone === 'error' ? 'alert' : 'status'}
      aria-live={t.tone === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto relative flex min-h-12 items-center gap-3 overflow-hidden rounded-xl border bg-surface py-2.5 pr-2.5 pl-3.5 text-[13px] text-fg shadow-pop animate-slide-up',
        t.tone === 'error' ? 'border-danger/35' : 'border-border',
      )}
    >
      {statusIcon(t.tone)}
      <div className="min-w-0 flex-1 font-medium">{t.message}</div>
      {t.action && (
        <button
          type="button"
          className={cn('flex h-8 shrink-0 items-center gap-2 rounded-lg px-2.5 font-semibold', t.tone === 'pending' ? 'bg-surface-2 hover:bg-surface-3' : 'text-primary-text hover:bg-surface-2')}
          onClick={() => {
            t.action!.onClick();
            dismiss(t.id);
          }}
        >
          {t.action.label}
          {t.tone === 'pending' && <span className="font-normal text-faint tabular-nums">{left}s</span>}
        </button>
      )}
      {t.tone !== 'pending' && (
        <button type="button" onClick={() => dismiss(t.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint hover:bg-surface-2 hover:text-fg" aria-label="Dismiss notification">
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
      {t.tone === 'pending' && t.duration > 0 && <div className="absolute bottom-0 left-0 h-0.5 bg-primary motion-reduce:hidden" style={{ animation: 'countdown ' + t.duration + 'ms linear forwards' }} />}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [items, setItems] = useState<Notice[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const ids = useRef(0);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);
  const scheduleDismiss = useCallback((id: number, duration: number) => {
    const old = timers.current.get(id);
    if (old) clearTimeout(old);
    timers.current.delete(id);
    if (duration > 0) timers.current.set(id, setTimeout(() => dismiss(id), duration));
  }, [dismiss]);
  const record = useCallback((id: number, tone: FinishedTone, message: ReactNode) => {
    setItems((all) => [{ id, tone, message, at: Date.now(), read: false }, ...all.filter((n) => n.id !== id)].slice(0,20));
  }, []);
  const push = useCallback<Push>((t) => {
    const id = ++ids.current;
    const duration = t.duration ?? (t.tone === 'error' ? 7000 : t.tone === 'pending' || t.tone === 'loading' || t.tone === 'retrying' ? 0 : 4500);
    const toast: Toast = { ...t, id, duration, version: 0 };
    setToasts((all) => [...all.slice(-2), toast]);
    scheduleDismiss(id, duration);
    if (t.tone === 'success' || t.tone === 'error' || t.tone === 'info') record(id, t.tone, t.message);
    return id;
  }, [record, scheduleDismiss]);
  const update = useCallback<Update>((id, next) => {
    const duration = next.duration ?? (next.tone === 'error' ? 7000 : 4500);
    setToasts((all) => all.map((t) => t.id === id ? { ...t, ...next, duration, version: t.version + 1 } : t));
    record(id, next.tone, next.message);
    scheduleDismiss(id, duration);
  }, [record, scheduleDismiss]);
  const clear = useCallback(() => {
    for (const timeout of timers.current.values()) clearTimeout(timeout);
    timers.current.clear();
    setToasts([]);
    setItems([]);
  }, []);
  const markRead = useCallback(() => setItems((all) => all.some((n) => !n.read) ? all.map((n) => ({ ...n, read: true })) : all), []);
  const clearHistory = useCallback(() => setItems([]), []);

  useEffect(() => {
    const active = timers.current;
    return () => {
      for (const timeout of active.values()) clearTimeout(timeout);
      active.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ push, update, dismiss, clear }}>
      <NoticeContext.Provider value={{ items, markRead, clear: clearHistory }}>
        {children}
        {createPortal(
          <div aria-label="In-app updates" className="pointer-events-none fixed top-[calc(66px+env(safe-area-inset-top))] right-3 left-3 z-[60] flex flex-col items-stretch gap-2 sm:top-auto sm:right-auto sm:bottom-6 sm:left-6 sm:w-[360px]">
            {toasts.map((t) => <ToastItem key={t.id + '-' + t.version} toast={t} dismiss={dismiss} />)}
          </div>,
          document.body,
        )}
      </NoticeContext.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const { push, update, dismiss, clear } = useContext(ToastContext);
  return {
    success: (message: ReactNode, action?: Toast['action']) => push({ tone: 'success', message, action }),
    error: (message: ReactNode, action?: Toast['action']) => push({ tone: 'error', message, action }),
    info: (message: ReactNode, action?: Toast['action'], duration?: number) => push({ tone: 'info', message, action, duration }),
    // A counted Undo window: do not convert this into an indeterminate loading toast.
    pending: (message: ReactNode, action: Toast['action'], duration: number) => push({ tone: 'pending', message, action, duration }),
    loading: (message: ReactNode) => push({ tone: 'loading', message }),
    retrying: (message: ReactNode) => push({ tone: 'retrying', message }),
    update: (id: number, tone: FinishedTone, message: ReactNode, action?: Toast['action']) => update(id, { tone, message, action }),
    dismiss,
    // Used when changing accounts: never show the previous user's activity to the next user.
    clear,
  };
}

export function NotificationBell() {
  const { items, markRead, clear } = useContext(NoticeContext);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    markRead();
    const outside = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('keydown', key);
    };
  }, [open, markRead]);

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={trigger}
        type="button"
        aria-label="Notifications"
        aria-controls="necros-notification-center"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <Bell aria-hidden="true" className="h-[18px] w-[18px]" />
        {unread > 0 && <span aria-label={unread + ' unread'} className="absolute top-0.5 right-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-0.5 text-[10px] font-bold leading-none text-primary-fg">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <section
          id="necros-notification-center"
          aria-label="Recent notifications"
          className="absolute top-[calc(100%+10px)] right-0 z-50 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-border bg-surface shadow-pop animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-[13px] font-semibold text-fg">Notifications</h2>
            {items.length > 0 && (
              <button type="button" className="rounded-md px-2 py-1 text-[12px] font-medium text-primary-text hover:bg-surface-2" onClick={clear}>Clear all</button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
              <Bell aria-hidden="true" className="h-5 w-5 text-faint" />
              <p className="text-[13px] font-medium text-fg">You're all caught up</p>
              <p className="text-xs text-muted">Recent app updates will appear here.</p>
            </div>
          ) : (
            <ul className="scroll-thin max-h-[min(60dvh,400px)] overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-0">
                  <div className="mt-0.5">{statusIcon(n.tone)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="break-words text-[12.5px] font-medium leading-5 text-fg">{n.message}</div>
                    <div className="mt-1 text-[11px] text-faint">{new Date(n.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
