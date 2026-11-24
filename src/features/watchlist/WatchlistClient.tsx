"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookmarkCheck,
  Download,
  Edit3,
  Film,
  Minus,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, type TabOption } from "@/components/ui/Tabs";
import { SUBTYPE_LABELS_FA } from "@/lib/mappers/anime-mapper";
import { toPersianNumber } from "@/lib/utils/format";
import { useHasHydrated } from "@/lib/utils/use-has-hydrated";
import { useToastStore } from "@/stores/toast-store";
import { useWatchlistStore } from "@/stores/watchlist-store";
import {
  WATCH_STATUS_META,
  type WatchlistItem,
  type WatchStatus,
} from "@/types/watchlist";
import { WatchlistEntryForm } from "./WatchlistEntryForm";
import { WatchlistStats } from "./WatchlistStats";

type FilterTab = "all" | WatchStatus;
type SortMode = "updated" | "score" | "progress" | "title";

const SORT_OPTIONS = [
  { value: "updated", label: "آخرین به‌روزرسانی" },
  { value: "score", label: "بالاترین امتیاز من" },
  { value: "progress", label: "بیشترین قسمت دیده‌شده" },
  { value: "title", label: "مرتب‌سازی الفبایی" },
];

export function WatchlistClient() {
  const isHydrated = useHasHydrated();
  const itemsRecord = useWatchlistStore((s) => s.items);
  const incrementProgress = useWatchlistStore((s) => s.incrementProgress);
  const decrementProgress = useWatchlistStore((s) => s.decrementProgress);
  const removeItem = useWatchlistStore((s) => s.removeItem);
  const importFromJson = useWatchlistStore((s) => s.importFromJson);
  const showToast = useToastStore((s) => s.showToast);

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortMode>("updated");
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allItems = useMemo(() => Object.values(itemsRecord), [itemsRecord]);

  const tabOptions = useMemo<Array<TabOption<FilterTab>>>(() => {
    const counts: Record<FilterTab, number> = {
      all: allItems.length,
      watching: 0,
      completed: 0,
      planned: 0,
      paused: 0,
      dropped: 0,
    };
    for (const item of allItems) {
      counts[item.status] += 1;
    }

    return [
      { value: "all", label: "همه", count: counts.all },
      { value: "watching", label: "در حال تماشا", count: counts.watching },
      { value: "completed", label: "تکمیل‌شده", count: counts.completed },
      { value: "planned", label: "در لیست انتظار", count: counts.planned },
      { value: "paused", label: "متوقف‌شده", count: counts.paused },
      { value: "dropped", label: "رهاشده", count: counts.dropped },
    ];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allItems
      .filter((item) => {
        if (activeTab !== "all" && item.status !== activeTab) return false;
        if (q && !item.anime.title.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "score":
            return (b.userScore ?? -1) - (a.userScore ?? -1);
          case "progress":
            return b.progress - a.progress;
          case "title":
            return a.anime.title.localeCompare(b.anime.title);
          case "updated":
          default:
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      });
  }, [allItems, activeTab, searchQuery, sortBy]);

  const handleExport = () => {
    if (allItems.length === 0) {
      showToast("واچ‌لیست شما خالی است!", "info");
      return;
    }
    const blob = new Blob([JSON.stringify(allItems, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateTag = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `myanimemap-watchlist-${dateTag}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("فایل پشتیبان JSON با موفقیت دانلود شد.", "success");
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const res = importFromJson(text);
    if (res.ok) {
      showToast(`${toPersianNumber(res.count)} انیمه با موفقیت وارد شد!`, "success");
    } else {
      showToast(res.error ?? "خطا در خواندن فایل", "error");
    }

    e.target.value = "";
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full rounded-3xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* هدر و دکمه‌های Import/Export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/15 text-primary flex h-11 w-11 items-center justify-center rounded-2xl">
            <BookmarkCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-text-primary text-2xl font-extrabold">
              واچ‌لیست شخصی من
            </h1>
            <p className="text-text-secondary text-xs">
              ذخیره‌سازی خودکار در مرورگر با قابلیت خروجی و پشتیبان‌گیری
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            ورودی JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            خروجی JSON
          </Button>
        </div>
      </div>

      {/* آمار کلی */}
      <WatchlistStats items={allItems} />

      {/* تب‌ها و سرچ داخل واچ‌لیست */}
      <div className="space-y-4">
        <Tabs items={tabOptions} value={activeTab} onChange={setActiveTab} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در میان انیمه‌های واچ‌لیست..."
              startIcon={<Search className="h-4 w-4" />}
              dir="auto"
            />
          </div>
          <Select
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortMode)}
          />
        </div>
      </div>

      {/* حالت خالی */}
      {allItems.length === 0 ? (
        <div className="border-border-subtle bg-surface rounded-3xl border p-12 text-center">
          <p className="text-text-primary mb-2 text-lg font-bold">
            واچ‌لیست شما هنوز خالی است!
          </p>
          <p className="text-text-secondary mb-6 text-sm">
            به صفحه خانه یا اکسپلور بروید و انیمه‌های مورد علاقه‌تان را اضافه کنید.
          </p>
          <Link href="/explore">
            <Button variant="primary">رفتن به اکسپلور انیمه</Button>
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border-border-subtle bg-surface text-text-secondary rounded-3xl border p-10 text-center text-sm">
          انیمه‌ای مطابق با فیلتر یا جستجوی فعلی پیدا نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredItems.map((item) => {
            const total = item.anime.episodeCount;
            const progressPct =
              total && total > 0
                ? Math.min(100, Math.round((item.progress / total) * 100))
                : null;
            const meta = WATCH_STATUS_META[item.status];

            return (
              <article
                key={item.animeId}
                className="border-border-subtle bg-surface hover:border-border-strong flex gap-4 rounded-2xl border p-4 transition-colors"
              >
                <Link
                  href={`/anime/${item.anime.slug}`}
                  className="bg-surface-elevated relative h-32 w-24 shrink-0 overflow-hidden rounded-xl"
                >
                  {item.anime.posterUrl ? (
                    <Image
                      src={item.anime.posterUrl}
                      alt={item.anime.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-text-muted flex h-full items-center justify-center">
                      <Film className="h-6 w-6" />
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/anime/${item.anime.slug}`}
                        className="text-text-primary hover:text-primary line-clamp-1 text-base font-bold"
                        dir="ltr"
                      >
                        {item.anime.title}
                      </Link>

                      {item.userScore !== null && (
                        <span className="bg-primary/15 text-primary inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold">
                          <Star className="fill-primary h-3 w-3" />
                          {toPersianNumber(item.userScore)}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-text-muted text-xs">
                        {SUBTYPE_LABELS_FA[item.anime.subtype]}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-text-secondary mt-2 line-clamp-1 text-xs">
                        یادداشت: {item.notes}
                      </p>
                    )}
                  </div>

                  {/* نوار پیشرفت و کنترلر +1/-1 */}
                  <div className="space-y-2 pt-1">
                    {progressPct !== null && (
                      <div className="bg-canvas h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          style={{ width: `${progressPct}%` }}
                          className="from-primary to-accent h-full rounded-full bg-gradient-to-l transition-all duration-300"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => decrementProgress(item.animeId)}
                          aria-label="کاهش قسمت"
                          className="border-border-subtle bg-canvas text-text-primary hover:border-primary flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-text-primary min-w-16 text-center text-xs font-semibold">
                          {toPersianNumber(item.progress)}
                          {total ? ` / ${toPersianNumber(total)}` : " قسمت"}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementProgress(item.animeId)}
                          aria-label="افزایش قسمت"
                          className="border-border-subtle bg-canvas text-text-primary hover:border-primary flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          aria-label="ویرایش جزئیات"
                          className="text-text-secondary hover:bg-surface-elevated hover:text-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(item.animeId);
                            showToast("از واچ‌لیست حذف شد.", "info");
                          }}
                          aria-label="حذف از واچ‌لیست"
                          className="text-text-secondary flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-rose-500/15 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* مودال ویرایش کامل با React Hook Form */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="ویرایش انیمه در واچ‌لیست"
        maxWidthClass="max-w-lg"
      >
        {editingItem && (
          <div className="space-y-4">
            <p className="text-primary text-sm font-bold" dir="ltr">
              {editingItem.anime.title}
            </p>
            <WatchlistEntryForm
              key={`${editingItem.animeId}-${editingItem.updatedAt}`}
              anime={editingItem.anime}
              existing={editingItem}
              onSuccess={() => setEditingItem(null)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
