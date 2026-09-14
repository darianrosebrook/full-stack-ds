/**
 * Wire contracts for the docs site payloads. One projection
 * (src/docs/projection.ts) produces these for both the dev middleware and the
 * build-time asset emission; the client reader and graph consume them as-is.
 * Field naming follows the Sterling workbench docs port where the semantics
 * match, so the ported view layer needed no renaming layer.
 */

export interface DocsHeading {
  depth: 1 | 2 | 3 | 4;
  text: string;
  id: string;
}

/** Frontmatter values the corpus actually uses: scalars and string lists. */
export type DocsFrontmatterValue = string | string[];

export type DocsFrontmatter = Record<string, DocsFrontmatterValue>;

export interface DocsIndexEntry {
  /** Stable 16-hex identity of the repo-relative path (sha1 prefix). */
  id: string;
  relPath: string;
  route: string;
  title: string;
  section: string;
  excerpt: string;
  dataPath: string;
}

export interface DocsPage extends DocsIndexEntry {
  frontmatter: DocsFrontmatter;
  headings: DocsHeading[];
  /** Body with frontmatter stripped; markdown carried verbatim. */
  content: string;
}

export interface DocsGraphNode {
  id: string;
  relPath: string;
  route: string;
  title: string;
  section: string;
  authority: string | null;
  status: string | null;
  updated: string | null;
  /** Incident deduped-edge count (in + out). Drives node radius. */
  degree: number;
}

export interface DocsGraphEdge {
  source: string;
  target: string;
}

export interface DocsGraphTotals {
  nodes: number;
  edges: number;
  /** Relative .md links whose target is tracked but outside the site corpus. */
  droppedLinks: number;
}

export interface DocsGraphPayload {
  totals: DocsGraphTotals;
  nodes: DocsGraphNode[];
  edges: DocsGraphEdge[];
}

export interface DocsProjection {
  index: DocsIndexEntry[];
  pages: Map<string, DocsPage>;
  graph: DocsGraphPayload;
}
