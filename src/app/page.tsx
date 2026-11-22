import { getAnimeList, getTrendingAnime } from "@/lib/kitsu/queries";
import { HeroShowcase } from "@/features/anime/HeroShowcase";
import { AnimeGridSection } from "@/features/anime/AnimeGridSection";

export default async function HomePage() {
  const [trending, airingRes, popularRes, topRatedRes, moviesRes] = await Promise.all([
    getTrendingAnime(5, 3600),
    getAnimeList(
      { status: "current", sort: "popularity", limit: 10 },
      { revalidate: 3600 }
    ),
    getAnimeList({ sort: "popularity", limit: 10 }, { revalidate: 3600 }),
    getAnimeList({ sort: "rating", limit: 10 }, { revalidate: 3600 }),
    getAnimeList({ subtype: "movie", sort: "rating", limit: 10 }, { revalidate: 3600 }),
  ]);

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6">
      <HeroShowcase items={trending} />

      <AnimeGridSection
        title="در حال پخش این فصل"
        subtitle="محبوب‌ترین انیمه‌های در حال پخش هم‌اکنون"
        href="/explore?status=current&sort=popularity"
        items={airingRes.items}
      />

      <AnimeGridSection
        title="محبوب‌ترین‌های تاریخ"
        subtitle="پرطرفدارترین انیمه‌ها در میان کاربران"
        href="/explore?sort=popularity"
        items={popularRes.items}
      />

      <AnimeGridSection
        title="برترین امتیازها"
        subtitle="تحسین‌شده‌ترین انیمه‌ها بر اساس میانگین امتیاز"
        href="/explore?sort=rating"
        items={topRatedRes.items}
      />

      <AnimeGridSection
        title="سینمایی‌های برتر"
        subtitle="بهترین فیلم‌های انیمه‌ای برای یک آخر هفته عالی"
        href="/explore?subtype=movie&sort=rating"
        items={moviesRes.items}
      />
    </main>
  );
}
