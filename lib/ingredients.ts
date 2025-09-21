import fallbackIngredients from '../data/ingredients-sample.json';
import type { SearchMetrics, SearchTrendPoint } from './searchMetrics';
import { buildMetricsFromTrend, generateSearchTrend } from './searchMetrics';
import { formatTaxonomyId } from './string';

const INGREDIENT_DATA_URL = 'https://static.openfoodfacts.org/data/taxonomies/ingredients.full.json';
const TARGET_INGREDIENT_COUNT = 100;

type LanguageMap = Record<string, string>;
type MultiValueLanguageMap = Record<string, string[]>;

type RawIngredient = {
  name?: LanguageMap;
  parents?: string[];
  children?: string[];
  synonyms?: MultiValueLanguageMap;
  wikipedia?: LanguageMap;
  wikidata?: LanguageMap;
  ciqual_food_name?: LanguageMap;
  ciqual_food_code?: LanguageMap;
  carbon_footprint_fr_foodges_value?: LanguageMap;
  carbon_footprint_fr_foodges_ingredient?: LanguageMap;
  [key: string]: unknown;
};

export interface IngredientAttribute {
  label: string;
  values: string[];
}

export interface IngredientData {
  slug: string;
  originalId: string;
  displayName: string;
  superIngredients: string[];
  description: string | null;
  wikipediaUrl: string | null;
  wikidataId: string | null;
  imageUrl: string | null;
  synonyms: string[];
  search: SearchMetrics;
  trend: SearchTrendPoint[];
  attributes: IngredientAttribute[];
}

let ingredientsCache: Promise<IngredientData[]> | null = null;
const wikipediaSummaryCache = new Map<
  string,
  { summary: string | null; imageUrl: string | null; found: boolean }
>();

async function fetchDataset(): Promise<Record<string, RawIngredient>> {
  try {
    const response = await fetch(INGREDIENT_DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to download ingredient dataset: ${response.status}`);
    }
    return (await response.json()) as Record<string, RawIngredient>;
  } catch {
    return fallbackIngredients as Record<string, RawIngredient>;
  }
}

function pickPreferredValue(map?: LanguageMap): string | undefined {
  if (!map) return undefined;
  return map.en ?? Object.values(map)[0];
}

function pickAllValues(map?: LanguageMap, showLocale = false): string[] {
  if (!map) return [];
  const seen = new Set<string>();
  return Object.entries(map)
    .map(([locale, value]) => (showLocale && locale !== 'en' ? `${value} (${locale})` : value))
    .filter((value) => {
      if (!value || seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

function flattenMultiValues(map?: MultiValueLanguageMap): string[] {
  if (!map) return [];
  const values: string[] = [];
  Object.entries(map).forEach(([locale, synonyms]) => {
    synonyms
      .filter(Boolean)
      .forEach((item) => {
        const decorated = locale === 'en' ? item : `${item} (${locale})`;
        if (!values.includes(decorated)) {
          values.push(decorated);
        }
      });
  });
  return values;
}

function buildAttributes(raw: RawIngredient): IngredientAttribute[] {
  const attributes: IngredientAttribute[] = [];

  const ciqualNames = pickAllValues(raw.ciqual_food_name, true);
  if (ciqualNames.length) {
    attributes.push({ label: 'CIQUAL food name', values: ciqualNames });
  }

  const ciqualCodes = pickAllValues(raw.ciqual_food_code);
  if (ciqualCodes.length) {
    attributes.push({ label: 'CIQUAL food code', values: ciqualCodes });
  }

  const carbonIngredient = pickAllValues(raw.carbon_footprint_fr_foodges_ingredient, true);
  if (carbonIngredient.length) {
    attributes.push({ label: 'Carbon footprint ingredient', values: carbonIngredient });
  }

  const carbonValue = pickAllValues(raw.carbon_footprint_fr_foodges_value);
  if (carbonValue.length) {
    attributes.push({ label: 'Carbon footprint (kg CO₂e/kg)', values: carbonValue });
  }

  const otherKeys = ['additives_classes', 'ingredients_processing', 'risk_level'];
  otherKeys.forEach((key) => {
    const value = raw[key];
    if (Array.isArray(value) && value.length) {
      attributes.push({
        label: formatTaxonomyId(key.replace(/_/g, ' ')),
        values: value.map((entry) => formatTaxonomyId(String(entry))),
      });
    }
  });

  const synonyms = flattenMultiValues(raw.synonyms);
  if (synonyms.length) {
    attributes.push({ label: 'Synonyms', values: synonyms });
  }

  const children = raw.children?.map(formatTaxonomyId) ?? [];
  if (children.length) {
    attributes.push({ label: 'Notable sub-ingredients', values: children });
  }

  return attributes;
}

function determineWikipediaTitle(name: string, url?: string): { title: string; url: string } {
  if (url) {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const title = decodeURIComponent(parts[parts.length - 1] ?? name);
      return { title, url };
    } catch {
      // fall back to name
    }
  }
  const slug = name.replace(/\s+/g, '_');
  return { title: slug, url: `https://en.wikipedia.org/wiki/${slug}` };
}

async function fetchWikipediaSummary(
  name: string,
  url?: string
): Promise<{ summary?: string; wikipediaUrl?: string; imageUrl?: string; found: boolean }> {
  const { title, url: resolvedUrl } = determineWikipediaTitle(name, url);
  if (wikipediaSummaryCache.has(title)) {
    const cached = wikipediaSummaryCache.get(title);
    return {
      summary: cached?.summary ?? undefined,
      imageUrl: cached?.imageUrl ?? undefined,
      wikipediaUrl: cached?.found ? resolvedUrl : undefined,
      found: cached?.found ?? false,
    };
  }

  try {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!response.ok) {
      wikipediaSummaryCache.set(title, { summary: null, imageUrl: null, found: false });
      return { wikipediaUrl: undefined, found: false };
    }
    const data = (await response.json()) as {
      extract?: string;
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
    };
    const summary = data.extract?.trim() ?? null;
    const imageUrl = data.originalimage?.source ?? data.thumbnail?.source ?? null;
    wikipediaSummaryCache.set(title, { summary, imageUrl, found: true });
    return {
      summary: summary ?? undefined,
      imageUrl: imageUrl ?? undefined,
      wikipediaUrl: resolvedUrl,
      found: true,
    };
  } catch {
    wikipediaSummaryCache.set(title, { summary: null, imageUrl: null, found: false });
    return { wikipediaUrl: undefined, found: false };
  }
}

async function buildIngredientList(): Promise<IngredientData[]> {
  const dataset = await fetchDataset();
  const candidates = Object.entries(dataset)
    .filter(([key]) => key.startsWith('en:'))
    .map(([key, raw]) => {
      const slug = key.replace(/^en:/, '');
      const displayName = pickPreferredValue(raw.name) ?? formatTaxonomyId(slug);
      const superIngredients = raw.parents?.map(formatTaxonomyId) ?? [];
      const trend = generateSearchTrend(slug);
      const totalSearches = trend.reduce((sum, point) => sum + point.value, 0);
      return {
        slug,
        originalId: key,
        raw,
        displayName,
        superIngredients,
        trend,
        totalSearches,
      };
    })
    .filter((entry) => entry.displayName);

  const sorted = candidates.sort((a, b) => b.totalSearches - a.totalSearches);

  const selected: IngredientData[] = [];

  for (const candidate of sorted) {
    if (selected.length >= TARGET_INGREDIENT_COUNT) {
      break;
    }

    const wiki = await fetchWikipediaSummary(
      candidate.displayName,
      pickPreferredValue(candidate.raw.wikipedia)
    );

    if (!wiki.found || !wiki.imageUrl) {
      continue;
    }

    const metrics = buildMetricsFromTrend(candidate.trend, selected.length + 1);
    const wikidataId = pickPreferredValue(candidate.raw.wikidata);
    const attributes = buildAttributes(candidate.raw);

    selected.push({
      slug: candidate.slug,
      originalId: candidate.originalId,
      displayName: candidate.displayName,
      superIngredients: candidate.superIngredients,
      description: wiki.summary ?? null,
      wikipediaUrl: wiki.wikipediaUrl ?? null,
      wikidataId: wikidataId ?? null,
      imageUrl: wiki.imageUrl ?? null,
      synonyms: flattenMultiValues(candidate.raw.synonyms).filter((synonym) => !synonym.includes('(')),
      search: metrics,
      trend: candidate.trend,
      attributes,
    });
  }

  return selected;
}

export async function getIngredients(): Promise<IngredientData[]> {
  if (!ingredientsCache) {
    ingredientsCache = buildIngredientList();
  }
  return ingredientsCache;
}

export async function getIngredientBySlug(slug: string): Promise<IngredientData | undefined> {
  const ingredients = await getIngredients();
  return ingredients.find((ingredient) => ingredient.slug === slug);
}

export async function getIngredientSlugs(): Promise<string[]> {
  const ingredients = await getIngredients();
  return ingredients.map((ingredient) => ingredient.slug);
}

export async function getComparePairs(): Promise<{ slugA: string; slugB: string }[]> {
  const slugs = await getIngredientSlugs();
  const pairs: { slugA: string; slugB: string }[] = [];
  for (let i = 0; i < slugs.length; i += 1) {
    for (let j = i + 1; j < slugs.length; j += 1) {
      pairs.push({ slugA: slugs[i], slugB: slugs[j] });
    }
  }
  return pairs;
}
