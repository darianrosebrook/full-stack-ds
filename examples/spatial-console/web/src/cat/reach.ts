// Where a paw may go, and what the mug does when a paw gets there. Pure
// top-down geometry in world x/z (y is up and ignored) plus a small spring,
// so the rules are testable without a renderer.

export interface XZ {
  x: number;
  z: number;
}
export interface Box {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}
export interface Disc extends XZ {
  r: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const dist = (a: XZ, b: XZ) => Math.hypot(a.x - b.x, a.z - b.z);

/** The nearest point of box ∪ disc to `p` (just the box without a disc); `p` itself when inside. */
export function clampToReach(p: XZ, box: Box, disc?: Disc): XZ {
  const inBox = { x: clamp(p.x, box.minX, box.maxX), z: clamp(p.z, box.minZ, box.maxZ) };
  if (!disc) return inBox;
  const d = dist(p, disc);
  const inDisc = d <= disc.r ? { x: p.x, z: p.z } : { x: disc.x + ((p.x - disc.x) / d) * disc.r, z: disc.z + ((p.z - disc.z) / d) * disc.r };
  return dist(p, inBox) <= dist(p, inDisc) ? inBox : inDisc;
}

export interface Press extends XZ {
  /** How far the target overshot the object's near face; 0 when not touching. */
  press: number;
  /** Signed offset across the face, along (n.z, -n.x) where n points from the object to `from`. */
  lateral: number;
  /** Unit direction from `from` toward the object: the way a press pushes it. */
  away: XZ;
}

/**
 * A paw reaching from `from` at a round object: a target inside the object or
 * behind it lands on the face nearest `from` instead, so the paw pushes the
 * near side rather than passing through.
 */
export function pressAgainst(target: XZ, from: XZ, centre: XZ, radius: number): Press {
  const toFrom = dist(from, centre) || 1;
  const n = { x: (from.x - centre.x) / toFrom, z: (from.z - centre.z) / toFrom };
  const away = { x: -n.x, z: -n.z };
  const u = (target.x - centre.x) * n.x + (target.z - centre.z) * n.z;
  const w = (target.x - centre.x) * n.z - (target.z - centre.z) * n.x;
  if (Math.abs(w) >= radius) return { x: target.x, z: target.z, press: 0, lateral: w, away };
  const face = Math.sqrt(radius * radius - w * w);
  if (u >= face) return { x: target.x, z: target.z, press: 0, lateral: w, away };
  return { x: centre.x + n.x * face + n.z * w, z: centre.z + n.z * face - n.x * w, press: face - u, lateral: w, away };
}

/**
 * A 2-D tilt on an underdamped spring: each component is an angle in radians
 * toward that world axis. It never exceeds `maxTilt`; at the limit the
 * outward speed is dropped, so a hard knock teeters there and comes back.
 */
export class Wobble {
  tilt: XZ = { x: 0, z: 0 };
  velocity: XZ = { x: 0, z: 0 };

  constructor(
    readonly stiffness: number,
    readonly damping: number,
    readonly maxTilt: number,
  ) {}

  kick(direction: XZ, speed: number): void {
    this.velocity.x += direction.x * speed;
    this.velocity.z += direction.z * speed;
  }

  step(dt: number, rest: XZ = { x: 0, z: 0 }): void {
    for (const k of ["x", "z"] as const) {
      this.velocity[k] += (-this.stiffness * (this.tilt[k] - rest[k]) - this.damping * this.velocity[k]) * dt;
      this.tilt[k] += this.velocity[k] * dt;
    }
    const m = Math.hypot(this.tilt.x, this.tilt.z);
    if (m > this.maxTilt) {
      const d = { x: this.tilt.x / m, z: this.tilt.z / m };
      this.tilt = { x: d.x * this.maxTilt, z: d.z * this.maxTilt };
      const outward = this.velocity.x * d.x + this.velocity.z * d.z;
      if (outward > 0) {
        this.velocity.x -= outward * d.x;
        this.velocity.z -= outward * d.z;
      }
    }
  }

  get magnitude(): number {
    return Math.hypot(this.tilt.x, this.tilt.z);
  }
}
