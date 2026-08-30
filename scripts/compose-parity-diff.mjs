#!/usr/bin/env node
/**
 * Compose ↔ React Native token-usage parity gate (FEAT-COMPOSE-RN-PARITY-01).
 *
 * For every jetpack-compose ADMITTED component, proves two things against
 * the generated trees:
 *
 *   1. Scope parity: the set of `--fsds-*` custom properties emitted in the
 *      Compose `<Name>Tokens.kt` equals the set emitted in the RN
 *      `<Name>.tokens.ts` — identical scope vocabulary, per component,
 *      two-directional (a Compose-only or RN-only entry fails).
 *   2. Resolvability: every Compose scope entry carries a `ref` (semantic
 *      token the theme resolves) or a `literal`/`fallback` — no entry that
 *      the FsdsTheme chain (slot-name override -> semantic-ref -> literal ->
 *      fallback) cannot resolve.
 *
 * The gate is a local oracle like swift-parity-diff: read-only over the
 * generated trees, exits nonzero on divergence. Wired into CI and pre-push
 * under the generated-drift family (the classifier routes native-tree
 * changes to it) so token-scope parity cannot silently rot.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const COMPOSE_ROOT = join(
  ROOT, "packages", "ds-jetpack-compose", "library", "src", "main", "kotlin",
  "com", "fullstackds", "components",
);
const RN_ROOT = join(ROOT, "packages", "ds-react-native", "src", "components");

const registry = JSON.parse(readFileSync(join(ROOT, "fsds.targets.json"), "utf8"));
const compose = registry.targets.find((t) => t.id === "jetpack-compose");
const admitted = (compose?.components ?? []).sort();

let failures = 0;

/** All `--fsds-*` custom-property names in a generated source file. */
function cssVarSet(source) {
  return new Set([...source.matchAll(/"(--fsds-[a-z0-9-]+)"/g)].map((m) => m[1]));
}

for (const name of admitted) {
  const composeTokens = join(COMPOSE_ROOT, name, `${name}Tokens.kt`);
  const rnTokens = join(RN_ROOT, name, `${name}.tokens.ts`);
  if (!existsSync(composeTokens)) {
    console.error(`[compose-parity] MISSING compose tokens: ${composeTokens}`);
    failures += 1;
    continue;
  }
  if (!existsSync(rnTokens)) {
    console.error(`[compose-parity] MISSING RN reference: ${rnTokens}`);
    failures += 1;
    continue;
  }
  const c = readFileSync(composeTokens, "utf8");
  const r = readFileSync(rnTokens, "utf8");
  const cSet = cssVarSet(c);
  const rSet = cssVarSet(r);

  const onlyCompose = [...cSet].filter((v) => !rSet.has(v));
  const onlyRn = [...rSet].filter((v) => !cSet.has(v));
  if (onlyCompose.length > 0 || onlyRn.length > 0) {
    failures += 1;
    console.error(
      `[compose-parity] SCOPE DIVERGENCE ${name}: compose=${cSet.size} rn=${rSet.size}` +
        (onlyCompose.length > 0 ? ` compose-only=${onlyCompose.join(",")}` : "") +
        (onlyRn.length > 0 ? ` rn-only=${onlyRn.join(",")}` : ""),
    );
    continue;
  }

  // Resolvability: every ComponentTokenDefinition carries ref OR literal/fallback.
  const defs = [...c.matchAll(/ComponentTokenDefinition\(([^)]*)\)/g)].map(
    (m) => m[1],
  );
  const unresolvable = defs.filter(
    (body) =>
      !/ref\s*=/.test(body) && !/literal\s*=/.test(body) && !/fallback\s*=/.test(body),
  );
  if (unresolvable.length > 0) {
    failures += 1;
    console.error(
      `[compose-parity] UNRESOLVABLE ${name}: ${unresolvable.length} scope entr(ies) carry neither ref nor literal/fallback`,
    );
    continue;
  }
  console.log(`[compose-parity] OK ${name}: ${cSet.size} cssVars, scopes ${cSet.size === rSet.size ? "match" : "MISMATCH"}, ${defs.length} definitions resolvable`);
}

console.log(
  `\n[compose-parity] ${admitted.length} admitted component(s); RN corpus reference present for ${admitted.filter((n) => existsSync(join(RN_ROOT, n, `${n}.tokens.ts`))).length}.`,
);
if (failures > 0) {
  console.error(`\n[compose-parity] FAIL — ${failures} divergence(s). Token-scope parity between Compose and RN is broken; fix the emitter or regenerate.`);
  process.exit(1);
}
console.log("[compose-parity] PASS — every admitted component's token scope matches RN exactly and resolves through the theme chain.");
