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
