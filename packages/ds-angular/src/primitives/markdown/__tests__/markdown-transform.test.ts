/**
 * FEAT-MARKDOWN-CONTENT-TRANSFORM-01 — parser identity (golden trees) and
 * literal-HTML doctrine for the angular package's emitted runtime + component.
 */
import { describe, it, expect, beforeEach } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { parseMarkdown, collectMarkdownText, type MarkdownBlock } from "../markdown";
import { MarkdownComponent } from "../../../components/Markdown/Markdown.component";

// The package tsconfig ships with `"types": []` (no node globals); the
// golden fixtures load through jest's CommonJS require via an ambient
// declaration, mirroring the highlight identity tests.
declare const require: (id: string) => {
  cases: { name: string; source: string; expected: MarkdownBlock[] }[];
};
const golden = require("../../../../../ds-codegen/src/markdown/fixtures.json");

const HOSTILE = "# <img src=x onerror=alert(1)>\n\nSee [docs](javascript:alert(1)) and [site](https://example.com).";

function mountRoot(source: string): HTMLElement {
  const fixture = TestBed.configureTestingModule({ imports: [MarkdownComponent] }).createComponent(MarkdownComponent);
  fixture.componentRef.setInput("content", source);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe("markdown parser — golden identity", () => {
  for (const c of golden.cases) {
    it(`matches the frozen golden tree for ${c.name}`, () => {
      expect(parseMarkdown(c.source)).toEqual(c.expected);
    });
  }
});

describe("Markdown render — structural + injection", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MarkdownComponent] });
  });

  it("renders the golden document as block/mark elements", () => {
    const doc = golden.cases[0]!;
    const root = mountRoot(doc.source);
    const blocks = Array.from(root.querySelectorAll("[data-block-kind]")).map(
      (el) => el.getAttribute("data-block-kind"),
    );
    expect(blocks).toEqual([
      "heading", "paragraph", "unorderedList", "listItem", "listItem",
      "orderedList", "listItem", "listItem", "blockquote", "codeBlock",
    ]);
    const marks = Array.from(root.querySelectorAll("[data-mark-kind]")).map(
      (el) => el.getAttribute("data-mark-kind"),
    );
    expect(marks).toEqual(["strong", "emphasis", "code"]);
  });

  it("never interprets HTML; unsafe hrefs degrade", () => {
    const root = mountRoot(HOSTILE);
    expect(root.querySelector("img, script")).toBeNull();
    expect(root.textContent).toContain("<img src=x onerror=alert(1)>");
    const links = Array.from(root.querySelectorAll("a"));
    expect(links).toHaveLength(1);
    expect(links[0]!.getAttribute("href")).toBe("https://example.com");
  });

  it("parser text collection round-trips hostile payloads literally", () => {
    const text = collectMarkdownText(parseMarkdown(HOSTILE));
    expect(text).toContain("<img src=x onerror=alert(1)>");
  });
});
