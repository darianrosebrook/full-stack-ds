import { expect, test } from "@playwright/test";

for (const framework of ["react", "vue", "svelte", "angular", "lit"]) {
  test(`${framework}: CodeBlock contains only authored whitespace`, async ({ page }, info) => {
    await page.goto(`/preview/${framework}/CodeBlock`);
    await page.locator("body[data-fsds-ready]").waitFor();
    const pre = page.locator("pre.code-block");
    const single = "const example = true;";
    // toHaveText normalizes whitespace, which would conceal this defect.
    await expect.poll(() => pre.textContent()).toBe(single);
    const geometry = await pre.evaluate(el => {
      const s = getComputedStyle(el);
      return { height: el.getBoundingClientRect().height,
        line: parseFloat(s.lineHeight),
        chrome: parseFloat(s.paddingTop) + parseFloat(s.paddingBottom) +
          parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth) };
    });
    expect(geometry.height).toBeCloseTo(geometry.line + geometry.chrome, 0);
    await page.screenshot({ path: info.outputPath(`${framework}-single-line.png`) });

    for (const highlight of [false, true]) {
      for (const code of ["  const x = 1;\n\n\treturn x;\n", "\n\n  leading and trailing  \n", "<div> & untouched\ttext", ""]) {
        await page.evaluate(props => window.postMessage({ type: "fsds:config", props }, "*"),
          { code, language: "typescript", highlight });
        await expect.poll(() => pre.textContent()).toBe(code);
        await expect.poll(() => pre.locator("code").textContent()).toBe(code);
      }
    }
  });
}
