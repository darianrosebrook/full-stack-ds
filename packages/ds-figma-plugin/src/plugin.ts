import {
  figmaComponentRegistry,
  figmaPrimitiveRegistry,
} from "./generated/components/index.js";
import { materializeComponentStateSurface } from "./materialize-state.js";
import type { PlannerStateDimension } from "./planner.js";
import {
  classifyDescriptorForMaterialization,
  COMPONENT_SET_ALLOWLIST,
  type EligibilityReason,
} from "./eligibility.js";
import {
  buildFigmaUiModel,
  type FigmaUiModel,
  type MaterializationReport,
  type UiToPluginMessage,
} from "./ui-model.js";
import {
  generateCodePreviewsForDescriptor,
  getDefaultVariantValues,
  isCodegenTarget,
} from "./codegen-preview.js";

export { classifyDescriptorForMaterialization } from "./eligibility.js";

type FigmaCssBlock = {
  selector: string;
  declarations: Record<string, string>;
};

type FigmaComponentDescriptor = {
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
    defaultExpr?: string | null;
  }>;
  variants: Record<string, string[]>;
  css?: {
    blocks?: FigmaCssBlock[];
  };
  /** Dimensional states — consumed by the planner, not read for state decisions here. */
  states?: { dimensions?: Record<string, PlannerStateDimension> | null };
};

type FigmaStackPrimitiveDescriptor = {
  schemaVersion: number;
  primitive: { kind: string; name: string };
  variants: { variant: string[] };
  figma: { componentSetName: string };
};

type StackVariants = {
  vertical: FigmaComponentNode;
  horizontal: FigmaComponentNode;
};

declare const __html__: string | undefined;

export interface MainOptions {
  /**
   * Headless/test compatibility path (spec invariant 4 + A5): calling
   * `main()` with no options (or `{ autoMaterialize: true }`) still runs the
   * full materialization synchronously and closes the plugin, with no UI
   * round-trip required. The production entry (bottom of this file) calls
   * `main({ autoMaterialize: false })` when running with a UI so it opens
   * the UI and waits for an `fsds:materialize` command instead.
   */
  autoMaterialize?: boolean;
}

export async function main(options: MainOptions = { autoMaterialize: true }): Promise<void> {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  if (!options.autoMaterialize) {
    openUi();
    return;
  }

  const report = await materializeRegistry({ scope: "all" });
  const total = report.materialized.length + report.placeholders.length;
  figma.notify(`Full Stack DS: scaffolded Stack + ${total} component(s).`);
  figma.closePlugin(`Scaffolded Stack + ${total} component(s).`);
}

/**
 * Opens the Svelte plugin UI (dist/ui.html, inlined at build time into
 * `__html__` by `vite.config.ts`'s `inlineUiAssets` plugin — see A5's
 * fallback markup when that file is missing) and wires the
 * fsds:init/fsds:materialize/fsds:resize/fsds:close message loop. The UI is
 * display-and-command only: every `fsds:materialize` command is fulfilled
 * here, plugin-side, through the same `materializeRegistry` /
 * `materializeComponentSet` / `materializeLeafComponent` /
 * `materializeComponentStateSurface` path `main()`'s headless run uses.
 */
function openUi(): void {
  const html =
    typeof __html__ === "string"
      ? __html__
      : "<main>Full Stack DS plugin UI failed to load.</main>";
  figma.showUI(html, { width: 920, height: 720 });
  figma.ui.postMessage({ type: "fsds:init", model: buildFigmaUiModel() } satisfies {
    type: "fsds:init";
    model: FigmaUiModel;
  });
  figma.ui.onmessage = (message: unknown) => {
    handleUiMessage(message as UiToPluginMessage).catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      figma.ui.postMessage({ type: "fsds:error", message: errorMessage });
    });
  };
}

async function handleUiMessage(message: UiToPluginMessage): Promise<void> {
  if (message.type === "fsds:close") {
    figma.closePlugin();
    return;
  }
  if (message.type === "fsds:resize") {
    figma.ui.resize(message.width, message.height);
    return;
  }
  if (message.type === "fsds:materialize") {
    const report = await materializeRegistry({
      scope: message.scope,
      componentName: message.componentName,
    });
    figma.ui.postMessage({
      type: "fsds:materialization-complete",
      report,
    });
    figma.notify(
      `Full Stack DS: ${report.materialized.length} set(s), ${report.placeholders.length} placeholder(s).`,
    );
  }
}

/**
 * Shared materialization body for both the headless run (`main()` with
 * `autoMaterialize: true`) and each UI-driven `fsds:materialize` command.
 * `scope` selects which descriptors are candidates; eligibility per
 * descriptor is still decided by `classifyDescriptorForMaterialization`
 * (the single shared authority in `eligibility.ts`) exactly as before.
 */
async function materializeRegistry({
  scope,
  componentName,
}: {
  scope: "all" | "allowlist" | "selected";
  componentName?: string;
}): Promise<MaterializationReport> {
  const componentsPage = ensurePage("Full Stack DS / Components");
  // Real Figma API: `figma.createComponent()` binds the new node to
  // `figma.currentPage`, and `figma.combineAsVariants(components, parent)`
  // requires the components and the parent to live on the same page.
  // Without switching first, every component-set materialization throws
  // "Grouped nodes must be in the same page as the parent". The mocked
  // test surface doesn't have an implicit page binding for new components,
  // so this only shows up at live execution. Use `setCurrentPageAsync`
  // (the sync `figma.currentPage = page` assignment is a no-op under the
  // dynamic-page documentAccess mode).
  await figma.setCurrentPageAsync(componentsPage);

  const stackVariants = materializeStackPrimitive(componentsPage);
  const descriptors = selectDescriptors(scope, componentName);
  const materialized: string[] = [];
  const placeholders: string[] = [];
  const skipped: string[] = [];
  for (const descriptor of descriptors) {
    const eligibility = classifyDescriptorForMaterialization(descriptor);
    let node: FigmaComponentSetNode | FigmaComponentNode;
    if (eligibility === "component_set_materialized") {
      node = materializeComponentSet(descriptor, componentsPage);
      materialized.push(descriptor.component.name);
    } else if (scope === "allowlist" && !COMPONENT_SET_ALLOWLIST.includes(descriptor.component.name)) {
      skipped.push(descriptor.component.name);
      continue;
    } else {
      const leaf = materializeLeafComponent(descriptor, stackVariants, eligibility);
      componentsPage.appendChild(leaf);
      node = leaf;
      placeholders.push(descriptor.component.name);
    }
    // Plan-driven state surface. The planner is the single source of state
    // semantics; this loop never classifies state dimensions itself.
    materializeComponentStateSurface(node, descriptor);
  }

  return { scope, materialized, placeholders, skipped };
}

function selectDescriptors(
  scope: "all" | "allowlist" | "selected",
  componentName?: string,
): FigmaComponentDescriptor[] {
  const descriptors = Object.values(figmaComponentRegistry) as FigmaComponentDescriptor[];
  if (scope === "all") {
    return descriptors;
  }
  if (scope === "selected") {
    return descriptors.filter((descriptor) => descriptor.component.name === componentName);
  }
  return descriptors.filter((descriptor) =>
    COMPONENT_SET_ALLOWLIST.includes(descriptor.component.name),
  );
}

function ensurePage(name: string): FigmaPageNode {
  const page = figma.createPage();
  page.name = name;
  return page;
}

function materializeStackPrimitive(parent: FigmaPageNode): StackVariants {
  const descriptor = figmaPrimitiveRegistry.Stack as FigmaStackPrimitiveDescriptor;
  const vertical = createStackVariantComponent("variant=vertical", "VERTICAL");
  const horizontal = createStackVariantComponent("variant=horizontal", "HORIZONTAL");
  const set = figma.combineAsVariants([vertical, horizontal], parent);
  set.name = descriptor.figma.componentSetName;
  set.setPluginData("fsds.primitive", "Stack");
  set.setPluginData("fsds.descriptorSchemaVersion", String(descriptor.schemaVersion));
  return { vertical, horizontal };
}

function createStackVariantComponent(
  variantName: string,
  layoutMode: "VERTICAL" | "HORIZONTAL",
): FigmaComponentNode {
  const component = figma.createComponent();
  component.name = variantName;
  component.layoutMode = layoutMode;
  component.itemSpacing = 8;
  component.paddingTop = 8;
  component.paddingRight = 8;
  component.paddingBottom = 8;
  component.paddingLeft = 8;
  component.resize(240, 80);
  return component;
}

function materializeLeafComponent(
  descriptor: FigmaComponentDescriptor,
  stack: StackVariants,
  eligibility: EligibilityReason,
): FigmaComponentNode {
  const component = figma.createComponent();
  component.name = descriptor.component.name;
  component.layoutMode = "VERTICAL";
  component.itemSpacing = 8;
  component.paddingTop = 16;
  component.paddingRight = 16;
  component.paddingBottom = 16;
  component.paddingLeft = 16;
  component.resize(320, 200);

  recordDescriptorPluginData(component, descriptor);
  component.setPluginData("fsds.materializer", "placeholder-leaf");
  component.setPluginData("fsds.eligibility.reason", eligibility);

  const parts = descriptor.anatomy.length > 0
    ? descriptor.anatomy
    : [{ name: "root", layoutVariant: null as "horizontal" | "vertical" | null }];
  for (const part of parts) {
    const variant = part.layoutVariant === "horizontal" ? stack.horizontal : stack.vertical;
    const instance = variant.createInstance();
    instance.name = part.name;
    component.appendChild(instance);
  }

  return component;
}

function recordDescriptorPluginData(
  node: FigmaBaseNode,
  descriptor: FigmaComponentDescriptor,
): void {
  node.setPluginData("fsds.component", descriptor.component.name);
  node.setPluginData("fsds.cssPrefix", descriptor.component.cssPrefix);
  node.setPluginData("fsds.descriptorSchemaVersion", String(descriptor.schemaVersion));
  for (const prop of descriptor.props) {
    node.setPluginData(`fsds.prop.${prop.name}`, JSON.stringify(prop));
  }
  for (const [variantName, values] of Object.entries(descriptor.variants)) {
    node.setPluginData(`fsds.variant.${variantName}`, JSON.stringify(values));
  }
}

/**
 * Records which (axis, value) row a materialized variant component
 * represents, so the Dev Mode codegen handler can later read back the exact
 * variant selection via `fsds.variantRow` (see `getVariantValuesForNode`
 * below) instead of guessing defaults for an already-materialized instance.
 */
function recordVariantRowPluginData(node: FigmaBaseNode, row: VariantRow): void {
  node.setPluginData("fsds.variantRow", JSON.stringify(Object.fromEntries(row.pairs)));
}

/**
 * Generic descriptor-driven materializer. Consumes only:
 *   - `descriptor.variants` (axis name → values) for the variant matrix
 *   - `descriptor.css.blocks` for shallow style facts via semantic
 *     declaration-name matching (no component-specific token literals)
 *   - `descriptor.component.cssPrefix` to locate base + per-variant blocks
 *
 * Does not branch on component name. Does not know about Button-, Chip-,
 * or Status-specific anything. Eligibility is decided by the classifier
 * above; once routed here, materialization is uniform.
 */
function materializeComponentSet(
  descriptor: FigmaComponentDescriptor,
  parent: FigmaPageNode,
): FigmaComponentSetNode {
  const rows = enumerateVariantMatrix(descriptor.variants);
  const blocksBySelector = indexCssBlocks(descriptor.css?.blocks ?? []);
  const baseBlock = blocksBySelector.get(`.${descriptor.component.cssPrefix}`) ?? null;

  const variantComponents: FigmaComponentNode[] = rows.map((row) =>
    createVariantComponent(descriptor, row, blocksBySelector, baseBlock),
  );

  const set = figma.combineAsVariants(variantComponents, parent);
  set.name = descriptor.component.name;
  recordDescriptorPluginData(set, descriptor);
  set.setPluginData("fsds.materializer", "component-set");
  set.setPluginData("fsds.variantMatrix.size", String(rows.length));
  set.setPluginData("fsds.eligibility.reason", "component_set_materialized");
  return set;
}

function createVariantComponent(
  descriptor: FigmaComponentDescriptor,
  row: VariantRow,
  blocksBySelector: Map<string, FigmaCssBlock>,
  baseBlock: FigmaCssBlock | null,
): FigmaComponentNode {
  const prefix = descriptor.component.cssPrefix;
  // For each (axis, value) pair, locate a `.<prefix>--<value>` block. The
  // materializer does not know which axis carries color vs size — it
  // collects every matching block and lets the categorical extractor
  // resolve declarations by semantic name.
  const variantBlocks: FigmaCssBlock[] = [];
  for (const [, value] of row.pairs) {
    const block = blocksBySelector.get(`.${prefix}--${value}`);
    if (block) variantBlocks.push(block);
  }
  // Lookup order: variant-scoped blocks first (more specific), then base.
  // Mirrors CSS cascade specificity for class selectors of equal weight,
  // resolved by source order — variant blocks are emitted after base.
  const lookupOrder: FigmaCssBlock[] = baseBlock
    ? [...variantBlocks, baseBlock]
    : variantBlocks;

  const component = figma.createComponent();
  component.name = formatVariantName(row.pairs);
  // Records fsds.component / fsds.variantRow on the per-variant instance
  // (not just the parent set) so the Dev Mode codegen handler can resolve
  // both the descriptor and the exact selected variant row from a single
  // selected node — see getDescriptorForNode / getVariantValuesForNode.
  recordDescriptorPluginData(component, descriptor);
  recordVariantRowPluginData(component, row);
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";

  const styles = extractShallowStyles(lookupOrder);

  if (styles.paddingBlock !== null) {
    component.paddingTop = styles.paddingBlock;
    component.paddingBottom = styles.paddingBlock;
  }
  if (styles.paddingInline !== null) {
    component.paddingLeft = styles.paddingInline;
    component.paddingRight = styles.paddingInline;
  }
  if (styles.gap !== null) component.itemSpacing = styles.gap;
  if (styles.cornerRadius !== null) component.cornerRadius = styles.cornerRadius;
  if (styles.minHeight !== null) component.minHeight = styles.minHeight;
  if (styles.minHeight !== null) {
    component.resize(Math.max(styles.minHeight * 2.5, 96), styles.minHeight);
  }

  if (styles.backgroundFill) {
    component.fills = [styles.backgroundFill];
  } else if (styles.backgroundIsTransparent) {
    component.fills = [];
  }

  if (styles.borderFill) {
    component.strokes = [styles.borderFill];
    if (styles.strokeWeight !== null) component.strokeWeight = styles.strokeWeight;
  } else if (styles.borderIsTransparent) {
    component.strokes = [];
  }

  const label = figma.createText();
  label.name = "label";
  label.characters = descriptor.component.name;
  if (styles.fontSize !== null) label.fontSize = styles.fontSize;
  if (styles.foregroundFill) label.fills = [styles.foregroundFill];
  component.appendChild(label);

  return component;
}

type VariantRow = {
  pairs: Array<[string, string]>;
};

function enumerateVariantMatrix(
  variants: Record<string, string[]>,
): VariantRow[] {
  const axes = Object.entries(variants).filter(([, values]) => values.length > 0);
  if (axes.length === 0) {
    return [{ pairs: [] }];
  }
  let rows: Array<Array<[string, string]>> = [[]];
  for (const [axis, values] of axes) {
    const next: Array<Array<[string, string]>> = [];
    for (const prefix of rows) {
      for (const value of values) {
        next.push([...prefix, [axis, value]]);
      }
    }
    rows = next;
  }
  return rows.map((pairs) => ({ pairs }));
}

function formatVariantName(pairs: Array<[string, string]>): string {
  if (pairs.length === 0) return "default";
  return pairs.map(([k, v]) => `${k}=${v}`).join(", ");
}

function indexCssBlocks(blocks: FigmaCssBlock[]): Map<string, FigmaCssBlock> {
  const map = new Map<string, FigmaCssBlock>();
  for (const block of blocks) {
    map.set(block.selector, block);
  }
  return map;
}

type ShallowStyles = {
  backgroundFill: FigmaSolidPaint | null;
  backgroundIsTransparent: boolean;
  foregroundFill: FigmaSolidPaint | null;
  borderFill: FigmaSolidPaint | null;
  borderIsTransparent: boolean;
  paddingBlock: number | null;
  paddingInline: number | null;
  gap: number | null;
  cornerRadius: number | null;
  minHeight: number | null;
  strokeWeight: number | null;
  fontSize: number | null;
};

/**
 * Semantic-category style extractor. Walks declarations of each block in
 * specificity order looking for declaration *names* (or top-level CSS
 * properties) that signal a category, and returns the first resolvable
 * value per category.
 *
 * Categories handled:
 *   background / foreground / border (paints)
 *   border-radius / padding-block / padding-inline / gap / font-size /
 *   min-height / border-width (lengths)
 *
 * The extractor knows nothing about `--fsds-button-*` literals; it
 * matches on substrings of declaration names. Components whose CSS
 * blocks don't carry these signals produce variants with omitted
 * styling — that's the correct behavior, not a bug.
 */
function extractShallowStyles(blocks: FigmaCssBlock[]): ShallowStyles {
  return {
    backgroundFill: resolveCategoricalPaint(blocks, [
      "background",
    ]),
    backgroundIsTransparent: hasCategoricalTransparent(blocks, ["background"]),
    foregroundFill: resolveCategoricalPaint(blocks, [
      "foreground",
      "color-text",
      "text-color",
    ]),
    borderFill: resolveCategoricalPaint(blocks, ["border", "stroke"]),
    borderIsTransparent: hasCategoricalTransparent(blocks, [
      "border",
      "stroke",
    ]),
    paddingBlock:
      resolveCategoricalLength(blocks, [
        "padding-block",
        "padding-top",
        "padding-bottom",
        "padding-vertical",
      ]) ?? resolveBarePaddingLength(blocks),
    paddingInline:
      resolveCategoricalLength(blocks, [
        "padding-inline",
        "padding-left",
        "padding-right",
        "padding-horizontal",
      ]) ?? resolveBarePaddingLength(blocks),
    gap: resolveCategoricalLength(blocks, ["gap"]),
    cornerRadius: resolveCategoricalLength(blocks, ["radius", "border-radius"]),
    minHeight: resolveCategoricalLength(blocks, ["min-height", "minheight"]),
    strokeWeight: resolveCategoricalLength(blocks, [
      "border-width",
      "stroke-width",
    ]),
    fontSize: resolveCategoricalLength(blocks, [
      "font-size",
      "fontsize",
      "text-size",
    ]),
  };
}

/**
 * Walks blocks in specificity order. The first declaration whose name
 * matches the category and whose value is *resolvable* (either a hex
 * paint or the literal `transparent`) wins — including `transparent`,
 * which short-circuits as a definitive "no paint" answer rather than
 * falling through to a less specific block. This mirrors CSS cascade
 * semantics: a more-specific selector explicitly saying `transparent`
 * must override the base block's color, not the other way around.
 */
function resolveCategoricalPaint(
  blocks: FigmaCssBlock[],
  categoryHints: string[],
): FigmaSolidPaint | null {
  for (const block of blocks) {
    for (const [name, value] of Object.entries(block.declarations)) {
      if (!declarationMatchesCategory(name, categoryHints)) continue;
      if (isTransparent(value)) return null;
      const paint = resolveSolidPaint(value);
      if (paint) return paint;
    }
  }
  return null;
}

function hasCategoricalTransparent(
  blocks: FigmaCssBlock[],
  categoryHints: string[],
): boolean {
  for (const block of blocks) {
    for (const [name, value] of Object.entries(block.declarations)) {
      if (!declarationMatchesCategory(name, categoryHints)) continue;
      if (isTransparent(value)) return true;
      const paint = resolveSolidPaint(value);
      if (paint) return false;
    }
  }
  return false;
}

function resolveCategoricalLength(
  blocks: FigmaCssBlock[],
  categoryHints: string[],
): number | null {
  for (const block of blocks) {
    for (const [name, value] of Object.entries(block.declarations)) {
      if (!declarationMatchesCategory(name, categoryHints)) continue;
      const px = extractPx(value);
      if (px !== null) return px;
    }
  }
  return null;
}

/**
 * Fallback for components whose CSS uses bare `padding` (a single value
 * applied to all sides) rather than directional padding declarations.
 * Matches any declaration name containing `padding` but excludes
 * direction-qualified names so it doesn't double-count above.
 */
function resolveBarePaddingLength(blocks: FigmaCssBlock[]): number | null {
  const directionalHints = [
    "padding-block",
    "padding-inline",
    "padding-top",
    "padding-bottom",
    "padding-left",
    "padding-right",
    "padding-horizontal",
    "padding-vertical",
  ];
  for (const block of blocks) {
    for (const [name, value] of Object.entries(block.declarations)) {
      const normalized = name.toLowerCase();
      if (!normalized.includes("padding")) continue;
      if (directionalHints.some((hint) => normalized.includes(hint))) continue;
      const px = extractPx(value);
      if (px !== null) return px;
    }
  }
  return null;
}

function declarationMatchesCategory(
  declarationName: string,
  categoryHints: string[],
): boolean {
  const normalized = declarationName.toLowerCase();
  return categoryHints.some((hint) => normalized.includes(hint));
}

const PX_RE = /(-?\d+(?:\.\d+)?)px/;
const REM_RE = /(-?\d+(?:\.\d+)?)rem/;

function extractPx(value: string): number | null {
  const pxMatch = value.match(PX_RE);
  if (pxMatch) return parseFloat(pxMatch[1]);
  const remMatch = value.match(REM_RE);
  if (remMatch) return parseFloat(remMatch[1]) * 16;
  return null;
}

function isTransparent(decl: string | null | undefined): boolean {
  if (!decl) return false;
  return decl.trim() === "transparent";
}

const HEX_RE = /#([0-9a-fA-F]{3,8})\b/;

function resolveSolidPaint(decl: string): FigmaSolidPaint | null {
  if (isTransparent(decl)) return null;
  const match = decl.match(HEX_RE);
  if (!match) return null;
  const rgb = parseHexColor(match[1]);
  if (!rgb) return null;
  return { type: "SOLID", color: rgb };
}

function parseHexColor(
  hex: string,
): { r: number; g: number; b: number } | null {
  let value = hex;
  if (value.length === 3) {
    value = value.split("").map((c) => c + c).join("");
  } else if (value.length === 4) {
    value = value
      .slice(0, 3)
      .split("")
      .map((c) => c + c)
      .join("");
  } else if (value.length === 8) {
    value = value.slice(0, 6);
  } else if (value.length !== 6) {
    return null;
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r: r / 255, g: g / 255, b: b / 255 };
}

/**
 * Dev Mode codegen entry (spec A3). Registered only when
 * `figma.editorType === "dev" && figma.mode === "codegen"` (see the entry
 * branch below) — the materialization/UI path never runs in this mode.
 * Resolves the descriptor + variant-row selection purely from plugin data
 * already written by materialization (`fsds.component`, `fsds.variantRow`);
 * it does not re-run the planner or re-classify eligibility.
 */
function setupCodegen(): void {
  figma.codegen.on("generate", ({ node, language }) => {
    const descriptor = getDescriptorForNode(node);
    if (!descriptor) {
      return [
        {
          title: "Full Stack DS",
          language: "PLAINTEXT",
          code: "No Full Stack DS component contract metadata found for this selection.",
        },
      ];
    }

    const target = isCodegenTarget(language) ? language : "react";
    return generateCodePreviewsForDescriptor(descriptor, {
      target,
      variantValues: getVariantValuesForNode(node, descriptor),
    });
  });
}

function getDescriptorForNode(node: FigmaBaseNode): FigmaComponentDescriptor | null {
  const componentName = node.getPluginData("fsds.component");
  if (!componentName) return null;
  return (
    figmaComponentRegistry as unknown as Record<string, FigmaComponentDescriptor>
  )[componentName] ?? null;
}

/**
 * Honors the stored `fsds.variantRow` plugin data (written per materialized
 * variant instance by `recordVariantRowPluginData`) if present, falling back
 * to the descriptor's default variant values for unknown/unmaterialized
 * selections.
 */
function getVariantValuesForNode(
  node: FigmaBaseNode,
  descriptor: FigmaComponentDescriptor,
): Record<string, string> {
  const stored = safeParseRecord(node.getPluginData("fsds.variantRow"));
  if (stored) return stored;
  return getDefaultVariantValues(descriptor);
}

function safeParseRecord(value: string): Record<string, string> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const record: Record<string, string> = {};
    for (const [key, rawValue] of Object.entries(parsed)) {
      if (typeof rawValue === "string") record[key] = rawValue;
    }
    return record;
  } catch {
    return null;
  }
}

if (typeof figma !== "undefined") {
  if (figma.editorType === "dev" && figma.mode === "codegen") {
    setupCodegen();
  } else {
    main({ autoMaterialize: false }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      figma.notify(`Full Stack DS plugin error: ${message}`);
      figma.closePlugin(`Plugin error: ${message}`);
    });
  }
}
