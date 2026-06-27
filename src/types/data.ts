export type Framework = "react" | "vue" | "svelte" | "angular" | "lit";

export interface SourceFile {
  filename: string;
  code: string;
}

export interface ComponentSources {
  component?: SourceFile;
  css?: SourceFile;
  hook?: SourceFile;
  /**
   * Every non-test, non-css file in the component's source directory for this
   * framework. Includes the root component, the behavior hook (if any), and
   * any sibling SFC files (e.g. AccordionHeader.vue, AccordionItem.svelte).
   * The preview shells use this to fetch siblings into the iframe so relative
   * imports (`./useFoo`, `./FooBehavior.js`, `./CompoundPart.vue`) resolve.
   */
  siblings: SourceFile[];
}

export interface PropMember {
  name: string;
  type?: string;
  propType?: {
    kind?: string;
    [key: string]: unknown;
  };
  description?: string;
  default?: unknown;
  required?: boolean;
}

export interface PropsBlock {
  description?: string;
  members?: PropMember[];
}

export interface TokenDefinition {
  resolvesTo?: string;
  fallback?: string;
  property?: string;
  layer?: string;
}

export interface DomBinding {
  [attr: string]: string;
}

export interface DomNode {
  tag?: string;
  part?: string;
  bindings?: DomBinding;
  on?: DomBinding;
  children?: DomNode[];
  text?: string;
  if?: string;
}

export interface PartDetails {
  description?: string;
  tag?: string;
  role?:
    | "root"
    | "trigger"
    | "content"
    | "overlay"
    | "item"
    | "group"
    | "label"
    | "decoration"
    | "region"
    | "context";
  multiple?: boolean;
  focusable?: boolean | "roving";
  interactive?: boolean;
  portalTarget?: boolean;
  aria?: {
    role?: string;
    attributes?: string[];
  };
  collapsibleTo?: "native-toggle-affordance" | "native-disclosure";
}

export interface AnatomyDetailed {
  parts: string[];
  description?: string;
  details?: Record<string, PartDetails>;
  dom?: DomNode;
}

export interface A11yKeyboard {
  key: string;
  action: string;
}

export interface A11y {
  role?: string;
  labeling?: string[];
  keyboard?: A11yKeyboard[];
  notes?: string[];
}

export interface ComponentContract {
  $schema?: string;
  name: string;
  description?: string;
  layer: "primitive" | "compound" | "composer" | "assembly";
  cssPrefix?: string;
  anatomy?: string[] | AnatomyDetailed;
  variants?: Record<string, string[]>;
  states?: string[];
  a11y?: A11y;
  tokens?: Record<string, TokenDefinition>;
  props?: Record<string, PropsBlock>;
  types?: Record<string, unknown>;
  behavior?: Record<string, unknown>;
  compoundParts?: unknown;
  /**
   * Behavioral category axis (action/input/surface/feedback/glyph/display/
   * structure). Carried in every contract JSON; surfaced by the Evidence
   * section. Codegen does not consume it.
   */
  category?: string;
  /**
   * Geometry morphology axis (MORPHOLOGY-GEOMETRY-PROFILE-01). Selects a
   * codegen StyleProfile whose boxModelDefaults layer between the box-model
   * primitive and the authored sidecar. Read by the data plugin to build
   * `ComponentBundle.boxModelSurface`.
   */
  morphology?: string;
  /**
   * Agent-facing authoring metadata. Present in all corpus contracts. The
   * A2UI Descriptor section feeds this (plus props/channels/events/form) to
   * `deriveA2UIDescriptor`. Declared optional + untyped-deep so it stays
   * structurally compatible with the deriver's ComponentContractLike without
   * re-exporting its full type graph into the app.
   */
  a2ui?: {
    category: string;
    usageHints?: string[];
    children?: { allowed: boolean; slot?: string; accepts?: string[]; min?: number; max?: number };
  };
  /** Controlled-state channels. Read by A2UI derivation (events surface). */
  channels?: Record<string, unknown>;
  /** Imperative events. Read by A2UI derivation (events surface). */
  events?: Record<string, unknown>;
  /** Form participation; carried through to the A2UI descriptor unchanged. */
  form?: unknown;
}

/**
 * A composition tree node from a `<Name>.usage.jsonl` line.
 *
 * Each node has exactly one `fsds.<ContractName>` key (the cross-component
 * reference). The value carries `props` (literals matching the target
 * contract's declared props) and `slots` (sub-trees keyed by anatomy parts).
 * `children` may be a string, a sub-tree, or an array of either — handled
 * uniformly as `props.children`.
 *
 * Schema lives at `packages/ds-contracts/component.usage.schema.json`;
 * cross-contract resolution (ref/props/slot existence) is enforced by the
 * codegen's `--check-usage` pass before the JSONL reaches the showcase.
 */
export type UsageTreeNode = {
  [fsdsRef: string]: UsageNodeBody;
};

export interface UsageNodeBody {
  props?: Record<string, UsagePropValue>;
  /**
   * Slot content keyed by anatomy part. Most slots hold a sub-tree (another
   * component composed in); slots that naturally hold flat text (description,
   * label, simple trigger labels) may use a string directly to avoid wrapping
   * everything in a no-op fsds.Text.
   */
  slots?: Record<string, UsageTreeNode | string>;
}

export type UsagePropValue =
  | string
  | number
  | boolean
  | null
  | UsageTreeNode
  | Array<string | UsageTreeNode>;

export interface UsageLine {
  name: string;
  description?: string;
  tree: UsageTreeNode;
}

/**
 * One slot of a component's normalized box-model material surface — the same
 * primitive < morphology-profile < authored-sidecar merge codegen realizes
 * into `<Name>.tokens.css`, projected for the showcase with provenance. The
 * editor inspects THIS, never raw sidecar presence: a component without
 * authored `box-model.*` keys still has a full surface, it is just inherited.
 */
export interface BoxModelSurfaceSlot {
  /** Slot name from the closed pool (e.g. `box-model.min-height`). */
  slot: string;
  /** Dotted token-graph path, when the winning layer binds a token. */
  resolvesTo?: string;
  /** `var()` fallback paired with `resolvesTo`. */
  fallback?: string;
  /** Intentional literal value (mutually exclusive with resolvesTo). */
  literal?: string;
  layer?: "core" | "semantic" | "brand" | "density";
  /** Which merge layer supplied the winning value. */
  source: "authored" | "morphology-profile" | "primitive-default";
}

export interface ComponentBundle {
  name: string;
  contract: ComponentContract;
  contractPath: string;
  sources: Partial<Record<Framework, ComponentSources>>;
  /**
   * Curated composition examples loaded from `<Name>.usage.jsonl`. One entry
   * per line. Empty array when no sidecar exists; downstream renderers should
   * treat that as "no examples to show" without erroring.
   */
  usage: UsageLine[];
  /**
   * Normalized box-model material surface (see BoxModelSurfaceSlot). Computed
   * at bundle-build time by the data plugin using the codegen merge as the
   * single authority. Always the full closed slot pool.
   */
  boxModelSurface: BoxModelSurfaceSlot[];
}

export interface PrimitiveBundle {
  name: string;
  contract: unknown;
  sources: Partial<Record<Framework, SourceFile[]>>;
}

/**
 * Flattened entry for one leaf node in a foundation or brand token JSON.
 *
 * Paths are dotted (e.g. `color.palette.red.500`, `color.foreground.accent`).
 * `value` may be a CSS literal (`#d9292b`), a token reference (`{path.to.other}`),
 * or undefined for branches that only carry `$extensions`. `valueByMode`
 * captures the resolved light/dark split when present so the page can preview
 * both without re-running the resolver.
 */
export interface FoundationToken {
  layer: "core" | "semantic" | "brand";
  /** Dotted path, no `core.`/`semantic.`/brand-name prefix. */
  path: string;
  type?: string;
  description?: string;
  /** Resolved CSS value, or a `{ref}` string if the source still references another token. */
  value?: string;
  /** When the resolved value differs by color mode (light/dark). */
  valueByMode?: { light?: string; dark?: string };
  /** Other extension keys mirrored verbatim so consumers can show palette/mode paths. */
  extensions?: Record<string, unknown>;
}

export interface BrandTokenSet {
  /** Brand id matching the filename stem (`default`, `ocean`, ...). */
  id: string;
  name: string;
  description?: string;
  accent?: string;
  density?: string;
  tokens: FoundationToken[];
}

export interface Bundle {
  components: ComponentBundle[];
  primitives: PrimitiveBundle[];
  schema: unknown;
  tokensCss: string;
  /** Flat list of every leaf token under `core.*` and `semantic.*` from `resolved.tokens.json`. */
  foundationTokens: FoundationToken[];
  /** One entry per brand file under `packages/ds-tokens/src/brands/`. */
  brandTokens: BrandTokenSet[];
  generatedAt: number;
}
