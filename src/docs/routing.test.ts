import { describe, expect, it } from "vitest";

import {
  docsRouteFromRelPath,
  isDocsLanding,
  neutralizeHrefScheme,
  normalizeDocsPath,
  resolveDocsHref,
  slugify,
} from "./routing";
import { buildHref, parseHash } from "../router";

describe("docs route parsing (hash router integration)", () => {
  it("splits a fragment tail off the docs path", () => {
    expect(parseHash("#/docs/readme#full-stack-ds")).toEqual({
      kind: "docs",
      path: "readme",
      fragment: "full-stack-ds",
    });
    expect(parseHash("#/docs/architecture/overview")).toEqual({
      kind: "docs",
      path: "architecture/overview",
      fragment: null,
    });
    expect(parseHash("#/docs")).toEqual({ kind: "docs", path: "", fragment: null });
  });

  it("round-trips a fragment-bearing docs route through buildHref", () => {
    expect(buildHref({ kind: "docs", path: "readme", fragment: "intro" })).toBe(
      "#/docs/readme#intro"
    );
    expect(buildHref({ kind: "docs", path: "", fragment: null })).toBe("#/docs");
  });
});

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

describe("resolveDocsHref", () => {
  const from = "docs/a/b.md";

  it("emits hash-router hrefs so clicks stay inside the app", () => {
    expect(resolveDocsHref("./c.md", from)).toBe("#/docs/a/c");
    expect(resolveDocsHref("../d.md", from)).toBe("#/docs/d");
    expect(resolveDocsHref("./c.md#section", from)).toBe("#/docs/a/c#section");
    // A bare README.md beside the doc is that directory's README -> dir route.
    expect(resolveDocsHref("README.md", from)).toBe("#/docs/a");
    expect(resolveDocsHref("../../README.md", from)).toBe("#/docs/readme");
  });

  it("resolves docs-root-absolute hrefs from the docs tree root", () => {
    expect(resolveDocsHref("/docs/e.md", from)).toBe("#/docs/e");
    expect(resolveDocsHref("docs/e.md", "README.md")).toBe("#/docs/e");
  });

  it("passes through non-corpus hrefs untouched", () => {
    expect(resolveDocsHref("https://example.com/x.md", from)).toBe("https://example.com/x.md");
    expect(resolveDocsHref("mailto:a@b.c", from)).toBe("mailto:a@b.c");
    expect(resolveDocsHref("#anchor", from)).toBe("#anchor");
    expect(resolveDocsHref("/api/payload", from)).toBe("/api/payload");
    expect(resolveDocsHref("./image.png", from)).toBe("./image.png");
  });

  it("neutralizes dangerous URL schemes to a same-page anchor", () => {
    expect(resolveDocsHref("javascript:alert(1)", from)).toBe("#");
    expect(resolveDocsHref("data:text/html,<script>", from)).toBe("#");
    expect(resolveDocsHref("vbscript:msgbox", from)).toBe("#");
    expect(resolveDocsHref("file:///etc/passwd", from)).toBe("#");
    // The image-src helper shares the scheme rule without routing.
    expect(neutralizeHrefScheme("data:image/png;base64,xxx")).toBe("#");
    expect(neutralizeHrefScheme("./pic.png")).toBe("./pic.png");
  });

  it("resolves root-level targets through the docs prefix even when out of corpus", () => {
    // ../.. from docs/a/ lands at the repo root: the href becomes a route for
    // a root-level file. Out-of-corpus targets render as routes the reader
    // will not resolve; the projection counts them in droppedLinks instead.
    expect(resolveDocsHref("../../outside.md", from)).toBe("#/docs/outside");
  });
});
