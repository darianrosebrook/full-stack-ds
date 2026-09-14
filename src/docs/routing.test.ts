import { describe, expect, it } from "vitest";

import {
  docsRouteFromRelPath,
  isDocsLanding,
  normalizeDocsPath,
  resolveDocsHref,
  slugify,
} from "./routing";

describe("docsRouteFromRelPath", () => {
  it("maps every corpus shape to its documented route", () => {
    expect(docsRouteFromRelPath("README.md")).toBe("/docs/readme");
    expect(docsRouteFromRelPath("docs/README.md")).toBe("/docs/index");
    expect(docsRouteFromRelPath("docs/foo.md")).toBe("/docs/foo");
    expect(docsRouteFromRelPath("docs/a/b.md")).toBe("/docs/a/b");
    expect(docsRouteFromRelPath("docs/a/README.md")).toBe("/docs/a");
  });

  it("normalizes windows separators before mapping", () => {
    expect(docsRouteFromRelPath("docs\\a\\b.md")).toBe("/docs/a/b");
  });
});

describe("normalizeDocsPath / isDocsLanding", () => {
  it("collapses leading-slash and trailing-slash variance", () => {
    expect(normalizeDocsPath("docs/foo")).toBe("/docs/foo");
    expect(normalizeDocsPath("/docs/foo/")).toBe("/docs/foo");
    expect(normalizeDocsPath("/docs//")).toBe("/docs");
  });

  it("recognizes only the bare docs prefix as the graph landing", () => {
    expect(isDocsLanding("/docs")).toBe(true);
    expect(isDocsLanding("/docs/")).toBe(true);
    expect(isDocsLanding("/docs/foo")).toBe(false);
    expect(isDocsLanding("/")).toBe(false);
  });
});

describe("slugify", () => {
  it("keeps backticked spans as text and dashes everything else", () => {
    expect(slugify("Codegen `Authority` Docs")).toBe("codegen-authority-docs");
    expect(slugify("What's New?")).toBe("what-s-new");
    expect(slugify("---edge---")).toBe("edge");
    expect(slugify("0014-realization_layer topology")).toBe("0014-realization_layer-topology");
  });
});

describe("resolveDocsHref", () =>{
  const from = "docs/a/b.md";

  it("resolves relative md targets against the current doc and keeps fragments", () => {
    expect(resolveDocsHref("./c.md", from)).toBe("/docs/a/c");
    expect(resolveDocsHref("../d.md", from)).toBe("/docs/d");
    expect(resolveDocsHref("./c.md#section", from)).toBe("/docs/a/c#section");
    // A bare README.md beside the doc is that directory's README -> dir route.
    expect(resolveDocsHref("README.md", from)).toBe("/docs/a");
    expect(resolveDocsHref("../../README.md", from)).toBe("/docs/readme");
  });

  it("resolves docs-root-absolute hrefs from the docs tree root", () => {
    expect(resolveDocsHref("/docs/e.md", from)).toBe("/docs/e");
    expect(resolveDocsHref("docs/e.md", "README.md")).toBe("/docs/e");
  });

  it("passes through non-corpus hrefs untouched", () => {
    expect(resolveDocsHref("https://example.com/x.md", from)).toBe("https://example.com/x.md");
    expect(resolveDocsHref("mailto:a@b.c", from)).toBe("mailto:a@b.c");
    expect(resolveDocsHref("#anchor", from)).toBe("#anchor");
    expect(resolveDocsHref("/api/payload", from)).toBe("/api/payload");
    expect(resolveDocsHref("./image.png", from)).toBe("./image.png");
  });

  it("resolves root-level targets through the docs prefix even when out of corpus", () => {
    // ../.. from docs/a/ lands at the repo root: the href becomes a route for
    // a root-level file. Out-of-corpus targets render as routes the reader
    // will not resolve; the projection counts them in droppedLinks instead.
    expect(resolveDocsHref("../../outside.md", from)).toBe("/docs/outside");
  });
});
