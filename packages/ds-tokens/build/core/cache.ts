/**
 * Design Tokens Cache System
 *
 * Provides file hash caching and incremental build support
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PROJECT_ROOT, PATHS } from './index';

const CACHE_DIR = path.join(PROJECT_ROOT, 'packages', 'ds-tokens', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'file-hashes.json');

interface CacheEntry {
  hash: string;
  timestamp: number;
}

interface FileCache {
  [filePath: string]: CacheEntry;
}

/**
 * Ensure cache directory exists
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Calculate file hash
 */
function calculateFileHash(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return '';
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Load cache from disk
 */
function loadCache(): FileCache {
  ensureCacheDir();

  if (!fs.existsSync(CACHE_FILE)) {
    return {};
  }

  try {
    const content = fs.readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(content) as FileCache;
  } catch {
    return {};
  }
}

/**
 * Save cache to disk
 */
function saveCache(cache: FileCache): void {
  ensureCacheDir();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

/**
 * Check if file has changed since last build
 */
export function hasFileChanged(filePath: string): boolean {
  const cache = loadCache();
  const currentHash = calculateFileHash(filePath);
  const cachedEntry = cache[filePath];

  if (!cachedEntry) {
    return true; // New file, consider changed
  }

  return cachedEntry.hash !== currentHash;
}

/**
 * Update cache for a file
 */
export function updateFileCache(filePath: string): void {
  const cache = loadCache();
  const hash = calculateFileHash(filePath);

  cache[filePath] = {
    hash,
    timestamp: Date.now(),
  };

  saveCache(cache);
}

/**
 * Get all files that have changed
 */
export function getChangedFiles(filePaths: string[]): string[] {
  return filePaths.filter((filePath) => {
    if (!fs.existsSync(filePath)) {
      return true; // Missing file, consider changed
    }
    return hasFileChanged(filePath);
  });
}

/**
 * Clear cache for specific files
 */
export function clearFileCache(filePaths: string[]): void {
  const cache = loadCache();
  filePaths.forEach((filePath) => {
    delete cache[filePath];
  });
  saveCache(cache);
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  if (fs.existsSync(CACHE_FILE)) {
    fs.unlinkSync(CACHE_FILE);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalFiles: number;
  cachedFiles: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  const cache = loadCache();
  const timestamps = Object.values(cache).map((entry) => entry.timestamp);

  return {
    totalFiles: Object.keys(cache).length,
    cachedFiles: timestamps.length,
    oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
    newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
  };
}

/**
 * Recursively collect every *.tokens.json shard under PATHS.srcDir.
 *
 * Our source-of-truth layout is `src/<category>/{core,semantic}/<subtree>.tokens.json`
 * (plus `src/brands/*.tokens.json` and `src/density/*.tokens.json`). The portfolio
 * predecessor of this function probed two fixed roots (`ui/designTokens/{core,semantic}`)
 * with monolithic-file fallbacks; that whole shape doesn't apply here, so we walk
 * the actual shard tree.
 */
export function getTokenFilesToCheck(): string[] {
  if (!fs.existsSync(PATHS.srcDir)) return [];

  const files: string[] = [];
  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.tokens.json') &&
        !entry.name.startsWith('_')
      ) {
        files.push(full);
      }
    }
  }
  walk(PATHS.srcDir);
  return files;
}
