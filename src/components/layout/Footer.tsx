import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-border-subtle bg-surface/50 mt-16 border-t">
      <div className="text-text-secondary mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary h-4 w-4" />
          <span className="text-text-primary font-semibold" dir="ltr">
            MyAnimeMap
          </span>
          <span>— پلتفرم شخصی کشف و مدیریت انیمه</span>
        </div>

        <div className="text-text-muted flex items-center gap-4 text-xs">
          <Link href="/explore" className="hover:text-primary">
            اکسپلور
          </Link>
          <Link href="/watchlist" className="hover:text-primary">
            واچ‌لیست من
          </Link>
          <span>داده‌ها از Kitsu API</span>
        </div>
      </div>
    </footer>
  );
}
