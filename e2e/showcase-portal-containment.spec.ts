import { expect, test } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const COMPONENTS_ROOT = join(
  process.cwd(),
  "packages/ds-contracts/components",
);

function openOverlayUsageComponents(): string[] {
  return readdirSync(COMPONENTS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => {
      const folder = join(COMPONENTS_ROOT, name);
      const contract = JSON.parse(
        readFileSync(join(folder, `${name}.contract.json`), "utf8"),
      ) as {
        portal?: { enabled?: boolean };
        surface?: { positioning?: { strategy?: string } };
      };
      if (contract.portal?.enabled !== true) return false;
      if (
        contract.surface?.positioning?.strategy !== "centered" &&
        contract.surface?.positioning?.strategy !== "viewport-edge"
      ) {
        return false;
      }
      const usage = JSON.parse(
        readFileSync(join(folder, `${name}.usage.jsonl`), "utf8").split("\n")[0],
      ) as { tree: Record<string, { props?: { open?: boolean } }> };
      return Object.values(usage.tree)[0]?.props?.open === true;
    })
    .sort();
}

const OPEN_OVERLAY_EXAMPLES = openOverlayUsageComponents();

test.describe("showcase portal containment", () => {
  test("the corpus-derived open-overlay inventory remains exercised", () => {
    expect(OPEN_OVERLAY_EXAMPLES).toEqual([
      "Command",
      "Dialog",
      "Sheet",
      "Toast",
    ]);
  });

  for (const component of OPEN_OVERLAY_EXAMPLES) {
    test(`${component} stays inside a viewport-scale example canvas`, async ({
      page,
    }) => {
      await page.goto(`/#/component/${component}/design`, {
        waitUntil: "domcontentloaded",
      });

      const block = component.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
      const root = page.locator(`.${block}`).first();
      await expect(root).toBeVisible();

      const facts = await root.evaluate((element) => {
        const portal = element.closest<HTMLElement>("[data-fsds-preview-portal]");
        const frame = portal?.closest<HTMLElement>(".preview-frame");
        const frameRect = frame?.getBoundingClientRect();
        const rootRect = element.getBoundingClientRect();
        return {
          insidePortal: portal !== null,
          parentIsBody: element.parentElement === document.body,
          bodyOverflow: document.body.style.overflow,
          portalKind: portal?.dataset.fsdsPreviewPortal,
          frameHeight: frameRect?.height ?? 0,
          rootInsideFrame:
            frameRect !== undefined &&
            rootRect.left >= frameRect.left &&
            rootRect.right <= frameRect.right &&
            rootRect.top >= frameRect.top &&
            rootRect.bottom <= frameRect.bottom,
        };
      });

      expect(facts).toEqual({
        insidePortal: true,
        parentIsBody: false,
        bodyOverflow: "",
        portalKind: "overlay",
        frameHeight: expect.any(Number),
        rootInsideFrame: true,
      });
      expect(facts.frameHeight).toBeGreaterThanOrEqual(420);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("main")).toBeVisible();
    });
  }
});
