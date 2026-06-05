// Shared non-default prop plumbing for the R/V/S/L preview plugins.
//
// The preview pipeline bakes props into the demo SOURCE at build time
// (buildReactDemo/buildVueDemo/... interpolate a DemoProps map into the emitted
// component invocation). To drive NON-DEFAULT props from a preview URL — so the
// runtime fact rail can assert a changed fact — we:
//
//   1. parse props from the shell URL query (?maxLines=7&value=50) into a
//      DemoProps map (parsePropsFromQuery),
//   2. encode that map CANONICALLY (sorted keys) into the virtual entry id
//      (encodePropsParam) so two prop-sets resolve to DISTINCT Vite modules —
//      the entry virtual id is otherwise keyed by component name only, and a
//      non-default URL would collide on the cached default-props module,
//   3. decode it back in the plugin's load() hook (decodePropsParam) so the
//      entry source bakes the override.
//
// Parsing is deliberately narrow — numbers and booleans only — which covers the
// rail's current targets (maxLines, value, lines). Anything else is ignored
// rather than guessed, so a stray query param can't silently become a string
// prop the contract doesn't declare. Encoding is side-decodable JSON (not a
// hash): load() must reconstruct the exact override without plugin-side state,
// and JSON is auditable in the URL.

import type { DemoProps } from "./demos";

/**
 * Parse a URL query string into a DemoProps map. Only numeric and boolean
 * values are admitted: `?maxLines=7` -> { maxLines: 7 }, `?expandable=true` ->
 * { expandable: true }. A value that is neither a finite number nor
 * "true"/"false" is dropped (NOT coerced to a string) so the override surface
 * stays the small, typed set the rail needs.
 */
export function parsePropsFromQuery(query: string): DemoProps {
  const out: DemoProps = {};
  const params = new URLSearchParams(query);
  // Explicit typed channel: `?props=<encoded JSON>` carries arbitrary typed
  // overrides — including STRINGS — for the runtime rails' sentinel injection
  // (e.g. RENDER-PROP-BINDING-PLAYWRIGHT-RAIL-01 driving placeholder/name/value).
  // It is decoded via the same side-decodable JSON used for the entry id, so a
  // string prop only enters through this declared channel — bare query keys
  // below stay narrow (numbers/booleans only, no stray string coercion).
  const propsJson = params.get("props");
  if (propsJson) Object.assign(out, decodePropsParam(propsJson));
  for (const [key, raw] of params) {
    if (key === "props") continue;
    if (raw === "true") {
      out[key] = true;
    } else if (raw === "false") {
      out[key] = false;
    } else if (raw.trim() !== "" && Number.isFinite(Number(raw))) {
      out[key] = Number(raw);
    }
    // else: dropped — not a recognized non-default prop value kind.
  }
  return out;
}

/**
 * Encode a DemoProps map canonically (keys sorted) into a URL-safe string.
 * Returns "" for an empty map so the default-props entry id is unchanged
 * (no `?props=` suffix), keeping default previews byte-identical to before.
 */
export function encodePropsParam(props: DemoProps): string {
  const keys = Object.keys(props).sort();
  if (keys.length === 0) return "";
  const canonical: DemoProps = {};
  for (const k of keys) canonical[k] = props[k];
  return encodeURIComponent(JSON.stringify(canonical));
}

/**
 * Decode the `props` value produced by encodePropsParam back into a DemoProps
 * map. Returns an empty map on absent/blank/malformed input — a corrupt prop
 * payload degrades to default props rather than throwing the whole entry load.
 */
export function decodePropsParam(encoded: string | null | undefined): DemoProps {
  if (!encoded) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(encoded));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as DemoProps;
    }
  } catch {
    // fall through to empty
  }
  return {};
}
