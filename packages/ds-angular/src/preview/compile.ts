// Angular preview compile module.
//
// Wraps @angular/compiler-cli's performCompilation so the showcase's Vite
// plugin can emit AOT-compiled ESM that bootstraps in the browser. The
// equivalent in-iframe Babel-transpile dance other frameworks use doesn't
// work for Angular because esm.sh ships partial-linker bundles that
// require server-side compilation (see docs trail under
// docs/codegen-authority.md and the spike trail this module replaces).
//
// Lives inside @full-stack-ds/angular because @angular/compiler-cli is only
// resolvable from this workspace, and keeping the Angular toolchain confined
// here preserves the "codegen is framework-agnostic" architectural rule.

import { performCompilation, readConfiguration } from "@angular/compiler-cli";
import * as path from "node:path";
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the ds-angular package root regardless of whether this module is
// running from src/ (ts-node / vite dev) or dist/ (built consumers).
const PACKAGE_ROOT = path.resolve(__dirname, "..", "..");

export interface CompileOptions {
  /** Absolute path to write emitted .js files into. */
  outDir: string;
  /**
   * Extra .ts files to include alongside src/**. Used by the showcase to add
   * a per-component host wrapper that bootstrapApplication can mount.
   * Paths must live inside PACKAGE_ROOT or compilation will be skipped.
   */
  extraFiles?: readonly string[];
}

export interface CompileDiagnostic {
  category: "error" | "warning" | "info";
  messageText: string;
}

export interface CompileResult {
  /** Wall-clock compile time in ms. */
  elapsedMs: number;
  /** Emitted .js files, absolute paths. */
  emitted: readonly string[];
  /** Compiler diagnostics. Empty array == clean compile. */
  diagnostics: readonly CompileDiagnostic[];
  /** Bare-specifier imports observed in the emitted output. */
  bareImports: readonly string[];
}

const DIAG_CATEGORY: Record<number, CompileDiagnostic["category"]> = {
  // @angular/compiler-cli re-exports ts.DiagnosticCategory:
  // 0 = Warning, 1 = Error, 2 = Suggestion, 3 = Message
  0: "warning",
  1: "error",
  2: "info",
  3: "info",
};

function bareImportsFrom(text: string): string[] {
  const set = new Set<string>();
  const re = /from\s+["']([^"'.][^"']*)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) set.add(m[1]);
  return [...set];
}

/**
 * Compile the ds-angular package source tree (plus any extraFiles) to ESM in
 * outDir. Returns metadata about the compile run. Caller decides what to do
 * with the output (serve it, diff it, fail the build, etc.).
 *
 * Cleans outDir before each call so stale artifacts can't be served — the
 * cost is small (~1.8s warm) and the alternative (incremental delete tracking)
 * is more failure-prone than the savings justify for a study artifact.
 */
export async function compileAngularPackage(
  opts: CompileOptions,
): Promise<CompileResult> {
  const { outDir, extraFiles = [] } = opts;

  await fsp.rm(outDir, { recursive: true, force: true });
  await fsp.mkdir(outDir, { recursive: true });

  // Spike learning: extending the package's tsconfig.json works, but its
  // include pattern leaks unless we redeclare include here narrowly. Without
  // an explicit include, performCompilation emits the entire tree including
  // tests (151 files in the first spike). Narrowing keeps it bounded and
  // ~2x faster.
  const tsconfigPath = path.join(outDir, "tsconfig.preview.json");
  const tsconfig = {
    extends: path.join(PACKAGE_ROOT, "tsconfig.json"),
    compilerOptions: {
      noEmit: false,
      declaration: false,
      sourceMap: false,
      outDir,
      rootDir: PACKAGE_ROOT,
      module: "esnext",
      target: "es2022",
      moduleResolution: "bundler",
    },
    // include patterns resolve relative to the tsconfig file's directory.
    // The tsconfig lives in outDir (some /tmp path), so we use absolute
    // paths anchored at PACKAGE_ROOT to keep the source set unambiguous.
    include: [
      path.join(PACKAGE_ROOT, "src/**/*.ts"),
      ...extraFiles,
    ],
    exclude: [
      path.join(PACKAGE_ROOT, "src/**/__tests__/**"),
      path.join(PACKAGE_ROOT, "src/**/*.test.ts"),
      path.join(PACKAGE_ROOT, "src/**/*.spec.ts"),
      // src/preview/** is showcase-side tooling that uses Node APIs; it must
      // not be fed to the Angular compiler.
      path.join(PACKAGE_ROOT, "src/preview/**"),
    ],
  };
  await fsp.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));

  const config = readConfiguration(tsconfigPath);
  const setupDiagnostics: CompileDiagnostic[] = config.errors.map((err) => ({
    category: DIAG_CATEGORY[err.category] ?? "info",
    messageText: typeof err.messageText === "string"
      ? err.messageText
      : err.messageText.messageText,
  }));
  if (setupDiagnostics.some((d) => d.category === "error")) {
    return {
      elapsedMs: 0,
      emitted: [],
      diagnostics: setupDiagnostics,
      bareImports: [],
    };
  }

  const t0 = Date.now();
  const result = performCompilation({
    rootNames: config.rootNames,
    options: config.options,
  });
  const elapsedMs = Date.now() - t0;

  const diagnostics: CompileDiagnostic[] = result.diagnostics.map((diag) => ({
    category: DIAG_CATEGORY[diag.category] ?? "info",
    messageText: typeof diag.messageText === "string"
      ? diag.messageText
      : diag.messageText.messageText,
  }));

  // Walk outDir for emitted .js files. Resolved synchronously because the
  // tree is small (~tens of files) and async churn here gains nothing.
  const emitted: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".js")) emitted.push(full);
    }
  }
  if (fs.existsSync(outDir)) walk(outDir);

  // Collect bare-specifier imports across emitted output. The showcase shell
  // uses this set to build the importmap; if a new bare import appears
  // (e.g. @angular/forms), the showcase needs to know to add it.
  const bareImportSet = new Set<string>();
  for (const file of emitted) {
    const text = fs.readFileSync(file, "utf8");
    for (const spec of bareImportsFrom(text)) bareImportSet.add(spec);
  }

  return {
    elapsedMs,
    emitted,
    diagnostics,
    bareImports: [...bareImportSet],
  };
}

/** Exported so tooling (vite plugin, tests) can resolve cache paths. */
export function angularPackageRoot(): string {
  return PACKAGE_ROOT;
}
