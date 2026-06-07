// Browser-safe constants shared between the Vite plugin (Node-side) and the
// shells/angular.ts shell (browser-side). This module exists ONLY to host
// values needed by both — importing the plugin module from a browser-graph
// file pulls Node-only Angular compiler deps into the browser bundle and
// crashes the showcase at runtime.

/** URL prefix the fsds-angular-preview plugin serves compiled output under. */
export const ANGULAR_PREVIEW_URL_PREFIX = "/preview/angular/";

/** Subdirectory (under the URL prefix) holding synthesized host modules. */
export const ANGULAR_PREVIEW_HOSTS_SUBDIR = ".fsds-preview-hosts";

/** Subdirectory (under the URL prefix) that proxies local Angular/RxJS ESM. */
export const ANGULAR_PREVIEW_VENDOR_SUBDIR = "vendor";
