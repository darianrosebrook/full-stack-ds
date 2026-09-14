import { describe, expect, it } from "vitest";

import { gitDocsSource, projectDocs } from "./projection";

/**
 * The anti-staleness ratchet, run against the REAL corpus. Unit fixtures pin
 * extraction semantics; this suite pins that the projection, the git scope,
 * and the tracked tree agree — the property that makes "the site is what is
 * committed" true. If scope handling or the walk drifts, these go red.
 */
describe("projectDocs over the real tracked corpus", () => {
  const result = projectDocs(gitDocsSource(process.cwd()));

  it("indexes the corpus with unique routes and stable identity", () => {
    expect(result.index.length).toBeGreaterThan(30);
    const routes = result.index.map((entry) => entry.route);
    expect(new Set(routes).size).toBe(routes.length);
    const readme = result.index.find((entry) => entry.relPath === "README.md");
    expect(readme?.route).toBe("/docs/readme");
  });

  it("includes the claim ledger with its governed frontmatter parsed", () => {
    const snapshot = result.index.find(
      (entry) => entry.relPath === "docs/current-implementation-snapshot.md"
    );
    expect(snapshot).toBeDefined();
    const node = result.graph.nodes.find((n) => n.id === snapshot!.id);
    expect(node?.authority).toBe("canonical");
    expect(node?.title).toBe("Current Implementation Snapshot");
  });

  it("keeps the machine-local internal tree out of every payload", () => {
    expect(result.index.some((entry) => entry.relPath.startsWith("docs/internal/"))).toBe(false);
    expect(result.pages.size).toBe(result.index.length);
  });

  it("resolves every graph edge endpoint to an indexed node and matches degrees", () => {
    const ids = new Set(result.graph.nodes.map((node) => node.id));
    for (const edge of result.graph.edges) {
      expect(ids.has(edge.source)).toBe(true);
      expect(ids.has(edge.target)).toBe(true);
    }
    expect(result.graph.totals.nodes).toBe(result.graph.nodes.length);
    expect(result.graph.totals.edges).toBe(result.graph.edges.length);
    const degree = new Map<string, number>();
    for (const edge of result.graph.edges) {
      degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
      degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
    }
    for (const node of result.graph.nodes) {
      expect(node.degree).toBe(degree.get(node.id) ?? 0);
    }
  });

  it("derives a non-empty link graph from the corpus", () => {
    expect(result.graph.edges.length).toBeGreaterThan(30);
  });
});
