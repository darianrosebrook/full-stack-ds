/**
 * Style-carrier realization runtime rail
 * (ADJUDICATE-WEB-STYLE-REALIZATION-DEBT-01).
 *
 * Covers the two components whose unreachable style carriers were resolved by
 * REALIZING the declared anatomy rather than retiring the declaration:
 * Checkbox (`input` / `indicator`) and Skeleton (`stack` / `shape`).
 *
 * Checkbox declared `input` and `indicator` anatomy parts with authored style
 * blocks while `anatomy.dom` emitted a bare `<input>`, so `.checkbox__input`
 * and `.checkbox__indicator` named nothing. The adjudication realized the
 * declared topology rather than retiring the declarations.
 *
 * The forward carrier rail proves only that a selector HAS a producible
 * attachment point. It cannot see two things this rail exists to check:
 *
 *   1. Whether the carriers are actually present in rendered output, in every
 *      web framework, at the nesting the selectors assume.
 *   2. Whether the state selectors attach to the RIGHT elements. Checkbox's
 *      checked/disabled/focus rules are `:has()` selectors. Making the
 *      carriers reachable turned three previously dead rules live, and a
 *      subject-less `:has(.checkbox__input:checked) .checkbox__indicator`
 *      matches ANY ancestor holding a checked input and then EVERY descendant
 *      indicator — so one checked checkbox would paint its unchecked
 *      siblings. Anchoring the selectors to `.checkbox` scopes the match to
 *      the owning component instance.
 *
 * `:has()` is not evaluated by JSDOM, so the component-test tier cannot prove
 * either fact. This rail is the only place the anchoring claim is falsifiable:
 * revert the three sidecar keys to their subject-less form and the sibling
 * assertion below goes red.
 *
 * What this rail does NOT prove: that the checked color is the RIGHT color,
 * any layout or visual quality claim, or behavior beyond the CSS cascade.
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

async function gotoComponent(
  page: Page,
  framework: Framework,
  component: string,
  props?: Record<string, string | number | boolean>,
): Promise<void> {
  const block = component.toLowerCase();
  await page.goto(`/preview/${framework}/${component}`, {
    waitUntil: "domcontentloaded",
  });
  const selector =
    framework === "lit" ? `fsds-${block} >> .${block}` : `.${block}`;
  await page
    .locator(selector)
    .first()
    .waitFor({ state: "attached", timeout: 30_000 });
  await page
    .locator("body[data-fsds-ready]")
    .waitFor({ state: "attached", timeout: 30_000 });
  if (props) {
    await page.evaluate((next) => {
      window.postMessage(
        { type: "fsds:config", props: next, tokenCss: "" },
        "*",
      );
    }, props);
    await page.waitForTimeout(0);
  }
}

const gotoCheckbox = (page: Page, framework: Framework): Promise<void> =>
  gotoComponent(page, framework, "Checkbox");

test.describe("Runtime rail — Checkbox composite carriers", () => {
  for (const framework of FRAMEWORKS) {
    test(`${framework}: the input and indicator carriers exist under the root`, async ({
      page,
    }) => {
      await gotoCheckbox(page, framework);

      const shape = await page.evaluate((isLit) => {
        const root: Document | ShadowRoot | null = isLit
          ? (document.querySelector("fsds-checkbox") as HTMLElement)
              ?.shadowRoot ?? null
          : document;
        if (!root) return null;
        const host = root.querySelector(".checkbox");
        if (!host) return null;
        const input = host.querySelector(".checkbox__input");
        const indicator = host.querySelector(".checkbox__indicator");
        return {
          hostTag: host.tagName.toLowerCase(),
          inputTag: input?.tagName.toLowerCase() ?? null,
          inputType: input?.getAttribute("type") ?? null,
          inputIsDirectChild: input?.parentElement === host,
          indicatorPresent: indicator !== null,
          indicatorIsDirectChild: indicator?.parentElement === host,
        };
      }, framework === "lit");

      // The contract's topology: `<label class="checkbox">` directly wrapping
      // the native input beside the visual indicator. Every field is asserted
      // by value, so a wrapper appearing between root and part fails here.
      expect(shape).toEqual({
        hostTag: "label",
        inputTag: "input",
        inputType: "checkbox",
        inputIsDirectChild: true,
        indicatorPresent: true,
        indicatorIsDirectChild: true,
      });
    });

    test(`${framework}: a checked checkbox paints its own indicator and not a sibling's`, async ({
      page,
    }) => {
      await gotoCheckbox(page, framework);

      const paint = await page.evaluate((isLit) => {
        const root: Document | ShadowRoot | null = isLit
          ? (document.querySelector("fsds-checkbox") as HTMLElement)
              ?.shadowRoot ?? null
          : document;
        if (!root) return null;
        const mounted = root.querySelector(".checkbox") as HTMLElement | null;
        // Under Lit the root is a direct child of the ShadowRoot, which has
        // no parentElement — parentNode is the correct handle for both cases,
        // and the wrapper must stay inside the shadow root for the
        // component's scoped styles to apply to the clones.
        const container = mounted?.parentNode as ParentNode | null;
        if (!mounted || !container) return null;

        // Two clones under one shared wrapper: the wrapper is the ancestor a
        // subject-less `:has()` would latch onto. Only the first is checked.
        const wrapper = document.createElement("div");
        container.appendChild(wrapper);
        const checkedBox = mounted.cloneNode(true) as HTMLElement;
        const siblingBox = mounted.cloneNode(true) as HTMLElement;
        wrapper.append(checkedBox, siblingBox);
        (
          checkedBox.querySelector(".checkbox__input") as HTMLInputElement
        ).checked = true;

        const bg = (box: HTMLElement): string =>
          getComputedStyle(
            box.querySelector(".checkbox__indicator") as HTMLElement,
          ).backgroundColor;

        return {
          checked: bg(checkedBox),
          sibling: bg(siblingBox),
          baseline: bg(mounted),
        };
      }, framework === "lit");

      expect(paint).not.toBeNull();
      // The rule attaches at all: checking the input repaints its indicator.
      expect(paint!.checked).not.toBe(paint!.baseline);
      // The rule is scoped to the owning instance: the unchecked sibling
      // under the same ancestor keeps the unchecked paint. This is the
      // assertion that a subject-less `:has()` fails.
      expect(paint!.sibling).toBe(paint!.baseline);
    });
  }
});

/**
 * Skeleton declared `stack`, `row` and `shape` anatomy parts, authored style
 * blocks for `stack` and `shape`, and a `lines` prop whose curated usage
 * example documents "a two-to-four line paragraph" — while `anatomy.dom` was a
 * childless `<div>`. Every framework rendered exactly one box for any `lines`
 * value, so both carriers named nothing and the prop was inert.
 *
 * That is why the adjudication realized the topology rather than retiring the
 * carriers: the evidence that the declaration was live came from the contract
 * and its usage sidecar, never from the generated output.
 */
test.describe("Runtime rail — Skeleton line rows", () => {
  for (const framework of FRAMEWORKS) {
    test(`${framework}: lines=3 renders three rows, each carrying one shape`, async ({
      page,
    }) => {
      await gotoComponent(page, framework, "Skeleton", { lines: 3 });

      const counts = await page.evaluate((isLit) => {
        const root: Document | ShadowRoot | null = isLit
          ? (document.querySelector("fsds-skeleton") as HTMLElement)
              ?.shadowRoot ?? null
          : document;
        const host = root?.querySelector(".skeleton");
        if (!host) return null;
        return {
          stacks: host.querySelectorAll(".skeleton__stack").length,
          rows: host.querySelectorAll(".skeleton__row").length,
          shapes: host.querySelectorAll(".skeleton__shape").length,
          shapesUnderRows: host.querySelectorAll(
            ".skeleton__row > .skeleton__shape",
          ).length,
        };
      }, framework === "lit");

      expect(counts).toEqual({
        stacks: 1,
        rows: 3,
        shapes: 3,
        shapesUnderRows: 3,
      });
    });

    test(`${framework}: no lines renders the bare root with no stack`, async ({
      page,
    }) => {
      await gotoComponent(page, framework, "Skeleton");

      const counts = await page.evaluate((isLit) => {
        const root: Document | ShadowRoot | null = isLit
          ? (document.querySelector("fsds-skeleton") as HTMLElement)
              ?.shadowRoot ?? null
          : document;
        const host = root?.querySelector(".skeleton");
        if (!host) return null;
        return {
          stacks: host.querySelectorAll(".skeleton__stack").length,
          shapes: host.querySelectorAll(".skeleton__shape").length,
        };
      }, framework === "lit");

      // Without `lines` the root itself is the single painted shape — the
      // pre-existing behavior the realization had to preserve.
      expect(counts).toEqual({ stacks: 0, shapes: 0 });
    });

    test(`${framework}: lines=0 renders nothing, not a literal "0"`, async ({
      page,
    }) => {
      await gotoComponent(page, framework, "Skeleton", { lines: 0 });

      const text = await page.evaluate((isLit) => {
        const root: Document | ShadowRoot | null = isLit
          ? (document.querySelector("fsds-skeleton") as HTMLElement)
              ?.shadowRoot ?? null
          : document;
        const host = root?.querySelector(".skeleton") as HTMLElement | null;
        return host === null ? null : host.textContent;
      }, framework === "lit");

      // React renders a falsy NUMBER as text, so a `{lines && …}` guard paints
      // "0" here. The codegen emits a ternary with an explicit null branch
      // precisely so this stays empty; reverting it turns this red for react.
      expect(text?.trim()).toBe("");
    });
  }
});
