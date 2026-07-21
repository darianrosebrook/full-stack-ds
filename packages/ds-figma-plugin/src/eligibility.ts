// FIGMA-PLUGIN-UI-PORT-01
//
// Single eligibility authority. Both `plugin.ts` (materialization) and
// `ui-model.ts` (UI descriptor summaries) import from here — no other module
// may declare `classifyDescriptorForMaterialization` or
// `COMPONENT_SET_ALLOWLIST`. State semantics remain exclusively the
// planner's (`planFigmaStateSurface` in `planner.ts`); this module never
// classifies state dimensions, only whether a descriptor is eligible for the
// generic component-set materializer.

export type FigmaCssBlock = {
  selector: string;
  declarations: Record<string, string>;
};

/**
 * Minimal descriptor shape the classifier needs. Both consumers' richer
 * descriptor types are structurally compatible with this.
 */
export interface EligibilityDescriptor {
  component: {
    name: string;
    cssPrefix: string;
  };
  variants: Record<string, string[]>;
  css?: {
    blocks?: FigmaCssBlock[];
  };
}

/**
 * Components selected for the generic component-set materializer proof.
 * The materializer body does not branch on component name; this allowlist
 * only gates *which* descriptors enter the component-set path versus the
 * placeholder leaf path.
 */
export const COMPONENT_SET_ALLOWLIST: readonly string[] = ["Button", "Chip", "Status"];

export type EligibilityReason =
  | "component_set_materialized"
  | "placeholder_no_variants"
  | "placeholder_missing_css"
  | "placeholder_unsupported_shape"
  | "placeholder_deferred";

/**
 * Selects which materialization path a descriptor takes. The allowlist
 * gates entry to the generic component-set path; eligibility reasons are
 * declarative facts about the descriptor, not policy decisions. The
 * generic materializer does not consume this classifier — once a
 * descriptor enters the component-set path, everything is driven by
 * `descriptor.variants` and `descriptor.css`.
 */
export function classifyDescriptorForMaterialization<
  T extends EligibilityDescriptor,
>(descriptor: T): EligibilityReason {
  const variantAxes = Object.keys(descriptor.variants ?? {}).filter(
    (axis) => descriptor.variants[axis]?.length > 0,
  );
  if (variantAxes.length === 0) {
    return "placeholder_no_variants";
  }
  const blocks = descriptor.css?.blocks ?? [];
  const hasBaseBlock = blocks.some(
    (block) => block.selector === `.${descriptor.component.cssPrefix}`,
  );
  if (!hasBaseBlock) {
    return "placeholder_missing_css";
  }
  if (!COMPONENT_SET_ALLOWLIST.includes(descriptor.component.name)) {
    return "placeholder_deferred";
  }
  return "component_set_materialized";
}
