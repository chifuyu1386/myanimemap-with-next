import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimeCard } from "./AnimeCard";
import type { AnimeSummary } from "@/types/anime";

interface AnimeGridSectionProps {
  title: string;
  subtitle?: string;
  href?: string;
  items: AnimeSummary[];
}

export function AnimeGridSection({
  title,
  subtitle,
  href,
  items,
}: AnimeGridSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="from-primary to-accent h-6 w-1.5 rounded-full bg-gradient-to-b" />
            <h2 className="text-text-primary text-xl font-bold sm:text-2xl">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-text-secondary text-xs sm:text-sm">{subtitle}</p>
          )}
        </div>

        {href && (
          <Link
            href={href}
            className="text-primary hover:text-primary-hover inline-flex shrink-0 items-center gap-1 text-xs font-semibold transition-colors sm:text-sm"
          >
            <span>مشاهده همه</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
}
