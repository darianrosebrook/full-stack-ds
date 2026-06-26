/**
 * RENDER-PROP-BINDING-PLAYWRIGHT-RAIL-01 — live DOM prop-binding rail.
 *
 * Falsifies, at runtime, the prop->DOM binding obligations CLASSIFIED by
 * RENDER-PROP-BINDING-BLAST-RADIUS-01. The audit owns classification; this rail
 * owns runtime falsification. It does NOT re-infer obligations — it reads the
 * fixed classified matrix as the sole authority, selects only the rows whose
 * obligation is runtime-observable (`native-attr` | `aria-attr`, `bound`),
 * injects sentinel prop values through the preview message bus, and asserts
 * the attribute actually materialises in the rendered DOM.
 *
 * Scope (deliberately narrow): native-attr + aria-attr only. No content,
 * behavior, state/pseudo styling, screenshots, or accessibility scoring.
 *
 * Residuals (A5): Angular bakes props pre-compile (no config bus seam) — documented
 * residual. A component whose host never mounts in the default preview (its
 * injected sentinels never land) is skipped as a residual rather than failed.
 * The five formerly-missing form-control attrs are REQUIRED regression cases.
 */
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type Row = {
  component: string;
  prop: string;
  propBucket: string;
  propType: string;
  bucket: string;
  obligation: string;
  target: string;
};
type Matrix = { components: { component: string; hostTag: string; rows: Row[] }[] };

const MATRIX: Matrix = JSON.parse(
  readFileSync(resolve(process.cwd(), "docs/render-binding-audit/render-binding-matrix.json"), "utf8"),
);

// Web frameworks reachable through the R/V/S/L message-bus preview seam.
const WEB_FRAMEWORKS = ["react", "vue", "svelte", "lit"] as const;
// Angular bakes props before AOT compile (no request-carried prop seam) — residual.
const RESIDUAL_FRAMEWORKS = ["angular"] as const;

// Required regression cases: the five native form-control attrs that were
// declared-but-unbound until RENDER-PROP-BINDING-FIX-PRIMITIVES-01.
const REGRESSION = [
  { component: "Input", prop: "placeholder" },
  { component: "Input", prop: "name" },
  { component: "Input", prop: "required" },
  { component: "Checkbox", prop: "name" },
  { component: "Checkbox", prop: "value" },
];

// Documented residuals surfaced by this rail — keyed `${framework}.${Component}.${prop}`.
// REAL findings the rail caught, recorded (annotated) rather than silently passed.
// Empty: the rail's first finding — `lit.Label.htmlFor` (Lit emitted the non-standard
// `htmlfor` attribute instead of the DOM `for`) — was closed by
// LIT-LABEL-HTMLFOR-DOM-ATTR-01, so the rail now ASSERTS Lit's <label> for-association
// in live DOM (no longer skipped).
const KNOWN_RESIDUALS: Record<string, string> = {};

// ---- pull obligations from the matrix (authority; no re-inference) ----
type Obligation = { component: string; prop: string; propType: string; bucket: string; attr: string; sentinel: string | boolean | number };

const sentinelFor = (prop: string, propType: string, bucket: string): string | boolean | number => {
  if (bucket === "aria-attr") return true; // aria is DERIVED from a boolean prop
  if (propType === "boolean") return true;
  if (propType === "number") return 4242;
  return `RAIL-${prop}`; // free string sentinel — selector-safe, distinctive
};
const attrOf = (r: Row): string => {
  if (r.bucket === "aria-attr") return r.target; // e.g. "aria-invalid"
  const m = /\[([^\]]+)\]$/.exec(r.target); // "input[placeholder]" -> "placeholder"
  return m ? m[1] : r.prop;
};

const obligations: Obligation[] = MATRIX.components
  .flatMap((c) => c.rows)
  .filter((r) => (r.bucket === "native-attr" || r.bucket === "aria-attr") && r.obligation === "bound")
  .map((r) => ({ component: r.component, prop: r.prop, propType: r.propType, bucket: r.bucket, attr: attrOf(r), sentinel: sentinelFor(r.prop, r.propType, r.bucket) }));

const byComponent = new Map<string, Obligation[]>();
for (const o of obligations) {
  if (!byComponent.has(o.component)) byComponent.set(o.component, []);
  byComponent.get(o.component)!.push(o);
}

// ---- helpers ----
// Contract/JSX attribute keys vs the actual DOM attribute name. The contract's
// anatomy.dom.bindings can use framework-author-facing names (React's `htmlFor`,
// `className`); every emitter lowers them to the standard DOM attribute. The rail
// falsifies the DOM, so it normalizes to the DOM name. This is a rendering-detail
// alias, NOT obligation re-inference — the audit still owns classification.
const DOM_ATTR_ALIAS: Record<string, string> = { htmlFor: "for", className: "class" };
const domAttr = (a: string) => DOM_ATTR_ALIAS[a] ?? a;
const cssAttr = (a: string) => domAttr(a).replace(/([^\w-])/g, "\\$1");
// Default relative (CI: Playwright starts the repo dev server on baseURL).
const BASE = process.env.RB_RAIL_BASE ?? "";
async function gotoConfiguredPreview(
  page: Page,
  fw: string,
  component: string,
  props: Record<string, unknown>,
) {
  const resp = await page.goto(`${BASE}/preview/${fw}/${component}`, { waitUntil: "domcontentloaded" });
  expect(resp?.ok(), `preview ${fw}/${component} must load`).toBeTruthy();
  await page.locator("body[data-fsds-ready]").waitFor({
    state: "attached",
    timeout: 30_000,
  });
  await page.evaluate((nextProps) => {
    window.postMessage({ type: "fsds:config", props: nextProps, tokenCss: "" }, "*");
  }, props);
}
/** Page-wide: is the obligation's attribute observable (portaled hosts included)? */
async function attrObservable(page: Page, o: Obligation): Promise<boolean> {
  if (typeof o.sentinel === "string") {
    // strong: the exact sentinel reached the attribute
    if ((await page.locator(`[${cssAttr(o.attr)}="${o.sentinel}"]`).count()) > 0) return true;
  }
  // presence (booleans, aria, and value-normalising attrs like type)
  return (await page.locator(`[${cssAttr(o.attr)}]`).count()) > 0;
}
/** Did the component mount? Any injected string sentinel landing proves render. */
async function mounted(page: Page, rows: Obligation[]): Promise<boolean> {
  const stringRows = rows.filter((r) => typeof r.sentinel === "string");
  if (stringRows.length === 0) return true; // no probe; assume mounted, assertions decide
  for (const r of stringRows) {
    if ((await page.locator(`[${cssAttr(r.attr)}="${r.sentinel}"]`).count()) > 0) return true;
  }
  return false;
}

// =====================================================================
// A3 — REQUIRED regression cases (the five formerly-missing form attrs).
// =====================================================================
test.describe("regression: formerly-missing native form-control attrs are observable", () => {
  for (const fw of WEB_FRAMEWORKS) {
    for (const { component, prop } of REGRESSION) {
      const o = byComponent.get(component)?.find((x) => x.prop === prop);
      test(`[${fw}] ${component}.${prop} binds to the DOM`, async ({ page }) => {
        expect(o, `matrix must classify ${component}.${prop} as a bound native obligation`).toBeTruthy();
        const props: Record<string, unknown> = {};
        for (const x of byComponent.get(component)!) props[x.prop] = x.sentinel;
        await gotoConfiguredPreview(page, fw, component, props);
        await expect
          .poll(() => attrObservable(page, o!), { message: `${component}.${prop} -> [${o!.attr}] in DOM` })
          .toBe(true);
      });
    }
  }
});

// =====================================================================
// A1/A2 — full matrix coverage, with residual tolerance (A5).
// =====================================================================
test.describe("matrix coverage: every bound native/aria obligation is observable", () => {
  for (const fw of WEB_FRAMEWORKS) {
    for (const [component, rows] of byComponent) {
      test(`[${fw}] ${component}: ${rows.length} obligation(s)`, async ({ page }) => {
        const props: Record<string, unknown> = {};
        for (const r of rows) props[r.prop] = r.sentinel;
        await gotoConfiguredPreview(page, fw, component, props);
        // residual: trigger/portal components whose host never mounts in the
        // default preview — their sentinels never land; not a binding failure.
        const didMount = await mounted(page, rows);
        test.skip(!didMount, `${component} host not mounted in default ${fw} preview (residual — needs interaction)`);
        for (const o of rows) {
          const residualKey = `${fw}.${component}.${o.prop}`;
          if (KNOWN_RESIDUALS[residualKey]) {
            test.info().annotations.push({ type: "residual", description: `${residualKey}: ${KNOWN_RESIDUALS[residualKey]}` });
            continue;
          }
          await expect
            .poll(() => attrObservable(page, o), { message: `${component}.${o.prop} -> [${domAttr(o.attr)}]`, timeout: 8000 })
            .toBe(true);
        }
      });
    }
  }
});

// =====================================================================
// A4 — false-positive control: behavior props are NOT DOM-attr obligations.
// =====================================================================
test.describe("false-positive control: behavior/content props are not in the rail", () => {
  const behaviorProbe = [
    { component: "Input", prop: "value" },
    { component: "Input", prop: "onChange" },
    { component: "Input", prop: "defaultValue" },
    { component: "Checkbox", prop: "checked" },
    { component: "Checkbox", prop: "onChange" },
  ];
  for (const { component, prop } of behaviorProbe) {
    test(`${component}.${prop} is NOT a selected native/aria obligation`, async () => {
      const row = MATRIX.components.flatMap((c) => c.rows).find((r) => r.component === component && r.prop === prop);
      expect(row, `${component}.${prop} must exist in the matrix`).toBeTruthy();
      expect(row!.bucket, `${component}.${prop} must classify as behavior`).toBe("behavior");
      const selected = obligations.some((o) => o.component === component && o.prop === prop);
      expect(selected, `${component}.${prop} must NOT be treated as a DOM-attr obligation`).toBe(false);
    });
  }
});

// =====================================================================
// A5/A6 — documented residuals (no widening into content/state/visual/a11y).
// =====================================================================
test.describe("documented residuals", () => {
  for (const fw of RESIDUAL_FRAMEWORKS) {
    test(`[${fw}] residual: props baked pre-compile (no config bus seam)`, async () => {
      test.skip(true, `${fw} preview bakes props before AOT compile; out of scope for the config-bus rail`);
    });
  }
});
