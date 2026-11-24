import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, Film, Heart, Star, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AnimeDetailsTabs } from "@/features/anime/AnimeDetailsTabs";
import { TrailerButton } from "@/features/anime/TrailerButton";
import { AnimeWatchlistPanel } from "@/features/watchlist/AnimeWatchlistPanel";
import { getAnimeByIdOrSlug } from "@/lib/kitsu/queries";
import { STATUS_LABELS_FA, SUBTYPE_LABELS_FA } from "@/lib/mappers/anime-mapper";
import { formatCompactNumber, formatScore, toPersianNumber } from "@/lib/utils/format";

interface AnimeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AnimeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const anime = await getAnimeByIdOrSlug(slug, 3600);

  if (!anime) {
    return { title: "انیمه یافت نشد" };
  }

  return {
    title: anime.title,
    description: anime.synopsis.slice(0, 160) || `جزئیات و واچ‌لیست ${anime.title}`,
    openGraph: {
      title: `${anime.title} | MyAnimeMap`,
      images: anime.posterUrl ? [anime.posterUrl] : [],
    },
  };
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { slug } = await params;
  const anime = await getAnimeByIdOrSlug(slug, 3600);

  if (!anime) {
    notFound();
  }

  const bannerImage = anime.coverUrl || anime.posterUrl;

  return (
    <main className="pb-16">
      {/* بنر محو بالای صفحه */}
      <div className="bg-surface relative h-56 w-full overflow-hidden sm:h-72">
        {bannerImage && (
          <Image
            src={bannerImage}
            alt={anime.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-35 blur-[2px]"
          />
        )}
        <div className="from-canvas via-canvas/70 to-canvas/20 absolute inset-0 bg-gradient-to-t" />
      </div>

      <div className="mx-auto -mt-28 max-w-7xl space-y-8 px-4 sm:-mt-32 sm:px-6">
        {/* بخش اصلی هدر انیمه */}
        <section className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end">
          {/* پوستر */}
          <div className="border-border-strong bg-surface-elevated relative mx-auto aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-2xl border-2 shadow-2xl shadow-black/70 sm:w-52 md:mx-0">
            {anime.posterUrl ? (
              <Image
                src={anime.posterUrl}
                alt={anime.title}
                fill
                priority
                sizes="(max-width: 640px) 176px, 208px"
                className="object-cover"
              />
            ) : (
              <div className="text-text-muted flex h-full items-center justify-center">
                <Film className="h-12 w-12" />
              </div>
            )}
          </div>

          {/* اطلاعات عنوان، امتیازها و ژانرها */}
          <div className="flex-1 space-y-4 text-center md:text-start">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <Badge variant="primary">{SUBTYPE_LABELS_FA[anime.subtype]}</Badge>
              <Badge variant="glass">{STATUS_LABELS_FA[anime.status]}</Badge>
              {anime.year && (
                <Badge variant="outline">{toPersianNumber(anime.year)}</Badge>
              )}
              {anime.studios.map((studio) => (
                <Badge key={studio} variant="default" dir="ltr">
                  {studio}
                </Badge>
              ))}
            </div>

            <div className="space-y-1">
              <h1
                className="text-text-primary text-2xl font-extrabold sm:text-4xl"
                dir="ltr"
              >
                {anime.title}
              </h1>
              {anime.romajiTitle && anime.romajiTitle !== anime.title && (
                <p className="text-text-secondary text-sm" dir="ltr">
                  {anime.romajiTitle}
                  {anime.japaneseTitle ? ` • ${anime.japaneseTitle}` : ""}
                </p>
              )}
            </div>

            {/* متریک‌های کلیدی */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <div className="border-primary/30 bg-primary/10 flex items-center gap-2 rounded-xl border px-3.5 py-2">
                <Star className="fill-primary text-primary h-4 w-4" />
                <span className="text-primary text-sm font-bold">
                  {formatScore(anime.ratingOutOf10)}
                </span>
                <span className="text-text-secondary text-xs">/ ۱۰</span>
              </div>

              {anime.ratingRank && (
                <div className="border-border-subtle bg-surface text-text-secondary flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs">
                  <Award className="h-4 w-4 text-amber-400" />
                  رتبه امتیاز: #{toPersianNumber(anime.ratingRank)}
                </div>
              )}

              {anime.popularityRank && (
                <div className="border-border-subtle bg-surface text-text-secondary flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  محبوبیت: #{toPersianNumber(anime.popularityRank)}
                </div>
              )}

              <div className="border-border-subtle bg-surface text-text-secondary flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs">
                <Users className="text-primary h-4 w-4" />
                {formatCompactNumber(anime.userCount)} کاربر
              </div>

              <div className="border-border-subtle bg-surface text-text-secondary flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs">
                <Heart className="h-4 w-4 text-rose-400" />
                {formatCompactNumber(anime.favoritesCount)} علاقه‌مندی
              </div>
            </div>

            {/* ژانرها + دکمه تریلر */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 md:justify-start">
              {anime.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/explore?category=${encodeURIComponent(cat.slug)}`}
                  className="border-border-subtle bg-surface text-text-secondary hover:border-primary hover:text-primary rounded-xl border px-3 py-1 text-xs transition-colors"
                >
                  {cat.titleFa}
                </Link>
              ))}

              {anime.youtubeVideoId && (
                <TrailerButton
                  youtubeVideoId={anime.youtubeVideoId}
                  title={anime.title}
                />
              )}
            </div>
          </div>
        </section>

        {/* پنل مدیریت واچ‌لیست */}
        <AnimeWatchlistPanel
          anime={{
            id: anime.id,
            slug: anime.slug,
            title: anime.title,
            posterUrl: anime.posterUrl,
            subtype: anime.subtype,
            episodeCount: anime.episodeCount,
            episodeLength: anime.episodeLength,
            ratingOutOf10: anime.ratingOutOf10,
          }}
        />

        {/* تب‌های بررسی، شخصیت‌ها و قسمت‌ها */}
        <AnimeDetailsTabs anime={anime} />
      </div>
    </main>
  );
}
