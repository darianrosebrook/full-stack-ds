import {
  ANGULAR_PREVIEW_URL_PREFIX,
  ANGULAR_PREVIEW_HOSTS_SUBDIR,
} from "../angular-compiler/constants";

interface AngularShellInput {
  componentName: string;
  componentSource: string;
  css?: string;
  demo: string;
}

// Pinned to ds-angular's devDependency. esm.sh serves these via importmap;
// the JIT compiler is loaded eagerly because @angular/common ships from
// esm.sh as partial-linker output and its internal injectables need JIT
// fallback (see the spike trail under packages/ds-angular/spike-*).
const ANGULAR_VERSION = "21.2.13";
const NG_CORE = `https://esm.sh/@angular/core@${ANGULAR_VERSION}?dev`;
const NG_CORE_SIGNALS = `https://esm.sh/@angular/core@${ANGULAR_VERSION}/primitives/signals?dev`;
const NG_COMPILER = `https://esm.sh/@angular/compiler@${ANGULAR_VERSION}?dev&deps=@angular/core@${ANGULAR_VERSION}`;
const NG_COMMON = `https://esm.sh/@angular/common@${ANGULAR_VERSION}?dev&deps=@angular/core@${ANGULAR_VERSION}`;
const NG_PLATFORM_BROWSER = `https://esm.sh/@angular/platform-browser@${ANGULAR_VERSION}?dev&deps=@angular/core@${ANGULAR_VERSION},@angular/common@${ANGULAR_VERSION}`;

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
    "@angular/compiler": "${NG_COMPILER}",
    "@angular/common": "${NG_COMMON}",
    "@angular/platform-browser": "${NG_PLATFORM_BROWSER}"
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
  // Critical: load @angular/compiler BEFORE platform-browser. esm.sh ships
  // partial-linker output for @angular/common; without the JIT compiler
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
  parent.postMessage({ type: "fsds:ready" }, "*");
} catch (e) {
  showError(e?.stack || e?.message || String(e));
}
</script>
</body>
</html>`;
}
