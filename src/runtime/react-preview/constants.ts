// Browser-safe constants for the fsds-react-preview plugin. Lives in its own
// module (rather than alongside vite-plugin.ts) so browser-graph consumers
// can import these values without pulling Node-only deps into the bundle.
// Same pattern as src/runtime/angular-compiler/constants.ts — see ADR-PREVIEW-
// PIPELINE-001 for the broader design.

/** URL prefix the fsds-react-preview plugin serves shell HTML under. */
export const REACT_PREVIEW_URL_PREFIX = "/preview/react/";

/**
 * Virtual module ID prefix for the per-component entry scripts. The shell
 * HTML references these via `/@id/<id>` so Vite's resolveId/load hooks fire
 * and the React plugin's JSX transform runs on the result.
 */
export const REACT_PREVIEW_VIRTUAL_ID_PREFIX = "virtual:fsds-preview-react/";
