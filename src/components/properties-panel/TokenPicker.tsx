// Token picker — the "Apply variable" palette dialog, modeled on Figma's
// color-picker library tab. Lists the resolved foundation tokens
// (bundle.foundationTokens, the flat resolved.tokens.json leaf list) grouped by
// layer + top path segment so a component-token row can be re-bound to a
// semantic/core token instead of a literal.
//
// Selecting a token returns BOTH the token path (for display / future contract
// authoring) and its resolved literal value (what we actually write into the
// live CSS override). The scratch page binds to the value; persisting the
// path → contract resolvesTo is explicitly out of scope (a governed contract
// edit), so this stays a preview-only re-skin.

import { useMemo, useState } from "react";
import type { FoundationToken } from "../../types/data";

export interface TokenPick {
  /** Dotted token path, e.g. "color.action.background.primary.default". */
  path: string;
  /** Layer the token lives in (core/semantic/brand). */
  layer: FoundationToken["layer"];
  /** Resolved literal value (hex/px/...) — what we write into the override. */
  value: string;
}

interface TokenPickerProps {
  tokens: FoundationToken[];
  /** When set, only tokens whose resolved value looks like a color are shown. */
  colorOnly?: boolean;
  /**
   * Restrict the palette to a value KIND. "color" → color-valued tokens;
   * "dimension" → length-valued tokens (px/rem/em/%). Omit to show all. Takes
   * precedence over `colorOnly` when both are set. A dimension control should
   * pass "dimension" so its picker offers spacing/size tokens, not colors.
   */
  valueKind?: "color" | "dimension";
  /**
   * Restrict the palette to tokens whose PATH matches this pattern — the
   * semantic family for the value being edited (e.g. /shape\.radius/ for a
   * radius control so it never lists density/spacing/color tokens). Applied in
   * addition to valueKind.
   */
  pathPattern?: RegExp;
  onPick: (pick: TokenPick) => void;
  onClose: () => void;
}

/**
 * The value kind a picker is restricted to. Matches the `valueKind` prop and
 * the `kind` axis of every caller (TokenValueControl, PropertiesPanel). Not the
 * full DTCG `$type` space — the picker only ever edits a color slot or a
 * dimension slot, so those are the only kinds a control asks for.
 */
type ValueKind = "color" | "dimension";

const COLOR_RE = /^(#|rgb|hsl|oklch|color\()/i;
// A length: optional sign, number, a length/percentage unit. Unitless 0 counts.
const DIMENSION_RE = /^-?\d*\.?\d+(px|rem|em|%|vh|vw|ch|pt)?$/i;

/**
 * DTCG `$type` values that count as a given ValueKind. The token's declared
 * `$type` (carried on FoundationToken.type) is the authoritative signal —
 * `color` is exactly the color family; `dimension`/`borderWidth` are the
 * length family a dimension control should offer. We fall back to the value
 * regex only when a token carries no `$type`.
 */
const KIND_TYPES: Record<ValueKind, ReadonlySet<string>> = {
  color: new Set(["color"]),
  dimension: new Set(["dimension", "borderWidth"]),
};

function isColorValue(v: string | undefined): boolean {
  return !!v && COLOR_RE.test(v.trim());
}

function isDimensionValue(v: string | undefined): boolean {
  return !!v && DIMENSION_RE.test(v.trim());
}

/**
 * Does a token belong to the requested value kind? Prefers the authoritative
 * DTCG `$type`; falls back to the value-shape regex for tokens that carry no
 * type. This is what keeps a color out of a border-radius picker and a length
 * out of a color picker — someone editing a dimension should never see a color
 * token, and vice versa.
 */
function matchesKind(t: FoundationToken, kind: ValueKind): boolean {
  if (t.type) return KIND_TYPES[kind].has(t.type);
  return kind === "color" ? isColorValue(t.value) : isDimensionValue(t.value);
}

/**
 * Rank tokens by how likely an author is to reach for them: semantic tokens
 * (the intended public surface) before raw core values, then alphabetically by
 * path. Used both to order tokens within a group and (via the group's first
 * token) to order the groups themselves.
 */
const LAYER_RANK: Record<FoundationToken["layer"], number> = {
  semantic: 0,
  brand: 1,
  core: 2,
};

function byUseCase(a: FoundationToken, b: FoundationToken): number {
  const rank = LAYER_RANK[a.layer] - LAYER_RANK[b.layer];
  if (rank !== 0) return rank;
  return a.path.localeCompare(b.path);
}

/**
 * Filter the flat token list to those matching the requested kind (and, when
 * given, the path pattern + free-text query), then sort semantic-first so the
 * tokens an author is expected to use surface above raw core values. When
 * `kind` is undefined the kind filter is skipped (all value-carrying tokens are
 * eligible). Pure — exported for unit testing.
 */
export function sortAndFilterByType(
  tokenList: FoundationToken[],
  kind: ValueKind | undefined,
  opts: { pathPattern?: RegExp; query?: string } = {},
): FoundationToken[] {
  const q = opts.query?.trim().toLowerCase() ?? "";
  return tokenList
    .filter((t) => {
      if (t.value == null) return false; // branch-only nodes carry no value
      if (kind && !matchesKind(t, kind)) return false;
      if (opts.pathPattern && !opts.pathPattern.test(t.path)) return false;
      if (
        q &&
        !t.path.toLowerCase().includes(q) &&
        !String(t.value).toLowerCase().includes(q)
      )
        return false;
      return true;
    })
    .sort(byUseCase);
}

/** First path segment, used as the collection group header (color, spacing…). */
function groupKey(t: FoundationToken): string {
  const seg = t.path.split(".")[0] ?? "other";
  return `${t.layer} · ${seg}`;
}

export function TokenPicker({
  tokens,
  colorOnly,
  valueKind,
  pathPattern,
  onPick,
  onClose,
}: TokenPickerProps) {
  const [query, setQuery] = useState("");

  // Resolve the effective kind filter: explicit valueKind wins; else legacy
  // colorOnly maps to "color"; else no kind restriction.
  const kind = valueKind ?? (colorOnly ? "color" : undefined);

  const groups = useMemo(() => {
    // Filter to the requested kind + path/query, sorted semantic-first.
    const filtered = sortAndFilterByType(tokens, kind, { pathPattern, query });
    // Bucket into collection groups, preserving the semantic-first order the
    // filtered list already carries (Map iteration is insertion order, and
    // items are pushed in sorted order).
    const byGroup = new Map<string, FoundationToken[]>();
    for (const t of filtered) {
      const k = groupKey(t);
      const arr = byGroup.get(k) ?? [];
      arr.push(t);
      byGroup.set(k, arr);
    }
    // Order groups by their best (first) token's use-case rank so semantic
    // collections lead; ties fall back to the group name for stability.
    return [...byGroup.entries()]
      .sort(([nameA, itemsA], [nameB, itemsB]) => {
        const rank = byUseCase(itemsA[0]!, itemsB[0]!);
        return rank !== 0 ? rank : nameA.localeCompare(nameB);
      })
      .map(([name, items]) => ({ name, items }));
  }, [query, tokens, kind, pathPattern]);

  return (
    <div
      className="fsds-token-picker"
      role="dialog"
      aria-label="Apply token"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="fsds-token-picker__head">
        <input
          className="fsds-token-picker__search"
          type="search"
          placeholder="Search tokens…"
          value={query}
          autoFocus
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search tokens"
        />
        <button
          type="button"
          className="fsds-token-picker__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="fsds-token-picker__body">
        {groups.length === 0 ? (
          <p className="fsds-token-picker__empty">No tokens match.</p>
        ) : (
          groups.map((g) => (
            <div className="fsds-token-picker__group" key={g.name}>
              <div className="fsds-token-picker__group-name">{g.name}</div>
              {g.items.map((t) => (
                <button
                  type="button"
                  className="fsds-token-picker__item"
                  key={`${t.layer}:${t.path}`}
                  onClick={() =>
                    onPick({ path: t.path, layer: t.layer, value: t.value! })
                  }
                  title={`${t.path} → ${t.value}`}
                >
                  <span
                    className="fsds-token-picker__swatch"
                    style={
                      isColorValue(t.value)
                        ? { background: t.value }
                        : { background: "transparent" }
                    }
                    aria-hidden
                  >
                    {isColorValue(t.value) ? "" : "·"}
                  </span>
                  <span className="fsds-token-picker__path">{t.path}</span>
                  <span className="fsds-token-picker__value">{t.value}</span>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
