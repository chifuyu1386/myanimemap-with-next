"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useHasHydrated } from "@/lib/utils/use-has-hydrated";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidthClass?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = "max-w-lg",
}: ModalProps) {
  const isHydrated = useHasHydrated();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isHydrated || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "پنجره بازشو"}
    >
      <div
        className="bg-canvas/80 fixed inset-0 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={cn(
          "border-border-strong bg-surface relative z-10 w-full overflow-hidden rounded-2xl border shadow-2xl shadow-black/60",
          maxWidthClass
        )}
      >
        {title && (
          <div className="border-border-subtle flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-text-primary text-base font-bold">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="text-text-secondary hover:bg-surface-elevated hover:text-text-primary cursor-pointer rounded-lg p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
