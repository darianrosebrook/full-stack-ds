import { expect, test } from "@playwright/test";

for (const width of [1153, 390]) {
  test(`generated showcase surfaces fit ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 943 });
    await page.addInitScript(() => {
      localStorage.setItem("fsds-prefs", JSON.stringify({ sidebarVisible: false, tracePanelVisible: false }));
      localStorage.setItem("fsds-theme", "dark");
    });
    for (const [name, route] of [
      ["home", "/#/"], ["tokens", "/#/tokens"],
      ["card", "/#/component/Card/design"], ["source", "/#/component/CodeBlock/developer"],
    ]) {
      await page.goto(route);
      await expect(page.locator('.showcase-card[data-fsds-component="card"]').first()).toBeVisible();
      await expect(page.locator(".panel, .pill, .showcase-card:not([data-fsds-component])")).toHaveCount(0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, name).toBeLessThanOrEqual(1);
      const subject = name === "source"
        ? page.locator("section").filter({ has: page.getByRole("heading", { name: "Component source", exact: true }) }).locator(".source-viewer__code")
        : page.locator('.showcase-card[data-fsds-component="card"]').first();
      await subject.scrollIntoViewIfNeeded();
      await page.screenshot({ animations: "disabled", path: info.outputPath(`${name}-${width}.png`) });
    }
  });
}

test("showcase Card styling does not leak into the component being demonstrated", async ({ page }) => {
  await page.goto("/#/component/Card/design");
  const example = page.locator('[data-usage-preview] [data-fsds-component="card"]').first();
  await expect(example).toBeVisible();
  await expect(example).toHaveCSS("padding-top", "16px");
  await expect(example).toHaveCSS("border-top-left-radius", "8px");
});

test("inspector disclosure keeps hidden controls out of keyboard navigation", async ({ page }, info) => {
  await page.setViewportSize({ width: 1153, height: 943 });
  await page.goto("/#/component/Card/design");
  const trigger = page.getByRole("button", { name: "Box model", exact: true });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const content = page.locator(`[id="${await trigger.getAttribute("aria-controls")}"]`);
  await expect(content.getByRole("button").first()).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(content).toBeHidden();
  await page.keyboard.press("Tab");
  const hiddenFocused = await content.evaluate(el => el.contains(document.activeElement));
  expect(hiddenFocused).toBe(false);
  await trigger.click();
  await expect(content).toBeVisible();
  await page.screenshot({ animations: "disabled", path: info.outputPath("inspector.png") });
});

test("JSON disclosures use generated Details with native keyboard activation", async ({ page }, info) => {
  await page.goto("/#/component/Card/developer");
  await page.getByRole("tab", { name: "Contract", exact: true }).click();
  const anatomy = page.locator('.json-tree [data-path="anatomy"] > details');
  await expect(anatomy).toHaveAttribute("data-fsds-component", "details");
  await expect(anatomy).not.toHaveAttribute("open");
  await anatomy.locator(":scope > summary").focus();
  await page.keyboard.press("Enter");
  await expect(anatomy).toHaveAttribute("open");
  await expect(page.locator('.json-tree [data-path="anatomy.parts"]')).toBeVisible();
  await page.keyboard.press("Space");
  await expect(anatomy).not.toHaveAttribute("open");
  await expect(page.locator('.json-tree [data-path="anatomy.parts"]')).toHaveCount(0);
  await anatomy.locator(":scope > summary").click();
  await page.screenshot({ animations: "disabled", path: info.outputPath("json-disclosures.png") });
});

test("generated token editor controls remain usable in their popover", async ({ page }, info) => {
  await page.setViewportSize({ width: 1153, height: 943 });
  await page.goto("/#/component/Card/design");
  const trigger = page.locator(".fsds-pp .fsds-tvc__trigger").first();
  await expect(trigger).toHaveAttribute("data-fsds-component", "button");
  const label = (await trigger.getAttribute("aria-label"))!.replace(/^Edit /, "");
  await trigger.click();
  const input = page.getByRole("textbox", { name: `${label} value`, exact: true });
  await expect(input).toHaveAttribute("data-fsds-component", "input");
  await input.fill("23px");
  await expect(page.locator(".fsds-pp__overrides-count")).toHaveText("1 override");
  await expect(page.locator(".fsds-tvc__popover")).toHaveCSS("opacity", "1");
  await page.screenshot({ animations: "disabled", path: info.outputPath("token-editor.png") });
  await page.setViewportSize({ width: 390, height: 943 });
  // The responsive shell hides the inspector. Reopen it through its control.
  await page.getByRole("button", { name: "Show inspector", exact: true }).click();
  await trigger.click();
  await expect(input).toHaveValue("23px");
  const popup = page.locator(".fsds-tvc__popover");
  await expect.poll(() => popup.evaluate(el => {
    const rect = el.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= innerWidth && el.scrollWidth <= el.clientWidth + 1;
  })).toBe(true);
  await page.screenshot({ animations: "disabled", path: info.outputPath("token-editor-390.png") });
  await page.keyboard.press("Escape");
  await expect(input).toBeHidden();
  await expect(trigger).toHaveText(/23/);
});
