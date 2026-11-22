import type { AnimeSeason, AnimeStatus, AnimeSubtype } from "@/types/anime";

export const SUBTYPE_LABELS_FA: Record<AnimeSubtype, string> = {
  TV: "سریالی",
  movie: "سینمایی",
  OVA: "OVA",
  ONA: "ONA",
  special: "ویژه",
  music: "موزیک ویدیو",
};

export const STATUS_LABELS_FA: Record<AnimeStatus, string> = {
  current: "در حال پخش",
  finished: "پایان‌یافته",
  upcoming: "به‌زودی",
  unreleased: "منتشرنشده",
  tba: "نامشخص",
};

export const SEASON_LABELS_FA: Record<AnimeSeason, string> = {
  winter: "زمستان",
  spring: "بهار",
  summer: "تابستان",
  fall: "پاییز",
};

export const RELATION_LABELS_FA: Record<string, string> = {
  sequel: "دنباله (فصل بعد)",
  prequel: "پیش‌درآمد (فصل قبل)",
  alternative_setting: "دنیای موازی",
  alternative_version: "نسخه جایگزین",
  side_story: "داستان فرعی",
  parent_story: "داستان اصلی",
  summary: "خلاصه",
  full_story: "داستان کامل",
  spinoff: "اسپین‌آف",
  adaptation: "اقتباس",
  character: "شخصیت مشترک",
  other: "مرتبط",
};

export const CATEGORY_LABELS_FA: Record<string, string> = {
  action: "اکشن",
  adventure: "ماجراجویی",
  comedy: "کمدی",
  drama: "درام",
  fantasy: "فانتزی",
  horror: "ترسناک",
  mystery: "معمایی",
  psychological: "روان‌شناختی",
  romance: "عاشقانه",
  "sci-fi": "علمی‌تخیلی",
  "science-fiction": "علمی‌تخیلی",
  "slice-of-life": "روزمره",
  sports: "ورزشی",
  supernatural: "ماوراءالطبیعه",
  thriller: "هیجان‌انگیز",
  mecha: "مکا (رباتیک)",
  music: "موسیقی",
  school: "مدرسه‌ای",
  isekai: "ایسکای",
  shonen: "شونن",
  seinen: "سینن",
  shojo: "شوجو",
  magic: "جادویی",
  historical: "تاریخی",
  military: "نظامی",
  samurai: "سامورایی",
  demons: "شیاطین",
  vampire: "خون‌آشام",
  "martial-arts": "رزمی",
  space: "فضایی",
  detective: "کارآگاهی",
};

export function translateCategory(slug: string, fallbackTitle: string): string {
  return CATEGORY_LABELS_FA[slug.toLowerCase()] ?? fallbackTitle;
}

export function translateRelationRole(role: string): string {
  return RELATION_LABELS_FA[role] ?? "مرتبط";
}

export function getCurrentAnimeSeason(): { season: AnimeSeason; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (month <= 3) return { season: "winter", year };
  if (month <= 6) return { season: "spring", year };
  if (month <= 9) return { season: "summer", year };
  return { season: "fall", year };
}
