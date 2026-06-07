import { describe, it, expect } from "vitest";
import { buildAngularShell } from "./angular";

// This file used to test all five framework shells. After ADR-PREVIEW-
// PIPELINE-001 step 5, the React/Vue/Svelte/Lit shells have been deleted in
// favor of the per-framework fsds-<fw>-preview Vite plugins under
// src/runtime/<fw>-preview/. Tests for those live alongside each plugin.
//
// Angular keeps its own shell because the bootstrap path needs an explicit
// importmap, JIT-compiler fallback, and zoneless change detection — none of
// which fits the uniform Vite-middleware shape the four other plugins share.

describe("buildAngularShell", () => {
  // The shell signature accepts componentSource and demo for API symmetry
  // with what the four deleted framework shells used to take, but Angular's
  // real source of truth is the pre-compiled host on disk served by the
  // fsds-angular Vite plugin.
  const baseInput = {
    componentName: "Button",
    componentSource: "// served from /preview/angular/ by the vite plugin",
    demo: "// served from /preview/angular/ by the vite plugin",
  };

  it("imports the pre-compiled host from the plugin's URL prefix", () => {
    // The shell hard-codes /preview/angular/.fsds-preview-hosts/<Name>.host.component.js.
    // That URL is plugin-served; changing the path is a coordinated change
    // with src/runtime/angular-compiler/host.ts (where the file is written).
    const html = buildAngularShell(baseInput);
    expect(html).toContain(
      "/preview/angular/.fsds-preview-hosts/Button.host.component.js",
    );
  });

  it("loads @angular/compiler before platform-browser for JIT fallback", () => {
    // Without the compiler in scope, internal injectables (_PlatformLocation
    // et al) can throw "needs to be compiled using the JIT compiler" at
    // bootstrap. This test guards against accidental reordering.
    const html = buildAngularShell(baseInput);
    const compilerIdx = html.indexOf('import("@angular/compiler")');
    const platformIdx = html.indexOf('import("@angular/platform-browser")');
    expect(compilerIdx).toBeGreaterThan(-1);
    expect(platformIdx).toBeGreaterThan(-1);
    expect(compilerIdx).toBeLessThan(platformIdx);
  });

  it("uses zoneless change detection (with experimental name as fallback)", () => {
    // Our codegen output uses OnPush + signals, so zoneless is correct. The
    // experimental fallback exists so a future Angular minor that flips the
    // API back doesn't silently regress to zone-based change detection.
    const html = buildAngularShell(baseInput);
    expect(html).toContain("provideZonelessChangeDetection");
    expect(html).toContain("provideExperimentalZonelessChangeDetection");
  });

  it("provides the importmap entries the bootstrap path actually uses", () => {
    // Importmap is the only way bare-specifier imports inside the iframe
    // resolve. Every specifier the bootstrap script imports — directly or
    // transitively via the compiled host — must be present here.
    const html = buildAngularShell(baseInput);
    for (const spec of [
      "@angular/core",
      "@angular/core/primitives/signals",
      "@angular/core/primitives/di",
      "@angular/compiler",
      "@angular/common",
      "@angular/common/http",
      "@angular/platform-browser",
      "rxjs",
      "rxjs/operators",
      "tslib",
    ]) {
      expect(html).toContain(`"${spec}":`);
    }
  });

  it("loads Angular runtime modules from the local preview middleware, not esm.sh", () => {
    const html = buildAngularShell(baseInput);
    expect(html).not.toContain("https://esm.sh/");
    expect(html).toContain(
      '"/preview/angular/vendor/@angular/compiler/fesm2022/compiler.mjs"',
    );
    expect(html).toContain('"/preview/angular/vendor/rxjs/dist/esm/index.js"');
    expect(html).toContain('"/preview/angular/vendor/tslib/tslib.es6.mjs"');
  });

  it("posts fsds:ready after successful bootstrap and fsds:error on failure", () => {
    // Parent's FrameworkPreview keys its loading/error UI off these messages
    // — without them the preview frame stays in the loading state forever
    // even after the iframe is fully mounted.
    const html = buildAngularShell(baseInput);
    expect(html).toContain('"fsds:ready"');
    expect(html).toContain('"fsds:error"');
  });

  it("renders the host's selector inside #root so bootstrapApplication can mount", () => {
    // bootstrapApplication mounts via the component's selector, not by id —
    // the synthesized host's selector is "fsds-host", and an element with
    // that tag must exist in the document for the bootstrap to succeed
    // (otherwise: NG05104 "selector did not match any elements").
    const html = buildAngularShell(baseInput);
    expect(html).toContain("<fsds-host></fsds-host>");
  });
});
