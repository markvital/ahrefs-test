import additivesSource from '../data/additives.json';

export interface RawAdditive {
  title: string;
  eNumber: string;
  synonyms: string[];
  functions: string[];
  description?: string;
  wikipedia?: string;
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

const mapAdditives = (): Additive[] =>
  additivesSource.additives.map((additive) => ({
    ...additive,
    slug: toSlug(additive.title),
  }));

const additiveCache = mapAdditives();

export const getAdditives = (): Additive[] => additiveCache;

export const getAdditiveBySlug = (slug: string): Additive | undefined =>
  additiveCache.find((item) => item.slug === slug);

export const getAdditiveSlugs = (): string[] => additiveCache.map((item) => item.slug);
