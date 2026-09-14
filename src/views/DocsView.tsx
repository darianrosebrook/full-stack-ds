import { TextField } from "@full-stack-ds/react";
import { useEffect, useMemo, useState } from "react";

import { renderMarkdownToHtml } from "../docs/markdown";
import { normalizeDocsPath, slugify } from "../docs/routing";
import type { DocsGraphPayload, DocsIndexEntry, DocsPage } from "../docs/types";
import {
  projectDocsGraph,
  resolvePalette,
  type GraphRenderModel,
} from "../docs/graph/docsGraphAdapter";
import { ForceGraphCanvas } from "../docs/graph/ForceGraphCanvas";
import { GraphLegend } from "../docs/graph/GraphLegend";
import "../docs/docs.css";

/**
 * The docs site view: derived-corpus reader plus dependency-graph landing,
 * ported from Sterling's DocsSite contract (search-filtered section sidebar,
 * frontmatter pills, prev/next pager, landing graph) onto this repo's hash
 * router. All data arrives from the docs-data projection payloads; the view
 * owns no corpus knowledge of its own.
 */

interface DocsViewProps {
  /** Docs path segment: "" is the graph landing, otherwise the doc route tail. */
  path: string;
  /** Slugified heading id from a `#fragment` route tail; null when absent. */
  fragment?: string | null;
}

interface DocsState {
  index: DocsIndexEntry[];
  graph: DocsGraphPayload | null;
  page: DocsPage | null;
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: DocsState = {
  index: [],
  graph: null,
  page: null,
  loading: true,
  error: null,
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

function sectionLabel(section: string): string {
  if (section === "root") return "Start";
  return section
    .split(/[-_/]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function entryMatches(entry: DocsIndexEntry, query: string): boolean {
  const haystack = `${entry.title} ${entry.relPath} ${entry.excerpt}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

export function DocsView({ path, fragment = null }: DocsViewProps) {
  const [state, setState] = useState<DocsState>(INITIAL_STATE);
  const [query, setQuery] = useState("");
  const isLanding = path === "";
  const route = normalizeDocsPath(`/docs/${path}`);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const index = await fetchJson<DocsIndexEntry[]>("/docs-data/index.json");
        if (isLanding) {
          const graph = await fetchJson<DocsGraphPayload>("/docs-data/docs-graph.json");
          if (!cancelled) {
            setState({ index, graph, page: null, loading: false, error: null });
          }
          return;
        }
        const entry = index.find((item) => normalizeDocsPath(item.route) === route);
        if (entry === undefined) {
          if (!cancelled) {
            setState({ index, graph: null, page: null, loading: false, error: null });
          }
          return;
        }
        const page = await fetchJson<DocsPage>(entry.dataPath);
        if (!cancelled) {
          setState({ index, graph: null, page, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            index: [],
            graph: null,
            page: null,
            loading: false,
            error: error instanceof Error ? error.message : "Unable to load docs",
          });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [route, isLanding]);

  // Own the tab title while mounted; restore whatever came before on
  // unmount so leaving docs does not strand a stale "… | Docs" title.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = state.page
      ? `${state.page.title} | full-stack-ds Docs`
      : "full-stack-ds Documentation";
    return () => {
      document.title = previousTitle;
    };
  }, [state.page]);

  // A #fragment route tail names a slugified heading: scroll to it once the
  // page content is in the DOM. Unknown slugs are a no-op (authors link
  // GitHub-style; the renderer owns the slug rule).
  useEffect(() => {
    if (state.page === null || fragment === null || fragment === "") return;
    const target = document.getElementById(fragment);
    if (target !== null && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.page, fragment]);

  const visibleIndex = useMemo(() => {
    if (!query.trim()) return state.index;
    return state.index.filter((entry) => entryMatches(entry, query.trim()));
  }, [query, state.index]);

  const groupedIndex = useMemo(() => {
    const groups = new Map<string, DocsIndexEntry[]>();
    for (const entry of visibleIndex) {
      const group = groups.get(entry.section) ?? [];
      group.push(entry);
      groups.set(entry.section, group);
    }
    return [...groups.entries()];
  }, [visibleIndex]);

  const currentIndex = state.page
    ? state.index.findIndex((entry) => entry.id === state.page?.id)
    : -1;
  const previous = currentIndex > 0 ? state.index[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < state.index.length - 1
      ? state.index[currentIndex + 1]
      : null;

  const contentHtml = useMemo(() => {
    if (state.page === null) return "";
    // The headline carries the title in every case (frontmatter, first h1,
    // or stem fallback), so the body's own leading h1 is always redundant —
    // strip it unconditionally rather than exact-matching it against the
    // title, which silently double-h1'd the 8 docs whose frontmatter title
    // differs from their body heading. Only a true leading heading line is
    // stripped: `# ` with whitespace, so "#tofu" prose survives.
    const body = state.page.content.replace(/^#[ \t]+[^\n]*\n?/, "");
    return renderMarkdownToHtml(body, { currentRelPath: state.page.relPath });
  }, [state.page]);

  const palette = useMemo(() => resolvePalette(), []);
  const graphModel: GraphRenderModel | null = useMemo(
    () => (state.graph !== null ? projectDocsGraph(state.graph) : null),
    [state.graph]
  );

  return (
    <div className="docs-root">
      <aside className="docs-sidebar" aria-label="Documentation navigation">
        <a className="docs-sidebar__item docs-sidebar__item--active" href="#/docs">
          ⟨ dependency graph
        </a>
        <TextField
          value={query}
          onChange={(next: string) => setQuery(next)}
          slots={{ label: <>Search docs</> }}
          className="docs-sidebar__search"
        />
        {groupedIndex.map(([section, entries]) => (
          <nav key={section} aria-label={sectionLabel(section)}>
            <p className="docs-sidebar__group-label">{sectionLabel(section)}</p>
            {entries.map((entry) => (
              <a
                key={entry.id}
                className={`docs-sidebar__item${
                  state.page?.id === entry.id ? " docs-sidebar__item--active" : ""
                }`}
                href={`#${entry.route}`}
              >
                {entry.title}
              </a>
            ))}
          </nav>
        ))}
      </aside>

      <main className="docs-main">
        {state.loading ? <p className="docs-state">Loading docs…</p> : null}
        {state.error !== null ? (
          <div className="docs-state">
            <h1>Docs data unavailable</h1>
            <p>{state.error}</p>
          </div>
        ) : null}

        {isLanding && graphModel !== null ? (
          <div className="docs-landing">
            <header className="docs-landing__header">
              <h1>Documentation graph</h1>
              <span className="docs-landing__totals">
                {state.graph?.totals.nodes ?? 0} docs ·{" "}
                {state.graph?.totals.edges ?? 0} links ·{" "}
                {state.graph?.totals.droppedLinks ?? 0} out-of-scope links dropped
              </span>
            </header>
            <GraphLegend categories={graphModel.categories} palette={palette} />
            <ForceGraphCanvas
              model={graphModel}
              palette={palette}
              onOpen={(docRoute) => {
                window.location.hash = docRoute;
              }}
            />
          </div>
        ) : null}

        {!state.loading && state.error === null && !isLanding && state.page === null ? (
          <div className="docs-state">
            <h1>Document not found</h1>
            <p>No tracked markdown document is registered for this route.</p>
          </div>
        ) : null}

        {state.page !== null ? (
          <article className="docs-article">
            <nav className="docs-breadcrumbs" aria-label="Breadcrumb">
              <a href="#/docs">docs</a>
              {state.page.relPath
                .replace(/\/?README\.md$/, "")
                .replace(/\.md$/, "")
                .split("/")
                .filter(Boolean)
                .map((part) => ` / ${part}`)}
            </nav>

            <header className="docs-headline">
              {/* The slugified title id keeps `doc.md#doc-title` fragment
                  links resolving after the body's own leading h1 is stripped
                  for the single-h1 rule — the headline IS that anchor now. */}
              <h1 id={slugify(state.page.title)}>{state.page.title}</h1>
              <div className="docs-meta">
                <span className="docs-pill">{state.page.section}</span>
                {(["doc_id", "authority", "status", "updated"] as const)
                  .filter((key) => state.page?.frontmatter[key] !== undefined)
                  .map((key) => {
                    const value = state.page?.frontmatter[key];
                    const text = Array.isArray(value) ? value.join(", ") : value;
                    return (
                      <span className="docs-pill" key={key}>
                        {key}: {text}
                      </span>
                    );
                  })}
              </div>
            </header>

            <div
              className="docs-body"
              // Safe by construction: the renderer escapes all text before
              // building tags (see src/docs/markdown.ts posture note).
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            <nav className="docs-pager" aria-label="Adjacent documentation pages">
              {previous !== null ? (
                <a href={`#${previous.route}`}>Previous: {previous.title}</a>
              ) : (
                <span />
              )}
              {next !== null ? <a href={`#${next.route}`}>Next: {next.title}</a> : <span />}
            </nav>
          </article>
        ) : null}
      </main>
    </div>
  );
}
