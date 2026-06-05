import { useCallback, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { Chip, Input } from "@full-stack-ds/react";
import type { Bundle, FoundationToken } from "../types/data";

interface TokensViewProps {
  bundle: Bundle;
}

type LayerKey = FoundationToken["layer"];
const LAYER_ORDER: LayerKey[] = ["core", "semantic", "brand"];
const LAYER_LABEL: Record<LayerKey, string> = {
  core: "Core",
  semantic: "Semantic",
  brand: "Brand",
};

function isColorish(val: string | undefined): boolean {
  if (!val) return false;
  return /^#|^rgb|^hsl|^var\(/.test(val);
}

function isReference(val: string | undefined): val is string {
  return typeof val === "string" && /^\{[^}]+\}$/.test(val.trim());
}

function refTarget(val: string): string {
  return val.trim().slice(1, -1);
}

/**
 * Build a deterministic DOM id for a token row. Keep the path lossless (dots
 * are valid in id attributes per HTML5) so anchor links from `{a.b.c}` work
 * without any normalization.
 */
function anchorId(layer: LayerKey, path: string): string {
  return `token-${layer}-${path}`;
}

/**
 * Resolve a token reference `path` to a row id by checking, in order: the
 * active brand, semantic, then core. Brand tokens often reference core
 * palette entries; semantic tokens occasionally chain through other semantic
 * entries; core is the terminal layer.
 */
function findAnchorForRef(
  path: string,
  index: { core: Set<string>; semantic: Set<string>; brand: Set<string> },
): string | null {
  if (index.brand.has(path)) return anchorId("brand", path);
  if (index.semantic.has(path)) return anchorId("semantic", path);
  if (index.core.has(path)) return anchorId("core", path);
  return null;
}

interface RefLinkProps {
  value: string;
  index: { core: Set<string>; semantic: Set<string>; brand: Set<string> };
  onJump: (anchor: string) => void;
}

function RefLink({ value, index, onJump }: RefLinkProps) {
  const target = refTarget(value);
  const href = findAnchorForRef(target, index);
  if (!href) {
    return <span className="token-ref token-ref--unresolved">{value}</span>;
  }
  // Intentional anchor attribute so middle-click / right-click "Copy link"
  // produces a useful URL, but the click handler prevents the default
  // navigation — the showcase uses a hash router, so a bare `#token-…`
  // hash would be parsed as "home" and unmount the table.
  return (
    <a
      className="token-ref"
      href={`#${href}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onJump(href);
      }}
    >
      {target}
    </a>
  );
}

interface ValueCellProps {
  token: FoundationToken;
  index: { core: Set<string>; semantic: Set<string>; brand: Set<string> };
  onJump: (anchor: string) => void;
}

function ValueCell({ token, index, onJump }: ValueCellProps) {
  const v = token.value;
  if (v == null) return <span className="muted">—</span>;
  if (isReference(v)) {
    return <RefLink value={v} index={index} onJump={onJump} />;
  }
  if (token.valueByMode && (token.valueByMode.light || token.valueByMode.dark)) {
    const { light, dark } = token.valueByMode;
    return (
      <span className="token-value-modes">
        {light && (
          <span className="token-value-mode" title="light">
            {isColorish(light) && <span className="token-swatch" style={{ background: light }} aria-hidden />}
            <span className="token-value-text">{light}</span>
          </span>
        )}
        {dark && (
          <span className="token-value-mode" title="dark">
            {isColorish(dark) && <span className="token-swatch" style={{ background: dark }} aria-hidden />}
            <span className="token-value-text">{dark}</span>
          </span>
        )}
      </span>
    );
  }
  return (
    <span className="token-value">
      {isColorish(v) && <span className="token-swatch" style={{ background: v }} aria-hidden />}
      <span className="token-value-text">{v}</span>
    </span>
  );
}

export function TokensView({ bundle }: TokensViewProps) {
  const [filter, setFilter] = useState("");
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    core: true,
    semantic: true,
    brand: true,
  });

  const brands = useMemo(() => bundle.brandTokens ?? [], [bundle.brandTokens]);
  const [brandId, setBrandId] = useState<string>(() => brands[0]?.id ?? "default");
  const activeBrand = useMemo(
    () => brands.find((b) => b.id === brandId) ?? brands[0],
    [brands, brandId],
  );

  // Build the unified row set whenever the active brand changes. Core and
  // semantic are stable across brand toggles; only the brand slice swaps.
  const rows = useMemo<FoundationToken[]>(() => {
    const out: FoundationToken[] = [];
    for (const t of bundle.foundationTokens ?? []) out.push(t);
    if (activeBrand) {
      for (const t of activeBrand.tokens) out.push(t);
    }
    return out;
  }, [bundle.foundationTokens, activeBrand]);

  // Indices used by RefLink to resolve `{path}` references back to anchor ids.
  // Built once per (foundation, active brand) pair; reused by every row.
  const refIndex = useMemo(() => {
    const idx = { core: new Set<string>(), semantic: new Set<string>(), brand: new Set<string>() };
    for (const t of rows) idx[t.layer].add(t.path);
    return idx;
  }, [rows]);

  // Filter pipeline: layer chips first (cheap), then text needle across path,
  // value, description, and extension text. Case-insensitive substring match.
  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return rows.filter((t) => {
      if (!layers[t.layer]) return false;
      if (!needle) return true;
      if (t.path.toLowerCase().includes(needle)) return true;
      if ((t.value ?? "").toLowerCase().includes(needle)) return true;
      if ((t.description ?? "").toLowerCase().includes(needle)) return true;
      if (t.valueByMode) {
        if ((t.valueByMode.light ?? "").toLowerCase().includes(needle)) return true;
        if ((t.valueByMode.dark ?? "").toLowerCase().includes(needle)) return true;
      }
      return false;
    });
  }, [rows, layers, filter]);

  // Group by layer so the table is broken into labelled sections, matching
  // how the user picked the page shape (Core / Semantic / Brand bands).
  const grouped = useMemo(() => {
    const groups: Record<LayerKey, FoundationToken[]> = { core: [], semantic: [], brand: [] };
    for (const t of filtered) groups[t.layer].push(t);
    return groups;
  }, [filtered]);

  // Jump handler used by every in-page anchor (row name + {ref} links).
  // We can't fall through to the browser's native hash navigation because the
  // showcase uses a hash router (`#/tokens`); any non-routing hash like
  // `#token-…` would be parsed as "home" and unmount the table. Instead, scroll
  // the target into view, flash it, and update the URL via history.replaceState
  // (which does NOT fire hashchange, so the router stays put).
  const jumpToRow = useCallback((anchor: string) => {
    const el = document.getElementById(anchor);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("token-row--flash");
    // Force a reflow so the animation restarts even when re-clicking the
    // same target. Reading offsetWidth is the idiomatic reflow trigger.
    void el.offsetWidth;
    el.classList.add("token-row--flash");
    window.setTimeout(() => el.classList.remove("token-row--flash"), 1500);
    // Preserve `#/tokens` and append the row id as a query so deep links
    // survive a reload without confusing the router. Using replaceState
    // (not pushState) keeps the back button useful.
    try {
      const next = `#/tokens?row=${encodeURIComponent(anchor)}`;
      window.history.replaceState(null, "", next);
    } catch {
      // Some browsers throw on rapid history mutations; the visual jump
      // already happened, so swallowing the error is fine.
    }
  }, []);

  const onNameClick = useCallback(
    (anchor: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      jumpToRow(anchor);
    },
    [jumpToRow],
  );

  const counts = {
    core: rows.filter((r) => r.layer === "core").length,
    semantic: rows.filter((r) => r.layer === "semantic").length,
    brand: activeBrand?.tokens.length ?? 0,
    total: rows.length,
  };

  return (
    <div className="page">
      <p className="page-eyebrow">FOUNDATIONS</p>
      <h1 className="page-title">Design tokens</h1>
      <p className="page-lede">
        {counts.total.toLocaleString()} tokens across core, semantic, and the active brand —
        {" "}{counts.core} core, {counts.semantic} semantic, {counts.brand} in{" "}
        <code className="muted">{activeBrand?.name ?? "—"}</code>. Click any{" "}
        <span className="token-ref token-ref--inline">{"{reference}"}</span> to jump to the row it
        resolves to.
      </p>

      <div className="tokens-controls">
        <Input
          id="tokens-filter"
          name="tokens-filter"
          type="search"
          className="tokens-filter-input"
          placeholder="Filter by name, value, or description…"
          aria-label="Filter tokens"
          value={filter}
          onChange={setFilter}
        />

        <div className="tokens-layer-chips" role="group" aria-label="Token layers">
          {LAYER_ORDER.map((l) => {
            const active = layers[l];
            return (
              <Chip
                key={l}
                type="button"
                variant={active ? "selected" : "default"}
                ariaPressed={active}
                onClick={() => setLayers((prev) => ({ ...prev, [l]: !prev[l] }))}
              >
                <span className={`tokens-layer-dot tokens-layer-dot--${l}`} aria-hidden />
                {LAYER_LABEL[l]}
              </Chip>
            );
          })}
        </div>
      </div>

      <div className="tokens-brand-bar" role="radiogroup" aria-label="Active brand">
        <span className="tokens-brand-bar-label">Brand</span>
        <div className="tokens-brand-pills">
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={b.id === brandId}
              className={`tokens-brand-pill ${b.id === brandId ? "is-active" : ""}`}
              onClick={() => setBrandId(b.id)}
              title={b.description ?? b.name}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div className="panel tokens-card">
        <table className="tokens-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {LAYER_ORDER.flatMap((layer) => {
              const items = grouped[layer];
              if (!items.length) return [] as React.ReactNode[];
              return [
                <tr key={`hdr-${layer}`} className="tokens-section-row">
                  <td colSpan={4}>
                    <div className="tokens-section-row-inner">
                      <span className={`tokens-layer-dot tokens-layer-dot--${layer}`} aria-hidden />
                      <span className="tokens-section-title">{LAYER_LABEL[layer]}</span>
                      {layer === "brand" && activeBrand && (
                        <span className="muted">— {activeBrand.name}</span>
                      )}
                      <span className="muted tokens-section-count">{items.length}</span>
                    </div>
                  </td>
                </tr>,
                ...items.map((t) => {
                  const anchor = anchorId(layer, t.path);
                  return (
                    <tr key={`${layer}.${t.path}`} id={anchor}>
                      <td className="tokens-name-cell">
                        <a
                          className="tokens-name-anchor"
                          href={`#${anchor}`}
                          onClick={onNameClick(anchor)}
                        >
                          {t.path}
                        </a>
                      </td>
                      <td>
                        <ValueCell token={t} index={refIndex} onJump={jumpToRow} />
                      </td>
                      <td className="muted">{t.type ?? "—"}</td>
                      <td className="muted tokens-desc-cell">{t.description ?? ""}</td>
                    </tr>
                  );
                }),
              ];
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="subtle tokens-empty">
                  No tokens match {filter ? `"${filter}"` : "the current layer selection"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
