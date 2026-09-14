import type { DocsFrontmatter, DocsFrontmatterValue } from "./types";

/**
 * Minimal frontmatter reader for the docs corpus — flat scalars plus block
 * lists (`governs:` shape) and inline `[a, b]` lists. This mirrors
 * scripts/docs-claims-check.mjs's parseDocFrontmatter deliberately: the same
 * field shapes the claims gate already reads, so the site and the gate agree
 * on what a doc's frontmatter says without a YAML dependency. It is not a
 * general YAML parser; nesting beyond these shapes is out of corpus contract.
 */
export function splitFrontmatter(
  source: string
): { fields: DocsFrontmatter; body: string } {
  const fence = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fence) return { fields: {}, body: source };
  const fields: DocsFrontmatter = {};
  const lines = fence[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const field = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) continue;
    const [, key, raw] = field;
    const value = raw.trim();
    if (value === "") {
      // Block list: `key:` followed by indented `- item` lines.
      const items: string[] = [];
      let j = i + 1;
      for (; j < lines.length; j += 1) {
        const item = lines[j].match(/^\s+-\s+(.+?)\s*$/);
        if (!item) break;
        items.push(item[1].replace(/^["']|["']$/g, ""));
      }
      const parsed: DocsFrontmatterValue = items.length > 0 ? items : "";
      fields[key] = parsed;
      i = j - 1;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      fields[key] = value
        .slice(1, -1)
        .split(",")
        .map((part) => part.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      fields[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  // Body = everything after the closing fence line.
  const after = source.slice(fence[0].length);
  return { fields, body: after.replace(/^\r?\n/, "") };
}

/** Scalar frontmatter accessor: lists render as their joined value, absent as null. */
export function frontmatterScalar(
  fields: DocsFrontmatter,
  key: string
): string | null {
  const value = fields[key];
  if (value === undefined || value === "") return null;
  return Array.isArray(value) ? value.join(", ") : value;
}
