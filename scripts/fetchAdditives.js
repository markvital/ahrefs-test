#!/usr/bin/env node
/**
 * Script to export the complete list of food additives from Open Food Facts.
 *
 * Steps performed:
 * 1. Request the paginated additives facet to collect all additive identifiers (E-numbers).
 * 2. Batch the identifiers and request the additives taxonomy for detailed metadata.
 * 3. Normalise the response into the shape used by the application and persist it to data/additives.json.
 *
 * The script uses the system HTTP(S) proxy when available (needed inside the kata environment).
 * Run with: `node scripts/fetchAdditives.js` or `OPENFOODFACTS_IP=... node scripts/fetchAdditives.js` if you
 * need to override DNS resolution.
 */

const fs = require('fs/promises');
const path = require('path');
const https = require('https');
const { fetch, ProxyAgent } = require('undici');

const LIST_URL = 'https://world.openfoodfacts.org/facets/additives.json';
const TAXONOMY_URL = 'https://world.openfoodfacts.org/api/v2/taxonomy';
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'additives.json');
const BATCH_SIZE = 25;

const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || null;
const ipOverride = process.env.OPENFOODFACTS_IP || null;
const agent = proxyUrl ? new ProxyAgent(proxyUrl) : null;
const fetchOptions = agent ? { dispatcher: agent } : {};

async function main() {
  try {
    const additiveIds = await collectAdditiveIds();
    console.log(`Collected ${additiveIds.length} additive IDs.`);

    const additives = await collectAdditiveDetails(additiveIds);
    console.log(`Normalised ${additives.length} additive records.`);

    await writeAdditives(additives);
    console.log(`Additives saved to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Failed to fetch additives:', error);
    process.exitCode = 1;
  } finally {
    if (agent) {
      await agent.close();
    }
  }
}

async function collectAdditiveIds() {
  const ids = new Set();
  const maxPages = 8;

  for (let page = 1; page <= maxPages; page += 1) {
    console.log(`Fetching additive list page ${page}...`);
    const pageData = await fetchJson(`${LIST_URL}?page=${page}`);
    const tags = Array.isArray(pageData?.tags) ? pageData.tags : [];

    if (tags.length === 0) {
      console.log('No additives on this page, stopping.');
      break;
    }

    for (const tag of tags) {
      if (typeof tag?.id === 'string' && tag.id.startsWith('en:e')) {
        // The "en:e" prefix is used for canonical E-number tags.
        ids.add(tag.id);
      }
    }

    if (tags.length < 100) {
      console.log('Last page reached based on tag count.');
      break;
    }
  }

  return Array.from(ids);
}

async function collectAdditiveDetails(ids) {
  const results = [];
  const missing = [];

  for (let start = 0; start < ids.length; start += BATCH_SIZE) {
    const batch = ids.slice(start, start + BATCH_SIZE);
    console.log(`Fetching details ${start + 1}-${start + batch.length} of ${ids.length}...`);
    const taxonomy = await fetchTaxonomy(batch);

    for (const id of batch) {
      const record = taxonomy[id];
      if (!record) {
        missing.push(id);
        continue;
      }
      results.push(normaliseAdditive(id, record));
    }
  }

  if (missing.length > 0) {
    console.warn(`Missing taxonomy entries for ${missing.length} additives: ${missing.join(', ')}`);
  }

  return results;
}

async function fetchTaxonomy(ids) {
  const params = new URLSearchParams({ tagtype: 'additives', tags: ids.join(',') });
  const url = `${TAXONOMY_URL}?${params.toString()}`;
  const raw = await fetchJson(url);
  return raw && typeof raw === 'object' ? raw : {};
}

async function fetchJson(url) {
  if (!ipOverride) {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`Request failed for ${url} (${response.status} ${response.statusText})`);
    }
    return response.json();
  }

  // Manual HTTPS request when DNS override is provided.
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: ipOverride,
      port: parsed.port || 443,
      path: `${parsed.pathname}${parsed.search}`,
      method: 'GET',
      headers: {
        Host: parsed.hostname,
        'User-Agent': 'additives-fetch-script',
        Accept: 'application/json',
        'Accept-Encoding': 'identity'
      },
      servername: parsed.hostname
    };

    const request = https.request(options, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Request failed for ${url} (${res.statusCode})`));
        res.resume();
        return;
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (parseError) {
          reject(parseError);
        }
      });
    });

    request.on('error', reject);
    request.end();
  });
}

function normaliseAdditive(id, entry) {
  const eNumber = extractENumber(id);
  const title = cleanTitle(pickLocalizedText(entry.name), eNumber);

  return {
    title,
    eNumber,
    synonyms: collectSynonyms(entry.synonyms, eNumber),
    functions: collectFunctions(entry.additives_classes || entry.additives_classes_tags),
    description: pickLocalizedText(entry.wikipedia_abstract) || '',
    wikipedia: pickLocalizedUrl(entry.wikipedia) || pickLocalizedUrl(entry.wikipedia_url) || '',
    wikidata: pickLocalizedText(entry.wikidata) || ''
  };
}

function extractENumber(id) {
  const part = (id || '').split(':').pop() || '';
  const normalized = part.trim();
  if (!normalized) {
    return '';
  }
  const match = normalized.match(/^e?(\d+)([a-z]*)$/i);
  if (match) {
    const digits = match[1];
    const suffix = match[2] ? match[2].toLowerCase() : '';
    return `E${digits}${suffix}`;
  }
  return normalized.toUpperCase();
}

function cleanTitle(rawTitle, eNumber) {
  if (!rawTitle) {
    return '';
  }
  let title = rawTitle.trim();
  if (eNumber) {
    const escaped = escapeRegExp(eNumber);
    const pattern = new RegExp(`^${escaped}\s*[-–—:]\s*`, 'i');
    title = title.replace(pattern, '');
  }
  title = title.replace(/^E\d+[A-Z]*\s*[-–—:]\s*/i, '');
  return title.trim();
}

function collectSynonyms(source, eNumber) {
  const items = new Set();
  if (eNumber) {
    items.add(eNumber);
  }
  if (!source) {
    return Array.from(items);
  }

  if (Array.isArray(source)) {
    source.forEach((value) => addSynonym(items, value));
  } else if (typeof source === 'object') {
    for (const value of Object.values(source)) {
      if (Array.isArray(value)) {
        value.forEach((item) => addSynonym(items, item));
      } else {
        addSynonym(items, value);
      }
    }
  } else {
    addSynonym(items, source);
  }

  return Array.from(items);
}

function addSynonym(set, value) {
  if (!value || typeof value !== 'string') {
    return;
  }
  const trimmed = value.trim();
  if (trimmed) {
    set.add(trimmed);
  }
}

function collectFunctions(source) {
  const list = [];
  if (!source) {
    return list;
  }

  const addValues = (value) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((item) => addValues(item));
    } else if (typeof value === 'string') {
      value
        .split(/[,;]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => {
          list.push(item.replace(/^[a-z]{2,3}:/i, ''));
        });
    } else if (typeof value === 'object') {
      Object.values(value).forEach((entry) => addValues(entry));
    }
  };

  addValues(source);

  return Array.from(new Set(list));
}

function pickLocalizedText(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.find((item) => typeof item === 'string' && item.trim())?.trim() || '';
  }

  if (typeof value === 'object') {
    if (typeof value.en === 'string') {
      return value.en;
    }
    if (Array.isArray(value.en)) {
      return value.en.find((item) => typeof item === 'string' && item.trim())?.trim() || '';
    }
    for (const item of Object.values(value)) {
      if (typeof item === 'string' && item.trim()) {
        return item;
      }
      if (Array.isArray(item)) {
        const candidate = item.find((entry) => typeof entry === 'string' && entry.trim());
        if (candidate) {
          return candidate.trim();
        }
      }
    }
  }

  return '';
}

function pickLocalizedUrl(value) {
  const text = pickLocalizedText(value);
  return typeof text === 'string' ? text : '';
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function writeAdditives(additives) {
  const payload = {
    additives
  };
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  await fs.writeFile(OUTPUT_PATH, json, 'utf8');
}

main();
