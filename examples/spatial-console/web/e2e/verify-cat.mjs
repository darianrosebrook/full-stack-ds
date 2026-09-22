// Runtime verifier for the typing cat (cat.html). Real Chrome with the
// HTML-in-Canvas flag, trusted keyboard and mouse input only.
//
//   pnpm -F @full-stack-ds/example-spatial-console-web dev
//   pnpm -F @full-stack-ds/example-spatial-console-web verify:cat
//
// Env: CAT_URL (default http://localhost:5188/cat.html), CHROME_PATH, HEADED=1.
// Screenshots and report.json land in test-results/typing-cat/.
//
// Non-claims: puppet pose is checked by paw position, not by how it looks;
// responsiveness is checked for three fixed device widths only.

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const URL_ = process.env.CAT_URL ?? "http://localhost:5188/cat.html";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FLAGS = ["--enable-features=CanvasDrawElement", "--enable-experimental-web-platform-features"];
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const outDir = path.join(repoRoot, "test-results/typing-cat");
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

// The split, stated independently of keyboard-layout.ts: the first five
// character keys of each row are the left paw's, the rest the right's. Both
// edges of the boundary are pressed in every row.
const SPLIT = [
  ["1", "Digit1", "left"], ["5", "Digit5", "left"], ["6", "Digit6", "right"], ["0", "Digit0", "right"],
  ["q", "KeyQ", "left"], ["t", "KeyT", "left"], ["y", "KeyY", "right"], ["p", "KeyP", "right"],
  ["a", "KeyA", "left"], ["g", "KeyG", "left"], ["h", "KeyH", "right"], ["l", "KeyL", "right"],
  ["z", "KeyZ", "left"], ["b", "KeyB", "left"], ["n", "KeyN", "right"], ["m", "KeyM", "right"],
];

const browser = await chromium.launch({ executablePath: CHROME, headless: !process.env.HEADED, args: FLAGS });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  await page.goto(URL_);
  await page.waitForSelector("html[data-cat-ready]", { timeout: 20000 });
  await page.waitForTimeout(1000);
  report.path = await page.evaluate(() => document.documentElement.dataset.catReady);
  await shot(page, "01-desk");

  // A1: three live screens, three layouts.
  const layouts = await page.evaluate(() => {
    const out = {};
    for (const id of ["screen-laptop", "screen-tablet", "screen-phone"]) {
      const w = document.getElementById(id).contentWindow;
      const d = w.document;
      out[id] = {
        innerWidth: w.innerWidth,
        mainColumns: w.getComputedStyle(d.querySelector(".site__main")).gridTemplateColumns.split(" ").length,
        actionsDirection: w.getComputedStyle(d.querySelector(".site__actions")).flexDirection,
        linksWrapped: w.getComputedStyle(d.querySelector(".site__links")).order === "3",
        uploads: window.__typingCat.uploads()[id],
      };
    }
    return out;
  });
  const L = layouts["screen-laptop"], T = layouts["screen-tablet"], P = layouts["screen-phone"];
  check("A1 laptop renders the desktop layout (two columns)", L.innerWidth === 1280 && L.mainColumns === 2 && L.actionsDirection === "row" && L.uploads > 0, L);
  check("A1 tablet renders the tablet layout (one column, inline actions)", T.innerWidth === 768 && T.mainColumns === 1 && T.actionsDirection === "row" && !T.linksWrapped && T.uploads > 0, T);
  check("A1 phone renders the mobile layout (stacked actions, wrapped nav)", P.innerWidth === 390 && P.mainColumns === 1 && P.actionsDirection === "column" && P.linksWrapped && P.uploads > 0, P);

  // A2: typing lands in the site on every screen, and each key moves the
  // paw on its side of the keyboard to that key.
  const typed = SPLIT.map(([ch]) => ch).join("");
  const perKey = [];
  for (const [ch, code, want] of SPLIT) {
    await page.keyboard.press(ch);
    await page.waitForTimeout(220);
    perKey.push(await page.evaluate(([code, want]) => {
      const c = window.__typingCat;
      const key = c.keyWorld(code);
      const slap = c.lastSlap();
      const paw = c.pawWorld(want);
      return { code, want, paw: slap?.paw, slapCode: slap?.code, dx: +Math.abs(paw.x - key.x).toFixed(4), dz: +Math.abs(paw.z - key.z).toFixed(4) };
    }, [code, want]));
  }
  const bad = perKey.filter((k) => !(k.slapCode === k.code && k.paw === k.want && k.dx < 0.08 && k.dz < 0.08));
  check("A2 the first five keys of each row are slapped by the left paw, the rest by the right, and the paw lands on the key",
    bad.length === 0, bad.length ? { bad } : perKey.map((k) => `${k.code}:${k.paw} dx=${k.dx} dz=${k.dz}`));
  const drafts = await page.evaluate(() =>
    ["screen-laptop", "screen-tablet", "screen-phone"].map((id) => document.getElementById(id).contentDocument.querySelector("input[name=draft]").value));
  check("A2 typed text appears in the draft field on all three screens", drafts.every((v) => v === typed), { drafts });
  await shot(page, "02-typed");

  await page.keyboard.press("Space");
  await page.waitForTimeout(220);
  const space = await page.evaluate(() => {
    const c = window.__typingCat;
    const key = c.keyWorld("Space");
    return { paw: c.lastSlap().paw, leftX: c.pawWorld("left").x, rightX: c.pawWorld("right").x, keyX: key.x };
  });
  check("A2 Space is slapped by both paws, one either side of the bar's centre", space.paw === "both" && space.leftX < space.keyX && space.rightX > space.keyX, space);

  // A3: the trackpad follows the mouse across the laptop's viewport — the
  // right paw sits at the pointer's place within the laptop screen. The last
  // point is over the tablet, off the laptop screen, so it pins to the pad's
  // left edge.
  const trackpadRuns = [];
  const laptopPoints = [[0.1, 0.1, 0.1, 0.1], [0.9, 0.1, 0.9, 0.1], [0.5, 0.5, 0.5, 0.5], [0.9, 0.9, 0.9, 0.9]];
  for (const [fx, fy, u, v] of laptopPoints) {
    const at = await page.evaluate(([fx, fy]) => {
      const f = document.getElementById("screen-laptop");
      return window.__typingCat.screenPoint(f, f.offsetWidth * fx, f.offsetHeight * fy);
    }, [fx, fy]);
    trackpadRuns.push({ at, u, v });
  }
  const tabletCentre = await page.evaluate(() => {
    const f = document.getElementById("screen-tablet");
    return window.__typingCat.screenPoint(f, f.offsetWidth / 2, f.offsetHeight / 2);
  });
  trackpadRuns.push({ at: tabletCentre, u: 0, v: null });
  for (const run of trackpadRuns) {
    await page.mouse.move(run.at.x, run.at.y, { steps: 8 });
    await page.waitForTimeout(700);
    Object.assign(run, await page.evaluate(() => {
      const c = window.__typingCat;
      const uv = c.trackpadUV();
      const want = c.trackpadWorld(uv.u, uv.v);
      const got = c.pawWorld("right");
      return { mode: c.rightPawMode(), gotUV: { u: +uv.u.toFixed(3), v: +uv.v.toFixed(3) }, pawDx: +Math.abs(got.x - want.x).toFixed(4), pawDz: +Math.abs(got.z - want.z).toFixed(4) };
    }));
  }
  check("A3 the right paw follows the mouse across the laptop's viewport on the trackpad (and pins to the edge off-screen)",
    trackpadRuns.every((r) =>
      r.mode === "trackpad" && r.pawDx < 0.02 && r.pawDz < 0.02 &&
      Math.abs(r.gotUV.u - r.u) < 0.02 && (r.v === null || Math.abs(r.gotUV.v - r.v) < 0.02)),
    trackpadRuns.map(({ at, ...r }) => ({ at: { x: Math.round(at.x), y: Math.round(at.y) }, ...r })));

  // A3: a click on a drawn screen reaches the DS control drawn there.
  const target = await page.evaluate(() => {
    const frame = document.getElementById("screen-tablet");
    const btn = [...frame.contentDocument.querySelectorAll("button")].find((b) => b.textContent.includes("Order treats"));
    const r = btn.getBoundingClientRect();
    return window.__typingCat.screenPoint(frame, r.left + r.width / 2, r.top + r.height / 2);
  });
  await page.mouse.click(target.x, target.y);
  await page.waitForTimeout(250);
  const treats = await page.evaluate(() => ({
    store: window.__typingCat.store.get().treatsOrdered,
    phoneStat: document.getElementById("screen-phone").contentDocument.querySelector("#treats [data-fsds-component=stat]")?.textContent.trim(),
  }));
  check("A3 clicking 'Order treats' where the tablet draws it orders a treat, and the phone shows it", treats.store === 1 && treats.phoneStat === "1", { target, ...treats });
  await shot(page, "03-trackpad-and-treat");

  // A4: framing — the cat is in the foreground below the laptop, the laptop
  // screen is above its keyboard, tablet left and phone right.
  const framing = await page.evaluate(() => {
    const c = window.__typingCat;
    const pt = (id, fx, fy) => {
      const f = document.getElementById(id);
      return c.screenPoint(f, f.offsetWidth * fx, f.offsetHeight * fy);
    };
    return {
      laptopScreen: pt("screen-laptop", 0.5, 0.5),
      tablet: pt("screen-tablet", 0.5, 0.5),
      phone: pt("screen-phone", 0.5, 0.5),
      paws: [c.pawScreen("left"), c.pawScreen("right")],
      viewport: [innerWidth, innerHeight],
    };
  });
  const f = framing;
  check("A4 over-the-shoulder framing: laptop screen centred above the paws, tablet left, phone right, all in view",
    f.tablet.x < f.laptopScreen.x && f.phone.x > f.laptopScreen.x &&
      f.paws.every((p) => p.y > f.laptopScreen.y) &&
      [f.laptopScreen, f.tablet, f.phone].every((p) => p.x > 0 && p.x < f.viewport[0] && p.y > 0 && p.y < f.viewport[1]),
    f);

  check("no uncaught page errors", pageErrors.length === 0, { pageErrors });
} finally {
  await browser.close();
}

report.failures = failures;
writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(`\n${report.checks.length - failures}/${report.checks.length} checks passed (path: ${report.path}). Artifacts: ${outDir}`);
process.exit(failures ? 1 : 0);
