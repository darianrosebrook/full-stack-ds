/**
 * Button intent-distinctness runtime rail (DS-CONSUMER-FINDINGS-01).
 *
 * A brand is free to alias its primary action colour to a red. When the
 * destructive Button was a filled danger surface, such a brand made every
 * primary action look destructive. The destructive variant is therefore
 * outlined: no fill at rest, a danger border, and a dark-red label.
 *
 * The cascade that decides this (component tokens in @layer components,
 * brand overrides in @layer brand, variant class blocks) is only resolved by
 * a real browser, so JSDOM component tests cannot pin it.
 *
 * What this rail does NOT prove: hover/pressed washes (covered by the
 * curated contrast pairs in w3c-contrast-validator.ts, not rendered here),
 * dark mode, native targets, or any non-default brand.
 */

import { test, expect, type Page } from "@playwright/test";

type Framework = "react" | "vue" | "svelte" | "lit" | "angular";

const FRAMEWORKS: readonly Framework[] = [
  "react",
  "vue",
  "svelte",
  "lit",
  "angular",
];

interface Paint {
  background: string;
  color: string;
  borderColor: string;
  className: string;
}

async function paintFor(
  page: Page,
  framework: Framework,
  variant: string,
): Promise<Paint | null> {
  await page.goto(`/preview/${framework}/Button`, {
    waitUntil: "domcontentloaded",
  });
  const selector = framework === "lit" ? "fsds-button >> .button" : ".button";
  await page.locator(selector).first().waitFor({ state: "attached", timeout: 30_000 });
  await page.locator("body[data-fsds-ready]").waitFor({ state: "attached", timeout: 30_000 });
  await page.evaluate((props) => {
    window.postMessage({ type: "fsds:config", props, tokenCss: "" }, "*");
  }, { variant });
  await expect(page.locator(selector).first()).toHaveClass(new RegExp(`button--${variant}`));

  return page.evaluate(async (isLit) => {
    const root: Document | ShadowRoot | null = isLit
      ? (document.querySelector("fsds-button") as HTMLElement)?.shadowRoot ?? null
      : document;
    const el = root?.querySelector(".button") as HTMLElement | null;
    if (!el) return null;
    // The variant swap starts the Button's colour transition; sample the
    // settled value, not a frame of the tween.
    await Promise.all(el.getAnimations().map((a) => a.finished));
    const cs = getComputedStyle(el);
    return {
      background: cs.backgroundColor,
      color: cs.color,
      borderColor: cs.borderTopColor,
      className: el.className,
    };
  }, framework === "lit");
}

test.describe("Runtime rail — Button destructive is outlined", () => {
  test.use({ colorScheme: "light" });

  for (const framework of FRAMEWORKS) {
    test(`${framework}: destructive rests unfilled with a red border and label, unlike primary`, async ({
      page,
    }) => {
      const primary = await paintFor(page, framework, "primary");
      const destructive = await paintFor(page, framework, "destructive");
      expect(primary).not.toBeNull();
      expect(destructive).not.toBeNull();

      // Outlined: no fill at rest, so a red primary fill can never be read
      // as the destructive affordance.
      expect(destructive!.background).toBe("rgba(0, 0, 0, 0)");
      expect(primary!.background).not.toBe("rgba(0, 0, 0, 0)");
      // semantic.color.border.danger and foreground.on.danger.subtle, light.
      expect(destructive!.borderColor).toBe("rgb(179, 27, 27)");
      expect(destructive!.color).toBe("rgb(144, 9, 9)");
      expect(destructive!.color).not.toBe(primary!.color);
    });
  }
});
