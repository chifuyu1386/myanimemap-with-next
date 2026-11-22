import type { AnimeSubtype } from "./anime";

export type WatchStatus = "watching" | "completed" | "planned" | "paused" | "dropped";

export interface WatchlistAnimeSnapshot {
  id: string;
  slug: string;
  title: string;
  posterUrl: string | null;
  subtype: AnimeSubtype;
  episodeCount: number | null;
  episodeLength: number | null;
  ratingOutOf10: number | null;
}

export interface WatchlistItem {
  animeId: string;
  anime: WatchlistAnimeSnapshot;
  status: WatchStatus;
  progress: number;
  userScore: number | null; // بین ۱ تا ۱۰
  notes: string;
  addedAt: string;
  updatedAt: string;
}

export const WATCH_STATUS_META: Record<
  WatchStatus,
  { label: string; colorClass: string; badgeClass: string }
> = {
  watching: {
    label: "در حال تماشا",
    colorClass: "text-status-watching",
    badgeClass: "bg-status-watching/15 text-status-watching border-status-watching/30",
  },
  completed: {
    label: "تکمیل‌شده",
    colorClass: "text-status-completed",
    badgeClass: "bg-status-completed/15 text-status-completed border-status-completed/30",
  },
  planned: {
    label: "در لیست انتظار",
    colorClass: "text-status-planned",
    badgeClass: "bg-status-planned/15 text-status-planned border-status-planned/30",
  },
  paused: {
    label: "متوقف‌شده",
    colorClass: "text-status-paused",
    badgeClass: "bg-status-paused/15 text-status-paused border-status-paused/30",
  },
  dropped: {
    label: "رهاشده",
    colorClass: "text-status-dropped",
    badgeClass: "bg-status-dropped/15 text-status-dropped border-status-dropped/30",
  },
};
