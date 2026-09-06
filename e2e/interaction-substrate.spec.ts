import { expect, test } from "@playwright/test";

test("one adopted host composes tooltip, dialog, handlers, refs and focus return", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async url => { (await import(/* @vite-ignore */ url)).mountFixture(); }, "/e2e/fixtures/interaction-substrate.tsx");
  const fixture = page.getByRole("region", { name: "Interaction substrate fixture" });
  const trigger = fixture.getByRole("button", { name: "Open composed dialog" });
  await expect(trigger).toHaveCount(1);
  await trigger.focus();
  await expect(page.getByRole("tooltip")).toContainText("Shared trigger help");
  await trigger.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Composed dialog" });
  await expect(dialog).toBeVisible();
  await expect(fixture.getByTestId("activation-counts")).toHaveText("1:1");
  await expect(fixture.getByTestId("ref-host")).toHaveText("shared-dialog-invoker");
  await dialog.getByRole("button", { name: "Finish" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("adopted repeated triggers hide inactive content in layout and accessibility", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async url => { (await import(/* @vite-ignore */ url)).mountFixture(); }, "/e2e/fixtures/interaction-substrate.tsx");
  const fixture = page.getByRole("region", { name: "Interaction substrate fixture" });
  const first = fixture.getByRole("button", { name: "First disclosure" });
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await first.press("Space");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(fixture.getByRole("button", { name: "First panel action" })).toHaveCount(0);
  await expect(fixture.getByText("First panel action", { exact: true })).toBeHidden();
  await first.press("Enter");
  await expect(fixture.getByRole("button", { name: "First panel action" })).toBeVisible();
  await fixture.getByRole("button", { name: "Second disclosure" }).click();
  await expect(fixture.getByRole("button", { name: "First panel action" })).toBeVisible();
  await expect(fixture.getByRole("button", { name: "Second panel action" })).toBeVisible();
  await fixture.getByRole("tab", { name: "Second tab" }).click();
  await expect(fixture.getByRole("button", { name: "First tab action" })).toHaveCount(0);
  await expect(fixture.getByText("First tab action", { exact: true })).toBeHidden();
  await expect(fixture.getByRole("button", { name: "Second tab action" })).toBeVisible();
  const clipped = fixture.locator(".show-more__content");
  const collapsedHeight = await clipped.evaluate(el => el.getBoundingClientRect().height);
  await fixture.getByRole("button", { name: "Show more", exact: true }).click();
  await expect.poll(() => clipped.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(collapsedHeight);
});

for (const framework of ["react", "vue", "svelte", "angular", "lit"]) {
  test(`${framework}: boolean interaction follows controlled parent updates`, async ({ page }) => {
    await page.goto(`/preview/${framework}/ShowMore`);
    await page.locator("body[data-fsds-ready]").waitFor({ state: "attached" });
    const trigger = page.locator(".show-more__trigger");
    for (const expanded of [false, true, false]) {
      const label = `Controlled ${expanded}`;
      await page.evaluate(props => window.postMessage({ type: "fsds:config", props, tokenCss: "" }, "*"), { expanded, showMoreLabel: label, showLessLabel: label });
      await expect(trigger).toHaveText(label);
      await expect(trigger).toHaveAttribute("aria-expanded", String(expanded));
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", String(expanded));
    }
  });
}
