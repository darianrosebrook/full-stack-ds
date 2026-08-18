#!/usr/bin/env node
// @ts-check
/**
 * Token-realization audit rail (FEAT-TOKEN-REALIZATION-AUDIT-001).
 *
 * THE QUESTION THIS ASKS. A component's contract declares token slots in its
 * `<Name>.tokens.json` sidecar; each NATIVE target (react-native, swiftui,
 * jetpack-compose) is expected to realize those slots through a per-component
 * carrier artifact so styling parity is data-driven, not vibes-driven:
 *
 *   react-native    packages/ds-react-native/src/components/<N>/<N>.tokens.ts
 *   swiftui         packages/ds-swiftui/Sources/DsSwiftUI/Components/<N>/<N>Tokens.swift
 *   jetpack-compose packages/ds-jetpack-compose/library/src/main/kotlin/com/fullstackds/components/<N>/<N>Tokens.kt
 *
 * The web families are deliberately OUT of scope: their shared CSS pipeline
 * is already covered by the styling rails (pseudo-state, state-suppression,
 * token-resolvability). This rail is the native-carrier scoreboard the
 * mobile parity matrix could only mark "unmeasured".
 *
 * DERIVATION DISCIPLINE. The denominator (corpus + per-component slot lists)
 * is walked from `packages/ds-contracts/components/` the way contracts-fs
 * does — never a hardcoded list. Target admission comes from
 * `fsds.targets.json` (empty `components` = full-corpus default target).
 * Slot realization is an exact quoted-name match against the carrier text:
 * carriers embed sidecar slot names verbatim (`"switch.color.track..."`),
 * so a substring hit on the quoted form is precise for every carrier grammar
 * shipped today.
 *
 * GAP KINDS.
 *   admission — corpus component not admitted to an explicit-only target
 *               (policy: allowlists grow per coverage slice; the ratchet
 *               makes each non-admission a visible, ledgered decision).
 *   carrier   — admitted component whose per-component token carrier is
 *               absent (headline example: swiftui has none today — its
 *               components consume semantic defaults only, so per-component
 *               realization is structurally zero until a carrier lands).
 *   slot      — carrier exists but specific declared slots are missing from
 *               it (emitter dropped or never covered them).
 *   orphan    — carrier exists although the contract declares no slots
 *               (stale emission; regenerate or remove).
 *
 * READ-ONLY. Changes no contract, token, or generated artifact. Writes only
 * its own report under docs/token-realization-audit/ and (with --init) the
 * baseline ledger.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { diffLedger, loadLedger, reportRatchet } from "../lib/ledger-ratchet.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const CONTRACTS = resolve(REPO, "packages/ds-contracts/components");
const TARGETS_JSON = resolve(REPO, "fsds.targets.json");
const OUT_DIR = resolve(REPO, "docs/token-realization-audit");
const LEDGER_PATH = resolve(HERE, "known-gaps.json");

const SPEC = "FEAT-TOKEN-REALIZATION-AUDIT-001";

/** Native targets this rail scores, with their carrier artifact resolvers. */
export const NATIVE_TARGETS = [
  {
    id: "react-native",
    explicitOnly: false,
    carrierRel: (name) => `packages/ds-react-native/src/components/${name}/${name}.tokens.ts`,
  },
  {
    id: "swiftui",
    explicitOnly: true,
    carrierRel: (name) =>
      `packages/ds-swiftui/Sources/DsSwiftUI/Components/${name}/${name}Tokens.swift`,
  },
  {
    id: "jetpack-compose",
    explicitOnly: true,
    carrierRel: (name) =>
      `packages/ds-jetpack-compose/library/src/main/kotlin/com/fullstackds/components/${name}/${name}Tokens.kt`,
  },
];

/**
 * Walk the corpus the way contracts-fs does: one directory per component,
 * `<Name>/<Name>.contract.json` present. Sidecar slots come verbatim from
 * `<Name>.tokens.json` when it exists.
 */
export function collectCorpus(contractsRoot) {
  const corpus = [];
  for (const entry of readdirSync(contractsRoot, { withFileTypes: true }).sort()) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (!existsSync(resolve(contractsRoot, name, `${name}.contract.json`))) continue;
    const sidecar = resolve(contractsRoot, name, `${name}.tokens.json`);
    const slots = existsSync(sidecar) ? Object.keys(JSON.parse(readFileSync(sidecar, "utf8"))) : [];
    corpus.push({ name, slots });
  }
  return corpus;
}

/** Admitted component set for a target: allowlist, or the full corpus. */
export function admittedSet(target, corpus, targetsJson) {
  const declared = targetsJson.targets.find((t) => t.id === target.id);
  if (!target.explicitOnly || !declared || !declared.components?.length) {
    return new Set(corpus.map((c) => c.name));
  }
  return new Set(declared.components);
}

/**
 * Pure gap computation for one target. `carrierTextFor(name)` returns the
 * carrier file's text or null when absent — injected so the selfcheck can
 * drive fixtures without touching the repo.
 */
export function computeTargetGaps(target, corpus, admitted, carrierTextFor) {
  const gaps = [];
  for (const component of corpus) {
    const admittedForComponent = admitted.has(component.name);
    const carrierText = carrierTextFor(component.name);
    if (!admittedForComponent) {
      if (component.slots.length > 0) {
        gaps.push({ target: target.id, component: component.name, kind: "admission" });
      }
      continue;
    }
    if (component.slots.length === 0) {
      if (carrierText !== null) {
        gaps.push({ target: target.id, component: component.name, kind: "orphan" });
      }
      continue;
    }
    if (carrierText === null) {
      gaps.push({ target: target.id, component: component.name, kind: "carrier" });
      continue;
    }
    for (const slot of component.slots) {
      if (!carrierText.includes(`"${slot}"`)) {
        gaps.push({ target: target.id, component: component.name, kind: "slot", slot });
      }
    }
  }
  return gaps;
}

/** Stable identity for a gap across runs and ledger diffs. */
export function gapId(gap) {
  return [gap.target, gap.component, gap.kind, gap.slot ?? "—"].join(":");
}

const RUN_DIRECTLY =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (RUN_DIRECTLY) {
  const initMode = process.argv.includes("--init");
  const targetsJson = JSON.parse(readFileSync(TARGETS_JSON, "utf8"));
  const corpus = collectCorpus(CONTRACTS);
  if (corpus.length === 0) {
    throw new Error(`No contracts found under ${CONTRACTS} — the corpus walk is broken.`);
  }

  const perTarget = [];
  const gaps = [];
  for (const target of NATIVE_TARGETS) {
    const admitted = admittedSet(target, corpus, targetsJson);
    const targetGaps = computeTargetGaps(target, corpus, admitted, (name) => {
      const rel = target.carrierRel(name);
      const abs = resolve(REPO, rel);
      return existsSync(abs) ? readFileSync(abs, "utf8") : null;
    });
    gaps.push(...targetGaps);

    const admittedCorpus = corpus.filter((c) => admitted.has(c.name) && c.slots.length > 0);
    const slotsDeclared = admittedCorpus.reduce((sum, c) => sum + c.slots.length, 0);
    const carriersPresent = admittedCorpus.filter(
      (c) => !targetGaps.some((g) => g.component === c.name && g.kind === "carrier"),
    ).length;
    // A slot is realized only when its component's carrier exists AND embeds
    // it — a missing carrier zeroes the whole component's realization.
    const slotsRealized = admittedCorpus.reduce((sum, c) => {
      if (targetGaps.some((g) => g.component === c.name && g.kind === "carrier")) return sum;
      return sum + c.slots.length - targetGaps.filter(
        (g) => g.component === c.name && g.kind === "slot",
      ).length;
    }, 0);
    perTarget.push({
      target: target.id,
      admitted: admittedCorpus.length,
      carriersPresent,
      slotsRealized,
      slotsDeclared,
      gaps: {
        admission: targetGaps.filter((g) => g.kind === "admission").length,
        carrier: targetGaps.filter((g) => g.kind === "carrier").length,
        slot: targetGaps.filter((g) => g.kind === "slot").length,
        orphan: targetGaps.filter((g) => g.kind === "orphan").length,
      },
    });
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    resolve(OUT_DIR, "realization-matrix.json"),
    JSON.stringify(
      { spec: SPEC, corpusSize: corpus.length, perTarget, gaps },
      null,
      2,
    ) + "\n",
  );

  const md = [
    "# Native token-realization matrix",
    "",
    `\`${SPEC}\` — read-only scoreboard. Contract-declared token slots (from \`<Name>.tokens.json\` sidecars) vs what each native target realizes through its per-component carrier. This is the measurement the mobile parity matrix could only mark "unmeasured".`,
    "",
    "| target | admitted (with slots) | carrier present | slots realized / declared | admission | carrier | slot | orphan |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const t of perTarget) {
    md.push(
      `| ${t.target} | ${t.admitted} | ${t.carriersPresent} | ${t.slotsRealized} / ${t.slotsDeclared} | ${t.gaps.admission} | ${t.gaps.carrier} | ${t.gaps.slot} | ${t.gaps.orphan} |`,
    );
  }
  md.push("");
  md.push("Gap kinds: `admission` = corpus component not in an explicit-only target's allowlist · `carrier` = admitted but no per-component token carrier · `slot` = carrier missing declared slots · `orphan` = carrier without declared slots.");
  writeFileSync(resolve(OUT_DIR, "realization-matrix.md"), md.join("\n") + "\n");

  console.log(`\n${SPEC} — corpus ${corpus.length} components`);
  for (const t of perTarget) {
    console.log(
      `  ${t.target.padEnd(16)} admitted ${String(t.admitted).padStart(2)}  carriers ${String(t.carriersPresent).padStart(2)}  slots ${String(t.slotsRealized).padStart(3)}/${String(t.slotsDeclared).padStart(3)}  gaps a=${t.gaps.admission} c=${t.gaps.carrier} s=${t.gaps.slot} o=${t.gaps.orphan}`,
    );
  }
  console.log(`Report: ${resolve(OUT_DIR, "realization-matrix.md")}\n`);

  if (initMode) {
    const byReason = {
      admission: "allowlist growth pending — component not yet admitted to this explicit-only target",
      carrier: "no per-component token carrier emitted for this target yet",
      slot: "carrier exists but this declared slot is not embedded in it",
      orphan: "carrier emitted although the contract declares no slots",
    };
    writeFileSync(
      LEDGER_PATH,
      JSON.stringify(
        {
          gaps: gaps.map((g) => ({
            ...g,
            spec: SPEC,
            note: `baseline ${g.kind}: ${byReason[g.kind]}`,
          })),
        },
        null,
        2,
      ) + "\n",
    );
    console.log(`INIT — baseline ledger written: ${LEDGER_PATH} (${gaps.length} entries).`);
    console.log("Annotate dispositions, then re-run without --init to enforce the ratchet.");
    process.exit(0);
  }

  const ledger = loadLedger(LEDGER_PATH, ["target", "component", "kind"]);
  const { unledgered, stale } = diffLedger({ current: gaps, ledger, idOf: gapId });
  const code = reportRatchet({ label: "token-realization", current: gaps, unledgered, stale, idOf: gapId });
  if (code !== 0) process.exit(code);
}
