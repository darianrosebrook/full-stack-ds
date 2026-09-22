import * as THREE from "three";
import { DrawableSurface, asDrawable } from "../html-in-canvas";
import { elementToCanvasMatrix, multiply, transformPoint } from "../projection";
import { untransformPoint, viewportToTrackpadUV } from "./trackpad";
import { KEY_CELLS, KEYBOARD_WIDTH_UNITS, keyCell, pawForCode, type Paw } from "./keyboard-layout";

// World units: 1 = 10 cm. The laptop sits at the origin with its keyboard
// facing the camera (+z); the typist — the cat — is behind the camera side.

const LAPTOP = { width: 3.1, depth: 2.15, thickness: 0.08 };
const KEY_UNIT = 0.178;
const KEY_SIZE = 0.155;
const KEYBOARD_BACK_Z = -0.92;
const TRACKPAD = { width: 1.15, depth: 0.72, centerZ: 0.6 };
const PAW_HOVER = 0.28;
const SLAP_MS = 150;

function woodTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext("2d")!;
  const planks = 6;
  for (let i = 0; i < planks; i++) {
    const base = 128 + ((i * 37) % 23);
    g.fillStyle = `rgb(${base}, ${base - 4}, ${base - 10})`;
    g.fillRect(0, (i * c.height) / planks, c.width, c.height / planks);
    for (let s = 0; s < 70; s++) {
      const y = (i * c.height) / planks + Math.random() * (c.height / planks);
      g.strokeStyle = `rgba(60, 55, 50, ${0.05 + Math.random() * 0.08})`;
      g.lineWidth = 1 + Math.random() * 2;
      g.beginPath();
      g.moveTo(0, y);
      g.bezierCurveTo(c.width * 0.3, y + Math.random() * 8 - 4, c.width * 0.7, y + Math.random() * 8 - 4, c.width, y);
      g.stroke();
    }
    g.fillStyle = "rgba(40, 35, 30, 0.55)";
    g.fillRect(0, (i * c.height) / planks - 2, c.width, 4);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

/** Unlit, colour-exact material for a drawn DOM snapshot (see scene.ts). */
function screenMaterial(map: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: map } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      varying vec2 vUv;
      void main() { gl_FragColor = texture2D(map, vUv); }
    `,
    toneMapped: false,
  });
}

interface Screen {
  element: HTMLIFrameElement;
  surface: DrawableSurface;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  size: { width: number; height: number };
  matrix: number[];
}

interface PawState {
  side: "left" | "right";
  rest: THREE.Vector3;
  target: THREE.Vector3;
  position: THREE.Vector3;
  slapStart: number;
  mesh: THREE.Mesh;
  arm: THREE.Mesh;
  localShoulder: THREE.Vector3;
  shoulder: THREE.Vector3;
}

/** Which device the cat is attending to: the last one input came through. */
export type Device = "laptop" | "tablet" | "phone";
export type PawMode = "keys" | "trackpad" | "tablet" | "phone";

export interface Desk {
  /**
   * Wire keyboard and pointer listeners on the desk's window, or on a device
   * frame's window when `frame` is given (input inside a frame never reaches
   * the desk's window).
   */
  listen(win: Window, frame?: HTMLIFrameElement): void;
  screenToWindow(element: HTMLIFrameElement, x: number, y: number): { x: number; y: number };
  debug: {
    pawWorld(side: "left" | "right"): { x: number; y: number; z: number };
    pawScreen(side: "left" | "right"): { x: number; y: number };
    keyWorld(code: string): { x: number; y: number; z: number } | null;
    trackpadWorld(u: number, v: number): { x: number; y: number; z: number };
    trackpadUV(): { u: number; v: number };
    screenPoint(element: HTMLIFrameElement, ex: number, ey: number): { x: number; y: number };
    /** World point on a device screen for an element-px point on it. */
    screenWorld(element: HTMLIFrameElement, ex: number, ey: number): { x: number; y: number; z: number };
    uploads(): Record<string, number>;
    lastSlap(): { code: string; paw: Paw; at: number } | null;
    /** The last tap on a tablet or phone screen, in that screen's element px. */
    lastTap(): { device: Device; paw: "left" | "right"; x: number; y: number; at: number } | null;
    attention(): Device;
    /** Smoothed lean: -1 fully toward the tablet, +1 toward the phone. */
    lean(): number;
    pawMode(side: "left" | "right"): PawMode;
    catWorld(): { x: number; y: number; z: number };
  };
}

export function createDesk(canvas: HTMLCanvasElement, screens: {
  laptop: HTMLIFrameElement;
  tablet: HTMLIFrameElement;
  phone: HTMLIFrameElement;
}): Desk {
  const drawable = asDrawable(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const gl = renderer.getContext() as WebGL2RenderingContext;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x6d6862);

  // Over the typist's shoulder, looking down at the desk (reference photo).
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.set(0.25, 5.2, 5.6);
  camera.lookAt(0, 0.55, -0.7);

  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x3a332c, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-4, 9, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  scene.add(sun);

  const desk = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 20),
    new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.85 }),
  );
  desk.rotation.x = -Math.PI / 2;
  desk.receiveShadow = true;
  scene.add(desk);

  const aluminium = new THREE.MeshStandardMaterial({ color: 0xc9cbcf, metalness: 0.6, roughness: 0.35 });
  const blackGlass = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.2, metalness: 0.1 });
  const keycap = new THREE.MeshStandardMaterial({ color: 0x151517, roughness: 0.55 });

  // --- laptop -------------------------------------------------------------
  const laptop = new THREE.Group();
  scene.add(laptop);
  const base = new THREE.Mesh(new THREE.BoxGeometry(LAPTOP.width, LAPTOP.thickness, LAPTOP.depth), aluminium);
  base.position.y = LAPTOP.thickness / 2;
  base.castShadow = base.receiveShadow = true;
  laptop.add(base);

  const keyTopY = LAPTOP.thickness + 0.02;
  const keyToWorld = (code: string) => {
    const cell = keyCell(code);
    if (!cell) return null;
    const x = (cell.x - KEYBOARD_WIDTH_UNITS / 2) * KEY_UNIT;
    const z = KEYBOARD_BACK_Z + cell.row * KEY_UNIT + KEY_UNIT / 2;
    return new THREE.Vector3(x, keyTopY, z);
  };
  const cells = [...KEY_CELLS.values()].filter((c) => c.code !== "ArrowDown");
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.03, KEY_SIZE), keycap, cells.length);
  const keyIndex = new Map<string, number>();
  const keyMatrix = (i: number, depress: number) => {
    const cell = cells[i];
    const p = keyToWorld(cell.code)!;
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(p.x, keyTopY - 0.015 - depress, p.z),
      new THREE.Quaternion(),
      new THREE.Vector3(cell.width * KEY_UNIT - (KEY_UNIT - KEY_SIZE), 1, cell.code.startsWith("Arrow") ? KEY_SIZE * 0.9 : 1),
    );
    keys.setMatrixAt(i, m);
  };
  cells.forEach((cell, i) => {
    keyIndex.set(cell.code, i);
    keyMatrix(i, 0);
  });
  keyIndex.set("ArrowDown", keyIndex.get("ArrowUp")!);
  keys.castShadow = true;
  laptop.add(keys);

  const trackpad = new THREE.Mesh(
    new THREE.BoxGeometry(TRACKPAD.width, 0.004, TRACKPAD.depth),
    new THREE.MeshStandardMaterial({ color: 0xb7b9bd, metalness: 0.5, roughness: 0.25 }),
  );
  trackpad.position.set(0, LAPTOP.thickness + 0.002, TRACKPAD.centerZ);
  laptop.add(trackpad);

  // Lid hinged on the base's back edge, opened ~110 degrees.
  const hinge = new THREE.Group();
  hinge.position.set(0, LAPTOP.thickness, -LAPTOP.depth / 2);
  hinge.rotation.x = -0.33;
  laptop.add(hinge);
  const lidHeight = 2.05;
  const lid = new THREE.Mesh(new THREE.BoxGeometry(LAPTOP.width, lidHeight, 0.05), aluminium);
  lid.position.set(0, lidHeight / 2, -0.025);
  lid.castShadow = true;
  hinge.add(lid);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(LAPTOP.width - 0.06, lidHeight - 0.06), blackGlass);
  bezel.position.set(0, lidHeight / 2, 0.001);
  hinge.add(bezel);

  // --- tablet and phone, lying flat --------------------------------------
  const tablet = new THREE.Group();
  tablet.position.set(-2.95, 0, 0.35);
  tablet.rotation.y = 0.38;
  scene.add(tablet);
  const tabletBody = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.07, 1.98), blackGlass);
  tabletBody.position.y = 0.035;
  tabletBody.castShadow = true;
  tablet.add(tabletBody);

  const phone = new THREE.Group();
  phone.position.set(2.75, 0, 0.3);
  phone.rotation.y = -0.28;
  scene.add(phone);
  const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.06, 1.5), blackGlass);
  phoneBody.position.y = 0.03;
  phoneBody.castShadow = true;
  phone.add(phoneBody);

  // --- coffee, because the reference has coffee ---------------------------
  const cup = new THREE.Group();
  cup.position.set(-2.2, 0, -2.3);
  scene.add(cup);
  const porcelain = new THREE.MeshStandardMaterial({ color: 0xf5f5f2, roughness: 0.3 });
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.05, 48), porcelain);
  saucer.position.y = 0.025;
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.3, 0.55, 48, 1, true), porcelain);
  mug.position.y = 0.33;
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.34, 48), new THREE.MeshStandardMaterial({ color: 0x1f130b, roughness: 0.15 }));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.52;
  for (const m of [saucer, mug]) m.castShadow = true;
  cup.add(saucer, mug, coffee);

  // --- screens (live iframes) ---------------------------------------------
  const makeScreen = (element: HTMLIFrameElement, width: number, place: (plane: THREE.Mesh) => void): Screen => {
    const size = { width: element.offsetWidth, height: element.offsetHeight };
    const surface = new DrawableSurface(canvas, gl, element);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, width * (size.height / size.width)),
      screenMaterial(new THREE.ExternalTexture(surface.texture)),
    );
    mesh.visible = false;
    place(mesh);
    return { element, surface, mesh, size, matrix: [] };
  };
  const all: Screen[] = [
    makeScreen(screens.laptop, 2.8, (plane) => {
      plane.position.set(0, lidHeight / 2 + 0.03, 0.003);
      hinge.add(plane);
    }),
    makeScreen(screens.tablet, 1.3, (plane) => {
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = 0.072;
      tablet.add(plane);
    }),
    makeScreen(screens.phone, 0.63, (plane) => {
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = 0.062;
      phone.add(plane);
    }),
  ];

  // --- the cat --------------------------------------------------------------
  const fur = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.95 });
  const whiteFur = new THREE.MeshStandardMaterial({ color: 0xf4f1ec, roughness: 0.9 });
  const pink = new THREE.MeshStandardMaterial({ color: 0xd99aa0, roughness: 0.8 });
  const cat = new THREE.Group();
  cat.position.set(0.05, 0, 3.15);
  scene.add(cat);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.72, 40, 28), fur);
  head.scale.set(1.08, 0.92, 1);
  head.position.set(0, 1.5, 0.1);
  cat.add(head);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.55, 4), fur);
    ear.position.set(side * 0.44, 2.05, 0.05);
    ear.rotation.set(-0.15, Math.PI / 4, side * -0.32);
    cat.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.36, 4), pink);
    inner.position.set(side * 0.43, 2.0, -0.07);
    inner.rotation.copy(ear.rotation);
    cat.add(inner);
  }
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 24), fur);
  body.scale.set(1, 1.1, 0.9);
  body.position.set(0, 0.6, 0.9);
  cat.add(body);

  // Shoulders are in the cat's frame, so they travel with a lean.
  const catShoulder = (side: number) => new THREE.Vector3(side * 0.62 - 0.05, 1.05, -0.7);
  const makePaw = (side: "left" | "right"): PawState => {
    const sign = side === "left" ? -1 : 1;
    const restKey = side === "left" ? "KeyF" : "KeyJ";
    // Targets are contact points on a surface; the pose adds the hover height.
    const rest = keyToWorld(restKey)!.add(new THREE.Vector3(0, 0, 0.1));
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), whiteFur);
    mesh.scale.set(1, 0.6, 1.25);
    mesh.castShadow = true;
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 1, 8, 16), fur);
    arm.castShadow = true;
    scene.add(mesh, arm);
    return {
      side,
      rest,
      target: rest.clone(),
      position: rest.clone(),
      slapStart: -Infinity,
      mesh,
      arm,
      localShoulder: catShoulder(sign),
      shoulder: cat.localToWorld(catShoulder(sign)),
    };
  };
  const paws = { left: makePaw("left"), right: makePaw("right") };

  // --- input -> puppet ------------------------------------------------------
  let lastSlap: { code: string; paw: Paw; at: number } | null = null;
  let lastTap: { device: Device; paw: "left" | "right"; x: number; y: number; at: number } | null = null;
  let lastPointerAt = -Infinity;
  let lastRightKeyAt = -Infinity;
  const trackpadUV = new THREE.Vector2(0.5, 0.5);
  const keyDepress = new Map<number, number>();
  // The tablet is on the cat's left, so the left paw works it; the phone is
  // on the right, so the right paw does.
  let attention: Device = "laptop";
  let lean = 0;
  const deviceOf = (frame?: HTMLIFrameElement): Device =>
    frame === screens.tablet ? "tablet" : frame === screens.phone ? "phone" : "laptop";
  const pawFor = (device: "tablet" | "phone") => (device === "tablet" ? paws.left : paws.right);
  const screenFor = (device: Device) => all.find((s) => s.element === screens[device])!;

  const trackpadToWorld = (u: number, v: number) =>
    new THREE.Vector3(
      (u - 0.5) * TRACKPAD.width * 0.9,
      LAPTOP.thickness + 0.004,
      TRACKPAD.centerZ + (v - 0.5) * TRACKPAD.depth * 0.9,
    );

  const screenWorld = (element: HTMLIFrameElement, ex: number, ey: number) => {
    const s = all.find((sc) => sc.element === element)!;
    const { width, height } = s.mesh.geometry.parameters;
    s.mesh.updateWorldMatrix(true, false);
    return s.mesh.localToWorld(new THREE.Vector3((ex / s.size.width - 0.5) * width, (0.5 - ey / s.size.height) * height, 0));
  };

  const slap = (code: string) => {
    const paw = pawForCode(code);
    const now = performance.now();
    lastSlap = { code, paw, at: now };
    const at = keyToWorld(code) ?? keyToWorld(paw === "left" ? "KeyF" : "KeyJ")!;
    const sides: ("left" | "right")[] = paw === "both" ? ["left", "right"] : [paw];
    for (const side of sides) {
      const p = paws[side];
      // Space: each paw hits its own half of the bar.
      const target = code === "Space" ? at.clone().add(new THREE.Vector3(side === "left" ? -0.35 : 0.35, 0, 0)) : at.clone();
      p.target.copy(target);
      p.slapStart = now;
      if (side === "right") lastRightKeyAt = now;
    }
    const i = keyIndex.get(code);
    if (i !== undefined) keyDepress.set(i, now);
  };

  // A paw on a tablet or phone taps where it is told, in screen element px.
  const tapScreen = (device: "tablet" | "phone", x: number, y: number) => {
    const p = pawFor(device);
    const now = performance.now();
    p.target.copy(screenWorld(screens[device], x, y));
    p.slapStart = now;
    lastTap = { device, paw: p.side, x, y, at: now };
  };
  const hoverScreen = (device: "tablet" | "phone", x: number, y: number) => {
    pawFor(device).target.copy(screenWorld(screens[device], x, y));
  };

  // Typing on a tablet or phone: the paw taps along the focused field, at the
  // key's place across the keyboard, so a key-mash walks across the field.
  const typeOnScreen = (device: "tablet" | "phone", code: string) => {
    const doc = screens[device].contentDocument!;
    const field = doc.activeElement && doc.activeElement !== doc.body ? doc.activeElement.getBoundingClientRect() : null;
    const s = screenFor(device);
    const cell = keyCell(code);
    const across = cell ? (cell.x + cell.width / 2) / KEYBOARD_WIDTH_UNITS : 0.5;
    if (field) tapScreen(device, field.left + field.width * (0.1 + 0.8 * across), field.top + field.height / 2);
    else tapScreen(device, s.size.width * across, s.size.height / 2);
  };

  // The trackpad drives the laptop's viewport: the paw sits where the pointer
  // is within the laptop screen, pinned to the pad's edge when it is off it.
  const pointerAt = (x: number, y: number) => {
    lastPointerAt = performance.now();
    const laptopScreen = all[0];
    const rect = canvas.getBoundingClientRect();
    const m = laptopScreen.matrix.length ? laptopScreen.matrix : screenMatrix(laptopScreen);
    const inViewport = untransformPoint(m, x - rect.left, y - rect.top);
    if (!inViewport) return;
    const { u, v } = viewportToTrackpadUV(inViewport, laptopScreen.size);
    trackpadUV.set(u, v);
  };

  // The device an event came through is the one the cat attends to: the
  // mouse is only ever over one screen, and keys go to the focused frame.
  const listen: Desk["listen"] = (win, frame) => {
    const device = deviceOf(frame);
    win.addEventListener(
      "keydown",
      (e) => {
        attention = device;
        if (device === "laptop") slap(e.code);
        else typeOnScreen(device, e.code);
      },
      true,
    );
    const move = (e: PointerEvent) => {
      attention = device;
      if (device === "laptop") {
        const p = frame ? screenToWindow(frame, e.clientX, e.clientY) : { x: e.clientX, y: e.clientY };
        pointerAt(p.x, p.y);
      } else {
        hoverScreen(device, e.clientX, e.clientY);
      }
    };
    win.addEventListener("pointermove", move, true);
    win.addEventListener(
      "pointerdown",
      (e) => {
        move(e);
        if (device === "laptop") paws.right.slapStart = performance.now();
        else tapScreen(device, e.clientX, e.clientY);
      },
      true,
    );
  };

  // --- resize ----------------------------------------------------------------
  let cssSize = { width: canvas.clientWidth, height: canvas.clientHeight };
  const resize = () => {
    cssSize = { width: canvas.clientWidth, height: canvas.clientHeight };
    renderer.setSize(cssSize.width, cssSize.height, false);
    camera.aspect = cssSize.width / cssSize.height;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  const screenMatrix = (s: Screen) => {
    const mvp = multiply(camera.projectionMatrix.elements, multiply(camera.matrixWorldInverse.elements, s.mesh.matrixWorld.elements));
    const params = s.mesh.geometry.parameters;
    return elementToCanvasMatrix({
      modelViewProjection: mvp,
      planeWidth: params.width,
      planeHeight: params.height,
      elementWidth: s.size.width,
      elementHeight: s.size.height,
      canvasWidth: cssSize.width,
      canvasHeight: cssSize.height,
    });
  };

  const screenToWindow: Desk["screenToWindow"] = (element, x, y) => {
    const s = all.find((sc) => sc.element === element)!;
    const rect = canvas.getBoundingClientRect();
    const p = transformPoint(s.matrix.length ? s.matrix : screenMatrix(s), x, y);
    return { x: rect.left + p.x, y: rect.top + p.y };
  };

  // --- per-frame puppet pose -------------------------------------------------
  const up = new THREE.Vector3(0, 1, 0);
  const pawMode = (side: "left" | "right", now: number): PawMode => {
    if (side === "left") return attention === "tablet" ? "tablet" : "keys";
    if (attention === "phone") return "phone";
    return attention === "laptop" && now - lastPointerAt < 2500 && now - lastRightKeyAt > 450 ? "trackpad" : "keys";
  };
  const posePaw = (p: PawState, now: number, dt: number) => {
    const mode = pawMode(p.side, now);
    if (mode === "trackpad") p.target.copy(trackpadToWorld(trackpadUV.x, trackpadUV.y));
    // A paw not busy with a pointer or a recent key drifts home to the keys.
    if (mode === "keys" && now - p.slapStart > 600 && !(p.side === "right" && now - lastPointerAt < 2500)) {
      p.target.lerp(p.rest, 1 - Math.exp(-dt * 3));
    }
    p.position.lerp(p.target, 1 - Math.exp(-dt * 28));
    // Slap: a fast drop onto the surface and a slower rebound.
    const t = (now - p.slapStart) / SLAP_MS;
    const drop = t >= 0 && t < 1 ? Math.sin(Math.PI * Math.min(1, t * 1.6)) * (1 - t * 0.4) : 0;
    const hover = mode === "keys" ? PAW_HOVER : 0.05;
    p.mesh.position.set(p.position.x, p.position.y + 0.07 + (hover - 0.07) * (1 - drop), p.position.z);
    p.shoulder.copy(p.localShoulder);
    cat.localToWorld(p.shoulder);
    const dir = new THREE.Vector3().subVectors(p.mesh.position, p.shoulder);
    const length = dir.length();
    p.arm.position.copy(p.shoulder).addScaledVector(dir, 0.5);
    p.arm.scale.set(1, Math.max(0.2, (length - 0.2) / 1.24), 1);
    p.arm.quaternion.setFromUnitVectors(up, dir.normalize());
  };

  // --- paint loop -------------------------------------------------------------
  let lastFrame = performance.now();
  drawable.onpaint = (event) => {
    const changed = new Set(event.changedElements ?? []);
    for (const s of all) if (s.surface.paint(changed)) s.mesh.visible = true;
    renderer.resetState();

    const now = performance.now();
    const dt = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    // Lean toward the attended device: slide over, turn to face it, tilt in.
    const leanTarget = attention === "tablet" ? -1 : attention === "phone" ? 1 : 0;
    lean += (leanTarget - lean) * (1 - Math.exp(-dt * 6));
    cat.position.set(0.05 + lean * 0.95, 0, 3.15 - Math.abs(lean) * 0.35);
    cat.rotation.set(0, -lean * 0.42, -lean * 0.14);
    cat.updateMatrixWorld();
    posePaw(paws.left, now, dt);
    posePaw(paws.right, now, dt);
    for (const [i, at] of keyDepress) {
      const age = now - at;
      keyMatrix(i, age < 120 ? 0.018 : 0);
      if (age >= 120) keyDepress.delete(i);
    }
    keys.instanceMatrix.needsUpdate = true;
    head.rotation.z = Math.sin(now / 90) * 0.04 * (lastSlap && now - lastSlap.at < 400 ? 1 : 0.2);

    renderer.render(scene, camera);
    for (const s of all) {
      s.matrix = screenMatrix(s);
      s.surface.setGeometry(s.matrix);
    }
    drawable.requestPaint();
  };
  drawable.requestPaint();

  const toScreen = (v: THREE.Vector3) => {
    const rect = canvas.getBoundingClientRect();
    const p = v.clone().project(camera);
    return { x: rect.left + ((p.x + 1) / 2) * rect.width, y: rect.top + ((1 - p.y) / 2) * rect.height };
  };
  const plain = (v: THREE.Vector3) => ({ x: v.x, y: v.y, z: v.z });

  return {
    listen,
    screenToWindow,
    debug: {
      pawWorld: (side) => plain(paws[side].mesh.position),
      pawScreen: (side) => toScreen(paws[side].mesh.position),
      keyWorld: (code) => {
        const k = keyToWorld(code);
        return k ? plain(k) : null;
      },
      trackpadWorld: (u, v) => plain(trackpadToWorld(u, v)),
      trackpadUV: () => ({ u: trackpadUV.x, v: trackpadUV.y }),
      screenPoint: (element, ex, ey) => screenToWindow(element, ex, ey),
      uploads: () => Object.fromEntries(all.map((s) => [s.element.id, s.surface.uploads])),
      screenWorld: (element, ex, ey) => plain(screenWorld(element, ex, ey)),
      lastSlap: () => lastSlap,
      lastTap: () => lastTap,
      attention: () => attention,
      lean: () => lean,
      pawMode: (side) => pawMode(side, performance.now()),
      catWorld: () => plain(cat.position),
    },
  };
}
