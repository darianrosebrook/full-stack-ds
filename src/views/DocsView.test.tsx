import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DocsGraphPayload, DocsIndexEntry, DocsPage } from "../docs/types";
import { DocsView } from "./DocsView";

// The canvas renderer owns its own fallback and math tests; the view suite
// pins data flow, so the canvas is stubbed at this boundary.
vi.mock("../docs/graph/ForceGraphCanvas", () => ({
  ForceGraphCanvas: ({ onOpen }: { onOpen: (route: string) => void }) => (
    <div>
      <button type="button" onClick={() => onOpen("/docs/readme")}>
        stub-open-readme
      </button>
    </div>
  ),
}));

const INDEX: DocsIndexEntry[] = [
  {
    id: "aaaaaaaaaaaaaaaa",
    relPath: "README.md",
    route: "/docs/readme",
    title: "Root Readme",
    section: "root",
    excerpt: "The readme.",
    dataPath: "/docs-data/pages/aaaaaaaaaaaaaaaa.json",
  },
  {
    id: "bbbbbbbbbbbbbbbb",
    relPath: "docs/architecture/overview.md",
    route: "/docs/architecture/overview",
    title: "Architecture Overview",
    section: "architecture",
    excerpt: "The overview.",
    dataPath: "/docs-data/pages/bbbbbbbbbbbbbbbb.json",
  },
];

const PAGE: DocsPage = {
  ...INDEX[1],
  frontmatter: {
    title: "Architecture Overview",
    authority: "architecture",
    status: "active",
    updated: "2026-09-01",
  },
  headings: [{ depth: 2, text: "Intro", id: "intro" }],
  content:
    "# Architecture Overview\n\n## Intro\n\nSee [the readme](../../README.md) and the <!-- component-count -->52 corpus.\n",
};

const GRAPH: DocsGraphPayload = {
  totals: { nodes: 2, edges: 1, droppedLinks: 3 },
  nodes: [
    {
      id: "aaaaaaaaaaaaaaaa",
      relPath: "README.md",
      route: "/docs/readme",
      title: "Root Readme",
      section: "root",
      authority: null,
      status: null,
      updated: null,
      degree: 1,
    },
    {
      id: "bbbbbbbbbbbbbbbb",
      relPath: "docs/architecture/overview.md",
      route: "/docs/architecture/overview",
      title: "Architecture Overview",
      section: "architecture",
      authority: "architecture",
      status: "active",
      updated: "2026-09-01",
      degree: 1,
    },
  ],
  edges: [{ source: "bbbbbbbbbbbbbbbb", target: "aaaaaaaaaaaaaaaa" }],
};

function stubFetch(urls: Record<string, unknown>, failing = false) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    if (failing) throw new Error("network down");
    const url = String(input);
    const payload = urls[url];
    if (payload === undefined) {
      return { ok: false, status: 404, statusText: "Not Found", json: async () => ({}) };
    }
    return { ok: true, status: 200, statusText: "OK", json: async () => payload };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DocsView reader", () => {
  it("renders the page with pills, rewritten links, and hidden claims markers", async () => {
    stubFetch({
      "/docs-data/index.json": INDEX,
      "/docs-data/pages/bbbbbbbbbbbbbbbb.json": PAGE,
    });
    render(<DocsView path="architecture/overview" />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Architecture Overview" })).toBeInTheDocument();
    });
    expect(screen.getByText("authority: architecture")).toBeInTheDocument();
    expect(screen.getByText("status: active")).toBeInTheDocument();
    // Relative markdown link routed INSIDE the hash router; marker invisible.
    const link = screen.getByRole("link", { name: "the readme" });
    expect(link).toHaveAttribute("href", "#/docs/readme");
    expect(screen.getByText(/52 corpus/)).toBeInTheDocument();
    expect(screen.queryByText(/component-count/)).not.toBeInTheDocument();
    // Sidebar groups by derived section, pager walks the sorted index
    // (overview is the second of two entries, so it pages back to the readme).
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("Previous: Root Readme")).toBeInTheDocument();
  });

  it("renders exactly one h1 when the frontmatter title differs from the body h1", async () => {
    // Model what the projection emits for such a doc: page.title carries the
    // frontmatter title while the body opens with a different heading.
    const mismatched: DocsPage = {
      ...PAGE,
      title: "Different Frontmatter Title",
      frontmatter: { ...PAGE.frontmatter, title: "Different Frontmatter Title" },
      content: "# Body Heading\n\nProse that must survive.\n",
    };
    stubFetch({
      "/docs-data/index.json": INDEX,
      "/docs-data/pages/bbbbbbbbbbbbbbbb.json": mismatched,
    });
    render(<DocsView path="architecture/overview" />);
    await waitFor(() => {
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Different Frontmatter Title"
    );
    expect(screen.queryByText("Body Heading")).not.toBeInTheDocument();
    expect(screen.getByText("Prose that must survive.")).toBeInTheDocument();
  });

  it("restores the prior document title on unmount", async () => {
    document.title = "Showcase";
    stubFetch({
      "/docs-data/index.json": INDEX,
      "/docs-data/pages/bbbbbbbbbbbbbbbb.json": PAGE,
    });
    const view = render(<DocsView path="architecture/overview" />);
    await waitFor(() => {
      expect(document.title).toBe("Architecture Overview | full-stack-ds Docs");
    });
    view.unmount();
    expect(document.title).toBe("Showcase");
  });

  it("scrolls to the slugified heading when a fragment is present", async () => {
    const original = Element.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    stubFetch({
      "/docs-data/index.json": INDEX,
      "/docs-data/pages/bbbbbbbbbbbbbbbb.json": PAGE,
    });
    try {
      render(<DocsView path="architecture/overview" fragment="intro" />);
      await waitFor(() => {
        expect(document.getElementById("intro")).not.toBeNull();
      });
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it("reports an unregistered route as not-found rather than crashing", async () => {
    stubFetch({ "/docs-data/index.json": INDEX });
    render(<DocsView path="nope/missing" />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Document not found" })).toBeInTheDocument();
    });
  });

  it("surfaces fetch failures as an error state", async () => {
    stubFetch({}, true);
    render(<DocsView path="readme" />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Docs data unavailable" })).toBeInTheDocument();
    });
    expect(screen.getByText("network down")).toBeInTheDocument();
  });
});

describe("DocsView landing", () => {
  it("renders totals, category legend, and the graph host", async () => {
    stubFetch({
      "/docs-data/index.json": INDEX,
      "/docs-data/docs-graph.json": GRAPH,
    });
    render(<DocsView path="" />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Documentation graph" })).toBeInTheDocument();
    });
    expect(screen.getByText("2 docs · 1 links · 3 out-of-scope links dropped")).toBeInTheDocument();
    // Legend carries both authorities with counts.
    expect(screen.getByText("architecture")).toBeInTheDocument();
    expect(screen.getByText("none")).toBeInTheDocument();
    expect(screen.getByText("stub-open-readme")).toBeInTheDocument();
  });
});
