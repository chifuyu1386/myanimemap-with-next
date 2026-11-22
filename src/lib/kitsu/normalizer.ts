import { translateCategory, translateRelationRole } from "@/lib/mappers/anime-mapper";
import type {
  AnimeDetails,
  AnimeStatus,
  AnimeSubtype,
  AnimeSummary,
  CategoryItem,
  CharacterItem,
  EpisodeItem,
  RelatedAnimeItem,
} from "@/types/anime";
import type {
  KitsuAnimeProductionResource,
  KitsuAnimeResource,
  KitsuCategoryResource,
  KitsuCharacterResource,
  KitsuEpisodeResource,
  KitsuIncludedResource,
  KitsuMediaCharacterResource,
  KitsuMediaRelationshipResource,
  KitsuProducerResource,
} from "./types";

const VALID_SUBTYPES = new Set<AnimeSubtype>([
  "TV",
  "movie",
  "OVA",
  "ONA",
  "special",
  "music",
]);

const VALID_STATUSES = new Set<AnimeStatus>([
  "current",
  "finished",
  "tba",
  "unreleased",
  "upcoming",
]);

function normalizeSubtype(subtype?: string | null): AnimeSubtype {
  if (subtype && VALID_SUBTYPES.has(subtype as AnimeSubtype)) {
    return subtype as AnimeSubtype;
  }
  return "TV";
}

function normalizeStatus(status?: string | null): AnimeStatus {
  if (status && VALID_STATUSES.has(status as AnimeStatus)) {
    return status as AnimeStatus;
  }
  return "tba";
}

function parseRatingOutOf10(averageRating?: string | null): {
  raw: number | null;
  outOf10: number | null;
} {
  if (!averageRating) return { raw: null, outOf10: null };
  const parsed = Number.parseFloat(averageRating);
  if (Number.isNaN(parsed)) return { raw: null, outOf10: null };
  return {
    raw: parsed,
    outOf10: Math.round((parsed / 10) * 10) / 10,
  };
}

function extractYear(startDate?: string | null): number | null {
  if (!startDate) return null;
  const year = Number.parseInt(startDate.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

function pickPoster(resource: KitsuAnimeResource): string | null {
  const img = resource.attributes.posterImage;
  return img?.large ?? img?.medium ?? img?.original ?? img?.small ?? null;
}

function pickCover(resource: KitsuAnimeResource): string | null {
  const img = resource.attributes.coverImage;
  return img?.large ?? img?.original ?? img?.small ?? null;
}

function createIncludedMap(
  included: KitsuIncludedResource[] = []
): Map<string, KitsuIncludedResource> {
  const map = new Map<string, KitsuIncludedResource>();
  for (const item of included) {
    map.set(`${item.type}:${item.id}`, item);
  }
  return map;
}

function getRelationRefs(
  resource: { relationships?: Record<string, { data?: unknown }> },
  key: string
): Array<{ id: string; type: string }> {
  const relData = resource.relationships?.[key]?.data;
  if (!relData) return [];
  if (Array.isArray(relData)) {
    return relData.filter((item): item is { id: string; type: string } =>
      Boolean(item && typeof item === "object" && "id" in item && "type" in item)
    );
  }
  if (typeof relData === "object" && "id" in relData && "type" in relData) {
    return [relData as { id: string; type: string }];
  }
  return [];
}

export function normalizeAnimeSummary(resource: KitsuAnimeResource): AnimeSummary {
  const attr = resource.attributes;
  const rating = parseRatingOutOf10(attr.averageRating);

  return {
    id: resource.id,
    slug: attr.slug,
    title: attr.titles?.en || attr.canonicalTitle || attr.titles?.en_jp || "Untitled",
    englishTitle: attr.titles?.en ?? null,
    romajiTitle: attr.titles?.en_jp ?? attr.canonicalTitle ?? null,
    japaneseTitle: attr.titles?.ja_jp ?? null,
    synopsis: (attr.synopsis || attr.description || "").trim(),
    posterUrl: pickPoster(resource),
    coverUrl: pickCover(resource),
    ratingOutOf10: rating.outOf10,
    averageRatingRaw: rating.raw,
    popularityRank: attr.popularityRank ?? null,
    ratingRank: attr.ratingRank ?? null,
    subtype: normalizeSubtype(attr.subtype),
    status: normalizeStatus(attr.status),
    episodeCount: attr.episodeCount ?? null,
    episodeLength: attr.episodeLength ?? null,
    startDate: attr.startDate ?? null,
    year: extractYear(attr.startDate),
  };
}

export function normalizeAnimeDetails(
  resource: KitsuAnimeResource,
  included: KitsuIncludedResource[] = []
): AnimeDetails {
  const base = normalizeAnimeSummary(resource);
  const includedMap = createIncludedMap(included);

  // استخراج دسته‌بندی‌ها / ژانرها
  const categories: CategoryItem[] = getRelationRefs(resource, "categories")
    .map((ref) => includedMap.get(`${ref.type}:${ref.id}`))
    .filter((item): item is KitsuCategoryResource => item?.type === "categories")
    .map((cat) => ({
      id: cat.id,
      slug: cat.attributes.slug,
      title: cat.attributes.title,
      titleFa: translateCategory(cat.attributes.slug, cat.attributes.title),
    }));

  // استخراج استودیوها
  const studioSet = new Set<string>();
  const productionRefs = getRelationRefs(resource, "animeProductions");
  for (const prodRef of productionRefs) {
    const prod = includedMap.get(`${prodRef.type}:${prodRef.id}`) as
      KitsuAnimeProductionResource | undefined;
    if (!prod || prod.type !== "animeProductions") continue;
    if (prod.attributes.role !== "studio") continue;

    const producerRefs = getRelationRefs(prod, "producer");
    for (const pRef of producerRefs) {
      const producer = includedMap.get(`${pRef.type}:${pRef.id}`) as
        KitsuProducerResource | undefined;
      if (producer?.type === "producers" && producer.attributes.name) {
        studioSet.add(producer.attributes.name);
      }
    }
  }

  // استخراج انیمه‌های مرتبط (فصل قبل/بعد و...)
  const relations: RelatedAnimeItem[] = [];
  const relationRefs = getRelationRefs(resource, "mediaRelationships");
  for (const relRef of relationRefs) {
    const rel = includedMap.get(`${relRef.type}:${relRef.id}`) as
      KitsuMediaRelationshipResource | undefined;
    if (!rel || rel.type !== "mediaRelationships") continue;

    const destRefs = getRelationRefs(rel, "destination");
    for (const destRef of destRefs) {
      if (destRef.type !== "anime") continue;
      const destAnime = includedMap.get(`anime:${destRef.id}`) as
        KitsuAnimeResource | undefined;
      if (!destAnime || destAnime.type !== "anime") continue;

      relations.push({
        relationRole: rel.attributes.role,
        relationRoleFa: translateRelationRole(rel.attributes.role),
        anime: {
          id: destAnime.id,
          slug: destAnime.attributes.slug,
          title:
            destAnime.attributes.titles?.en ||
            destAnime.attributes.canonicalTitle ||
            "Untitled",
          posterUrl: pickPoster(destAnime),
          subtype: normalizeSubtype(destAnime.attributes.subtype),
          type: "anime",
        },
      });
    }
  }

  const attr = resource.attributes;
  return {
    ...base,
    endDate: attr.endDate ?? null,
    ageRating: attr.ageRating ?? null,
    ageRatingGuide: attr.ageRatingGuide ?? null,
    youtubeVideoId: attr.youtubeVideoId ?? null,
    userCount: attr.userCount ?? 0,
    favoritesCount: attr.favoritesCount ?? 0,
    categories,
    studios: Array.from(studioSet),
    relations,
  };
}

export function normalizeEpisode(resource: KitsuEpisodeResource): EpisodeItem {
  const attr = resource.attributes;
  const num = attr.number ?? attr.relativeNumber ?? 0;

  return {
    id: resource.id,
    number: num,
    title:
      attr.canonicalTitle || attr.titles?.en_us || attr.titles?.en_jp || `Episode ${num}`,
    synopsis: attr.synopsis?.trim() || null,
    airdate: attr.airdate ?? null,
    length: attr.length ?? null,
    thumbnailUrl: attr.thumbnail?.original ?? attr.thumbnail?.large ?? null,
  };
}

export function normalizeCharacters(
  resources: KitsuMediaCharacterResource[],
  included: KitsuIncludedResource[] = []
): CharacterItem[] {
  const includedMap = createIncludedMap(included);

  return resources
    .map((relItem): CharacterItem | null => {
      const charRef = getRelationRefs(relItem, "character")[0];
      if (!charRef) return null;

      const char = includedMap.get(`${charRef.type}:${charRef.id}`) as
        KitsuCharacterResource | undefined;
      if (!char || char.type !== "characters") return null;

      const role = relItem.attributes.role === "main" ? "main" : "supporting";

      return {
        id: char.id,
        name: char.attributes.canonicalName || char.attributes.name || "Unknown",
        role,
        roleFa: role === "main" ? "شخصیت اصلی" : "شخصیت مکمل",
        imageUrl: char.attributes.image?.original ?? null,
        description: char.attributes.description?.trim() || null,
      };
    })
    .filter((item): item is CharacterItem => item !== null);
}

export function normalizeCategory(resource: KitsuCategoryResource): CategoryItem {
  return {
    id: resource.id,
    slug: resource.attributes.slug,
    title: resource.attributes.title,
    titleFa: translateCategory(resource.attributes.slug, resource.attributes.title),
  };
}
