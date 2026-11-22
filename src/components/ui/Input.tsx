import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  startIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, startIcon, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-text-secondary block text-xs font-medium">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <span className="text-text-muted pointer-events-none absolute start-3">
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "border-border-subtle bg-surface text-text-primary placeholder:text-text-muted focus:border-primary h-10 w-full rounded-xl border px-3.5 text-sm transition-colors focus:outline-none",
              startIcon ? "ps-10" : "",
              error ? "border-rose-500/70 focus:border-rose-500" : "",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
