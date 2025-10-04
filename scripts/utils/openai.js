const fs = require('fs/promises');
const path = require('path');

const ENV_LOCAL_PATH = path.join(__dirname, '..', '..', 'env.local');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function loadOpenAiApiKey() {
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

module.exports = {
  loadOpenAiApiKey,
};
