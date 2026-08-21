// CSS read-proof for the properties panel (FIX-EDITOR-CONTROL-BINDING-PROOF-01).
//
// An override is only live if some rule READS the custom property. The
// committed generated React CSS is that proof source — the same authority the
// dead-slot audit scans — because the panel writes the same `--fsds-*`
// variables the generated component CSS consumes. A slot whose var never
// appears in a `var(--fsds-…)` read is declared-but-unwired interface: the
// editor must not offer it as a live control (spec invariant: "a dead knob is
// worse than an absent one").
//
// Deliberately in the panel package (not the data plugin): the proof travels
// with the only consumer, and the generated CSS is importable directly via
// Vite's `?raw` glob — no bundle-shape change, no plugin coupling.

/**
 * Extract every custom-property READ from a CSS source text. A read is a
 * `var(<name>` occurrence — with or without a fallback — so
 * `var(--fsds-box-model-gap, 8px)` and `var(--fsds-box-model-gap)` both
 * count. Non-`--fsds-` vars are ignored (not panel interface). Duplicate
 * reads collapse into the set.
 */
export function extractReadVars(css: string): Set<string> {
  const reads = new Set<string>();
  const re = /var\(\s*(--fsds-[a-z0-9-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) reads.add(m[1]);
  return reads;
}

// Committed generated React CSS, raw per component. Keys are the glob paths
// (`../../../packages/ds-react/src/components/<Name>/<Name>.css`) — the
// component name is the path segment between "components/" and the file.
// Eager: the panel needs the whole map up front; it is build-time data, not
// lazy content.
const GENERATED_CSS = import.meta.glob<string>(
  "../../../packages/ds-react/src/components/*/*.css",
  { query: "?raw", import: "default", eager: true },
);

/** componentName → set of `--fsds-*` vars its generated CSS reads. */
const READS_BY_COMPONENT: Map<string, Set<string>> = (() => {
  const map = new Map<string, Set<string>>();
  for (const [path, css] of Object.entries(GENERATED_CSS)) {
    const m = path.match(/components\/([^/]+)\/[^/]+\.css$/);
    if (!m) continue;
    const name = m[1];
    const reads = map.get(name) ?? new Set<string>();
    for (const v of extractReadVars(css)) reads.add(v);
    map.set(name, reads);
  }
  return map;
})();

/**
 * The read-proof for one component's slot vars. Returns null when no
 * generated CSS exists for the name (unknown component) so callers can
 * distinguish "provably unread" (empty/falsy membership) from "no proof
 * source" — the latter must fail open to legacy behavior, not hide controls.
 */
export function readCssVarsFor(componentName: string): Set<string> | null {
  return READS_BY_COMPONENT.get(componentName) ?? null;
}
