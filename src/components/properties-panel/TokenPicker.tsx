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
  onPick: (pick: TokenPick) => void;
  onClose: () => void;
}

const COLOR_RE = /^(#|rgb|hsl|oklch|color\()/i;

function isColorValue(v: string | undefined): boolean {
  return !!v && COLOR_RE.test(v.trim());
}

/** First path segment, used as the collection group header (color, spacing…). */
function groupKey(t: FoundationToken): string {
  const seg = t.path.split(".")[0] ?? "other";
  return `${t.layer} · ${seg}`;
}

export function TokenPicker({
  tokens,
  colorOnly,
  onPick,
  onClose,
}: TokenPickerProps) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = tokens.filter((t) => {
      if (t.value == null) return false; // branch-only nodes carry no value
      if (colorOnly && !isColorValue(t.value)) return false;
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
