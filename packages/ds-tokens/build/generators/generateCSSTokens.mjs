#!/usr/bin/env node
// Generate component-scoped CSS custom properties from component token JSON files
// Usage: node utils/designTokens/generateCSSTokens.mjs

import fs from "fs";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..", "..");

const COMPONENTS_DIR = path.join(projectRoot, "ui");
const SYSTEM_TOKENS_PATH = path.join(COMPONENTS_DIR, "designTokens.json");

/**
 * Convert DTCG 1.0 structured color value to CSS string
 */
function colorValueToCSS(colorValue) {
  const { colorSpace, components, alpha } = colorValue;
  const hasAlpha = alpha !== undefined && alpha < 1;

  // Convert to RGB first for most color spaces
  let rgb = null;

  if (colorSpace === "srgb" && components.length >= 3) {
    rgb = {
      r: Math.round(components[0] * 255),
      g: Math.round(components[1] * 255),
      b: Math.round(components[2] * 255),
    };
  }

  if (!rgb) {
    // Fallback: construct CSS color string directly
    return `${colorSpace}(${components.join(" ")}${
      hasAlpha ? ` / ${alpha}` : ""
    })`;
  }

  // Convert to hex (default format for component tokens)
  const toHex = (n) => n.toString(16).padStart(2, "0");
  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  return hasAlpha && alpha !== undefined
    ? hex + toHex(Math.round(alpha * 255))
    : hex;
}

/**
 * Convert DTCG 1.0 structured dimension value to CSS string
 */
function dimensionValueToCSS(dimensionValue) {
  return `${dimensionValue.value}${dimensionValue.unit}`;
}

/**
 * Check if value is a structured color value
 */
function isStructuredColorValue(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    "colorSpace" in value &&
    "components" in value &&
    Array.isArray(value.components)
  );
}

/**
 * Check if value is a structured dimension value
 */
function isStructuredDimensionValue(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "unit" in value &&
    typeof value.value === "number" &&
    typeof value.unit === "string"
  );
}

/**
 * Determine if a token path belongs to semantic or core namespace based on patterns
 * This matches the logic in utils/designTokens/core/index.ts
 */
function determineNamespace(tokenPath) {
  // Already prefixed
  if (tokenPath.startsWith("core.")) return "core";
  if (tokenPath.startsWith("semantic.")) return "semantic";

  // Core token patterns (these are primitives/palettes)
  const corePatterns = [
    /^color\.(mode|palette|datavis)/, // color.mode.*, color.palette.*, color.datavis.*
    /^typography\.(fontFamily|weight|ramp|lineHeight|letterSpacing|features)/, // typography.fontFamily.*, typography.weight.*, etc.
    /^spacing\.size/, // spacing.size.*
    /^elevation\.(level|offset|blur|spread)/, // elevation.level.*, elevation.offset.*, etc.
    /^opacity\.(50|100|200|300|400|500|600|700|800|900|full)/, // opacity.50, opacity.100, etc.
    /^dimension\.(breakpoint|tapTarget|actionMinHeight)/, // dimension.breakpoint.*, etc.
    /^shape\.(radius|borderWidth|borderStyle|border\.width|border\.style)/, // shape.radius.*, shape.borderWidth.*, shape.border.width.*, etc.
    /^motion\.(duration|easing|keyframes|delay|stagger)/, // motion.duration.*, motion.easing.*, etc.
    /^scale\./, // scale.*
    /^density\./, // density.*
    /^layer\./, // layer.*
    /^layout\./, // layout.*
    /^icon\./, // icon.*
    /^effect\./, // effect.*
  ];

  // If it matches core patterns, it's core
  if (corePatterns.some((pattern) => pattern.test(tokenPath))) {
    return "core";
  }

  // Everything else is semantic (foreground, background, border, action, feedback, etc.)
  return "semantic";
}

/**
 * Convert token path to CSS custom property name with namespace prefix
 * This matches the logic in utils/designTokens/core/index.ts
 */
function tokenPathToCSSVar(tokenPath, prefix = "--") {
  // Determine namespace
  const namespace = determineNamespace(tokenPath);

  // Remove namespace prefix if present (we'll add it back)
  const pathWithoutNamespace = tokenPath.replace(/^(core|semantic)\./, "");

  // Convert path to CSS variable format
  const cssVarName = pathWithoutNamespace
    .replace(/\./g, "-") // Convert dots to hyphens first
    .replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) // Convert camelCase
    .replace(/[\s_]/g, "-") // Convert spaces and underscores
    .replace(/[^a-z0-9-]/g, "") // Remove any remaining invalid characters
    .replace(/-+/g, "-"); // Collapse multiple hyphens into one

  // Add namespace prefix if determined
  const namespacePrefix = namespace ? `${namespace}-` : "";

  return prefix + namespacePrefix + cssVarName;
}

/**
 * Convert a token reference string like "{semantic.color.background.primary}"
 * into a CSS variable reference using the same naming convention as the global generator.
 * Also handles DTCG 1.0 structured values (color and dimension objects).
 */
function refToCssVar(value) {
  // Handle DTCG 1.0 structured values
  if (isStructuredColorValue(value)) {
    return colorValueToCSS(value);
  }

  if (isStructuredDimensionValue(value)) {
    return dimensionValueToCSS(value);
  }

  // Handle string values (references or literals)
  if (typeof value === "string") {
    const refMatch = value.match(/^\{([^}]+)\}$/);
    if (!refMatch) return value; // literal value (number/dimension/string)
    const tokenPath = refMatch[1];

    // Use the same CSS variable naming convention as the global generator
    // This now includes namespace prefixes (--fsds-semantic- or --fsds-core-)
    const cssVarName = tokenPathToCSSVar(tokenPath);

    return `var(${cssVarName})`;
  }

  // Handle numbers and other primitives
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  // Fallback: convert to string
  return String(value);
}

/**
 * Convert camelCase string to kebab-case
 * Example: "paddingY" -> "padding-y", "maxWidth" -> "max-width"
 */
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * Normalize a path segment array to kebab-case
 * Converts camelCase keys to kebab-case for CSS custom property naming
 */
function normalizePathToKebab(pathSegments) {
  return pathSegments.map((segment) => camelToKebab(segment)).join("-");
}

/**
 * Walk a nested token object producing a grouped structure with flat tokens
 * Returns: { groups: { groupName: { tokens: {}, path: [] } }, flat: {} }
 */
function flattenTokens(obj, prefixSegments) {
  const groups = {};
  const flat = {};

  for (const [key, val] of Object.entries(obj)) {
    const nextPath = [...prefixSegments, key];

    // Check if this is a structured DTCG 1.0 value (don't flatten these)
    if (isStructuredColorValue(val) || isStructuredDimensionValue(val)) {
      const tokenName = normalizePathToKebab(nextPath);
      flat[tokenName] = val;
      continue;
    }

    if (val && typeof val === "object" && !Array.isArray(val)) {
      // This is a group - recurse and collect its tokens
      const result = flattenTokens(val, nextPath);

      // If this is a top-level group (depth 1), create a group entry
      if (prefixSegments.length === 0) {
        const groupTokens = {};
        Object.entries(result.flat).forEach(([tokenName, tokenValue]) => {
          groupTokens[tokenName] = tokenValue;
          flat[tokenName] = tokenValue;
        });

        groups[key] = {
          tokens: groupTokens,
          path: nextPath,
        };
      } else {
        // Nested object - merge into parent
        Object.assign(flat, result.flat);
        Object.assign(groups, result.groups);
      }
    } else {
      // Leaf token - normalize to kebab-case
      const tokenName = normalizePathToKebab(nextPath);
      flat[tokenName] = val;
    }
  }

  return { groups, flat };
}

/**
 * Build CSS content for a component's tokens — emits an unlayered rule
 * scoped to `[data-ds-component="Pascal"]`. Custom properties are
 * prefixed with `--ds-<component>-` per the migration playbook.
 *
 * Intentionally NOT wrapped in `@layer components`. Unlayered rules
 * beat the unlayered CSS reset (`* { padding: 0; min-height: 0; }`)
 * via specificity, where `[data-ds-component="X"].class` (0,2,1)
 * out-specifies the universal selector (0,0,0). Putting the component
 * rules in a layer would lose that specificity battle because layered
 * rules always lose to unlayered ones, regardless of selector weight.
 *
 * Per docs/CSS-MIGRATION-PLAYBOOK.md.
 */
function buildCssForComponent({ cssVarPrefix, pascalComponent, tokenData }) {
  const { groups, flat } = tokenData;
  // Body lines live at column 2 (one level inside the selector).
  const body = [];

  // Process groups first
  if (Object.keys(groups).length > 0) {
    Object.entries(groups).forEach(([groupName, groupData]) => {
      const groupTitle = groupName.charAt(0).toUpperCase() + groupName.slice(1);
      body.push(`  /* === ${groupTitle} Tokens === */`);

      Object.entries(groupData.tokens).forEach(([name, raw]) => {
        body.push(`  --ds-${cssVarPrefix}-${name}: ${refToCssVar(raw)};`);
      });

      body.push("");
    });
  }

  // Top-level tokens that aren't in any group
  const topLevelTokens = {};
  for (const [key, val] of Object.entries(flat)) {
    let inGroup = false;
    for (const groupData of Object.values(groups)) {
      if (key in groupData.tokens) {
        inGroup = true;
        break;
      }
    }
    if (!inGroup) {
      topLevelTokens[key] = val;
    }
  }

  if (Object.keys(topLevelTokens).length > 0) {
    if (Object.keys(groups).length > 0) {
      body.push("  /* === Other Tokens === */");
    }
    Object.entries(topLevelTokens).forEach(([name, raw]) => {
      body.push(`  --ds-${cssVarPrefix}-${name}: ${refToCssVar(raw)};`);
    });
  } else if (Object.keys(groups).length === 0) {
    Object.entries(flat).forEach(([name, raw]) => {
      body.push(`  --ds-${cssVarPrefix}-${name}: ${refToCssVar(raw)};`);
    });
  }

  // Trim trailing blank
  if (body[body.length - 1] === "") {
    body.pop();
  }

  return [`[data-ds-component="${pascalComponent}"] {`, ...body, `}`].join(
    "\n",
  );
}

function findTokenJsonFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of items) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTokenJsonFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".tokens.json")) {
      results.push(full);
    }
  }
  return results;
}

function run() {
  // Validate system tokens exist (not strictly required for ref mode)
  if (!fs.existsSync(SYSTEM_TOKENS_PATH)) {
    console.warn(
      "[tokens] Warning: ui/designTokens/designTokens.json not found. Proceeding with reference output.",
    );
  }

  const tokenFiles = findTokenJsonFiles(COMPONENTS_DIR);
  if (tokenFiles.length === 0) {
    console.log("[tokens] No component token files found.");
    return;
  }

  let generatedCount = 0;
  for (const filePath of tokenFiles) {
    try {
      const folder = path.dirname(filePath);
      const folderName = path.basename(folder);
      const raw = fs.readFileSync(filePath, "utf8");
      const json = JSON.parse(raw);
      const prefix = json.prefix;
      const tokens = json.tokens || {};

      if (!prefix || !tokens || typeof tokens !== "object") {
        console.warn(
          `[tokens] Skipping ${path.relative(projectRoot, filePath)} — missing prefix or tokens.`,
        );
        continue;
      }

      const tokenData = flattenTokens(tokens, []);
      const pascalComponent = toPascalCase(prefix);
      const css = buildCssForComponent({
        cssVarPrefix: prefix,
        pascalComponent,
        tokenData,
      });

      const filePrefix =
        pascalComponent === folderName ? folderName : capitalize(prefix);
      const outPath = path.join(folder, `${filePrefix}.tokens.css`);
      const banner = `/* AUTO-GENERATED: Do not edit directly.\n * Source: ${path.relative(projectRoot, filePath)}\n */\n`;
      fs.writeFileSync(outPath, banner + css + "\n", "utf8");
      generatedCount += 1;
      console.log(`[tokens] Generated ${path.relative(projectRoot, outPath)}`);
    } catch (err) {
      console.error(`[tokens] Failed processing ${filePath}:`, err);
    }
  }

  console.log(`[tokens] Completed. Generated ${generatedCount} file(s).`);
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPascalCase(str) {
  return String(str)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => capitalize(part))
    .join("");
}

run();
