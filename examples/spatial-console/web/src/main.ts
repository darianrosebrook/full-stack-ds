import * as THREE from "three";
import "@full-stack-ds/tokens/tokens.css";
import "./panels.css";
import { detectSupport } from "./html-in-canvas";
import { createStore } from "./store";
import { createSpatialScene } from "./scene";
import { mountLightingPanel } from "./panels/lighting-react";
import { mountMotionPanel } from "./panels/motion-vue";
import { mountTelemetryPanel } from "./panels/telemetry-lit";

const canvas = document.getElementById("scene") as HTMLCanvasElement;
const lighting = document.getElementById("panel-lighting") as HTMLElement;
const motion = document.getElementById("panel-motion") as HTMLElement;
const telemetry = document.getElementById("panel-telemetry") as HTMLElement;

// three.js reuses this context when it later calls getContext on the canvas.
const gl = canvas.getContext("webgl2", { antialias: true });
const support = gl ? detectSupport(canvas, gl) : { supported: false as const, missing: ["WebGL2"] };

if (!support.supported) {
  const notice = document.getElementById("unsupported")!;
  notice.hidden = false;
  document.getElementById("unsupported-detail")!.textContent = `Missing: ${support.missing.join(", ")}.`;
  canvas.hidden = true;
} else {
  const store = createStore();
  mountLightingPanel(lighting, store);
  mountMotionPanel(motion, store);
  mountTelemetryPanel(telemetry, store);

  // Panel planes take their aspect ratio from the laid-out elements, so wait
  // for fonts and one frame of layout before building the scene.
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const scene = createSpatialScene(canvas, store, [
    { element: lighting, width: 1.5, position: new THREE.Vector3(-1.75, 0.95, 1.1), yaw: 0.62, tilt: 0.42 },
    { element: motion, width: 1.75, position: new THREE.Vector3(0, 0.85, 1.75), yaw: 0, tilt: 0.5 },
    { element: telemetry, width: 1.5, position: new THREE.Vector3(1.75, 0.95, 1.1), yaw: -0.62, tilt: 0.42 },
  ]);

  Object.assign(window, { __spatialConsole: { store, support, ...scene.debug } });
  document.documentElement.dataset.spatialReady = support.upload + "+" + support.geometry;
}
