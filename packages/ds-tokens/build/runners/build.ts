#!/usr/bin/env node
/**
 * Design Tokens Build Runner
 *
 * Main orchestration script that runs all token generation steps
 * in the correct order with proper error handling and reporting.
 */

import { composeTokens } from "../generators/compose.js";
import { generateGlobalTokens } from "../generators/global.js";
import { resolveAndWrite } from "../generators/resolve.js";
import { PATHS } from "../core/index.js";
// Types generator is lazy-loaded — it imports `prettier`, which isn't a
// devDependency of this package yet. Loading it eagerly would crash the whole
// build pipeline on the require. Step 2 doesn't need types; we'll add the
// devDep and re-enable the step when we wire codegen-side type imports.
type StepFn = (incremental?: boolean) => boolean | Promise<boolean>;

async function generateTokenTypes(incremental?: boolean): Promise<boolean> {
  const mod = await import("../generators/types.js");
  return mod.generateTokenTypes(incremental);
}

/**
 * Walk composed.tokens.json and emit resolved.tokens.json — every {ref}
 * dereferenced down to a literal value. Consumers needing concrete colors
 * (contrast / a11y validators) read this artifact. Cheap (~50ms) since
 * it's a single tree walk with memoizable reference lookups.
 */
function resolveTokens(): boolean {
  const result = resolveAndWrite(PATHS.tokens, PATHS.outputResolved);
  if (result.warnings.length > 0) {
    console.warn(
      `[resolve] ⚠️  ${result.warnings.length} unresolved token(s):`,
    );
    for (const w of result.warnings.slice(0, 10)) {
      console.warn(`  - ${w}`);
    }
    if (result.warnings.length > 10) {
      console.warn(`  ... and ${result.warnings.length - 10} more`);
    }
  }
  console.log(`[resolve] Resolved ${result.leafCount} leaf token(s)`);
  // Warnings don't fail the build — they're diagnostics. A future hardening
  // step could promote these to errors once the token tree is clean.
  return true;
}

interface BuildStep {
  name: string;
  description: string;
  fn: StepFn;
  required: boolean;
}

/**
 * Design tokens build pipeline
 */
export async function buildTokens(incremental = true): Promise<boolean> {
  console.log("🎨 Design Tokens Build Pipeline\n");
  if (incremental) {
    console.log("⚡ Incremental build enabled\n");
  }

  const steps: BuildStep[] = [
    {
      name: "compose",
      description: "Compose core and semantic tokens",
      fn: composeTokens,
      required: true,
    },
    {
      name: "global",
      description: "Generate global CSS variables",
      fn: generateGlobalTokens,
      required: true,
    },
    {
      name: "resolve",
      description: "Resolve refs → emit resolved.tokens.json",
      fn: resolveTokens,
      required: true,
    },
    // 'types' step is parked until `prettier` is added as a devDep here and
    // codegen wires the import surface; see runSteps() to invoke it manually.
  ];

  const results: Array<{ step: string; success: boolean; duration: number }> =
    [];
  let totalErrors = 0;

  // Execute each step
  for (const step of steps) {
    const startTime = Date.now();
    console.log(`[${step.name}] ${step.description}...`);

    try {
      const success = await step.fn(incremental);
      const duration = Date.now() - startTime;

      results.push({ step: step.name, success, duration });

      if (success) {
        console.log(`[${step.name}] ✅ Completed in ${duration}ms`);
      } else {
        console.error(`[${step.name}] ❌ Failed`);
        totalErrors++;

        if (step.required) {
          console.error(`[build] Required step failed, aborting build`);
          break;
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      results.push({ step: step.name, success: false, duration });
      totalErrors++;

      console.error(`[${step.name}] ❌ Error:`, error);

      if (step.required) {
        console.error(`[build] Required step failed, aborting build`);
        break;
      }
    }

    console.log(""); // Add spacing between steps
  }

  // Print summary
  console.log("📊 Build Summary:");
  console.log("─".repeat(50));

  results.forEach(({ step, success, duration }) => {
    const status = success ? "✅" : "❌";
    const time =
      duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`;
    console.log(`  ${status} ${step.padEnd(12)} ${time.padStart(8)}`);
  });

  console.log("─".repeat(50));

  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const successCount = results.filter((r) => r.success).length;
  const timeStr =
    totalDuration < 1000
      ? `${totalDuration}ms`
      : `${(totalDuration / 1000).toFixed(1)}s`;

  console.log(
    `  ${successCount}/${results.length} steps completed in ${timeStr}`,
  );

  if (totalErrors === 0) {
    console.log("\n🎉 Design tokens build completed successfully!");
  } else {
    console.log(`\n⚠️  Build completed with ${totalErrors} error(s)`);
  }

  return totalErrors === 0;
}

/**
 * Run specific step(s) only
 */
export async function runSteps(stepNames: string[]): Promise<boolean> {
  const availableSteps: Record<string, () => boolean | Promise<boolean>> = {
    compose: composeTokens,
    global: generateGlobalTokens,
    resolve: resolveTokens,
    types: generateTokenTypes,
  };

  let success = true;

  for (const stepName of stepNames) {
    if (!availableSteps[stepName]) {
      console.error(`[build] Unknown step: ${stepName}`);
      console.error(
        `[build] Available steps: ${Object.keys(availableSteps).join(", ")}`,
      );
      return false;
    }

    console.log(`[${stepName}] Running...`);
    const stepSuccess = await availableSteps[stepName]();

    if (!stepSuccess) {
      console.error(`[${stepName}] ❌ Failed`);
      success = false;
    } else {
      console.log(`[${stepName}] ✅ Completed`);
    }
  }

  return success;
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Check for flags
    const incremental = !args.includes("--no-incremental");
    const filteredArgs = args.filter((arg) => arg !== "--no-incremental");

    if (filteredArgs.length > 0) {
      // Run specific steps
      const success = await runSteps(filteredArgs);
      process.exit(success ? 0 : 1);
    } else {
      // Run full build with incremental flag
      const success = await buildTokens(incremental);
      process.exit(success ? 0 : 1);
    }
  } else {
    // Run full build (incremental by default)
    const success = await buildTokens();
    process.exit(success ? 0 : 1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("[build] Fatal error:", error);
    process.exit(1);
  });
}
