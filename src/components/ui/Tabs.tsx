"use client";

import { cn } from "@/lib/utils/cn";

export interface TabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  items: Array<TabOption<T>>;
  value: T;
  onChange: (next: T) => void;
  className?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "border-border-subtle bg-surface flex items-center gap-1.5 overflow-x-auto rounded-2xl border p-1.5",
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
              isActive
                ? "from-accent/90 to-primary/90 shadow-primary/20 bg-gradient-to-l font-semibold text-slate-950 shadow-md"
                : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            )}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-xs",
                  isActive
                    ? "bg-slate-950/20 text-slate-950"
                    : "bg-canvas text-text-muted"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
