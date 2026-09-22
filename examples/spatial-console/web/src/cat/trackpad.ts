import type { Mat4 } from "../projection";

/**
 * Inverse of `transformPoint` for points on the element plane (z = 0): maps a
 * canvas point back to element px. On that plane the 4x4 reduces to a 3x3
 * homography over (x, y, 1); its inverse is the adjugate over the determinant.
 * Returns null when the plane is edge-on (singular).
 */
export function untransformPoint(m: Mat4, x: number, y: number): { x: number; y: number } | null {
  const a = m[0], b = m[4], c = m[12];
  const d = m[1], e = m[5], f = m[13];
  const g = m[3], h = m[7], i = m[15];
  const A = e * i - f * h, B = c * h - b * i, C = b * f - c * e;
  const D = f * g - d * i, E = a * i - c * g, F = c * d - a * f;
  const G = d * h - e * g, H = b * g - a * h, I = a * e - b * d;
  const det = a * A + b * D + c * G;
  if (Math.abs(det) < 1e-12) return null;
  const X = A * x + B * y + C;
  const Y = D * x + E * y + F;
  const W = G * x + H * y + I;
  if (Math.abs(W) < 1e-12) return null;
  return { x: X / W, y: Y / W };
}

/**
 * Trackpad position for a pointer, as the pointer's place in the laptop's
 * viewport: element px over the viewport size, clamped to the pad's edges.
 */
export function viewportToTrackpadUV(
  point: { x: number; y: number },
  viewport: { width: number; height: number },
): { u: number; v: number } {
  const clamp = (n: number) => Math.min(1, Math.max(0, n));
  return { u: clamp(point.x / viewport.width), v: clamp(point.y / viewport.height) };
}
