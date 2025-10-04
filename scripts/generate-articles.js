#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const readline = require('readline/promises');
const dns = require('dns');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { stdin, stdout } = require('process');

const OpenAI = require('openai');

const { createAdditiveSlug } = require('./utils/slug');

const execFileAsync = promisify(execFile);

dns.setDefaultResultOrder('ipv4first');

const DEFAULT_LIMIT = 10;
const DEFAULT_BATCH_SIZE = 10;
const OPENAI_MODEL = 'gpt-5';
const PROMPT_PATH = path.join(__dirname, 'prompts', 'additive-article.txt');
const DATA_DIR = path.join(__dirname, '..', 'data');
const ADDITIVES_INDEX_PATH = path.join(DATA_DIR, 'additives.json');
const ENV_LOCAL_PATH = path.join(__dirname, '..', 'env.local');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function loadApiKey() {
  const fromEnv = process.env.OPENAI_API_KEY;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv.trim();
  }

  if (await fileExists(ENV_LOCAL_PATH)) {
    const raw = await fs.readFile(ENV_LOCAL_PATH, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.+)\s*$/);
      if (match) {
        const value = match[1].trim().replace(/^['"]|['"]$/g, '');
        if (value) {
          return value;
        }
      }
    }
  }

  throw new Error('OPENAI_API_KEY not found in environment or env.local.');
}

async function promptForNumber(question, defaultValue, rl) {
  if (!rl) {
    console.log(`${question} ${defaultValue} (default)`);
    return defaultValue;
  }

  const answer = (await rl.question(`${question} (default ${defaultValue}): `)).trim();
  if (!answer) {
    return defaultValue;
  }

  const parsed = Number.parseInt(answer, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    console.log(`Invalid input. Using default ${defaultValue}.`);
    return defaultValue;
  }

  return parsed;
}

async function readPromptTemplate() {
  return fs.readFile(PROMPT_PATH, 'utf8');
}

async function readAdditivesIndex() {
  const data = await readJson(ADDITIVES_INDEX_PATH);
  if (!data || !Array.isArray(data.additives)) {
    throw new Error('Unexpected additives index format.');
  }

  return data.additives.map((entry) => ({
    title: typeof entry.title === 'string' ? entry.title : '',
    eNumber: typeof entry.eNumber === 'string' ? entry.eNumber : '',
    slug: createAdditiveSlug({ eNumber: entry.eNumber, title: entry.title }),
  }));
}

async function readAdditiveProps(slug) {
  const propsPath = path.join(DATA_DIR, slug, 'props.json');
  if (!(await fileExists(propsPath))) {
    return {};
  }

  try {
    return await readJson(propsPath);
  } catch (error) {
    console.warn(`Failed to read props for ${slug}: ${error.message}`);
    return {};
  }
}

async function writeAdditiveProps(slug, props) {
  const targetDir = path.join(DATA_DIR, slug);
  await fs.mkdir(targetDir, { recursive: true });
  const propsPath = path.join(targetDir, 'props.json');
  const next = { ...props };
  await fs.writeFile(propsPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

function ensureProps(props, additive) {
  const result = props && typeof props === 'object' ? { ...props } : {};
  if (typeof result.title !== 'string' || !result.title) {
    result.title = additive.title || '';
  }
  if (typeof result.eNumber !== 'string' || !result.eNumber) {
    result.eNumber = additive.eNumber || '';
  }
  if (!Array.isArray(result.synonyms)) {
    result.synonyms = [];
  }
  if (!Array.isArray(result.functions)) {
    result.functions = [];
  }
  if (typeof result.description !== 'string') {
    result.description = '';
  }
  if (typeof result.wikipedia !== 'string') {
    result.wikipedia = '';
  }
  if (typeof result.wikidata !== 'string') {
    result.wikidata = '';
  }
  if (typeof result.searchVolume !== 'number') {
    result.searchVolume = null;
  }
  if (typeof result.searchRank !== 'number') {
    result.searchRank = null;
  }
  if (!Array.isArray(result.searchSparkline)) {
    result.searchSparkline = [];
  }

  return result;
}

async function fetchPubChemUrl(wikidataId) {
  if (!wikidataId || typeof wikidataId !== 'string') {
    return null;
  }

  const trimmedId = wikidataId.trim();
  if (!trimmedId) {
    return null;
  }

  const endpoint = `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(trimmedId)}.json`;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { stdout } = await execFileAsync('curl', [
        '-fsS',
        '-H',
        'User-Agent: additives-article-script/1.0',
        endpoint,
      ]);

      const data = JSON.parse(stdout);
      const entity = data?.entities?.[trimmedId];
      const claims = entity?.claims?.P662;
      if (!Array.isArray(claims) || claims.length === 0) {
        return null;
      }

      const mainsnak = claims[0]?.mainsnak;
      const value = mainsnak?.datavalue?.value;
      if (typeof value === 'string' && value.trim()) {
        return `https://pubchem.ncbi.nlm.nih.gov/compound/${value.trim()}`;
      }

      return null;
    } catch (error) {
      if (attempt === 3) {
        console.warn(`Failed to fetch PubChem ID for ${wikidataId}: ${error.message}`);
        return null;
      }
      await sleep(200 * attempt);
    }
  }

  return null;
}

function buildFaqQuestions(eNumber, title) {
  const name = title && title.trim() ? title.trim() : 'this additive';
  const code = eNumber && eNumber.trim() ? eNumber.trim() : 'this additive';
  return [
    `What is ${code} — ${name} used for in foods?`,
    `Is ${code} safe to eat regularly?`,
    `Which grocery products usually include ${name}?`,
    `Does ${name} cause any side effects or allergies?`,
    `What are simple alternatives to ${name} for home cooking?`,
  ];
}

function buildFdcLink(eNumber, title) {
  const baseLabelName = title && title.trim() ? title.trim() : eNumber;
  const label = baseLabelName ? `${baseLabelName} on FoodData Central` : 'FoodData Central listing';
  const query = baseLabelName ? baseLabelName : eNumber;
  const url = query
    ? `https://fdc.nal.usda.gov/fdc-app.html#/food-search?query=${encodeURIComponent(query)}`
    : 'https://fdc.nal.usda.gov/fdc-app.html#/';
  return { label, url };
}

function normaliseSynonyms(synonyms) {
  if (!Array.isArray(synonyms)) {
    return [];
  }

  return synonyms
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item, index, list) => item.length > 0 && list.indexOf(item) === index);
}

function normaliseFunctions(functions) {
  if (!Array.isArray(functions)) {
    return [];
  }

  return functions
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item, index, list) => item.length > 0 && list.indexOf(item) === index);
}

async function callOpenAi(client, systemPrompt, payload) {
  const additiveLabel = [payload.eNumber, payload.title].filter(Boolean).join(' — ') || 'the additive';

  try {
    const response = await client.responses.create({
      model: OPENAI_MODEL,
      reasoning: { effort: 'high' },
      temperature: 0.4,
      max_output_tokens: 1800,
      input: [
        {
          role: 'system',
          content: [{ type: 'text', text: systemPrompt }],
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: [
                `Create a Markdown article and short textual summary about ${additiveLabel}.`,
                'Respect all layout, linking, and validation requirements in the system prompt.',
                'Use the PubChem URL exactly as provided. Do not fabricate URLs.',
                'Return a JSON object with keys `article_markdown` and `article_summary`. No additional text.',
                '',
                `Additive metadata:\n${JSON.stringify(payload, null, 2)}`,
              ].join('\n'),
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'additive_article',
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['article_markdown', 'article_summary'],
            properties: {
              article_markdown: { type: 'string' },
              article_summary: { type: 'string' },
            },
          },
        },
      },
    });

    let parsed = response.output_parsed;

    if (!parsed && response.output_text) {
      try {
        parsed = JSON.parse(response.output_text);
      } catch (parseError) {
        throw new Error(`Unable to parse OpenAI response JSON: ${parseError.message}`);
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('OpenAI API returned an empty response.');
    }

    const { article_markdown: articleMarkdown, article_summary: articleSummary } = parsed;
    if (typeof articleMarkdown !== 'string' || typeof articleSummary !== 'string') {
      throw new Error('OpenAI response JSON must include string keys `article_markdown` and `article_summary`.');
    }

    return { articleMarkdown, articleSummary };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const details = error.error?.message || error.message;
      throw new Error(`OpenAI API request failed (status ${error.status ?? 'unknown'}): ${details}`);
    }

    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(error.message);
    }

    throw error;
  }
}

async function processAdditive({
  additive,
  props,
  promptTemplate,
  apiClient,
  index,
  total,
}) {
  const relativeSlugDir = path.join('data', additive.slug);
  const articlePath = path.join(DATA_DIR, additive.slug, 'article.md');
  console.log(`[${index + 1}/${total}] Generating article for ${additive.eNumber || additive.title || additive.slug}...`);

  const synonyms = normaliseSynonyms(props.synonyms);
  const functions = normaliseFunctions(props.functions);
  const pubchemUrl = await fetchPubChemUrl(props.wikidata);
  const faqQuestions = buildFaqQuestions(additive.eNumber, additive.title);
  const fdcLink = buildFdcLink(additive.eNumber, additive.title);
  const metadataPayload = {
    title: additive.title,
    eNumber: additive.eNumber,
    synonyms,
    functions,
    wikipedia: typeof props.wikipedia === 'string' ? props.wikipedia : '',
    wikidata: typeof props.wikidata === 'string' ? props.wikidata : '',
    searchVolume: typeof props.searchVolume === 'number' ? props.searchVolume : null,
    searchRank: typeof props.searchRank === 'number' ? props.searchRank : null,
    pubchemUrl: pubchemUrl || 'URL to be added by editor',
    fdc: fdcLink,
    faqQuestions,
  };

  const { articleMarkdown, articleSummary } = await callOpenAi(apiClient, promptTemplate, metadataPayload);

  await fs.mkdir(path.join(DATA_DIR, additive.slug), { recursive: true });
  await fs.writeFile(articlePath, `${articleMarkdown.trim()}\n`, 'utf8');

  const updatedProps = ensureProps(props, additive);
  updatedProps.description = articleSummary.trim();
  await writeAdditiveProps(additive.slug, updatedProps);

  console.log(
    `[${index + 1}/${total}] Saved article to ${path.join(relativeSlugDir, 'article.md')} and updated props description.`,
  );
}

async function run() {
  try {
    const apiKey = await loadApiKey();
    const apiClient = new OpenAI({ apiKey });
    const promptTemplate = await readPromptTemplate();
    const additives = await readAdditivesIndex();

    const rl = stdin.isTTY && stdout.isTTY
      ? readline.createInterface({ input: stdin, output: stdout })
      : null;

    try {
      const limit = await promptForNumber('How many new articles should be generated?', DEFAULT_LIMIT, rl);
      const batchSize = await promptForNumber('How many articles should be generated in parallel?', DEFAULT_BATCH_SIZE, rl);

      if (rl) {
        rl.close();
      }

      const candidates = [];
      for (const additive of additives) {
        const articlePath = path.join(DATA_DIR, additive.slug, 'article.md');
        if (await fileExists(articlePath)) {
          continue;
        }
        candidates.push(additive);
        if (candidates.length >= limit) {
          break;
        }
      }

      if (candidates.length === 0) {
        console.log('No additives require new articles. Exiting.');
        return;
      }

      console.log(
        `Preparing to generate ${candidates.length} article(s) with batch size ${Math.min(batchSize, candidates.length)}...`,
      );

      let currentIndex = 0;
      const total = candidates.length;
      const errors = [];

      const workers = Array.from({ length: Math.min(batchSize, candidates.length) }, async () => {
        while (currentIndex < candidates.length) {
          const localIndex = currentIndex;
          currentIndex += 1;
          const additive = candidates[localIndex];
          const props = await readAdditiveProps(additive.slug);

          try {
            await processAdditive({
              additive,
              props,
              promptTemplate,
              apiClient,
              index: localIndex,
              total,
            });
          } catch (error) {
            console.error(
              `[${localIndex + 1}/${total}] Failed to generate article for ${additive.slug}: ${error.message}`,
            );
            errors.push({ slug: additive.slug, error });
          }
        }
      });

      await Promise.all(workers);

      if (errors.length) {
        console.log('Completed with errors for the following additives:');
        errors.forEach((entry) => {
          console.log(` - ${entry.slug}: ${entry.error.message}`);
        });
        process.exitCode = 1;
      } else {
        console.log('All requested articles generated successfully.');
      }
    } finally {
      if (rl && !rl.closed) {
        rl.close();
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

run();
