// FIGMA-DIMENSIONAL-STATE-PLANNER-01
//
// A PURE planning layer. It consumes a generated Figma descriptor's dimensional
// state facts and emits a target-neutral Figma component-surface plan. It does
// NOT touch the Figma API, mutate the canvas, write component properties, create
// layers, or resolve tokens. Materialization is a separate, later slice that
// consumes this plan.
//
// The classification is driven by `values.length` and `category` (plus the
// structural facts `suppresses` / `a11y` / `derivesFrom`). It never branches on
// state-value NAMES — that is the lore the whole dimensional-states arc removed.
//
// Where a state cannot be faithfully lowered into a Figma control today, the
// planner emits an explicit RESIDUAL rather than guessing. Residuals are a
// first-class output: they name exactly which descriptor fact is still missing.

export type StateCategory =
  | "interaction"
  | "availability"
  | "selection"
  | "validation"
  | "data"
  | "visibility"
  | "motion"
  | "presentation";

// --- Planner input: a structural subset of a generated Figma descriptor. ---
// (Decoupled from the materializer's descriptor type, which lives in plugin.ts.)

export interface PlannerStateDimension {
  category: StateCategory;
  values: string[];
  initial?: string;
  exclusive?: boolean;
  suppresses?: { categories?: StateCategory[]; names?: string[] };
  a11y?: { attribute: string; values?: Record<string, string | boolean> };
  derivesFrom?: Record<
    string,
    { selector?: string; attr?: string; channel?: string; prop?: string }
  >;
}

export interface PlannerDescriptor {
  component: { name: string };
  states?: { dimensions?: Record<string, PlannerStateDimension> | null };
}

// --- Planner output: a target-neutral Figma realization plan. ---

export type DimensionLowering =
  /** Interaction-phase axis (pointer/focus). A variant/prototype axis, NOT a public component property. */
  | { kind: "interaction-axis"; activeValues: string[] }
  /** >=3 visual values -> a Figma variant axis. */
  | { kind: "variant-axis"; activeValues: string[] }
  /** 2 visual values, toggle-safe -> a Figma boolean component property. */
  | { kind: "boolean-property"; activeValue: string }
  /** Surfaced via a channel (data-state / aria-*), so omitted from Figma controls. */
  | { kind: "channel-bound"; channel: string; values: string[] }
  /** No Figma control surface (degenerate / informational). */
  | { kind: "metadata-only" };

export interface PlannedDimension {
  name: string;
  category: StateCategory;
  cardinality: number;
  activeValues: string[];
  initial?: string;
  lowering: DimensionLowering;
  /** Retained as plan metadata — NOT visual behavior. */
  a11y?: { attribute: string; values?: Record<string, string | boolean> };
}

export interface SuppressionRelation {
  sourceDimension: string;
  sourceValues: string[];
  suppressesCategories: StateCategory[];
  /** Dimensions in THIS component masked by the suppression. */
  suppressedDimensions: string[];
}

export type ResidualCode =
  /** A 2-value semantic dimension that restyles; a Figma boolean property (a
   *  visibility toggle) would be unsound. Lowered as a variant axis instead. */
  | "boolean-refused-restyle"
  /** A dimension mixes channel-driven transition phases with a visual state. */
  | "mixed-channel-and-visual"
  /** A dimension has no active (non-initial) values to plan. */
  | "no-active-values";

export interface Residual {
  dimension: string;
  code: ResidualCode;
  reason: string;
}

export interface FigmaStatePlan {
  component: string;
  dimensions: PlannedDimension[];
  suppressions: SuppressionRelation[];
  residuals: Residual[];
}

// Categories whose active value typically RESTYLES the component (not an
// additive overlay), so a Figma boolean property (a visibility toggle) cannot
// faithfully represent it. Decided by category, never by value name.
const RESTYLE_CATEGORIES: ReadonlySet<StateCategory> = new Set([
  "availability",
  "validation",
  "selection",
]);

function activeValuesOf(dim: PlannerStateDimension): string[] {
  return dim.values.filter((v) => v !== dim.initial);
}

function channelOf(dim: PlannerStateDimension, value: string): string | null {
  return dim.derivesFrom?.[value]?.channel ?? null;
}

/**
 * Plan the Figma component-surface for one descriptor. Pure: same input → same
 * output, no side effects.
 */
export function planFigmaStateSurface(
  descriptor: PlannerDescriptor,
): FigmaStatePlan {
  const component = descriptor.component.name;
  const dims = descriptor.states?.dimensions ?? {};
  const dimNames = Object.keys(dims); // stable: object key insertion order

  const planned: PlannedDimension[] = [];
  const suppressions: SuppressionRelation[] = [];
  const residuals: Residual[] = [];

  for (const name of dimNames) {
    const dim = dims[name];
    const active = activeValuesOf(dim);
    const cardinality = dim.values.length;

    // Partition active values into channel-driven vs visual.
    const channelValues: string[] = [];
    const visualValues: string[] = [];
    let channel: string | null = null;
    for (const v of active) {
      const ch = channelOf(dim, v);
      if (ch) {
        channelValues.push(v);
        channel = channel ?? ch;
      } else {
        visualValues.push(v);
      }
    }

    let lowering: DimensionLowering;

    if (active.length === 0) {
      lowering = { kind: "metadata-only" };
      residuals.push({
        dimension: name,
        code: "no-active-values",
        reason: `${name} has only its initial value; nothing to lower into a Figma control.`,
      });
    } else if (channelValues.length === active.length) {
      // Fully channel-driven (e.g. Dialog openness) -> not a Figma control.
      lowering = { kind: "channel-bound", channel: channel!, values: channelValues };
    } else if (dim.category === "interaction") {
      // Interaction phase (pointer/focus). Kept as separate axes so e.g.
      // hover+focus is representable across dimensions while values within a
      // single interaction axis stay mutually exclusive.
      lowering = { kind: "interaction-axis", activeValues: active };
    } else if (channelValues.length > 0) {
      // Mixed: some channel-driven transition phases + a visual state
      // (e.g. Sheet openness: open is visual; opening/closing are channel-driven).
      lowering = classifyVisual(name, dim, visualValues);
      residuals.push({
        dimension: name,
        code: "mixed-channel-and-visual",
        reason:
          `${name} mixes a visual state (${visualValues.join(", ") || "—"}) with ` +
          `channel-driven transition phases (${channelValues.join(", ")}); ` +
          `the transition phases are omitted from Figma controls.`,
      });
    } else {
      lowering = classifyVisual(name, dim, visualValues);
      if (lowering.kind === "variant-axis" && cardinality === 2 && RESTYLE_CATEGORIES.has(dim.category)) {
        residuals.push({
          dimension: name,
          code: "boolean-refused-restyle",
          reason:
            `${name} is a 2-value ${dim.category} state that restyles the component; ` +
            `a Figma boolean property (visibility toggle) would be unsound. Lowered as a ` +
            `2-variant axis. A descriptor "effect: overlay|restyle" fact would let the ` +
            `planner choose a boolean property definitively.`,
        });
      }
    }

    planned.push({
      name,
      category: dim.category,
      cardinality,
      activeValues: active,
      initial: dim.initial,
      lowering,
      a11y: dim.a11y,
    });

    // Suppression is a cross-dimension RELATION, resolved against this
    // component's dimensions — never a layer deletion. Only the categories the
    // dimension declares (interaction, in practice) are suppressed; semantic
    // dimensions (selection/openness/loading/validation) are never collateral.
    if (dim.suppresses?.categories?.length) {
      const cats = dim.suppresses.categories;
      const suppressedDimensions = dimNames.filter(
        (other) => other !== name && cats.includes(dims[other].category),
      );
      suppressions.push({
        sourceDimension: name,
        sourceValues: active,
        suppressesCategories: cats,
        suppressedDimensions,
      });
    }
  }

  return { component, dimensions: planned, suppressions, residuals };
}

/**
 * Classify a non-interaction, non-fully-channel dimension's VISUAL values into
 * a Figma lowering. Decided by visual cardinality + category, never by name.
 */
function classifyVisual(
  _name: string,
  dim: PlannerStateDimension,
  visualValues: string[],
): DimensionLowering {
  // Effective visual cardinality includes the (visual) initial base.
  const effective = visualValues.length + (dim.initial !== undefined ? 1 : 0);

  if (effective >= 3) {
    return { kind: "variant-axis", activeValues: visualValues };
  }
  // 2 effective values.
  if (RESTYLE_CATEGORIES.has(dim.category) || dim.a11y) {
    // Semantic / restyling 2-value state -> a 2-variant axis, NOT a boolean.
    return { kind: "variant-axis", activeValues: visualValues };
  }
  // Additive/overlay 2-value state (e.g. loading spinner) -> boolean property.
  return { kind: "boolean-property", activeValue: visualValues[0] };
}
