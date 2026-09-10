import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 1153, height: 943 }, { width: 390, height: 700 }, { width: 320, height: 568 }]) {
  test(`palette fits ${viewport.width}px and filtered destinations remain reachable`, async ({ page }, info) => {
    await page.setViewportSize(viewport);
    await page.goto('/#/component/Card/design');
    await page.getByRole('button', { name: 'Open command palette (Ctrl+K or Cmd+K)', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
    await expect(dialog).toBeVisible();
    const facts = await dialog.evaluate(el => {
      const box = el.getBoundingClientRect();
      const results = el.querySelector('.command-palette__results')!;
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom,
        widthOverflow: results.scrollWidth - results.clientWidth,
        scrolls: results.scrollHeight > results.clientHeight };
    });
    expect(facts.left).toBeGreaterThanOrEqual(0);
    expect(facts.right).toBeLessThanOrEqual(viewport.width);
    expect(facts.top).toBeGreaterThanOrEqual(0);
    expect(facts.bottom).toBeLessThanOrEqual(viewport.height);
    expect(facts.widthOverflow).toBeLessThanOrEqual(1);
    expect(facts.scrolls).toBe(true);
    await page.getByLabel('Filter destinations').fill('Component complexity');
    await expect(dialog.getByRole('link', { name: 'Component complexity layers' })).toBeVisible();
    await page.screenshot({ path: info.outputPath(`palette-${viewport.width}.png`) });
    await dialog.getByRole('link', { name: 'Component complexity layers' }).click();
    await expect(page).toHaveURL(/#\/complexity$/);
    await expect(dialog).toHaveCount(0);
  });
}

test('Card has neutral borders and a single painted badge surface', async ({ page }, info) => {
  await page.setViewportSize({ width: 1153, height: 943 });
  await page.goto('/#/component/Card/design');
  await expect(page.getByLabel('status', { exact: true })).toHaveCount(0);
  const cards = page.locator('[data-usage-preview] .card');
  await expect(cards).toHaveCount(2);
  for (const card of await cards.all()) {
    const values = await card.evaluate(el => {
      const style = getComputedStyle(el);
      const badge = el.querySelector('.card__badge')!;
      const child = badge.querySelector('.badge')!;
      return { sides: [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor],
        widths: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
        badgeBackground: getComputedStyle(badge).backgroundColor,
        badgeWidth: badge.getBoundingClientRect().width, childWidth: child.getBoundingClientRect().width };
    });
    expect(new Set(values.sides).size).toBe(1);
    expect(new Set(values.widths).size).toBe(1);
    expect(values.badgeBackground).toBe('rgba(0, 0, 0, 0)');
    expect(values.badgeWidth).toBeCloseTo(values.childWidth, 0);
  }
  await cards.first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('card.png') });
});

test('panel buttons, palette commands and Command-Backslash collapse and restore panels', async ({ page }) => {
  await page.setViewportSize({ width: 1153, height: 943 });
  await page.goto('/#/component/Card/design');
  await page.getByRole('button', { name: 'Hide navigation', exact: true }).click();
  await expect(page.getByRole('complementary', { name: 'Component navigation' })).toHaveCount(0);
  await expect(page.getByRole('complementary', { name: 'Component inspector' })).toBeVisible();
  await page.getByRole('button', { name: 'Show navigation', exact: true }).click();
  await page.getByRole('button', { name: 'Hide inspector', exact: true }).click();
  await expect(page.getByRole('complementary', { name: 'Component inspector' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Open command palette (Ctrl+K or Cmd+K)', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Show inspector Right panel' }).click();
  await expect(page.getByRole('complementary', { name: 'Component inspector' })).toBeVisible();
  await page.getByLabel('Filter components', { exact: true }).focus();
  await page.keyboard.press('Meta+Backslash');
  await expect(page.getByRole('complementary')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Show navigation', exact: true })).toBeFocused();
  await page.keyboard.press('Meta+Backslash');
  await expect(page.getByRole('complementary')).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole('complementary')).toHaveCount(2);
});

test('token references reveal hidden destinations and survive reload', async ({ page }) => {
  await page.goto('/#/tokens');
  await expect(page.locator('.tokens-section-title').first()).toHaveText('Brand');
  const reference = page.locator('.token-ref[href]').first();
  const href = await reference.getAttribute('href');
  expect(href).toMatch(/^#\/tokens\?row=token-core-/);
  await page.getByRole('button', { name: 'Core', exact: true }).click();
  await reference.click();
  await expect(page).toHaveURL(new RegExp('row='));
  const target = decodeURIComponent(href!.split('row=')[1]);
  const row = page.locator(`[id="${target}"]`);
  await expect(row).toBeInViewport();
  await expect(row.locator('a.tokens-name-anchor')).toHaveText('#');
  await page.reload();
  await expect(page.locator(`[id="${target}"]`)).toBeInViewport();
});

test('Walkthrough launches, moves between real anchors, finishes and reopens', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto('/#/component/Walkthrough/design');
  const launch = page.getByRole('button', { name: 'Start walkthrough', exact: true });
  const tour = page.getByRole('status', { name: 'Dashboard onboarding tour' });
  await expect(tour).toHaveCount(0);
  await launch.click();
  await expect(tour).toBeVisible();
  await expect(tour.getByRole('button', { name: 'Previous step' })).toBeDisabled();
  const box = await tour.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await tour.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(tour).toContainText('2 of 3');
  await tour.getByRole('button', { name: 'Previous step' }).click();
  await expect(tour).toContainText('1 of 3');
  await tour.getByRole('button', { name: 'Make it yours', exact: true }).click();
  await expect(tour).toContainText('3 of 3');
  await page.screenshot({ path: info.outputPath('walkthrough-mobile.png') });
  await tour.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(tour).toHaveCount(0);
  await expect(launch).toBeFocused();
  await launch.click();
  await expect(tour).toContainText('1 of 3');
  await page.keyboard.press('Escape');
  await expect(tour).toHaveCount(0);
  await expect(launch).toBeFocused();
});

test('launched Dialog consumes scoped sizing overrides and restores its defaults', async ({ page }) => {
  await page.setViewportSize({ width: 1153, height: 943 });
  await page.goto('/#/component/Dialog/design');
  const example = page.locator('[data-usage-example="default"]');
  await example.getByRole('button', { name: 'Open dialog' }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete workspace' });
  await expect(dialog).toHaveCSS('width', '500px');
  const frame = example.locator('[data-usage-preview]');
  await frame.evaluate(el => {
    (el as HTMLElement).style.setProperty('--fsds-dialog-design-modal-sizing-width', '280px');
    (el as HTMLElement).style.setProperty('--fsds-dialog-design-modal-sizing-max-height', '180px');
  });
  await expect(dialog).toHaveCSS('width', '280px');
  expect((await dialog.boundingBox())!.height).toBeLessThanOrEqual(180);
  const body = dialog.locator('.dialog__body');
  expect(await body.evaluate(el => el.scrollHeight > el.clientHeight && el.clientHeight > 0)).toBe(true);
  await frame.evaluate(el => {
    (el as HTMLElement).style.removeProperty('--fsds-dialog-design-modal-sizing-width');
    (el as HTMLElement).style.removeProperty('--fsds-dialog-design-modal-sizing-max-height');
  });
  await expect(dialog).toHaveCSS('width', '500px');
});

test('brand token permalinks preserve the selected brand', async ({ page }) => {
  await page.goto('/#/tokens');
  await page.getByRole('radio', { name: 'forest', exact: true }).click();
  const link = page.locator('[id^="token-brand-"] .tokens-name-anchor').first();
  const href = await link.getAttribute('href');
  expect(href).toContain('&brand=forest');
  await link.click();
  await page.reload();
  await expect(page.getByRole('radio', { name: 'forest', exact: true })).toBeChecked();
  const anchor = new URLSearchParams(href!.split('?')[1]).get('row');
  await expect(page.locator(`[id="${anchor}"]`)).toBeInViewport();
});
