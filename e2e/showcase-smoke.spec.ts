import { test, expect, type FrameLocator, type Page } from "@playwright/test";

const FRAMEWORKS = ["React", "Vue", "Svelte", "Angular", "Lit"] as const;
type FrameworkLabel = (typeof FRAMEWORKS)[number];

async function gotoComponent(page: Page, name: string) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });
  // Pre-set hash before navigation so the SPA mounts the right route on first paint.
  await page.goto(`/#/component/${name}/developer`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
  return errors;
}

async function selectFramework(page: Page, label: FrameworkLabel) {
  const tab = page.getByRole("tab", { name: label, exact: true });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
}

function getPreviewFrame(page: Page, label: FrameworkLabel, component: string): FrameLocator {
  const key = label.toLowerCase();
  const title = `${key} preview · ${component}`;
  return page.frameLocator(`iframe[title="${title}"]`);
}

async function waitForPreviewNotError(page: Page) {
  // The parent renders <div class="preview-status preview-status--error" role="alert">
  // when the iframe posts fsds:error. Fail fast if that appears.
  const errAlert = page.locator(".preview-status--error");
  await expect(errAlert).toHaveCount(0);
}

test.describe("Showcase iframe runner — per-framework smoke", () => {
  for (const label of FRAMEWORKS) {
    test(`renders Button in ${label}`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = await gotoComponent(page, "Button");
      await selectFramework(page, label);

      const frame = getPreviewFrame(page, label, "Button");

      if (label === "Angular") {
        // Angular live preview is intentionally a static placeholder in this
        // showcase — the in-browser Angular compiler+bootstrap was deferred
        // in the original plan. The static shell shows "Angular live preview
        // unavailable" and provides a link to view the source instead. The
        // smoke just verifies the shell renders.
        await expect(frame.getByRole("heading", { name: /Angular live preview unavailable/i })).toBeVisible({ timeout: 60_000 });
        await waitForPreviewNotError(page);
        expect(errors, `unexpected page errors during ${label} preview`).toEqual([]);
        return;
      }

      // Button renders a real <button> with text children. The Button
      // contract was recently updated to include { tag: "children" } in its
      // anatomy; before that fix, the codegen destructured `children` but
      // never rendered them, so every framework produced an empty button.
      // React/Vue/Svelte: <button class="button">Button</button>.
      // Lit: <fsds-button>Button</fsds-button> (light-DOM text slotted into
      // the shadow-DOM <button>). Body-level text assertion covers both.
      const button = frame.locator("button").first();
      await expect(button).toBeVisible({ timeout: 60_000 });
      const body = frame.locator("body");
      await expect(body).toContainText("Button", { timeout: 60_000 });

      await waitForPreviewNotError(page);

      // Surface any unhandled page-level errors the iframe leaked.
      expect(errors, `unexpected page errors during ${label} preview`).toEqual([]);
    });
  }
});
