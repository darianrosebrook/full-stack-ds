// Runtime verifier for the spatial console. Drives a real Chrome with the
// HTML-in-Canvas flag through trusted mouse input: every click below goes
// through the browser's own hit testing, landing on a DS control only if the
// projected geometry the scene assigned puts it under the pointer.
//
//   pnpm --filter @full-stack-ds/example-spatial-console-web dev   (port 5188)
//   pnpm --filter @full-stack-ds/example-spatial-console-web verify:runtime
//
// Env: SPATIAL_URL (default http://localhost:5188/), CHROME_PATH (default the
// macOS Google Chrome app), HEADED=1 to watch. Screenshots and a JSON report
// land in test-results/spatial-console/ at the repo root.
//
// Non-claims: this proves input routing and state flow for one Chromium build
// and one scene layout. It does not prove visual quality, the explainer's
// updateElementGeometry path (it reports which path ran), occlusion-aware
// hit testing, or accessibility of the drawn panels.

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const URL_ = process.env.SPATIAL_URL ?? "http://localhost:5188/";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FLAGS = ["--enable-features=CanvasDrawElement", "--enable-experimental-web-platform-features"];
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const outDir = path.join(repoRoot, "test-results/spatial-console");
mkdirSync(outDir, { recursive: true });

const report = { url: URL_, checks: [], artifacts: [] };
let failures = 0;
function check(name, pass, evidence) {
  report.checks.push({ name, pass, evidence });
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}\n      ${JSON.stringify(evidence)}`);
}
async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file });
  report.artifacts.push(file);
}
const state = (page) => page.evaluate(() => window.__spatialConsole.store.get());
async function waitForState(page, predicate, timeout = 2000) {
  const start = Date.now();
  for (;;) {
    const s = await state(page);
    if (predicate(s)) return s;
    if (Date.now() - start > timeout) return s;
    await page.waitForTimeout(50);
  }
}

/**
 * Screen point of a DS control's centre, derived from its *layout* position
 * inside its panel (offset geometry ignores CSS transforms) projected through
 * the panel mesh. The verifier never reads the transform it is testing.
 */
async function controlPoint(page, panelId, selector) {
  return page.evaluate(
    ([panelId, selector]) => {
      const panel = document.getElementById(panelId);
      let el = panel.querySelector(selector);
      if (!el) return null;
      // A custom-element host with no box of its own (Lit renders into its
      // shadow root) is measured through the element that actually has one.
      if (el.offsetWidth === 0 && el.shadowRoot) el = el.shadowRoot.querySelector("button, input, [role]") ?? el;
      const within = (n) => {
        for (let m = n; m; m = m.parentNode ?? m.host) if (m === panel) return true;
        return false;
      };
      const offsetWithin = (node) => {
        let x = 0, y = 0, n = node;
        while (n && n !== panel && within(n)) {
          x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent;
        }
        if (n === panel) return { x, y };
        let px = 0, py = 0, m = panel;
        while (m && m !== n) { px += m.offsetLeft; py += m.offsetTop; m = m.offsetParent; }
        return { x: x - px, y: y - py };
      };
      const o = offsetWithin(el);
      const local = { x: o.x + el.offsetWidth / 2, y: o.y + el.offsetHeight / 2 };
      const screen = window.__spatialConsole.panelScreenPoint(panel, local.x, local.y);
      // Deep hit test: follow shadow roots down to the innermost element.
      let hit = document.elementFromPoint(screen.x, screen.y);
      while (hit?.shadowRoot) {
        const inner = hit.shadowRoot.elementFromPoint(screen.x, screen.y);
        if (!inner || inner === hit) break;
        hit = inner;
      }
      const inside = (n) => {
        for (let m = n; m; m = m.parentNode ?? m.host) if (m === el) return true;
        return false;
      };
      return { local, screen, hitInsideControl: !!hit && inside(hit), hitTag: hit?.tagName };
    },
    [panelId, selector],
  );
}
async function clickControl(page, panelId, selector) {
  const p = await controlPoint(page, panelId, selector);
  if (!p) throw new Error(`no control ${selector} in #${panelId}`);
  await page.mouse.click(p.screen.x, p.screen.y);
  return p;
}

const browser = await chromium.launch({ executablePath: CHROME, headless: !process.env.HEADED, args: FLAGS });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  await page.goto(URL_);
  await page.waitForSelector("html[data-spatial-ready]", { timeout: 15000 });
  await page.waitForTimeout(800);
  report.path = await page.evaluate(() => document.documentElement.dataset.spatialReady);
  await shot(page, "01-initial");

  // A1: every framework panel is drawn into the scene.
  const drawn = await page.evaluate(async () => {
    const api = window.__spatialConsole;
    const shot = document.getElementById("scene");
    // Sample the rendered frame at each panel's projected centre.
    const bitmap = await createImageBitmap(shot);
    const c = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = c.getContext("2d");
    ctx.drawImage(bitmap, 0, 0);
    const scale = bitmap.width / shot.clientWidth;
    const sample = (x, y) => Array.from(ctx.getImageData(Math.round(x * scale), Math.round(y * scale), 1, 1).data);
    const out = {};
    for (const id of ["panel-lighting", "panel-motion", "panel-telemetry"]) {
      const el = document.getElementById(id);
      const p = api.panelScreenPoint(el, el.offsetWidth / 2, el.offsetHeight - 12);
      out[id] = { uploads: api.uploads()[id], px: sample(p.x, p.y) };
    }
    out.background = sample(20, 20);
    return out;
  });
  for (const id of ["panel-lighting", "panel-motion", "panel-telemetry"]) {
    const { uploads, px } = drawn[id];
    // Panel surfaces are near-white; the scene backdrop is near-black.
    const luminance = (px[0] + px[1] + px[2]) / 3;
    check(`A1 ${id} drawn as a texture in the scene`, uploads > 0 && luminance > 180, { uploads, px, background: drawn.background });
  }

  // Orbit to an oblique view with a real drag on bare canvas (sky region).
  const before = await page.evaluate(() => window.__spatialConsole.panelScreenPoint(document.getElementById("panel-motion"), 0, 0));
  await page.mouse.move(1150, 90);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(1150 - i * 18, 90 + i * 4);
  await page.mouse.up();
  await page.waitForTimeout(150);
  const after = await page.evaluate(() => window.__spatialConsole.panelScreenPoint(document.getElementById("panel-motion"), 0, 0));
  check("orbit drag on bare canvas moves the camera", Math.hypot(after.x - before.x, after.y - before.y) > 20, { before, after });
  await shot(page, "02-oblique");

  // Negative control: the lamp switch's untransformed layout position.
  const lampLayout = await page.evaluate(() => {
    const sw = document.querySelector("#panel-lighting [data-testid=lamp-switch]");
    const mount = document.getElementById("panel-lighting").parentElement;
    const canvas = document.getElementById("scene").getBoundingClientRect();
    return { x: canvas.left + mount.offsetLeft + sw.offsetLeft + sw.offsetWidth / 2, y: canvas.top + mount.offsetTop + sw.offsetTop + sw.offsetHeight / 2 };
  });
  const s0 = await state(page);
  await page.mouse.click(lampLayout.x, lampLayout.y);
  const s0b = await waitForState(page, (s) => s.lampOn !== s0.lampOn, 400);
  check("negative control: clicking the switch's unprojected layout position does not toggle it", s0b.lampOn === s0.lampOn, { at: lampLayout, lampOn: s0b.lampOn });

  // A2: React panel controls, clicked where the mesh draws them.
  let p = await clickControl(page, "panel-lighting", "[data-testid=lamp-switch]");
  let s = await waitForState(page, (st) => st.lampOn === false);
  // The scene applies light intensity on its next paint, not synchronously.
  await page.waitForTimeout(100);
  let lamp = await page.evaluate(() => window.__spatialConsole.lampIntensity());
  check("A2 React Switch clicked in 3D turns the scene lamp off", s.lampOn === false && lamp === 0, { point: p, lampOn: s.lampOn, lampIntensity: lamp });
  await shot(page, "03-lamp-off");

  p = await clickControl(page, "panel-lighting", "[data-testid=lamp-switch]");
  s = await waitForState(page, (st) => st.lampOn === true);
  check("A2 React Switch clicked again turns the lamp back on", s.lampOn === true, { point: p, lampOn: s.lampOn });

  p = await clickControl(page, "panel-lighting", "input[value=cool]");
  s = await waitForState(page, (st) => st.colorTemp === "cool");
  const color = await page.evaluate(() => window.__spatialConsole.lampColor());
  check("A2 React RadioGroup 'Cool' re-colours the lamp", s.colorTemp === "cool", { point: p, colorTemp: s.colorTemp, lampColor: color });

  // A2: Vue panel controls.
  p = await clickControl(page, "panel-motion", "input[value=box]");
  s = await waitForState(page, (st) => st.shape === "box");
  const shape = await page.evaluate(() => window.__spatialConsole.objectShape());
  check("A2 Vue RadioGroup 'Cube' swaps the scene object's geometry", s.shape === "box" && shape === "box", { point: p, storeShape: s.shape, sceneShape: shape });

  // Selected by role: the generated Vue ToggleSwitch drops a template-passed
  // data-testid (see the lane README findings).
  p = await clickControl(page, "panel-motion", "[role=switch]");
  s = await waitForState(page, (st) => st.autoRotate === false);
  // `rotation` is published at 10 Hz; let one publish land after the stop.
  await page.waitForTimeout(250);
  const r1 = (await state(page)).rotation;
  await page.waitForTimeout(400);
  const r2 = (await state(page)).rotation;
  check("A2 Vue ToggleSwitch stops the object's rotation", s.autoRotate === false && r1 === r2, { point: p, autoRotate: s.autoRotate, rotationBefore: r1, rotationAfter: r2 });
  await shot(page, "04-cube-cool-stopped");

  // A3: scene -> UI. Pick the object by raycast; the Lit readout follows.
  const uploadsBefore = await page.evaluate(() => window.__spatialConsole.uploads()["panel-telemetry"]);
  const objectPoint = await page.evaluate(() => window.__spatialConsole.objectScreenPoint("object"));
  await page.mouse.click(objectPoint.x, objectPoint.y);
  s = await waitForState(page, (st) => st.selected === "Cube");
  await page.waitForTimeout(250);
  const readout = await page.evaluate(() => ({
    stat: document.querySelector("#panel-telemetry [data-testid=selected-stat]")?.textContent.trim(),
    clearDisabled: document.querySelector("#panel-telemetry [data-testid=clear-selection]")?.disabled,
    uploads: window.__spatialConsole.uploads()["panel-telemetry"],
  }));
  check("A3 picking the 3D object updates the Lit telemetry readout and re-uploads its texture",
    s.selected === "Cube" && readout.stat === "Cube" && readout.clearDisabled === false && readout.uploads > uploadsBefore,
    { objectPoint, selected: s.selected, readout, uploadsBefore });
  await shot(page, "05-object-selected");

  p = await clickControl(page, "panel-telemetry", "[data-testid=clear-selection]");
  s = await waitForState(page, (st) => st.selected === null);
  check("A2 Lit Button clicked in 3D clears the selection", s.selected === null, { point: p, selected: s.selected });

  // Scene -> UI: clicking the lamp bulb toggles it; the React Switch follows.
  const bulb = await page.evaluate(() => window.__spatialConsole.objectScreenPoint("lamp"));
  await page.mouse.click(bulb.x, bulb.y);
  s = await waitForState(page, (st) => st.lampOn === false);
  await page.waitForTimeout(150);
  const switchChecked = await page.evaluate(() => document.querySelector("#panel-lighting [data-testid=lamp-switch] input").checked);
  check("A3 clicking the 3D lamp toggles it and the React Switch reflects it", s.lampOn === false && switchChecked === false, { bulb, lampOn: s.lampOn, switchChecked });
  await shot(page, "06-lamp-bulb-off");

  check("no uncaught page errors", pageErrors.length === 0, { pageErrors });
  await page.close();
} finally {
  await browser.close();
}

// A4: without the flag the page explains itself instead of rendering blank.
const plain = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  const page = await plain.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(URL_);
  await page.waitForTimeout(800);
  const notice = await page.evaluate(() => ({
    visible: !document.getElementById("unsupported").hidden,
    canvasHidden: document.getElementById("scene").hidden,
    detail: document.getElementById("unsupported-detail").textContent,
    namesFlag: document.getElementById("unsupported").textContent.includes("canvas-draw-element"),
  }));
  check("A4 unflagged Chrome shows the unsupported notice naming the flags", notice.visible && notice.canvasHidden && notice.namesFlag, notice);
  await shot(page, "07-unsupported");
} finally {
  await plain.close();
}

report.failures = failures;
writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(`\n${report.checks.length - failures}/${report.checks.length} checks passed (path: ${report.path}). Artifacts: ${outDir}`);
process.exit(failures ? 1 : 0);
