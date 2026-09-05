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
    expectedDetection: {
      stage: "generate-check",
      evidenceClass: "structural",
    },
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
    expectedDetection: {
      stage: "root-tests",
      evidenceClass: "mixed-test",
      evidenceMarker:
        "Dialog — named slots > uses the authored title and body as the unique dialog name and description",
    },
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
    expectedDetection: {
      stage: "root-tests",
      evidenceClass: "mixed-test",
      evidenceMarker:
        "Icon — authored accessibility policy > defaults an unlabeled icon to decorative presentation semantics",
    },
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
    expectedDetection: {
      stage: "audit-variant-realization",
      evidenceClass: "contract-derived",
    },
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
    expectedDetection: {
      stage: "admission",
      evidenceClass: "structural",
    },
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
      note: "The all-seven full profile at 8bb6e521 realized both values without contradiction across structural, audit, test, and browser stages; this sentinel keeps that unprotected fact explicit.",
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
      note: "The all-seven full profile at 8bb6e521 realized both values without contradiction across structural, audit, test, and browser stages; this sentinel keeps that unprotected fact explicit.",
    },
  },
  {
    id: "dialog-state-machine-open-event-reveal",
    fieldClass: "state-machine-event",
    contractPath:
      "packages/ds-contracts/components/Dialog/Dialog.contract.json",
    pointer: ["stateMachine", "transitions", 0, "event"],
    from: "open",
    to: "reveal",
    hypothesis:
      "Renaming a valid state-machine event should affect a consumer or remain an explicit non-emitting fact.",
    expectedOutcome: "survived",
    gap: {
      spec: "RAIL-CONTRACT-INFLUENCE-PROVENANCE-01",
      note: "This sentinel measures whether state-machine event vocabulary reaches anything beyond schema and transition self-consistency checks.",
    },
  },
  {
    id: "card-actions-slot-required",
    fieldClass: "slot-requiredness",
    contractPath:
      "packages/ds-contracts/components/Card/Card.contract.json",
    pointer: ["slots", "actions", "required"],
    from: false,
    to: true,
    hypothesis:
      "Making a named slot required should change a generated API, validator, authored fact, or remain an explicit documentation-only declaration.",
    expectedOutcome: "survived",
    gap: {
      spec: "RAIL-CONTRACT-INFLUENCE-PROVENANCE-01",
      note: "This sentinel measures the required flag specifically; named-slot rendering is separately driven by anatomy.dom slot nodes.",
    },
  },
  {
    id: "show-more-text-overflow-to-default-expanded",
    fieldClass: "text-overflow-binding",
    contractPath:
      "packages/ds-contracts/components/ShowMore/ShowMore.contract.json",
    pointer: ["textOverflow", "line"],
    from: "prop:maxLines",
    to: "prop:defaultExpanded",
    hypothesis:
      "Repointing line-clamp intent to a real but wrong prop should be contradicted by authored IR-authority evidence.",
    expectedOutcome: "detected",
    expectedDetection: {
      stage: "root-tests",
      evidenceClass: "mixed-test",
      evidenceMarker:
        "TextOverflowIR — real ShowMore/Truncate contracts > builds textOverflow for ShowMore with kind line-clamp and line sourced from prop:maxLines",
    },
  },
  {
    id: "accordion-motion-height-to-width",
    fieldClass: "motion-property",
    contractPath:
      "packages/ds-contracts/components/Accordion/Accordion.contract.json",
    pointer: ["motion", "transitions", 0, "properties", 0],
    from: "height",
    to: "width",
    hypothesis:
      "Changing a declared transition property should alter the motion-realization obligation set.",
    expectedOutcome: "detected",
    expectedDetection: {
      stage: "audit-motion",
      evidenceClass: "contract-derived",
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

export function compareMutationDisposition(result) {
  const outcomeMatches = result.outcome === result.expectedOutcome;
  const provenanceCompared =
    outcomeMatches &&
    result.outcome === "detected" &&
    result.expectedDetection !== undefined;
  const provenanceMatches =
    !provenanceCompared ||
    (result.firstDetection?.stage === result.expectedDetection.stage &&
      result.firstDetection?.evidenceClass ===
        result.expectedDetection.evidenceClass);
  const evidenceMarkerCompared =
    provenanceCompared &&
    typeof result.expectedDetection.evidenceMarker === "string";
  const evidenceMarkerMatches =
    !evidenceMarkerCompared ||
    result.firstDetection?.evidenceMarkerPresent === true;

  return {
    matches: outcomeMatches && provenanceMatches && evidenceMarkerMatches,
    outcomeMatches,
    provenanceCompared,
    provenanceMatches,
    evidenceMarkerCompared,
    evidenceMarkerMatches,
  };
}

export function summarizeMutationResults(results) {
  const totals = {
    total: results.length,
    detected: 0,
    survived: 0,
    byEvidenceClass: {},
    byFieldClass: {},
    dispositionMismatches: 0,
    provenanceMismatches: 0,
    evidenceMarkerMismatches: 0,
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

    const disposition = compareMutationDisposition(result);
    const outcomeMismatch = !disposition.outcomeMatches;
    const provenanceMismatch =
      disposition.provenanceCompared &&
      (!disposition.provenanceMatches || !disposition.evidenceMarkerMatches);

    if (!disposition.matches) {
      totals.dispositionMismatches += 1;
      if (provenanceMismatch) totals.provenanceMismatches += 1;
      if (
        disposition.evidenceMarkerCompared &&
        !disposition.evidenceMarkerMatches
      ) {
        totals.evidenceMarkerMismatches += 1;
      }
      if (outcomeMismatch && result.outcome === "survived") {
        totals.unexpectedSurvivors += 1;
      }
      if (outcomeMismatch && result.outcome === "detected") {
        totals.unexpectedDetections += 1;
      }
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
