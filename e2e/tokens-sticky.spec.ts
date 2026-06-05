import { test, expect } from "@playwright/test";

/**
 * SHOWCASE-TOKENS-STICKY-01 — regression guard for the Tokens-table sticky header.
 *
 * The token explorer's column header is `position: sticky; top: 0`, but it lived
 * inside `.panel.tokens-card { overflow: hidden }`, which establishes a
 * (programmatically) scrollable container — so the <th> bound to that
 * non-scrolling panel and scrolled away instead of pinning to the real page
 * scroller (`main.app-main`). The fix switches the panel to `overflow: clip`,
 * which clips the rounded corners WITHOUT establishing a scroll container, so the
 * sticky header skips it and pins to `main.app-main`.
 *
 * This encodes the diagnostic probe: scroll `main.app-main`, then assert the
 * header pins at the scroller's top rather than moving by the full scroll delta.
 */
test.describe("Tokens table sticky header", () => {
  test("the column header pins to main.app-main as the page scrolls", async ({ page }) => {
    await page.goto("/#/tokens");

    const th = page.locator(".tokens-table.table thead th.table__headerCell").first();
    await expect(th).toBeVisible();

    const probe = await page.evaluate(async () => {
      const wrap = document.querySelector(".tokens-table.table");
      const header = wrap?.querySelector("thead th.table__headerCell");
      const scroller = document.querySelector("main.app-main");
      if (!header || !scroller) throw new Error("tokens table or scroller not found");
      const settle = () =>
        new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      (scroller as HTMLElement).scrollTop = 0;
      await settle();
      const before = header.getBoundingClientRect().top;

      (scroller as HTMLElement).scrollTop = 900;
      await settle();
      const after = header.getBoundingClientRect().top;
      const scrollerTop = scroller.getBoundingClientRect().top;

      (scroller as HTMLElement).scrollTop = 0;
      return { before, after, scrollerTop, noStickyWouldBe: before - 900 };
    });

    // Pinned: after scrolling, the header stays at the scroll container's top edge…
    expect(Math.abs(probe.after - probe.scrollerTop)).toBeLessThanOrEqual(10);
    // …and explicitly NOT the no-sticky behavior (scrolled away by the full delta).
    expect(probe.after).toBeGreaterThan(probe.noStickyWouldBe + 100);
  });
});
