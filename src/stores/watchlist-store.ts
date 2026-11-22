import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import type {
  WatchlistAnimeSnapshot,
  WatchlistItem,
  WatchStatus,
} from "@/types/watchlist";

const WatchlistImportSchema = z.array(
  z.object({
    animeId: z.string(),
    anime: z.object({
      id: z.string(),
      slug: z.string(),
      title: z.string(),
      posterUrl: z.string().nullable(),
      subtype: z.enum(["TV", "movie", "OVA", "ONA", "special", "music"]),
      episodeCount: z.number().nullable(),
      episodeLength: z.number().nullable(),
      ratingOutOf10: z.number().nullable(),
    }),
    status: z.enum(["watching", "completed", "planned", "paused", "dropped"]),
    progress: z.number().min(0),
    userScore: z.number().min(1).max(10).nullable(),
    notes: z.string(),
    addedAt: z.string(),
    updatedAt: z.string(),
  })
);

interface WatchlistState {
  items: Record<string, WatchlistItem>;
  upsertItem: (
    anime: WatchlistAnimeSnapshot,
    payload?: Partial<Pick<WatchlistItem, "status" | "progress" | "userScore" | "notes">>
  ) => void;
  updateStatus: (animeId: string, status: WatchStatus) => void;
  incrementProgress: (animeId: string) => void;
  decrementProgress: (animeId: string) => void;
  setScore: (animeId: string, score: number | null) => void;
  removeItem: (animeId: string) => void;
  importFromJson: (rawJson: string) => { ok: boolean; count: number; error?: string };
  clearAll: () => void;
}

function clampProgress(progress: number, maxEpisodes: number | null): number {
  const safe = Math.max(0, Math.floor(progress));
  if (maxEpisodes !== null && maxEpisodes > 0) {
    return Math.min(safe, maxEpisodes);
  }
  return safe;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: {},

      upsertItem: (anime, payload = {}) => {
        const now = new Date().toISOString();
        const existing = get().items[anime.id];
        const nextStatus = payload.status ?? existing?.status ?? "planned";

        let nextProgress =
          payload.progress ??
          existing?.progress ??
          (nextStatus === "completed" ? (anime.episodeCount ?? 0) : 0);
        nextProgress = clampProgress(nextProgress, anime.episodeCount);

        const nextItem: WatchlistItem = {
          animeId: anime.id,
          anime,
          status: nextStatus,
          progress: nextProgress,
          userScore:
            payload.userScore !== undefined
              ? payload.userScore
              : (existing?.userScore ?? null),
          notes: payload.notes ?? existing?.notes ?? "",
          addedAt: existing?.addedAt ?? now,
          updatedAt: now,
        };

        set((state) => ({
          items: { ...state.items, [anime.id]: nextItem },
        }));
      },

      updateStatus: (animeId, status) => {
        const existing = get().items[animeId];
        if (!existing) return;

        const nextProgress =
          status === "completed" && existing.anime.episodeCount
            ? existing.anime.episodeCount
            : existing.progress;

        set((state) => ({
          items: {
            ...state.items,
            [animeId]: {
              ...existing,
              status,
              progress: nextProgress,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      incrementProgress: (animeId) => {
        const existing = get().items[animeId];
        if (!existing) return;

        const max = existing.anime.episodeCount;
        const nextProgress = clampProgress(existing.progress + 1, max);
        const reachedEnd = max !== null && max > 0 && nextProgress >= max;

        set((state) => ({
          items: {
            ...state.items,
            [animeId]: {
              ...existing,
              progress: nextProgress,
              status: reachedEnd ? "completed" : existing.status,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      decrementProgress: (animeId) => {
        const existing = get().items[animeId];
        if (!existing) return;

        const nextProgress = clampProgress(
          existing.progress - 1,
          existing.anime.episodeCount
        );

        set((state) => ({
          items: {
            ...state.items,
            [animeId]: {
              ...existing,
              progress: nextProgress,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setScore: (animeId, score) => {
        const existing = get().items[animeId];
        if (!existing) return;

        set((state) => ({
          items: {
            ...state.items,
            [animeId]: {
              ...existing,
              userScore: score,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      removeItem: (animeId) => {
        set((state) => {
          const next = { ...state.items };
          delete next[animeId];
          return { items: next };
        });
      },

      importFromJson: (rawJson) => {
        try {
          const parsed = JSON.parse(rawJson) as unknown;
          const validated = WatchlistImportSchema.safeParse(parsed);

          if (!validated.success) {
            return {
              ok: false,
              count: 0,
              error: "ساختار فایل JSON معتبر نیست.",
            };
          }

          const merged = { ...get().items };
          for (const item of validated.data) {
            merged[item.animeId] = item;
          }

          set({ items: merged });
          return { ok: true, count: validated.data.length };
        } catch {
          return {
            ok: false,
            count: 0,
            error: "فایل انتخاب‌شده JSON استاندارد نیست.",
          };
        }
      },

      clearAll: () => set({ items: {} }),
    }),
    {
      name: "myanimemap-watchlist-v1",
    }
  )
);
