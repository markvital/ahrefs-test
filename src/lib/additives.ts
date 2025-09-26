import additivesData from "../../data/additives.json";

import { Additive } from "@/types/additive";
import { slugify } from "./slugify";

type RawAdditive = {
  title: string;
  eNumber: string;
  synonyms?: string[];
  functions?: string[];
  description?: string;
  wikipedia: string;
  wikidata?: string;
};

type AdditivesFile = {
  additives: RawAdditive[];
};

const rawAdditives = (additivesData as AdditivesFile).additives ?? [];

const normalizedAdditives: Additive[] = rawAdditives.map((item) => ({
  title: item.title,
  eNumber: item.eNumber,
  synonyms: Array.from(
    new Set((item.synonyms ?? []).map((synonym) => synonym.trim()).filter(Boolean)),
  ),
  functions: Array.from(
    new Set((item.functions ?? []).map((fn) => fn.trim()).filter(Boolean)),
  ),
  description: item.description,
  wikipedia: item.wikipedia,
  wikidata: item.wikidata,
  slug: slugify(item.title),
}));

function cloneAdditive(additive: Additive): Additive {
  return {
    ...additive,
    synonyms: [...additive.synonyms],
    functions: [...additive.functions],
  };
}

export function getAdditives(): Additive[] {
  return normalizedAdditives.map(cloneAdditive);
}

export function getAdditiveBySlug(slug: string): Additive | undefined {
  const additive = normalizedAdditives.find((item) => item.slug === slug);
  return additive ? cloneAdditive(additive) : undefined;
}

export function getAdditiveSlugs(): string[] {
  return normalizedAdditives.map((item) => item.slug);
}
