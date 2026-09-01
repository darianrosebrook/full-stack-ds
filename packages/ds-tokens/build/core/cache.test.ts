import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  clearCache,
  clearFileCache,
  getCacheStats,
  getChangedFiles,
  getTokenFilesToCheck,
  hasFileChanged,
  updateFileCache,
} from "./cache.js";

const tempDirs: string[] = [];
const trackedFiles: string[] = [];

afterEach(() => {
  clearFileCache(trackedFiles.splice(0));
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function tempFile(content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tokens-cache-"));
  tempDirs.push(dir);
  const file = path.join(dir, "sample.tokens.json");
  fs.writeFileSync(file, content);
  trackedFiles.push(file);
  return file;
}

describe("file change tracking", () => {
  it("considers a never-cached file changed", () => {
    const file = tempFile("{}");
    expect(hasFileChanged(file)).toBe(true);
  });

  it("considers an unchanged cached file not changed", () => {
    const file = tempFile("{}");
    updateFileCache(file);
    expect(hasFileChanged(file)).toBe(false);
  });

  it("detects content changes after caching", () => {
    const file = tempFile("{}");
    updateFileCache(file);
    fs.writeFileSync(file, '{ "x": 1 }');
    expect(hasFileChanged(file)).toBe(true);
  });

  it("filters the changed set and treats missing files as changed", () => {
    const file = tempFile("{}");
    updateFileCache(file);
    const unchanged = tempFile("{}");
    updateFileCache(unchanged);

    const missing = path.join(os.tmpdir(), "definitely-not-here.tokens.json");
    trackedFiles.push(missing);

    const changed = getChangedFiles([file, unchanged, missing]);
    expect(changed).toEqual([missing]);
  });
});

describe("cache maintenance", () => {
  it("removes entries for cleared paths only", () => {
    const a = tempFile("{}");
    const b = tempFile("{}");
    updateFileCache(a);
    updateFileCache(b);

    clearFileCache([a]);

    expect(hasFileChanged(a)).toBe(true);
    expect(hasFileChanged(b)).toBe(false);
  });

  it("reports stats over cached entries", () => {
    const a = tempFile("{}");
    const b = tempFile("{}");
    updateFileCache(a);
    updateFileCache(b);

    const stats = getCacheStats();
    expect(stats.totalFiles).toBeGreaterThanOrEqual(2);
    expect(stats.cachedFiles).toBe(stats.totalFiles);
    expect(stats.oldestEntry).not.toBeNull();
    expect(stats.newestEntry).not.toBeNull();
    expect(stats.oldestEntry!).toBeLessThanOrEqual(stats.newestEntry!);
  });

  it("clears the entire cache and re-primes cleanly", () => {
    const file = tempFile("{}");
    updateFileCache(file);
    clearCache();
    expect(hasFileChanged(file)).toBe(true);

    // Re-prime so later suites observe a functional cache.
    updateFileCache(file);
    expect(hasFileChanged(file)).toBe(false);
  });
});

describe("getTokenFilesToCheck", () => {
  it("walks the real source tree for .tokens.json shards", () => {
    const files = getTokenFilesToCheck();

    expect(files.length).toBeGreaterThan(10);
    for (const file of files) {
      expect(file.endsWith(".tokens.json")).toBe(true);
      expect(fs.existsSync(file)).toBe(true);
    }
    expect(files.some((f) => f.includes("color"))).toBe(true);
  });
});
