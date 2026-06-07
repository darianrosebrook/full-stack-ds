import {
  ANGULAR_PREVIEW_URL_PREFIX,
  ANGULAR_PREVIEW_HOSTS_SUBDIR,
  ANGULAR_PREVIEW_VENDOR_SUBDIR,
} from "../angular-compiler/constants";

interface AngularShellInput {
  componentName: string;
  componentSource: string;
  css?: string;
  demo: string;
}

// The shell runs inside a srcdoc iframe, so Vite cannot rewrite bare imports
// in its inline module script. Keep the importmap same-origin by pointing at
// the Angular preview middleware's local vendor proxy rather than a CDN.
const ANGULAR_VENDOR_URL = `${ANGULAR_PREVIEW_URL_PREFIX}${ANGULAR_PREVIEW_VENDOR_SUBDIR}`;
const NG_CORE = `${ANGULAR_VENDOR_URL}/@angular/core/fesm2022/core.mjs`;
const NG_CORE_SIGNALS = `${ANGULAR_VENDOR_URL}/@angular/core/fesm2022/primitives-signals.mjs`;
const NG_CORE_DI = `${ANGULAR_VENDOR_URL}/@angular/core/fesm2022/primitives-di.mjs`;
const NG_COMPILER = `${ANGULAR_VENDOR_URL}/@angular/compiler/fesm2022/compiler.mjs`;
const NG_COMMON = `${ANGULAR_VENDOR_URL}/@angular/common/fesm2022/common.mjs`;
const NG_COMMON_HTTP = `${ANGULAR_VENDOR_URL}/@angular/common/fesm2022/http.mjs`;
const NG_PLATFORM_BROWSER = `${ANGULAR_VENDOR_URL}/@angular/platform-browser/fesm2022/platform-browser.mjs`;
const RXJS = `${ANGULAR_VENDOR_URL}/rxjs/dist/esm/index.js`;
const RXJS_OPERATORS = `${ANGULAR_VENDOR_URL}/rxjs/dist/esm/operators/index.js`;
const TSLIB = `${ANGULAR_VENDOR_URL}/tslib/tslib.es6.mjs`;

/**
 * Builds the in-iframe Angular bootstrap HTML.
 *
 * The Angular path differs from the other framework shells: rather than
 * transpiling component source in the iframe (which fails because esm.sh
 * ships partial-linker output for @angular/common), we let the fsds-angular
 * Vite plugin AOT-compile the ds-angular package server-side, then have the
 * iframe import the pre-compiled host component from /preview/angular/...
 * and call bootstrapApplication.
 *
 * The `componentSource` and `demo` arguments are accepted for API symmetry
 * with the other shell builders, but the actual code that runs in the iframe
 * is the compiled host on disk — it stays the source of truth.
 */
export function buildAngularShell({
  componentName,
  css,
}: AngularShellInput): string {
  const hostModuleUrl = `${ANGULAR_PREVIEW_URL_PREFIX}${ANGULAR_PREVIEW_HOSTS_SUBDIR}/${componentName}.host.component.js`;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; padding: 0; background: transparent; font-family: ui-sans-serif, system-ui, sans-serif; color: inherit; }
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
  #root { display: contents; }
  #__fsds_err { position: fixed; inset: 12px; padding: 12px; background: #fee; color: #900; font-family: ui-monospace, monospace; font-size: 12px; border: 1px solid #fbb; border-radius: 6px; white-space: pre-wrap; overflow: auto; display: none; }
</style>
${css ? `<style data-fsds="component-css">${css.replace(/<\/style>/g, "<\\/style>")}</style>` : ""}
<script type="importmap">
{
  "imports": {
    "@angular/core": "${NG_CORE}",
    "@angular/core/primitives/signals": "${NG_CORE_SIGNALS}",
    "@angular/core/primitives/di": "${NG_CORE_DI}",
    "@angular/compiler": "${NG_COMPILER}",
    "@angular/common": "${NG_COMMON}",
    "@angular/common/http": "${NG_COMMON_HTTP}",
    "@angular/platform-browser": "${NG_PLATFORM_BROWSER}",
    "rxjs": "${RXJS}",
    "rxjs/operators": "${RXJS_OPERATORS}",
    "tslib": "${TSLIB}"
  }
}
</script>
</head>
<body>
<div id="root"><fsds-host></fsds-host></div>
<div id="__fsds_err"></div>
<script type="module">
const errEl = document.getElementById("__fsds_err");
function showError(msg) {
  errEl.textContent = String(msg);
  errEl.style.display = "block";
  try { parent.postMessage({ type: "fsds:error", message: String(msg) }, "*"); } catch (e) {}
}
window.addEventListener("error", (e) => showError(e.error?.stack || e.message));
window.addEventListener("unhandledrejection", (e) => showError(e.reason?.stack || e.reason));

try {
  // Critical: load @angular/compiler BEFORE platform-browser. Angular's
  // common/platform internals can still require JIT fallback; without it
  // present at module-import time the bootstrap throws on internal
  // injectables (e.g. _PlatformLocation).
  await import("@angular/compiler");
  const { bootstrapApplication } = await import("@angular/platform-browser");
  const ngCore = await import("@angular/core");
  const { HostComponent } = await import(${JSON.stringify(hostModuleUrl)});

  // Our codegen output uses OnPush + signals, so zoneless is the right call.
  // Angular 21 stable: provideZonelessChangeDetection. Earlier versions
  // exposed it as provideExperimentalZonelessChangeDetection — keep a fallback
  // so a runtime version bump doesn't silently regress.
  const providers = [];
  if (typeof ngCore.provideZonelessChangeDetection === "function") {
    providers.push(ngCore.provideZonelessChangeDetection());
  } else if (typeof ngCore.provideExperimentalZonelessChangeDetection === "function") {
    providers.push(ngCore.provideExperimentalZonelessChangeDetection());
  }
  await bootstrapApplication(HostComponent, { providers });
  // Signal readiness two ways: postMessage for the showcase FrameworkPreview
  // (which listens on the parent across the srcDoc iframe), and a DOM marker
  // for same-origin navigable consumers (the Playwright runtime rail) that
  // navigate to this page directly and cannot observe a cross-frame message.
  // Defer the marker one macrotask so the bootstrap's first change-detection
  // pass (which renders @for/*ngFor children) has flushed before the rail
  // queries iterated DOM.
  parent.postMessage({ type: "fsds:ready" }, "*");
  setTimeout(() => document.body.setAttribute("data-fsds-ready", ""), 0);
} catch (e) {
  showError(e?.stack || e?.message || String(e));
}
</script>
</body>
</html>`;
}
