"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Film, ArrowLeft } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { getAnimeList } from "@/lib/kitsu/queries";
import { SUBTYPE_LABELS_FA } from "@/lib/mappers/anime-mapper";
import { formatScore } from "@/lib/utils/format";
import { useDebounce } from "@/lib/utils/use-debounce";

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandSearchModal({ isOpen, onClose }: CommandSearchModalProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 400);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["quick-search", debouncedQuery],
    queryFn: ({ signal }) =>
      getAnimeList({ query: debouncedQuery, limit: 6 }, { signal }),
    enabled: isOpen && debouncedQuery.length >= 2,
  });

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="جستجوی سریع انیمه"
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-4">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="نام انیمه را به انگلیسی یا روماجی بنویسید (مثلاً: Attack on Titan)..."
          startIcon={<Search className="h-4 w-4" />}
          dir="auto"
        />

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {debouncedQuery.length < 2 && (
            <p className="text-text-muted py-8 text-center text-sm">
              حداقل ۲ حرف تایپ کنید تا جستجو شروع شود...
            </p>
          )}

          {isFetching && (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-16 w-full" />
              ))}
            </div>
          )}

          {isError && (
            <p className="py-6 text-center text-sm text-rose-400">
              خطا در ارتباط با سرور. لطفاً دوباره امتحان کنید.
            </p>
          )}

          {!isFetching && data && data.items.length === 0 && (
            <p className="text-text-muted py-8 text-center text-sm">
              انیمه‌ای با این عنوان پیدا نشد.
            </p>
          )}

          {!isFetching &&
            data?.items.map((anime) => (
              <Link
                key={anime.id}
                href={`/anime/${anime.slug}`}
                onClick={handleClose}
                className="bg-canvas/50 hover:border-border-strong hover:bg-surface-elevated flex items-center justify-between gap-3 rounded-xl border border-transparent p-2.5 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-surface-elevated relative h-14 w-10 shrink-0 overflow-hidden rounded-lg">
                    {anime.posterUrl ? (
                      <Image
                        src={anime.posterUrl}
                        alt={anime.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-text-muted flex h-full items-center justify-center">
                        <Film className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className="text-text-primary truncate text-sm font-semibold"
                      dir="ltr"
                    >
                      {anime.title}
                    </p>
                    <div className="text-text-secondary mt-1 flex items-center gap-3 text-xs">
                      <span>{SUBTYPE_LABELS_FA[anime.subtype]}</span>
                      <span className="text-primary inline-flex items-center gap-1">
                        <Star className="fill-primary h-3 w-3" />
                        {formatScore(anime.ratingOutOf10)}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowLeft className="text-text-muted h-4 w-4 shrink-0" />
              </Link>
            ))}
        </div>

        {debouncedQuery.length >= 2 && (
          <div className="border-border-subtle border-t pt-3 text-center">
            <Link
              href={`/explore?q=${encodeURIComponent(debouncedQuery)}`}
              onClick={handleClose}
              className="text-primary text-xs font-medium hover:underline"
            >
              مشاهده تمام نتایج در صفحه اکسپلور ←
            </Link>
          </div>
        )}
      </div>
    </Modal>
  );
}
