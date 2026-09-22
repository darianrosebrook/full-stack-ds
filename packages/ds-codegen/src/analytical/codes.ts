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
 * `DIAG` below is the corpus judge's catalogue-carried vocabulary: every code
 * in it must appear in the doctrine's diagnostic catalogue and be carried by a
 * corpus case; `checkCorpus` enforces both directions between the catalogue
 * and the corpus, and the fixture ledger enforces that each has a fixture and
 * a legal near-neighbour. Nothing may be added here speculatively. The
 * boundary-owned blocks (`DERIVATION_DIAG`, `QUALIFIED_DIAG`,
 * `COMPOSITION_DIAG`) deliberately sit outside that rule — see their own
 * statements. A `REL_*` spelling alone therefore does NOT imply catalogue
 * membership.
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
  /**
   * A declared field-to-field bounds relationship that SUPPLIED rows violate.
   * An obligation rather than a diagnostic: naming a contradiction needs an
   * owner-licensed cause, so a measured violation stands as an unresolved
   * premise until the table gains one.
   */
  BOUNDS_ROW_CONSISTENT: "bounds:row-consistent",
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

/**
 * Codes the QUALIFIED SOURCE-GRAIN boundary owns.
 *
 * `BOUNDS_ROW_VIOLATED` is not in the doctrine catalogue and carries no corpus
 * case, on the same line `DERIVATION_DIAG` draws — but for a different reason,
 * so it is named separately rather than folded in: the corpus-level judge
 * (`engines.ts`) never emits it. It is the qualified-result contract's own
 * vocabulary, emitted only by `projection.ts`'s qualified path when a READABLE
 * observation falsifies an APPLICABLE declared field-to-field bounds
 * relationship (the narrow observed-counterexample semantics the owner
 * licensed; an unreadable participant is missing evidence, never this code).
 * Its semantic authority is this declaration plus the qualified-result
 * contract in `projection.ts`, NOT the doctrine's diagnostic catalogue — a
 * consumer must not assume that a `REL_*` code always means a catalogue
 * member, and must not re-add a catalogue row to make the documentation
 * symmetric. Nothing may be added here speculatively.
 */
export const QUALIFIED_DIAG = {
  /** A readable observation falsifies an applicable declared bounds relationship. */
  BOUNDS_ROW_VIOLATED: "REL_FIELD_BOUNDS_VIOLATED",
} as const;

/**
 * Codes the COMPOSITION boundary owns.
 *
 * `LAYER_OPERANDS_UNCOREGISTERED` is not in the doctrine catalogue and carries
 * no corpus case, on the same line `DERIVATION_DIAG` and `QUALIFIED_DIAG`
 * draw: the corpus-level judge (`engines.ts`) never emits it. It is the layer
 * combinator's own vocabulary, emitted only by `projection.ts`'s layer rule
 * when two qualified operands claim one population at EQUAL cardinality while
 * their structured source-grain key sets differ — an observed unregistration,
 * not a missing premise. (An operand that merely LACKS an observation leaves
 * the premise unresolved and is an obligation, never this code.)
 *
 * `FACET_PARTITION_UNBOUND` is the same kind of boundary-owned vocabulary for
 * the facet rule: emitted when the declared partition does not resolve to a
 * coordinate the CARRIED source-grain bindings bind on every observation (or
 * when the operands do not carry one shared population to partition). An
 * unresolvable partition is refused before any panels exist — a supplied or
 * absent row value never authorizes the reference, which is the same
 * resolution-precedes-observation line the qualification boundary draws.
 *
 * The semantic authority for both is this declaration plus the combinator
 * rules in `projection.ts`, NOT the doctrine's diagnostic catalogue. Nothing
 * may be added here speculatively.
 */
export const COMPOSITION_DIAG = {
  /** Equal-cardinality layer operands whose structured source-grain key sets differ. */
  LAYER_OPERANDS_UNCOREGISTERED: "REL_LAYER_OPERANDS_UNCOREGISTERED",
  /** A declared facet partition the carried source-grain bindings do not resolve. */
  FACET_PARTITION_UNBOUND: "REL_FACET_PARTITION_UNBOUND",
} as const;
