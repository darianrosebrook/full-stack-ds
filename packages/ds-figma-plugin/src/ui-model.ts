// FIGMA-PLUGIN-UI-PORT-01
//
// Display-only projection of the descriptor registry for the plugin UI. This
// module never mutates Figma documents and never makes materialization
// decisions on its own — `classifyDescriptorForMaterialization` and
// `COMPONENT_SET_ALLOWLIST` are imported from `eligibility.ts`, the single
// shared authority also consumed by `plugin.ts`. State semantics are
// exclusively the planner's; nothing here re-derives state dimensions.

import { figmaComponentRegistry } from "./generated/components/index.js";
import {
  classifyDescriptorForMaterialization,
  type EligibilityReason,
  type FigmaCssBlock,
} from "./eligibility.js";

export type MaterializationStatus = EligibilityReason;

export type AuditSeverity = "ok" | "warning" | "blocked";

export type { FigmaCssBlock };

export interface FigmaComponentDescriptor {
  schemaVersion: number;
  component: {
    name: string;
    cssPrefix: string;
    rootElement?: string;
    effectiveRole?: string | null;
  };
  anatomy: Array<{
    name: string;
    layoutVariant?: "horizontal" | "vertical" | null;
  }>;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string | null;
    defaultExpr?: string | null;
  }>;
  variants: Record<string, string[]>;
  states?: unknown;
  behavior?: {
    channels?: unknown;
    dismissalTriggers?: unknown;
    events?: unknown;
    form?: unknown;
    focus?: unknown;
    portal?: unknown;
  };
  surface?: unknown;
  css?: {
    blocks?: FigmaCssBlock[];
  };
  figma?: {
    documentationFrame?: string;
    componentSetName?: string;
    propertySource?: string;
  };
}

export interface ComponentAuditItem {
  severity: AuditSeverity;
  label: string;
  detail: string;
}

export interface ComponentSummary {
  name: string;
  cssPrefix: string;
  rootElement: string;
  effectiveRole: string | null;
  propCount: number;
  requiredPropCount: number;
  anatomyCount: number;
  variantAxes: Array<{ name: string; values: string[] }>;
  variantCellCount: number;
  cssBlockCount: number;
  hasBaseCssBlock: boolean;
  materializationStatus: MaterializationStatus;
  audit: ComponentAuditItem[];
  descriptor: FigmaComponentDescriptor;
}

export interface FigmaUiModel {
  generatedAt: string;
  componentCount: number;
  componentSetCount: number;
  placeholderCount: number;
  blockedCount: number;
  summaries: ComponentSummary[];
}

export type PluginToUiMessage =
  | { type: "fsds:init"; model: FigmaUiModel }
  | { type: "fsds:materialization-complete"; report: MaterializationReport }
  | { type: "fsds:error"; message: string };

export type UiToPluginMessage =
  | { type: "fsds:materialize"; scope: "allowlist" | "selected"; componentName?: string }
  | { type: "fsds:resize"; width: number; height: number }
  | { type: "fsds:close" };

export interface MaterializationReport {
  scope: "all" | "allowlist" | "selected";
  materialized: string[];
  placeholders: string[];
  skipped: string[];
}

export function buildFigmaUiModel(): FigmaUiModel {
  const summaries = Object.values(figmaComponentRegistry)
    .map((descriptor) =>
      summarizeDescriptor(descriptor as unknown as FigmaComponentDescriptor),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    generatedAt: new Date().toISOString(),
    componentCount: summaries.length,
    componentSetCount: summaries.filter(
      (summary) => summary.materializationStatus === "component_set_materialized",
    ).length,
    placeholderCount: summaries.filter(
      (summary) => summary.materializationStatus !== "component_set_materialized",
    ).length,
    blockedCount: summaries.filter((summary) =>
      summary.audit.some((item) => item.severity === "blocked"),
    ).length,
    summaries,
  };
}

function summarizeDescriptor(
  descriptor: FigmaComponentDescriptor,
): ComponentSummary {
  const variantAxes = Object.entries(descriptor.variants ?? {})
    .filter(([, values]) => values.length > 0)
    .map(([name, values]) => ({ name, values }));
  const materializationStatus = classifyDescriptorForMaterialization(descriptor);
  const baseCss = hasBaseCssBlock(descriptor);
  const audit = buildAudit(descriptor, materializationStatus, baseCss);

  return {
    name: descriptor.component.name,
    cssPrefix: descriptor.component.cssPrefix,
    rootElement: descriptor.component.rootElement ?? "unknown",
    effectiveRole: descriptor.component.effectiveRole ?? null,
    propCount: descriptor.props.length,
    requiredPropCount: descriptor.props.filter((prop) => prop.required).length,
    anatomyCount: descriptor.anatomy.length,
    variantAxes,
    variantCellCount: countVariantCells(variantAxes),
    cssBlockCount: descriptor.css?.blocks?.length ?? 0,
    hasBaseCssBlock: baseCss,
    materializationStatus,
    audit,
    descriptor,
  };
}

function hasBaseCssBlock(descriptor: FigmaComponentDescriptor): boolean {
  return (descriptor.css?.blocks ?? []).some(
    (block) => block.selector === `.${descriptor.component.cssPrefix}`,
  );
}

function countVariantCells(
  axes: Array<{ name: string; values: string[] }>,
): number {
  if (axes.length === 0) return 0;
  return axes.reduce((total, axis) => total * axis.values.length, 1);
}

function buildAudit(
  descriptor: FigmaComponentDescriptor,
  status: MaterializationStatus,
  baseCss: boolean,
): ComponentAuditItem[] {
  const items: ComponentAuditItem[] = [];
  const variantAxes = Object.keys(descriptor.variants ?? {}).filter(
    (axis) => descriptor.variants[axis]?.length > 0,
  );
  if (status === "component_set_materialized") {
    items.push({
      severity: "ok",
      label: "Component set path",
      detail: "Descriptor is allowlisted and has variants plus base CSS.",
    });
  } else if (status === "placeholder_deferred") {
    items.push({
      severity: "warning",
      label: "Allowlist deferred",
      detail: "Descriptor has enough shape for review but is not yet allowlisted.",
    });
  } else if (status === "placeholder_no_variants") {
    items.push({
      severity: "warning",
      label: "No variant matrix",
      detail: "Descriptor has no variant axes, so it currently becomes a placeholder leaf.",
    });
  } else if (status === "placeholder_missing_css") {
    items.push({
      severity: "blocked",
      label: "Missing base CSS",
      detail: "No base CSS block matches the descriptor cssPrefix.",
    });
  }

  if (!baseCss) {
    items.push({
      severity: "blocked",
      label: "Base style disconnected",
      detail: `Expected a .${descriptor.component.cssPrefix} block in descriptor.css.blocks.`,
    });
  }

  if (variantAxes.length > 0 && !hasVariantCssBlocks(descriptor)) {
    items.push({
      severity: "warning",
      label: "Variant styles shallow",
      detail: "Variant axes exist, but no matching per-value CSS blocks were found.",
    });
  }

  if (descriptor.props.length > 0) {
    items.push({
      severity: "warning",
      label: "Props metadata only",
      detail: "Props are recorded as metadata; boolean/text component properties are not materialized yet.",
    });
  }

  return items;
}

function hasVariantCssBlocks(descriptor: FigmaComponentDescriptor): boolean {
  const selectors = new Set(
    (descriptor.css?.blocks ?? []).map((block) => block.selector),
  );
  return Object.values(descriptor.variants ?? {}).some((values) =>
    values.some((value) =>
      selectors.has(`.${descriptor.component.cssPrefix}--${value}`),
    ),
  );
}
