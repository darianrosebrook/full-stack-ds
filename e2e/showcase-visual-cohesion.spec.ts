import { expect, test, type Page } from "@playwright/test";

const BADGE_DESIGN_ROUTE = "/#/component/Badge/design";

async function openBadgeDesign(page: Page, theme: "light" | "dark" = "dark") {
  await page.addInitScript((nextTheme) => {
    localStorage.setItem("fsds-theme", nextTheme);
  }, theme);
  await page.setViewportSize({ width: 1798, height: 1502 });
  await page.goto(BADGE_DESIGN_ROUTE, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await expect(page.locator(".fsds-pp__toggle")).toBeVisible();
}

test.describe("Showcase visual cohesion", () => {
  test("icon-only Button content is centered on the same axis as a bare icon link", async ({
    page,
  }) => {
    await openBadgeDesign(page);

    const offsets = await page.locator(".header-actions .icon-btn .icon").evaluateAll((icons) =>
      icons.map((icon) => {
        const control = icon.closest<HTMLElement>(".icon-btn");
        if (!control) throw new Error("header icon is missing its icon-btn control");
        const iconRect = icon.getBoundingClientRect();
        const controlRect = control.getBoundingClientRect();
        return {
          x: iconRect.x + iconRect.width / 2 - (controlRect.x + controlRect.width / 2),
          y: iconRect.y + iconRect.height / 2 - (controlRect.y + controlRect.height / 2),
        };
      }),
    );

    expect(offsets).toHaveLength(4);
    for (const offset of offsets) {
      expect(Math.abs(offset.x)).toBeLessThanOrEqual(0.25);
      expect(Math.abs(offset.y)).toBeLessThanOrEqual(0.25);
    }
  });

  test("properties-panel boolean and select controls use the same compact height", async ({
    page,
  }) => {
    await openBadgeDesign(page);

    const geometry = await page.evaluate(() => {
      const switchRoot = document.querySelector<HTMLElement>(".fsds-pp__toggle .switch");
      const select = document.querySelector<HTMLElement>(".fsds-pp__input");
      if (!switchRoot || !select) throw new Error("properties controls did not render");
      return {
        switchClass: switchRoot.className,
        switchHeight: switchRoot.getBoundingClientRect().height,
        selectHeight: select.getBoundingClientRect().height,
      };
    });

    expect(geometry.switchClass).toContain("switch--sm");
    expect(geometry.switchHeight).toBe(24);
    expect(geometry.selectHeight).toBe(24);
  });

  test("nutrition tables fill their evidence column and resolve dark-theme semantic colors", async ({
    page,
  }) => {
    await openBadgeDesign(page, "dark");

    const facts = await page.locator(".nutrition-facts").first().evaluate((panel) => {
      const parent = panel.parentElement;
      const table = panel.querySelector<HTMLElement>(".nutrition-table");
      const header = document.querySelector<HTMLElement>(".app-header");
      if (!parent || !table || !header) throw new Error("nutrition table fixture is incomplete");
      const panelStyle = getComputedStyle(panel);
      return {
        panelWidth: panel.getBoundingClientRect().width,
        parentWidth: parent.getBoundingClientRect().width,
        tableWidth: table.getBoundingClientRect().width,
        panelContentWidth:
          panel.getBoundingClientRect().width -
          Number.parseFloat(panelStyle.paddingLeft) -
          Number.parseFloat(panelStyle.paddingRight) -
          Number.parseFloat(panelStyle.borderLeftWidth) -
          Number.parseFloat(panelStyle.borderRightWidth),
        background: panelStyle.backgroundColor,
        expectedBackground: getComputedStyle(header).backgroundColor,
        color: panelStyle.color,
        expectedColor: getComputedStyle(document.body).color,
      };
    });

    expect(Math.abs(facts.panelWidth - facts.parentWidth)).toBeLessThanOrEqual(1);
    expect(Math.abs(facts.tableWidth - facts.panelContentWidth)).toBeLessThanOrEqual(1);
    expect(facts.background).toBe(facts.expectedBackground);
    expect(facts.color).toBe(facts.expectedColor);
    expect(facts.background).not.toBe("rgb(255, 255, 255)");
  });

  test("sidebar navigation content is inset from the panel edge", async ({ page }) => {
    await openBadgeDesign(page);

    const inset = await page.evaluate(() => {
      const nav = document.querySelector<HTMLElement>(".sidebar-navlist");
      const firstLink = nav?.querySelector<HTMLElement>("a");
      if (!nav || !firstLink) throw new Error("sidebar navigation did not render");
      return firstLink.getBoundingClientRect().x - nav.getBoundingClientRect().x;
    });

    expect(inset).toBe(16);
  });
});
