import { test, expect, type Page } from '@playwright/test';

// Deliberately non-square intrinsic size makes dropped sizing/cropping observable.
const src=`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><path fill="#d7af76" d="M0 0h300v800H0z"/><path fill="#384b3c" d="M300 0h300v800H300z"/></svg>')}`;
async function configure(page:Page, props:Record<string,unknown>, tokenCss='') {
  await page.evaluate(({props,tokenCss})=>window.postMessage({type:'fsds:config',props,tokenCss},'*'),{props:{src,alt:'Media witness',...props},tokenCss});
}

test('react: inline consumer controls preserve prop bindings',async({page})=>{
  await page.goto('/preview/react/Image');
  await page.locator('body[data-fsds-ready]').waitFor();
  await configure(page,{width:240,aspectRatio:'square',objectFit:'cover',style:{'--fsds-image-design-root-media-position':'20% 80%'}});
  const image=page.locator('img.image');
  await expect(image).toHaveCSS('height','240px');
  await expect(image).toHaveCSS('object-fit','cover');
  await expect(image).toHaveCSS('object-position','20% 80%');
});

for(const framework of ['react','vue','svelte','lit','angular']) {
  test(`${framework}: Image sizing, crop, design precedence and clearing`,async({page})=>{
    await page.goto(`/preview/${framework}/Image`);
    await page.locator('body[data-fsds-ready]').waitFor();
    const image=page.locator('img.image');
    await configure(page,{width:48,height:48,objectFit:'cover',objectPosition:'25% 75%'});
    await expect(image).toHaveAttribute('width','48');
    await expect(image).toHaveCSS('width','48px');
    await expect(image).toHaveCSS('height','48px');
    await expect(image).toHaveCSS('object-fit','cover');
    await expect(image).toHaveCSS('object-position','25% 75%');
    for(const [preset,ratio,height] of [['square','1 / 1',240],['video','16 / 9',135],['photo','4 / 3',180],['wide','21 / 9',240*9/21],['portrait','2 / 3',360]] as const) {
      await configure(page,{width:240,aspectRatio:preset,objectFit:'cover'});
      await expect(image).toHaveCSS('aspect-ratio',ratio);
      await expect.poll(async()=>(await image.boundingBox())!.height).toBeCloseTo(height,1);
    }
    const props={width:240,aspectRatio:'square',objectFit:'cover',objectPosition:'25% 75%'};
    await configure(page,props,':root { --fsds-image-design-root-sizing-aspect-ratio: 2 / 1; --fsds-image-design-root-media-fit: contain; --fsds-image-design-root-media-position: 80% 20%; }');
    await expect(image).toHaveCSS('height','120px');
    await expect(image).toHaveCSS('object-fit','contain');
    await expect(image).toHaveCSS('object-position','80% 20%');
    await configure(page,props);
    await expect(image).toHaveCSS('height','240px');
    await expect(image).toHaveCSS('object-fit','cover');
    await expect(image).toHaveCSS('object-position','25% 75%');
    await image.evaluate(el=>{el.style.setProperty('--fsds-box-model-width','80px');el.style.setProperty('--fsds-box-model-height','60px');});
    await expect(image).toHaveCSS('width','80px');
    await expect(image).toHaveCSS('height','60px');
    await image.evaluate(el=>{el.style.removeProperty('--fsds-box-model-width');el.style.removeProperty('--fsds-box-model-height');});
    await expect(image).toHaveCSS('width','240px');
    await expect(image).toHaveCSS('height','240px');
    await configure(page,{width:240});
    await expect(image).toHaveCSS('aspect-ratio','auto');
    await expect(image).toHaveCSS('height','320px');
    await expect(image).toHaveCSS('object-fit','fill');
    await expect(image).toHaveCSS('object-position','50% 50%');
    await configure(page,{width:240,height:180,size:'md'});
    await expect(image).toHaveCSS('width','48px');
    await expect(image).toHaveCSS('height','48px');
    await configure(page,{size:'full',aspectRatio:'video'});
    await expect(image).toHaveCSS('aspect-ratio','16 / 9');
    await expect.poll(async()=>{const box=(await image.boundingBox())!;return box.width/box.height;}).toBeCloseTo(16/9,2);
  });
}
