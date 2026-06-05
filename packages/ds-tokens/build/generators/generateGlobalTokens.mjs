#!/usr/bin/env node
// Global token generator (JS version)
// - Reads ui/designTokens/designTokens.json
// - Emits app/designTokens.scss with :root, .light, .dark, and prefers-color-scheme: dark blocks

import fs from "fs";
import path from "path";
import url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const TOKENS_PATH = path.join(
  PROJECT_ROOT,
  "ui",
  "designTokens",
  "designTokens.json",
);
const OUTPUT_PATH = path.join(PROJECT_ROOT, "app", "designTokens.scss");

// Global sets for reference validation
const definedVars = new Set();
const referencedVars = new Set();

function readTokens() {
  try {
    const raw = fs.readFileSync(TOKENS_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        `[tokens] Missing ${path.relative(PROJECT_ROOT, TOKENS_PATH)}`,
      );
    } else if (error instanceof SyntaxError) {
      console.error(
        `[tokens] JSON parse error in ${path.relative(PROJECT_ROOT, TOKENS_PATH)}:`,
      );
      console.error(`  ${error.message}`);
    } else {
      console.error(
        `[tokens] Error reading ${path.relative(PROJECT_ROOT, TOKENS_PATH)}:`,
        error.message,
      );
    }
    process.exit(1);
  }
}

function tokenPathToCSSVar(pathStr) {
  const kebab = String(pathStr)
    .replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())
    .replace(/\./g, "-");
  return `--${kebab}`;
}

function resolveNode(node, pathStr, theme, typeHint) {
  let raw = node;
  let provenance = "default";

  if (raw && typeof raw === "object" && "$value" in raw) {
    raw = raw.$value;
  }

  if (node && typeof node === "object" && "$extensions" in node) {
    const ext = node.$extensions || {};

    // Apply theme-based extensions first
    const key = `fsds.${theme}`;
    if (
      ext &&
      typeof ext === "object" &&
      key in ext &&
      typeof ext[key] === "string"
    ) {
      raw = ext[key];
      provenance = `$extensions.${key}`;
    }

    // Generic calc override
    if (ext && typeof ext === "object" && "design.calc" in ext) {
      let expr = ext["design.calc"];
      if (typeof expr === "string") {
        provenance = "$extensions.design.calc";
        return {
          value: expr.replace(
            /\{([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+)\}/g,
            (_, refPath) => {
              const v = tokenPathToCSSVar(refPath);
              referencedVars.add(v);
              return `var(${v})`;
            },
          ),
          provenance,
        };
      }
    }

    // Backward-compat: heading-specific scale
    if (ext && typeof ext === "object" && "fsds.scale.heading" in ext) {
      const scaleConfig = ext["fsds.scale.heading"];
      if (scaleConfig && typeof scaleConfig === "object") {
        const vw = scaleConfig.vw;
        const vh = scaleConfig.vh;

        if (vw && vh && "$value" in vw && "$value" in vh) {
          const vwValue = vw.$value;
          const vhValue = vh.$value;

          // Convert the base value to a CSS variable reference if it's a token reference
          let baseValue = raw;
          if (typeof baseValue === "string") {
            baseValue = baseValue.replace(/\{([^}]+)\}/g, (_, refPath) => {
              const v = tokenPathToCSSVar(refPath);
              referencedVars.add(v);
              return `var(${v})`;
            });
          }

          provenance = "$extensions.fsds.scale.heading";
          // Create calc() expression with viewport scaling
          return {
            value: `calc(${baseValue} + ${vwValue} + ${vhValue})`,
            provenance,
          };
        }
      }
    }
  }

  // Arrays (e.g., multi-shadow, font feature lists)
  if (Array.isArray(raw)) {
    const delimiter = getArrayDelimiter(typeHint);
    const value = raw
      .map((item) => {
        if (typeof item === "string") {
          return item.replace(
            /\{([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+)\}/g,
            (_, refPath) => {
              const v = tokenPathToCSSVar(refPath);
              referencedVars.add(v);
              return `var(${v})`;
            },
          );
        }
        return String(item);
      })
      .join(delimiter);
    return { value, provenance };
  }

  if (typeof raw === "string") {
    // Only replace {token.paths.like.this} (no spaces, at least one dot)
    const value = raw.replace(
      /\{([A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+)\}/g,
      (_, refPath) => {
        const v = tokenPathToCSSVar(refPath);
        referencedVars.add(v);
        return `var(${v})`;
      },
    );
    return { value, provenance };
  }

  if (typeof raw === "number" || typeof raw === "boolean") {
    return { value: String(raw), provenance };
  }

  return { value: `var(${tokenPathToCSSVar(pathStr)})`, provenance };
}

function getArrayDelimiter(typeHint) {
  switch (typeHint) {
    case "shadow":
    case "fontFamily":
    case "transition":
      return ", ";
    default:
      return ", ";
  }
}

function collectMaps(tokens, currentPath, inheritedType, maps) {
  for (const [key, val] of Object.entries(tokens)) {
    if (key.startsWith("$")) continue;
    const nextPath = [...currentPath, key];
    const pathStr = nextPath.join(".");

    if (val && typeof val === "object" && !Array.isArray(val)) {
      const nodeType =
        typeof val.$type === "string" ? val.$type : inheritedType;
      const hasValue = Object.prototype.hasOwnProperty.call(val, "$value");
      const hasChildren = Object.keys(val).some(
        (k) =>
          k !== "$value" &&
          k !== "$type" &&
          k !== "$description" &&
          k !== "$extensions" &&
          k !== "$alias",
      );

      if (hasValue || !hasChildren) {
        const cssVar = tokenPathToCSSVar(pathStr);
        // Root always uses light/default resolution
        const lightResult = resolveNode(val, pathStr, "light", nodeType);
        const darkResult = resolveNode(val, pathStr, "dark", nodeType);

        maps.root[cssVar] = {
          value: lightResult.value,
          provenance: lightResult.provenance,
        };
        definedVars.add(cssVar);

        // Lint check: warn about bare numbers in dimension contexts
        lintTypeVsUnit(pathStr, lightResult.value, nodeType);

        // Handle theme extensions for any token type
        if (val.$extensions) {
          const ext = val.$extensions || {};
          const hasLightPath = Object.prototype.hasOwnProperty.call(
            ext,
            "fsds.light",
          );
          const hasDarkPath = Object.prototype.hasOwnProperty.call(
            ext,
            "fsds.dark",
          );

          if (hasLightPath || hasDarkPath) {
            if (hasLightPath) {
              maps.lightColors[cssVar] = {
                value: lightResult.value,
                provenance: lightResult.provenance,
              };
            }
            if (hasDarkPath) {
              maps.darkColors[cssVar] = {
                value: darkResult.value,
                provenance: darkResult.provenance,
              };
              maps.hasDarkOverride = true;
            }

            // Mode symmetry check
            if (hasLightPath && !hasDarkPath) {
              console.warn(
                `[tokens] Warning: ${pathStr} has light mode override but no dark mode override`,
              );
            } else if (hasDarkPath && !hasLightPath) {
              console.warn(
                `[tokens] Warning: ${pathStr} has dark mode override but no light mode override`,
              );
            }
          }
        }
      }

      // Recurse regardless to catch nested tokens
      collectMaps(val, nextPath, nodeType, maps);
    } else {
      // Handle primitive values
      const cssVar = tokenPathToCSSVar(pathStr);
      const lightResult = resolveNode(val, pathStr, "light", inheritedType);
      maps.root[cssVar] = {
        value: lightResult.value,
        provenance: lightResult.provenance,
      };
      definedVars.add(cssVar);

      // Lint check for primitive values too
      lintTypeVsUnit(pathStr, lightResult.value, inheritedType);
    }
  }
}

function lintTypeVsUnit(pathStr, value) {
  // Warn if a token path suggests dimensions but value is a bare number
  // Exclude lineHeight (should be unitless) and letterSpacing normal (can be 0)
  const dimensionPaths =
    /fontSize|padding|margin|gap|height|width|radius|blur|size|spacing/i;
  const isLineHeight = /lineHeight/i.test(pathStr);
  const isLetterSpacingNormal = /letterSpacing.*normal/i.test(pathStr);

  if (
    dimensionPaths.test(pathStr) &&
    !isLineHeight &&
    !isLetterSpacingNormal &&
    /^\d+(\.\d+)?$/.test(String(value))
  ) {
    console.warn(
      `[tokens] Warning: ${pathStr} appears to be a dimension but has bare number value: ${value}`,
    );
  }
}

function formatLine(name, valueObj, includeProvenance = false) {
  const { value, provenance } = valueObj;
  const comment =
    includeProvenance && provenance !== "default"
      ? ` /* via ${provenance} */`
      : "";
  return `  ${name}: ${value};${comment}`;
}

// sort tokens by path order ranking alphabetically per path level
function sortByPathAlphabetically(a, b) {
  const pathA = a.split(".");
  const pathB = b.split(".");

  for (let i = 0; i < pathA.length; i++) {
    if (pathA[i] !== pathB[i]) {
      return pathA[i].localeCompare(pathB[i]);
    }
  }
  return 0;
}

function formatBlock(selector, map, includeProvenance = false) {
  const lines = Object.entries(map)
    .sort(([a], [b]) => sortByPathAlphabetically(a, b))
    .map(([name, valueObj]) => formatLine(name, valueObj, includeProvenance))
    .join("\n");
  return `${selector} {\n${lines}\n}`;
}

function validateReferences() {
  const missing = [...referencedVars].filter((v) => !definedVars.has(v));
  if (missing.length) {
    console.error("[tokens] Missing CSS custom properties for:");
    missing.sort().forEach((v) => console.error(`  ${v}`));
    process.exit(1);
  }
}

function run() {
  if (!fs.existsSync(TOKENS_PATH)) {
    console.error(
      `[tokens] Missing ${path.relative(PROJECT_ROOT, TOKENS_PATH)}`,
    );
    process.exit(1);
  }

  const tokens = readTokens();
  const maps = {
    root: {},
    lightColors: {},
    darkColors: {},
    hasDarkOverride: false,
  };

  collectMaps(tokens, [], undefined, maps);

  // Validate all references are satisfied
  validateReferences();

  const banner = `/* AUTO-GENERATED: Do not edit directly.\n * Source: components/designTokens.json\n */`;
  const rootBlock = formatBlock(":root", maps.root);
  const lightBlock = formatBlock(".light", maps.lightColors);
  const darkBlock = formatBlock(".dark", maps.darkColors);

  // Reorder: prefers-color-scheme before theme classes for better precedence
  const prefersBlock = maps.hasDarkOverride
    ? `@media (prefers-color-scheme: dark) {\n${formatBlock("  :root", maps.darkColors)}\n${formatBlock("  .light", maps.lightColors)}\n}`
    : "";

  const content = [
    banner,
    rootBlock,
    prefersBlock,
    lightBlock,
    darkBlock,
    "",
  ].join("\n\n");

  fs.writeFileSync(OUTPUT_PATH, content, "utf8");
  console.log(`[tokens] Wrote ${path.relative(PROJECT_ROOT, OUTPUT_PATH)}`);

  // Summary stats
  const totalTokens = definedVars.size;
  const referencedCount = referencedVars.size;
  console.log(
    `[tokens] Generated ${totalTokens} CSS custom properties with ${referencedCount} internal references`,
  );
}

run();
