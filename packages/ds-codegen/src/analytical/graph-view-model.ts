/**
 * The canonical graph-view declaration (REL-GRAPH-VIEW-CANONICAL-01).
 *
 * WHAT THIS IS, and what it deliberately is not. The measured graph meaning — a
 * node universe selected by name, an edge interpretation, and the incidence
 * between them — becomes a FIRST-CLASS DECLARATION with a GRAPH-VALUED result.
 * It is not a `nodeRelation` operand on the existing `graph` derivation, and the
 * reason is the codomain: that derivation is a validator of a declared RELATION
 * (`determinedGrain` retains the input relation's grain because reading it as
 * edges does not change which rows exist), whereas this object's node population
 * can change while the edge relation, its endpoint fields and its grain stay
 * fixed. "The same edge relation with one more validated input" cannot describe
 * a result whose node population varies independently of it.
 *
 * The declaration is authored in `analytical-fixtures/graph-views.json`, parsed
 * and validated against the schema EMITTED from this same zod definition, and
 * consumed by the denotation path in `graph-projection.ts`. One authored
 * declaration of the graph's meaning, one shared interpreter, one graph-valued
 * result.
 */
import * as z from "zod";
import { Name, RelationalStructure } from "./relation-model.js";

/** The two populations a graph view binds, and the fields that carry them. */
export const GraphViewBinding = z
  .strictObject({
    nodes: z.strictObject({ relation: Name, keyField: Name }),
    edges: z.strictObject({ relation: Name, fromField: Name, toField: Name }),
  })
  .meta({
    id: "graph-view-binding",
    description: "The named node universe and the named edge interpretation this view binds into one graph.",
  });

/**
 * A named interpretation of relations. "View" means a named interpretation, not
 * a visual view and not a target-specific representation: the declaration is
 * substrate-neutral and is consumed before any projection is chosen.
 */
export const GraphView = z
  .strictObject({
    id: z.string().regex(/^GV_[A-Z0-9_]+$/),
    binds: GraphViewBinding,
  })
  .meta({
    id: "graph-view",
    title: "Analytical graph view",
    description:
      "A canonical declaration binding a node universe and an edge interpretation into a graph-valued analytical object. Emitted from packages/ds-codegen/src/analytical/graph-view-model.ts; do not edit by hand.",
  });

/**
 * The authored file: the structure, the supplied populations, and the named
 * views over them. The structure and rows are part of the authoring artifact
 * because a view is a declaration ABOUT a source; validating the views while the
 * source they range over lives elsewhere would leave the pair unverifiable.
 */
export const GraphViewFile = z
  .strictObject({
    $comment: z.string().optional(),
    structure: RelationalStructure,
    rows: z.record(z.string(), z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])))),
    views: z.array(GraphView).min(1),
  })
  .meta({ id: "graph-view-file", description: "The authored graph-view collection over one source, validated against the emitted schema." });

export type GraphViewDecl = z.infer<typeof GraphView>;
export type GraphViewFileDecl = z.infer<typeof GraphViewFile>;

/** Where the emitted schema lives, relative to the contracts directory. */
export const GRAPH_VIEW_SCHEMA_FILE = "analytical-fixtures/graph-view.schema.json";

/** The relative path of the authored declarations. */
export const GRAPH_VIEW_AUTHORING_FILE = "analytical-fixtures/graph-views.json";

export function renderGraphViewSchema(): string {
  const json = z.toJSONSchema(GraphViewFile, { target: "draft-7", reused: "inline", unrepresentable: "throw" }) as Record<string, unknown>;
  const { $schema, ...rest } = json;
  return `${JSON.stringify({ $schema: $schema ?? "http://json-schema.org/draft-07/schema#", $id: "graph-view.schema.json", ...rest }, null, 2)}\n`;
}
