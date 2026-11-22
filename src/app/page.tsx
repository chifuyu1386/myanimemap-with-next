import { getTrendingAnime } from "@/lib/kitsu/queries";
import { SUBTYPE_LABELS_FA } from "@/lib/mappers/anime-mapper";
import { formatScore } from "@/lib/utils/format";

export default async function HomePage() {
  const trending = await getTrendingAnime(6);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-primary mb-2 text-3xl font-bold">MyAnimeMap</h1>
      <p className="text-text-secondary mb-8">
        تست اتصال مستقیم به Kitsu API (انیمه‌های ترند روز):
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trending.map((anime) => (
          <div
            key={anime.id}
            className="border-border-subtle bg-surface rounded-xl border p-4"
          >
            <h2 className="text-text-primary font-semibold" dir="ltr">
              {anime.title}
            </h2>
            <div className="text-text-secondary mt-2 flex items-center justify-between text-sm">
              <span>{SUBTYPE_LABELS_FA[anime.subtype]}</span>
              <span className="text-primary">
                امتیاز: {formatScore(anime.ratingOutOf10)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
