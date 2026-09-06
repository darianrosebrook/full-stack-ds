// The inspector exposes only the emitted CSS dependency closure rooted in
// real properties. Native-only declarations are not Web CSS controls.
import { analyzeCssTokenConsumption } from "../../../packages/ds-codegen/src/css-token-consumption";

export function extractReadVars(css: string): Set<string> {
  return new Set([...analyzeCssTokenConsumption([css]).consumed].filter(name => name.startsWith("--fsds-")));
}

// Committed generated React CSS, raw per component. Keys are the glob paths
// (`../../../packages/ds-react/src/components/<Name>/<Name>.css`) — the
// component name is the path segment between "components/" and the file.
// Eager: the panel needs the whole map up front; it is build-time data, not
// lazy content.
const BOX_MODEL_CSS = import.meta.glob<string>(
  "../../../packages/ds-react/src/primitives/box-model.css",
  { query: "?raw", import: "default", eager: true },
);
const boxModelCss = Object.values(BOX_MODEL_CSS).join("\n");

const GENERATED_CSS = import.meta.glob<string>(
  "../../../packages/ds-react/src/components/*/*.css",
  { query: "?raw", import: "default", eager: true },
);

/** componentName → set of `--fsds-*` vars its generated CSS reads. */
const READS_BY_COMPONENT: Map<string, Set<string>> = (() => {
  const sheets = new Map<string, string[]>();
  for (const [path, css] of Object.entries(GENERATED_CSS)) {
    const match = path.match(/components\/([^/]+)\/[^/]+\.css$/);
    if (!match) continue;
    const group = sheets.get(match[1]) ?? [boxModelCss];
    group.push(css);
    sheets.set(match[1], group);
  }
  const map = new Map([...sheets].map(([name, css]) => [name, extractReadVars(css.join("\n"))]));
  return map;
})();

/**
 * The read-proof for one component's slot vars. Returns null when no
 * generated CSS exists for the name (unknown component) so callers can
 * distinguish "provably unread" (empty/falsy membership) from "no proof
 * source" — missing proof never establishes a live control.
 */
export function readCssVarsFor(componentName: string): Set<string> | null {
  return READS_BY_COMPONENT.get(componentName) ?? null;
}
