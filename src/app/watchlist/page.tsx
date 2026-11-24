import type { Metadata } from "next";
import { WatchlistClient } from "@/features/watchlist/WatchlistClient";

export const metadata: Metadata = {
  title: "واچ‌لیست من",
  description: "مدیریت واچ‌لیست شخصی انیمه‌ها، امتیازات و آمار تماشا",
};

export default function WatchlistPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <WatchlistClient />
    </main>
  );
}
