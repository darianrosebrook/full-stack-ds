/**
 * @full-stack-ds/react PUBLISHED consumption contract.
 *
 * Why this exists (SHOWCASE-CONSUMPTION-01):
 * The showcase app aliases `@full-stack-ds/react` -> `packages/ds-react/src/index.ts`
 * at dev time (see vite.config.ts / vitest.config.ts). That alias is a DX
 * convenience, but it means nothing in the app ever exercises the path a real
 * downstream consumer takes: the *built* package — its `exports` map, its
 * bundled `dist` entrypoints, and the aggregate `./styles.css` that a consumer
 * must import separately. A broken tsup build, a wrong `exports` entry, or a
 * failed CSS aggregation would ship undetected because the showcase reads source.
 *
 * This test closes that gap. It builds the package the way it is published, then
 * asserts the contract against the *dist* artifacts — deliberately importing by
 * resolved file path, NOT by package name, so the source alias cannot hijack it.
 *
 * Covers acceptance A1 (exports map resolves), A2 (built entrypoint exports the
 * component surface), A3 (styles.css carries component selectors).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", ".."); // src/consumption -> repo root
const PKG_DIR = resolve(REPO_ROOT, "packages", "ds-react");
const PKG_JSON = resolve(PKG_DIR, "package.json");

/** Collect every "./…"-relative string leaf in a (possibly nested) exports map. */
function collectExportTargets(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") {
    if (node.startsWith("./")) out.push(node);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node as Record<string, unknown>)) {
      collectExportTargets(v, out);
    }
  }
  return out;
}

beforeAll(() => {
  // Build the package exactly as it is published. The test asserts against the
  // resulting dist, so the build is part of what is being proven. `dist/` is
  // gitignored and CI does not build ds-react before `pnpm test`, so this must
  // be self-contained.
  execFileSync("pnpm", ["-F", "@full-stack-ds/react", "build"], {
    cwd: REPO_ROOT,
    stdio: "pipe",
    encoding: "utf8",
  });
}, 120_000);

describe("@full-stack-ds/react published consumption contract", () => {
  it("A1: every exports-map / main / module / types target resolves to a real file", () => {
    const pkg = JSON.parse(readFileSync(PKG_JSON, "utf8")) as Record<
      string,
      unknown
    >;

    const targets = new Set<string>(collectExportTargets(pkg.exports));
    for (const key of ["main", "module", "types"] as const) {
      const v = pkg[key];
      if (typeof v === "string") targets.add(v);
    }

    // Sanity: the package actually declares the dual-format + styles surface.
    expect(targets.has("./dist/index.js")).toBe(true);
    expect(targets.has("./dist/index.cjs")).toBe(true);
    expect(targets.has("./dist/index.css")).toBe(true); // the ./styles.css export

    const missing = [...targets].filter(
      (rel) => !existsSync(resolve(PKG_DIR, rel)),
    );
    expect(missing, `unresolved exports targets: ${missing.join(", ")}`).toEqual(
      [],
    );
  });

  it("A2: the built dist entrypoint exports the documented component surface", async () => {
    // Import by RESOLVED PATH, not the package name — the vitest alias points
    // `@full-stack-ds/react` at src/, which would defeat the purpose.
    const distEntry = resolve(PKG_DIR, "dist", "index.js");
    const mod = (await import(/* @vite-ignore */ distEntry)) as Record<
      string,
      unknown
    >;

    // Components the showcase actually consumes from the package today.
    const REQUIRED = [
      "Button",
      "Card",
      "Input",
      "Tabs",
      "TabsList",
      "TabsTab",
      "Badge",
      "Chip",
      "Switch",
      "Popover",
      "NavList",
      "NavListItem",
      "Links",
      "Stat",
      "List",
      "Stack",
    ];
    const absent = REQUIRED.filter((name) => mod[name] == null);
    expect(absent, `missing exports from dist: ${absent.join(", ")}`).toEqual(
      [],
    );

    // A few are plain function components — prove they are callable React
    // components, not just truthy values.
    for (const name of ["Button", "Card", "Input", "Badge", "Stat"]) {
      expect(typeof mod[name], `${name} should be a function component`).toBe(
        "function",
      );
    }
  });

  it("A3: the aggregate styles.css carries the component selectors a consumer relies on", () => {
    const cssPath = resolve(PKG_DIR, "dist", "index.css");
    const css = readFileSync(cssPath, "utf8");

    // A real aggregate, not an empty/placeholder file.
    expect(css.length).toBeGreaterThan(10_000);

    // The CSS for the components the showcase mounts must be present in the
    // single published stylesheet (proves per-component CSS was aggregated).
    for (const selector of [
      ".button",
      ".card",
      ".input",
      ".tabs",
      ".badge",
      ".chip",
    ]) {
      expect(css, `styles.css missing ${selector}`).toContain(selector);
    }
  });
});
