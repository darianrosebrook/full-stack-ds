/**
 * Surface modality runtime rail (DS-CONSUMER-FINDINGS-01).
 *
 * Sheet and Dialog declare `surface.modalityProp: "modal"`: when the prop is
 * false the surface is non-blocking. Four facts follow from that one gate and
 * are only observable in a real browser together:
 *
 *   1. aria-modal on the panel reads "false" (default "true").
 *   2. The backdrop takes no box (`display: none`), so the page behind stays
 *      clickable. The rule is a `:has()` selector, which JSDOM cannot evaluate.
 *   3. The body scroll lock is not engaged.
 *   4. The focus trap is inactive: Tab can leave the panel.
 *
 * The default (prop omitted) must keep all four blocking facts.
 *
 * What this rail does NOT prove: screen-reader behavior, native targets,
 * outside-click dismissal semantics for the non-modal case, or initial-focus
 * placement.
 */

import { test, expect, type Page } from "@playwright/test";

type Framework = "react" | "vue" | "svelte" | "lit" | "angular";

const FRAMEWORKS: readonly Framework[] = [
  "react",
  "vue",
  "svelte",
  "lit",
  "angular",
];

const SURFACES = [
  { component: "Sheet", panel: "sheet__content", backdrop: "sheet__overlay" },
  { component: "Dialog", panel: "dialog__modal", backdrop: "dialog__backdrop" },
] as const;

interface Observed {
  ariaModal: string | null;
  backdropDisplay: string | null;
  bodyOverflow: string;
  focusInsideAfterTab: boolean;
}

async function observe(
  page: Page,
  framework: Framework,
  surface: (typeof SURFACES)[number],
  props: Record<string, unknown>,
): Promise<Observed> {
  const block = surface.component.toLowerCase();
  await page.goto(`/preview/${framework}/${surface.component}`, {
    waitUntil: "domcontentloaded",
  });
  const rootSelector =
    framework === "lit" ? `fsds-${block} >> .${block}` : `.${block}`;
  await page.locator(rootSelector).first().waitFor({ state: "attached", timeout: 30_000 });
  await page.locator("body[data-fsds-ready]").waitFor({ state: "attached", timeout: 30_000 });
  await page.evaluate((next) => {
    window.postMessage({ type: "fsds:config", props: next, tokenCss: "" }, "*");
  }, props);

  const panelSelector =
    framework === "lit" ? `fsds-${block} >> .${surface.panel}` : `.${surface.panel}`;
  const expectedAria = props.modal === false ? "false" : "true";
  await expect(page.locator(panelSelector).first()).toHaveAttribute(
    "aria-modal",
    expectedAria,
  );

  const args = { isLit: framework === "lit", host: `fsds-${block}`, ...surface };
  const snapshot = await page.evaluate((a) => {
    const root: Document | ShadowRoot | null = a.isLit
      ? (document.querySelector(a.host) as HTMLElement)?.shadowRoot ?? null
      : document;
    const panel = root?.querySelector(`.${a.panel}`) as HTMLElement | null;
    const backdrop = root?.querySelector(`.${a.backdrop}`) as HTMLElement | null;
    // A focusable after the panel in document order gives an untrapped Tab
    // somewhere to go; without it focus cycles back into the only focusable
    // content on the preview page.
    const outside = document.createElement("button");
    outside.textContent = "outside";
    document.body.append(outside);
    // Start focus on the panel's last focusable so the next Tab either wraps
    // (trap active) or leaves the panel (trap inactive).
    const focusables = panel
      ? [...panel.querySelectorAll<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])")]
      : [];
    focusables.at(-1)?.focus();
    return {
      ariaModal: panel?.getAttribute("aria-modal") ?? null,
      backdropDisplay: backdrop ? getComputedStyle(backdrop).display : null,
      bodyOverflow: document.body.style.overflow,
      startedInside: panel?.contains((root as Document | ShadowRoot).activeElement) ?? false,
    };
  }, args);
  expect(snapshot.startedInside).toBe(true);

  await page.keyboard.press("Tab");

  const focusInsideAfterTab = await page.evaluate((a) => {
    const root: Document | ShadowRoot | null = a.isLit
      ? (document.querySelector(a.host) as HTMLElement)?.shadowRoot ?? null
      : document;
    const panel = root?.querySelector(`.${a.panel}`) as HTMLElement | null;
    const active = (root as Document | ShadowRoot | null)?.activeElement ?? null;
    return !!panel && !!active && panel.contains(active);
  }, args);

  return {
    ariaModal: snapshot.ariaModal,
    backdropDisplay: snapshot.backdropDisplay,
    bodyOverflow: snapshot.bodyOverflow,
    focusInsideAfterTab,
  };
}

test.describe("Runtime rail — surface modality gate", () => {
  for (const framework of FRAMEWORKS) {
    for (const surface of SURFACES) {
      test(`${framework}: ${surface.component} blocks by default`, async ({ page }) => {
        const seen = await observe(page, framework, surface, { open: true });
        expect(seen.ariaModal).toBe("true");
        expect(seen.backdropDisplay).not.toBe("none");
        expect(seen.backdropDisplay).not.toBeNull();
        expect(seen.bodyOverflow).toBe("hidden");
        expect(seen.focusInsideAfterTab).toBe(true);
      });

      test(`${framework}: ${surface.component} modal=false is non-blocking`, async ({ page }) => {
        const seen = await observe(page, framework, surface, { open: true, modal: false });
        expect(seen.ariaModal).toBe("false");
        expect(seen.backdropDisplay).toBe("none");
        expect(seen.bodyOverflow).not.toBe("hidden");
        expect(seen.focusInsideAfterTab).toBe(false);
      });
    }
  }
});
