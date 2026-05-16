interface AngularShellInput {
  componentName: string;
  componentSource: string;
  css?: string;
  demo: string;
}

/**
 * Honest status: Angular 17+ standalone components with signals (what our
 * codegen emits) cannot be reliably bootstrapped via a plain in-iframe Babel
 * transform. Angular's compiler expects ngcc-processed input or AOT output
 * from `@angular/compiler-cli`, neither of which run cleanly in the browser
 * from esm.sh today. Attempts to bootstrap via `@angular/platform-browser-dynamic`
 * + an in-browser `@angular/compiler` produce "Injectable needs to be compiled
 * with JIT" errors because esm.sh's published bundles are partial-AOT
 * (linker-output), expecting either a real Angular CLI build pipeline or
 * StackBlitz WebContainers.
 *
 * Rather than ship a broken tab, we render a clear placeholder that points to
 * the Developer source view (which IS complete and useful). When Angular's
 * browser story improves we'll wire this up properly.
 */
export function buildAngularShell({ componentName }: AngularShellInput): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; padding: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: transparent; color: inherit; }
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
  .note { max-width: 460px; padding: 20px; border: 1px dashed rgba(127,127,127,0.4); border-radius: 8px; font-size: 13px; line-height: 1.5; color: inherit; }
  .note h3 { margin: 0 0 8px; font-size: 14px; font-weight: 600; }
  .note p { margin: 8px 0; }
  .note code { font-family: ui-monospace, monospace; font-size: 12px; background: rgba(127,127,127,0.12); padding: 1px 5px; border-radius: 3px; }
</style>
</head>
<body>
<div class="note">
  <h3>Angular live preview unavailable</h3>
  <p>
    The generated <code>${componentName}.component.ts</code> uses Angular 17+
    signals and standalone components. Angular's browser-runnable JIT compiler
    cannot bootstrap esm.sh's linker-output bundles, and Sandpack's Angular
    template is pinned to v11 — both fail at runtime against modern emitter
    output.
  </p>
  <p>
    The generated source is still shown below the preview frame. To run it
    live, copy the source into a StackBlitz Angular workspace
    (WebContainers handle the full Angular CLI build chain).
  </p>
</div>
<script>
  parent.postMessage({ type: "fsds:ready" }, "*");
</script>
</body>
</html>`;
}
