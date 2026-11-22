export interface JsonApiRelationship {
  data?: Array<{ id: string; type: string }> | { id: string; type: string } | null;
}

export interface JsonApiResource<TType extends string, TAttrs> {
  id: string;
  type: TType;
  attributes: TAttrs;
  relationships?: Record<string, JsonApiRelationship>;
}

export interface JsonApiResponse<TData, TIncluded = KitsuIncludedResource> {
  data: TData;
  included?: TIncluded[];
  meta?: {
    count?: number;
  };
  links?: {
    first?: string;
    next?: string;
    last?: string;
  };
}

export interface KitsuImageObject {
  tiny?: string | null;
  small?: string | null;
  medium?: string | null;
  large?: string | null;
  original?: string | null;
}

export interface KitsuAnimeAttributes {
  slug: string;
  canonicalTitle: string;
  titles?: {
    en?: string | null;
    en_jp?: string | null;
    ja_jp?: string | null;
  } | null;
  synopsis?: string | null;
  description?: string | null;
  averageRating?: string | null;
  userCount?: number | null;
  favoritesCount?: number | null;
  popularityRank?: number | null;
  ratingRank?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  subtype?: string | null;
  episodeCount?: number | null;
  episodeLength?: number | null;
  ageRating?: string | null;
  ageRatingGuide?: string | null;
  youtubeVideoId?: string | null;
  posterImage?: KitsuImageObject | null;
  coverImage?: KitsuImageObject | null;
}

export interface KitsuCategoryAttributes {
  title: string;
  slug: string;
  description?: string | null;
  totalMediaCount?: number;
}

export interface KitsuProducerAttributes {
  name: string;
  slug?: string;
}

export interface KitsuAnimeProductionAttributes {
  role: "producer" | "licensor" | "studio" | string;
}

export interface KitsuMediaRelationshipAttributes {
  role: string;
}

export interface KitsuEpisodeAttributes {
  canonicalTitle?: string | null;
  titles?: {
    en_us?: string | null;
    en_jp?: string | null;
    ja_jp?: string | null;
  } | null;
  number?: number | null;
  relativeNumber?: number | null;
  synopsis?: string | null;
  airdate?: string | null;
  length?: number | null;
  thumbnail?: KitsuImageObject | null;
}

export interface KitsuCharacterAttributes {
  canonicalName?: string | null;
  name?: string | null;
  description?: string | null;
  image?: KitsuImageObject | null;
}

export interface KitsuMediaCharacterAttributes {
  role: "main" | "supporting" | string;
}

export type KitsuAnimeResource = JsonApiResource<"anime", KitsuAnimeAttributes>;
export type KitsuCategoryResource = JsonApiResource<
  "categories",
  KitsuCategoryAttributes
>;
export type KitsuProducerResource = JsonApiResource<"producers", KitsuProducerAttributes>;
export type KitsuAnimeProductionResource = JsonApiResource<
  "animeProductions",
  KitsuAnimeProductionAttributes
>;
export type KitsuMediaRelationshipResource = JsonApiResource<
  "mediaRelationships",
  KitsuMediaRelationshipAttributes
>;
export type KitsuEpisodeResource = JsonApiResource<"episodes", KitsuEpisodeAttributes>;
export type KitsuCharacterResource = JsonApiResource<
  "characters",
  KitsuCharacterAttributes
>;
export type KitsuMediaCharacterResource = JsonApiResource<
  "mediaCharacters" | "animeCharacters",
  KitsuMediaCharacterAttributes
>;

export type KitsuIncludedResource =
  | KitsuCategoryResource
  | KitsuProducerResource
  | KitsuAnimeProductionResource
  | KitsuMediaRelationshipResource
  | KitsuAnimeResource
  | KitsuCharacterResource
  | JsonApiResource<string, Record<string, unknown>>;
