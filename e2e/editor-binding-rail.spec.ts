/** The shared box-model controls are consumed at every component boundary. */
import { test, expect, type Page } from "@playwright/test";

const SCRATCH_URL = "/#/scratch/properties-panel";

async function openScratchPanel(page: Page) {
  await page.goto(SCRATCH_URL);
  // The panel header names the active component; Button is the first seed.
  await expect(page.locator(".fsds-pp__title")).toHaveText("Button");
  // The preview iframe mounts the react Button; wait until its host exists.
  const frame = page.frameLocator("iframe").first();
  await expect(
    frame.locator('[data-fsds-component="button"]').first(),
  ).toBeVisible();
  return frame;
}

async function computedGap(page: Page): Promise<string> {
  return page.evaluate(() => {
    const iframe = document.querySelector("iframe");
    if (!iframe || !iframe.contentDocument) return "no-iframe";
    const host = iframe.contentDocument.querySelector(
      '[data-fsds-component="button"]',
    );
    if (!host) return "no-host";
    return getComputedStyle(host).gap;
  });
}

test.describe("properties panel shared box bindings", () => {
  test("Button gap control sets the shared slot and clearing restores its default", async ({ page }) => {
    const frame = await openScratchPanel(page);
    await page.getByRole("button", { name: "Component tokens", exact: true }).click();
    const gapInput = page.getByLabel("box-model.gap value", { exact: true }).first();
    await expect(gapInput).toBeVisible();
    await expect(gapInput).toBeEnabled();
    const baseline = await computedGap(page);
    expect(baseline).toBe("8px");
    await gapInput.fill("24px");
    await expect.poll(() => computedGap(page)).toBe("24px");
    await gapInput.fill("");
    await expect.poll(() => computedGap(page)).toBe(baseline);
    await expect(frame.locator('[data-fsds-component="button"]').first()).toBeVisible();
  });

  test("the shared gap is no longer presented as an unwired component token", async ({page}) => {
    await openScratchPanel(page);
    await page.getByRole("button", {name:"Component tokens",exact:true}).click();
    await expect(page.locator('[data-unwired="box-model.gap"]')).toHaveCount(0);
    await expect(page.getByLabel("box-model.gap value", {exact:true}).first()).toBeEnabled();
  });
});
