import * as THREE from "three";
import { DrawableSurface, asDrawable } from "./html-in-canvas";
import { elementToCanvasMatrix, isFrontFacing, multiply } from "./projection";
import { SPEED_RAD_PER_SEC, type ColorTemp, type SceneState, type Shape, type Store } from "./store";

const COLOR_TEMP_HEX: Record<ColorTemp, number> = {
  warm: 0xffb46b,
  cool: 0xcfe3ff,
  signal: 0xff3b30,
};

const TELEMETRY_INTERVAL_MS = 100;
const ORBIT_TARGET = new THREE.Vector3(0, 1.1, 0);

export interface PanelSpec {
  element: HTMLElement;
  /** Panel width in world units; height follows the element's aspect ratio. */
  width: number;
  position: THREE.Vector3;
  /** Yaw around the scene centre, radians. */
  yaw: number;
  /** Backward tilt, radians (a lectern leans away from the viewer). */
  tilt: number;
}

interface Panel {
  spec: PanelSpec;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  surface: DrawableSurface;
  size: { width: number; height: number };
  facing: boolean;
}

function buildShape(shape: Shape): THREE.BufferGeometry {
  switch (shape) {
    case "box":
      return new THREE.BoxGeometry(0.9, 0.9, 0.9);
    case "icosahedron":
      return new THREE.IcosahedronGeometry(0.62, 0);
    case "torus":
      return new THREE.TorusKnotGeometry(0.42, 0.14, 160, 24);
  }
}

/**
 * The element snapshot is already display-referred sRGB in a plain RGBA8
 * texture that three.js did not allocate, so neither three's sRGB decode nor
 * its output encode may touch it: sample and emit the texel unchanged, so the
 * panel shows exactly the pixels the DS component painted.
 */
function panelMaterial(map: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: map } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      varying vec2 vUv;
      void main() {
        gl_FragColor = texture2D(map, vUv);
      }
    `,
    transparent: true,
    toneMapped: false,
  });
}

const SHAPE_LABEL: Record<Shape, string> = {
  torus: "Torus knot",
  box: "Cube",
  icosahedron: "Icosahedron",
};

export interface SpatialScene {
  /** Diagnostic hook for the runtime verifier; not an app API. */
  debug: {
    panelScreenPoint(element: HTMLElement, ex: number, ey: number): { x: number; y: number } | null;
    objectScreenPoint(name: "object" | "lamp"): { x: number; y: number };
    lampIntensity(): number;
    lampColor(): string;
    objectShape(): Shape;
    uploads(): Record<string, number>;
  };
}

export function createSpatialScene(canvas: HTMLCanvasElement, store: Store, panelSpecs: PanelSpec[]): SpatialScene {
  const drawable = asDrawable(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const gl = renderer.getContext() as WebGL2RenderingContext;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0f14);
  scene.fog = new THREE.Fog(0x0d0f14, 9, 18);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  const orbit = { azimuth: 0.35, polar: 1.12, radius: 6.4 };
  const placeCamera = () => {
    const { azimuth, polar, radius } = orbit;
    camera.position.set(
      ORBIT_TARGET.x + radius * Math.sin(polar) * Math.sin(azimuth),
      ORBIT_TARGET.y + radius * Math.cos(polar),
      ORBIT_TARGET.z + radius * Math.sin(polar) * Math.cos(azimuth),
    );
    camera.lookAt(ORBIT_TARGET);
  };
  placeCamera();

  // --- set dressing -------------------------------------------------------
  scene.add(new THREE.HemisphereLight(0x8090b0, 0x101014, 0.35));
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(7, 64),
    new THREE.MeshStandardMaterial({ color: 0x1a1d25, roughness: 0.9 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.name = "Floor";
  scene.add(floor);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.7, 0.9, 48),
    new THREE.MeshStandardMaterial({ color: 0x2c313d, roughness: 0.6, metalness: 0.2 }),
  );
  pedestal.position.set(0, 0.45, -0.6);
  pedestal.name = "Pedestal";
  scene.add(pedestal);

  const objectMaterial = new THREE.MeshStandardMaterial({ color: 0xd9dde6, roughness: 0.35, metalness: 0.55 });
  const object = new THREE.Mesh(buildShape(store.get().shape), objectMaterial);
  object.position.set(0, 1.55, -0.6);
  object.name = SHAPE_LABEL[store.get().shape];
  scene.add(object);

  const lamp = new THREE.PointLight(COLOR_TEMP_HEX.warm, 0, 12, 1.4);
  lamp.position.set(0.9, 2.9, 0.3);
  scene.add(lamp);
  const bulbMaterial = new THREE.MeshBasicMaterial({ color: COLOR_TEMP_HEX.warm });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), bulbMaterial);
  bulb.position.copy(lamp.position);
  bulb.name = "Lamp";
  scene.add(bulb);

  // --- drawable panels ----------------------------------------------------
  const consoleMaterial = new THREE.MeshStandardMaterial({ color: 0x232733, roughness: 0.7, metalness: 0.3 });
  const panels: Panel[] = panelSpecs.map((spec) => {
    const size = { width: spec.element.offsetWidth, height: spec.element.offsetHeight };
    const planeHeight = spec.width * (size.height / size.width);

    const surface = new DrawableSurface(canvas, gl, spec.element);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(spec.width, planeHeight),
      panelMaterial(new THREE.ExternalTexture(surface.texture)),
    );
    mesh.visible = false;
    const mount = new THREE.Group();
    mount.position.copy(spec.position);
    mount.rotation.set(0, spec.yaw, 0);
    mesh.rotation.x = -spec.tilt;
    mount.add(mesh);

    const bezel = new THREE.Mesh(new THREE.BoxGeometry(spec.width + 0.12, planeHeight + 0.12, 0.06), consoleMaterial);
    bezel.rotation.x = -spec.tilt;
    bezel.position.z = -0.035;
    mount.add(bezel);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, spec.position.y, 12), consoleMaterial);
    stand.position.set(0, -spec.position.y / 2, -0.1);
    mount.add(stand);
    scene.add(mount);

    return {
      spec,
      mesh,
      surface,
      size,
      facing: true,
    };
  });

  // --- store -> scene -----------------------------------------------------
  let rotation = store.get().rotation;
  let publishedRotation = rotation;
  let pulseEnergy = 0;
  let lastPulse = store.get().pulse;
  let shape = store.get().shape;

  const applyState = (state: SceneState) => {
    if (state.shape !== shape) {
      shape = state.shape;
      object.geometry.dispose();
      object.geometry = buildShape(shape);
      object.name = SHAPE_LABEL[shape];
    }
    if (state.pulse !== lastPulse) {
      lastPulse = state.pulse;
      if (state.lampOn) pulseEnergy = 1;
    }
    if (state.rotation !== publishedRotation) {
      // Written by a panel (Reset object), not by this scene's own publish.
      rotation = state.rotation;
      publishedRotation = rotation;
    }
    const color = COLOR_TEMP_HEX[state.colorTemp];
    lamp.color.setHex(color);
    bulbMaterial.color.setHex(state.lampOn ? color : 0x2a2a2e);
    objectMaterial.emissive.setHex(state.selected === object.name ? 0x1d3b66 : 0x000000);
  };
  applyState(store.get());
  store.subscribe(applyState);

  // --- pointer: orbit on empty canvas, pick on click ----------------------
  const raycaster = new THREE.Raycaster();
  let drag: { x: number; y: number; moved: boolean; id: number } | null = null;
  canvas.addEventListener("pointerdown", (event) => {
    // Events that hit a drawable panel carry that panel's DOM target; only
    // presses on bare canvas steer the camera.
    if (event.target !== canvas) return;
    drag = { x: event.clientX, y: event.clientY, moved: false, id: event.pointerId };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    drag.x = event.clientX;
    drag.y = event.clientY;
    orbit.azimuth = THREE.MathUtils.clamp(orbit.azimuth - dx * 0.006, -1.3, 1.3);
    orbit.polar = THREE.MathUtils.clamp(orbit.polar - dy * 0.005, 0.45, 1.45);
    placeCamera();
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const wasClick = !drag.moved;
    drag = null;
    canvas.releasePointerCapture(event.pointerId);
    if (!wasClick) return;
    const rect = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, camera);
    const [hit] = raycaster.intersectObjects([object, bulb, pedestal], false);
    if (!hit) return;
    if (hit.object === bulb) {
      store.set({ lampOn: !store.get().lampOn, selected: bulb.name });
    } else {
      store.set({ selected: hit.object.name });
    }
  });
  canvas.addEventListener(
    "wheel",
    (event) => {
      if (event.target !== canvas) return;
      event.preventDefault();
      orbit.radius = THREE.MathUtils.clamp(orbit.radius + event.deltaY * 0.004, 3.5, 10);
      placeCamera();
    },
    { passive: false },
  );

  // --- resize -------------------------------------------------------------
  let cssSize = { width: canvas.clientWidth, height: canvas.clientHeight };
  const resize = () => {
    cssSize = { width: canvas.clientWidth, height: canvas.clientHeight };
    renderer.setSize(cssSize.width, cssSize.height, false);
    camera.aspect = cssSize.width / cssSize.height;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  // --- geometry sync ------------------------------------------------------
  const panelMatrix = (panel: Panel) => {
    const mvp = multiply(
      camera.projectionMatrix.elements,
      multiply(camera.matrixWorldInverse.elements, panel.mesh.matrixWorld.elements),
    );
    const params = panel.mesh.geometry.parameters;
    return elementToCanvasMatrix({
      modelViewProjection: mvp,
      planeWidth: params.width,
      planeHeight: params.height,
      elementWidth: panel.size.width,
      elementHeight: panel.size.height,
      canvasWidth: cssSize.width,
      canvasHeight: cssSize.height,
    });
  };

  const syncGeometry = () => {
    for (const panel of panels) {
      const m = panelMatrix(panel);
      const facing = panel.surface.hasTexture && isFrontFacing(m, panel.size.width, panel.size.height);
      if (facing !== panel.facing) {
        panel.facing = facing;
        // A panel turned away from the camera must not keep receiving clicks
        // or focus through its mirrored projection.
        panel.spec.element.inert = !facing;
      }
      panel.surface.setGeometry(m);
    }
  };

  // --- paint loop ---------------------------------------------------------
  let lastFrame = performance.now();
  let frames = 0;
  let fpsWindowStart = lastFrame;
  let lastPublish = 0;

  drawable.onpaint = (event) => {
    const changed = new Set(event.changedElements ?? []);
    for (const panel of panels) {
      if (panel.surface.paint(changed)) panel.mesh.visible = true;
    }
    renderer.resetState();

    const frameStart = performance.now();
    const dt = Math.min((frameStart - lastFrame) / 1000, 0.1);
    lastFrame = frameStart;
    const state = store.get();
    if (state.autoRotate) rotation += SPEED_RAD_PER_SEC[state.speed] * dt;
    object.rotation.set(rotation * 0.4, rotation, 0);
    pulseEnergy = Math.max(0, pulseEnergy - dt * 1.6);
    lamp.intensity = state.lampOn ? 14 + pulseEnergy * 60 : 0;

    renderer.render(scene, camera);
    syncGeometry();

    frames++;
    const now = performance.now();
    if (now - lastPublish >= TELEMETRY_INTERVAL_MS) {
      lastPublish = now;
      const fps = Math.round((frames * 1000) / Math.max(1, now - fpsWindowStart));
      if (now - fpsWindowStart > 1000) {
        frames = 0;
        fpsWindowStart = now;
      }
      publishedRotation = rotation;
      store.set({ rotation, fps });
    }
    drawable.requestPaint();
  };
  drawable.requestPaint();

  const toScreen = (world: THREE.Vector3) => {
    const rect = canvas.getBoundingClientRect();
    const v = world.clone().project(camera);
    return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height };
  };

  return {
    debug: {
      panelScreenPoint(element, ex, ey) {
        const panel = panels.find((p) => p.spec.element === element);
        if (!panel) return null;
        const { width, height } = panel.mesh.geometry.parameters;
        const local = new THREE.Vector3((ex / panel.size.width - 0.5) * width, (0.5 - ey / panel.size.height) * height, 0);
        return toScreen(local.applyMatrix4(panel.mesh.matrixWorld));
      },
      objectScreenPoint(name) {
        return toScreen((name === "lamp" ? bulb : object).getWorldPosition(new THREE.Vector3()));
      },
      lampIntensity: () => lamp.intensity,
      lampColor: () => `#${lamp.color.getHexString()}`,
      objectShape: () => shape,
      uploads: () => Object.fromEntries(panels.map((p) => [p.spec.element.id, p.surface.uploads])),
    },
  };
}
