/**
 * FEAT-MARKDOWN-CONTENT-TRANSFORM-01 — parser identity (golden trees) and
 * literal-HTML doctrine for the lit package's emitted runtime + component.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMarkdown, collectMarkdownText, type MarkdownBlock } from "../markdown.js";
import "../../../components/Markdown/Markdown.js";

const golden = JSON.parse(fs.readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../../ds-codegen/src/markdown/fixtures.json"),
  "utf8",
)) as { cases: { name: string; source: string; expected: MarkdownBlock[] }[] };

const HOSTILE = "# <img src=x onerror=alert(1)>\n\nSee [docs](javascript:alert(1)) and [site](https://example.com).";

async function mountRoot(source: string): Promise<HTMLElement | ShadowRoot> {
  const element = document.createElement("fsds-markdown") as HTMLElement & {
    content: string;
    updateComplete: Promise<boolean>;
  };
  element.content = source;
  document.body.appendChild(element);
  await element.updateComplete;
  return element.shadowRoot ?? element;
}

describe("markdown parser — golden identity", () => {
  for (const c of golden.cases) {
    it(`matches the frozen golden tree for ${c.name}`, () => {
      expect(parseMarkdown(c.source)).toEqual(c.expected);
    });
  }
});

describe("Markdown render — structural + injection", () => {
  it("renders the golden document as block/mark elements", async () => {
    const doc = golden.cases[0]!;
    const root = await mountRoot(doc.source);
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

  it("never interprets HTML; unsafe hrefs degrade", async () => {
    const root = await mountRoot(HOSTILE);
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
