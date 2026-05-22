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
  type: string;
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
  tokens?: Record<string, Record<string, TokenDefinition>>;
  props?: Record<string, PropsBlock>;
  types?: Record<string, unknown>;
  behavior?: Record<string, unknown>;
  compoundParts?: unknown;
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
  slots?: Record<string, UsageTreeNode>;
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
}

export interface PrimitiveBundle {
  name: string;
  contract: unknown;
  sources: Partial<Record<Framework, SourceFile[]>>;
}

export interface Bundle {
  components: ComponentBundle[];
  primitives: PrimitiveBundle[];
  schema: unknown;
  tokensCss: string;
  generatedAt: number;
}
