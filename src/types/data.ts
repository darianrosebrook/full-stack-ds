export type Framework = "react" | "vue" | "svelte" | "angular" | "lit";

export interface SourceFile {
  filename: string;
  code: string;
}

export interface ComponentSources {
  component?: SourceFile;
  css?: SourceFile;
  hook?: SourceFile;
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

export interface ComponentBundle {
  name: string;
  contract: ComponentContract;
  contractPath: string;
  sources: Partial<Record<Framework, ComponentSources>>;
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
