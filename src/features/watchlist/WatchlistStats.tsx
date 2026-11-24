"use client";

import { Clock, Layers, ListChecks, Star } from "lucide-react";
import { toPersianNumber } from "@/lib/utils/format";
import {
  WATCH_STATUS_META,
  type WatchlistItem,
  type WatchStatus,
} from "@/types/watchlist";

const STATUS_BAR_COLORS: Record<WatchStatus, string> = {
  watching: "bg-status-watching",
  completed: "bg-status-completed",
  planned: "bg-status-planned",
  paused: "bg-status-paused",
  dropped: "bg-status-dropped",
};

export function WatchlistStats({ items }: { items: WatchlistItem[] }) {
  const totalAnime = items.length;
  const totalEpisodes = items.reduce((sum, item) => sum + item.progress, 0);

  const totalMinutes = items.reduce(
    (sum, item) => sum + item.progress * (item.anime.episodeLength ?? 24),
    0
  );
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const scoredItems = items.filter((item) => item.userScore !== null);
  const avgScore =
    scoredItems.length > 0
      ? scoredItems.reduce((sum, item) => sum + (item.userScore ?? 0), 0) /
        scoredItems.length
      : null;

  const statusCounts: Record<WatchStatus, number> = {
    watching: 0,
    completed: 0,
    planned: 0,
    paused: 0,
    dropped: 0,
  };

  for (const item of items) {
    statusCounts[item.status] += 1;
  }

  return (
    <section className="border-border-subtle bg-surface space-y-4 rounded-3xl border p-5 sm:p-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="border-border-subtle bg-canvas/50 rounded-2xl border p-4">
          <div className="text-text-muted mb-1 flex items-center gap-2 text-xs">
            <Layers className="text-primary h-4 w-4" />
            کل انیمه‌های لیست
          </div>
          <p className="text-text-primary text-2xl font-extrabold">
            {toPersianNumber(totalAnime)}
          </p>
        </div>

        <div className="border-border-subtle bg-canvas/50 rounded-2xl border p-4">
          <div className="text-text-muted mb-1 flex items-center gap-2 text-xs">
            <ListChecks className="h-4 w-4 text-emerald-400" />
            قسمت‌های دیده‌شده
          </div>
          <p className="text-text-primary text-2xl font-extrabold">
            {toPersianNumber(totalEpisodes)}
          </p>
        </div>

        <div className="border-border-subtle bg-canvas/50 rounded-2xl border p-4">
          <div className="text-text-muted mb-1 flex items-center gap-2 text-xs">
            <Clock className="h-4 w-4 text-amber-400" />
            ساعات تماشا (تقریبی)
          </div>
          <p className="text-text-primary text-2xl font-extrabold">
            {toPersianNumber(totalHours)} ساعت
          </p>
        </div>

        <div className="border-border-subtle bg-canvas/50 rounded-2xl border p-4">
          <div className="text-text-muted mb-1 flex items-center gap-2 text-xs">
            <Star className="fill-primary text-primary h-4 w-4" />
            میانگین امتیاز شما
          </div>
          <p className="text-primary text-2xl font-extrabold">
            {avgScore !== null ? toPersianNumber(avgScore.toFixed(1)) : "—"}
          </p>
        </div>
      </div>

      {/* نوار گرافیکی توزیع وضعیت‌ها */}
      {totalAnime > 0 && (
        <div className="space-y-2 pt-1">
          <div className="bg-canvas flex h-3 w-full overflow-hidden rounded-full">
            {(Object.keys(statusCounts) as WatchStatus[]).map((status) => {
              const count = statusCounts[status];
              if (count === 0) return null;
              const pct = (count / totalAnime) * 100;
              return (
                <div
                  key={status}
                  style={{ width: `${pct}%` }}
                  className={`${STATUS_BAR_COLORS[status]} transition-all duration-500`}
                  title={`${WATCH_STATUS_META[status].label}: ${count}`}
                />
              );
            })}
          </div>

          <div className="text-text-secondary flex flex-wrap items-center gap-4 text-xs">
            {(Object.keys(statusCounts) as WatchStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${STATUS_BAR_COLORS[status]}`}
                />
                <span>
                  {WATCH_STATUS_META[status].label}:{" "}
                  <strong className="text-text-primary">
                    {toPersianNumber(statusCounts[status])}
                  </strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
