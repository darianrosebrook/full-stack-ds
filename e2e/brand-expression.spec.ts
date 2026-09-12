import { expect, test } from "@playwright/test";

const brands = ["default", "canary", "corporate", "developer", "fintech", "forest", "marketplace", "monochrome", "quickserve", "streaming"];
const headingWeights: Record<string, string> = { default: "500", canary: "700", corporate: "600", developer: "600", fintech: "600", forest: "500", marketplace: "600", monochrome: "700", quickserve: "800", streaming: "800" };
for (const theme of ["light", "dark"]) {
  test(`${theme}: brands reach content, detached menus and application rhythm`, async ({ page }, info) => {
    await page.setViewportSize({ width: 1427, height: 1205 });
    await page.emulateMedia({ colorScheme: theme === "light" ? "dark" : "light", reducedMotion: "reduce" });
    await page.addInitScript(theme => {
      localStorage.setItem("fsds-theme", theme);
      localStorage.setItem("fsds-brand", "default");
    }, theme);
    await page.goto("/#/component/CodeBlock/design");
    const measurements: Record<string, { radius: string; menuRadius: string; padding: string; weight: string; family: string }> = {};
    for (const brand of brands) {
      await page.getByRole("button", { name: "Appearance settings" }).click();
      const choices = page.getByRole("radiogroup", { name: "Brand theme" });
      await choices.getByRole("radio", { name: new RegExp(`^${brand}$`, "i") }).check();
      await expect(choices.getByRole("radio", { name: new RegExp(`^${brand}$`, "i") })).toBeChecked();
      const menu = page.locator("[data-popover-content]");
      const source = page.locator("[data-usage-preview] pre.code-block").first();
      const codeRadius = await source.evaluate(e => getComputedStyle(e).borderTopLeftRadius);
      const menuRadius = await menu.evaluate(e => getComputedStyle(e).borderTopLeftRadius);
      expect(parseFloat(codeRadius)).toBeLessThanOrEqual(12);
      expect(parseFloat(menuRadius)).toBeLessThanOrEqual(16);
      const bounds = await menu.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1427);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(1205);
      await expect(source).toContainText("export function sum");
      measurements[brand] = {
        radius: codeRadius, menuRadius,
        padding: await page.locator(".page").evaluate(e => getComputedStyle(e).paddingTop),
        weight: await page.locator(".page-title").evaluate(e => getComputedStyle(e).fontWeight),
        family: await page.locator(".page-title").evaluate(e => getComputedStyle(e).fontFamily),
      };
      expect(measurements[brand].weight, `${brand} heading weight in ${theme}`).toBe(headingWeights[brand]);
      await page.screenshot({ animations: "disabled", path: info.outputPath(`${brand}-${theme}.png`) });
      await page.keyboard.press("Escape");
      await expect(menu).not.toBeVisible();
    }
    // These are design distinctions, not a generated-value snapshot: pill CTAs
    // must not turn code or detached menu surfaces into capsules.
    expect(measurements.streaming).toMatchObject({ radius: "8px", menuRadius: "12px", weight: "800" });
    expect(measurements.monochrome).toMatchObject({ radius: "0px", menuRadius: "0px", weight: "700" });
    expect(measurements.forest.family).toContain("Georgia");
    expect(measurements.forest.padding).not.toBe(measurements.corporate.padding);
    expect(measurements.default.radius).toBe("6px");
    await info.attach("brand-measurements", { body: JSON.stringify(measurements, null, 2), contentType: "application/json" });
    // Named Default and the showcase's absent data-brand state must agree.
    await page.getByRole("button", { name: "Appearance settings" }).click();
    await page.getByRole("radio", { name: /^default$/i }).check();
    await expect(page.locator("html")).not.toHaveAttribute("data-brand");
    const source = page.locator("[data-usage-preview] pre.code-block").first();
    await expect(source).toHaveCSS("border-radius", measurements.default.radius);
    await page.evaluate(() => { document.documentElement.dataset.brand = "default"; });
    await expect(source).toHaveCSS("border-radius", measurements.default.radius);
  });
}

for (const framework of ["react", "vue", "svelte", "angular", "lit"]) {
  test(`${framework}: Streaming separates code and action shape; consumer overrides still win`, async ({ page }) => {
    await page.goto(`/preview/${framework}/CodeBlock`);
    await page.locator("body[data-fsds-ready]").waitFor();
    await page.evaluate(() => { document.documentElement.dataset.brand = "streaming"; });
    const source = page.locator("pre.code-block");
    await expect(source).toHaveCSS("border-radius", "8px");
    await expect(source).toHaveCSS("border-width", "0px");
    await source.evaluate(e => (e as HTMLElement).style.setProperty("--fsds-code-block-design-root-shape-radius", "3px"));
    await expect(source).toHaveCSS("border-radius", "3px");
    await page.goto(`/preview/${framework}/Button`);
    await page.locator("body[data-fsds-ready]").waitFor();
    await page.evaluate(() => { document.documentElement.dataset.brand = "streaming"; });
    await expect(page.locator("button.button").first()).toHaveCSS("border-radius", "9999px");
  });
}

test("application cards retain distinct brand surfaces and readable content", async ({ page }, info) => {
  await page.setViewportSize({ width: 1427, height: 1205 });
  await page.addInitScript(() => { localStorage.setItem("fsds-theme", "light"); });
  await page.goto("/#/");
  for (const brand of ["corporate", "forest", "monochrome", "streaming"]) {
    await page.getByRole("button", { name: "Appearance settings" }).click();
    await page.getByRole("radio", { name: new RegExp(`^${brand}$`, "i") }).check();
    await page.keyboard.press("Escape");
    const card = page.locator(".card").filter({ hasText: "React 19" }).first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    const style = await card.evaluate(e => {
      const s = getComputedStyle(e);
      return { radius: s.borderTopLeftRadius, border: s.borderTopWidth, shadow: s.boxShadow, padding: s.paddingTop };
    });
    if (brand === "forest") {
      expect(style).toMatchObject({ radius: "24px", border: "0px", padding: "20px" });
      expect(style.shadow).not.toBe("none");
    } else if (brand === "corporate") {
      expect(style).toMatchObject({ radius: "4px", border: "1px", padding: "8px" });
    } else if (brand === "monochrome") {
      expect(style).toMatchObject({ radius: "0px", border: "1px" });
    } else {
      expect(style).toMatchObject({ radius: "12px", border: "0px" });
    }
    await page.screenshot({ animations: "disabled", path: info.outputPath(`${brand}-application.png`) });
  }
});

test("spacious brand menu remains usable in a narrow viewport", async ({ page }, info) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    localStorage.setItem("fsds-brand", "forest");
    localStorage.setItem("fsds-theme", "light");
  });
  await page.goto("/#/component/CodeBlock/design");
  await page.getByRole("button", { name: "Appearance settings" }).click();
  const menu = page.locator("[data-popover-content]");
  await expect(menu).toBeVisible();
  // Wait for the real entrance transition, then measure its resting bounds.
  await expect.poll(async () => menu.evaluate(e => new DOMMatrixReadOnly(getComputedStyle(e).transform).isIdentity)).toBe(true);
  const bounds = await menu.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(812);
  await page.getByRole("radio", { name: "Streaming", exact: true }).check();
  await expect(page.getByRole("radio", { name: "Streaming", exact: true })).toBeChecked();
  await page.screenshot({ animations: "disabled", path: info.outputPath("narrow-streaming.png") });
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
});
