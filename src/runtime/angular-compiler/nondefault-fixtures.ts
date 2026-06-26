// Angular non-default rail fixtures (RUNTIME-RAIL-ANGULAR-NONDEFAULT-02).
//
// Angular bakes props into a host component that is AOT-compiled BEFORE the
// browser loads it, so it cannot reuse the R/V/S/L fsds:config message bus.
// A measured probe
// also showed @angular/compiler-cli's oldProgram reuse does NOT make a
// per-prop-set recompile incremental (it still re-emits the whole tree), so
// an on-demand / incremental compile buys nothing.
//
// Instead, this is OPTION (b): a small FIXED set of non-default cases the rail
// needs, each baked into the EXISTING single startup compile under a distinct
// PascalCase host key. The navigable route /preview/angular/<key> then serves
// the pre-compiled fixture host through the same path it serves default hosts —
// no per-request compile, no per-prop-set cache, no matcher change.
//
// This module is intentionally dependency-free (types + data only) so it can be
// imported from both the Node/Vite synthesis side (host.ts / vite-plugin.ts)
// and the Playwright rail (e2e/runtime-rail.spec.ts).

export interface AngularNonDefaultFixture {
  /**
   * Stable key used three ways: the synthesized host filename
   * (`<key>.host.component.ts`), the compiled module name, and the
   * `/preview/angular/<key>` route segment. MUST be bare PascalCase
   * (`/^[A-Z][A-Za-z0-9]*$/`) so the route's existing strict page matcher
   * admits it without modification and it never collides with the dotted,
   * slash-bearing compiled-asset paths the same middleware serves.
   */
  readonly key: string;
  /** The real component this fixture renders (its Angular source + selector). */
  readonly component: string;
  /** Non-default prop overrides baked into the synthesized fixture host. */
  readonly props: Readonly<Record<string, unknown>>;
}

/**
 * The fixed non-default cases the runtime rail asserts for Angular. Each pairs
 * a rail-covered component with a single non-default prop whose runtime effect
 * the rail can observe in the light DOM (a CSS var or an ARIA attribute), so
 * the assertion proves the override took effect vs the default render.
 */
export const ANGULAR_NONDEFAULT_FIXTURES: readonly AngularNonDefaultFixture[] = [
  { key: "ShowMoreMaxLines7", component: "ShowMore", props: { maxLines: 7 } },
  { key: "ProgressValue50", component: "Progress", props: { value: 50 } },
  { key: "TruncateLines5", component: "Truncate", props: { lines: 5 } },
];

/**
 * Resolve the real component name behind a fixture key. Used by the preview
 * route to load the component's CSS (optional fidelity) for a fixture page —
 * the compiled host is keyed by the fixture key, not the component name.
 * Returns undefined for a non-fixture segment (a plain component name).
 */
export function fixtureComponentForKey(key: string): string | undefined {
  return ANGULAR_NONDEFAULT_FIXTURES.find((f) => f.key === key)?.component;
}
