"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Calendar, Clock, Film, Users, Tv } from "lucide-react";
import { Tabs, type TabOption } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { getAnimeCharacters, getAnimeEpisodes } from "@/lib/kitsu/queries";
import { STATUS_LABELS_FA, SUBTYPE_LABELS_FA } from "@/lib/mappers/anime-mapper";
import { formatDuration, formatPersianDate, toPersianNumber } from "@/lib/utils/format";
import type { AnimeDetails } from "@/types/anime";

type DetailTab = "overview" | "characters" | "episodes";

const TAB_ITEMS: Array<TabOption<DetailTab>> = [
  { value: "overview", label: "بررسی کلی و آثار مرتبط" },
  { value: "characters", label: "شخصیت‌ها" },
  { value: "episodes", label: "فهرست قسمت‌ها" },
];

export function AnimeDetailsTabs({ anime }: { anime: AnimeDetails }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const charactersQuery = useInfiniteQuery({
    queryKey: ["anime-characters", anime.id],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      getAnimeCharacters(anime.id, pageParam, 20, signal),
    getNextPageParam: (last) => (last.hasNextPage ? last.offset + last.limit : undefined),
    enabled: activeTab === "characters",
  });

  const episodesQuery = useInfiniteQuery({
    queryKey: ["anime-episodes", anime.id],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => getAnimeEpisodes(anime.id, pageParam, 20, signal),
    getNextPageParam: (last) => (last.hasNextPage ? last.offset + last.limit : undefined),
    enabled: activeTab === "episodes",
  });

  const characters = useMemo(
    () => charactersQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [charactersQuery.data]
  );

  const episodes = useMemo(
    () => episodesQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [episodesQuery.data]
  );

  return (
    <div className="space-y-6">
      <Tabs items={TAB_ITEMS} value={activeTab} onChange={setActiveTab} />

      {/* تب اول: بررسی کلی و آثار مرتبط */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* خلاصه داستان */}
          <section className="border-border-subtle bg-surface space-y-3 rounded-3xl border p-6">
            <h2 className="text-text-primary text-lg font-bold">خلاصه داستان</h2>
            {anime.synopsis ? (
              <p
                className="text-text-secondary text-sm leading-7 whitespace-pre-line"
                dir="ltr"
              >
                {anime.synopsis}
              </p>
            ) : (
              <p className="text-text-muted text-sm">
                توضیحی برای این انیمه ثبت نشده است.
              </p>
            )}
          </section>

          {/* مشخصات فنی */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <div className="border-border-subtle bg-surface rounded-2xl border p-4">
              <div className="text-text-muted mb-1 flex items-center gap-1.5 text-xs">
                <Tv className="text-primary h-3.5 w-3.5" />
                فرمت و وضعیت
              </div>
              <p className="text-text-primary text-sm font-semibold">
                {SUBTYPE_LABELS_FA[anime.subtype]} — {STATUS_LABELS_FA[anime.status]}
              </p>
            </div>

            <div className="border-border-subtle bg-surface rounded-2xl border p-4">
              <div className="text-text-muted mb-1 flex items-center gap-1.5 text-xs">
                <Clock className="text-primary h-3.5 w-3.5" />
                تعداد و مدت قسمت
              </div>
              <p className="text-text-primary text-sm font-semibold">
                {anime.episodeCount
                  ? `${toPersianNumber(anime.episodeCount)} قسمت`
                  : "نامشخص"}{" "}
                ({formatDuration(anime.episodeLength)})
              </p>
            </div>

            <div className="border-border-subtle bg-surface rounded-2xl border p-4">
              <div className="text-text-muted mb-1 flex items-center gap-1.5 text-xs">
                <Calendar className="text-primary h-3.5 w-3.5" />
                شروع پخش
              </div>
              <p className="text-text-primary text-sm font-semibold">
                {formatPersianDate(anime.startDate)}
              </p>
            </div>

            <div className="border-border-subtle bg-surface rounded-2xl border p-4">
              <div className="text-text-muted mb-1 flex items-center gap-1.5 text-xs">
                <Users className="text-primary h-3.5 w-3.5" />
                رده‌بندی سنی
              </div>
              <p className="text-text-primary text-sm font-semibold" dir="ltr">
                {anime.ageRating ?? "N/A"}
                {anime.ageRatingGuide ? ` — ${anime.ageRatingGuide}` : ""}
              </p>
            </div>
          </section>

          {/* آثار مرتبط */}
          {anime.relations.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-text-primary text-lg font-bold">فصل‌ها و آثار مرتبط</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {anime.relations.map((rel, index) => (
                  <Link
                    key={`${rel.anime.id}-${index}`}
                    href={`/anime/${rel.anime.slug}`}
                    className="border-border-subtle bg-surface hover:border-primary/50 hover:bg-surface-elevated flex items-center gap-3 rounded-2xl border p-3 transition-colors"
                  >
                    <div className="bg-surface-elevated relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
                      {rel.anime.posterUrl ? (
                        <Image
                          src={rel.anime.posterUrl}
                          alt={rel.anime.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-text-muted flex h-full items-center justify-center">
                          <Film className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <Badge variant="primary" className="text-[11px]">
                        {rel.relationRoleFa}
                      </Badge>
                      <p
                        className="text-text-primary truncate text-sm font-semibold"
                        dir="ltr"
                      >
                        {rel.anime.title}
                      </p>
                      <p className="text-text-muted text-xs">
                        {SUBTYPE_LABELS_FA[rel.anime.subtype]}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* تب دوم: شخصیت‌ها */}
      {activeTab === "characters" && (
        <div className="space-y-4">
          {charactersQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-2xl" />
              ))}
            </div>
          ) : charactersQuery.isError ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-sm text-rose-300">
              خطا در دریافت لیست شخصیت‌ها.
            </div>
          ) : characters.length === 0 ? (
            <div className="border-border-subtle bg-surface text-text-muted rounded-2xl border p-8 text-center text-sm">
              اطلاعات شخصیتی برای این انیمه ثبت نشده است.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {characters.map((char) => (
                  <div
                    key={char.id}
                    className="border-border-subtle bg-surface overflow-hidden rounded-2xl border"
                  >
                    <div className="bg-surface-elevated relative aspect-[3/4] w-full">
                      {char.imageUrl ? (
                        <img
                          src={char.imageUrl}
                          alt={char.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-text-muted flex h-full items-center justify-center">
                          <Users className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 p-3">
                      <p
                        className="text-text-primary truncate text-sm font-semibold"
                        dir="ltr"
                      >
                        {char.name}
                      </p>
                      <Badge variant={char.role === "main" ? "primary" : "default"}>
                        {char.roleFa}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {charactersQuery.hasNextPage && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="secondary"
                    isLoading={charactersQuery.isFetchingNextPage}
                    onClick={() => charactersQuery.fetchNextPage()}
                  >
                    بارگذاری شخصیت‌های بیشتر
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* تب سوم: قسمت‌ها */}
      {activeTab === "episodes" && (
        <div className="space-y-4">
          {episodesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : episodesQuery.isError ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-sm text-rose-300">
              خطا در دریافت لیست قسمت‌ها.
            </div>
          ) : episodes.length === 0 ? (
            <div className="border-border-subtle bg-surface text-text-muted rounded-2xl border p-8 text-center text-sm">
              فهرست قسمت‌ها برای این اثر موجود نیست.
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="border-border-subtle bg-surface flex items-center gap-4 rounded-2xl border p-3.5"
                  >
                    <div className="bg-primary/15 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
                      {toPersianNumber(ep.number)}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p
                        className="text-text-primary truncate text-sm font-semibold"
                        dir="ltr"
                      >
                        {ep.title}
                      </p>
                      <div className="text-text-muted flex flex-wrap items-center gap-3 text-xs">
                        {ep.airdate && <span>پخش: {formatPersianDate(ep.airdate)}</span>}
                        {ep.length && <span>{formatDuration(ep.length)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {episodesQuery.hasNextPage && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="secondary"
                    isLoading={episodesQuery.isFetchingNextPage}
                    onClick={() => episodesQuery.fetchNextPage()}
                  >
                    بارگذاری قسمت‌های بیشتر
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
