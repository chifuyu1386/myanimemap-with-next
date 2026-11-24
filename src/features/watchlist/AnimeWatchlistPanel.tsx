"use client";

import { Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHasHydrated } from "@/lib/utils/use-has-hydrated";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { WATCH_STATUS_META, type WatchlistAnimeSnapshot } from "@/types/watchlist";
import { WatchlistEntryForm } from "./WatchlistEntryForm";

interface AnimeWatchlistPanelProps {
  anime: WatchlistAnimeSnapshot;
}

export function AnimeWatchlistPanel({ anime }: AnimeWatchlistPanelProps) {
  const isHydrated = useHasHydrated();
  const existing = useWatchlistStore((s) => s.items[anime.id]);

  if (!isHydrated) {
    return (
      <div className="border-border-subtle bg-surface rounded-3xl border p-6">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <section className="border-border-subtle bg-surface rounded-3xl border p-5 sm:p-6">
      <div className="border-border-subtle mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="text-primary h-5 w-5" />
          <h2 className="text-text-primary text-base font-bold">مدیریت در واچ‌لیست من</h2>
        </div>

        {existing && (
          <span
            className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${
              WATCH_STATUS_META[existing.status].badgeClass
            }`}
          >
            {WATCH_STATUS_META[existing.status].label}
          </span>
        )}
      </div>

      <WatchlistEntryForm
        key={`${anime.id}-${existing?.updatedAt ?? "new"}`}
        anime={anime}
        existing={existing}
      />
    </section>
  );
}
