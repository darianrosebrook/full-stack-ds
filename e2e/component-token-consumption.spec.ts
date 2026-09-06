import { test, expect } from '@playwright/test';

for (const framework of ['react', 'vue', 'svelte', 'angular', 'lit']) {
  test(`${framework}: retired Button geometry is absent and canonical controls remain live`, async ({page}) => {
    await page.goto(`/preview/${framework}/Button`);
    await page.locator('body[data-fsds-ready]').waitFor();
    const button = page.locator('.button').first();
    await expect(button).toBeVisible();
    const before = await button.evaluate(el => {
      const style = getComputedStyle(el);
      return { padding: style.padding, retired: style.getPropertyValue('--fsds-button-size-padding-inline-medium').trim() };
    });
    expect(before.retired).toBe('');
    await button.evaluate(el => (el as HTMLElement).style.setProperty('--fsds-box-model-padding-inline', '23px'));
    await expect(button).toHaveCSS('padding-left', '23px');
    await expect(button).toHaveCSS('padding-right', '23px');
    await button.evaluate(el => {
      (el as HTMLElement).style.setProperty('--fsds-box-model-padding', '17px 29px');
      (el as HTMLElement).style.setProperty('--fsds-box-model-padding-inline-start', '9px');
    });
    await expect(button).toHaveCSS('padding-left', '9px');
    await expect(button).toHaveCSS('padding-right', '23px');
    await button.evaluate(el => (el as HTMLElement).style.removeProperty('--fsds-box-model-padding-inline-start'));
    await expect(button).toHaveCSS('padding-left', '23px');
    await button.evaluate(el => (el as HTMLElement).style.removeProperty('--fsds-box-model-padding-inline'));
    await expect(button).toHaveCSS('padding', '17px 29px');
    await button.evaluate(el => (el as HTMLElement).style.removeProperty('--fsds-box-model-padding'));
    await expect(button).toHaveCSS('padding', before.padding);
  });
}
