#!/usr/bin/env node
/**
 * Compose ↔ React Native token-usage parity gate (FEAT-COMPOSE-RN-PARITY-01,
 * extended by FEAT-COMPOSE-STATIC-CHROME-HYGIENE-01 and
 * FEAT-COMPOSE-TYPOGRAPHY-CONTENT-01).
 *
 * For every jetpack-compose ADMITTED component, proves against the generated
 * trees:
 *
 *   1. Scope parity: the set of `--fsds-*` custom properties emitted in the
 *      Compose `<Name>Tokens.kt` equals the set emitted in the RN
 *      `<Name>.tokens.ts` — identical scope vocabulary, per component,
 *      two-directional (a Compose-only or RN-only entry fails).
 *   2. Resolvability: every Compose scope entry carries a `ref` (semantic
 *      token the theme resolves) or a `literal`/`fallback` — no entry that
 *      the FsdsTheme chain (slot-name override -> semantic-ref -> literal ->
 *      fallback) cannot resolve.
 *   3. Usage parity (no dead lookups): every slot key the emitted Compose
 *      `<Name>.kt` looks up must exist in the component's token scopes
 *      (exact keys, or a declared key under a dynamic-concatenation prefix);
 *      and every chrome-role slot the RN `<Name>.styles.ts` consumes must be
 *      consumed by the Compose emission. The claimed chrome-role set is per
 *      emitter path: static-content claims box-model padding/min-height +
 *      base color tones + radius; button claims the size-suffixed slots;
 *      toggle claims track/thumb. Typography-bearing content roots also claim
 *      the typography role (text.size.*, text.typography.fontWeight.*) —
 *      exactly the slots RN's Text styles consume.
 *   4. Content-color propagation: a static-content component whose scopes
 *      carry a base-tone foreground slot must provide it via
 *      LocalFsdsContentColor.
 *   5. API shape: `modifier: Modifier = Modifier` is the first optional
 *      parameter of every generated composable (AOSP Compose API guideline).
 *
 * The gate is a local oracle like swift-parity-diff: read-only over the
 * generated trees, exits nonzero on divergence. Wired into CI and pre-push
 * under the generated-drift family so token-scope AND token-usage parity
 * cannot silently rot.
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

/** All scope/slot keys declared in a `<Name>Tokens.kt` (map keys). */
function tokensKeySet(tokensSource) {
  return new Set(
    [...tokensSource.matchAll(/^\s*"([^"]+)" to (?:mapOf|ComponentTokenDefinition)/gm)]
      .map((m) => m[1]),
  );
}

/** Slot keys the emitted Compose component looks up (`layeredSlot("…")` /
 *  `get("…")` with a string literal). Dynamic concatenation lookups
 *  (`layeredSlot("text.typography.fontWeight." + weight.name.lowercase())`)
 *  are captured as PREFIXES: any declared key starting with the literal
 *  prefix counts as consumed.
 *  Returns { exact: Set<string>, prefixes: Set<string> }. */
function composeConsumedKeys(ktSource) {
  const exact = new Set();
  const prefixes = new Set();
  for (const m of ktSource.matchAll(/(?:layeredSlot|get)\("([^"]*)"\)/g)) {
    if (m[1] !== "") exact.add(m[1]);
  }
  for (const m of ktSource.matchAll(/(?:layeredSlot|get)\("([^"]*)"\s*\+/g)) {
    if (m[1] !== "") prefixes.add(m[1]);
  }
  // Multi-line `layeredSlot( when (…) { … -> "slot.key" })` lookups (the
  // weight-axis vocabulary): the when-arm string literals ARE the lookup keys.
  for (const m of ktSource.matchAll(/->\s*"([^"]+)"\s*,?$/gm)) {
    if (m[1] !== "") exact.add(m[1]);
  }
  return { exact, prefixes };
}

/** True when a declared key set covers a consumed key (exact or prefix). */
function isConsumed(declared, consumed, key) {
  if (consumed.exact.has(key)) return true;
  return [...consumed.prefixes].some((p) => key.startsWith(p));
}

/** Slot keys the RN `<Name>.styles.ts` consumes (`tokens.<scope>?.["…"]`). */
function rnConsumedKeys(stylesSource) {
  return new Set(
    [...stylesSource.matchAll(/tokens\.[A-Za-z0-9_]+(\?\.)?\["([^"]+)"\]/g)]
      .map((m) => m[2]),
  );
}

/** The claimed chrome-role set, per emitter path. Each path claims exactly
 *  the roles it realizes: static-content claims box-model padding/min-height +
 *  base color tones + radius; the projected-children (button) path realizes
 *  padding/min-height through the size-suffixed slots; the native-toggle path
 *  claims none of the chrome roles (its realization is the track/thumb color
 *  surface). State variants (`.foreground.hover`, `.background.active`) and
 *  per-part tones (Stat's `.foreground.value`/`.label`) are never claimed. */
const BASE_BACKGROUND = /\.color\.background\.(default|bg)$/;
const BASE_FOREGROUND = /\.color\.foreground\.(default|primary)$/;
const CHROME_ROLE_STATIC = new RegExp(
  [BASE_BACKGROUND.source, BASE_FOREGROUND.source, "\\.(?:size|border)\\.radius(?:\\.|$)", "box-model\\.padding", "box-model\\.min-height(?:\\.|$)"].join("|"),
);
const CHROME_ROLE_BUTTON = new RegExp(
  [BASE_BACKGROUND.source, BASE_FOREGROUND.source, "\\.(?:size|border)\\.radius(?:\\.|$)", "size\\.padding", "size\\.minHeight"].join("|"),
);
const CHROME_ROLE_TOGGLE = /(?!)/;
/** Typography role: claimed only for typography-bearing content-role roots
 *  (slot-evidence: the scopes carry `text.size.*` keys). Covers the slots the
 *  RN Text styles consume (text.size.md + text.typography.fontWeight.*). */
const TYPO_ROLE = /text\.size\.|text\.typography\.fontWeight\./;

/** Which emitter path produced a generated `<Name>.kt`. */
function emitterPath(ktSource) {
  if (ktSource.includes("FsdsButtonScope")) return "button";
  if (ktSource.includes("FsdsToggle")) return "toggle";
  return "static";
}

/** Chrome-role filter for a generated component's emitter path. */
function chromeRoleForPath(path) {
  if (path === "button") return CHROME_ROLE_BUTTON;
  if (path === "toggle") return CHROME_ROLE_TOGGLE;
  return CHROME_ROLE_STATIC;
}

/** First parameter that carries a default in the composable signature. */
function firstDefaultParam(ktSource, name) {
  const m = ktSource.match(new RegExp(`fun ${name}\\(([\\s\\S]*?)\\)\\s*\\{`));
  if (!m) return null;
  const params = m[1].split("\n").map((l) => l.trim()).filter(Boolean).join(" ");
  // Split on top-level commas (none appear inside the lambda types used here).
  const firstWithDefault = params.split(",").find((p) => p.includes("="));
  return firstWithDefault?.trim() ?? null;
}

for (const name of admitted) {
  const composeTokens = join(COMPOSE_ROOT, name, `${name}Tokens.kt`);
  const composeKt = join(COMPOSE_ROOT, name, `${name}.kt`);
  const rnTokens = join(RN_ROOT, name, `${name}.tokens.ts`);
  const rnStyles = join(RN_ROOT, name, `${name}.styles.ts`);
  if (!existsSync(composeTokens) || !existsSync(composeKt)) {
    console.error(`[compose-parity] MISSING compose emission: ${name}`);
    failures += 1;
    continue;
  }
  if (!existsSync(rnTokens)) {
    console.error(`[compose-parity] MISSING RN reference: ${rnTokens}`);
    failures += 1;
    continue;
  }
  const c = readFileSync(composeTokens, "utf8");
  const kt = readFileSync(composeKt, "utf8");
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

  // Usage parity: no dead lookups, every consumed key exists, and every
  // RN-consumed chrome/typography-role slot is consumed by the Compose
  // emission (exact or via the dynamic-prefix lookups).
  const declared = tokensKeySet(c);
  const consumed = composeConsumedKeys(kt);
  const deadExact = [...consumed.exact].filter((k) => !declared.has(k));
  const deadPrefix = [...consumed.prefixes].filter(
    (p) => ![...declared].some((k) => k.startsWith(p)),
  );
  if (deadExact.length > 0 || deadPrefix.length > 0) {
    failures += 1;
    console.error(
      `[compose-parity] DEAD LOOKUP ${name}: exact keys not declared: ${deadExact.join(",")}${deadPrefix.length > 0 ? `; prefixes with no declared key: ${deadPrefix.join(",")}` : ""}`,
    );
    continue;
  }
  if (existsSync(rnStyles)) {
    const path = emitterPath(kt);
    const chromeRole = chromeRoleForPath(path);
    const isTypographyBearing = [...declared].some((k) => k.includes("text.size."));
    const rnConsumed = [...rnConsumedKeys(readFileSync(rnStyles, "utf8"))].filter(
      (k) => chromeRole.test(k) || (isTypographyBearing && TYPO_ROLE.test(k)),
    );
    const missing = rnConsumed.filter((k) => !isConsumed(declared, consumed, k));
    if (missing.length > 0) {
      failures += 1;
      console.error(
        `[compose-parity] USAGE DIVERGENCE ${name} (${path}): RN consumes chrome/typography slots the Compose emission does not: ${missing.join(",")}`,
      );
      continue;
    }
  }

  // Content-color propagation: static-content components with a classified
  // BASE-TONE foreground slot (the same grammar the emitter resolves) must
  // provide it via LocalFsdsContentColor. Per-part tones (Stat's value/label)
  // are not content tones and impose no obligation.
  const isStaticContent = kt.includes("content: @Composable () -> Unit");
  const hasBaseForegroundSlot = [...declared].some((k) => BASE_FOREGROUND.test(k));
  if (isStaticContent && hasBaseForegroundSlot && !kt.includes("LocalFsdsContentColor")) {
    failures += 1;
    console.error(
      `[compose-parity] CONTENT COLOR ${name}: static-content component carries a base foreground slot but never provides LocalFsdsContentColor`,
    );
    continue;
  }

  // API shape: modifier is the first optional parameter.
  const firstDefault = firstDefaultParam(kt, name);
  if (firstDefault !== "modifier: Modifier = Modifier") {
    failures += 1;
    console.error(
      `[compose-parity] MODIFIER ORDER ${name}: first defaulted parameter is '${firstDefault ?? "none"}' — must be 'modifier: Modifier = Modifier'`,
    );
    continue;
  }

  console.log(`[compose-parity] OK ${name}: ${cSet.size} cssVars, scopes match, ${defs.length} definitions resolvable, ${consumed.exact.size + consumed.prefixes.size} slot lookups all declared, modifier first-optional`);
}

console.log(
  `\n[compose-parity] ${admitted.length} admitted component(s); RN corpus reference present for ${admitted.filter((n) => existsSync(join(RN_ROOT, n, `${n}.tokens.ts`))).length}.`,
);
if (failures > 0) {
  console.error(`\n[compose-parity] FAIL — ${failures} divergence(s). Token scope/usage parity between Compose and RN is broken; fix the emitter or regenerate.`);
  process.exit(1);
}
console.log("[compose-parity] PASS — every admitted component's token scopes match RN, every emitted lookup resolves, chrome usage matches RN, and modifier is first-optional.");
