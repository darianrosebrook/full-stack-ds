/**
 * FEAT-CODEBLOCK-HIGHLIGHT-01 — cross-framework tokenizer identity (A2)
 * and HTML-injection safety (A5) for the Svelte package's emitted runtime.
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
import { render } from "@testing-library/svelte";
import { tokenizeCode } from "../tokenize.js";
import CodeBlock from "../../../components/CodeBlock/CodeBlock.svelte";

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
    const { container } = render(CodeBlock, {
      props: { code: MALICIOUS, language: "html" },
    });
    expect(container.querySelector("img, script, b")).toBeNull();
    expect(container.querySelector("code")?.textContent).toBe(MALICIOUS);
    expect((window as { __fsdsHighlightInjected?: number }).__fsdsHighlightInjected).toBeUndefined();
  });

  it("degrades to a single plain text run when the gate is off", () => {
    const { container } = render(CodeBlock, {
      props: { code: MALICIOUS, language: "html", highlight: false },
    });
    const code = container.querySelector("code");
    expect(code ? code.querySelectorAll("[data-token]").length : 0).toBe(0);
    expect(code?.textContent).toBe(MALICIOUS);
  });

  it("token spans reassemble the source exactly", () => {
    const source = "export const answer = 42; // inline";
    const { container } = render(CodeBlock, {
      props: { code: source, language: "typescript" },
    });
    const code = container.querySelector("code");
    const spans: HTMLElement[] = code
      ? Array.from(code.querySelectorAll<HTMLElement>("[data-token]"))
      : [];
    expect(spans.length).toBeGreaterThan(1);
    expect(spans.map((s) => s.textContent).join("")).toBe(source);
  });
});
