#!/usr/bin/env node

const { execFile } = require('child_process');
const { promisify } = require('util');
const { loadOpenAiApiKey } = require('./utils/openai');

const execFileAsync = promisify(execFile);

const DEFAULT_MODEL = process.env.OPENAI_TEST_MODEL || 'gpt-5.0';
const DEFAULT_BASE_URL = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';

function parseArgs(argv) {
  const result = { model: DEFAULT_MODEL };
  for (const arg of argv) {
    if (arg.startsWith('--model=')) {
      const value = arg.slice('--model='.length).trim();
      if (value) {
        result.model = value;
      }
    }
  }
  return result;
}

async function runCurl({ method, url, headers = [], data }) {
  const args = ['-sS', '-w', '\nHTTP_STATUS:%{http_code}'];
  if (method) {
    args.push('-X', method);
  }
  headers.forEach((header) => {
    args.push('-H', header);
  });
  if (data) {
    args.push('--data', data);
  }
  args.push(url);

  let stdout;
  try {
    ({ stdout } = await execFileAsync('curl', args));
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString().trim() : error.message;
    throw new Error(`curl request failed: ${stderr}`);
  }

  const marker = '\nHTTP_STATUS:';
  const markerIndex = stdout.lastIndexOf(marker);
  if (markerIndex === -1) {
    throw new Error('Unable to parse curl response status.');
  }

  const body = stdout.slice(0, markerIndex).trim();
  const statusCodeString = stdout.slice(markerIndex + marker.length).trim();
  const status = Number.parseInt(statusCodeString, 10);

  return { status, body };
}

function printDivider() {
  console.log(''.padEnd(60, '-'));
}

function logBodySnippet(body) {
  if (!body) {
    console.log('Body: <empty>');
    return;
  }
  const snippet = body.length > 400 ? `${body.slice(0, 400)}…` : body;
  console.log(`Body: ${snippet}`);
}

async function main() {
  try {
    const apiKey = await loadOpenAiApiKey();
    const { model } = parseArgs(process.argv.slice(2));
    const baseUrl = DEFAULT_BASE_URL.replace(/\/$/, '');

    console.log(`OpenAI API base: ${baseUrl}`);
    console.log(`Testing with model: ${model}`);
    printDivider();

    const modelsUrl = `${baseUrl}/models`;
    console.log(`GET ${modelsUrl}`);
    const modelsResult = await runCurl({
      method: 'GET',
      url: modelsUrl,
      headers: [`Authorization: Bearer ${apiKey}`],
    });
    console.log(`Status: ${modelsResult.status}`);
    if (modelsResult.status === 200) {
      try {
        const parsed = JSON.parse(modelsResult.body);
        if (Array.isArray(parsed?.data)) {
          const preview = parsed.data.slice(0, 5).map((entry) => entry.id);
          console.log(`Models returned (first ${preview.length}): ${preview.join(', ')}`);
        } else {
          logBodySnippet(modelsResult.body);
        }
      } catch (error) {
        logBodySnippet(modelsResult.body);
      }
    } else {
      logBodySnippet(modelsResult.body);
    }

    printDivider();

    const chatUrl = `${baseUrl}/chat/completions`;
    console.log(`POST ${chatUrl}`);
    const chatPayload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a friendly assistant that replies with brief greetings.' },
        { role: 'user', content: 'Say hello in one short sentence.' },
      ],
      max_tokens: 30,
    });
    const chatResult = await runCurl({
      method: 'POST',
      url: chatUrl,
      headers: [
        `Authorization: Bearer ${apiKey}`,
        'Content-Type: application/json',
      ],
      data: chatPayload,
    });
    console.log(`Status: ${chatResult.status}`);
    if (chatResult.status === 200) {
      try {
        const parsed = JSON.parse(chatResult.body);
        const message = parsed?.choices?.[0]?.message?.content;
        console.log(`Response: ${message || '<no message content>'}`);
      } catch (error) {
        logBodySnippet(chatResult.body);
      }
    } else {
      logBodySnippet(chatResult.body);
      if (chatResult.status === 403 && /method forbidden/i.test(chatResult.body)) {
        console.log('Received HTTP 403 "Method forbidden". This often indicates a network proxy blocking POST requests.');
      }
    }

    printDivider();
    console.log('Test completed.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
