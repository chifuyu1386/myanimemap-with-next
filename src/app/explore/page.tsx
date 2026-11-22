import type { Metadata } from "next";
import { getTopCategories } from "@/lib/kitsu/queries";
import { ExploreClient, type ExploreFilterState } from "@/features/explore/ExploreClient";
import type {
  AnimeSeason,
  AnimeSortOption,
  AnimeStatus,
  AnimeSubtype,
} from "@/types/anime";

export const metadata: Metadata = {
  title: "اکسپلور و جستجوی پیشرفته",
  description: "جستجو و فیلتر انیمه‌ها بر اساس ژانر، سال، فصل، وضعیت و امتیاز",
};

interface ExplorePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string {
  const val = params[key];
  return Array.isArray(val) ? (val[0] ?? "") : (val ?? "");
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolved = await searchParams;
  const categories = await getTopCategories(20, 86400);

  const rawSort = getParam(resolved, "sort");
  const validSort: AnimeSortOption =
    rawSort === "rating" || rawSort === "newest" ? rawSort : "popularity";

  const initialFilters: ExploreFilterState = {
    query: getParam(resolved, "q"),
    sort: validSort,
    status: getParam(resolved, "status") as AnimeStatus | "",
    subtype: getParam(resolved, "subtype") as AnimeSubtype | "",
    season: getParam(resolved, "season") as AnimeSeason | "",
    year: getParam(resolved, "year"),
    category: getParam(resolved, "category"),
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <ExploreClient initialFilters={initialFilters} categories={categories} />
    </main>
  );
}
