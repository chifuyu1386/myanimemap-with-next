const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianNumber(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

export function formatScore(scoreOutOf10: number | null): string {
  if (scoreOutOf10 === null) return "نامشخص";
  return toPersianNumber(scoreOutOf10.toFixed(1));
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${toPersianNumber((num / 1_000_000).toFixed(1))}M`;
  }
  if (num >= 1_000) {
    return `${toPersianNumber((num / 1_000).toFixed(1))}K`;
  }
  return toPersianNumber(num);
}

export function formatPersianDate(dateStr: string | null): string {
  if (!dateStr) return "نامشخص";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "نامشخص";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return "نامشخص";
  if (minutes < 60) return `${toPersianNumber(minutes)} دقیقه`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0
    ? `${toPersianNumber(hours)} ساعت و ${toPersianNumber(mins)} دقیقه`
    : `${toPersianNumber(hours)} ساعت`;
}
