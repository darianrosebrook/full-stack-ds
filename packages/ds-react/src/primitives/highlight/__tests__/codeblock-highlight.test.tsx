/**
 * FEAT-CODEBLOCK-HIGHLIGHT-01 — cross-framework tokenizer identity (A2)
 * and HTML-injection safety (A5) for the React package's emitted runtime.
 *
 * The golden fixtures are the frozen baseline committed alongside the
 * canonical tokenizer in ds-codegen; every web package's byte-identical
 * copy MUST produce the same streams (the no-per-framework-divergence
 * invariant). The injection tests pin the text-only doctrine: the source
 * string is never interpreted as markup, whatever shape it contains.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen } from "@testing-library/react";
import { tokenizeCode } from "../tokenize";
import { CodeBlock } from "../../../components/CodeBlock/CodeBlock";

const goldenPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../../ds-codegen/src/highlight/golden-fixtures.json",
);
const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8")) as {
  cases: { language: string; code: string; expected: { kind: string; text: string }[] }[];
};

/** The closed CodeBlockTokenType enum as declared in the contract. */
const CONTRACT_TOKEN_KINDS = [
  "comment",
  "definition",
  "keyword",
  "plain",
  "property",
  "punctuation",
  "static",
  "string",
  "tag",
] as const;

const MALICIOUS = `<img src=x onerror="window.__fsdsHighlightInjected=1"><script>window.__fsdsHighlightInjected=1</script>&<b>bold</b>`;

describe("highlight tokenizer — golden identity (A2)", () => {
  for (const c of golden.cases) {
    it(`matches the frozen golden stream for ${c.language}`, () => {
      expect(tokenizeCode(c.code, c.language)).toEqual(c.expected);
    });
  }
  it("every emitted kind stays inside the contract token-kind enum", () => {
    for (const c of golden.cases) {
      for (const token of tokenizeCode(c.code, c.language)) {
        expect(CONTRACT_TOKEN_KINDS).toContain(token.kind);
      }
    }
  });
});

describe("CodeBlock highlight — injection safety (A5)", () => {
  it("never interprets HTML-shaped source as markup", () => {
    render(<CodeBlock data-testid="cb-inject" code={MALICIOUS} language="html" />);
    const root = screen.getByTestId("cb-inject");
    expect(root.querySelector("img, script, b")).toBeNull();
    expect(root.querySelector("code")?.textContent).toBe(MALICIOUS);
    expect((window as { __fsdsHighlightInjected?: number }).__fsdsHighlightInjected).toBeUndefined();
  });

  it("degrades to a single plain text run when the gate is off", () => {
    render(<CodeBlock data-testid="cb-gate-off" code={MALICIOUS} language="html" highlight={false} />);
    const code = screen.getByTestId("cb-gate-off").querySelector("code");
    expect(code ? code.querySelectorAll("[data-token]").length : 0).toBe(0);
    expect(code?.textContent).toBe(MALICIOUS);
  });

  it("token spans reassemble the source exactly", () => {
    const source = "export const answer = 42; // inline";
    render(<CodeBlock data-testid="cb-roundtrip" code={source} language="typescript" />);
    const code = screen.getByTestId("cb-roundtrip").querySelector("code");
    const spans: HTMLElement[] = code
      ? Array.from(code.querySelectorAll<HTMLElement>("[data-token]"))
      : [];
    expect(spans.length).toBeGreaterThan(1);
    expect(spans.map((s) => s.textContent).join("")).toBe(source);
  });
});

describe("highlight tokenizer — language breadth (css/bash/markdown/json)", () => {
  const BREADTH_CASES: { language: string; code: string }[] = [
    {
      language: "css",
      code:
        `.card {\n` +
        `  /* surface chrome */\n` +
        `  color: var(--fsds-color);\n` +
        `  background: #ffffff;\n` +
        `  padding: 1.5rem;\n` +
        `  width: calc(100% - 2px);\n` +
        `  content: "quoted value";\n` +
        `  animation: spin 1s ease-in-out;\n` +
        `  --custom-prop: 12px;\n` +
        `  border: none;\n` +
        `  margin: 0 auto;\n` +
        `}\n` +
        `@media (max-width: 600px) { .card { margin: auto; } }\n`,
    },
    {
      language: "bash",
      code:
        `#!/usr/bin/env bash\n` +
        `# release note\n` +
        `if [ -n "$VAR" ]; then\n` +
        `  cd /tmp && ls -la | grep foo > out.txt\n` +
        `fi\n` +
        `echo "hello $NAME"\n` +
        `exit 0\n`,
    },
    {
      language: "markdown",
      code:
        `# Heading\n` +
        `## Sub heading\n\n` +
        "```ts\nconst x = 1;\n```\n\n" +
        `Some *emph* and **strong** text with [link](https://example.com) and \`code\`.\n` +
        `> quoted line\n`,
    },
    {
      language: "json",
      code: `{"key": "value", "nested": {"flag": true, "count": 3}, "list": [1, 2.5, null]}`,
    },
  ];

  for (const c of BREADTH_CASES) {
    it(`reassembles ${c.language} source exactly from token text`, () => {
      const tokens = tokenizeCode(c.code, c.language);
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.map((t) => t.text).join("")).toBe(c.code);
    });

    it(`keeps every ${c.language} token kind inside the contract enum`, () => {
      for (const token of tokenizeCode(c.code, c.language)) {
        expect(CONTRACT_TOKEN_KINDS).toContain(token.kind);
      }
    });

    it(`emits more than one token kind for ${c.language}`, () => {
      const kinds = new Set(tokenizeCode(c.code, c.language).map((t) => t.kind));
      expect(kinds.size).toBeGreaterThan(1);
    });
  }

  it("classifies css constructs: property, string, comment, hex, custom prop, value keyword", () => {
    const tokens = tokenizeCode(
      `.a { color: red; margin: 0 auto; content: "x"; /* c */ --p: 1px; background: #abc; width: auto; }`,
      "css",
    );
    const byText = new Map(tokens.map((t) => [t.text.trim(), t.kind]));
    expect(byText.get("color")).toBe("property");
    expect(byText.get("red")).toBe("plain");
    expect(byText.get("auto")).toBe("keyword");
    expect(byText.get('"x"')).toBe("string");
    expect(byText.get("/* c */")).toBe("comment");
    expect(byText.get("--p")).toBe("property");
    expect(byText.get("#abc")).toBe("static");
    expect(byText.get("1px")).toBe("static");
  });

  it("classifies bash constructs: comment, command keyword, variable, flag, string, static word", () => {
    const tokens = tokenizeCode(
      `#!/bin/bash\n# note\ngit commit -m "msg"\necho $HOME\ntrue\n`,
      "bash",
    );
    const byText = new Map(tokens.map((t) => [t.text, t.kind]));
    expect(byText.get("# note")).toBe("comment");
    expect(byText.get("git")).toBe("keyword");
    expect(byText.get("echo")).toBe("keyword");
    expect(byText.get("$HOME")).toBe("property");
    expect(byText.get("-m")).toBe("property");
    expect(byText.get('"msg"')).toBe("string");
    expect(byText.get("true")).toBe("static");
  });

  it("classifies markdown constructs: heading, fence, inline code, link target, emphasis", () => {
    const tokens = tokenizeCode(
      "## Title\n\n```ts\nconst a = 1;\n```\n\n`inline` and [link](https://x.test) and *em*.\n",
      "markdown",
    );
    const kinds = new Set(tokens.map((t) => t.kind));
    expect(kinds).toContain("keyword"); // heading hashes
    expect(kinds).toContain("punctuation"); // fences / link brackets / emphasis
    expect(kinds).toContain("string"); // inline code + link target
    const texts = tokens.map((t) => t.text).join("");
    expect(texts).toContain("```ts");
    expect(texts).toContain("https://x.test");
  });

  it("unknown languages degrade to a single plain run", () => {
    expect(tokenizeCode("abc def", "nonsense")).toEqual([
      { kind: "plain", text: "abc def" },
    ]);
  });

  it("is total at the boundary: undefined code and language never throw", () => {
    expect(tokenizeCode(undefined as unknown as string, "css")).toEqual([]);
    expect(tokenizeCode("x", undefined as unknown as string)).toEqual([
      { kind: "plain", text: "x" },
    ]);
  });
});
