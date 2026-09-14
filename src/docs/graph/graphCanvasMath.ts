import type { GraphRenderNode } from "./docsGraphAdapter";

/**
 * Pure pan/zoom/hit-test math for the docs graph canvas. Extracted from the
 * component so every transform is unit-testable in jsdom, where canvas 2D
 * contexts do not exist.
 */

export interface Transform {
  x: number;
  y: number;
  k: number;
}

export const IDENTITY_TRANSFORM: Transform = { x: 0, y: 0, k: 1 };

export const MIN_SCALE = 0.2;
export const MAX_SCALE = 4;

export function clampScale(k: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, k));
}

/** Screen (canvas) coordinates -> world coordinates. */
export function screenToWorld(
  screenX: number,
  screenY: number,
  transform: Transform
): { x: number; y: number } {
  return {
    x: (screenX - transform.x) / transform.k,
    y: (screenY - transform.y) / transform.k,
  };
}

/** Zoom keeping the world point under (cx, cy) fixed on screen. */
export function zoomAt(
  transform: Transform,
  cx: number,
  cy: number,
  factor: number
): Transform {
  const k = clampScale(transform.k * factor);
  const world = screenToWorld(cx, cy, transform);
  return { k, x: cx - world.x * k, y: cy - world.y * k };
}

export const HIT_SLOP = 4;

/** Nearest node within its radius (+ slop) of a world point, or null. */
export function pickNode(
  nodes: GraphRenderNode[],
  worldX: number,
  worldY: number
): GraphRenderNode | null {
  let best: GraphRenderNode | null = null;
  let bestDistanceSquared = Number.POSITIVE_INFINITY;
  for (const node of nodes) {
    const dx = node.x - worldX;
    const dy = node.y - worldY;
    const distanceSquared = dx * dx + dy * dy;
    const reach = node.radius + HIT_SLOP;
    if (distanceSquared <= reach * reach && distanceSquared < bestDistanceSquared) {
      best = node;
      bestDistanceSquared = distanceSquared;
    }
  }
  return best;
}

/** Wheel delta -> exponential zoom factor (trackpad-pinch friendly). */
export function wheelFactor(deltaY: number): number {
  return Math.exp(-deltaY * 0.0015);
}

/**
 * Fit transform: center the graph's bounding box in a viewport of the given
 * size with padding. Returns identity when there is nothing to fit.
 */
export function fitTransform(
  nodes: GraphRenderNode[],
  width: number,
  height: number,
  padding = 40
): Transform {
  if (nodes.length === 0 || width <= 0 || height <= 0) return { ...IDENTITY_TRANSFORM };
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const node of nodes) {
    minX = Math.min(minX, node.x - node.radius);
    minY = Math.min(minY, node.y - node.radius);
    maxX = Math.max(maxX, node.x + node.radius);
    maxY = Math.max(maxY, node.y + node.radius);
  }
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const k = clampScale(
    Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY)
  );
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return { k, x: width / 2 - centerX * k, y: height / 2 - centerY * k };
}
