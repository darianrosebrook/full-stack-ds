import { describe, expect, it } from "vitest";

import { renderMarkdownToHtml } from "./markdown";

const render = (source: string, relPath = "docs/a.md") =>
  renderMarkdownToHtml(source, { currentRelPath: relPath });

describe("renderMarkdownToHtml — claims markers and hostile input", () => {
  it("strips mid-sentence HTML comments so claims markers never render", () => {
    const html = render("the <!-- component-count -->52 corpus contracts");
    expect(html).toBe("<p>the 52 corpus contracts</p>");
  });

  it("skips multi-line block comments entirely", () => {
    const html = render("before\n<!--\nhidden\nalso hidden\n-->\nafter");
    expect(html).toContain("<p>before</p>");
    expect(html).toContain("<p>after</p>");
    expect(html).not.toContain("hidden");
  });

  it("keeps comment-like text visible inside code spans", () => {
    const html = render("use `<!-- keep -->` carefully");
    expect(html).toContain("<code>&lt;!-- keep --&gt;</code>");
  });

  it("escapes script injection in prose", () => {
    const html = render("<script>alert(1)</script>");
    expect(html).toBe("<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>");
    expect(html).not.toMatch(/<script>/);
  });

  it("escapes raw HTML wrappers instead of passing them through", () => {
    const html = render('<div class="evil">text</div>');
    expect(html).toContain("&lt;div class=&quot;evil&quot;&gt;text&lt;/div&gt;");
  });

  it("does not linkify markdown links inside fenced code", () => {
    const html = render("```\n[fake](docs/nope.md)\n```");
    expect(html).toContain('<pre><code>[fake](docs/nope.md)</code></pre>');
    expect(html).not.toContain("<a ");
  });
});

describe("renderMarkdownToHtml — blocks", () => {
  it("renders headings with slug ids and inline code in the text", () => {
    const html = render("## Some `Heading` Two");
    expect(html).toBe('<h2 id="some-heading-two">Some <code>Heading</code> Two</h2>');
  });

  it("renders fenced code with its language class", () => {
    const html = render("```ts\nconst x = 1;\n```");
    expect(html).toBe('<pre><code class="language-ts">const x = 1;</code></pre>');
  });

  it("flushes an unterminated fence at EOF as a code block", () => {
    const html = render("```js\nnever closed");
    expect(html).toBe("<pre><code>never closed</code></pre>");
  });

  it("renders tables wrapped for horizontal scrolling", () => {
    const html = render("| a | b |\n| --- | --- |\n| 1 | 2 |");
    expect(html).toContain('<div class="docs-table-wrap"><table>');
    expect(html).toContain("<th>a</th>");
    expect(html).toContain("<td>1</td>");
  });

  it("renders thematic breaks and blockquotes", () => {
    expect(render("---")).toBe("<hr />");
    expect(render("> quoted text")).toBe("<blockquote><p>quoted text</p></blockquote>");
  });

  it("renders nested lists by indentation", () => {
    const html = render("- a\n  - b\n- c");
    expect(html).toBe("<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>");
  });

  it("renders ordered lists and keeps blank-line-separated items together", () => {
    expect(render("1. x\n2. y")).toBe("<ol><li>x</li><li>y</li></ol>");
    const html = render("- a\n\n- b");
    expect(html).toBe("<ul><li>a</li><li>b</li></ul>");
  });
});

describe("renderMarkdownToHtml — links route into the app", () => {
  it("rewrites relative md links to docs routes with fragments", () => {
    const html = render("see [overview](./overview.md#intro)", "docs/arch/guide.md");
    expect(html).toBe('<p>see <a href="/docs/arch/overview#intro">overview</a></p>');
  });

  it("renders images with resolved src and preserved alt text", () => {
    const html = render("![alt text](./img.png)");
    expect(html).toContain('<img src="./img.png" alt="alt text" />');
  });

  it("escapes quote characters in link hrefs and text", () => {
    const html = render('[x](./"q".md)');
    expect(html).not.toContain('"q".md"');
  });
});
