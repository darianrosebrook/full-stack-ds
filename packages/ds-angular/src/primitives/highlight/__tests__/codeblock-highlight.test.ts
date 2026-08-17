/**
 * FEAT-CODEBLOCK-HIGHLIGHT-01 — cross-framework tokenizer identity (A2)
 * and HTML-injection safety (A5) for the Angular package's emitted
 * runtime.
 *
 * The golden fixtures are the frozen baseline committed alongside the
 * canonical tokenizer in ds-codegen; every web package's byte-identical
 * copy MUST produce the same streams (the no-per-framework-divergence
 * invariant). The injection tests pin the text-only doctrine: the source
 * string is never interpreted as markup, whatever shape it contains.
 */
import { describe, it, expect, beforeEach } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { tokenizeCode } from "../tokenize";
import { CodeBlockComponent } from "../../../components/CodeBlock/CodeBlock.component";

// The package tsconfig ships with `"types": []` (no node globals), so the
// golden fixtures load through jest's CommonJS require — which parses JSON
// natively — via an ambient declaration instead of node:fs/__dirname.
declare const require: (id: string) => {
  cases: { language: string; code: string; expected: { kind: string; text: string }[] }[];
};

const golden = require(
  "../../../../../ds-codegen/src/highlight/golden-fixtures.json",
);

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
  // The Angular emitter pretty-prints inline-template content onto
  // indented lines, so textContent carries formatting whitespace around
  // the source; the round-trip claim is about the source characters,
  // hence .trim() here.
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CodeBlockComponent] });
  });

  function mountCodeBlock(props: {
    code: string;
    language: string;
    highlight?: boolean;
  }): HTMLElement {
    const fixture = TestBed.createComponent(CodeBlockComponent);
    fixture.componentRef.setInput("code", props.code);
    fixture.componentRef.setInput("language", props.language);
    if (props.highlight !== undefined) {
      fixture.componentRef.setInput("highlight", props.highlight);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it("never interprets HTML-shaped source as markup", () => {
    const root = mountCodeBlock({ code: MALICIOUS, language: "html" });
    expect(root.querySelector("img, script, b")).toBeNull();
    expect(root.querySelector("code")?.textContent?.trim()).toBe(MALICIOUS);
    expect((window as { __fsdsHighlightInjected?: number }).__fsdsHighlightInjected).toBeUndefined();
  });

  it("degrades to a single plain text run when the gate is off", () => {
    const root = mountCodeBlock({ code: MALICIOUS, language: "html", highlight: false });
    const code = root.querySelector("code");
    expect(code ? code.querySelectorAll("[data-token]").length : 0).toBe(0);
    expect(code?.textContent?.trim()).toBe(MALICIOUS);
  });

  it("token spans reassemble the source exactly", () => {
    const source = "export const answer = 42; // inline";
    const root = mountCodeBlock({ code: source, language: "typescript" });
    const code = root.querySelector("code");
    const spans: HTMLElement[] = code
      ? Array.from(code.querySelectorAll<HTMLElement>("[data-token]"))
      : [];
    expect(spans.length).toBeGreaterThan(1);
    expect(spans.map((s) => s.textContent).join("")).toBe(source);
  });
});
