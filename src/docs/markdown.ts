import { neutralizeHrefScheme, resolveDocsHref, slugify } from "./routing";

/**
 * Hand-rolled markdown-to-HTML renderer for the docs corpus, ported from the
 * Sterling workbench docs site with three corpus-driven fixes:
 *
 * 1. HTML comments are stripped EVERYWHERE, including mid-sentence — this
 *    corpus carries doc-claims markers (`the <!-- component-count -->52 …`)
 *    inside prose, which a line-leading-only skip would leak as visible
 *    escaped text. Comments inside code spans/code fences stay visible.
 * 2. Lists nest by indentation (the corpus has ~120 indented bullet sites).
 * 3. Thematic breaks (`---`) render as <hr>, not paragraph text.
 *
 * Safety posture: every text byte is HTML-escaped before any tag is
 * constructed; inline code spans are tokenized out BEFORE escaping so their
 * content renders literally. The only tags in output come from this file.
 * Out of scope (renders as plain text): strikethrough, task-list markers,
 * setext headings, definition lists. Fenced code inside a list item detaches
 * as a sibling block (documented non-claim, matches the ported behavior).
 */

interface RenderOptions {
  currentRelPath: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripComments(value: string): string {
  return value.replace(/<!--[\s\S]*?-->/g, "");
}

function renderInline(rawSource: string, options: RenderOptions): string {
  const codeSpans: string[] = [];
  let value = rawSource.replace(/`([^`]+)`/g, (_, code: string) => {
    const token = `@@CODE${codeSpans.length}@@`;
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  value = stripComments(value);
  value = escapeHtml(value);
  value = value.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt: string, href: string) =>
      // Image srcs are resource URLs, not routes: no hash prefixing, but the
      // same scheme allowlist applies (data:/javascript: srcs neutralized).
      `<img src="${escapeHtml(neutralizeHrefScheme(href))}" alt="${escapeHtml(alt)}" />`
  );
  value = value.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text: string, href: string) =>
      `<a href="${escapeHtml(resolveDocsHref(href, options.currentRelPath))}">${text}</a>`
  );
  value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  codeSpans.forEach((span, index) => {
    value = value.replace(`@@CODE${index}@@`, span);
  });

  return value;
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(lines: string[], options: RenderOptions): string {
  const [headerLine, , ...bodyLines] = lines;
  const headers = splitTableRow(headerLine);
  const rows = bodyLines.map(splitTableRow);
  return [
    '<div class="docs-table-wrap"><table>',
    "<thead><tr>",
    headers.map((cell) => `<th>${renderInline(cell, options)}</th>`).join(""),
    "</tr></thead>",
    "<tbody>",
    rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${renderInline(cell, options)}</td>`).join("")}</tr>`
      )
      .join(""),
    "</tbody>",
    "</table></div>",
  ].join("");
}

interface RawListItem {
  indent: number;
  ordered: boolean;
  text: string;
}

const LIST_ITEM = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

/** Render a gathered list block as nested <ul>/<ol> from indent levels. */
function renderListBlock(items: RawListItem[], options: RenderOptions): string {
  const firstIndent = items[0].indent;
  const topLevel = items.filter((item) => item.indent <= firstIndent);
  // Partition into top-level items, each owning the run of deeper items
  // that follows it.
  const segments: { item: RawListItem; children: RawListItem[] }[] = [];
  for (const item of items) {
    if (item.indent <= firstIndent) {
      segments.push({ item, children: [] });
    } else {
      segments[segments.length - 1].children.push(item);
    }
  }
  const tag = topLevel[0]?.ordered ? "ol" : "ul";
  const lis = segments.map(({ item, children }) => {
    const inner = children.length > 0 ? renderListBlock(children, options) : "";
    return `<li>${renderInline(item.text, options)}${inner}</li>`;
  });
  return `<${tag}>${lis.join("")}</${tag}>`;
}

function flushParagraph(paragraph: string[], html: string[], options: RenderOptions): void {
  if (paragraph.length === 0) return;
  html.push(`<p>${renderInline(paragraph.join(" "), options)}</p>`);
  paragraph.length = 0;
}

export function renderMarkdownToHtml(source: string, options: RenderOptions): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  const paragraph: string[] = [];
  let inCode = false;
  let codeLanguage = "";
  let inComment = false;
  const codeLines: string[] = [];

  const flushParagraphHere = () => flushParagraph(paragraph, html, options);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        html.push(
          `<pre><code${codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : ""}>${escapeHtml(
            codeLines.join("\n")
          )}</code></pre>`
        );
        inCode = false;
        codeLanguage = "";
        codeLines.length = 0;
      } else {
        flushParagraphHere();
        inCode = true;
        codeLanguage = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // Multi-line block comment: skip everything until the closing marker.
    if (inComment) {
      if (trimmed.includes("-->")) inComment = false;
      continue;
    }
    if (trimmed.startsWith("<!--")) {
      flushParagraphHere();
      if (!trimmed.includes("-->")) inComment = true;
      continue;
    }

    if (trimmed === "") {
      flushParagraphHere();
      continue;
    }

    if (/^([-*_])\1{2,}\s*$/.test(trimmed)) {
      flushParagraphHere();
      html.push("<hr />");
      continue;
    }

    if (
      trimmed.includes("|") &&
      lines[index + 1] !== undefined &&
      isTableSeparator(lines[index + 1])
    ) {
      flushParagraphHere();
      const tableLines = [line, lines[index + 1]];
      index += 2;
      while (index < lines.length && lines[index].trim().includes("|")) {
        tableLines.push(lines[index]);
        index += 1;
      }
      index -= 1;
      html.push(renderTable(tableLines, options));
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraphHere();
      const depth = heading[1].length;
      const text = heading[2].replace(/\s+#+$/, "");
      html.push(
        `<h${depth} id="${slugify(text)}">${renderInline(text, options)}</h${depth}>`
      );
      continue;
    }

    const blockquote = /^>\s?(.*)$/.exec(trimmed);
    if (blockquote) {
      flushParagraphHere();
      html.push(`<blockquote><p>${renderInline(blockquote[1], options)}</p></blockquote>`);
      continue;
    }

    const currentItem = LIST_ITEM.exec(line);
    if (currentItem) {
      flushParagraphHere();
      // Gather the whole list block: consecutive list items at any indent,
      // plus blank lines that are still followed by a list item.
      const block: RawListItem[] = [
        {
          indent: currentItem[1].length,
          ordered: currentItem[2] !== undefined && /\d/.test(currentItem[2]),
          text: currentItem[3],
        },
      ];
      index += 1;
      while (index < lines.length) {
        const next = lines[index];
        const nextItem = LIST_ITEM.exec(next);
        if (nextItem) {
          block.push({
            indent: nextItem[1].length,
            ordered: nextItem[2] !== undefined && /\d/.test(nextItem[2]),
            text: nextItem[3],
          });
          index += 1;
          continue;
        }
        if (next.trim() === "") {
          const after = lines[index + 1];
          if (after !== undefined && LIST_ITEM.test(after)) {
            index += 1;
            continue;
          }
        }
        break;
      }
      index -= 1;
      html.push(renderListBlock(block, options));
      continue;
    }

    paragraph.push(trimmed);
  }

  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }
  flushParagraphHere();

  return html.join("\n");
}
