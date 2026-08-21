/**
 * EDITOR-CONTROL-BINDING-PROOF — browser rail (FIX-EDITOR-CONTROL-BINDING-PROOF-01 A1/A2).
 *
 * Proves, in a real Chromium over the scratch properties panel, that the
 * editor's token controls are wire-honest:
 *
 *   A2 (both directions): the gap control for Button binds the slot the
 *   generated CSS provably reads (`button.size.gap.default`) — the control is
 *   OFFERED under that label, changing it MOVES the preview's computed gap,
 *   and reverting restores the baseline value. The pre-fix binding
 *   (`box-model.gap`, authored first but never read) must be unreachable as a
 *   live control.
 *
 *   A1 (dead control unreachable): Button's `box-model.gap` row — declared
 *   interface, zero CSS reads — renders explicitly UNWIRED (badge + disabled
 *   input), never as an editable control.
 *
 * Non-claims: this rail proves the scratch-panel wiring for Button only, not
 * corpus-wide computed-style behavior, not visual quality, and nothing about
 * frameworks other than react (the preview mount used by the panel).
 */
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

test.describe("properties panel read-proof (FIX-EDITOR-CONTROL-BINDING-PROOF-01)", () => {
  test("A2: Button gap control binds the read slot and moving it moves the computed style — both directions", async ({ page }) => {
    const frame = await openScratchPanel(page);

    // The gap control is offered under the READ slot's label. Pre-fix this
    // input did not exist (the control bound box-model.gap instead).
    const gapInput = page.getByLabel("button.size.gap.default value");
    await expect(gapInput).toBeVisible();

    // The dead binding must not be offered as a live control anywhere.
    await expect(page.getByLabel("box-model.gap value", { exact: true })).toHaveCount(0);

    // Baseline computed gap on the preview host.
    const baseline = await computedGap(page);
    expect(baseline).not.toBe("no-iframe");
    expect(baseline).not.toBe("no-host");

    // Direction 1: override moves the computed style.
    await gapInput.fill("24px");
    await expect
      .poll(() => computedGap(page), { timeout: 5_000 })
      .toBe("24px");

    // Direction 2: clearing the override restores the baseline — the control
    // cannot pass by freezing the preview at any single value.
    await gapInput.fill("");
    await expect
      .poll(() => computedGap(page), { timeout: 5_000 })
      .toBe(baseline);

    // The preview host is still alive (the panel did not unmount the iframe).
    await expect(
      frame.locator('[data-fsds-component="button"]').first(),
    ).toBeVisible();
  });

  test("A1: an unread slot renders explicitly unwired — badge + disabled input, never a live control", async ({ page }) => {
    await openScratchPanel(page);

    // Expand the Component tokens section (collapsed by default).
    await page.getByRole("button", { name: "Component tokens" }).click();

    // Button's box-model.gap row: declared interface, zero CSS reads.
    const unwiredRow = page.locator('[data-unwired="box-model.gap"]');
    await expect(unwiredRow).toBeVisible();
    await expect(
      unwiredRow.getByLabel("box-model.gap value (unwired)"),
    ).toBeDisabled();
    await expect(unwiredRow.locator(".fsds-pp__unwired-badge")).toHaveText(
      "unwired",
    );

    // And no editable control for the unread slot exists anywhere in the
    // panel — the pre-fix live knob is unreachable.
    await expect(page.getByLabel("box-model.gap value", { exact: true })).toHaveCount(0);
  });
});
