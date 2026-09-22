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
        mainColumns: w.getComputedStyle(d.querySelector(".site__columns")).gridTemplateColumns.split(" ").length,
        actionsDirection: w.getComputedStyle(d.querySelector(".site__actions")).flexDirection,
        linksWrapped: w.getComputedStyle(d.querySelector(".site__links")).order === "3",
        uploads: window.__typingCat.uploads()[id],
      };
    }
    return out;
  });
  const L = layouts["screen-laptop"], T = layouts["screen-tablet"], P = layouts["screen-phone"];
  check("A1 laptop renders the desktop layout (two columns)", L.innerWidth === 1152 && L.mainColumns === 2 && L.actionsDirection === "row" && L.uploads > 0, L);
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
  // point is bare desk up and left of the laptop, off its screen, so it pins
  // to the pad's top-left corner.
  const trackpadRuns = [];
  const laptopPoints = [[0.1, 0.1, 0.1, 0.1], [0.9, 0.1, 0.9, 0.1], [0.5, 0.5, 0.5, 0.5], [0.9, 0.9, 0.9, 0.9]];
  for (const [fx, fy, u, v] of laptopPoints) {
    const at = await page.evaluate(([fx, fy]) => {
      const f = document.getElementById("screen-laptop");
      return window.__typingCat.screenPoint(f, f.offsetWidth * fx, f.offsetHeight * fy);
    }, [fx, fy]);
    trackpadRuns.push({ at, u, v });
  }
  trackpadRuns.push({ at: { x: 30, y: 30 }, u: 0, v: 0 });
  for (const run of trackpadRuns) {
    await page.mouse.move(run.at.x, run.at.y, { steps: 8 });
    await page.waitForTimeout(700);
    Object.assign(run, await page.evaluate(() => {
      const c = window.__typingCat;
      const uv = c.trackpadUV();
      const want = c.trackpadWorld(uv.u, uv.v);
      const got = c.pawWorld("right");
      return { mode: c.pawMode("right"), gotUV: { u: +uv.u.toFixed(3), v: +uv.v.toFixed(3) }, pawDx: +Math.abs(got.x - want.x).toFixed(4), pawDz: +Math.abs(got.z - want.z).toFixed(4) };
    }));
  }
  check("A3 the right paw follows the mouse across the laptop's viewport on the trackpad (and pins to the edge off-screen)",
    trackpadRuns.every((r) =>
      r.mode === "trackpad" && r.pawDx < 0.02 && r.pawDz < 0.02 &&
      Math.abs(r.gotUV.u - r.u) < 0.02 && Math.abs(r.gotUV.v - r.v) < 0.02),
    trackpadRuns.map(({ at, ...r }) => ({ at: { x: Math.round(at.x), y: Math.round(at.y) }, ...r })));

  // A3: a click on a drawn screen reaches the DS control drawn there.
  // 'Order treats' opens the tablet's treat shop; 'Order' on a product orders it.
  const clickIn = async (id, selector, match) => {
    const at = await page.evaluate(([id, selector, match]) => {
      const frame = document.getElementById(id);
      const el = [...frame.contentDocument.querySelectorAll(selector)].find((e) => !match || e.textContent.includes(match) || e.getAttribute("aria-label") === match);
      const r = el.getBoundingClientRect();
      return window.__typingCat.screenPoint(frame, r.left + r.width / 2, r.top + r.height / 2);
    }, [id, selector, match]);
    await page.mouse.move(at.x, at.y, { steps: 6 });
    await page.mouse.click(at.x, at.y);
    await page.waitForTimeout(350);
    return at;
  };
  const toastsShowing = () => page.evaluate(() =>
    ["screen-laptop", "screen-tablet", "screen-phone"].map((id) => {
      const t = document.getElementById(id).contentDocument.querySelector("[data-site-toast] .toast__item");
      return t ? `${t.closest("[data-site-toast]").getAttribute("data-site-toast")}: ${t.textContent.trim()}` : null;
    }));
  const shopTarget = await clickIn("screen-tablet", "button", "Order treats");
  const tabletHash = await page.evaluate(() => document.getElementById("screen-tablet").contentWindow.location.hash);
  const orderTarget = await clickIn("screen-tablet", "button", "Order Tuna flakes");
  const treats = await page.evaluate(() => ({
    store: window.__typingCat.store.get().treatsOrdered,
    tuna: window.__typingCat.store.get().treatOrders.tuna,
    phoneStat: document.getElementById("screen-phone").contentDocument.querySelector("#treats-ordered [data-fsds-component=stat]")?.textContent.trim(),
  }));
  const orderToasts = await toastsShowing();
  check("A3 clicking the tablet's drawn 'Order treats' opens its treat shop, and 'Order' there orders a treat the phone counts",
    tabletHash === "#/treats" && treats.store === 1 && treats.tuna === 1 && treats.phoneStat === "1",
    { shopTarget, tabletHash, orderTarget, ...treats });
  check("A6 ordering a treat shows an 'ordered' toast on all three devices",
    orderToasts.every((t) => t?.startsWith("ordered: Treat ordered") && t.includes("Tuna flakes")), orderToasts);
  await shot(page, "03-trackpad-and-treat");
  await clickIn("screen-tablet", "a", "Draft");

  // A5: the mouse is only ever over one screen, so it says which device the
  // cat uses. Over the tablet (on its left) the cat leans left and works it
  // with the left paw; over the phone (on its right), leans right and uses
  // the right paw. Clicking the draft field there focuses it, and typing
  // taps along that field instead of slapping laptop keys.
  const handheld = [
    { id: "screen-tablet", device: "tablet", paw: "left", leanSign: -1, text: "hi", clickKey: { code: "KeyO", char: "o" } },
    { id: "screen-phone", device: "phone", paw: "right", leanSign: 1, text: "yo", clickKey: { code: "Period", char: "." } },
  ];
  for (const h of handheld) {
    const at = await page.evaluate((id) => {
      const frame = document.getElementById(id);
      const r = frame.contentDocument.querySelector("input[name=draft]").getBoundingClientRect();
      const local = { x: r.left + r.width * 0.3, y: r.top + r.height / 2 };
      return { local, window: window.__typingCat.screenPoint(frame, local.x, local.y) };
    }, h.id);
    await page.mouse.move(at.window.x, at.window.y, { steps: 10 });
    await page.waitForTimeout(900);
    const hover = await page.evaluate(([id, paw, local]) => {
      const c = window.__typingCat;
      const want = c.screenWorld(document.getElementById(id), local.x, local.y);
      const got = c.pawWorld(paw);
      return {
        attention: c.attention(), lean: +c.lean().toFixed(3), mode: c.pawMode(paw), catX: +c.catWorld().x.toFixed(3),
        dx: +Math.abs(got.x - want.x).toFixed(4), dz: +Math.abs(got.z - want.z).toFixed(4),
      };
    }, [h.id, h.paw, at.local]);
    check(`A5 over the ${h.device} the cat leans ${h.paw} and its ${h.paw} paw follows the pointer on that screen`,
      hover.attention === h.device && hover.lean * h.leanSign > 0.9 && hover.catX * h.leanSign > 0.8 &&
        hover.mode === h.device && hover.dx < 0.03 && hover.dz < 0.03,
      hover);

    const keyboardState = () => page.evaluate(() => Object.fromEntries(
      ["screen-laptop", "screen-tablet", "screen-phone"].map((id) => {
        const kb = document.getElementById(id).contentDocument.querySelector("[data-device-keyboard]");
        if (!kb) return [id, "absent"];
        const r = kb.getBoundingClientRect();
        const vh = document.getElementById(id).contentWindow.innerHeight;
        // Open = flagged open and fully on-screen, docked to the bottom.
        return [id, kb.hasAttribute("data-open") && Math.abs(r.bottom - vh) < 1 ? "open" : r.top >= vh - 1 ? "hidden" : "moving"];
      })));
    const keyboardBefore = await keyboardState();

    const slapBefore = await page.evaluate(() => window.__typingCat.lastSlap()?.at ?? null);
    await page.mouse.click(at.window.x, at.window.y);
    await page.waitForTimeout(450);
    const click = await page.evaluate((id) => ({
      tap: window.__typingCat.lastTap(),
      focusedHere: document.getElementById(id).contentDocument.activeElement?.getAttribute("name") ?? null,
    }), h.id);
    const keyboardFocused = await keyboardState();
    check(`A5 clicking the ${h.device}'s field taps it with the ${h.paw} paw and focuses it there`,
      click.tap?.device === h.device && click.tap?.paw === h.paw && click.focusedHere === "draft", click);
    const others = handheld.filter((o) => o.id !== h.id).map((o) => o.id);
    check(`A5 focusing the ${h.device}'s field slides up its on-screen keyboard (no other device's, none on the laptop)`,
      keyboardBefore[h.id] === "hidden" && keyboardFocused[h.id] === "open" &&
        others.every((o) => keyboardFocused[o] === "hidden") && keyboardFocused["screen-laptop"] === "absent",
      { before: keyboardBefore, focused: keyboardFocused });

    await page.keyboard.press("End");
    await page.waitForTimeout(150);
    const draftBefore = await page.evaluate(() => window.__typingCat.store.get().draft);
    const taps = [];
    for (const ch of h.text) {
      await page.keyboard.press(ch);
      await page.waitForTimeout(220);
      taps.push(await page.evaluate(([id, paw, code]) => {
        const c = window.__typingCat;
        const tap = c.lastTap();
        const key = document.getElementById(id).contentDocument.querySelector(`[data-key-code="${code}"]`).getBoundingClientRect();
        const want = c.screenWorld(document.getElementById(id), tap.x, tap.y);
        const got = c.pawWorld(paw);
        return {
          code, device: tap.device, paw: tap.paw,
          onKey: tap.x >= key.left && tap.x <= key.right && tap.y >= key.top && tap.y <= key.bottom,
          dx: +Math.abs(got.x - want.x).toFixed(4), dz: +Math.abs(got.z - want.z).toFixed(4),
        };
      }, [h.id, h.paw, `Key${ch.toUpperCase()}`]));
    }
    const afterTyping = await page.evaluate(() => ({
      draft: window.__typingCat.store.get().draft,
      slapAt: window.__typingCat.lastSlap()?.at ?? null,
      laptopField: document.getElementById("screen-laptop").contentDocument.querySelector("input[name=draft]").value,
    }));
    check(`A5 typing on the ${h.device} is tapped out by the ${h.paw} paw on its on-screen keys, lands in the site, and slaps no laptop key`,
      taps.every((t) => t.device === h.device && t.paw === h.paw && t.onKey && t.dx < 0.03 && t.dz < 0.03) &&
        afterTyping.draft === draftBefore + h.text && afterTyping.laptopField === afterTyping.draft && afterTyping.slapAt === slapBefore,
      { taps, draftBefore, ...afterTyping });
    await shot(page, `04-${h.device}`);

    // Clicking a key where the device draws it types it; the field keeps focus.
    const keyAt = await page.evaluate(([id, code]) => {
      const frame = document.getElementById(id);
      const r = frame.contentDocument.querySelector(`[data-key-code="${code}"]`).getBoundingClientRect();
      return window.__typingCat.screenPoint(frame, r.left + r.width / 2, r.top + r.height / 2);
    }, [h.id, h.clickKey.code]);
    await page.mouse.click(keyAt.x, keyAt.y);
    await page.waitForTimeout(250);
    const afterKeyClick = await page.evaluate((id) => ({
      draft: window.__typingCat.store.get().draft,
      focusedHere: document.getElementById(id).contentDocument.activeElement?.getAttribute("name") ?? null,
      tap: window.__typingCat.lastTap(),
    }), h.id);
    check(`A5 clicking the ${h.device}'s drawn '${h.clickKey.char}' key types it, taps it with the ${h.paw} paw, and keeps the field focused`,
      afterKeyClick.draft === afterTyping.draft + h.clickKey.char && afterKeyClick.focusedHere === "draft" &&
        afterKeyClick.tap?.paw === h.paw && afterKeyClick.tap?.device === h.device,
      afterKeyClick);

    // Tapping away from the field blurs it, and the keyboard slides away.
    const awayAt = await page.evaluate((id) => {
      const frame = document.getElementById(id);
      const r = frame.contentDocument.querySelector(".site__brand").getBoundingClientRect();
      return window.__typingCat.screenPoint(frame, r.left + r.width / 2, r.top + r.height / 2);
    }, h.id);
    await page.mouse.click(awayAt.x, awayAt.y);
    await page.waitForTimeout(450);
    const blurred = await page.evaluate((id) => document.getElementById(id).contentDocument.activeElement?.getAttribute("name") ?? null, h.id);
    const keyboardBlurred = await keyboardState();
    check(`A5 tapping away from the ${h.device}'s field blurs it and the keyboard slides away`,
      blurred !== "draft" && keyboardBlurred[h.id] === "hidden", { blurredFocus: blurred, keyboard: keyboardBlurred });
  }

  // Back over the laptop, the cat straightens up.
  const laptopMid = await page.evaluate(() => {
    const f = document.getElementById("screen-laptop");
    return window.__typingCat.screenPoint(f, f.offsetWidth / 2, f.offsetHeight / 2);
  });
  await page.mouse.move(laptopMid.x, laptopMid.y, { steps: 10 });
  await page.waitForTimeout(1200);
  const upright = await page.evaluate(() => ({ attention: window.__typingCat.attention(), lean: +window.__typingCat.lean().toFixed(3), right: window.__typingCat.pawMode("right"), left: window.__typingCat.pawMode("left") }));
  check("A5 back over the laptop the cat sits upright: left paw on the keys, right paw on the trackpad",
    upright.attention === "laptop" && Math.abs(upright.lean) < 0.05 && upright.left === "keys" && upright.right === "trackpad", upright);

  // A6: pages, the account menu, toasts and scrolling.
  const hashes = () => page.evaluate(() =>
    ["screen-laptop", "screen-tablet", "screen-phone"].map((id) => document.getElementById(id).contentWindow.location.hash || "#/draft"));
  const pageShown = (id) => page.evaluate((id) => document.getElementById(id).contentDocument.querySelector(".site").dataset.page, id);

  // The avatar opens a menu; its 'Your stats' opens that device's Stats page.
  await clickIn("screen-laptop", ".site__avatar-button");
  const menu = await page.evaluate(() => {
    const d = document.getElementById("screen-laptop").contentDocument;
    const m = d.querySelector("[data-account-menu]");
    const trigger = d.querySelector(".site__avatar-button");
    return {
      items: m ? [...m.querySelectorAll("button")].map((b) => b.textContent.trim()) : null,
      expanded: trigger.getAttribute("aria-expanded"),
      belowAvatar: m ? m.getBoundingClientRect().top >= trigger.getBoundingClientRect().bottom - 1 : false,
    };
  });
  check("A6 clicking the laptop's avatar drops down its account menu",
    JSON.stringify(menu.items) === JSON.stringify(["Your stats", "Treat shop", "Start a nap", "Sign out"]) && menu.expanded === "true" && menu.belowAvatar,
    menu);
  await clickIn("screen-laptop", "[data-account-menu] button", "Your stats");
  const afterStats = {
    hashes: await hashes(),
    laptopPage: await pageShown("screen-laptop"),
    menuClosed: await page.evaluate(() => !document.getElementById("screen-laptop").contentDocument.querySelector("[data-account-menu]")),
    activity: await page.evaluate(() => [...document.getElementById("screen-laptop").contentDocument.querySelectorAll("[data-activity] li")].map((li) => li.textContent.trim())),
  };
  check("A6 'Your stats' opens the Stats page on that device only, listing the treat order in recent activity",
    afterStats.laptopPage === "stats" && JSON.stringify(afterStats.hashes) === JSON.stringify(["#/stats", "#/draft", "#/draft"]) &&
      afterStats.menuClosed && afterStats.activity[0]?.startsWith("Treat ordered"),
    afterStats);

  // Sign out from the menu: a toast everywhere, and the cat is still signed in.
  await clickIn("screen-laptop", ".site__avatar-button");
  await clickIn("screen-laptop", "[data-account-menu] button", "Sign out");
  const signoutToasts = await toastsShowing();
  check("A6 'Sign out' in the menu shows a 'signout' toast on all three devices",
    signoutToasts.every((t) => t?.startsWith("signout: Nice try")), signoutToasts);

  // The draft page's actions toast on every device.
  await clickIn("screen-laptop", "a", "Draft");
  await clickIn("screen-laptop", "button", "Send to editor");
  const sentToasts = await toastsShowing();
  const sent = await page.evaluate(() => window.__typingCat.store.get().sentToEditor);
  check("A6 'Send to editor' shows a 'sent' toast on all three devices",
    sent === 1 && sentToasts.every((t) => t?.startsWith("sent: Sent to editor") && t.includes("notified 1 time.")), { sent, sentToasts });

  // Scrolling: the wheel over a drawn screen scrolls that device's page, the
  // new scroll position is re-uploaded, and the paw mimes it — a stroke on
  // the laptop's trackpad, a swipe up the phone's screen.
  await clickIn("screen-laptop", "a", "Treats");
  await clickIn("screen-phone", "a", "Treats");
  const scrollRuns = [];
  for (const { id, device, paw } of [
    { id: "screen-laptop", device: "laptop", paw: "right" },
    { id: "screen-phone", device: "phone", paw: "right" },
  ]) {
    const at = await page.evaluate((id) => {
      const f = document.getElementById(id);
      const local = { x: f.offsetWidth / 2, y: f.offsetHeight / 2 };
      return { local, window: window.__typingCat.screenPoint(f, local.x, local.y) };
    }, id);
    await page.mouse.move(at.window.x, at.window.y, { steps: 6 });
    await page.waitForTimeout(700);
    const before = await page.evaluate((id) => ({
      scrollY: document.getElementById(id).contentWindow.scrollY,
      uploads: window.__typingCat.uploads()[id],
    }), id);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(120);
    const during = await page.evaluate(([id, device, paw, local]) => {
      const c = window.__typingCat;
      const got = c.pawWorld(paw);
      // Where the paw rests without a stroke, and where a finger swiping
      // toward the top of the screen / away from the cat would be.
      let rest, up;
      if (device === "laptop") {
        const uv = c.trackpadUV();
        rest = c.trackpadWorld(uv.u, uv.v);
        up = { ...rest, z: rest.z - 1 };
      } else {
        const f = document.getElementById(id);
        rest = c.screenWorld(f, local.x, local.y);
        up = c.screenWorld(f, local.x, local.y - 100);
      }
      const moved = { x: got.x - rest.x, z: got.z - rest.z };
      const toward = { x: up.x - rest.x, z: up.z - rest.z };
      const len = Math.hypot(toward.x, toward.z);
      return {
        scrollY: document.getElementById(id).contentWindow.scrollY,
        uploads: c.uploads()[id],
        mode: c.pawMode(paw),
        stroke: +c.scrollStroke().toFixed(1),
        // Paw displacement projected on the "swipe up" direction, world units.
        alongSwipe: +((moved.x * toward.x + moved.z * toward.z) / len).toFixed(3),
      };
    }, [id, device, paw, at.local]);
    scrollRuns.push({ device, before, during });
  }
  check("A6 the mouse wheel scrolls the treat shop on the device under the pointer, and the drawn screen re-uploads",
    scrollRuns.every((r) => r.during.scrollY > r.before.scrollY + 100 && r.during.uploads > r.before.uploads), scrollRuns);
  check("A6 while scrolling, the paw strokes the laptop's trackpad and swipes up the phone's screen",
    scrollRuns[0].during.mode === "trackpad" && scrollRuns[1].during.mode === "phone" &&
      scrollRuns.every((r) => r.during.stroke < -20 && r.during.alongSwipe > 0.03),
    scrollRuns.map((r) => ({ device: r.device, ...r.during })));
  await shot(page, "05-scrolled-shop");

  // Delete everything clears the draft and toasts; do it last, it wipes the text.
  await clickIn("screen-tablet", "button", "Delete everything");
  const deleted = await page.evaluate(() => ({
    draft: window.__typingCat.store.get().draft,
    deleted: window.__typingCat.store.get().deleted,
  }));
  const deleteToasts = await toastsShowing();
  check("A6 'Delete everything' clears the draft and shows a 'deleted' toast on all three devices",
    deleted.draft === "" && deleted.deleted === 1 && deleteToasts.every((t) => t?.startsWith("deleted: Draft deleted")), { ...deleted, deleteToasts });
  await shot(page, "06-deleted-toast");
  await page.mouse.move(laptopMid.x, laptopMid.y, { steps: 6 });
  await page.waitForTimeout(1200);

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
