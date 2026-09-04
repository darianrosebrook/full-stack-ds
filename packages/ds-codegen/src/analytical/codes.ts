/**
 * The engine's complete output vocabulary: every diagnostic code and every
 * obligation term any rule may emit.
 *
 * It lives in its own module because the rules do not: the assertion engines
 * are in `engines.ts` and the derivation boundary is in `derivation.ts`, and
 * `engines.ts` imports the boundary. A shared vocabulary in either one would be
 * a cycle, and a vocabulary duplicated across both would let the two drift into
 * emitting the same defect under two spellings.
 *
 * Every code here must appear in the doctrine's diagnostic catalogue and be
 * carried by a corpus case; `checkCorpus` enforces both directions between the
 * catalogue and the corpus, and the fixture ledger enforces that each has a
 * fixture and a legal near-neighbour. Nothing may be added here speculatively.
 */

export const DIAG = {
  // meaningfulness
  ORDINAL_MEAN: "REL_MEANINGFULNESS_ORDINAL_MEAN",
  INTERVAL_RATIO: "REL_MEANINGFULNESS_INTERVAL_RATIO",
  INTERVAL_SUM: "REL_MEANINGFULNESS_INTERVAL_SUM",
  NOMINAL_ORDER_STAT: "REL_MEANINGFULNESS_NOMINAL_ORDER_STAT",
  CYCLIC_LINEAR_MEAN: "REL_MEANINGFULNESS_CYCLIC_LINEAR_MEAN",
  IDENTITY_AGGREGATED: "REL_IDENTITY_AGGREGATED",
  TEMPORAL_INSTANT_SUM: "REL_TEMPORAL_INSTANT_SUM",
  // additivity
  SUM_SEMIADDITIVE: "REL_ADDITIVITY_SUM_SEMIADDITIVE",
  RATIO_MEASURE_AVERAGED: "REL_RATIO_MEASURE_AVERAGED",
  GRAIN_FANOUT: "REL_GRAIN_FANOUT",
  PROPORTION_SUM_ACROSS_WHOLES: "REL_PROPORTION_SUM_ACROSS_WHOLES",
  NORMALIZE_NONADDITIVE: "REL_ADDITIVITY_NORMALIZE_NONADDITIVE",
  SUBTOTAL_MISMATCH: "REL_GRAIN_SUBTOTAL_MISMATCH",
  // dimensional
  UNIT_SUM_INCOMMENSURABLE: "REL_UNIT_SUM_INCOMMENSURABLE",
  // declaration-missing
  PROPORTION_WHOLE_UNDECLARED: "REL_PROPORTION_WHOLE_UNDECLARED",
  INDEX_BASE_MISSING: "REL_INDEX_BASE_MISSING",
  BIN_CLOSURE_UNDECLARED: "REL_BIN_CLOSURE_UNDECLARED",
  // derivation-typing
  UNCERTAINTY_UNPROPAGATED: "REL_UNCERTAINTY_UNPROPAGATED",
  NULL_CENSORED_AS_OBSERVED: "REL_NULL_CENSORED_AS_OBSERVED",
  NULL_SUPPRESSED_AS_ZERO: "REL_NULL_SUPPRESSED_AS_ZERO",
  TEMPORAL_GRAIN_MIXED: "REL_TEMPORAL_GRAIN_MIXED",
  PEER_GRAIN_DIVERGENCE: "REL_PEER_GRAIN_DIVERGENCE",
  DISCARDS_MEMBERSHIP: "REL_DERIVATION_DISCARDS_MEMBERSHIP",
  // task-invariant
  FLOW_NOT_CONSERVED: "REL_FLOW_NOT_CONSERVED",
} as const;

export const OBLIGATION = {
  GRAIN_DECLARED: "grain:declared",
  UNIT_COMMENSURABLE: "unit:commensurable",
  NULL_MISSING_MECHANISM: "null:missing-mechanism",
  CONSERVATION: "invariant:conservation",
} as const;

/**
 * Codes the derivation boundary owns.
 *
 * `INPUT_MISSING`, `RESULT_NOT_DERIVABLE` and `CYCLE` are not in the doctrine
 * catalogue and carry no corpus case: they are the boundary's own well-
 * formedness refusals, reached when a structure declares a derivation whose
 * result its operator could not have produced. A corpus case describes an
 * analytical mistake someone actually makes; these describe a structure that
 * never meant anything in the first place, which is why they are separated
 * rather than smuggled into the catalogue.
 */
export const DERIVATION_DIAG = {
  /** The derivation names an input the structure does not declare. */
  INPUT_MISSING: "REL_DERIVATION_INPUT_MISSING",
  /** The declared result is not a lawful output of this operator over its inputs. */
  RESULT_NOT_DERIVABLE: "REL_DERIVATION_RESULT_NOT_DERIVABLE",
  /** The derivation graph has a cycle, so no relation in it is grounded. */
  CYCLE: "REL_DERIVATION_CYCLIC",
} as const;
