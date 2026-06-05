// FIGMA-COMPONENT-PROPERTY-MATERIALIZER-01
//
// Plan-driven state-surface materializer. It CONSUMES a FigmaStatePlan (from the
// planner) and lowers it into a Figma component surface: component properties,
// variant/interaction-state structure, and suppression/residual plugin data.
//
// NON-NEGOTIABLE: this module never re-derives state semantics. It branches only
// on `plan` shape (DimensionLowering.kind), NEVER on state-value names
// (checked/disabled/open/selected). The descriptor is read only to feed the
// planner — never to make a state-surface decision here.
//
// No token resolution, no paint/text/effect styling, no live-Figma mutation:
// the materialization is recorded via the (mock-or-real) Figma node surface and
// is asserted under the mocked API.

import {
  planFigmaStateSurface,
  type PlannerDescriptor,
  type FigmaStatePlan,
  type PlannedDimension,
  type SuppressionRelation,
  type Residual,
} from "./planner.js";

/** The Figma node surface the materializer writes to (component or set). */
export interface MaterializeTarget {
  addComponentProperty(
    name: string,
    type: "BOOLEAN" | "VARIANT" | "TEXT" | "INSTANCE_SWAP",
    options?: { defaultValue?: string | boolean; variantOptions?: string[] },
  ): string;
  setPluginData(key: string, value: string): void;
}

const PD = "fsds.state";
const PROP_PREFIX = "State";

/**
 * Run the planner on a descriptor and materialize the resulting plan onto a
 * node. plugin.ts calls this; the planner is the single source of state
 * semantics. Returns the plan (for inspection / evidence).
 */
export function materializeComponentStateSurface(
  node: MaterializeTarget,
  descriptor: PlannerDescriptor,
): FigmaStatePlan {
  const plan = planFigmaStateSurface(descriptor);
  materializeComponentSurface(node, plan);
  return plan;
}

/** Materialize a fully-formed plan onto a node. Pure consumption of `plan`. */
export function materializeComponentSurface(
  node: MaterializeTarget,
  plan: FigmaStatePlan,
): void {
  node.setPluginData(`${PD}.component`, plan.component);
  for (const dimension of plan.dimensions) {
    materializePlannedDimension(node, dimension);
  }
  materializeSuppressionRelations(node, plan.suppressions);
  materializeResiduals(node, plan.residuals);
}

/**
 * Lower a single planned dimension. Each DimensionLowering.kind has an explicit
 * behavior or an explicit omission record (A2). Decisions key off the lowering
 * kind only — never the dimension/value names.
 */
export function materializePlannedDimension(
  node: MaterializeTarget,
  dimension: PlannedDimension,
): void {
  const base = `${PD}.dim.${dimension.name}`;
  node.setPluginData(`${base}.category`, dimension.category);
  node.setPluginData(`${base}.lowering`, dimension.lowering.kind);

  switch (dimension.lowering.kind) {
    case "variant-axis": {
      // Semantic / restyle axis -> a Figma VARIANT property (NOT a boolean).
      const variantOptions = [dimension.initial, ...dimension.lowering.activeValues].filter(
        (v): v is string => typeof v === "string",
      );
      node.addComponentProperty(`${PROP_PREFIX}/${dimension.name}`, "VARIANT", { variantOptions });
      break;
    }
    case "boolean-property": {
      // Planner-approved additive toggle -> a Figma BOOLEAN property.
      node.addComponentProperty(`${PROP_PREFIX}/${dimension.name}`, "BOOLEAN", {
        defaultValue: false,
      });
      node.setPluginData(`${base}.activeValue`, dimension.lowering.activeValue);
      break;
    }
    case "interaction-axis": {
      // Interaction-state structure — recorded as metadata for prototype /
      // interactive-component wiring. Explicitly NOT a public boolean property.
      node.setPluginData(`${base}.interactionValues`, JSON.stringify(dimension.lowering.activeValues));
      break;
    }
    case "channel-bound": {
      // Driven by a channel (data-state / aria-*) -> omitted from controls.
      node.setPluginData(`${base}.channel`, dimension.lowering.channel);
      node.setPluginData(`${base}.omitted`, "true");
      break;
    }
    case "metadata-only": {
      node.setPluginData(`${base}.omitted`, "true");
      break;
    }
  }

  if (dimension.a11y) {
    // a11y is retained as metadata, not visual behavior.
    node.setPluginData(`${base}.a11y`, JSON.stringify(dimension.a11y));
  }
}

/**
 * Record suppression relations as plugin data. Never deletes or suppresses
 * axes — the relation is metadata pointing at the (interaction) dimensions the
 * source masks. (A7)
 */
export function materializeSuppressionRelations(
  node: MaterializeTarget,
  suppressions: SuppressionRelation[],
): void {
  node.setPluginData(`${PD}.suppressions`, JSON.stringify(suppressions));
}

/**
 * Surface residuals as stable plugin data. A residual is recorded EVIDENCE that
 * a state could not be faithfully lowered — never a silent downgrade. (A8)
 */
export function materializeResiduals(node: MaterializeTarget, residuals: Residual[]): void {
  node.setPluginData(`${PD}.residuals`, JSON.stringify(residuals));
}
