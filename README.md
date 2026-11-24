# MyAnimeMap

A modern, RTL-first (Persian) anime discovery and personal watchlist web application built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **TanStack Query v5**, **Zustand**, and **React Hook Form + Zod**, powered by the **Kitsu JSON:API**.

> 🔗 **Live Demo:** `[Add your Vercel URL here]`

---

## ✨ Key Features

- **Curated Discovery Home:** Hero trending showcase slider + curated rows (Currently Airing, All-Time Popular, Top Rated, Top Anime Movies) rendered via Next.js Server Components with ISR caching.
- **URL-Synced Advanced Explore (`/explore`):** Multi-filter search (debounced text query, genre chips, status, format, season, year, sorting) synchronized with URL `searchParams` and powered by `useInfiniteQuery`.
- **Global Quick Search (`Ctrl + K` / `⌘ + K`):** Accessible command-palette modal to jump to any anime from anywhere in the app.
- **Rich Anime Details (`/anime/[slug]`):** Dynamic SEO metadata, YouTube trailer modal, related media links, and lazy-loaded **Characters** & **Episodes** tabs.
- **Personal Watchlist Dashboard (`/watchlist`):** Client-side persisted watchlist with status tabs, instant `+1/-1` episode tracking, personal scoring (1–10), notes validated via **React Hook Form + Zod**, real-time watch stats, and **JSON Backup (Import/Export)** with Zod schema validation.
- **Custom Dark-Blue UI System:** Handcrafted accessible components (Modal with Portal & Escape/scroll-lock, Tabs, Select, Toast notifications, Skeletons) without external UI component libraries.

---

## 🏗️ Architectural Highlights

- **Typed JSON:API Adapter & Normalizer (`src/lib/kitsu/`):** Resolves Kitsu `data` + `included` relationships, applies sparse fieldsets (`fields[anime]`) to minimize payload size, and guarantees null-safe domain types across the UI.
- **Next.js 16 Cache Components & Streaming Boundaries:** Route-hook dependent navigation is isolated inside `<Suspense>` boundaries to preserve static prerendering on dynamic routes (`/anime/[slug]`).
- **Hydration-Safe Persistence:** Uses React 19 `useSyncExternalStore` (`useHasHydrated`) to synchronize Zustand `localStorage` state and React Portals cleanly without SSR hydration mismatches.
- **Resilient Self-Hosted Fonts:** Variable fonts (`Vazirmatn` & `Inter`) bundled locally via Fontsource for consistent offline/network-independent builds.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Cache Components) & React 19
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS v4 (`@theme` CSS-first design tokens, RTL logical properties)
- **Server State:** TanStack Query v5
- **Client State:** Zustand (`persist` middleware)
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React
- **API:** Kitsu API (`https://kitsu.app/api/edge`)

---

## 🚀 Getting Started

```bash
git clone https://github.com/<YOUR-USERNAME>/myanimemap.git
cd myanimemap
npm install
npm run dev