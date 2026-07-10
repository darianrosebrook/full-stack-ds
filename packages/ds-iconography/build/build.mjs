import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconsRoot = path.join(packageRoot, "icons");
const generatedRoot = path.join(packageRoot, "generated");
const validateOnly = process.argv.includes("--validate-only");

const VALID_STATUSES = new Set(["draft", "new", "active", "deprecated", "removed"]);
const VALID_LINE_CAPS = new Set(["butt", "round", "square"]);
// miter/round/bevel only: the SVG2-only joins (arcs, miter-clip) are not
// renderable on Android VectorDrawable and not modeled by React's SVG types,
// so the contract admits only the cross-target subset.
const VALID_LINE_JOINS = new Set(["bevel", "miter", "round"]);
const VALID_RULES = new Set(["nonzero", "evenodd"]);

const iconContracts = loadIconContracts();
const issues = validateIconContracts(iconContracts);
if (issues.length > 0) {
  for (const issue of issues) {
    console.error(`INVALID ${issue.file}: ${issue.message}`);
  }
  process.exit(1);
}

if (validateOnly) {
  for (const icon of iconContracts) {
    console.log(`VALID ${icon.relPath}`);
  }
  process.exit(0);
}

resetGeneratedRoot();
writeIndexModule(iconContracts);
writeCatalog(iconContracts);
writeWebArtifacts(iconContracts);
writeReactArtifacts(iconContracts);
writeSvelteArtifacts(iconContracts);
writeReactNativeArtifacts(iconContracts);
writeAndroidArtifacts(iconContracts);
writeSwiftArtifacts(iconContracts);
writeKotlinArtifacts(iconContracts);

console.log(`Built ${iconContracts.length} icon contract(s) into ${path.relative(process.cwd(), generatedRoot)}`);

function loadIconContracts() {
  if (!fs.existsSync(iconsRoot)) return [];
  const files = [];
  walk(iconsRoot, (absPath) => {
    if (absPath.endsWith(".icon.json")) files.push(absPath);
  });
  files.sort((a, b) => a.localeCompare(b));
  return files.map((absPath) => {
    const relPath = path.relative(packageRoot, absPath);
    const raw = fs.readFileSync(absPath, "utf8");
    return {
      absPath,
      relPath,
      data: JSON.parse(raw),
    };
  });
}

function validateIconContracts(contracts) {
  const issues = [];
  const names = new Set();
  const webNames = new Set();
  const androidNames = new Set();
  const iosNames = new Set();

  for (const contract of contracts) {
    const { data, relPath } = contract;
    const fail = (message) => issues.push({ file: relPath, message });

    if (!isKebab(data.name)) fail("name must be canonical kebab-case.");
    if (data.namespace !== "fsds.icon") fail('namespace must be "fsds.icon".');
    if (!isKebab(data.category)) fail("category must be kebab-case.");
    if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string" || tag.length === 0)) {
      fail("tags must be a non-empty string array.");
    }
    if (data.status !== undefined && !VALID_STATUSES.has(data.status)) {
      fail(`status "${data.status}" is not in the admitted status vocabulary.`);
    }
    if (data.updatedAt !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt)) {
      fail("updatedAt must use YYYY-MM-DD.");
    }
    if (!data.variants || typeof data.variants !== "object" || Array.isArray(data.variants)) {
      fail("variants must be an object keyed by pixel size.");
      continue;
    }
    if (names.has(data.name)) fail(`duplicate icon name "${data.name}".`);
    names.add(data.name);

    for (const [sizeKey, variant] of Object.entries(data.variants)) {
      const variantPath = `${data.name}.variants.${sizeKey}`;
      if (!/^[0-9]+$/.test(sizeKey)) fail(`${variantPath}: size key must be numeric.`);
      if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
        fail(`${variantPath}: variant must be an object.`);
        continue;
      }
      if (variant.width !== Number(sizeKey) || variant.height !== Number(sizeKey)) {
        fail(`${variantPath}: width and height must match the size key in this scaffold.`);
      }
      if (variant.name !== `${data.name}-${sizeKey}`) {
        fail(`${variantPath}: variant name must be "${data.name}-${sizeKey}".`);
      }
      if (typeof variant.viewBox !== "string" || !/^-?[0-9.]+ -?[0-9.]+ [0-9.]+ [0-9.]+$/.test(variant.viewBox)) {
        fail(`${variantPath}: viewBox must be four numeric values.`);
      }
      if (!Array.isArray(variant.paths) || variant.paths.length === 0) {
        fail(`${variantPath}: paths must be a non-empty array.`);
      } else {
        for (const [index, iconPath] of variant.paths.entries()) {
          validatePath(iconPath, `${variantPath}.paths[${index}]`, fail);
        }
      }
      if (!variant.platformNames || typeof variant.platformNames !== "object") {
        fail(`${variantPath}: platformNames is required.`);
        continue;
      }
      checkUniquePlatformName(webNames, variant.platformNames.web, "web", variantPath, fail);
      checkUniquePlatformName(androidNames, variant.platformNames.android, "android", variantPath, fail);
      checkUniquePlatformName(iosNames, variant.platformNames.ios, "ios", variantPath, fail);
    }
  }

  return issues;
}

function validatePath(iconPath, pointer, fail) {
  if (!iconPath || typeof iconPath !== "object" || Array.isArray(iconPath)) {
    fail(`${pointer}: path must be an object.`);
    return;
  }
  if (typeof iconPath.d !== "string" || iconPath.d.length === 0) {
    fail(`${pointer}.d must be a non-empty SVG path-data string.`);
  }
  for (const paintKey of ["fill", "stroke"]) {
    const value = iconPath[paintKey];
    if (value !== undefined && value !== "none" && value !== "currentColor") {
      fail(`${pointer}.${paintKey} must be "none" or "currentColor" in the scaffold.`);
    }
  }
  if (iconPath.strokeWidth !== undefined && typeof iconPath.strokeWidth !== "number") {
    fail(`${pointer}.strokeWidth must be numeric.`);
  }
  if (iconPath.strokeLineCap !== undefined && !VALID_LINE_CAPS.has(iconPath.strokeLineCap)) {
    fail(`${pointer}.strokeLineCap is not admitted.`);
  }
  if (iconPath.strokeLineJoin !== undefined && !VALID_LINE_JOINS.has(iconPath.strokeLineJoin)) {
    fail(`${pointer}.strokeLineJoin is not admitted.`);
  }
  if (iconPath.fillRule !== undefined && !VALID_RULES.has(iconPath.fillRule)) {
    fail(`${pointer}.fillRule is not admitted.`);
  }
  if (iconPath.clipRule !== undefined && !VALID_RULES.has(iconPath.clipRule)) {
    fail(`${pointer}.clipRule is not admitted.`);
  }
}

function checkUniquePlatformName(seen, value, target, pointer, fail) {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${pointer}.platformNames.${target} is required.`);
    return;
  }
  if (seen.has(value)) fail(`${pointer}.platformNames.${target} duplicates "${value}".`);
  seen.add(value);
}

function resetGeneratedRoot() {
  fs.rmSync(generatedRoot, { recursive: true, force: true });
  ensureDir(generatedRoot);
}

/**
 * The committed runtime export surface: index.mjs + index.d.ts at the package
 * root. Unlike everything under generated/ (gitignored scratch), these two
 * files are COMMITTED and drift-gated (build + git diff --exit-code), because
 * generated framework components import them at runtime. One named export per
 * icon (tree-shakeable), an `icons` catalog keyed by canonical name (dynamic
 * lookup), and `resolveIcon` for size-variant selection.
 */
function writeIndexModule(contracts) {
  const pathKeys = [
    "d",
    "fill",
    "stroke",
    "strokeWidth",
    "strokeLineCap",
    "strokeLineJoin",
    "strokeDasharray",
    "fillRule",
    "clipRule",
  ];
  const glyphs = contracts.map(({ data }) => ({
    name: data.name,
    exportName: camelCase(data.name),
    record: {
      name: data.name,
      ref: `${data.namespace}.${data.name}`,
      sizes: Object.fromEntries(
        sortedVariants(data).map(([size, variant]) => [
          size,
          {
            viewBox: variant.viewBox,
            paths: variant.paths.map((iconPath) =>
              Object.fromEntries(
                pathKeys.filter((key) => iconPath[key] !== undefined).map((key) => [key, iconPath[key]]),
              ),
            ),
          },
        ]),
      ),
    },
  }));

  const header = [
    "// @generated by @full-stack-ds/iconography build/build.mjs — do not edit.",
    "// Committed build output (drift-gated); the authoring source of truth is",
    "// icons/<Name>/<Name>.icon.json. Rebuild with `pnpm run build` in this package.",
    "",
  ];

  const moduleLines = [...header];
  for (const glyph of glyphs) {
    moduleLines.push(`export const ${glyph.exportName} = ${JSON.stringify(glyph.record, null, 2)};`);
    moduleLines.push("");
  }
  moduleLines.push("export const icons = {");
  for (const glyph of glyphs) {
    moduleLines.push(`  "${glyph.name}": ${glyph.exportName},`);
  }
  moduleLines.push("};");
  moduleLines.push("");
  moduleLines.push(
    ...[
      "export function resolveIcon(name, sizePx) {",
      "  const glyph = icons[name];",
      "  if (!glyph) return undefined;",
      "  const authored = Object.keys(glyph.sizes)",
      "    .map(Number)",
      "    .sort((a, b) => a - b);",
      "  // Largest authored size <= the request; the smallest authored size when",
      "  // the request undershoots every variant. Sizes are first-class authored",
      "  // glyphs — selection picks a variant, it never synthesizes one.",
      "  let chosen = authored[0];",
      "  for (const size of authored) {",
      "    if (size <= sizePx) chosen = size;",
      "  }",
      "  const variant = glyph.sizes[String(chosen)];",
      "  return { name: glyph.name, size: chosen, viewBox: variant.viewBox, paths: variant.paths };",
      "}",
      "",
    ],
  );
  fs.writeFileSync(path.join(packageRoot, "index.mjs"), moduleLines.join("\n"));

  const dtsLines = [
    ...header,
    "export interface IconGlyphPath {",
    "  readonly d: string;",
    '  readonly fill?: "none" | "currentColor";',
    '  readonly stroke?: "none" | "currentColor";',
    "  readonly strokeWidth?: number;",
    '  readonly strokeLineCap?: "butt" | "round" | "square";',
    '  readonly strokeLineJoin?: "bevel" | "miter" | "round";',
    "  readonly strokeDasharray?: string;",
    '  readonly fillRule?: "nonzero" | "evenodd";',
    '  readonly clipRule?: "nonzero" | "evenodd";',
    "}",
    "",
    "export interface IconGlyphVariant {",
    "  readonly viewBox: string;",
    "  readonly paths: readonly IconGlyphPath[];",
    "}",
    "",
    "export interface IconGlyph {",
    "  readonly name: string;",
    "  readonly ref: string;",
    "  readonly sizes: Readonly<Record<string, IconGlyphVariant>>;",
    "}",
    "",
    "export interface ResolvedIconGlyph extends IconGlyphVariant {",
    "  readonly name: string;",
    "  readonly size: number;",
    "}",
    "",
    ...glyphs.map((glyph) => `export declare const ${glyph.exportName}: IconGlyph;`),
    "",
    "export declare const icons: Readonly<Record<string, IconGlyph>>;",
    "",
    "export declare function resolveIcon(name: string, sizePx: number): ResolvedIconGlyph | undefined;",
    "",
  ];
  fs.writeFileSync(path.join(packageRoot, "index.d.ts"), dtsLines.join("\n"));
}

function writeCatalog(contracts) {
  const catalog = {
    schemaVersion: 1,
    source: "@full-stack-ds/iconography",
    icons: contracts.map(({ relPath, data }) => ({
      name: data.name,
      displayName: data.displayName ?? titleCase(data.name),
      namespace: data.namespace,
      ref: `${data.namespace}.${data.name}`,
      category: data.category,
      tags: data.tags,
      aliases: data.aliases ?? [],
      status: data.status ?? "draft",
      updatedAt: data.updatedAt ?? null,
      variants: Object.fromEntries(
        Object.entries(data.variants).map(([size, variant]) => [
          size,
          {
            name: variant.name,
            width: variant.width,
            height: variant.height,
            viewBox: variant.viewBox,
            platformNames: variant.platformNames,
          },
        ]),
      ),
      relatedIcons: data.relatedIcons ?? [],
      provenance: data.provenance ?? null,
      sourcePath: relPath,
    })),
  };
  writeJson(path.join(generatedRoot, "catalog.json"), catalog);
}

function writeWebArtifacts(contracts) {
  const spriteSymbols = [];
  const webIconsRoot = path.join(generatedRoot, "web", "icons");
  ensureDir(webIconsRoot);

  for (const { data } of contracts) {
    for (const [, variant] of sortedVariants(data)) {
      const paths = variant.paths.map((iconPath) => `  ${renderSvgPath(iconPath)}`).join("\n");
      const svg = [
        `<svg width="${variant.width}" height="${variant.height}" viewBox="${escapeXml(variant.viewBox)}" fill="none" xmlns="http://www.w3.org/2000/svg">`,
        paths,
        "</svg>",
        "",
      ].join("\n");
      fs.writeFileSync(path.join(webIconsRoot, `${variant.platformNames.web}.svg`), svg);
      spriteSymbols.push([
        `<symbol id="${escapeXml(variant.platformNames.web)}" viewBox="${escapeXml(variant.viewBox)}">`,
        paths,
        "</symbol>",
      ].join("\n"));
    }
  }

  fs.writeFileSync(
    path.join(generatedRoot, "web", "sprite.svg"),
    [
      '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">',
      ...spriteSymbols,
      "</svg>",
      "",
    ].join("\n"),
  );
}

function writeReactArtifacts(contracts) {
  const outDir = path.join(generatedRoot, "react");
  ensureDir(outDir);
  const exports = [];

  for (const { data } of contracts) {
    const componentName = componentNameFor(data, "react");
    exports.push(`export { ${componentName} } from "./${componentName}";`);
    fs.writeFileSync(path.join(outDir, `${componentName}.tsx`), renderReactComponent(data, componentName));
  }

  fs.writeFileSync(path.join(outDir, "index.ts"), `${exports.join("\n")}\n`);
}

function writeSvelteArtifacts(contracts) {
  const outDir = path.join(generatedRoot, "svelte");
  ensureDir(outDir);
  const exports = [];

  for (const { data } of contracts) {
    const componentName = componentNameFor(data, "svelte");
    exports.push(`export { default as ${componentName} } from "./${componentName}.svelte";`);
    fs.writeFileSync(path.join(outDir, `${componentName}.svelte`), renderSvelteComponent(data));
  }

  fs.writeFileSync(path.join(outDir, "index.ts"), `${exports.join("\n")}\n`);
}

function writeReactNativeArtifacts(contracts) {
  const outDir = path.join(generatedRoot, "react-native");
  ensureDir(outDir);
  const exports = [];

  for (const { data } of contracts) {
    const componentName = componentNameFor(data, "reactNative");
    exports.push(`export { ${componentName} } from "./${componentName}";`);
    fs.writeFileSync(path.join(outDir, `${componentName}.tsx`), renderReactNativeComponent(data, componentName));
  }

  fs.writeFileSync(path.join(outDir, "index.ts"), `${exports.join("\n")}\n`);
}

function writeAndroidArtifacts(contracts) {
  const drawableDir = path.join(generatedRoot, "android", "drawable");
  ensureDir(drawableDir);
  const residuals = [];

  for (const { data } of contracts) {
    for (const [size, variant] of sortedVariants(data)) {
      const unsupported = collectAndroidResiduals(data.name, size, variant);
      if (unsupported.length > 0) residuals.push(...unsupported);
      fs.writeFileSync(
        path.join(drawableDir, `${variant.platformNames.android}.xml`),
        renderAndroidVector(variant),
      );
    }
  }

  writeJson(path.join(generatedRoot, "android", "residuals.json"), {
    schemaVersion: 1,
    source: "@full-stack-ds/iconography/android",
    residuals,
  });
}

function writeSwiftArtifacts(contracts) {
  const outDir = path.join(generatedRoot, "swift");
  ensureDir(outDir);
  for (const { data } of contracts) {
    const componentName = componentNameFor(data, "swift");
    fs.writeFileSync(path.join(outDir, `${componentName}.swift`), renderSwiftRegistry(data, componentName));
  }
}

function writeKotlinArtifacts(contracts) {
  const outDir = path.join(generatedRoot, "kotlin");
  ensureDir(outDir);
  for (const { data } of contracts) {
    const componentName = componentNameFor(data, "kotlin");
    fs.writeFileSync(path.join(outDir, `${componentName}.kt`), renderKotlinRegistry(data, componentName));
  }
}

function renderReactComponent(data, componentName) {
  const variants = sortedVariants(data);
  const union = variants.map(([size]) => size).join(" | ");
  const cases = variants
    .map(([size, variant]) => {
      const paths = variant.paths.map((iconPath, index) => `        ${renderJsxPath(iconPath, index)}`).join("\n");
      return [
        `    case ${size}:`,
        `      return (`,
        `        <svg width={size} height={size} viewBox="${escapeAttr(variant.viewBox)}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden={title ? undefined : true} role={title ? "img" : undefined} {...props}>`,
        `          {title ? <title>{title}</title> : null}`,
        paths,
        `        </svg>`,
        `      );`,
      ].join("\n");
    })
    .join("\n");

  return [
    'import type { SVGProps } from "react";',
    "",
    `export type ${componentName}Size = ${union};`,
    "",
    `export interface ${componentName}Props extends Omit<SVGProps<SVGSVGElement>, "height" | "width"> {`,
    `  size?: ${componentName}Size;`,
    "  title?: string;",
    "}",
    "",
    `export function ${componentName}({ size = ${variants[0][0]}, title, ...props }: ${componentName}Props) {`,
    "  switch (size) {",
    cases,
    "    default:",
    "      return null;",
    "  }",
    "}",
    "",
  ].join("\n");
}

function renderSvelteComponent(data) {
  const variants = sortedVariants(data);
  const defaultSize = variants[0][0];
  const blocks = variants
    .map(([size, variant], index) => {
      const paths = variant.paths.map((iconPath) => `  ${renderSvgPath(iconPath)}`).join("\n");
      return [
        `${index === 0 ? "{#if" : "{:else if"} size === ${size}}`,
        `<svg width={size} height={size} viewBox="${escapeAttr(variant.viewBox)}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>`,
        `  {#if title}<title>{title}</title>{/if}`,
        paths,
        `</svg>`,
      ].join("\n");
    })
    .join("\n");

  return [
    "<script lang=\"ts\">",
    `  export let size: ${variants.map(([size]) => size).join(" | ")} = ${defaultSize};`,
    "  export let title: string | undefined = undefined;",
    "</script>",
    "",
    blocks,
    "{/if}",
    "",
  ].join("\n");
}

function renderReactNativeComponent(data, componentName) {
  const variants = sortedVariants(data);
  const union = variants.map(([size]) => size).join(" | ");
  const cases = variants
    .map(([size, variant]) => {
      const paths = variant.paths.map((iconPath, index) => `        ${renderReactNativePath(iconPath, index)}`).join("\n");
      return [
        `    case ${size}:`,
        `      return (`,
        `        <Svg width={size} height={size} viewBox="${escapeAttr(variant.viewBox)}" accessibilityRole={title ? "image" : undefined} accessibilityLabel={title} {...props}>`,
        paths,
        `        </Svg>`,
        `      );`,
      ].join("\n");
    })
    .join("\n");

  return [
    'import Svg, { Path } from "react-native-svg";',
    'import type { SvgProps } from "react-native-svg";',
    "",
    `export type ${componentName}Size = ${union};`,
    "",
    `export interface ${componentName}Props extends Omit<SvgProps, "height" | "width"> {`,
    `  size?: ${componentName}Size;`,
    "  color?: string;",
    "  title?: string;",
    "}",
    "",
    `export function ${componentName}({ size = ${variants[0][0]}, color = "currentColor", title, ...props }: ${componentName}Props) {`,
    "  switch (size) {",
    cases,
    "    default:",
    "      return null;",
    "  }",
    "}",
    "",
  ].join("\n");
}

function renderAndroidVector(variant) {
  const viewport = parseViewBox(variant.viewBox);
  const paths = variant.paths.map((iconPath) => renderAndroidPath(iconPath)).join("\n");
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<vector xmlns:android="http://schemas.android.com/apk/res/android"`,
    `    android:width="${variant.width}dp"`,
    `    android:height="${variant.height}dp"`,
    `    android:viewportWidth="${viewport.width}"`,
    `    android:viewportHeight="${viewport.height}">`,
    paths,
    "</vector>",
    "",
  ].join("\n");
}

function renderSwiftRegistry(data, componentName) {
  const cases = sortedVariants(data)
    .map(([, variant]) => `    public static let ${swiftMemberName(variant.name)} = ${swiftString(renderInlineSvg(variant))}`)
    .join("\n");
  return [
    "import Foundation",
    "",
    `public enum ${componentName} {`,
    `    public static let name = "${data.name}"`,
    cases,
    "}",
    "",
  ].join("\n");
}

function renderKotlinRegistry(data, componentName) {
  const cases = sortedVariants(data)
    .map(([, variant]) => `    const val ${kotlinMemberName(variant.name)} = ${kotlinString(renderInlineSvg(variant))}`)
    .join("\n");
  return [
    "package fullstackds.iconography",
    "",
    `object ${componentName} {`,
    `    const val Name = "${data.name}"`,
    cases,
    "}",
    "",
  ].join("\n");
}

function renderSvgPath(iconPath) {
  const attrs = [
    ["d", iconPath.d],
    ["fill", iconPath.fill],
    ["stroke", iconPath.stroke],
    ["stroke-width", iconPath.strokeWidth],
    ["stroke-linecap", iconPath.strokeLineCap],
    ["stroke-linejoin", iconPath.strokeLineJoin],
    ["stroke-dasharray", iconPath.strokeDasharray],
    ["fill-rule", iconPath.fillRule],
    ["clip-rule", iconPath.clipRule],
  ].filter(([, value]) => value !== undefined);
  return `<path ${attrs.map(([key, value]) => `${key}="${escapeAttr(String(value))}"`).join(" ")} />`;
}

function renderJsxPath(iconPath, index) {
  const attrs = [
    ["key", `{${index}}`],
    ["d", `"${escapeAttr(iconPath.d)}"`],
    ["fill", iconPath.fill ? `"${escapeAttr(iconPath.fill)}"` : undefined],
    ["stroke", iconPath.stroke ? `"${escapeAttr(iconPath.stroke)}"` : undefined],
    ["strokeWidth", iconPath.strokeWidth === undefined ? undefined : `{${iconPath.strokeWidth}}`],
    ["strokeLinecap", iconPath.strokeLineCap ? `"${iconPath.strokeLineCap}"` : undefined],
    ["strokeLinejoin", iconPath.strokeLineJoin ? `"${iconPath.strokeLineJoin}"` : undefined],
    ["strokeDasharray", iconPath.strokeDasharray ? `"${escapeAttr(iconPath.strokeDasharray)}"` : undefined],
    ["fillRule", iconPath.fillRule ? `"${iconPath.fillRule}"` : undefined],
    ["clipRule", iconPath.clipRule ? `"${iconPath.clipRule}"` : undefined],
  ].filter(([, value]) => value !== undefined);
  return `<path ${attrs.map(([key, value]) => `${key}=${value}`).join(" ")} />`;
}

function renderReactNativePath(iconPath, index) {
  const attrs = [
    ["key", `{${index}}`],
    ["d", `"${escapeAttr(iconPath.d)}"`],
    ["fill", iconPath.fill === "currentColor" ? "{color}" : iconPath.fill ? `"${iconPath.fill}"` : undefined],
    ["stroke", iconPath.stroke === "currentColor" ? "{color}" : iconPath.stroke ? `"${iconPath.stroke}"` : undefined],
    ["strokeWidth", iconPath.strokeWidth === undefined ? undefined : `{${iconPath.strokeWidth}}`],
    ["strokeLinecap", iconPath.strokeLineCap ? `"${iconPath.strokeLineCap}"` : undefined],
    ["strokeLinejoin", iconPath.strokeLineJoin ? `"${iconPath.strokeLineJoin}"` : undefined],
  ].filter(([, value]) => value !== undefined);
  return `<Path ${attrs.map(([key, value]) => `${key}=${value}`).join(" ")} />`;
}

function renderAndroidPath(iconPath) {
  const attrs = [
    ["android:pathData", iconPath.d],
    ["android:fillColor", iconPath.fill === "currentColor" ? "@android:color/black" : iconPath.fill],
    ["android:strokeColor", iconPath.stroke === "currentColor" ? "@android:color/black" : iconPath.stroke],
    ["android:strokeWidth", iconPath.strokeWidth],
    ["android:strokeLineCap", iconPath.strokeLineCap],
    ["android:strokeLineJoin", iconPath.strokeLineJoin],
    ["android:fillType", iconPath.fillRule === "evenodd" ? "evenOdd" : undefined],
  ].filter(([, value]) => value !== undefined && value !== "none");
  return `    <path ${attrs.map(([key, value]) => `${key}="${escapeXml(String(value))}"`).join("\n          ")} />`;
}

function collectAndroidResiduals(iconName, size, variant) {
  const residuals = [];
  for (const [index, iconPath] of variant.paths.entries()) {
    if (iconPath.strokeDasharray !== undefined) {
      residuals.push({
        icon: iconName,
        size,
        variant: variant.name,
        pathIndex: index,
        target: "android-vector-drawable",
        unsupported: "strokeDasharray",
        value: iconPath.strokeDasharray,
        note: "Android VectorDrawable does not carry SVG dash-array semantics in this scaffold projection.",
      });
    }
  }
  return residuals;
}

function renderInlineSvg(variant) {
  const paths = variant.paths.map(renderSvgPath).join("");
  return `<svg width="${variant.width}" height="${variant.height}" viewBox="${escapeAttr(variant.viewBox)}" fill="none" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}

function sortedVariants(data) {
  return Object.entries(data.variants).sort(([a], [b]) => Number(a) - Number(b));
}

function componentNameFor(data, target) {
  const firstVariant = sortedVariants(data)[0][1];
  return firstVariant.platformNames[target] ?? `${pascalCase(data.name)}Icon`;
}

function parseViewBox(viewBox) {
  const [, , width, height] = viewBox.split(/\s+/).map(Number);
  return { width, height };
}

function writeJson(absPath, value) {
  ensureDir(path.dirname(absPath));
  fs.writeFileSync(absPath, `${JSON.stringify(value, null, 2)}\n`);
}

function ensureDir(absPath) {
  fs.mkdirSync(absPath, { recursive: true });
}

function walk(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absPath, onFile);
    if (entry.isFile()) onFile(absPath);
  }
}

function isKebab(value) {
  return typeof value === "string" && /^[a-z][a-z0-9-]*$/.test(value);
}

function camelCase(value) {
  return value.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}

function pascalCase(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function titleCase(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function swiftMemberName(value) {
  return value.replace(/-([0-9]+)/g, "$1").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function kotlinMemberName(value) {
  return pascalCase(value).replace(/[^A-Za-z0-9_]/g, "");
}

function swiftString(value) {
  return `"""\n${value}\n"""`;
}

function kotlinString(value) {
  return `"""\n${value}\n"""`;
}

function escapeAttr(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeXml(value) {
  return escapeAttr(value).replaceAll("'", "&apos;");
}
