export interface Additive {
  id: string;
  slug: string;
  code: string | null;
  name: string;
  synonyms: string[];
  description: string | null;
  wikipediaUrl: string | null;
  classIds: string[];
}

export interface AdditiveClass {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export type AdditiveClassMap = Record<string, AdditiveClass>;
