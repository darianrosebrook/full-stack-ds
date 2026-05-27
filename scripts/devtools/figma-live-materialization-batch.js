/* eslint-disable no-undef -- script body is evaluated inside the Figma web app's page-script context where `figma` is a real global, not at lint time. */
// FIGMA-LIVE-MATERIALIZATION-BATCH-01
//
// Materializer body for live verification via Chrome DevTools
// `evaluate_script` against a logged-in Figma scratch tab. This file
// mirrors the production materializer logic at
// `packages/ds-figma-plugin/src/plugin.ts`. It is NOT bundled at
// runtime — the production plugin uses the TS source. This script
// exists so the live-verification run is reproducible.
//
// Usage (manual, for next time a Figma tab is available):
//   1. node scripts/devtools/bundle-descriptors.mjs > /tmp/fsds-descriptors.json
//   2. Paste the contents of /tmp/fsds-descriptors.json as the value of
//      `const DESCRIPTORS = ...;` below (or splice it in via:
//      `DESCRIPTORS=$(cat /tmp/fsds-descriptors.json) envsubst < this-file`).
//   3. Paste the resulting script into the Figma tab's DevTools
//      `evaluate_script` and inspect the returned evidence object.
//
// If the production materializer at plugin.ts changes, regenerate this
// script from it. Drift between the two should be caught by the
// `// === PRODUCTION-MATERIALIZER-MIRROR ===` markers below — any
// future audit can diff this region against plugin.ts.

const DESCRIPTORS = /* __FSDS_DESCRIPTORS__ */ null;

const ALLOWLIST = ["Button", "Chip", "Status"];

// === PRODUCTION-MATERIALIZER-MIRROR (start) ===

function classifyDescriptor(descriptor) {
  const axes = Object.keys(descriptor.variants || {}).filter(
    (k) => (descriptor.variants[k] || []).length > 0,
  );
  if (axes.length === 0) return "placeholder_no_variants";
  const blocks = (descriptor.css && descriptor.css.blocks) || [];
  const base = `.${descriptor.component.cssPrefix}`;
  if (!blocks.some((b) => b.selector === base)) return "placeholder_missing_css";
  if (!ALLOWLIST.includes(descriptor.component.name)) return "placeholder_deferred";
  return "component_set_materialized";
}

function enumerateVariantMatrix(variants) {
  const axes = Object.entries(variants || {}).filter(([, v]) => v.length > 0);
  if (axes.length === 0) return [{ pairs: [] }];
  let rows = [[]];
  for (const [axis, vals] of axes) {
    const next = [];
    for (const prefix of rows) for (const v of vals) next.push([...prefix, [axis, v]]);
    rows = next;
  }
  return rows.map((pairs) => ({ pairs }));
}

function formatVariantName(pairs) {
  if (pairs.length === 0) return "default";
  return pairs.map(([k, v]) => `${k}=${v}`).join(", ");
}

const PX_RE = /(-?\d+(?:\.\d+)?)px/;
const REM_RE = /(-?\d+(?:\.\d+)?)rem/;
const HEX_RE = /#([0-9a-fA-F]{3,8})\b/;

function extractPx(value) {
  const px = value.match(PX_RE);
  if (px) return parseFloat(px[1]);
  const rem = value.match(REM_RE);
  if (rem) return parseFloat(rem[1]) * 16;
  return null;
}

function isTransparent(v) {
  return !!v && v.trim() === "transparent";
}

function parseHexColor(hex) {
  let v = hex;
  if (v.length === 3) v = v.split("").map((c) => c + c).join("");
  else if (v.length === 4) v = v.slice(0, 3).split("").map((c) => c + c).join("");
  else if (v.length === 8) v = v.slice(0, 6);
  else if (v.length !== 6) return null;
  const r = parseInt(v.slice(0, 2), 16),
    g = parseInt(v.slice(2, 4), 16),
    b = parseInt(v.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r: r / 255, g: g / 255, b: b / 255 };
}

function resolveSolidPaint(decl) {
  if (isTransparent(decl)) return null;
  const m = decl.match(HEX_RE);
  if (!m) return null;
  const rgb = parseHexColor(m[1]);
  return rgb ? { type: "SOLID", color: rgb } : null;
}

function matchCategory(name, hints) {
  const lower = name.toLowerCase();
  return hints.some((h) => lower.includes(h));
}

function resolveCategoricalPaint(blocks, hints) {
  for (const block of blocks) {
    for (const [name, value] of Object.entries(block.declarations)) {
      if (!matchCategory(name, hints)) continue;
      if (isTransparent(value)) return null;
      const paint = resolveSolidPaint(value);
      if (paint) return paint;
    }
  }
  return null;
}

function hasCategoricalTransparent(blocks, hints) {
  for (const block of blocks) {
    for (const [name, value] of Object.entries(block.declarations)) {
      if (!matchCategory(name, hints)) continue;
      if (isTransparent(value)) return true;
      const paint = resolveSolidPaint(value);
      if (paint) return false;
    }
  }
  return false;
}

function resolveCategoricalLength(blocks, hints) {
  for (const block of blocks) {
    for (const [name, value] of Object.entries(block.declarations)) {
      if (!matchCategory(name, hints)) continue;
      const px = extractPx(value);
      if (px !== null) return px;
    }
  }
  return null;
}

function resolveBarePadding(blocks) {
  const directional = [
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
      const lower = name.toLowerCase();
      if (!lower.includes("padding")) continue;
      if (directional.some((h) => lower.includes(h))) continue;
      const px = extractPx(value);
      if (px !== null) return px;
    }
  }
  return null;
}

function extractShallowStyles(blocks) {
  return {
    backgroundFill: resolveCategoricalPaint(blocks, ["background"]),
    backgroundIsTransparent: hasCategoricalTransparent(blocks, ["background"]),
    foregroundFill: resolveCategoricalPaint(blocks, ["foreground", "color-text", "text-color"]),
    borderFill: resolveCategoricalPaint(blocks, ["border", "stroke"]),
    borderIsTransparent: hasCategoricalTransparent(blocks, ["border", "stroke"]),
    paddingBlock:
      resolveCategoricalLength(blocks, ["padding-block", "padding-top", "padding-bottom", "padding-vertical"]) ??
      resolveBarePadding(blocks),
    paddingInline:
      resolveCategoricalLength(blocks, ["padding-inline", "padding-left", "padding-right", "padding-horizontal"]) ??
      resolveBarePadding(blocks),
    gap: resolveCategoricalLength(blocks, ["gap"]),
    cornerRadius: resolveCategoricalLength(blocks, ["radius", "border-radius"]),
    minHeight: resolveCategoricalLength(blocks, ["min-height", "minheight"]),
    strokeWeight: resolveCategoricalLength(blocks, ["border-width", "stroke-width"]),
    fontSize: resolveCategoricalLength(blocks, ["font-size", "fontsize", "text-size"]),
  };
}

function indexBlocks(blocks) {
  const m = new Map();
  for (const b of blocks) m.set(b.selector, b);
  return m;
}

// === PRODUCTION-MATERIALIZER-MIRROR (end) ===

const PLUGIN_DATA_LOG = [];

function safeSetPluginData(node, key, value) {
  try {
    node.setPluginData(key, value);
    PLUGIN_DATA_LOG.push({ ok: true, key });
  } catch (e) {
    PLUGIN_DATA_LOG.push({ ok: false, key, error: String(e?.message || e) });
  }
}

function createStackVariantComponent(name, layoutMode) {
  const c = figma.createComponent();
  c.name = name;
  c.layoutMode = layoutMode;
  c.itemSpacing = 8;
  c.paddingTop = 8;
  c.paddingRight = 8;
  c.paddingBottom = 8;
  c.paddingLeft = 8;
  c.resize(240, 80);
  return c;
}

function materializeStack(parent, descriptor) {
  const v = createStackVariantComponent("variant=vertical", "VERTICAL");
  const h = createStackVariantComponent("variant=horizontal", "HORIZONTAL");
  const set = figma.combineAsVariants([v, h], parent);
  set.name = descriptor.figma.componentSetName;
  safeSetPluginData(set, "fsds.primitive", "Stack");
  return { set, vertical: v, horizontal: h };
}

function createVariantComponent(descriptor, row, blocksBySelector, baseBlock) {
  const prefix = descriptor.component.cssPrefix;
  const variantBlocks = [];
  for (const [, value] of row.pairs) {
    const b = blocksBySelector.get(`.${prefix}--${value}`);
    if (b) variantBlocks.push(b);
  }
  const lookupOrder = baseBlock ? [...variantBlocks, baseBlock] : variantBlocks;
  const styles = extractShallowStyles(lookupOrder);

  const component = figma.createComponent();
  component.name = formatVariantName(row.pairs);
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";

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
  if (styles.minHeight !== null) {
    component.minHeight = styles.minHeight;
    component.resize(Math.max(styles.minHeight * 2.5, 96), styles.minHeight);
  }
  if (styles.backgroundFill) component.fills = [styles.backgroundFill];
  else if (styles.backgroundIsTransparent) component.fills = [];
  if (styles.borderFill) {
    component.strokes = [styles.borderFill];
    if (styles.strokeWeight !== null) component.strokeWeight = styles.strokeWeight;
  } else if (styles.borderIsTransparent) component.strokes = [];

  const label = figma.createText();
  label.name = "label";
  label.characters = descriptor.component.name;
  if (styles.fontSize !== null) label.fontSize = styles.fontSize;
  if (styles.foregroundFill) label.fills = [styles.foregroundFill];
  component.appendChild(label);

  return { component, styles };
}

function materializeComponentSet(descriptor, parent) {
  const rows = enumerateVariantMatrix(descriptor.variants);
  const blocksBySelector = indexBlocks((descriptor.css && descriptor.css.blocks) || []);
  const baseBlock = blocksBySelector.get(`.${descriptor.component.cssPrefix}`) || null;
  const built = rows.map((row) => createVariantComponent(descriptor, row, blocksBySelector, baseBlock));
  const set = figma.combineAsVariants(built.map((b) => b.component), parent);
  set.name = descriptor.component.name;
  safeSetPluginData(set, "fsds.materializer", "component-set");
  safeSetPluginData(set, "fsds.variantMatrix.size", String(rows.length));
  safeSetPluginData(set, "fsds.eligibility.reason", "component_set_materialized");
  return { set, built, rows };
}

function materializeLeaf(descriptor, parent, eligibility) {
  const c = figma.createComponent();
  c.name = descriptor.component.name;
  c.layoutMode = "VERTICAL";
  c.itemSpacing = 8;
  c.paddingTop = 16;
  c.paddingRight = 16;
  c.paddingBottom = 16;
  c.paddingLeft = 16;
  c.resize(320, 200);
  safeSetPluginData(c, "fsds.materializer", "placeholder-leaf");
  safeSetPluginData(c, "fsds.eligibility.reason", eligibility);
  parent.appendChild(c);
  return c;
}

function summarizeChild(child, sampleLabel) {
  return {
    id: child.id,
    name: child.name,
    type: child.type,
    layoutMode: child.layoutMode,
    paddingTop: child.paddingTop,
    paddingLeft: child.paddingLeft,
    minHeight: child.minHeight,
    cornerRadius: child.cornerRadius,
    fillsCount: Array.isArray(child.fills) ? child.fills.length : null,
    firstFillColor:
      Array.isArray(child.fills) && child.fills.length > 0 && child.fills[0].color
        ? child.fills[0].color
        : null,
    strokesCount: Array.isArray(child.strokes) ? child.strokes.length : null,
    childCount: child.children?.length,
    labelText: sampleLabel,
  };
}

function sampleVariantChild(componentSet, name) {
  const child = componentSet.children.find((c) => c.name === name);
  if (!child) return null;
  const textChild = child.children.find((c) => c.type === "TEXT");
  return {
    ...summarizeChild(child, textChild?.characters),
    labelFontSize: textChild?.fontSize,
    labelFillFirstColor:
      textChild && Array.isArray(textChild.fills) && textChild.fills[0]?.color
        ? textChild.fills[0].color
        : null,
  };
}

(async () => {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const page = figma.createPage();
  page.name = "FSDS_LIVE_BATCH";
  // Real Figma API: createComponent() binds nodes to figma.currentPage,
  // and combineAsVariants requires components and parent on the same
  // page. Switching with the async setter (not the synchronous setter,
  // which is a no-op under the dynamic-page documentAccess mode) is
  // required for the batch to succeed.
  await figma.setCurrentPageAsync(page);

  const evidence = {
    pageId: page.id,
    pageName: page.name,
    figmaApi: { editorType: figma.editorType, apiVersion: figma.apiVersion },
    componentSets: {},
    placeholders: {},
    pluginDataSummary: null,
    errors: [],
  };

  try {
    const s = materializeStack(page, DESCRIPTORS.stack);
    evidence.componentSets.Stack = {
      id: s.set.id,
      name: s.set.name,
      childCount: s.set.children.length,
      childNames: s.set.children.map((c) => c.name),
    };
  } catch (e) {
    evidence.errors.push({ where: "Stack", error: String(e?.message || e) });
  }

  for (const key of ["button", "chip", "status"]) {
    const descriptor = DESCRIPTORS[key];
    const eligibility = classifyDescriptor(descriptor);
    try {
      if (eligibility !== "component_set_materialized") {
        evidence.errors.push({
          where: descriptor.component.name,
          error: `Unexpected eligibility ${eligibility}`,
        });
        continue;
      }
      const { set, rows } = materializeComponentSet(descriptor, page);
      const childNames = set.children.map((c) => c.name);
      const sampleNames =
        descriptor.component.name === "Button"
          ? ["size=small, variant=primary", "size=medium, variant=primary", "size=large, variant=primary", "size=medium, variant=tertiary"]
          : descriptor.component.name === "Chip"
          ? ["variant=default, size=small", "variant=selected, size=medium", "variant=dismissible, size=large"]
          : ["status=info", "status=success", "status=error"];
      const summary = {
        id: set.id,
        name: set.name,
        expectedCellCount: rows.length,
        observedChildCount: set.children.length,
        childNames,
        samples: Object.fromEntries(sampleNames.map((n) => [n, sampleVariantChild(set, n)])),
      };
      const cpd = set.componentPropertyDefinitions || null;
      summary.componentPropertyDefinitions = cpd
        ? Object.fromEntries(
            Object.entries(cpd).map(([k, v]) => [
              k,
              { type: v.type, defaultValue: v.defaultValue, variantOptions: v.variantOptions },
            ]),
          )
        : null;
      evidence.componentSets[descriptor.component.name] = summary;
    } catch (e) {
      evidence.errors.push({
        where: descriptor.component.name,
        error: String(e?.message || e),
        stack: e?.stack?.split("\n").slice(0, 5).join(" | "),
      });
    }
  }

  for (const key of ["label", "avatar"]) {
    const descriptor = DESCRIPTORS[key];
    const eligibility = classifyDescriptor(descriptor);
    try {
      const leaf = materializeLeaf(descriptor, page, eligibility);
      evidence.placeholders[descriptor.component.name] = {
        id: leaf.id,
        name: leaf.name,
        eligibility,
        childCount: leaf.children.length,
      };
    } catch (e) {
      evidence.errors.push({
        where: descriptor.component.name,
        error: String(e?.message || e),
      });
    }
  }

  const okCount = PLUGIN_DATA_LOG.filter((e) => e.ok).length;
  const failCount = PLUGIN_DATA_LOG.length - okCount;
  evidence.pluginDataSummary = {
    total: PLUGIN_DATA_LOG.length,
    ok: okCount,
    failed: failCount,
    firstError: PLUGIN_DATA_LOG.find((e) => !e.ok),
  };

  return evidence;
})();
