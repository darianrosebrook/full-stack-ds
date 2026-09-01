/**
 * Motion-realization rail (RAIL-REDUCED-MOTION-01).
 *
 * READ-ONLY. Derives motion obligations from the LIVE contract corpus and
 * checks each against the generated React CSS, mirroring the sibling styling
 * rails: all five web families lower from the same IR through the same
 * `emitCss`, so a miss surfaces identically in each.
 *
 * WHY THIS RAIL EXISTS. `contract.motion` was declared by twelve contracts and
 * read by nothing — `contract.ts` typed it `unknown`, and `buildKeyframes`
 * read a DIFFERENT top-level key. So `reducedMotion: "respect"` was a promise
 * with no mechanism behind it, and it showed: before this slice,
 * `prefers-reduced-motion` appeared exactly ONCE in the entire generated
 * corpus, inside a hand-authored `@custom` region in one framework's
 * Popover.css, while seven components animated unconditionally for a user who
 * had asked their OS for stillness.
 *
 * -- Obligation classes (each derived from a contract FACT, falsifiable) -----
 *
 *   REDUCED_MOTION_UNHONOURED
 *     The component's emitted CSS animates, its contract does not say
 *     `ignore`, and no `prefers-reduced-motion` block neutralises it. This is
 *     the class with teeth — it is an accessibility defect, not a docs gap,
 *     and it is derived from what the CSS ACTUALLY does rather than from what
 *     the contract claims, so a contract cannot silence it by staying quiet.
 *
 *   MOTION_TOKEN_UNRESOLVABLE
 *     A declared `duration`/`easing` reference whose lowered custom-property
 *     name is declared nowhere in the token graph. Invisible at runtime: CSS
 *     falls back to the literal, so the animation still plays at a plausible
 *     speed while the token layer is decorative for it. Three distinct causes
 *     live in the corpus — names never defined at all, kebab spellings of
 *     camelCase tokens, and flat spellings of nested paths.
 *
 *   MOTION_PROPERTY_UNREALIZED
 *     A property a transition declares that no emitted rule animates. This is
 *     the largest and weakest class, and it is reported rather than fixed
 *     because realizing a `trigger` like `openness=closed→open` means
 *     inferring which selector represents that state — unsolved, and exactly
 *     where per-component emitter lore would accumulate. Ledgered so the set
 *     cannot grow while that stays open.
 *
 * NON-CLAIM. A derived reduced-motion block proves the CSS neutralises the
 * declarations it can see. It does NOT prove the component feels still: JS-
 * driven animation, inline styles and framework transition helpers are all
 * outside this rail's sight, and none of them are audited anywhere yet.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { tokenSlug } from "../../packages/ds-codegen/dist/token-path.js";
import { diffLedger, loadLedger, reportRatchet } from "../lib/ledger-ratchet.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const CONTRACTS = resolve(REPO, "packages/ds-contracts/components");
const REACT = resolve(REPO, "packages/ds-react/src/components");
const GLOBAL_TOKENS = resolve(REPO, "packages/ds-tokens/generated/tokens.css");
const LEDGER_PATH = resolve(HERE, "known-motion-gaps.json");

const readText = (p) => (existsSync(p) ? readFileSync(p, "utf-8") : "");

/** Every `--fsds-*` name the token graph declares. */
export function declaredTokenNames(css) {
  const names = new Set();
  for (const m of css.matchAll(/(--fsds-[A-Za-z0-9_-]+)\s*:/g)) names.add(m[1]);
  return names;
}

/**
 * Strip the reduced-motion block out before asking "does this animate?".
 *
 * Without this the audit answers its own question: the neutralising rule sets
 * `animation-duration`, so a component would look like it animates BECAUSE it
 * honours reduced motion, and REDUCED_MOTION_UNHONOURED could never fire.
 */
export function stripReducedMotion(css) {
  return css.replace(/@media \(prefers-reduced-motion[^{]*\{[\s\S]*?\n\}/g, "");
}

const ANIMATING_DECL =
  /(^|\s)(animation|animation-name|animation-duration|transition|transition-property|transition-duration)\s*:\s*([^;]+);/g;

/** Does this stylesheet animate, ignoring declarations that switch motion off? */
export function animates(css) {
  const off = new Set(["none", "0", "0s", "0ms", "initial", "unset"]);
  for (const m of stripReducedMotion(css).matchAll(ANIMATING_DECL)) {
    if (!off.has(m[3].trim().toLowerCase())) return true;
  }
  return false;
}

export function hasReducedMotionBlock(css) {
  return /@media \(prefers-reduced-motion/.test(css);
}

/** Which CSS properties this stylesheet actually animates, by name. */
export function animatedProperties(css) {
  const props = new Set();
  const body = stripReducedMotion(css);
  for (const m of body.matchAll(/transition(?:-property)?\s*:\s*([^;]+);/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+/)[0];
      if (name && name !== "none") props.add(name);
    }
  }
  // A keyframed animation animates whatever its frames declare.
  for (const m of body.matchAll(/@keyframes[^{]*\{([\s\S]*?)\n\}/g)) {
    for (const d of m[1].matchAll(/([a-z-]+)\s*:/g)) props.add(d[1]);
  }
  return props;
}

export function motionId(row) {
  return `${row.component}::${row.kind}::${row.detail}`;
}

export function runAudit() {
  const declared = declaredTokenNames(readText(GLOBAL_TOKENS));
  const findings = [];
  let contractsWithMotion = 0;
  let transitionCount = 0;

  for (const name of readdirSync(CONTRACTS).sort()) {
    const contractPath = resolve(CONTRACTS, name, `${name}.contract.json`);
    if (!existsSync(contractPath)) continue;
    const contract = JSON.parse(readFileSync(contractPath, "utf-8"));
    const css = readText(resolve(REACT, name, `${name}.css`));
    const motion = contract.motion;

    // --- REDUCED_MOTION_UNHONOURED: derived from the CSS, not the contract.
    if (css && animates(css) && motion?.reducedMotion !== "ignore" && !hasReducedMotionBlock(css)) {
      findings.push({
        component: name,
        kind: "REDUCED_MOTION_UNHONOURED",
        detail: "css animates with no prefers-reduced-motion block",
      });
    }

    if (!motion) continue;
    contractsWithMotion += 1;
    const realized = animatedProperties(css);

    for (const t of motion.transitions ?? []) {
      transitionCount += 1;
      for (const [role, ref] of [
        ["duration", t.duration],
        ["easing", t.easing],
      ]) {
        if (!ref) continue;
        if (!declared.has(`--${tokenSlug(ref)}`)) {
          findings.push({
            component: name,
            kind: "MOTION_TOKEN_UNRESOLVABLE",
            detail: `${t.name}.${role} -> ${ref}`,
          });
        }
      }
      for (const property of t.properties ?? []) {
        if (!realized.has(property)) {
          findings.push({
            component: name,
            kind: "MOTION_PROPERTY_UNREALIZED",
            detail: `${t.name} declares ${property}`,
          });
        }
      }
    }
  }

  findings.sort((a, b) => motionId(a).localeCompare(motionId(b)));
  return { findings, contractsWithMotion, transitionCount };
}

const RUN_DIRECTLY =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (RUN_DIRECTLY) {
  const { findings, contractsWithMotion, transitionCount } = runAudit();
  const byKind = new Map();
  for (const f of findings) byKind.set(f.kind, (byKind.get(f.kind) ?? 0) + 1);

  console.log(
    `\nRAIL-REDUCED-MOTION-01 — ${contractsWithMotion} contract(s) declare motion, ${transitionCount} transition(s)`,
  );
  for (const kind of [
    "REDUCED_MOTION_UNHONOURED",
    "MOTION_TOKEN_UNRESOLVABLE",
    "MOTION_PROPERTY_UNREALIZED",
  ]) {
    const rows = findings.filter((f) => f.kind === kind);
    console.log(`\n  ${kind}: ${rows.length}`);
    for (const row of rows) console.log(`    ${row.component}: ${row.detail}`);
  }
  console.log("");

  const ledger = loadLedger(LEDGER_PATH, ["component", "kind", "detail"]);
  const { unledgered, stale } = diffLedger({ current: findings, ledger, idOf: motionId });
  const code = reportRatchet({
    label: "motion-realization",
    current: findings,
    unledgered,
    stale,
    idOf: motionId,
  });
  if (code !== 0) process.exit(code);
}
