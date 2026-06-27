// Committed in-app PROJECTION of runtime-rail coverage.
//
// This module is NOT the source of truth for what the rail asserts — the rail
// itself (e2e/runtime-rail.spec.ts) is. This is the committed projection the
// showcase reads so the Evidence/Residuals surface can state, per component and
// per framework, WHICH facts the rail asserts. A coherence test
// (rail-coverage.test.ts) fails if this projection drifts from the asserted
// rail surface discoverable in e2e/runtime-rail.spec.ts.
//
// Scope of the claim (COMPONENT-EVIDENCE-RAIL-COVERAGE-BINDING-01):
//   - "rail facts asserted" / "no rail facts asserted" — coverage, NOT a
//     last-run pass/fail. Whether the most recent CI rail run was green is the
//     reserved COMPONENT-EVIDENCE-CI-STATUS-BINDING-01 slice (needs a committed
//     or reproducibly generated status artifact with a declared freshness
//     model). This module deliberately carries no run status, timestamp, or sha.
//   - Coverage is a property of the committed rail spec, so it needs no Playwright
//     run to be true.
//
// The module is dependency-free (types + data only) so both the browser-side
// showcase (EvidencePanel) and the Node-side coherence test can import it.

export type Framework = "react" | "vue" | "svelte" | "lit" | "angular";

/**
 * The frameworks the rail exercises for DEFAULT-prop facts. Mirrors the rail
 * spec's `FRAMEWORKS` constant; the coherence test asserts they match.
 */
export const RAIL_DEFAULT_FRAMEWORKS: readonly Framework[] = [
  "react",
  "vue",
  "svelte",
  "lit",
  "angular",
];

/**
 * Frameworks whose NON-default facts the rail asserts via the preview
 * `fsds:config` message bus. Mirrors the rail spec's `NONDEFAULT_FRAMEWORKS`.
 */
export const RAIL_NONDEFAULT_CONFIG_BUS_FRAMEWORKS: readonly Framework[] = [
  "react",
  "vue",
  "svelte",
  "lit",
  "angular",
];

export interface RailNonDefaultCoverage {
  /**
   * The non-default prop(s) whose runtime effect the rail asserts (e.g.
   * `maxLines`). One per covered component today; an array for honesty.
   */
  readonly props: readonly string[];
  /** Frameworks asserting these via the preview fsds:config message bus. */
  readonly configBusFrameworks: readonly Framework[];
}

export interface RailCoverageEntry {
  /** Component name as it appears in the contract corpus / bundle. */
  readonly component: string;
  /** Frameworks for which the rail asserts DEFAULT-prop facts. */
  readonly defaultFrameworks: readonly Framework[];
  /** Non-default prop coverage, present only when the rail asserts any. */
  readonly nonDefault?: RailNonDefaultCoverage;
}

/**
 * The committed coverage projection. Each entry mirrors a `Runtime rail — <X>`
 * describe surface in e2e/runtime-rail.spec.ts. Components absent from this list
 * have NO rail coverage — that is a neutral fact, not a failure.
 */
export const RAIL_COVERAGE: readonly RailCoverageEntry[] = [
  { component: "Progress", defaultFrameworks: RAIL_DEFAULT_FRAMEWORKS,
    nonDefault: {
      props: ["value"],
      configBusFrameworks: RAIL_NONDEFAULT_CONFIG_BUS_FRAMEWORKS,
    } },
  { component: "OTP", defaultFrameworks: RAIL_DEFAULT_FRAMEWORKS },
  { component: "Calendar", defaultFrameworks: RAIL_DEFAULT_FRAMEWORKS },
  { component: "Shuttle", defaultFrameworks: RAIL_DEFAULT_FRAMEWORKS },
  { component: "Walkthrough", defaultFrameworks: RAIL_DEFAULT_FRAMEWORKS },
  { component: "Select", defaultFrameworks: RAIL_DEFAULT_FRAMEWORKS },
  { component: "Truncate", defaultFrameworks: RAIL_DEFAULT_FRAMEWORKS,
    nonDefault: {
      props: ["lines"],
      configBusFrameworks: RAIL_NONDEFAULT_CONFIG_BUS_FRAMEWORKS,
    } },
  { component: "ShowMore", defaultFrameworks: RAIL_DEFAULT_FRAMEWORKS,
    nonDefault: {
      props: ["maxLines"],
      configBusFrameworks: RAIL_NONDEFAULT_CONFIG_BUS_FRAMEWORKS,
    } },
];

/** Look up the rail coverage projection for a component, if any. */
export function railCoverageFor(component: string): RailCoverageEntry | undefined {
  return RAIL_COVERAGE.find((e) => e.component === component);
}

/** Whether a framework asserts default-prop facts for a covered entry. */
export function hasDefaultFact(entry: RailCoverageEntry, framework: Framework): boolean {
  return entry.defaultFrameworks.includes(framework);
}

/**
 * How a framework asserts NON-default facts for a covered entry:
 * "config-bus" or null (none).
 */
export function nonDefaultMechanism(
  entry: RailCoverageEntry,
  framework: Framework,
): "config-bus" | null {
  if (!entry.nonDefault) return null;
  if (entry.nonDefault.configBusFrameworks.includes(framework)) return "config-bus";
  return null;
}
