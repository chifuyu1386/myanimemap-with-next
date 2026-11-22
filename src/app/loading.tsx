import { Skeleton } from "@/components/ui/Skeleton";
import { AnimeCardSkeleton } from "@/features/anime/AnimeCard";

export default function GlobalLoading() {
  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6">
      <Skeleton className="h-[420px] w-full rounded-3xl" />

      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <AnimeCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </main>
  );
}
