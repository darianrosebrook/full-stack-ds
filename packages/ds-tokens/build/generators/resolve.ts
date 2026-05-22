/**
 * Token resolver — walks the composed DTCG tree and produces a fully-
 * resolved variant where every leaf's `$value` is a literal (hex string
 * for colors, `<n>px` for dimensions, etc.). References (`{a.b.c}`) are
 * dereferenced transitively; circular chains raise an error.
 *
 * Output schema:
 *   - Each leaf retains its `$type` and `$description`.
 *   - `$value` is replaced with the resolved literal.
 *   - For tokens declaring `$extensions.fsds.light` / `fsds.dark`, both
 *     theme variants resolve and the output has `$value.light` and
 *     `$value.dark` keys alongside the canonical `$value` (which equals
 *     the light variant when present, otherwise the unthemed value).
 *
 * Consumers (contrast validator, accessibility validator, downstream
 * analysis) read this artifact and avoid having to re-implement the
 * reference resolution or DTCG color-object → hex conversion.
 */

import fs from "node:fs";
import path from "node:path";

interface DtcgLeaf {
  $type?: string;
  $value: unknown;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

type DtcgNode = DtcgLeaf | { [key: string]: DtcgNode };

interface ResolvedLeaf {
  $type?: string;
  $description?: string;
  $value: string | { light: string; dark?: string };
}

function isLeaf(node: unknown): node is DtcgLeaf {
  return (
    typeof node === "object" &&
    node !== null &&
    "$value" in (node as Record<string, unknown>)
  );
}

/**
 * Convert a DTCG color value (object with colorSpace + components, or
 * literal hex string) into a hex string. Returns null for unknown shapes.
 */
function colorToHex(value: unknown): string | null {
  if (typeof value === "string") {
    if (value.startsWith("#")) return value;
    return null; // unresolved reference; caller should have dereferenced first
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "colorSpace" in (value as Record<string, unknown>) &&
    "components" in (value as Record<string, unknown>)
  ) {
    const cv = value as { colorSpace: string; components: number[] };
    if (cv.colorSpace !== "srgb") return null;
    const [r, g, b] = cv.components;
    const hex = (n: number) =>
      Math.round(n * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }
  return null;
}

/**
 * Convert a DTCG dimension value (object with value + unit, or string)
 * to a CSS-ready string.
 */
function dimensionToString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "value" in (value as Record<string, unknown>) &&
    "unit" in (value as Record<string, unknown>)
  ) {
    const dv = value as { value: number; unit: string };
    return `${dv.value}${dv.unit}`;
  }
  return null;
}

/**
 * Resolve a DTCG leaf to a literal string. Follows {ref} chains
 * recursively, applying type-specific serialization at the bottom.
 */
function resolveValue(
  raw: unknown,
  type: string | undefined,
  tree: DtcgNode,
  visited: string[],
): string {
  // String form may be a reference or a literal.
  if (typeof raw === "string") {
    const refMatch = raw.match(/^\{([^}]+)\}$/);
    if (refMatch) {
      const refPath = refMatch[1];
      if (visited.includes(refPath)) {
        throw new Error(
          `Circular reference: ${[...visited, refPath].join(" -> ")}`,
        );
      }
      const target = getByPath(tree, refPath);
      if (!isLeaf(target)) {
        throw new Error(
          `Reference target is not a leaf: ${refPath} (from ${
            visited[visited.length - 1] ?? "?"
          })`,
        );
      }
      return resolveValue(target.$value, target.$type ?? type, tree, [
        ...visited,
        refPath,
      ]);
    }
    // Literal string (e.g., already-resolved hex, named CSS value).
    return raw;
  }

  // Object form — type-specific.
  if (type === "color") {
    const hex = colorToHex(raw);
    if (hex) return hex;
  }
  if (type === "dimension") {
    const dim = dimensionToString(raw);
    if (dim) return dim;
  }
  if (type === "number") {
    if (typeof raw === "number") return String(raw);
  }

  // Fallback: JSON-stringify whatever it is so the caller at least sees
  // something diagnosable.
  return JSON.stringify(raw);
}

function getByPath(tree: DtcgNode, dotted: string): DtcgNode | undefined {
  const parts = dotted.split(".");
  let cur: unknown = tree;
  for (const p of parts) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur as DtcgNode | undefined;
}

/**
 * Walk the composed tree and produce a parallel tree where every leaf
 * has a resolved literal `$value`. Tokens with theme extensions emit a
 * `{light, dark}` object on `$value`.
 */
function resolveTree(
  node: DtcgNode,
  tree: DtcgNode,
  prefix: string[] = [],
): unknown {
  if (isLeaf(node)) {
    const resolved: ResolvedLeaf = {
      $type: node.$type,
      $description: node.$description,
      $value: "",
    };

    const themeExtensions = node.$extensions as
      | { "fsds.light"?: unknown; "fsds.dark"?: unknown }
      | undefined;
    if (themeExtensions && ("fsds.light" in themeExtensions || "fsds.dark" in themeExtensions)) {
      const light = resolveValue(
        themeExtensions["fsds.light"] ?? node.$value,
        node.$type,
        tree,
        [prefix.join(".") + ":light"],
      );
      const dark =
        themeExtensions["fsds.dark"] !== undefined
          ? resolveValue(themeExtensions["fsds.dark"], node.$type, tree, [
              prefix.join(".") + ":dark",
            ])
          : undefined;
      resolved.$value = dark ? { light, dark } : { light };
    } else {
      resolved.$value = resolveValue(node.$value, node.$type, tree, [
        prefix.join("."),
      ]);
    }
    return resolved;
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith("$")) {
      out[k] = v;
      continue;
    }
    // Non-object children (bare primitives like `fontStyle: "italic"`)
    // pass through verbatim — same guard as the top-level walk.
    if (typeof v !== "object" || v === null) {
      out[k] = v;
      continue;
    }
    out[k] = resolveTree(v as DtcgNode, tree, [...prefix, k]);
  }
  return out;
}

/**
 * Build and write `resolved.tokens.json` from the composed tree.
 *
 * @param composedPath  Path to composed.tokens.json (the build output).
 * @param outputPath    Path where resolved.tokens.json should be written.
 * @returns Count of resolved leaves for logging.
 */
export function resolveAndWrite(
  composedPath: string,
  outputPath: string,
): { leafCount: number; warnings: string[] } {
  const tree = JSON.parse(fs.readFileSync(composedPath, "utf-8")) as DtcgNode;
  const warnings: string[] = [];
  let leafCount = 0;

  // Track resolution failures as warnings rather than hard errors, so
  // one malformed token doesn't sink the whole pipeline. Walk twice:
  // once with try/catch to collect warnings, then emit.
  function walk(node: unknown, prefix: string[] = []): unknown {
    // Non-object value at this position — pass through verbatim. The
    // composed tree occasionally has bare primitive siblings to DTCG
    // leaves (e.g. `syntax.comment.fontStyle: "italic"` next to
    // `syntax.comment.color: {$type, $value}`). Without this guard,
    // Object.entries on a string iterates its characters and recurses
    // back into single-char strings forever.
    if (typeof node !== "object" || node === null) {
      return node;
    }
    if (isLeaf(node as DtcgNode)) {
      leafCount++;
      try {
        return resolveTree(node as DtcgNode, tree, prefix);
      } catch (err) {
        const leaf = node as DtcgLeaf;
        warnings.push(
          `${prefix.join(".")}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        // Emit the unresolved value so downstream consumers see *something*.
        return {
          $type: leaf.$type,
          $description: leaf.$description,
          $value: typeof leaf.$value === "string" ? leaf.$value : null,
          $error: err instanceof Error ? err.message : String(err),
        };
      }
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) {
        out[k] = v;
        continue;
      }
      out[k] = walk(v, [...prefix, k]);
    }
    return out;
  }

  const resolved = walk(tree);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    JSON.stringify(resolved, null, 2) + "\n",
    "utf-8",
  );

  return { leafCount, warnings };
}
