"use client";

import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";
import { useToastStore, type ToastVariant } from "@/stores/toast-store";
import { cn } from "@/lib/utils/cn";

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-500/40 bg-surface-elevated text-emerald-300",
  info: "border-primary/40 bg-surface-elevated text-primary",
  error: "border-rose-500/40 bg-surface-elevated text-rose-300",
};

const VARIANT_ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle2,
  info: Info,
  error: AlertCircle,
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed start-4 bottom-4 z-[60] flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = VARIANT_ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl shadow-black/40 backdrop-blur-md",
              VARIANT_STYLES[toast.variant]
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-text-primary flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="بستن اعلان"
              className="text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
