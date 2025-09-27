import fs from 'fs';
import path from 'path';

export interface SearchHistoryMetric {
  date: string;
  volume: number;
}

export interface SearchHistoryDataset {
  keyword: string;
  country: string;
  fetchedAt: string;
  metrics: SearchHistoryMetric[];
}

const historyCache = new Map<string, SearchHistoryDataset | null>();

const getHistoryPath = (slug: string): string =>
  path.join(process.cwd(), 'data', 'search-history', `${slug}.json`);

export const getSearchHistory = (slug: string): SearchHistoryDataset | null => {
  if (historyCache.has(slug)) {
    return historyCache.get(slug) ?? null;
  }

  const filePath = getHistoryPath(slug);
  if (!fs.existsSync(filePath)) {
    historyCache.set(slug, null);
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const dataset = JSON.parse(raw) as SearchHistoryDataset;
    historyCache.set(slug, dataset);
    return dataset;
  } catch (error) {
    console.error(`Failed to parse search history for ${slug}:`, error);
    historyCache.set(slug, null);
    return null;
  }
};
