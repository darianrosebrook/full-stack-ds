import * as THREE from "three";

// Scene-art helpers for the typing-cat desk: a seeded RNG so the desk looks
// the same every load, the wood-plank plan and its painter, rounded slabs for
// device bodies, a two-bone arm solver, and a tapered tube for the tail.

/** mulberry32: a small, fast, seeded PRNG returning floats in [0, 1). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Board {
  /** Horizontal extent in texture fractions; boards in a row tile [0, 1). */
  x0: number;
  x1: number;
  /** Lightness multiplier around 1. */
  tone: number;
  /** Hue shift in degrees. */
  hue: number;
}
export interface Grain {
  row: number;
  /** Vertical position inside the row, 0..1. */
  y: number;
  amplitude: number;
  waves: number;
  phase: number;
  width: number;
  alpha: number;
}
export interface Knot {
  row: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
}
export interface WoodPlan {
  rows: Board[][];
  grains: Grain[];
  knots: Knot[];
}

/**
 * Lay out planks: each row is split into two to four boards at random end
 * joints, each board gets its own tone, and grain lines and knots are placed
 * per row. Pure data, so the same seed always yields the same desk.
 */
export function woodPlan(seed: number, rowCount = 6): WoodPlan {
  const rnd = seededRandom(seed);
  const rows: Board[][] = [];
  const grains: Grain[] = [];
  const knots: Knot[] = [];
  for (let r = 0; r < rowCount; r++) {
    const joints = 1 + Math.floor(rnd() * 2);
    const cuts = Array.from({ length: joints }, () => 0.1 + rnd() * 0.8).sort((a, b) => a - b);
    const edges = [0, ...cuts, 1];
    const boards: Board[] = [];
    for (let i = 0; i < edges.length - 1; i++) {
      boards.push({ x0: edges[i], x1: edges[i + 1], tone: 0.84 + rnd() * 0.3, hue: rnd() * 8 - 4 });
    }
    rows.push(boards);
    for (let g = 0; g < 38; g++) {
      grains.push({
        row: r,
        y: rnd(),
        amplitude: 0.004 + rnd() * 0.02,
        waves: 1 + rnd() * 3,
        phase: rnd() * Math.PI * 2,
        width: 0.6 + rnd() * 2.2,
        alpha: 0.08 + rnd() * 0.16,
      });
    }
    if (rnd() < 0.45) knots.push({ row: r, x: 0.1 + rnd() * 0.8, y: 0.3 + rnd() * 0.4, rx: 0.012 + rnd() * 0.02, ry: 0.05 + rnd() * 0.06 });
  }
  return { rows, grains, knots };
}

/** Paint a wood plan into a canvas texture: oak boards, grain, joints, knots. */
export function woodTexture(plan: WoodPlan, size = 2048): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d")!;
  const rowH = size / plan.rows.length;
  plan.rows.forEach((boards, r) => {
    for (const b of boards) {
      const x = b.x0 * size;
      const w = (b.x1 - b.x0) * size;
      const grad = g.createLinearGradient(0, r * rowH, 0, (r + 1) * rowH);
      const light = (l: number) => `hsl(${27 + b.hue}, 42%, ${l * b.tone}%)`;
      grad.addColorStop(0, light(33));
      grad.addColorStop(0.5, light(37));
      grad.addColorStop(1, light(31));
      g.fillStyle = grad;
      g.fillRect(x, r * rowH, w, rowH);
    }
  });
  for (const gr of plan.grains) {
    const y0 = (gr.row + gr.y) * rowH;
    g.strokeStyle = `rgba(70, 42, 22, ${gr.alpha})`;
    g.lineWidth = gr.width;
    g.beginPath();
    for (let i = 0; i <= 64; i++) {
      const u = i / 64;
      const y = y0 + Math.sin(u * Math.PI * 2 * gr.waves + gr.phase) * gr.amplitude * rowH * 2;
      if (i === 0) g.moveTo(0, y);
      else g.lineTo(u * size, y);
    }
    g.stroke();
  }
  for (const k of plan.knots) {
    const cx = k.x * size;
    const cy = (k.row + k.y) * rowH;
    for (let ring = 0; ring < 5; ring++) {
      g.strokeStyle = `rgba(60, 34, 16, ${0.35 - ring * 0.06})`;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(cx, cy, k.ry * size * (1 + ring * 0.6), k.rx * size * (1 + ring * 0.5), 0, 0, Math.PI * 2);
      g.stroke();
    }
  }
  // Plank seams and board end joints.
  g.fillStyle = "rgba(38, 24, 14, 0.7)";
  plan.rows.forEach((boards, r) => {
    g.fillRect(0, r * rowH - 2, size, 4);
    for (const b of boards) if (b.x0 > 0) g.fillRect(b.x0 * size - 2, r * rowH, 4, rowH);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

/** A radial falloff used as a soft contact shadow under objects. */
export function contactShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function roundedRect(width: number, height: number, radius: number): THREE.Shape {
  const x = -width / 2;
  const y = -height / 2;
  const s = new THREE.Shape();
  s.moveTo(x + radius, y);
  s.lineTo(x + width - radius, y);
  s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius);
  s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height);
  s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);
  return s;
}

/**
 * A rounded-rectangle slab with bevelled edges, centred on the origin: width
 * along x, height along y, thickness along z. Rotate it for a lying slab.
 */
export function slab(width: number, height: number, thickness: number, corner: number, bevel: number): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(roundedRect(width - 2 * bevel, height - 2 * bevel, Math.max(0.001, corner - bevel)), {
    depth: thickness - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 10,
  });
  geo.center();
  return geo;
}

/** A slab lying flat: width along x, depth along z, thickness along y. */
export function flatSlab(width: number, depth: number, thickness: number, corner: number, bevel: number): THREE.ExtrudeGeometry {
  const geo = slab(width, depth, thickness, corner, bevel);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export interface ArmPose {
  shoulder: THREE.Vector3;
  elbow: THREE.Vector3;
  /** How far the shoulder slid toward the target to reach it. */
  slide: number;
  /** Bone-length multiplier, 1 unless the target is beyond reach and slide. */
  stretch: number;
}

/**
 * Two-bone IK: place an elbow so that upper (length a) and forearm (length
 * b) join the shoulder to the wrist, bending toward `pole`. A wrist out of
 * reach first slides the shoulder toward it (a cat's shoulder blade moves)
 * up to `maxSlide`; only past that do both bones stretch. The wrist is never
 * moved: the paw has to land where input put it.
 */
export function solveArm(
  shoulder: THREE.Vector3,
  wrist: THREE.Vector3,
  a: number,
  b: number,
  pole: THREE.Vector3,
  maxSlide: number,
): ArmPose {
  const reach = (a + b) * 0.995;
  const s = shoulder.clone();
  const toWrist = new THREE.Vector3().subVectors(wrist, s);
  let d = toWrist.length();
  let slide = 0;
  if (d > reach) {
    slide = Math.min(d - reach, maxSlide);
    s.addScaledVector(toWrist.clone().normalize(), slide);
    d -= slide;
  }
  const stretch = d > reach ? d / reach : 1;
  const la = a * stretch;
  const lb = b * stretch;
  const dir = new THREE.Vector3().subVectors(wrist, s);
  d = Math.max(dir.length(), Math.abs(la - lb) + 1e-4);
  dir.normalize();
  const bend = pole.clone().addScaledVector(dir, -pole.dot(dir));
  if (bend.lengthSq() < 1e-8) bend.set(0, 1, 0).addScaledVector(dir, -dir.y);
  bend.normalize();
  const cos = THREE.MathUtils.clamp((la * la + d * d - lb * lb) / (2 * la * d), -1, 1);
  const sin = Math.sqrt(1 - cos * cos);
  const elbow = s.clone().addScaledVector(dir, la * cos).addScaledVector(bend, la * sin);
  return { shoulder: s, elbow, slide, stretch };
}

/**
 * Solve the arm with the first pole, in preference order, whose elbow stays
 * at or above `floorY`, so a tucked elbow never sinks through the desk; if
 * none does, use the pole whose elbow is highest. Bone lengths are whatever
 * solveArm keeps; only the bend direction changes.
 */
export function solveArmAboveFloor(
  shoulder: THREE.Vector3,
  wrist: THREE.Vector3,
  a: number,
  b: number,
  poles: readonly THREE.Vector3[],
  maxSlide: number,
  floorY: number,
): ArmPose {
  let best: ArmPose | null = null;
  for (const pole of poles) {
    const pose = solveArm(shoulder, wrist, a, b, pole, maxSlide);
    if (pose.elbow.y >= floorY) return pose;
    if (!best || pose.elbow.y > best.elbow.y) best = pose;
  }
  return best!;
}

/**
 * A tube whose ring radius can vary along its length, rebuilt in place from a
 * curve each frame (TubeGeometry has a constant radius and allocates).
 */
export class TaperedTube {
  readonly geometry = new THREE.BufferGeometry();
  private readonly positions: Float32Array;
  private readonly normals: Float32Array;

  constructor(
    private readonly segments: number,
    private readonly radial: number,
  ) {
    const count = (segments + 1) * (radial + 1);
    this.positions = new Float32Array(count * 3);
    this.normals = new Float32Array(count * 3);
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("normal", new THREE.BufferAttribute(this.normals, 3));
    const index: number[] = [];
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radial; j++) {
        const p = i * (radial + 1) + j;
        const q = p + radial + 1;
        index.push(p, q, p + 1, q, q + 1, p + 1);
      }
    }
    this.geometry.setIndex(index);
  }

  update(curve: THREE.Curve<THREE.Vector3>, radiusAt: (u: number) => number): void {
    const frames = curve.computeFrenetFrames(this.segments, false);
    const p = new THREE.Vector3();
    const n = new THREE.Vector3();
    for (let i = 0; i <= this.segments; i++) {
      const u = i / this.segments;
      curve.getPointAt(u, p);
      const r = radiusAt(u);
      for (let j = 0; j <= this.radial; j++) {
        const v = (j / this.radial) * Math.PI * 2;
        n.copy(frames.normals[i]).multiplyScalar(-Math.cos(v)).addScaledVector(frames.binormals[i], Math.sin(v)).normalize();
        const k = (i * (this.radial + 1) + j) * 3;
        this.normals[k] = n.x;
        this.normals[k + 1] = n.y;
        this.normals[k + 2] = n.z;
        this.positions[k] = p.x + n.x * r;
        this.positions[k + 1] = p.y + n.y * r;
        this.positions[k + 2] = p.z + n.z * r;
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }
}
