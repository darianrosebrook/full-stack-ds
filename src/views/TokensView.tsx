import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, Chip, Input, RadioGroup, Stack, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow  } from "@full-stack-ds/react";
import type { Bundle, FoundationToken } from "../types/data";

interface TokensViewProps {
  bundle: Bundle;
}

type LayerKey = FoundationToken["layer"];
const LAYER_ORDER: LayerKey[] = ["brand", "semantic", "core"];
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

function tokenHref(anchor: string, brandId: string): string {
  return `#/tokens?row=${encodeURIComponent(anchor)}${brandId === "default" ? "" : `&brand=${encodeURIComponent(brandId)}`}`;
}

interface RefLinkProps {
  brandId: string;
  value: string;
  index: { core: Set<string>; semantic: Set<string>; brand: Set<string> };
  onJump: (anchor: string) => void;
}

function RefLink({ value, index, onJump, brandId }: RefLinkProps) {
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
      href={tokenHref(href, brandId)}
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
  brandId: string;
  token: FoundationToken;
  index: { core: Set<string>; semantic: Set<string>; brand: Set<string> };
  onJump: (anchor: string) => void;
}

function ValueCell({ token, index, onJump, brandId }: ValueCellProps) {
  const v = token.value;
  if (v == null) return <span className="muted">—</span>;
  if (isReference(v)) {
    return <RefLink value={v} index={index} onJump={onJump} brandId={brandId} />;
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
  const [brandId, setBrandId] = useState<string>(() => {
    const requested = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("brand");
    return brands.find(brand => brand.id === requested)?.id ?? brands[0]?.id ?? "default";
  });
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
  // the reference chain from Brand through Semantic to Core.
  const grouped = useMemo(() => {
    const groups: Record<LayerKey, FoundationToken[]> = { core: [], semantic: [], brand: [] };
    for (const t of filtered) groups[t.layer].push(t);
    return groups;
  }, [filtered]);

  const [pendingAnchor, setPendingAnchor] = useState<string | null>(() =>
    new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("row"),
  );
  const flashTimer = useRef<number | undefined>(undefined);
  const flashTarget = useRef<HTMLElement | null>(null);
  const jumpToRow = useCallback((anchor: string) => {
    setFilter("");
    setLayers({ brand: true, semantic: true, core: true });
    setPendingAnchor(anchor);
    window.history.replaceState(null, "", tokenHref(anchor, brandId));
  }, [brandId]);

  useEffect(() => {
    if (!pendingAnchor) return;
    const el = document.getElementById(pendingAnchor);
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    flashTarget.current?.classList.remove("token-row--flash");
    flashTarget.current = el;
    el.classList.add("token-row--flash");
    setPendingAnchor(null);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => el.classList.remove("token-row--flash"), 1500);
  }, [pendingAnchor, grouped]);
  useEffect(() => () => {
    window.clearTimeout(flashTimer.current);
    flashTarget.current?.classList.remove("token-row--flash");
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
      const requestedBrand = params.get("brand");
      const anchor = params.get("row");
      if (anchor) {
        setBrandId(brands.find(brand => brand.id === requestedBrand)?.id ?? brands[0]?.id ?? "default");
        setFilter("");
        setLayers({ brand: true, semantic: true, core: true });
        setPendingAnchor(anchor);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [brands]);

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

      <Stack variant="horizontal" className="tokens-controls stack-gap-06">
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

        <Stack
          layout="inline-stack"
          variant="horizontal"
          className="tokens-layer-chips stack-gap-04"
          role="group"
          aria-label="Token layers"
        >
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
        </Stack>
      </Stack>

      <Stack variant="horizontal" className="tokens-brand-bar stack-gap-06">
        <span className="tokens-brand-bar-label">Brand</span>
        <RadioGroup
          className="tokens-brand-choices"
          name="showcase-token-brand"
          ariaLabel="Active brand"
          orientation="horizontal"
          options={brands.map((b) => ({ value: b.id, label: b.name, description: b.description }))}
          value={brandId}
          onChange={setBrandId}
        />
      </Stack>

      <Card className="showcase-card tokens-card">
        <Table className="tokens-table" ariaLabel="Design tokens">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Token</TableHeaderCell>
              <TableHeaderCell>Value</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {LAYER_ORDER.flatMap((layer) => {
              const items = grouped[layer];
              if (!items.length) return [] as React.ReactNode[];
              return [
                <TableRow key={`hdr-${layer}`} className="tokens-section-row">
                  <TableCell colSpan={4}>
                    <Stack variant="horizontal" className="tokens-section-row-inner stack-gap-05">
                      <span className={`tokens-layer-dot tokens-layer-dot--${layer}`} aria-hidden />
                      <span className="tokens-section-title">{LAYER_LABEL[layer]}</span>
                      {layer === "brand" && activeBrand && (
                        <span className="muted">— {activeBrand.name}</span>
                      )}
                      <span className="muted tokens-section-count">{items.length}</span>
                    </Stack>
                  </TableCell>
                </TableRow>,
                ...items.map((t) => {
                  const anchor = anchorId(layer, t.path);
                  return (
                    <TableRow key={`${layer}.${t.path}`} id={anchor}>
                      <TableCell className="tokens-name-cell">
                        <span>{t.path}</span>{" "}
                        <a className="tokens-name-anchor"
                          aria-label={`Permalink to ${t.path}`}
                          title="Permalink to this token"
                          href={tokenHref(anchor, brandId)}>#</a>
                      </TableCell>
                      <TableCell>
                        <ValueCell token={t} index={refIndex} onJump={jumpToRow} brandId={brandId} />
                      </TableCell>
                      <TableCell className="muted">{t.type ?? "—"}</TableCell>
                      <TableCell className="muted tokens-desc-cell">{t.description ?? ""}</TableCell>
                    </TableRow>
                  );
                }),
              ];
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="subtle tokens-empty">
                  No tokens match {filter ? `"${filter}"` : "the current layer selection"}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
