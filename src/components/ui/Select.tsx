import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-text-secondary block text-xs font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              "border-border-subtle bg-surface text-text-primary focus:border-primary h-10 w-full cursor-pointer appearance-none rounded-xl border ps-3.5 pe-9 text-sm transition-colors focus:outline-none",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-surface text-text-primary"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="text-text-muted pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
