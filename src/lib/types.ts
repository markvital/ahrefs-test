export interface AdditiveClassSummary {
  id: string;
  name: string;
  slug: string;
}

export interface Additive {
  id: string;
  code: string;
  name: string;
  rawName: string;
  slug: string;
  synonyms: string[];
  description: string | null;
  wikipediaUrl: string | null;
  classes: AdditiveClassSummary[];
}

export interface AdditiveClass extends AdditiveClassSummary {
  description: string | null;
  additives: Additive[];
}
