import { detectSupport } from "../html-in-canvas";
import { createSiteStore } from "./site-store";
import { createDesk } from "./desk";

const canvas = document.getElementById("desk") as HTMLCanvasElement;
const laptop = document.getElementById("screen-laptop") as HTMLIFrameElement;
const tablet = document.getElementById("screen-tablet") as HTMLIFrameElement;
const phone = document.getElementById("screen-phone") as HTMLIFrameElement;

const gl = canvas.getContext("webgl2", { antialias: true });
const support = gl ? detectSupport(canvas, gl) : { supported: false as const, missing: ["WebGL2"] };

if (!support.supported) {
  document.getElementById("unsupported")!.hidden = false;
  document.getElementById("unsupported-detail")!.textContent = ` Missing: ${support.missing.join(", ")}.`;
  canvas.hidden = true;
} else {
  // Publish the shared store before any device frame loads the site.
  const store = createSiteStore();
  window.catSite = { store };

  const frames = [laptop, tablet, phone];
  await Promise.all(
    frames.map(
      (frame) =>
        new Promise<void>((resolve) => {
          frame.addEventListener("load", () => resolve(), { once: true });
          frame.src = "/site.html";
        }),
    ),
  );
  await Promise.all(frames.map((frame) => frame.contentDocument!.fonts.ready));
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const desk = createDesk(canvas, { laptop, tablet, phone });
  desk.listen(window);
  // Key and pointer events inside a frame never reach this window, so the
  // puppet listens in each frame too, mapping frame coordinates back through
  // the screen's projection.
  for (const frame of frames) desk.listen(frame.contentWindow!, (x, y) => desk.screenToWindow(frame, x, y));

  // The cat types into the laptop's draft field from the first keystroke.
  frame(laptop).querySelector<HTMLInputElement>("input[name=draft]")?.focus();

  Object.assign(window, { __typingCat: { store, support, ...desk.debug } });
  document.documentElement.dataset.catReady = `${support.upload}+${support.geometry}`;
}

function frame(el: HTMLIFrameElement): Document {
  return el.contentDocument!;
}
