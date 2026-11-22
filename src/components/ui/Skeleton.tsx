import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-surface-elevated/80 animate-pulse rounded-xl", className)} />
  );
}
