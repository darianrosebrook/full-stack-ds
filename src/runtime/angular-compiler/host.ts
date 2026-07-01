// Host-component synthesizer for the Angular preview pipeline.
//
// buildAngularDemo (runtime/demos.ts) returns Angular host-component source as
// a string. This module is the disk-writing half: it places that source under
// the ds-angular package root, where the compile module's `extraFiles` option
// can hand it to performCompilation. The compiled host lands in the cache and
// the bootstrap shell loads it from there.
//
// Why under the package root and not in some scratch dir: the host imports
// `./components/<Name>/<Name>.component.js` (a relative path baked into the
// emitted host source). That path only resolves correctly if the host's source
// file lives directly inside the ds-angular package root, sibling to src/.
// Otherwise the Angular compiler errors with "cannot find module" before it
// even gets to template type-checking.

import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import type { ComponentBundle } from "../../types/data";
import { buildAngularDemo } from "../demos";
import { angularPackageRoot } from "../../../packages/ds-angular/src/preview/index.ts";

const HOSTS_DIR_NAME = ".fsds-preview-hosts";

/**
 * Where synthesized host TypeScript files live on disk. A subdirectory under
 * the ds-angular package root (gitignored — see ds-angular/.gitignore) so the
 * compiler can resolve `./components/...` imports inside the package without
 * the showcase having to mirror the package's module layout elsewhere.
 */
export function hostsDir(): string {
  return path.join(angularPackageRoot(), HOSTS_DIR_NAME);
}

/** Absolute path to a component's synthesized host file. */
export function hostFilePath(componentName: string): string {
  return path.join(hostsDir(), `${componentName}.host.component.ts`);
}

/** Slug used by the bootstrap shell when loading the compiled host module. */
export function hostModuleName(componentName: string): string {
  return `${componentName}.host.component`;
}

interface SynthesizeOptions {
  component: ComponentBundle;
}

/**
 * Write the synthesized host source to disk if it differs from what's already
 * there, returning the absolute file path. We compare-then-write rather than
 * write-unconditionally so the compiler's incremental mode (and any future
 * watcher) doesn't see a no-op change as a fresh mtime.
 */
export async function synthesizeHost(
  opts: SynthesizeOptions,
): Promise<string> {
  const { component } = opts;
  const dir = hostsDir();
  await fsp.mkdir(dir, { recursive: true });

  const filePath = hostFilePath(component.name);
  const sourceFromDemo = buildAngularDemo(component);
  // The buildAngularDemo string assumes the host file sits one level above
  // src/components/<Name>. Our hosts live in <pkg>/.fsds-preview-hosts/, which
  // is also one level under the package root — but the relative path from
  // there to components/<Name> goes through ../src/, not ./. Rewrite the
  // import to reflect actual placement.
  const rewritten = sourceFromDemo.replace(
    /from\s+"\.\/components\//g,
    'from "../src/components/',
  );

  // Skip write if the on-disk source already matches. Avoids spurious
  // recompiles when the same component is previewed twice.
  let existing: string | null = null;
  try { existing = await fsp.readFile(filePath, "utf8"); } catch { /* missing */ }
  if (existing !== rewritten) {
    await fsp.writeFile(filePath, rewritten, "utf8");
  }
  return filePath;
}

/**
 * Synthesize hosts for every component the bundle has Angular source for.
 * Used at dev-server start (before the first compile) so the initial
 * compileAngularPackage call can emit all hosts in one pass — that's faster
 * than re-running the compiler N times for N first-views.
 */
export async function synthesizeAllHosts(
  bundle: { components: readonly ComponentBundle[] },
): Promise<readonly string[]> {
  const out: string[] = [];
  for (const component of bundle.components) {
    if (!component.sources.angular?.component) continue;
    out.push(await synthesizeHost({ component }));
  }
  return out;
}

/** Wipe the hosts dir. Used by the plugin on startup to drop stale files. */
export async function clearHosts(): Promise<void> {
  const dir = hostsDir();
  if (fs.existsSync(dir)) {
    await fsp.rm(dir, { recursive: true, force: true });
  }
}
