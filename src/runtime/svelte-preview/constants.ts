// Browser-safe constants for the fsds-svelte-preview plugin.

/** URL prefix the fsds-svelte-preview plugin serves shell HTML under. */
export const SVELTE_PREVIEW_URL_PREFIX = "/preview/svelte/";

/**
 * Virtual module ID prefix for per-component entry scripts. The entry is
 * a plain .ts file that imports the real workspace .svelte component and
 * mounts it via Svelte 5's mount() API.
 */
export const SVELTE_PREVIEW_VIRTUAL_ID_PREFIX = "virtual:fsds-preview-svelte/";
