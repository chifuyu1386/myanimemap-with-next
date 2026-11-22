"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { AnimeCard, AnimeCardSkeleton } from "@/features/anime/AnimeCard";
import { getAnimeList } from "@/lib/kitsu/queries";
import { toPersianNumber } from "@/lib/utils/format";
import { useDebounce } from "@/lib/utils/use-debounce";
import { cn } from "@/lib/utils/cn";
import type {
  AnimeSeason,
  AnimeSortOption,
  AnimeStatus,
  AnimeSubtype,
  CategoryItem,
} from "@/types/anime";

export interface ExploreFilterState {
  query: string;
  sort: AnimeSortOption;
  status: AnimeStatus | "";
  subtype: AnimeSubtype | "";
  season: AnimeSeason | "";
  year: string;
  category: string;
}

interface ExploreClientProps {
  initialFilters: ExploreFilterState;
  categories: CategoryItem[];
}

const SORT_OPTIONS = [
  { value: "popularity", label: "محبوب‌ترین" },
  { value: "rating", label: "بالاترین امتیاز" },
  { value: "newest", label: "جدیدترین" },
];

const STATUS_OPTIONS = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: "current", label: "در حال پخش" },
  { value: "finished", label: "پایان‌یافته" },
  { value: "upcoming", label: "به‌زودی" },
];

const SUBTYPE_OPTIONS = [
  { value: "", label: "همه فرمت‌ها" },
  { value: "TV", label: "سریالی (TV)" },
  { value: "movie", label: "سینمایی" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "special", label: "ویژه" },
];

const SEASON_OPTIONS = [
  { value: "", label: "همه فصل‌ها" },
  { value: "winter", label: "زمستان" },
  { value: "spring", label: "بهار" },
  { value: "summer", label: "تابستان" },
  { value: "fall", label: "پاییز" },
];

export function ExploreClient({ initialFilters, categories }: ExploreClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<ExploreFilterState>(initialFilters);
  const debouncedQuery = useDebounce(filters.query.trim(), 450);

  // همگام‌سازی فیلترها با URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (filters.sort !== "popularity") params.set("sort", filters.sort);
    if (filters.status) params.set("status", filters.status);
    if (filters.subtype) params.set("subtype", filters.subtype);
    if (filters.season) params.set("season", filters.season);
    if (filters.year) params.set("year", filters.year);
    if (filters.category) params.set("category", filters.category);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [
    debouncedQuery,
    filters.sort,
    filters.status,
    filters.subtype,
    filters.season,
    filters.year,
    filters.category,
    pathname,
    router,
  ]);

  const parsedYear = useMemo(() => {
    const y = Number.parseInt(filters.year, 10);
    return !Number.isNaN(y) && y >= 1950 && y <= 2030 ? y : undefined;
  }, [filters.year]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: [
      "explore-anime",
      debouncedQuery,
      filters.sort,
      filters.status,
      filters.subtype,
      filters.season,
      parsedYear,
      filters.category,
    ],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      getAnimeList(
        {
          query: debouncedQuery || undefined,
          sort: filters.sort,
          status: filters.status || undefined,
          subtype: filters.subtype || undefined,
          season: filters.season || undefined,
          year: parsedYear,
          categories: filters.category ? [filters.category] : undefined,
          offset: pageParam,
          limit: 20,
        },
        { signal }
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.offset + lastPage.limit : undefined,
  });

  const allItems = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const hasActiveFilters = Boolean(
    filters.query ||
    filters.status ||
    filters.subtype ||
    filters.season ||
    filters.year ||
    filters.category ||
    filters.sort !== "popularity"
  );

  const resetFilters = () => {
    setFilters({
      query: "",
      sort: "popularity",
      status: "",
      subtype: "",
      season: "",
      year: "",
      category: "",
    });
  };

  return (
    <div className="space-y-8">
      {/* هدر و نوار فیلترها */}
      <section className="border-border-subtle bg-surface space-y-5 rounded-3xl border p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="text-primary h-5 w-5" />
            <h1 className="text-text-primary text-xl font-bold sm:text-2xl">
              اکسپلور و جستجوی پیشرفته
            </h1>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" />
              پاک کردن فیلترها
            </Button>
          )}
        </div>

        {/* ورودی‌ها */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <Input
              label="جستجوی نام انیمه"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="مثلاً: Jujutsu Kaisen"
              startIcon={<Search className="h-4 w-4" />}
              dir="auto"
            />
          </div>

          <Select
            label="مرتب‌سازی"
            options={SORT_OPTIONS}
            value={filters.sort}
            disabled={Boolean(debouncedQuery)}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sort: e.target.value as AnimeSortOption,
              }))
            }
          />

          <Select
            label="وضعیت"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as AnimeStatus | "",
              }))
            }
          />

          <Select
            label="فرمت"
            options={SUBTYPE_OPTIONS}
            value={filters.subtype}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                subtype: e.target.value as AnimeSubtype | "",
              }))
            }
          />

          <div className="grid grid-cols-2 gap-2">
            <Select
              label="فصل"
              options={SEASON_OPTIONS}
              value={filters.season}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  season: e.target.value as AnimeSeason | "",
                }))
              }
            />
            <Input
              label="سال"
              type="number"
              min={1960}
              max={2030}
              placeholder="2026"
              value={filters.year}
              onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))}
              dir="ltr"
            />
          </div>
        </div>

        {/* چیپ‌های ژانر */}
        <div className="space-y-2">
          <span className="text-text-secondary block text-xs font-medium">
            دسته‌بندی سریع ژانرها:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, category: "" }))}
              className={cn(
                "cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.category === ""
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-border-subtle bg-canvas/50 text-text-secondary hover:border-border-strong"
              )}
            >
              همه ژانرها
            </button>

            {categories.map((cat) => {
              const active = filters.category === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category: active ? "" : cat.slug,
                    }))
                  }
                  className={cn(
                    "cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border-subtle bg-canvas/50 text-text-secondary hover:border-border-strong hover:text-text-primary"
                  )}
                >
                  {cat.titleFa}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* آمار نتایج */}
      {!isLoading && !isError && (
        <div className="text-text-secondary flex items-center justify-between text-sm">
          <span>
            تعداد کل نتایج یافت‌شده:{" "}
            <strong className="text-primary">{toPersianNumber(totalCount)}</strong> انیمه
          </span>
          {debouncedQuery && (
            <span className="text-text-muted text-xs">
              مرتب‌سازی بر اساس بیشترین تطابق با عبارت جستجو
            </span>
          )}
        </div>
      )}

      {/* وضعیت لودینگ */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 20 }).map((_, idx) => (
            <AnimeCardSkeleton key={idx} />
          ))}
        </div>
      )}

      {/* وضعیت خطا */}
      {isError && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
          <p className="mb-4 text-sm text-rose-300">
            خطا در دریافت لیست انیمه‌ها از سرور.
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </div>
      )}

      {/* حالت خالی */}
      {!isLoading && !isError && allItems.length === 0 && (
        <div className="border-border-subtle bg-surface rounded-2xl border p-12 text-center">
          <p className="text-text-primary mb-3 text-base font-semibold">
            هیچ انیمه‌ای با این فیلترها پیدا نشد!
          </p>
          <p className="text-text-secondary mb-5 text-sm">
            فیلترها را تغییر دهید یا جستجو را پاک کنید.
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            نمایش همه انیمه‌ها
          </Button>
        </div>
      )}

      {/* گرید نتایج */}
      {!isLoading && allItems.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {allItems.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                size="lg"
                isLoading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                بارگذاری انیمه‌های بیشتر
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
