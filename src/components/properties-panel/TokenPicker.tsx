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

const COLOR_RE = /^(#|rgb|hsl|oklch|color\()/i;
// A length: optional sign, number, a length/percentage unit. Unitless 0 counts.
const DIMENSION_RE = /^-?\d*\.?\d+(px|rem|em|%|vh|vw|ch|pt)?$/i;

function isColorValue(v: string | undefined): boolean {
  return !!v && COLOR_RE.test(v.trim());
}

function isDimensionValue(v: string | undefined): boolean {
  return !!v && DIMENSION_RE.test(v.trim());
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
    const q = query.trim().toLowerCase();
    const filtered = tokens.filter((t) => {
      if (t.value == null) return false; // branch-only nodes carry no value
      if (kind === "color" && !isColorValue(t.value)) return false;
      if (kind === "dimension" && !isDimensionValue(t.value)) return false;
      if (pathPattern && !pathPattern.test(t.path)) return false;
      if (q && !t.path.toLowerCase().includes(q) && !String(t.value).toLowerCase().includes(q))
        return false;
      return true;
    });
    const byGroup = new Map<string, FoundationToken[]>();
    for (const t of filtered) {
      const k = groupKey(t);
      const arr = byGroup.get(k) ?? [];
      arr.push(t);
      byGroup.set(k, arr);
    }
    // Stable, readable order: group name asc, token path asc within group.
    return [...byGroup.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, items]) => ({
        name,
        items: items.sort((a, b) => a.path.localeCompare(b.path)),
      }));
  }, [tokens, colorOnly, query]);

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
