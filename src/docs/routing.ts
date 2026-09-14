/**
 * Route derivation for the docs site. Shared by the Node-side projection
 * (which assigns routes while indexing the corpus) and the client reader
 * (which resolves relative markdown links into in-app routes), so there is
 * exactly one route rule — unlike a hand-copied pair, it cannot fork.
 *
 * Rules (with the two README special cases made explicit):
 *   README.md          -> /docs/readme    (repo root README; bare /docs is the graph)
 *   docs/README.md     -> /docs/index     (docs tree index)
 *   docs/foo.md        -> /docs/foo
 *   docs/foo/bar.md    -> /docs/foo/bar
 *   docs/foo/README.md -> /docs/foo       (directory README collapses, Sterling rule)
 */

export const DOCS_ROUTE_PREFIX = "/docs";
export const DOCS_LANDING_ROUTE = DOCS_ROUTE_PREFIX;

/** Landing route for the bare docs path (the dependency graph lives here). */
export function isDocsLanding(path: string): boolean {
  return normalizeDocsPath(path) === DOCS_LANDING_ROUTE;
}

/**
 * Repo-relative markdown path -> app route. Pure string algebra; the
 * projection asserts uniqueness across the corpus so a future `docs/index.md`
 * colliding with `docs/README.md` fails the build instead of shadowing.
 */
export function docsRouteFromRelPath(relPath: string): string {
  const normalized = relPath.replace(/\\/g, "/").replace(/\.md$/, "");
  if (normalized === "README") return `${DOCS_ROUTE_PREFIX}/readme`;
  if (normalized === "docs/README") return `${DOCS_ROUTE_PREFIX}/index`;
  // Directory READMEs collapse to their directory route (Sterling rule); the
  // two fixed slugs above keep the corpus's two READMEs off the landing.
  const collapsed = normalized.replace(/\/README$/, "");
  if (collapsed === "docs") return DOCS_ROUTE_PREFIX;
  return `${DOCS_ROUTE_PREFIX}/${collapsed.replace(/^docs\//, "")}`;
}

/** Client-side route comparison: trailing slashes are insignificant. */
export function normalizeDocsPath(path: string): string {
  let normalized = path.startsWith("/") ? path : `/${path}`;
  while (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

/**
 * Heading slug — the single slug rule used by both the reader's rendered
 * heading ids and the projection's heading list, so fragment links resolve.
 * Backticked spans contribute their inner text (`` `a b` `` -> "a-b").
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Rewrite a markdown href against the current document's repo-relative path.
 * External/anchor/api/data hrefs pass through untouched; relative `.md`
 * targets resolve (`.`/`..` aware) and map to their app route, keeping any
 * fragment. Non-md relative targets pass through unchanged (images resolve
 * at their own layer; the corpus carries none under docs/ today).
 */
export function resolveDocsHref(href: string, currentRelPath: string): string {
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("#") ||
    href.startsWith("/api/") ||
    href.startsWith("/data/")
  ) {
    return href;
  }

  const hashIndex = href.indexOf("#");
  const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hashPart = hashIndex === -1 ? "" : href.slice(hashIndex);
  if (!pathPart.includes(".md")) return href;

  const currentParts = currentRelPath.split("/");
  currentParts.pop();
  const baseParts = pathPart.startsWith("/")
    ? []
    : currentParts.filter((part) => part.length > 0);
  const resolvedParts: string[] = [];
  for (const part of [
    ...baseParts,
    ...pathPart.replace(/^\/?docs\//, "").split("/"),
  ]) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      // Escaping the repo root is not a corpus route; leave the href alone
      // (mirrors the projection's resolveLinkTarget root-escape guard).
      if (resolvedParts.length === 0) return href;
      resolvedParts.pop();
      continue;
    }
    resolvedParts.push(part);
  }

  const route = docsRouteFromRelPath(resolvedParts.join("/"));
  return hashPart ? `${route}${hashPart}` : route;
}
