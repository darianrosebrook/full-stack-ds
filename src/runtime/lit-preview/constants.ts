// Browser-safe constants for the fsds-lit-preview plugin.

/** URL prefix the fsds-lit-preview plugin serves shell HTML under. */
export const LIT_PREVIEW_URL_PREFIX = "/preview/lit/";

/**
 * Virtual module ID prefix for per-component entry scripts. The entry is
 * a plain .ts file that imports the real Lit component module (which
 * registers the custom element via @customElement) and inserts the
 * element tag into #root.
 */
export const LIT_PREVIEW_VIRTUAL_ID_PREFIX = "virtual:fsds-preview-lit/";
