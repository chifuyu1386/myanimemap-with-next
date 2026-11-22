"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QuickWatchlistModal } from "@/features/watchlist/QuickWatchlistModal";
import { STATUS_LABELS_FA, SUBTYPE_LABELS_FA } from "@/lib/mappers/anime-mapper";
import { formatScore, toPersianNumber } from "@/lib/utils/format";
import { useHasHydrated } from "@/lib/utils/use-has-hydrated";
import { useWatchlistStore } from "@/stores/watchlist-store";
import type { AnimeSummary } from "@/types/anime";

interface HeroShowcaseProps {
  items: AnimeSummary[];
}

export function HeroShowcase({ items }: HeroShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isHydrated = useHasHydrated();

  const current = items[activeIndex];
  const watchlistEntry = useWatchlistStore((s) =>
    current ? s.items[current.id] : undefined
  );

  if (!current) return null;

  const inWatchlist = isHydrated && Boolean(watchlistEntry);
  const bgImage = current.coverUrl || current.posterUrl;

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % items.length);
  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <>
      <section className="border-border-subtle bg-surface relative overflow-hidden rounded-3xl border">
        {/* تصویر پس‌زمینه محوشده */}
        <div className="relative min-h-[420px] sm:min-h-[460px]">
          {bgImage && (
            <Image
              src={bgImage}
              alt={current.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center opacity-45 transition-all duration-700"
            />
          )}

          {/* گرادیانت آبی عمیق برای خوانایی متن */}
          <div className="from-canvas via-canvas/75 to-canvas/30 absolute inset-0 bg-gradient-to-t" />
          <div className="from-canvas/95 via-canvas/60 absolute inset-0 bg-gradient-to-l to-transparent" />

          {/* محتوای بنر */}
          <div className="relative z-10 flex min-h-[420px] flex-col justify-end p-6 sm:min-h-[460px] sm:p-10">
            <div className="max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">
                  ترند شماره {toPersianNumber(activeIndex + 1)}
                </Badge>
                <Badge variant="glass">{SUBTYPE_LABELS_FA[current.subtype]}</Badge>
                <Badge variant="glass">{STATUS_LABELS_FA[current.status]}</Badge>
                <Badge variant="glass" className="gap-1">
                  <Star className="fill-primary text-primary h-3.5 w-3.5" />
                  {formatScore(current.ratingOutOf10)}
                </Badge>
              </div>

              <h1
                className="text-text-primary text-2xl leading-tight font-extrabold sm:text-4xl"
                dir="ltr"
              >
                {current.title}
              </h1>

              {current.synopsis && (
                <p
                  className="text-text-secondary line-clamp-3 text-sm leading-relaxed"
                  dir="ltr"
                >
                  {current.synopsis}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/anime/${current.slug}`}>
                  <Button variant="primary" size="md">
                    <Play className="h-4 w-4 fill-slate-950" />
                    مشاهده جزئیات
                  </Button>
                </Link>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsModalOpen(true)}
                >
                  {inWatchlist ? (
                    <>
                      <BookmarkCheck className="text-primary h-4 w-4" />
                      در واچ‌لیست شما
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      افزودن به واچ‌لیست
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* کنترلر اسلایدر */}
            {items.length > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`نمایش ترند ${index + 1}`}
                      className={`h-2 cursor-pointer rounded-full transition-all ${
                        index === activeIndex
                          ? "bg-primary w-8"
                          : "bg-border-strong hover:bg-text-muted w-2"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="قبلی"
                    className="border-border-subtle bg-surface/80 text-text-primary hover:border-primary flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border backdrop-blur-md"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="بعدی"
                    className="border-border-subtle bg-surface/80 text-text-primary hover:border-primary flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border backdrop-blur-md"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <QuickWatchlistModal
          anime={{
            id: current.id,
            slug: current.slug,
            title: current.title,
            posterUrl: current.posterUrl,
            subtype: current.subtype,
            episodeCount: current.episodeCount,
            episodeLength: current.episodeLength,
            ratingOutOf10: current.ratingOutOf10,
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
