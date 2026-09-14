import { describe, expect, it } from "vitest";

import type { DocsGraphPayload } from "../types";
import {
  NO_AUTHORITY_CATEGORY,
  categoryColor,
  projectDocsGraph,
  resolvePalette,
} from "./docsGraphAdapter";

const PAYLOAD: DocsGraphPayload = {
  totals: { nodes: 3, edges: 2, droppedLinks: 0 },
  nodes: [
    {
      id: "aaaaaaaaaaaaaaaa",
      relPath: "docs/zeta.md",
      route: "/docs/zeta",
      title: "Zeta",
      section: "docs",
      authority: "architecture",
      status: "active",
      updated: "2026-09-01",
      degree: 2,
    },
    {
      id: "bbbbbbbbbbbbbbbb",
      relPath: "docs/alpha.md",
      route: "/docs/alpha",
      title: "Alpha",
      section: "docs",
      authority: "spec",
      status: null,
      updated: null,
      degree: 1,
    },
    {
      id: "cccccccccccccccc",
      relPath: "README.md",
      route: "/docs/readme",
      title: "Readme",
      section: "root",
      authority: null,
      status: null,
      updated: null,
      degree: 1,
    },
  ],
  edges: [
    { source: "aaaaaaaaaaaaaaaa", target: "bbbbbbbbbbbbbbbb" },
    { source: "bbbbbbbbbbbbbbbb", target: "cccccccccccccccc" },
  ],
};

describe("projectDocsGraph", () => {
  it("sizes nodes by sqrt-degree against the max and assigns categories", () => {
    const model = projectDocsGraph(PAYLOAD);
    const zeta = model.nodes.find((node) => node.id === "aaaaaaaaaaaaaaaa");
    const alpha = model.nodes.find((node) => node.id === "bbbbbbbbbbbbbbbb");
    expect(zeta?.radius).toBeGreaterThan(alpha?.radius ?? 0);
    expect(zeta?.category).toBe("architecture");
    expect(zeta?.radius).toBe(16); // max degree hits MAX_RADIUS exactly
    const readme = model.nodes.find((node) => node.id === "cccccccccccccccc");
    expect(readme?.category).toBe(NO_AUTHORITY_CATEGORY);
  });

  it("sorts categories alphabetically and counts membership", () => {
    const model = projectDocsGraph(PAYLOAD);
    expect(model.categories).toEqual([
      { key: "architecture", index: 0, count: 1 },
      { key: NO_AUTHORITY_CATEGORY, index: 1, count: 1 },
      { key: "spec", index: 2, count: 1 },
    ]);
  });

  it("builds two-directional adjacency for hover highlighting", () => {
    const model = projectDocsGraph(PAYLOAD);
    expect([...(model.neighbors.get("aaaaaaaaaaaaaaaa") ?? [])]).toEqual(["bbbbbbbbbbbbbbbb"]);
    expect([...(model.neighbors.get("cccccccccccccccc") ?? [])]).toEqual(["bbbbbbbbbbbbbbbb"]);
    expect([...(model.neighbors.get("bbbbbbbbbbbbbbbb") ?? [])].sort()).toEqual([
      "aaaaaaaaaaaaaaaa",
      "cccccccccccccccc",
    ]);
  });

  it("is deterministic for identical payload and seed", () => {
    const first = projectDocsGraph(PAYLOAD);
    const second = projectDocsGraph(PAYLOAD);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    // Seed positions actually spread: distinct coordinates for distinct nodes.
    const positions = new Set(first.nodes.map((node) => `${node.x.toFixed(3)},${node.y.toFixed(3)}`));
    expect(positions.size).toBe(first.nodes.length);
  });

  it("clones payload nodes and links so the simulation cannot mutate input", () => {
    const input = JSON.parse(JSON.stringify(PAYLOAD)) as DocsGraphPayload;
    projectDocsGraph(input);
    // links are copies: the array identity differs after projection.
    const model = projectDocsGraph(input);
    model.links[0].source = "mutated";
    expect(input.edges[0].source).toBe("aaaaaaaaaaaaaaaa");
  });
});

describe("palette", () => {
  it("wraps category indices modulo palette length", () => {
    const palette = ["#111111", "#222222"];
    expect(categoryColor({ key: "k", index: 0, count: 1 }, palette)).toBe("#111111");
    expect(categoryColor({ key: "k", index: 2, count: 1 }, palette)).toBe("#111111");
    expect(categoryColor({ key: "k", index: 3, count: 1 }, palette)).toBe("#222222");
  });

  it("resolves token vars at mount and falls back per-slot when unset", () => {
    const palette = resolvePalette();
    expect(palette).toHaveLength(8);
    for (const color of palette) {
      expect(color.length).toBeGreaterThan(0);
    }
  });
});
