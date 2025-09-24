import fs from 'fs';
import path from 'path';
import { Additive, AdditiveClass } from './types';
import { createSlug } from './slug';

const dataDirectory = path.join(process.cwd(), 'data');
const additivesFile = path.join(dataDirectory, 'additives.json');
const additiveClassesFile = path.join(dataDirectory, 'additives_classes.json');

let additiveCache: Additive[] | null = null;
let additiveSlugMap: Map<string, Additive> | null = null;
let classCache: AdditiveClass[] | null = null;
let classSlugMap: Map<string, AdditiveClass> | null = null;
let classIdMap: Map<string, AdditiveClass> | null = null;

const fallbackNameLanguages = ['en', 'xx', 'fr', 'es', 'de', 'it'];

function readJson(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as Record<string, any>;
}

function makeUniqueSlug(baseSlug: string, usageMap: Map<string, number>): string {
  const sanitized = baseSlug || 'item';
  const existingCount = usageMap.get(sanitized);
  if (existingCount === undefined) {
    usageMap.set(sanitized, 1);
    return sanitized;
  }

  const nextSlug = `${sanitized}-${existingCount + 1}`;
  usageMap.set(sanitized, existingCount + 1);
  return makeUniqueSlug(nextSlug, usageMap);
}

function resolveName(nameRecord: Record<string, string> | undefined, fallbackId: string): string {
  if (!nameRecord) {
    return fallbackId;
  }

  for (const lang of fallbackNameLanguages) {
    if (nameRecord[lang]) {
      return nameRecord[lang];
    }
  }

  const firstEntry = Object.values(nameRecord)[0];
  if (firstEntry) {
    return firstEntry;
  }

  return fallbackId;
}

function parseAdditiveClasses(): AdditiveClass[] {
  const rawClasses = readJson(additiveClassesFile);
  const slugUsage = new Map<string, number>();
  const classes: AdditiveClass[] = [];

  for (const [id, value] of Object.entries(rawClasses)) {
    const rawNameRecord = (value as any).name as Record<string, string> | undefined;
    const fallbackName = resolveName(rawNameRecord, id.replace(/^en:/, ''));
    const name = fallbackName.trim();

    const rawSlugSource = name || id;
    let slug = createSlug(rawSlugSource);
    if (!slug) {
      slug = createSlug(id.replace(/^en:/, ''));
    }
    slug = slug || id.replace(/[:\s]+/g, '-');
    slug = makeUniqueSlug(slug, slugUsage);

    const descriptionRecord = (value as any).description as Record<string, string> | undefined;
    const description = descriptionRecord?.en ?? null;

    classes.push({
      id,
      slug,
      name,
      description,
    });
  }

  classes.sort((a, b) => a.name.localeCompare(b.name));
  return classes;
}

function extractSynonyms(
  englishNameRaw: string | undefined,
  resolvedName: string,
  code: string | null,
): string[] {
  const synonyms = new Set<string>();

  if (englishNameRaw) {
    const hyphenParts = englishNameRaw.split(' - ').map((part) => part.trim()).filter(Boolean);
    hyphenParts.forEach((part) => synonyms.add(part));

    englishNameRaw
      .split(/[;,/]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => synonyms.add(part));
  }

  if (code) {
    synonyms.add(code.toUpperCase());
  }

  synonyms.delete(resolvedName);

  return Array.from(synonyms)
    .filter((item) => item && item.toLowerCase() !== resolvedName.toLowerCase())
    .slice(0, 6);
}

function parseAdditives(): Additive[] {
  const rawAdditives = readJson(additivesFile);
  const slugUsage = new Map<string, number>();
  const additives: Additive[] = [];

  for (const [id, value] of Object.entries(rawAdditives)) {
    const nameRecord = (value as any).name as Record<string, string> | undefined;
    const englishNameRaw = nameRecord?.en;
    let resolvedName = resolveName(nameRecord, id.replace(/^en:/, ''));
    resolvedName = resolvedName.trim();

    let code: string | null = null;
    if (englishNameRaw && englishNameRaw.includes(' - ')) {
      const parts = englishNameRaw.split(' - ').map((part) => part.trim()).filter(Boolean);
      if (parts.length > 1) {
        const potentialCode = parts[0];
        if (/^e\d+/i.test(potentialCode)) {
          code = potentialCode.toUpperCase();
        }
        const trailingName = parts.slice(1).join(' - ').trim();
        if (trailingName) {
          resolvedName = trailingName;
        }
      }
    }

    if (!code) {
      const eNumber = (value as any).e_number?.en || (value as any).e_number;
      if (eNumber) {
        const clean = String(eNumber).replace(/^e/i, '').trim();
        if (clean) {
          code = `E${clean.toUpperCase()}`;
        }
      }
    }

    if (!resolvedName) {
      resolvedName = id.replace(/^en:/, '').replace(/-/g, ' ').trim();
    }

    const synonyms = extractSynonyms(englishNameRaw, resolvedName, code);

    const descriptionRecord = (value as any).description as Record<string, string> | undefined;
    const description = descriptionRecord?.en ?? null;

    const classesField = (value as any).additives_classes as Record<string, string | string[]> | undefined;
    const classIds: string[] = [];
    const englishClasses = classesField?.en;
    if (Array.isArray(englishClasses)) {
      englishClasses
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => classIds.push(item));
    } else if (typeof englishClasses === 'string') {
      englishClasses
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => classIds.push(item));
    }

    const slugSource = resolvedName || englishNameRaw || code || id;
    let slug = createSlug(slugSource);
    if (!slug) {
      slug = createSlug(id.replace(/^en:/, ''));
    }
    slug = slug || id.replace(/[:\s]+/g, '-');
    slug = makeUniqueSlug(slug, slugUsage);

    const wikipediaUrl = resolvedName
      ? encodeURI(`https://en.wikipedia.org/wiki/${resolvedName.replace(/\s+/g, '_')}`)
      : null;

    additives.push({
      id,
      slug,
      code,
      name: resolvedName,
      synonyms,
      description,
      wikipediaUrl,
      classIds,
    });
  }

  additives.sort((a, b) => a.name.localeCompare(b.name));
  return additives;
}

export function getAdditiveClasses(): AdditiveClass[] {
  if (!classCache) {
    classCache = parseAdditiveClasses();
    classSlugMap = new Map(classCache.map((entry) => [entry.slug, entry]));
    classIdMap = new Map(classCache.map((entry) => [entry.id, entry]));
  }

  return classCache;
}

export function getAdditiveClassBySlug(slug: string): AdditiveClass | undefined {
  if (!classCache || !classSlugMap) {
    getAdditiveClasses();
  }
  return classSlugMap?.get(slug);
}

export function getAdditiveClassById(id: string): AdditiveClass | undefined {
  if (!classCache || !classIdMap) {
    getAdditiveClasses();
  }
  return classIdMap?.get(id);
}

export function getAdditives(): Additive[] {
  if (!additiveCache) {
    additiveCache = parseAdditives();
    additiveSlugMap = new Map(additiveCache.map((entry) => [entry.slug, entry]));
  }

  return additiveCache;
}

export function getAdditiveBySlug(slug: string): Additive | undefined {
  if (!additiveCache || !additiveSlugMap) {
    getAdditives();
  }
  return additiveSlugMap?.get(slug);
}

export function getAdditivesByClassId(classId: string): Additive[] {
  return getAdditives().filter((additive) => additive.classIds.includes(classId));
}
