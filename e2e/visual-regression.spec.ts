/**
 * Visual regression for the canonical components produced by the
 * tokens/styles convergence (PLAN-TOKENS-STYLES-CONVERGENCE-001).
 *
 * Why this exists alongside `validateContractEmittedStyles`:
 *   - The byte-compare validators prove the on-disk CSS *text* matches
 *     what the codegen would emit. They cannot prove the *rendered*
 *     appearance is intact — a future IR change that flips slot
 *     declarations off the root selector would byte-mismatch (caught)
 *     OR emit valid-but-visually-broken CSS (NOT caught by byte-
 *     compare; this harness catches it).
 *   - prefers-color-scheme handling shifts colors via OS preference;
 *     a contract change that silently invalidates the dark palette
 *     would slip past `validateContractEmittedCss` because the file
 *     contents are identical — only the OS-side preference resolution
 *     differs. The harness exercises both schemes explicitly.
 *
 * Components covered (the four canonical examples authored by hand):
 *   - Switch (root literal + part consumer + :has() compound + variant
 *     modifier × state compound — the most surface area)
 *   - Popover (root-only, qualtrics convergence reference)
 *   - Progress (anatomy parts, no states)
 *   - Checkbox (state grouping, no anatomy parts)
 *
 * Frameworks covered: React + Lit. Both run real component code in the
 * browser (React via ReactDOM, Lit via custom elements). Vue / Svelte /
 * Angular previews use static-import shells; visual parity with React
 * is enforced upstream by the byte-compare CSS validators
 * (cross-framework drift fails the same way Switch.css drift fails).
 *
 * Baseline images live under `e2e/__visual__/`. To accept a baseline
 * update after a deliberate visual change, run
 *   `pnpm exec playwright test e2e/visual-regression.spec.ts --update-snapshots`.
 */

import { test, expect, type Page } from "@playwright/test";

const COMPONENTS = ["Switch", "Popover", "Progress", "Checkbox"] as const;
const FRAMEWORKS = ["react", "lit"] as const;
const SCHEMES = ["light", "dark"] as const;

type Component = (typeof COMPONENTS)[number];
type Framework = (typeof FRAMEWORKS)[number];
type Scheme = (typeof SCHEMES)[number];

/**
 * Force the OS color scheme via the CDP-level emulator. Playwright's
 * `emulateMedia({ colorScheme })` sets the prefers-color-scheme media
 * query independently of the user's system setting, so this harness
 * runs the same way on a developer laptop and in CI regardless of OS
 * appearance.
 */
async function setScheme(page: Page, scheme: Scheme): Promise<void> {
  await page.emulateMedia({ colorScheme: scheme });
}

/**
 * Wait for the preview iframe's component to fully paint. The default
 * preview routes mount the component asynchronously; without a wait,
 * the first screenshot can capture an empty document body.
 */
async function waitForComponentRender(
  page: Page,
  component: Component,
): Promise<void> {
  const selectors: Record<Component, string> = {
    Switch: ".switch",
    Popover: ".popover",
    Progress: ".progress",
    Checkbox: ".checkbox",
  };
  await page.locator(selectors[component]).first().waitFor({
    state: "attached",
    timeout: 30_000,
  });
  // One animation frame for any transition-on-mount to settle.
  await page.waitForTimeout(50);
}

/**
 * Some canonical examples have no layout literals authored yet
 * (Progress is the canonical case — Progress.styles.json only carries
 * color consumers, no display/width/height). The element exists in
 * the DOM but has no rendered geometry, so element-crop screenshots
 * fail with "element is not visible." For those, fall back to a
 * full-page screenshot of the preview shell — proving the route
 * loaded and the contract's CSS didn't error. When the component
 * gains authored geometry, switch its entry to ELEMENT_CROP.
 */
const ELEMENT_CROP: Component[] = ["Switch", "Popover", "Checkbox"];
const PAGE_CROP: Component[] = ["Progress"];

for (const component of COMPONENTS) {
  for (const framework of FRAMEWORKS) {
    for (const scheme of SCHEMES) {
      test(`${component} (${framework}, ${scheme})`, async ({ page }) => {
        await setScheme(page, scheme);
        await page.goto(`/preview/${framework}/${component}`);
        await waitForComponentRender(page, component);

        const snapshotName = `${component}-${framework}-${scheme}.png`;
        const opts = {
          // Tight pixel-diff threshold — a slot that shifts by 1px
          // matters because it implies the cascade isn't delivering
          // the right value. 0.02 (2%) tolerates anti-aliasing
          // variance across machines but not real geometry changes.
          maxDiffPixelRatio: 0.02,
          // Disable animations during capture so frame-timing
          // variability doesn't make the test flaky. The transition
          // shorthand from Gap 10 would otherwise put the thumb
          // mid-translate if the screenshot fires during animation.
          animations: "disabled" as const,
        };

        if (ELEMENT_CROP.includes(component)) {
          const selectorMap: Record<Component, string> = {
            Switch: ".switch",
            Popover: ".popover",
            Progress: ".progress",
            Checkbox: ".checkbox",
          };
          const target = page.locator(selectorMap[component]).first();
          await expect(target).toHaveScreenshot(snapshotName, opts);
        } else {
          // Full-page screenshot for components with no authored
          // geometry. Captures the preview shell itself; a regression
          // would show the route stopped loading or the empty document
          // shifted layout.
          await expect(page).toHaveScreenshot(snapshotName, opts);
        }
      });
    }
  }
}
