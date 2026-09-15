"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";

type Tone = "success" | "error";
type Toast = { id: number; message: string; tone: Tone };
type Notify = (message: string, tone?: Tone) => void;

const VISIBLE_MS = 3000;

const ToastContext = createContext<Notify | null>(null);

export function useToast(): Notify {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useToast must be used inside <ToastProvider>");
  return notify;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const notify = useCallback<Notify>((message, tone = "success") => {
    const id = ++nextId.current;
    setToasts((list) => [...list, { id, message, tone }]);
    setTimeout(() => setToasts((list) => list.filter((toast) => toast.id !== id)), VISIBLE_MS);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className="flex animate-[fadeUp_0.18s_ease] items-center gap-2 rounded-[10px] border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-ink shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          >
            {toast.tone === "success" ? (
              <IconCircleCheck size={17} className="shrink-0 text-green" />
            ) : (
              <IconAlertTriangle size={17} className="shrink-0 text-red" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
