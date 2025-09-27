#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const API_BASE_URL = 'https://api.ahrefs.com/v3/keywords-explorer/volume-history';
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'search-history');
const ADDITIVES_PATH = path.join(__dirname, '..', 'data', 'additives.json');

const API_TOKEN =
  process.env.AHREFS_API_KEY ||
  process.env.AHREFS_API_TOKEN ||
  process.env.AHREFS_TOKEN ||
  'ktGhsM5um6O9vQFyYtUTiLd-Vd1MLZah-3etMqHF';

const REQUEST_DELAY_MS = 200;
const MAX_ATTEMPTS = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toSlug = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function fetchHistory(keyword) {
  const baseArgs = [
    '-fsS',
    '-H',
    `Authorization: Bearer ${API_TOKEN}`,
    '--get',
    '--data-urlencode',
    `keyword=${keyword}`,
    '--data-urlencode',
    'country=us',
    API_BASE_URL,
  ];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const { stdout } = await execFileAsync('curl', baseArgs);
      return JSON.parse(stdout);
    } catch (error) {
      const stderr = error.stderr ? error.stderr.toString() : '';
      if (stderr.includes('404')) {
        return null;
      }

      console.error(
        `Failed to fetch history for "${keyword}" (attempt ${attempt}): ${error.message.trim()}`,
      );

      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }

      await sleep(250 * attempt);
    }
  }

  return null;
}

function filterLastTenYears(metrics) {
  if (!Array.isArray(metrics)) {
    return [];
  }

  const now = new Date();
  const startYear = now.getUTCFullYear() - 9;
  const endYear = now.getUTCFullYear();
  const startDate = new Date(Date.UTC(startYear, 0, 1));
  const endDate = new Date(Date.UTC(endYear, 11, 31, 23, 59, 59));

  return metrics
    .map((entry) => ({
      date: entry.date,
      volume: typeof entry.volume === 'number' ? entry.volume : 0,
    }))
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        !Number.isNaN(entryDate.getTime()) &&
        entryDate >= startDate &&
        entryDate <= endDate
      );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function computeYearlyAverage(metrics) {
  if (!metrics.length) {
    return [];
  }

  const now = new Date();
  const startYear = now.getUTCFullYear() - 9;
  const endYear = now.getUTCFullYear();
  const result = [];

  for (let year = startYear; year <= endYear; year += 1) {
    const points = metrics.filter((entry) => new Date(entry.date).getUTCFullYear() === year);
    if (points.length === 0) {
      result.push(null);
      continue;
    }

    const sum = points.reduce((acc, entry) => acc + entry.volume, 0);
    result.push(Math.round(sum / points.length));
  }

  return result;
}

async function main() {
  if (!API_TOKEN) {
    throw new Error('Missing Ahrefs API token. Set AHREFS_API_KEY or related env variable.');
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const raw = await fs.readFile(ADDITIVES_PATH, 'utf8');
  const data = JSON.parse(raw);

  const updatedAdditives = [];

  for (const additive of data.additives) {
    const slug = toSlug(additive.title);
    const historyPath = path.join(OUTPUT_DIR, `${slug}.json`);

    try {
      const payload = await fetchHistory(additive.title);
      await sleep(REQUEST_DELAY_MS);

      if (!payload || !Array.isArray(payload.metrics) || payload.metrics.length === 0) {
        await fs.writeFile(
          historyPath,
          `${JSON.stringify(
            {
              keyword: additive.title,
              country: 'us',
              fetchedAt: new Date().toISOString(),
              metrics: [],
            },
            null,
            2,
          )}\n`,
        );

        updatedAdditives.push({ ...additive, searchSparkline: [] });
        continue;
      }

      const filteredMetrics = filterLastTenYears(payload.metrics);
      const sparkline = computeYearlyAverage(filteredMetrics);

      await fs.writeFile(
        historyPath,
        `${JSON.stringify(
          {
            keyword: additive.title,
            country: 'us',
            fetchedAt: new Date().toISOString(),
            metrics: filteredMetrics,
          },
          null,
          2,
        )}\n`,
      );

      updatedAdditives.push({ ...additive, searchSparkline: sparkline });
    } catch (error) {
      console.error(`Error processing ${additive.title}: ${error.message}`);
      updatedAdditives.push({ ...additive, searchSparkline: [] });
    }
  }

  const output = {
    additives: updatedAdditives,
  };

  await fs.writeFile(ADDITIVES_PATH, `${JSON.stringify(output, null, 2)}\n`);
}

main().catch((error) => {
  console.error('Failed to fetch search history:', error);
  process.exit(1);
});
