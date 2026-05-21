// Browser-safe constants for the fsds-vue-preview plugin. Mirrors the
// react-preview / angular-compiler split — see ADR-PREVIEW-PIPELINE-001.

/** URL prefix the fsds-vue-preview plugin serves shell HTML under. */
export const VUE_PREVIEW_URL_PREFIX = "/preview/vue/";

/**
 * Virtual module ID prefix for per-component entry scripts. The entry is
 * a plain .ts file (no need for a virtual SFC) that imports the real
 * workspace .vue component and mounts it via createApp + h().
 */
export const VUE_PREVIEW_VIRTUAL_ID_PREFIX = "virtual:fsds-preview-vue/";
