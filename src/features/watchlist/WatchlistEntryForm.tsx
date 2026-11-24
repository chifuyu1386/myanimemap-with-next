"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookmarkCheck, Minus, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useToastStore } from "@/stores/toast-store";
import { toPersianNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import {
  WATCH_STATUS_META,
  type WatchlistAnimeSnapshot,
  type WatchlistItem,
  type WatchStatus,
} from "@/types/watchlist";

const STATUS_SELECT_OPTIONS = [
  { value: "watching", label: WATCH_STATUS_META.watching.label },
  { value: "completed", label: WATCH_STATUS_META.completed.label },
  { value: "planned", label: WATCH_STATUS_META.planned.label },
  { value: "paused", label: WATCH_STATUS_META.paused.label },
  { value: "dropped", label: WATCH_STATUS_META.dropped.label },
];

function createSchema(maxEpisodes: number | null) {
  return z.object({
    status: z.enum(["watching", "completed", "planned", "paused", "dropped"]),
    progress: z
      .number({ error: "عدد معتبر وارد کنید" })
      .int("تعداد قسمت باید عدد صحیح باشد")
      .min(0, "تعداد قسمت نمی‌تواند منفی باشد")
      .refine((val) => maxEpisodes === null || maxEpisodes <= 0 || val <= maxEpisodes, {
        message: `حداکثر تعداد قسمت ${maxEpisodes ?? 0} است`,
      }),
    userScore: z.number().min(1).max(10).nullable(),
    notes: z.string().max(500, "یادداشت نباید بیشتر از ۵۰۰ کاراکتر باشد"),
  });
}

type WatchlistFormValues = z.infer<ReturnType<typeof createSchema>>;

interface WatchlistEntryFormProps {
  anime: WatchlistAnimeSnapshot;
  existing?: WatchlistItem;
  onSuccess?: () => void;
}

export function WatchlistEntryForm({
  anime,
  existing,
  onSuccess,
}: WatchlistEntryFormProps) {
  const upsertItem = useWatchlistStore((s) => s.upsertItem);
  const removeItem = useWatchlistStore((s) => s.removeItem);
  const showToast = useToastStore((s) => s.showToast);

  const schema = createSchema(anime.episodeCount);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WatchlistFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: existing?.status ?? "watching",
      progress: existing?.progress ?? 0,
      userScore: existing?.userScore ?? null,
      notes: existing?.notes ?? "",
    },
  });

  const currentProgress = watch("progress");
  const currentScore = watch("userScore");

  const handleStatusChange = (nextStatus: WatchStatus) => {
    setValue("status", nextStatus, { shouldDirty: true });
    if (nextStatus === "completed" && anime.episodeCount) {
      setValue("progress", anime.episodeCount, { shouldValidate: true });
    }
  };

  const adjustProgress = (delta: number) => {
    const next = Math.max(0, (Number(currentProgress) || 0) + delta);
    const clamped =
      anime.episodeCount && anime.episodeCount > 0
        ? Math.min(next, anime.episodeCount)
        : next;
    setValue("progress", clamped, { shouldValidate: true });
  };

  const onSubmit = (values: WatchlistFormValues) => {
    upsertItem(anime, {
      status: values.status,
      progress: values.progress,
      userScore: values.userScore,
      notes: values.notes.trim(),
    });
    showToast(
      existing ? "واچ‌لیست با موفقیت ویرایش شد." : "به واچ‌لیست شما اضافه شد!",
      "success"
    );
    onSuccess?.();
  };

  const handleDelete = () => {
    removeItem(anime.id);
    showToast("انیمه از واچ‌لیست حذف شد.", "info");
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="وضعیت تماشا"
          options={STATUS_SELECT_OPTIONS}
          {...register("status")}
          onChange={(e) => handleStatusChange(e.target.value as WatchStatus)}
        />

        {/* ورودی قسمت با دکمه‌های + و - */}
        <div className="space-y-1.5">
          <label className="text-text-secondary block text-xs font-medium">
            پیشرفت (تعداد قسمت
            {anime.episodeCount ? ` از ${toPersianNumber(anime.episodeCount)}` : ""})
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustProgress(-1)}
              aria-label="کاهش قسمت"
              className="border-border-subtle bg-canvas text-text-primary hover:border-primary flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border"
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="number"
              min={0}
              max={anime.episodeCount ?? undefined}
              dir="ltr"
              {...register("progress", { valueAsNumber: true })}
              className="border-border-subtle bg-surface text-text-primary focus:border-primary h-10 w-full rounded-xl border px-3 text-center text-sm font-semibold focus:outline-none"
            />

            <button
              type="button"
              onClick={() => adjustProgress(1)}
              aria-label="افزایش قسمت"
              className="border-border-subtle bg-canvas text-text-primary hover:border-primary flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {errors.progress && (
            <p className="text-xs text-rose-400">{errors.progress.message}</p>
          )}
        </div>
      </div>

      {/* امتیاز ۱ تا ۱۰ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-text-secondary text-xs font-medium">
            امتیاز شخصی شما
          </label>
          {currentScore !== null && (
            <button
              type="button"
              onClick={() => setValue("userScore", null)}
              className="text-text-muted cursor-pointer text-xs hover:text-rose-400"
            >
              پاک کردن امتیاز
            </button>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const active = currentScore === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setValue("userScore", num)}
                className={cn(
                  "flex h-9 cursor-pointer items-center justify-center gap-1 rounded-lg border text-xs font-semibold transition-all",
                  active
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border-subtle bg-canvas/50 text-text-secondary hover:border-border-strong"
                )}
              >
                <Star className={cn("h-3 w-3", active ? "fill-primary" : "")} />
                {toPersianNumber(num)}
              </button>
            );
          })}
        </div>
      </div>

      {/* یادداشت شخصی */}
      <div className="space-y-1.5">
        <label className="text-text-secondary block text-xs font-medium">
          یادداشت شخصی (اختیاری)
        </label>
        <textarea
          rows={3}
          placeholder="نظر، تجربه یا قسمت مورد علاقه خود را یادداشت کنید..."
          {...register("notes")}
          className="border-border-subtle bg-canvas/60 text-text-primary placeholder:text-text-muted focus:border-primary w-full rounded-xl border p-3 text-sm focus:outline-none"
        />
        {errors.notes && <p className="text-xs text-rose-400">{errors.notes.message}</p>}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {existing ? (
          <Button type="button" variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            حذف از لیست
          </Button>
        ) : (
          <div />
        )}

        <Button type="submit" variant="primary" size="md">
          <BookmarkCheck className="h-4 w-4" />
          {existing ? "به‌روزرسانی واچ‌لیست" : "افزودن به واچ‌لیست"}
        </Button>
      </div>
    </form>
  );
}
