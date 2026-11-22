"use client";

import { useState } from "react";
import { Trash2, Plus, Minus, Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useToastStore } from "@/stores/toast-store";
import { toPersianNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import {
  WATCH_STATUS_META,
  type WatchlistAnimeSnapshot,
  type WatchStatus,
} from "@/types/watchlist";

interface QuickWatchlistModalProps {
  anime: WatchlistAnimeSnapshot;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: WatchStatus[] = [
  "watching",
  "planned",
  "completed",
  "paused",
  "dropped",
];

export function QuickWatchlistModal({
  anime,
  isOpen,
  onClose,
}: QuickWatchlistModalProps) {
  const existing = useWatchlistStore((s) => s.items[anime.id]);
  const upsertItem = useWatchlistStore((s) => s.upsertItem);
  const removeItem = useWatchlistStore((s) => s.removeItem);
  const showToast = useToastStore((s) => s.showToast);

  const [status, setStatus] = useState<WatchStatus>(existing?.status ?? "watching");
  const [progress, setProgress] = useState<number>(existing?.progress ?? 0);
  const [userScore, setUserScore] = useState<number | null>(existing?.userScore ?? null);

  const handleSave = () => {
    upsertItem(anime, { status, progress, userScore });
    showToast(
      existing ? "اطلاعات واچ‌لیست به‌روزرسانی شد." : "به واچ‌لیست اضافه شد!",
      "success"
    );
    onClose();
  };

  const handleRemove = () => {
    removeItem(anime.id);
    showToast("از واچ‌لیست حذف شد.", "info");
    onClose();
  };

  const handleStatusPick = (nextStatus: WatchStatus) => {
    setStatus(nextStatus);
    if (nextStatus === "completed" && anime.episodeCount) {
      setProgress(anime.episodeCount);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existing ? "ویرایش در واچ‌لیست" : "افزودن به واچ‌لیست"}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-5">
        <div className="border-border-subtle bg-canvas/60 rounded-xl border px-3.5 py-2.5">
          <p className="text-text-primary truncate text-sm font-semibold" dir="ltr">
            {anime.title}
          </p>
        </div>

        {/* انتخاب وضعیت */}
        <div className="space-y-2">
          <label className="text-text-secondary block text-xs font-medium">
            وضعیت تماشا
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const meta = WATCH_STATUS_META[opt];
              const isSelected = status === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleStatusPick(opt)}
                  className={cn(
                    "cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                    isSelected
                      ? meta.badgeClass
                      : "border-border-subtle bg-canvas/40 text-text-secondary hover:border-border-strong hover:text-text-primary"
                  )}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* تعداد قسمت دیده‌شده */}
        <div className="border-border-subtle bg-canvas/40 flex items-center justify-between rounded-xl border px-3.5 py-2.5">
          <span className="text-text-secondary text-xs font-medium">
            قسمت‌های دیده‌شده
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setProgress((p) => Math.max(0, p - 1))}
              aria-label="کاهش قسمت"
              className="border-border-subtle bg-surface text-text-primary hover:border-primary flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="text-text-primary min-w-14 text-center text-sm font-bold">
              {toPersianNumber(progress)}
              {anime.episodeCount ? (
                <span className="text-text-muted text-xs font-normal">
                  {" "}
                  / {toPersianNumber(anime.episodeCount)}
                </span>
              ) : null}
            </span>

            <button
              type="button"
              onClick={() =>
                setProgress((p) =>
                  anime.episodeCount ? Math.min(anime.episodeCount, p + 1) : p + 1
                )
              }
              aria-label="افزایش قسمت"
              className="border-border-subtle bg-surface text-text-primary hover:border-primary flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* امتیاز شخصی ۱ تا ۱۰ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-text-secondary text-xs font-medium">امتیاز شما</label>
            {userScore !== null && (
              <button
                type="button"
                onClick={() => setUserScore(null)}
                className="text-text-muted cursor-pointer text-[11px] hover:text-rose-400"
              >
                حذف امتیاز
              </button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const active = userScore === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setUserScore(num)}
                  className={cn(
                    "flex h-9 cursor-pointer items-center justify-center gap-1 rounded-lg border text-xs font-semibold transition-all",
                    active
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border-subtle bg-canvas/40 text-text-secondary hover:border-border-strong"
                  )}
                >
                  <Star className={cn("h-3 w-3", active ? "fill-primary" : "")} />
                  {toPersianNumber(num)}
                </button>
              );
            })}
          </div>
        </div>

        {/* دکمه‌های عملیات */}
        <div className="border-border-subtle flex items-center justify-between gap-2 border-t pt-4">
          {existing ? (
            <Button variant="danger" size="sm" onClick={handleRemove}>
              <Trash2 className="h-4 w-4" />
              حذف
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              انصراف
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              ذخیره در واچ‌لیست
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
