#!/usr/bin/env node
/** Native token integrity over the generated trees. Each target emits its
 * own consumed slots. Shared addresses must agree; every Compose lookup must
 * have a definition in the addressed scope and every definition must be used.
 * Supported chrome roles, content propagation and Compose API shape remain
 * cross-target obligations. This static gate does not prove visual parity.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { composeTokenReads, composeTokenDefinitions } from "../packages/ds-codegen/dist/frameworks/native-token-consumption.js";

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

/** Shared slot identity survives target-specific projection. RN definitions
 * carry the same name/cssVar metadata even when native value units differ. */
function rnTokenIdentities(source) {
  return new Map([...source.matchAll(/name:\s*"([^"]+)",\s*cssVar:\s*"([^"]+)"/g)]
    .map(match => [match[1], match[2]]));
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
 *  base color tones + radius; the projected-children (button) path also claims
 *  minimum width. Both use the canonical box-model slots; the native-toggle path
 *  claims none of the chrome roles (its realization is the track/thumb color
 *  surface). State variants (`.foreground.hover`, `.background.active`) and
 *  per-part tones (Stat's `.foreground.value`/`.label`) are never claimed. */
const BASE_BACKGROUND = /\.color\.background\.(default|bg)$/;
const BASE_FOREGROUND = /\.color\.foreground\.(default|primary)$/;
const CHROME_ROLE_STATIC = new RegExp(
  [BASE_BACKGROUND.source, BASE_FOREGROUND.source, "\\.(?:size|border)\\.radius(?:\\.|$)", "box-model\\.padding", "box-model\\.min-height(?:\\.|$)"].join("|"),
);
const CHROME_ROLE_BUTTON = new RegExp(
  [CHROME_ROLE_STATIC.source, "box-model\\.min-width(?:\\.|$)"].join("|"),
);
const CHROME_ROLE_TOGGLE = /(?!)/;
/** Boolean-control path (Checkbox): the checkbox-part token vocabulary plus
 *  the shared box-model surface slots it realizes. `box-model.gap` is
 *  deliberately unclaimed — a lone control lays out no children; the
 *  label/gap realization belongs to composer classes. */
const CHROME_ROLE_CHECKBOX = new RegExp(
  ["checkbox\\.(?:color|border|focus\\.ring|transition)\\.", "box-model\\.(?:padding|min-width|min-height)"].join("|"),
);
/** Bare-rule-leaf path (Divider): the rule paint (part-scoped color default
 *  + thickness) and its surface minimums. */
const CHROME_ROLE_RULE = new RegExp(
  ["\\.color\\.default$", "\\.size\\.thickness", "box-model\\.(?:padding|min-width|min-height)"].join("|"),
);
/** Font-size role: claimed by the prop-text leaf path (the corpus's
 *  text-leaf size vocabulary — `code-block.size.fontSize.default` etc.). */
const FONT_SIZE_ROLE = /\.size\.fontSize\.|\.typography\.fontSize\./;
/** Text-color role: claimed by the progress path (`progress.color.text.default`). */
const TEXT_COLOR_ROLE = /\.color\.text\./;
/** Typography role: claimed only for typography-bearing content-role roots
 *  (slot-evidence: the scopes carry `text.size.*` keys). Covers the slots the
 *  RN Text styles consume (text.size.md + text.typography.fontWeight.*). */
const TYPO_ROLE = /text\.size\.|text\.typography\.fontWeight\./;

/** Which emitter path produced a generated `<Name>.kt`. */
function emitterPath(ktSource) {
  if (ktSource.includes("FsdsButtonScope")) return "button";
  if (ktSource.includes("FsdsToggle")) return "toggle";
  if (ktSource.includes("FsdsCheckbox")) return "checkbox";
  if (ktSource.includes("FsdsRule")) return "rule";
  if (ktSource.includes("FsdsProgressIndicator")) return "progress";
  if (ktSource.includes("BasicText(") && !ktSource.includes("content: @Composable")) {
    return "propText";
  }
  if (ktSource.includes("resolvedExpanded")) return "expandable";
  return "static";
}

/** Chrome-role filter for a generated component's emitter path. */
function chromeRoleForPath(path) {
  if (path === "button") return CHROME_ROLE_BUTTON;
  if (path === "toggle") return CHROME_ROLE_TOGGLE;
  if (path === "checkbox") return CHROME_ROLE_CHECKBOX;
  if (path === "rule") return CHROME_ROLE_RULE;
  if (path === "progress") {
    return new RegExp([CHROME_ROLE_STATIC.source, TEXT_COLOR_ROLE.source].join("|"));
  }
  if (path === "propText") {
    return new RegExp([CHROME_ROLE_STATIC.source, FONT_SIZE_ROLE.source].join("|"));
  }
  if (path === "expandable") return CHROME_ROLE_STATIC;
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

export function inspectComposeTokens({ name, tokens, component, rnTokens, rnStyles }) {
  const issues = [];
  const definitions = composeTokenDefinitions(tokens);
  const reads = composeTokenReads(component);
  const declared = new Set(definitions.map(definition => definition.key));
  const rnIdentities = rnTokenIdentities(rnTokens);
  for (const definition of definitions) {
    const address = `${definition.scope}/${definition.key}`;
    if (definition.name !== definition.key || !definition.cssVar?.startsWith("--fsds-")) {
      issues.push(`INVALID IDENTITY ${address}`);
    }
    const rnIdentity = rnIdentities.get(definition.key);
    if (rnIdentity !== undefined && definition.cssVar !== rnIdentity) {
      issues.push(`SHARED IDENTITY ${address}: Compose=${definition.cssVar} RN=${rnIdentity}`);
    }
    if (definition.ref === undefined && definition.literal === undefined && definition.fallback === undefined) {
      issues.push(`UNRESOLVABLE ${address}: no ref, literal or fallback`);
    }
    if (!reads.some(read => read.name === definition.key &&
        (read.scope === undefined || read.scope === definition.scope))) {
      issues.push(`UNCONSUMED ${address}`);
    }
  }
  for (const read of reads) {
    if (!definitions.some(definition => definition.key === read.name &&
        (read.scope === undefined || read.scope === definition.scope))) {
      issues.push(`DEAD LOOKUP ${read.scope ?? "layered"}/${read.name}`);
    }
  }
  const path = emitterPath(component);
  const chromeRole = chromeRoleForPath(path);
  const isTypographyBearing = [...rnIdentities.keys()].some(key => key.includes("text.size."));
  const rnConsumed = [...rnConsumedKeys(rnStyles)].filter(key =>
    chromeRole.test(key) || (isTypographyBearing && TYPO_ROLE.test(key)));
  for (const key of rnConsumed) {
    if (!reads.some(read => read.name === key)) issues.push(`USAGE DIVERGENCE ${path}: ${key}`);
  }
  const isStaticContent = component.includes("content: @Composable () -> Unit");
  if (isStaticContent && [...declared].some(key => BASE_FOREGROUND.test(key)) &&
      !component.includes("LocalFsdsContentColor")) issues.push("CONTENT COLOR: missing LocalFsdsContentColor");
  if (firstDefaultParam(component, name) !== "modifier: Modifier = Modifier") {
    issues.push("MODIFIER ORDER: modifier must be first optional");
  }
  return issues;
}

export function auditComposeCorpus() {
  if (!admitted.length) throw new Error("Compose component allowlist is empty or missing");
  const results = [];
  for (const name of admitted) {
    const paths = {
      tokens: join(COMPOSE_ROOT, name, `${name}Tokens.kt`),
      component: join(COMPOSE_ROOT, name, `${name}.kt`),
      rnTokens: join(RN_ROOT, name, `${name}.tokens.ts`),
      rnStyles: join(RN_ROOT, name, `${name}.styles.ts`),
    };
    const missing = Object.values(paths).filter(path => !existsSync(path));
    const issues = missing.length ? missing.map(path => `MISSING ${path}`) :
      inspectComposeTokens({ name, ...Object.fromEntries(Object.entries(paths).map(([key, path]) =>
        [key, readFileSync(path, "utf8")])) });
    results.push({ name, issues });
  }
  return results;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const { name, issues } of auditComposeCorpus()) {
    if (issues.length) {
      failures += issues.length;
      issues.forEach(issue => console.error(`[compose-parity] ${name}: ${issue}`));
    } else console.log(`[compose-parity] OK ${name}: consumed definitions, shared identities, supported roles and API shape`);
  }
  console.log(`[compose-parity] ${admitted.length} allowlisted components; ${failures} failures.`);
  process.exitCode = failures ? 1 : 0;
}
