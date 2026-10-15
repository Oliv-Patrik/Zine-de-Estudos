import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface ToastOptions {
  id?: string;
  message: string;
  action?: ToastAction;
  duration?: number; // ms, default 8000
  type?: 'default' | 'danger' | 'success' | 'info';
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

interface ToastItemProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const SingleToast: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 8000;
  const [remainingTime, setRemainingTime] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const lastTickRef = useRef<number>(Date.now());

  // Check user prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    if (isPaused) {
      lastTickRef.current = Date.now();
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setRemainingTime((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          clearInterval(interval);
          onDismiss(toast.id);
          return 0;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, toast.id, onDismiss]);

  const progressPercent = Math.max(0, Math.min(100, (remainingTime / duration) * 100));

  return (
    <div
      role="status"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        lastTickRef.current = Date.now();
        setIsPaused(false);
      }}
      onFocus={() => setIsPaused(true)}
      onBlur={() => {
        lastTickRef.current = Date.now();
        setIsPaused(false);
      }}
      className="pointer-events-auto w-full max-w-md relative overflow-hidden bg-[#DC2626] text-white border-2 border-black shadow-[4px_4px_0px_#000000] p-3.5 sm:p-4 flex flex-col gap-2.5 outline-none focus:ring-2 focus:ring-black transition-all"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-xs sm:text-sm font-bold font-stencil uppercase tracking-wide leading-snug">
          {toast.message}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-black text-white border border-white text-xs font-bold font-stencil uppercase tracking-wider hover:bg-neutral-900 active:translate-y-0.5 transition-all shadow-[2px_2px_0px_#000000]"
            >
              {toast.action.icon}
              <span>{toast.action.label}</span>
            </button>
          )}

          <button
            onClick={() => onDismiss(toast.id)}
            aria-label="Fechar"
            className="p-1 hover:bg-black/20 text-white rounded transition-colors shrink-0"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Progress Bar indicating time left */}
      <div className="w-full bg-black/30 h-1 overflow-hidden">
        <div
          className={`h-full bg-white ${prefersReducedMotion ? '' : 'transition-all duration-75 ease-linear'}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = options.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastItem = {
      ...options,
      id,
      createdAt: Date.now(),
    };

    setToasts((prev) => {
      // If a toast with the same id exists, replace it
      const filtered = prev.filter((t) => t.id !== id);
      return [...filtered, newToast];
    });

    return id;
  }, []);

  // Dismiss latest toast on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        // Dismiss the most recent toast
        const lastToast = toasts[toasts.length - 1];
        dismissToast(lastToast.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toasts, dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Global Toast Container: Bottom center on desktop, above bottom nav on mobile respecting safe-area-inset-bottom */}
      <div
        aria-live="polite"
        className="fixed z-50 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 flex flex-col gap-2.5 items-center pointer-events-none transition-all duration-300"
        style={{
          bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* On mobile screens, elevate above the 4rem bottom navigation bar */}
        <div className="w-full flex flex-col gap-2.5 items-center pb-16 md:pb-0">
          {toasts.map((toast) => (
            <SingleToast key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
