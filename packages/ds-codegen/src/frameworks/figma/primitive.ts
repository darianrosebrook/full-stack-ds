import {
  FIGMA_COMPONENT_DESCRIPTOR_SOURCE,
} from "./descriptor.js";

export const FIGMA_PRIMITIVE_DESCRIPTOR_SCHEMA_VERSION = 1 as const;

export type FigmaStackPrimitiveDescriptorV1 = {
  schemaVersion: typeof FIGMA_PRIMITIVE_DESCRIPTOR_SCHEMA_VERSION;
  source: typeof FIGMA_COMPONENT_DESCRIPTOR_SOURCE;
  primitive: {
    kind: "stack";
    name: string;
    description: string;
  };
  variants: {
    variant: ["vertical", "horizontal"];
  };
  figma: {
    intendedUse: "figma-library-materialization";
    componentSetName: string;
    propertySource: "primitive contract Stack.variant";
  };
};

export interface StackPrimitiveContract {
  name?: string;
  description?: string;
  props?: Array<{
    name: string;
    kind?: string;
    default?: string;
  }>;
}

export function toFigmaStackPrimitiveDescriptor(
  contract: StackPrimitiveContract,
): FigmaStackPrimitiveDescriptorV1 {
  if (contract.name !== "Stack") {
    throw new Error("Stack primitive contract must declare name: \"Stack\".");
  }
  const variantProp = contract.props?.find((p) => p.name === "variant");
  if (!variantProp || variantProp.kind !== "layoutVariant") {
    throw new Error(
      "Stack primitive contract must declare a 'variant' prop of kind 'layoutVariant'.",
    );
  }
  return {
    schemaVersion: FIGMA_PRIMITIVE_DESCRIPTOR_SCHEMA_VERSION,
    source: FIGMA_COMPONENT_DESCRIPTOR_SOURCE,
    primitive: {
      kind: "stack",
      name: contract.name,
      description: contract.description ?? "",
    },
    variants: {
      variant: ["vertical", "horizontal"],
    },
    figma: {
      intendedUse: "figma-library-materialization",
      componentSetName: "Stack",
      propertySource: "primitive contract Stack.variant",
    },
  };
}

export function assertFigmaStackPrimitiveDescriptorV1(
  descriptor: unknown,
): asserts descriptor is FigmaStackPrimitiveDescriptorV1 {
  if (!isRecord(descriptor)) {
    throw new Error("Figma primitive descriptor must be an object.");
  }
  if (descriptor.schemaVersion !== FIGMA_PRIMITIVE_DESCRIPTOR_SCHEMA_VERSION) {
    throw new Error("Figma primitive descriptor schemaVersion must be 1.");
  }
  if (descriptor.source !== FIGMA_COMPONENT_DESCRIPTOR_SOURCE) {
    throw new Error(
      "Figma primitive descriptor source is not governed by the figma emitter.",
    );
  }
  if (!isRecord(descriptor.primitive)) {
    throw new Error("Figma primitive descriptor primitive block is required.");
  }
  if (descriptor.primitive.kind !== "stack") {
    throw new Error("Figma primitive descriptor primitive.kind must be 'stack'.");
  }
  if (typeof descriptor.primitive.name !== "string" || descriptor.primitive.name.length === 0) {
    throw new Error("Figma primitive descriptor primitive.name must be a non-empty string.");
  }
  if (!isRecord(descriptor.variants)) {
    throw new Error("Figma primitive descriptor variants block is required.");
  }
  const variant = descriptor.variants.variant;
  if (
    !Array.isArray(variant) ||
    variant.length !== 2 ||
    variant[0] !== "vertical" ||
    variant[1] !== "horizontal"
  ) {
    throw new Error(
      "Figma primitive descriptor variants.variant must be ['vertical', 'horizontal'].",
    );
  }
  if (!isRecord(descriptor.figma)) {
    throw new Error("Figma primitive descriptor figma block is required.");
  }
  if (descriptor.figma.intendedUse !== "figma-library-materialization") {
    throw new Error("Figma primitive descriptor figma.intendedUse must be 'figma-library-materialization'.");
  }
  if (typeof descriptor.figma.componentSetName !== "string") {
    throw new Error("Figma primitive descriptor figma.componentSetName must be a string.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
