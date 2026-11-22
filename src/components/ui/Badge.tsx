import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "primary" | "outline" | "glass";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-surface-elevated text-text-secondary border-border-subtle",
  primary: "bg-primary/15 text-primary border-primary/30",
  outline: "bg-transparent text-text-secondary border-border-strong",
  glass: "bg-canvas/75 text-text-primary border-white/10 backdrop-blur-md",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-medium",
        BADGE_VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
