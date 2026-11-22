"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Film, Plus, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { QuickWatchlistModal } from "@/features/watchlist/QuickWatchlistModal";
import { SUBTYPE_LABELS_FA } from "@/lib/mappers/anime-mapper";
import { formatScore, toPersianNumber } from "@/lib/utils/format";
import { useHasHydrated } from "@/lib/utils/use-has-hydrated";
import { cn } from "@/lib/utils/cn";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { WATCH_STATUS_META } from "@/types/watchlist";
import type { AnimeSummary } from "@/types/anime";

interface AnimeCardProps {
  anime: AnimeSummary;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const isHydrated = useHasHydrated();
  const watchlistEntry = useWatchlistStore((s) => s.items[anime.id]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const inWatchlist = isHydrated && Boolean(watchlistEntry);

  return (
    <>
      <article className="group border-border-subtle bg-surface hover:border-primary/50 hover:shadow-primary/10 relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* دکمه سریع واچ‌لیست (بیرون از تگ Link برای HTML معتبر) */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label={inWatchlist ? "ویرایش واچ‌لیست" : "افزودن به واچ‌لیست"}
          title={inWatchlist ? "ویرایش واچ‌لیست" : "افزودن به واچ‌لیست"}
          className={cn(
            "absolute start-2.5 top-2.5 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border backdrop-blur-md transition-all",
            inWatchlist
              ? "border-primary/50 bg-primary shadow-primary/30 text-slate-950 shadow-md"
              : "bg-canvas/75 text-text-primary hover:border-primary hover:bg-primary border-white/15 opacity-100 hover:text-slate-950 md:opacity-0 md:group-hover:opacity-100"
          )}
        >
          {inWatchlist ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>

        <Link href={`/anime/${anime.slug}`} className="flex flex-1 flex-col">
          {/* تصویر پوستر */}
          <div className="bg-surface-elevated relative aspect-[2/3] w-full overflow-hidden">
            {anime.posterUrl ? (
              <Image
                src={anime.posterUrl}
                alt={anime.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="text-text-muted flex h-full items-center justify-center">
                <Film className="h-10 w-10" />
              </div>
            )}

            {/* گرادیانت پایین پوستر */}
            <div className="from-surface via-surface/40 pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent" />

            {/* امتیاز */}
            <div className="absolute end-2.5 top-2.5">
              <Badge variant="glass" className="gap-1 px-2 py-0.5 font-semibold">
                <Star className="fill-primary text-primary h-3 w-3" />
                <span>{formatScore(anime.ratingOutOf10)}</span>
              </Badge>
            </div>

            {/* وضعیت واچ‌لیست روی پوستر در صورت وجود */}
            {inWatchlist && watchlistEntry && (
              <div className="absolute start-2.5 bottom-2.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold backdrop-blur-md",
                    WATCH_STATUS_META[watchlistEntry.status].badgeClass
                  )}
                >
                  <Bookmark className="h-2.5 w-2.5" />
                  {WATCH_STATUS_META[watchlistEntry.status].label}
                </span>
              </div>
            )}
          </div>

          {/* اطلاعات متنی پایین کارت */}
          <div className="flex flex-1 flex-col justify-between gap-2 p-3">
            <h3
              className="text-text-primary group-hover:text-primary line-clamp-2 text-sm leading-snug font-semibold transition-colors"
              dir="ltr"
            >
              {anime.title}
            </h3>

            <div className="text-text-muted flex items-center justify-between text-xs">
              <span>{SUBTYPE_LABELS_FA[anime.subtype]}</span>
              <span>
                {anime.episodeCount
                  ? `${toPersianNumber(anime.episodeCount)} قسمت`
                  : anime.year
                    ? toPersianNumber(anime.year)
                    : "نامشخص"}
              </span>
            </div>
          </div>
        </Link>
      </article>

      {isModalOpen && (
        <QuickWatchlistModal
          anime={{
            id: anime.id,
            slug: anime.slug,
            title: anime.title,
            posterUrl: anime.posterUrl,
            subtype: anime.subtype,
            episodeCount: anime.episodeCount,
            episodeLength: anime.episodeLength,
            ratingOutOf10: anime.ratingOutOf10,
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="border-border-subtle bg-surface overflow-hidden rounded-2xl border">
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
