/**
 * Framework-neutral projection of the consumer composition surface used by
 * curated usage examples.
 *
 * The contract/IR owns which content paths exist. The usage validator and the
 * showcase renderer consume this serializable projection rather than each
 * guessing from anatomy names or probing framework exports.
 */
import type { ComponentContract } from "./contract.js";
import {
  buildComponentIR,
  hasChildrenPlaceholder,
  nativeTableAttrsFor,
  TABLE_COMPOSITION_TAGS,
  type ComponentIR,
  type PartIR,
} from "./ir.js";

export interface UsageSubcomponentIR {
  /** Exact contract anatomy part name. */
  part: string;
  /** Canonical sidecar reference, for example `fsds.Table.Head`. */
  ref: string;
  /** Props the generated public part surface can consume. */
  allowedProps: string[];
}

export interface UsageCompositionIR {
  rootRef: string;
  acceptsChildren: boolean;
  /** Semantic region that the contract identifies as the default child host. */
  childrenRegion: string | null;
  namedSlots: string[];
  subcomponents: UsageSubcomponentIR[];
  /** JSON sidecar values that require typed runtime materialization. */
  propMaterializers: Record<string, "date" | "date-array">;
}

export interface ParsedUsageRef {
  rootName: string;
  rootRef: string;
  part: string | null;
}

const USAGE_REF = /^fsds\.([A-Z][A-Za-z0-9]*)(?:\.([a-z][A-Za-z0-9]*))?$/;

export function parseUsageRef(ref: string): ParsedUsageRef | null {
  const match = USAGE_REF.exec(ref);
  if (!match) return null;
  return {
    rootName: match[1],
    rootRef: `fsds.${match[1]}`,
    part: match[2] ?? null,
  };
}

/**
 * Regions a curated usage frame supplies with composition content, across
 * both composition dialects: node-level `slots` maps (Field-style, where the
 * frame routes regions through the generated slots prop) and part-suffixed
 * refs (`fsds.Card.actions` children trees). Frame-data-level only — never
 * DOM-inferred (FEAT-SLOT-REQUIRED-USAGE-BINDING-01).
 */
export function collectSuppliedRegions(frameTree: unknown): Set<string> {
  const supplied = new Set<string>();
  visitUsageNode(frameTree, supplied);
  return supplied;
}

function visitUsageNode(node: unknown, out: Set<string>): void {
  if (!node || typeof node !== "object" || Array.isArray(node)) return;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (!key.startsWith("fsds.")) continue;
    const rest = key.slice("fsds.".length);
    const dot = rest.indexOf(".");
    if (dot > 0) out.add(rest.slice(dot + 1));
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const record = value as Record<string, unknown>;
      collectSlotEntries(record.slots, out);
      const props = record.props;
      if (props && typeof props === "object" && !Array.isArray(props)) {
        const propsRecord = props as Record<string, unknown>;
        collectSlotEntries(propsRecord.slots, out);
        const children = propsRecord.children;
        if (Array.isArray(children)) children.forEach((child) => visitUsageNode(child, out));
        else visitUsageNode(children, out);
      }
    }
  }
}

function collectSlotEntries(slots: unknown, out: Set<string>): void {
  if (!slots || typeof slots !== "object" || Array.isArray(slots)) return;
  for (const [region, content] of Object.entries(slots as Record<string, unknown>)) {
    if (content !== undefined && content !== null && content !== false && content !== "") {
      out.add(region);
    }
  }
}

export interface RequiredRegionObligation {
  component: string;
  region: string;
}

/**
 * Consumer-supplied regions whose contract slot declares `required: true` —
 * every curated usage frame must supply them (enforced by the showcase usage
 * audit). "Consumer-supplied" is deliberately NARROWER than the frame-ref
 * validator's public-subcomponent set (which also admits surface anchors,
 * table tags, and compound roles for `fsds.X.Y` reference validity): only
 * anatomy.dom named slot nodes and explicit `subcomponent: true` parts are
 * regions a composing consumer targets. Component-owned required anchors
 * (the anchor-presence sense, e.g. `Checkbox.input`) and the `root` host
 * anchor are excluded (FEAT-SLOT-REQUIRED-USAGE-BINDING-01).
 */
export function deriveRequiredRegionObligations(
  contract: ComponentContract,
): RequiredRegionObligation[] {
  const consumerSupplied = new Set<string>();
  const visitDom = (node: unknown): void => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return;
    const record = node as Record<string, unknown>;
    if (record.tag === "slot" && typeof record.name === "string") {
      consumerSupplied.add(record.name);
    }
    const children = record.children;
    if (Array.isArray(children)) children.forEach(visitDom);
    else if (children && typeof children === "object") visitDom(children);
  };
  const anatomy = contract.anatomy;
  if (anatomy && !Array.isArray(anatomy)) visitDom(anatomy.dom);
  for (const [part, details] of Object.entries(anatomy && !Array.isArray(anatomy) ? anatomy.details ?? {} : {})) {
    if (details && typeof details === "object" && (details as { subcomponent?: unknown }).subcomponent === true) {
      consumerSupplied.add(part);
    }
  }

  const obligations: RequiredRegionObligation[] = [];
  for (const [slot, meta] of Object.entries(contract.slots ?? {})) {
    if (!meta || typeof meta !== "object" || (meta as { required?: unknown }).required !== true) continue;
    if (slot === "root") continue;
    if (!consumerSupplied.has(slot)) continue;
    obligations.push({ component: contract.name, region: slot });
  }
  return obligations;
}

export function deriveUsageComposition(
  contract: ComponentContract,
): UsageCompositionIR {
  return deriveUsageCompositionFromIR(contract, buildComponentIR(contract));
}

export function deriveUsageCompositionFromIR(
  contract: ComponentContract,
  ir: ComponentIR,
): UsageCompositionIR {
  const acceptsChildren = ir.dom ? hasChildrenPlaceholder(ir) : true;
  const namedSlots = new Set<string>();
  if (ir.dom) {
    const visit = (node: ComponentIR["dom"]): void => {
      if (!node) return;
      if (node.tag === "slot" && node.slotName) namedSlots.add(node.slotName);
      for (const child of node.children) visit(child);
    };
    visit(ir.dom);
  }
  const propMaterializers: Record<string, "date" | "date-array"> = {};
  for (const prop of ir.styledProps) {
    if (prop.propType.kind === "ref" && prop.propType.to === "Date") {
      propMaterializers[prop.name] = "date";
    } else if (
      prop.propType.kind === "array" &&
      prop.propType.items.kind === "ref" &&
      prop.propType.items.to === "Date"
    ) {
      propMaterializers[prop.name] = "date-array";
    }
  }

  return {
    rootRef: `fsds.${ir.name}`,
    acceptsChildren,
    childrenRegion: acceptsChildren
      ? contract.a2ui?.children?.slot ?? "children"
      : null,
    namedSlots: [...namedSlots].sort(),
    propMaterializers,
    // Public compound parts come from explicit contract ownership or from a
    // semantic IR family that necessarily emits consumer-composed parts.
    // Legacy name classification alone is never enough.
    subcomponents: ir.parts
      .filter((part) => isPublicSubcomponent(ir, part))
      .map((part) => ({
        part: part.name,
        ref: `fsds.${ir.name}.${part.name}`,
        allowedProps: allowedPartProps(ir, part),
      }))
      .sort((a, b) => a.part.localeCompare(b.part)),
  };
}

function isPublicSubcomponent(ir: ComponentIR, part: PartIR): boolean {
  if (part.isExplicitSubcomponent) return true;
  if (part.nativeTag && TABLE_COMPOSITION_TAGS.has(part.nativeTag) && part.isCompound) {
    return true;
  }
  if (
    ir.surface?.anchor?.part.name === part.name ||
    ir.surface?.content?.part.name === part.name
  ) {
    return true;
  }

  // Stateful compound containers expose their repeated/group, interactive,
  // and region parts for consumer composition. This is the same semantic
  // distinction the framework emitters lower; owned ornaments/wrappers stay
  // excluded even when their historical name appears in COMPOUND_PARTS.
  if (ir.behavior.normalizedChannels.length > 0) {
    const role = part.details?.role;
    return (
      (part.details?.multiple === true && (role === "item" || role === "region")) ||
      (part.details?.interactive === true && (role === "trigger" || role === "item")) ||
      (part.isCompound && role === "group")
    );
  }

  return false;
}

function allowedPartProps(ir: ComponentIR, part: PartIR): string[] {
  const props = new Set(["children", "className", "data-testid"]);
  for (const attr of nativeTableAttrsFor(part.nativeTag)) props.add(attr);

  // These capabilities are derived from semantic part facts, not component
  // names. They mirror the generated compound families' public inputs.
  if (part.details?.interactive) props.add("disabled");
  if (ir.surface?.anchor?.part.name === part.name) props.add("asChild");
  if (
    Object.keys(ir.behavior.channels ?? {}).length > 0 &&
    ["trigger", "item", "region", "content"].includes(
      part.details?.role ?? "",
    )
  ) {
    props.add("value");
  }

  return [...props].sort();
}
