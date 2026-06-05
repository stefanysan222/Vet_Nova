"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Tipos ─────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number; // ms, 0 = no auto-dismiss
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

// ─── Contexto ──────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // máx 5
    if (opts.duration !== 0) {
      setTimeout(() => dismiss(id), opts.duration ?? 4000);
    }
  }, [dismiss]);

  const success = useCallback((title: string, description?: string) =>
    toast({ type: "success", title, description }), [toast]);

  const error = useCallback((title: string, description?: string) =>
    toast({ type: "error", title, description, duration: 0 }), [toast]);

  const warning = useCallback((title: string, description?: string) =>
    toast({ type: "warning", title, description }), [toast]);

  const info = useCallback((title: string, description?: string) =>
    toast({ type: "info", title, description }), [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Estilos por tipo ──────────────────────────────────────────────────────

const STYLES: Record<ToastType, { wrapper: string; icon: typeof CheckCircle; iconClass: string }> = {
  success: {
    wrapper: "border-emerald-200 bg-white dark:border-emerald-800 dark:bg-slate-900",
    icon: CheckCircle,
    iconClass: "text-emerald-500",
  },
  error: {
    wrapper: "border-red-200 bg-white dark:border-red-800 dark:bg-slate-900",
    icon: XCircle,
    iconClass: "text-red-500",
  },
  warning: {
    wrapper: "border-amber-200 bg-white dark:border-amber-800 dark:bg-slate-900",
    icon: AlertTriangle,
    iconClass: "text-amber-500",
  },
  info: {
    wrapper: "border-blue-200 bg-white dark:border-blue-800 dark:bg-slate-900",
    icon: Info,
    iconClass: "text-blue-500",
  },
};

// ─── Item individual ───────────────────────────────────────────────────────

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const s = STYLES[toast.type];
  const Icon = s.icon;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role="alert"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className={`flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-card-md transition-all duration-300 ${s.wrapper} ${
        visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      }`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.iconClass}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        aria-label="Cerrar notificación"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Contenedor ────────────────────────────────────────────────────────────

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-label="Notificaciones"
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}
