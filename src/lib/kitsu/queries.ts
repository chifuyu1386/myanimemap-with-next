import type {
  AnimeDetails,
  AnimeExploreParams,
  AnimeSortOption,
  AnimeSummary,
  CategoryItem,
  CharacterItem,
  EpisodeItem,
  PaginatedResult,
} from "@/types/anime";
import { kitsuFetch } from "./client";
import {
  normalizeAnimeDetails,
  normalizeAnimeSummary,
  normalizeCategory,
  normalizeCharacters,
  normalizeEpisode,
} from "./normalizer";
import type {
  JsonApiResponse,
  KitsuAnimeResource,
  KitsuCategoryResource,
  KitsuEpisodeResource,
  KitsuMediaCharacterResource,
} from "./types";

const SUMMARY_ANIME_FIELDS = [
  "slug",
  "canonicalTitle",
  "titles",
  "synopsis",
  "averageRating",
  "popularityRank",
  "ratingRank",
  "subtype",
  "status",
  "episodeCount",
  "episodeLength",
  "startDate",
  "posterImage",
  "coverImage",
].join(",");

function mapSortToKitsu(sort?: AnimeSortOption): string {
  switch (sort) {
    case "rating":
      return "ratingRank";
    case "newest":
      return "-startDate";
    case "popularity":
    default:
      return "popularityRank";
  }
}

export async function getTrendingAnime(
  limit = 10,
  revalidate: number | false = 3600
): Promise<AnimeSummary[]> {
  const response = await kitsuFetch<JsonApiResponse<KitsuAnimeResource[]>>(
    "/trending/anime",
    {
      params: {
        limit,
        "fields[anime]": SUMMARY_ANIME_FIELDS,
      },
      revalidate,
    }
  );

  return response.data.map(normalizeAnimeSummary);
}

export async function getAnimeList(
  params: AnimeExploreParams = {},
  options: { revalidate?: number | false; signal?: AbortSignal } = {}
): Promise<PaginatedResult<AnimeSummary>> {
  const limit = Math.min(params.limit ?? 20, 20);
  const offset = params.offset ?? 0;

  const queryParams: Record<string, string | number | undefined> = {
    "page[limit]": limit,
    "page[offset]": offset,
    "fields[anime]": SUMMARY_ANIME_FIELDS,
  };

  if (params.query?.trim()) {
    // نکته مهم کیتسو: هنگام جستجوی متنی، سورت را نمی‌فرستیم تا رتبه‌بندی بر اساس تطابق متن باشد
    queryParams["filter[text]"] = params.query.trim();
  } else {
    queryParams.sort = mapSortToKitsu(params.sort);
  }

  if (params.categories && params.categories.length > 0) {
    queryParams["filter[categories]"] = params.categories.join(",");
  }
  if (params.season) {
    queryParams["filter[season]"] = params.season;
  }
  if (params.year) {
    queryParams["filter[seasonYear]"] = params.year;
  }
  if (params.status) {
    queryParams["filter[status]"] = params.status;
  }
  if (params.subtype) {
    queryParams["filter[subtype]"] = params.subtype;
  }

  const response = await kitsuFetch<JsonApiResponse<KitsuAnimeResource[]>>("/anime", {
    params: queryParams,
    revalidate: options.revalidate,
    signal: options.signal,
  });

  const totalCount = response.meta?.count ?? response.data.length;
  const items = response.data.map(normalizeAnimeSummary);

  return {
    items,
    totalCount,
    offset,
    limit,
    hasNextPage: offset + items.length < totalCount,
  };
}

export async function getAnimeByIdOrSlug(
  idOrSlug: string,
  revalidate: number | false = 3600
): Promise<AnimeDetails | null> {
  const isNumericId = /^\d+$/.test(idOrSlug);
  const includeParams =
    "categories,animeProductions.producer,mediaRelationships.destination";

  if (isNumericId) {
    try {
      const response = await kitsuFetch<JsonApiResponse<KitsuAnimeResource>>(
        `/anime/${idOrSlug}`,
        {
          params: { include: includeParams },
          revalidate,
        }
      );
      return normalizeAnimeDetails(response.data, response.included);
    } catch {
      return null;
    }
  }

  const response = await kitsuFetch<JsonApiResponse<KitsuAnimeResource[]>>("/anime", {
    params: {
      "filter[slug]": idOrSlug,
      include: includeParams,
      "page[limit]": 1,
    },
    revalidate,
  });

  const first = response.data[0];
  if (!first) return null;

  return normalizeAnimeDetails(first, response.included);
}

export async function getAnimeEpisodes(
  animeId: string,
  offset = 0,
  limit = 20,
  signal?: AbortSignal
): Promise<PaginatedResult<EpisodeItem>> {
  const safeLimit = Math.min(limit, 20);
  const response = await kitsuFetch<JsonApiResponse<KitsuEpisodeResource[]>>(
    `/anime/${animeId}/episodes`,
    {
      params: {
        "page[limit]": safeLimit,
        "page[offset]": offset,
        sort: "number",
      },
      signal,
    }
  );

  const totalCount = response.meta?.count ?? response.data.length;
  const items = response.data.map(normalizeEpisode);

  return {
    items,
    totalCount,
    offset,
    limit: safeLimit,
    hasNextPage: offset + items.length < totalCount,
  };
}

export async function getAnimeCharacters(
  animeId: string,
  offset = 0,
  limit = 20,
  signal?: AbortSignal
): Promise<PaginatedResult<CharacterItem>> {
  const safeLimit = Math.min(limit, 20);
  const response = await kitsuFetch<JsonApiResponse<KitsuMediaCharacterResource[]>>(
    `/anime/${animeId}/characters`,
    {
      params: {
        include: "character",
        "page[limit]": safeLimit,
        "page[offset]": offset,
      },
      signal,
    }
  );

  const totalCount = response.meta?.count ?? response.data.length;
  const items = normalizeCharacters(response.data, response.included);

  return {
    items,
    totalCount,
    offset,
    limit: safeLimit,
    hasNextPage: offset + response.data.length < totalCount,
  };
}

export async function getTopCategories(
  limit = 20,
  revalidate: number | false = 86400
): Promise<CategoryItem[]> {
  const response = await kitsuFetch<JsonApiResponse<KitsuCategoryResource[]>>(
    "/categories",
    {
      params: {
        "page[limit]": Math.min(limit, 20),
        sort: "-totalMediaCount",
      },
      revalidate,
    }
  );

  return response.data.map(normalizeCategory);
}
