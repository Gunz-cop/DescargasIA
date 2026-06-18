import fs from 'fs/promises';
import path from 'path';

// Helper to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple .env file parser to avoid external dependencies
async function loadDotEnv() {
  try {
    const dotenvPath = path.resolve('.env');
    const content = await fs.readFile(dotenvPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        // Remove surrounding quotes if they exist
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    // Ignore error if file doesn't exist
  }
}

async function main() {
  await loadDotEnv();

  const enabled = process.env.LINKZIP_ENABLED === 'true';
  const apiKey = process.env.LINKZIP_API_KEY;
  const apiUrl = process.env.LINKZIP_API_URL || 'https://linkzip.uk/api/v1/links';
  const delayMs = parseInt(process.env.LINKZIP_DELAY_MS || '1500', 10);

  console.log(`[LinkZip] Configuration loaded:`);
  console.log(`  Enabled: ${enabled}`);
  console.log(`  API URL: ${apiUrl}`);
  console.log(`  Delay: ${delayMs}ms`);

  // Load existing cache
  const cachePath = path.resolve('src/linkzip-cache.json');
  let cache = {};
  try {
    const cacheContent = await fs.readFile(cachePath, 'utf8');
    cache = JSON.parse(cacheContent);
  } catch (err) {
    console.log('[LinkZip] Cache file not found or invalid, initializing empty cache.');
  }

  // Scan all tool json files
  const toolsDir = path.resolve('src/content/tools');
  let toolFiles = [];
  try {
    toolFiles = await fs.readdir(toolsDir);
  } catch (err) {
    console.error(`[LinkZip] Error reading tools directory: ${err.message}`);
    // Do not break the build
    return;
  }

  const platformMap = {
    web: { label: 'Web', cat: 'Web' },
    windows: { label: 'Windows', cat: 'Windows' },
    mac: { label: 'macOS', cat: 'macOS' },
    linux: { label: 'Linux', cat: 'Linux' },
    android: { label: 'Android', cat: 'Android' },
    ios: { label: 'iOS', cat: 'iOS' }
  };

  const urlsToShorten = new Map();

  for (const file of toolFiles) {
    if (!file.endsWith('.json')) continue;
    try {
      const content = await fs.readFile(path.join(toolsDir, file), 'utf8');
      const tool = JSON.parse(content);
      const name = tool.name;

      if (tool.officialWebsite) {
        urlsToShorten.set(tool.officialWebsite, {
          title: `${name} - Web`,
          category: 'DescargasIA - General'
        });
      }

      if (tool.platforms) {
        for (const [platKey, details] of Object.entries(tool.platforms)) {
          if (details && details.url) {
            const mapped = platformMap[platKey] || { label: platKey, cat: 'General' };
            urlsToShorten.set(details.url, {
              title: `${name} - ${mapped.label}`,
              category: `DescargasIA - ${mapped.cat}`
            });
          }
        }
      }
    } catch (err) {
      console.error(`[LinkZip] Error reading tool file ${file}: ${err.message}`);
    }
  }

  console.log(`[LinkZip] Found ${urlsToShorten.size} unique official/platform links to check.`);

  // Determine if dry run mode
  let isDryRun = !enabled;
  if (enabled && !apiKey) {
    console.warn('[LinkZip] WARNING: LINKZIP_ENABLED is true but LINKZIP_API_KEY is not defined. Proceeding in dry-run mode.');
    isDryRun = true;
  }

  // Process unique URLs
  for (const [longUrl, info] of urlsToShorten.entries()) {
    // If already cached, skip
    if (cache[longUrl]) {
      continue;
    }

    if (isDryRun) {
      console.log(`[LinkZip] [DRY RUN] Would shorten: ${longUrl} -> Title: "${info.title}", Category: "${info.category}"`);
      continue;
    }

    console.log(`[LinkZip] Shortening: ${longUrl} -> Title: "${info.title}", Category: "${info.category}"`);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          longUrl,
          title: info.title,
          category: info.category
        })
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(`[LinkZip] API error for URL ${longUrl}: Status ${response.status} - ${responseData.error || 'Unknown Error'}`);
        // Continue loop without breaking the build
        continue;
      }

      if (responseData.shortUrl) {
        cache[longUrl] = responseData.shortUrl;
        // Save cache incrementally
        await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf8');
        console.log(`[LinkZip] Shortened successfully: ${responseData.shortUrl}`);
      } else {
        console.warn(`[LinkZip] Warning: Response did not include shortUrl for ${longUrl}`);
      }

      // Rate limiting delay
      await delay(delayMs);
    } catch (err) {
      console.error(`[LinkZip] Network or internal error when contacting API for URL ${longUrl}: ${err.message}`);
      // Continue loop without breaking the build
    }
  }

  console.log('[LinkZip] Processing completed.');
}

main().catch((err) => {
  console.error('[LinkZip] Fatal error in shorten script:', err);
});
