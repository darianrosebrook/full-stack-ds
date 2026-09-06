import { test, expect } from '@playwright/test';

for (const framework of ['react','vue','svelte','angular','lit']) {
  test(`${framework}: Text truncation clips long content and clears back to wrapping`,async({page})=>{
    await page.goto(`/preview/${framework}/Text`);
    await page.locator('body[data-fsds-ready]').waitFor();
    const text=page.locator('.text').first();
    await expect(text).toHaveText('Text');
    const content='A long editorial caption that must fit the available width.';
    const configure=async(truncate?:boolean)=>{
      await page.evaluate(({truncate})=>window.postMessage({
        type:'fsds:config',props:{truncate},
        tokenCss:'[data-fsds-component="text"] { --fsds-box-model-width: 140px; }',
      },'*'),{truncate,content});
      if(truncate) await expect(text).toHaveAttribute('data-truncate','true');
      else await expect(text).not.toHaveAttribute('data-truncate','true');
      // The preview supplies its own demo child; install a long text witness.
      await text.evaluate((el,value)=>{el.textContent=value;},content);
    };
    await configure(true);
    await expect(text).toHaveText(content);
    await expect(text).toHaveCSS('text-overflow','ellipsis');
    await expect(text).toHaveCSS('white-space','nowrap');
    await expect(text).toHaveCSS('overflow-x','hidden');
    const single=(await text.boundingBox())!.height;
    expect((await text.boundingBox())!.width).toBe(140);
    expect(await text.evaluate(el=>el.scrollWidth)).toBeGreaterThan(140);
    await configure(false);
    await expect(text).toHaveCSS('white-space','normal');
    await expect.poll(async()=>(await text.boundingBox())!.height).toBeGreaterThan(single);
    await configure(true);
    await expect(text).toHaveCSS('white-space','nowrap');
    await configure();
    await expect(text).toHaveCSS('white-space','normal');
    await expect.poll(async()=>(await text.boundingBox())!.height).toBeGreaterThan(single);
  });
}
