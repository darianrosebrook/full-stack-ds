import type { DocsGraphPayload } from "../types";

/**
 * Projection of the derived docs graph payload into the canvas render model.
 * Ported from Sterling's docsGraphAdapter contract (link-count node sizing,
 * authority-colored categories, deterministic one-shot seeding before the
 * live force layout) with the game-history engine concerns dropped: our
 * corpus is tens of docs, not thousands of history states, so a 2D canvas
 * consumer replaces the WebGPU core without changing the interaction model.
 *
 * Determinism: nodes are seeded on a golden-angle spiral keyed by a fixed
 * PRNG seed over the route-sorted payload, so identical payloads produce
 * identical models — no timestamps, no Math.random.
 */

export interface GraphRenderNode {
  id: string;
  route: string;
  title: string;
  relPath: string;
  section: string;
  authority: string | null;
  status: string | null;
  updated: string | null;
  degree: number;
  radius: number;
  category: string;
  x: number;
  y: number;
  fx: number | null;
  fy: number | null;
  vx: number;
  vy: number;
}

export interface GraphRenderLink {
  source: string;
  target: string;
}

export interface GraphCategory {
  key: string;
  index: number;
  count: number;
}

export interface GraphRenderModel {
  nodes: GraphRenderNode[];
  links: GraphRenderLink[];
  categories: GraphCategory[];
  maxDegree: number;
  /** Adjacency (both directions) for hover highlighting. */
  neighbors: Map<string, Set<string>>;
}

const MIN_RADIUS = 5;
const MAX_RADIUS = 16;
const SPIRAL_SPREAD = 24;
const GOLDEN_ANGLE = 2.399963229728653;

/** mulberry32 — small, deterministic, seedable PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const NO_AUTHORITY_CATEGORY = "none";

export function projectDocsGraph(
  payload: DocsGraphPayload,
  seed = 20260913
): GraphRenderModel {
  const maxDegree = payload.nodes.reduce((max, node) => Math.max(max, node.degree), 0);
  const categoryKeys = [
    ...new Set(
      payload.nodes.map((node) => node.authority ?? NO_AUTHORITY_CATEGORY)
    ),
  ].sort();
  const categoryIndex = new Map(categoryKeys.map((key, index) => [key, index]));
  const counts = new Map<string, number>(categoryKeys.map((key) => [key, 0]));

  const random = mulberry32(seed);
  const sorted = payload.nodes.slice().sort((a, b) => a.route.localeCompare(b.route));
  const nodes: GraphRenderNode[] = sorted.map((node, i) => {
    const category = node.authority ?? NO_AUTHORITY_CATEGORY;
    counts.set(category, (counts.get(category) ?? 0) + 1);
    // sqrt scale: dominant hubs grow without drowning out leaf docs.
    const ratio =
      maxDegree === 0 ? 0 : Math.sqrt(node.degree) / Math.sqrt(maxDegree);
    const angle = i * GOLDEN_ANGLE + random() * 0.5;
    const distance = SPIRAL_SPREAD * Math.sqrt(i + 0.5);
    return {
      ...node,
      radius: MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * ratio,
      category,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      fx: null,
      fy: null,
      vx: 0,
      vy: 0,
    };
  });

  const neighbors = new Map<string, Set<string>>();
  for (const node of nodes) neighbors.set(node.id, new Set());
  for (const edge of payload.edges) {
    neighbors.get(edge.source)?.add(edge.target);
    neighbors.get(edge.target)?.add(edge.source);
  }

  return {
    nodes,
    links: payload.edges.map((edge) => ({ ...edge })),
    categories: categoryKeys.map((key) => ({
      key,
      index: categoryIndex.get(key) ?? 0,
      count: counts.get(key) ?? 0,
    })),
    maxDegree,
    neighbors,
  };
}

/**
 * Palette for authority categories: token-referencing CSS custom properties
 * resolved at mount via getComputedStyle, so the canvas consumes the same
 * themable tokens as the rest of the app (canvas paint needs concrete
 * strings; the vars live in docs.css). The categorical datavis ramp is the
 * token system's dedicated "distinguish these groups" palette.
 */
export const GRAPH_PALETTE_VARS = [
  "--docs-graph-c-0",
  "--docs-graph-c-1",
  "--docs-graph-c-2",
  "--docs-graph-c-3",
  "--docs-graph-c-4",
  "--docs-graph-c-5",
  "--docs-graph-c-6",
  "--docs-graph-c-7",
] as const;

const FALLBACK_PALETTE = [
  "#2563eb",
  "#0e7490",
  "#15803d",
  "#a16207",
  "#b45309",
  "#9333ea",
  "#be185d",
  "#475569",
];

export function resolvePalette(): string[] {
  if (typeof window === "undefined") return [...FALLBACK_PALETTE];
  const styles = window.getComputedStyle(window.document.documentElement);
  return GRAPH_PALETTE_VARS.map((cssVar, index) => {
    const value = styles.getPropertyValue(cssVar).trim();
    return value.length > 0 ? value : FALLBACK_PALETTE[index];
  });
}

export function categoryColor(category: GraphCategory, palette: string[]): string {
  return palette[category.index % palette.length];
}
