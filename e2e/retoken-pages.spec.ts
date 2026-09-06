import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

for (const kind of ['spotify','pinterest']) {
  for (const width of [1440,390]) {
    test(`${kind}: composition and controls at ${width}px`, async ({page}, info) => {
      const errors:string[]=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.setViewportSize({width,height:1000});
      await page.goto(`/e2e/fixtures/retoken-pages/index.html?page=${kind}`);
      await expect(page.locator('.retoken')).toBeVisible();
      await expect.poll(()=>page.locator('img').evaluateAll(imgs=>imgs.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBe(true);
      expect(await page.locator('.icon svg').count()).toBe(await page.locator('.icon').count());
      await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const media=await page.locator('img').evaluateAll(imgs=>imgs.map(img=>{
        const css=getComputedStyle(img);const box=img.getBoundingClientRect();
        return {alt:img.getAttribute('alt'),authoredWidth:img.getAttribute('width'),authoredHeight:img.getAttribute('height'),width:box.width,height:box.height,aspectRatio:css.aspectRatio,objectFit:css.objectFit,objectPosition:css.objectPosition};
      }));
      await info.attach('media-facts',{body:JSON.stringify(media,null,2),contentType:'application/json'});
      await writeFile(info.outputPath('media-facts.json'),JSON.stringify(media,null,2));
      await page.screenshot({path:info.outputPath(`${kind}-${width}.png`),fullPage:true});
      if(kind==='spotify') {
        await expect(page.locator('.album').first()).toHaveCSS('border-width','0px');
        await expect(page.locator('.album').first()).toHaveCSS('background-color','rgb(24, 24, 24)');
        await page.getByRole('button',{name:'Play',exact:true}).click();
        await expect(page.getByRole('button',{name:'Pause',exact:true})).toHaveAttribute('aria-pressed','true');
        await page.getByRole('button',{name:'Pause',exact:true}).press('Space');
        await expect(page.getByRole('button',{name:'Play',exact:true})).toHaveAttribute('aria-pressed','false');
        await page.getByRole('button',{name:'Next mix'}).click();
        await expect(page.locator('.player')).toContainText('Rooms for reading');
        await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','36');
        await page.getByRole('textbox',{name:'Search collection'}).fill('Blue hour');
        await expect(page.locator('.album')).toHaveCount(1);
      } else {
        await expect(page.locator('.pin .card__media').first()).toHaveCSS('border-radius','16px');
        const save=page.getByRole('button',{name:'Save Slow mornings',exact:true});
        await save.focus();
        await expect(save).toBeVisible();
        await save.press('Enter');
        await expect(page.getByRole('button',{name:'Unsave Slow mornings'})).toHaveAttribute('aria-pressed','true');
        await page.getByRole('button',{name:'Saved (1)',exact:true}).click();
        await expect(page.locator('.pin')).toHaveCount(1);
        await page.getByRole('button',{name:'Unsave Slow mornings'}).focus();
        await page.getByRole('button',{name:'Unsave Slow mornings'}).press('Enter');
        await expect(page.getByRole('status')).toHaveText('No ideas found');
        await page.getByRole('button',{name:'Home',exact:true}).click();
        await page.getByRole('textbox',{name:'Search collection'}).fill('Blue hour');
        await expect(page.locator('.pin')).toHaveCount(1);
      }
      await page.getByRole('textbox',{name:'Search collection'}).fill('unmatched search');
      await expect(page.getByRole('status')).toHaveText(kind==='spotify'?'No mixes found':'No ideas found');
      expect(errors).toEqual([]);
    });
  }
}
