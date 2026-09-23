/**
 * Toast action + live-region runtime rail (DS-CONSUMER-FINDINGS-01).
 *
 * An open Toast with no action slot must leave no action box: frameworks
 * that can test slot presence never render the wrapper, and Angular (which
 * cannot) renders it empty, where `.toast__action:empty { display: none }`
 * removes it from layout and the accessibility tree. JSDOM does not apply
 * that rule, so only a browser can prove the Angular half.
 *
 * The viewport is a labelled region whose aria-live follows `politeness`;
 * nothing in the toast is role="alert".
 *
 * What this rail does NOT prove: rendering of a FILLED action slot (the
 * preview shell cannot inject slotted content; the per-framework package
 * suites cover that), or screen-reader announcement behavior.
 */

import { test, expect } from "@playwright/test";

type Framework = "react" | "vue" | "svelte" | "lit" | "angular";
const FRAMEWORKS: readonly Framework[] = ["react", "vue", "svelte", "lit", "angular"];

for (const framework of FRAMEWORKS) {
  test(`${framework}: an open Toast without an action shows no action box and is a polite region`, async ({ page }) => {
    await page.goto(`/preview/${framework}/Toast`, { waitUntil: "domcontentloaded" });
    const rootSelector = framework === "lit" ? "fsds-toast >> .toast" : ".toast";
    await page.locator(rootSelector).first().waitFor({ state: "attached", timeout: 30_000 });
    await page.locator("body[data-fsds-ready]").waitFor({ state: "attached", timeout: 30_000 });
    await page.evaluate(() => {
      window.postMessage({ type: "fsds:config", props: { open: true }, tokenCss: "" }, "*");
    });
    const itemSelector = framework === "lit" ? "fsds-toast >> .toast__item" : ".toast__item";
    await page.locator(itemSelector).first().waitFor({ state: "attached", timeout: 30_000 });

    const seen = await page.evaluate((isLit) => {
      const root: Document | ShadowRoot | null = isLit
        ? (document.querySelector("fsds-toast") as HTMLElement)?.shadowRoot ?? null
        : document;
      const toast = root?.querySelector(".toast") as HTMLElement | null;
      const action = root?.querySelector(".toast__action") as HTMLElement | null;
      return {
        role: toast?.getAttribute("role") ?? null,
        label: toast?.getAttribute("aria-label") ?? null,
        live: toast?.getAttribute("aria-live") ?? null,
        itemRole: root?.querySelector(".toast__item")?.getAttribute("role") ?? null,
        alerts: root?.querySelectorAll('[role="alert"]').length ?? -1,
        actionBox: action ? getComputedStyle(action).display : "absent",
      };
    }, framework === "lit");

    expect(seen.role).toBe("region");
    expect(seen.label).toBe("Notifications");
    expect(seen.live).toBe("polite");
    expect(seen.itemRole).toBe("status");
    expect(seen.alerts).toBe(0);
    // Absent, or present-but-empty and hidden (Angular): never a rendered box.
    expect(["absent", "none"]).toContain(seen.actionBox);
  });
}
