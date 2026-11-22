export type AnimeSubtype = "TV" | "movie" | "OVA" | "ONA" | "special" | "music";

export type AnimeStatus = "current" | "finished" | "tba" | "unreleased" | "upcoming";

export type AnimeSeason = "winter" | "spring" | "summer" | "fall";

export type AnimeSortOption = "popularity" | "rating" | "newest" | "trending";

export interface AnimeImageSet {
  tiny: string | null;
  small: string | null;
  medium: string | null;
  large: string | null;
  original: string | null;
}

export interface CategoryItem {
  id: string;
  slug: string;
  title: string;
  titleFa: string;
}

export interface AnimeSummary {
  id: string;
  slug: string;
  title: string;
  englishTitle: string | null;
  romajiTitle: string | null;
  japaneseTitle: string | null;
  synopsis: string;
  posterUrl: string | null;
  coverUrl: string | null;
  ratingOutOf10: number | null; // تبدیل‌شده از درصد به مقیاس 10
  averageRatingRaw: number | null;
  popularityRank: number | null;
  ratingRank: number | null;
  subtype: AnimeSubtype;
  status: AnimeStatus;
  episodeCount: number | null;
  episodeLength: number | null;
  startDate: string | null;
  year: number | null;
}

export interface RelatedAnimeItem {
  relationRole: string;
  relationRoleFa: string;
  anime: {
    id: string;
    slug: string;
    title: string;
    posterUrl: string | null;
    subtype: AnimeSubtype;
    type: "anime" | "manga";
  };
}

export interface AnimeDetails extends AnimeSummary {
  endDate: string | null;
  ageRating: string | null;
  ageRatingGuide: string | null;
  youtubeVideoId: string | null;
  userCount: number;
  favoritesCount: number;
  categories: CategoryItem[];
  studios: string[];
  relations: RelatedAnimeItem[];
}

export interface EpisodeItem {
  id: string;
  number: number;
  title: string;
  synopsis: string | null;
  airdate: string | null;
  length: number | null;
  thumbnailUrl: string | null;
}

export interface CharacterItem {
  id: string;
  name: string;
  role: "main" | "supporting";
  roleFa: string;
  imageUrl: string | null;
  description: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  offset: number;
  limit: number;
  hasNextPage: boolean;
}

export interface AnimeExploreParams {
  query?: string;
  categories?: string[];
  season?: AnimeSeason;
  year?: number;
  status?: AnimeStatus;
  subtype?: AnimeSubtype;
  sort?: AnimeSortOption;
  offset?: number;
  limit?: number;
}
