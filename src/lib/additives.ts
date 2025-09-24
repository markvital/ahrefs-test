import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { Additive, AdditiveClass, AdditiveClassSummary } from "./types";

const dataDir = path.join(process.cwd(), "data");
const additivesFile = path.join(dataDir, "additives.json");
const classesFile = path.join(dataDir, "additives_classes.json");

type RawLocalizedValue = {
  en?: string | string[];
};

type RawAdditive = {
  name?: RawLocalizedValue;
  synonyms?: RawLocalizedValue | string | string[];
  description?: RawLocalizedValue;
  additives_classes?:
    | RawLocalizedValue
    | string
    | string[]
    | Array<string | RawLocalizedValue>;
  wikidata?: RawLocalizedValue;
};

type RawClass = {
  name?: RawLocalizedValue;
  description?: RawLocalizedValue;
};

type Dataset = {
  additives: Additive[];
  additiveBySlug: Map<string, Additive>;
  classes: AdditiveClass[];
  classBySlug: Map<string, AdditiveClass>;
};

const loadJson = async <T>(filePath: string): Promise<T> => {
  const buffer = await fs.readFile(filePath, "utf8");
  return JSON.parse(buffer) as T;
};

const normalizeWhitespace = (
  value: string | string[] | undefined,
): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return normalizeWhitespace(value[0]);
  }
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : undefined;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const extractDisplayName = (rawName: string): string => {
  const trimmed = rawName.trim();
  const parts = trimmed.split(" - ");
  if (parts.length > 1) {
    const maybeName = parts.slice(1).join(" - ").trim();
    if (maybeName) {
      return maybeName;
    }
  }
  return trimmed;
};

const parseSynonyms = (
  rawSynonyms: RawAdditive["synonyms"],
  displayName: string,
): string[] => {
  const values: string[] = [];

  const consume = (input: unknown) => {
    if (!input) return;
    if (Array.isArray(input)) {
      input.forEach(consume);
      return;
    }
    if (typeof input === "object") {
      const candidate = (input as RawLocalizedValue).en;
      consume(candidate);
      return;
    }
    if (typeof input === "string") {
      input
        .split(/[;,]/)
        .map((segment) => segment.trim())
        .forEach((segment) => {
          if (!segment) {
            return;
          }
          const cleaned = segment.replace(/^en:/i, "").trim();
          if (cleaned && cleaned.toLowerCase() !== displayName.toLowerCase()) {
            values.push(cleaned);
          }
        });
    }
  };

  consume(rawSynonyms);

  return Array.from(new Set(values));
};

const parseClassIds = (
  rawClasses: RawAdditive["additives_classes"],
): string[] => {
  const values: string[] = [];

  const addValue = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(addValue);
      return;
    }
    if (typeof value === "object") {
      const candidate = (value as RawLocalizedValue).en;
      addValue(candidate);
      return;
    }
    if (typeof value === "string") {
      value
        .split(/[;,]/)
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => {
          const normalized = part.startsWith("en:")
            ? part.toLowerCase()
            : `en:${part.toLowerCase()}`;
          values.push(normalized);
        });
    }
  };

  addValue(rawClasses);

  return Array.from(new Set(values));
};

const buildWikipediaUrl = (wikidata: RawAdditive["wikidata"]): string | undefined => {
  const id = typeof wikidata?.en === "string" ? wikidata.en.trim() : undefined;
  if (!id) {
    return undefined;
  }
  return `https://www.wikidata.org/wiki/Special:GoToLinkedPage/enwiki/${id}`;
};

const getDataset = cache(async (): Promise<Dataset> => {
  const [additiveRaw, classRaw] = await Promise.all([
    loadJson<Record<string, RawAdditive>>(additivesFile),
    loadJson<Record<string, RawClass>>(classesFile),
  ]);

  const classSlugCounts = new Map<string, number>();
  const classMap = new Map<string, AdditiveClass>();

  for (const [classId, classValue] of Object.entries(classRaw)) {
    if (!classId.startsWith("en:")) {
      continue;
    }
    const name = normalizeWhitespace(classValue.name?.en);
    if (!name) {
      continue;
    }
    const baseSlug = slugify(name);
    if (!baseSlug) {
      continue;
    }
    const count = classSlugCounts.get(baseSlug) ?? 0;
    classSlugCounts.set(baseSlug, count + 1);
    const slug = count === 0 ? baseSlug : `${baseSlug}-${slugify(classId.replace(/:/g, "-"))}`;

    classMap.set(classId.toLowerCase(), {
      id: classId.toLowerCase(),
      name,
      slug,
      description: normalizeWhitespace(classValue.description?.en) ?? null,
      additives: [],
    });
  }

  const additiveSlugCounts = new Map<string, number>();
  const additives: Additive[] = [];
  const additiveBySlug = new Map<string, Additive>();

  for (const [additiveId, additiveValue] of Object.entries(additiveRaw)) {
    if (!additiveId.startsWith("en:")) {
      continue;
    }
    const rawName = normalizeWhitespace(additiveValue.name?.en);
    if (!rawName) {
      continue;
    }
    const name = extractDisplayName(rawName);
    const slugBase = slugify(name);
    if (!slugBase) {
      continue;
    }
    const slugCount = additiveSlugCounts.get(slugBase) ?? 0;
    additiveSlugCounts.set(slugBase, slugCount + 1);
    const slug =
      slugCount === 0
        ? slugBase
        : `${slugBase}-${slugify(additiveId.split(":").pop() ?? additiveId)}`;

    const codeFragment = additiveId.split(":").pop() ?? additiveId;
    const code = codeFragment ? codeFragment.toUpperCase() : "";

    const classes = parseClassIds(additiveValue.additives_classes)
      .map((classId) => classMap.get(classId))
      .filter((value): value is AdditiveClass => Boolean(value))
      .map<AdditiveClassSummary>(({ id, name, slug }) => ({ id, name, slug }));

    const additive: Additive = {
      id: additiveId,
      code,
      name,
      rawName,
      slug,
      synonyms: parseSynonyms(additiveValue.synonyms, name),
      description: normalizeWhitespace(additiveValue.description?.en) ?? null,
      wikipediaUrl: buildWikipediaUrl(additiveValue.wikidata) ?? null,
      classes,
    };

    additives.push(additive);
    additiveBySlug.set(slug, additive);

    for (const classSummary of classes) {
      const classRecord = classMap.get(classSummary.id);
      if (classRecord) {
        classRecord.additives.push(additive);
      }
    }
  }

  additives.sort((a, b) => a.name.localeCompare(b.name));

  const classes = Array.from(classMap.values())
    .filter((cls) => cls.additives.length > 0)
    .map<AdditiveClass>((cls) => ({
      ...cls,
      additives: cls.additives.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const classBySlug = new Map<string, AdditiveClass>();
  classes.forEach((cls) => {
    classBySlug.set(cls.slug, cls);
  });

  return {
    additives,
    additiveBySlug,
    classes,
    classBySlug,
  };
});

export const getAdditives = async () => (await getDataset()).additives;

export const getAdditiveBySlug = async (slug: string) =>
  (await getDataset()).additiveBySlug.get(slug);

export const getAdditiveClasses = async () => (await getDataset()).classes;

export const getAdditiveClassBySlug = async (slug: string) =>
  (await getDataset()).classBySlug.get(slug);
