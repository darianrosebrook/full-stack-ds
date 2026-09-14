import { describe, expect, it } from "vitest";

import type { GraphRenderNode } from "./docsGraphAdapter";
import {
  IDENTITY_TRANSFORM,
  MAX_SCALE,
  MIN_SCALE,
  clampScale,
  fitTransform,
  pickNode,
  screenToWorld,
  wheelFactor,
  zoomAt,
  type Transform,
} from "./graphCanvasMath";

function nodeAt(id: string, x: number, y: number, radius = 6): GraphRenderNode {
  return {
    id,
    route: `/docs/${id}`,
    title: id,
    relPath: `docs/${id}.md`,
    section: "docs",
    authority: null,
    status: null,
    updated: null,
    degree: 0,
    radius,
    category: "none",
    x,
    y,
    fx: null,
    fy: null,
    vx: 0,
    vy: 0,
  };
}

describe("transforms", () => {
  it("inverts screen coordinates through the transform", () => {
    const transform: Transform = { x: 100, y: 50, k: 2 };
    const world = screenToWorld(140, 90, transform);
    expect(world).toEqual({ x: 20, y: 20 });
    // Round-trip: world -> screen
    expect(world.x * transform.k + transform.x).toBe(140);
  });

  it("zooms about a fixed screen point", () => {
    const transform: Transform = { x: 100, y: 50, k: 1 };
    const next = zoomAt(transform, 200, 150, 2);
    expect(next.k).toBe(2);
    // The world point under (200,150) stays under (200,150).
    const before = screenToWorld(200, 150, transform);
    const after = screenToWorld(200, 150, next);
    expect(after).toEqual(before);
  });

  it("clamps scale to the configured range from both sides", () => {
    expect(clampScale(0.01)).toBe(MIN_SCALE);
    expect(clampScale(99)).toBe(MAX_SCALE);
    expect(clampScale(1)).toBe(1);
  });

  it("maps wheel deltas to exponential factors with the expected sign", () => {
    expect(wheelFactor(-100)).toBeGreaterThan(1); // scroll up zooms in
    expect(wheelFactor(100)).toBeLessThan(1); // scroll down zooms out
    expect(wheelFactor(0)).toBe(1);
  });
});

describe("pickNode", () => {
  it("picks nodes within radius plus slop and misses between them", () => {
    const nodes = [nodeAt("a", 0, 0, 5), nodeAt("b", 30, 0, 5)];
    expect(pickNode(nodes, 2, 0)?.id).toBe("a");
    expect(pickNode(nodes, 28, 0)?.id).toBe("b");
    expect(pickNode(nodes, 15, 0)).toBe(null);
    expect(pickNode(nodes, 100, 100)).toBe(null);
  });

  it("admits the hit slop just outside a node's radius", () => {
    const nodes = [nodeAt("a", 0, 0, 5)];
    expect(pickNode(nodes, 8.5, 0)?.id).toBe("a"); // radius 5 + slop 4
    expect(pickNode(nodes, 9.5, 0)).toBe(null);
  });

  it("prefers the closer node when reaches overlap", () => {
    const nodes = [nodeAt("a", 0, 0, 5), nodeAt("b", 10, 0, 8)];
    // Both nodes' reaches cover x=5.5; b is nearer, so b wins.
    expect(pickNode(nodes, 5.5, 0)?.id).toBe("b");
    expect(pickNode(nodes, 1, 0)?.id).toBe("a");
  });
});

describe("fitTransform", () => {
  it("centers and scales a spread of nodes into the viewport with padding", () => {
    const nodes = [nodeAt("a", -100, -50), nodeAt("b", 100, 50)];
    const t = fitTransform(nodes, 400, 300, 40);
    expect(t.k).toBeGreaterThan(0);
    // The graph center lands at the viewport center.
    expect(screenToWorld(200, 150, t)).toEqual({ x: 0, y: 0 });
  });

  it("returns identity for empty input or degenerate viewports", () => {
    expect(fitTransform([], 400, 300)).toEqual(IDENTITY_TRANSFORM);
    expect(fitTransform([nodeAt("a", 0, 0)], 0, 0)).toEqual(IDENTITY_TRANSFORM);
  });
});
