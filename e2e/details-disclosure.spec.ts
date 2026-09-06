import { test, expect } from "@playwright/test";
import { resolve } from "node:path";
import { listComponentContracts } from "../packages/ds-codegen/src/contracts-fs";

const components = listComponentContracts(resolve("packages/ds-contracts")).map(c => c.name).sort();

test("homepage parity matrix opens by mouse and keyboard and contains the corpus", async ({ page }) => {
  await page.goto("/");
  const summary = page.locator("summary").filter({ hasText: "targets × components matrix" });
  const table = page.getByRole("table", { name: /Parity matrix/ });
  await expect(table).toHaveCount(0);
  await summary.click();
  await expect(table).toBeVisible();
  await expect(table.locator("tbody tr")).toHaveCount(components.length);
  expect((await table.locator("tbody tr td:first-child").allTextContents()).sort()).toEqual(components);
  await summary.press("Enter");
  await expect(table).toHaveCount(0);
  await summary.press("Space");
  await expect(table).toBeVisible();
});

for (const framework of ["react", "vue", "svelte", "lit", "angular"]) {
  test(`${framework}: native summary activation and disabled state`, async ({ page }) => {
    await page.goto(`/preview/${framework}/Details`);
    await page.locator("body[data-fsds-ready]").waitFor({ state: "attached" });
    const root = page.locator("details.details");
    const summary = root.locator("summary");
    const content = root.locator(".details__content");
    // Preview defaults may start expanded. Read the host before activation.
    const initiallyOpen = await root.evaluate(el => (el as HTMLDetailsElement).open);
    await summary.click();
    await expect(root).toHaveJSProperty("open", !initiallyOpen);
    await expect(content).toHaveCount(initiallyOpen ? 0 : 1);
    await summary.press("Enter");
    await expect(root).toHaveJSProperty("open", initiallyOpen);
    await summary.press("Space");
    await expect(root).toHaveJSProperty("open", !initiallyOpen);
    // The four shared config renderers record callbacks; Angular's synthesized
    // host exposes DOM state but does not expose that callback recorder.
    if (framework !== "angular") {
      const calls = await page.evaluate(() => (window as unknown as {
        __fsdsCallbackLog: Array<{ name: string; args: unknown[] }>;
      }).__fsdsCallbackLog.filter(entry => entry.name === "onOpenChange").map(entry => entry.args));
      expect(calls).toEqual([[!initiallyOpen], [initiallyOpen], [!initiallyOpen]]);
    }
    for (const open of [false, true]) {
      await page.evaluate(nextOpen => window.postMessage({ type: "fsds:config", props: { summary: `Controlled ${nextOpen}`, open: nextOpen }, tokenCss: "" }, "*"), open);
      await expect(summary).toHaveText(`Controlled ${open}`);
      await expect(root).toHaveJSProperty("open", open);
      await summary.click();
      await expect(root).toHaveJSProperty("open", open);
      await expect(content).toHaveCount(open ? 1 : 0);
    }
    for (const open of [false, true]) {
      await page.evaluate(nextOpen => window.postMessage({ type: "fsds:config", props: { summary: `Disabled ${nextOpen}`, disabled: true, open: nextOpen }, tokenCss: "" }, "*"), open);
      await expect(summary).toHaveText(`Disabled ${open}`);
      await expect(summary).toHaveAttribute("aria-disabled", "true");
      await summary.click({ force: true });
      await expect(root).toHaveJSProperty("open", open);
      await summary.press("Enter");
      await expect(root).toHaveJSProperty("open", open);
      await summary.press("Space");
      await expect(root).toHaveJSProperty("open", open);
      await expect(content).toHaveCount(open ? 1 : 0);
    }
    if (framework !== "angular") {
      const calls = await page.evaluate(() => (window as unknown as {
        __fsdsCallbackLog: Array<{ name: string; args: unknown[] }>;
      }).__fsdsCallbackLog.filter(entry => entry.name === "onOpenChange").map(entry => entry.args));
      expect(calls).toEqual([[!initiallyOpen], [initiallyOpen], [!initiallyOpen], [true], [false]]);
    }
  });
}
