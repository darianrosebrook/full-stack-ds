import { isDeepStrictEqual } from "node:util";

/**
 * Curated, one-fact contract mutations. These are deliberately not all
 * malformed inputs: the useful mutants are semantically coherent facts that
 * the generator can realize faithfully while still being wrong.
 */
export const CONTRACT_MUTANTS = Object.freeze([
  {
    id: "command-list-label-to-decoration",
    fieldClass: "relationship-target",
    contractPath:
      "packages/ds-contracts/components/Command/Command.contract.json",
    pointer: ["relationships", 2, "to"],
    from: "input",
    to: "searchIcon",
    hypothesis:
      "A naming relationship to a decorative part should be rejected before emission.",
    expectedOutcome: "detected",
  },
  {
    id: "dialog-name-to-body",
    fieldClass: "relationship-target",
    contractPath:
      "packages/ds-contracts/components/Dialog/Dialog.contract.json",
    pointer: ["relationships", 0, "to"],
    from: "title",
    to: "body",
    hypothesis:
      "A real but wrong naming target requires a test or runtime oracle to contradict it.",
    expectedOutcome: "detected",
  },
  {
    id: "icon-decorative-default-false",
    fieldClass: "boolean-default",
    contractPath:
      "packages/ds-contracts/components/Icon/Icon.contract.json",
    pointer: ["props", "designed", "members", 2, "default"],
    from: true,
    to: false,
    hypothesis:
      "Changing an accessibility default should be contradicted independently of regenerated tests.",
    expectedOutcome: "detected",
  },
  {
    id: "dialog-size-default-lg",
    fieldClass: "enum-default",
    contractPath:
      "packages/ds-contracts/components/Dialog/Dialog.contract.json",
    pointer: ["props", "styled", "members", 4, "default"],
    from: "md",
    to: "lg",
    hypothesis:
      "Changing a valid visual default should require authored behavioral or visual evidence.",
    expectedOutcome: "detected",
  },
  {
    id: "dialog-size-variant-full-to-wide",
    fieldClass: "variant-value",
    contractPath:
      "packages/ds-contracts/components/Dialog/Dialog.contract.json",
    pointer: ["variants", "size", 4],
    from: "full",
    to: "wide",
    hypothesis:
      "Renaming a variant while leaving its style selector behind should be detected by realization checks.",
    expectedOutcome: "detected",
  },
  {
    id: "badge-rtl-flip-icon-false",
    fieldClass: "rtl-policy",
    contractPath:
      "packages/ds-contracts/components/Badge/Badge.contract.json",
    pointer: ["rtl", "flipIcon"],
    from: true,
    to: false,
    hypothesis:
      "Changing a directional icon policy should be contradicted by emitted behavior or an authored runtime fact.",
    expectedOutcome: "survived",
    gap: {
      spec: "RAIL-CONTRACT-ORACLE-DISPOSITIONS-01",
      note: "The core profile realized both values without contradiction; the scheduled full profile ratchets this as an explicit unprotected contract fact.",
    },
  },
  {
    id: "badge-ssr-hydrate-on-interaction",
    fieldClass: "hydration-policy",
    contractPath:
      "packages/ds-contracts/components/Badge/Badge.contract.json",
    pointer: ["ssr", "hydrateOn"],
    from: "none",
    to: "interaction",
    hypothesis:
      "Changing a hydration policy should be contradicted by emitted behavior or an authored runtime fact.",
    expectedOutcome: "survived",
    gap: {
      spec: "RAIL-CONTRACT-ORACLE-DISPOSITIONS-01",
      note: "The core profile realized both values without contradiction; the scheduled full profile ratchets this as an explicit unprotected contract fact.",
    },
  },
]);

export function getAtPointer(value, pointer) {
  let cursor = value;
  for (const segment of pointer) {
    if (cursor === null || typeof cursor !== "object" || !(segment in cursor)) {
      throw new Error(
        "Mutation pointer does not resolve: /" + pointer.map(String).join("/"),
      );
    }
    cursor = cursor[segment];
  }
  return cursor;
}

export function applyContractMutation(contract, mutant) {
  const actual = getAtPointer(contract, mutant.pointer);
  if (!isDeepStrictEqual(actual, mutant.from)) {
    throw new Error(
      "Mutant " +
        mutant.id +
        " expected " +
        JSON.stringify(mutant.from) +
        " at /" +
        mutant.pointer.map(String).join("/") +
        " but found " +
        JSON.stringify(actual),
    );
  }

  const mutated = structuredClone(contract);
  let parent = mutated;
  for (const segment of mutant.pointer.slice(0, -1)) {
    parent = parent[segment];
  }
  parent[mutant.pointer.at(-1)] = structuredClone(mutant.to);
  return mutated;
}

export function changedLeaves(before, after, pointer = [], changes = []) {
  if (isDeepStrictEqual(before, after)) return changes;

  const beforeObject = before !== null && typeof before === "object";
  const afterObject = after !== null && typeof after === "object";
  if (beforeObject && afterObject) {
    if (Array.isArray(before) && Array.isArray(after)) {
      if (before.length !== after.length) {
        changes.push({ pointer, before, after });
        return changes;
      }
      for (let index = 0; index < before.length; index += 1) {
        changedLeaves(before[index], after[index], [...pointer, index], changes);
      }
      return changes;
    }

    const beforeKeys = Reflect.ownKeys(before);
    const afterKeys = Reflect.ownKeys(after);
    if (isDeepStrictEqual(beforeKeys, afterKeys)) {
      for (const key of beforeKeys) {
        changedLeaves(before[key], after[key], [...pointer, key], changes);
      }
      return changes;
    }
  }

  changes.push({ pointer, before, after });
  return changes;
}

export function summarizeMutationResults(results) {
  const totals = {
    total: results.length,
    detected: 0,
    survived: 0,
    byEvidenceClass: {},
    byFieldClass: {},
    dispositionMismatches: 0,
    unexpectedSurvivors: 0,
    unexpectedDetections: 0,
  };

  for (const result of results) {
    if (result.outcome === "survived") {
      totals.survived += 1;
    } else if (result.outcome === "detected") {
      totals.detected += 1;
      const evidenceClass = result.firstDetection.evidenceClass;
      totals.byEvidenceClass[evidenceClass] =
        (totals.byEvidenceClass[evidenceClass] ?? 0) + 1;
    }

    if (result.outcome !== result.expectedOutcome) {
      totals.dispositionMismatches += 1;
      if (result.outcome === "survived") totals.unexpectedSurvivors += 1;
      if (result.outcome === "detected") totals.unexpectedDetections += 1;
    }

    const field = (totals.byFieldClass[result.fieldClass] ??= {
      total: 0,
      detected: 0,
      survived: 0,
    });
    field.total += 1;
    if (result.outcome === "survived") field.survived += 1;
    if (result.outcome === "detected") field.detected += 1;
  }

  totals.detectionRate =
    totals.total === 0 ? null : totals.detected / totals.total;
  totals.survivalRate =
    totals.total === 0 ? null : totals.survived / totals.total;
  return totals;
}
