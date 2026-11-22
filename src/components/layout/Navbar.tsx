"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookmarkCheck, Home, Menu, Search, Sparkles, X } from "lucide-react";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useHasHydrated } from "@/lib/utils/use-has-hydrated";
import { toPersianNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { CommandSearchModal } from "./CommandSearchModal";

const NAV_LINKS = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/explore", label: "اکسپلور", icon: Compass },
  { href: "/watchlist", label: "واچ‌لیست من", icon: BookmarkCheck },
];

export function Navbar() {
  const pathname = usePathname();
  const isHydrated = useHasHydrated();
  const watchlistCount = useWatchlistStore((s) => Object.keys(s.items).length);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <>
      <header className="border-border-subtle bg-canvas/85 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* لوگو و برند */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="from-accent to-primary shadow-primary/20 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-slate-950 shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span
                className="text-text-primary text-base font-extrabold tracking-tight"
                dir="ltr"
              >
                MyAnime<span className="text-primary">Map</span>
              </span>
              <span className="text-text-muted hidden text-[10px] sm:block">
                مرجع و واچ‌لیست انیمه
              </span>
            </div>
          </Link>

          {/* لینک‌های دسکتاپ */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                  {link.href === "/watchlist" && isHydrated && watchlistCount > 0 && (
                    <span className="bg-primary/20 text-primary rounded-md px-1.5 py-0.5 text-xs font-bold">
                      {toPersianNumber(watchlistCount)}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* دکمه سرچ و منوی موبایل */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="border-border-subtle bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-xl border px-3 text-sm transition-colors"
            >
              <Search className="text-primary h-4 w-4" />
              <span className="hidden sm:inline">جستجوی سریع...</span>
              <kbd
                dir="ltr"
                className="border-border-subtle bg-canvas text-text-muted hidden rounded-md border px-1.5 py-0.5 text-[10px] lg:inline"
              >
                Ctrl+K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="منوی موبایل"
              className="border-border-subtle bg-surface text-text-primary inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* منوی بازشوی موبایل */}
        {isMobileMenuOpen && (
          <div className="border-border-subtle bg-surface border-t px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-text-secondary hover:bg-surface-elevated"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </span>
                    {link.href === "/watchlist" && isHydrated && watchlistCount > 0 && (
                      <span className="bg-primary/20 text-primary rounded-md px-2 py-0.5 text-xs font-bold">
                        {toPersianNumber(watchlistCount)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <CommandSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
