import additivesSource from '../data/additives.json';

export interface RawAdditive {
  title: string;
  eNumber: string;
  synonyms: string[];
  functions: string[];
  description?: string;
  wikipedia?: string;
  searchVolume?: number | null;
  searchRank?: number | null;
}

export interface Additive extends RawAdditive {
  slug: string;
}

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const mapAdditives = (): Additive[] => {
  const enriched = additivesSource.additives.map((additive) => ({
    ...additive,
    searchVolume:
      typeof additive.searchVolume === 'number' && Number.isFinite(additive.searchVolume)
        ? additive.searchVolume
        : null,
    searchRank:
      typeof additive.searchRank === 'number' && Number.isFinite(additive.searchRank)
        ? additive.searchRank
        : null,
    slug: toSlug(additive.title),
  }));

  enriched.sort((a, b) => {
    const aHasRank = typeof a.searchRank === 'number';
    const bHasRank = typeof b.searchRank === 'number';

    if (aHasRank && bHasRank) {
      if (a.searchRank === b.searchRank) {
        return a.title.localeCompare(b.title);
      }
      return (a.searchRank ?? 0) - (b.searchRank ?? 0);
    }

    if (aHasRank) {
      return -1;
    }

    if (bHasRank) {
      return 1;
    }

    return a.title.localeCompare(b.title);
  });

  return enriched;
};

const additiveCache = mapAdditives();

export const getAdditives = (): Additive[] => additiveCache;

export const getAdditiveBySlug = (slug: string): Additive | undefined =>
  additiveCache.find((item) => item.slug === slug);

export const getAdditiveSlugs = (): string[] => additiveCache.map((item) => item.slug);
