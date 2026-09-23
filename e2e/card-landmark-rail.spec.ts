/**
 * Card landmark runtime rail (DS-CARD-HEADER-VUE-TESTID-01).
 *
 * A card's header and footer belong to the card, not the page. A consumer
 * page with cards outside any sectioning element got one `banner` per
 * CardHeader and one `contentinfo` per CardFooter, because those parts
 * rendered as <header>/<footer>. This rail asks Chromium's own role
 * computation, not a DOM query.
 *
 * The display-case view nests its cards inside sectioning content, where
 * even a real <header> is generic, so the rendered cards are first lifted
 * to <body> to reproduce the consumer's context. Without that step this
 * rail passes on the defective markup too.
 *
 * What this rail does NOT prove: Vue, Svelte, Lit or Angular output (the
 * display case composes React only; the per-framework Card suites pin the
 * same rule against mounted output), or screen-reader landmark navigation.
 */

import { test, expect } from "@playwright/test";

test("React: composed CardHeader/CardFooter expose no banner or contentinfo outside sectioning content", async ({ page }) => {
  await page.goto("/#/display-case", { waitUntil: "domcontentloaded" });
  await page.locator(".card__header").first().waitFor({ state: "attached", timeout: 30_000 });
  await page.evaluate(() => {
    for (const header of Array.from(document.querySelectorAll(".card__header"))) {
      const card = header.closest(".card");
      if (card) document.body.append(card);
    }
  });

  const describe = (els: Element[]) => els.map((el) => `${el.tagName.toLowerCase()}.${el.className}`);
  const headerCount = await page.locator(".card__header").count();
  const banners = await page.getByRole("banner").evaluateAll(describe);
  const contentinfo = await page.getByRole("contentinfo").evaluateAll(describe);

  expect(headerCount, "the display case composes CardHeaders").toBeGreaterThan(0);
  expect(banners.filter((b) => b.includes("card__header")), `banners: ${JSON.stringify(banners)}`).toEqual([]);
  expect(contentinfo.filter((c) => c.includes("card__footer")), `contentinfo: ${JSON.stringify(contentinfo)}`).toEqual([]);
});
