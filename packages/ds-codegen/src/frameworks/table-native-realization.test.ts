import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateReactComponentSource } from "./react/component-source.js";
import { generateVueComponentSource, generateVueCompoundPartSource } from "./vue/component-source.js";
import { generateSvelteComponentSource, generateSvelteCompoundPartSource } from "./svelte/component-source.js";
import { generateAngularComponentSource } from "./angular/component-source.js";
import { generateLitComponentSource } from "./lit/component-source.js";

// CODEGEN-TABLE-COMPOUND-PARTS-REALIZATION-01 — falsifier.
//
// This test loads the real Table.contract.json from disk, generates the
// emitted source for every framework target, and characterizes the
// realization gap. It is the committed evidence that Table is structurally
// lying about being a table.
//
// The file is split into two suites that move together as the slice
// progresses:
//
//   Suite A — "Current broken state (Commit 1)"
//     Plain `it(...)` assertions about today's emitted source. They
//     document the exact shape of the lie: <Stack> wrappers instead of
//     native tags, fsds-table-row/etc. custom elements, no <table> in
//     the root template. They pass today (Commit 1). When Commit 2
//     lands, they FAIL — at which point Commit 2 deletes the entire
//     suite. The diff is the proof that the lie has been removed.
//
//   Suite B — "Realization claims (Commit 2 promotes these)"
//     `it.fails(...)` assertions about the target native realization.
//     Inside each test body, the expectation describes what Commit 2
//     must achieve. `it.fails` inverts the runner outcome: the test
//     reports green when the assertion inside fails (i.e. when the
//     target realization isn't yet emitted). In Commit 2 the codegen
//     emits the native tags, the inner assertions start passing, and
//     `it.fails` flips them to reporting red — at which point Commit 2
//     changes `it.fails` → `it`, and the realization is locked in.
//
// This shape preserves three properties:
//   1. The repo's CI gate (pnpm test must stay green) remains honest at
//      every commit boundary. No --no-verify; no committed red tests.
//   2. The falsifier IS committed — Suite A documents the lie's exact
//      shape; Suite B documents the target with verbatim assertions.
//   3. Commit 2's diff is the proof: Suite A goes away (deletion of
//      brokenness assertions) and Suite B's `it.fails` flips to `it`
//      (promotion of realization claims to invariants).
//
// Doctrine notes pinned here:
//   • Layer 1 (source-string) only in this file. Layer 2 (runtime DOM /
//     browser-backed) lives in per-framework generated test files,
//     authored alongside the regen in Commit 2.
//   • Lit's slot model is the gating unknown. The Lit assertions here
//     check emitted source. The browser-backed slot-distribution test
//     (Layer 2) in Commit 2 is the real go/no-go.

const CONTRACTS_ROOT = resolve(__dirname, "../../../ds-contracts");
const TABLE_CONTRACT_PATH = resolve(
  CONTRACTS_ROOT,
  "components/Table/Table.contract.json",
);

function loadTableContract(): ComponentContract {
  const raw = readFileSync(TABLE_CONTRACT_PATH, "utf8");
  return JSON.parse(raw) as ComponentContract;
}

const contract = loadTableContract();
const ir = buildComponentIR(contract);

// Subcomponent parts whose native tag is consumer-composed (not in root
// anatomy.dom tree). The contract is expected to declare these in
// anatomy.details.<part>.tag in Commit 2.
const COMPOSED_PARTS: ReadonlyArray<{ part: string; tag: string; cssClass: string }> = [
  { part: "caption", tag: "caption", cssClass: "table__caption" },
  { part: "head", tag: "thead", cssClass: "table__head" },
  { part: "body", tag: "tbody", cssClass: "table__body" },
  { part: "footer", tag: "tfoot", cssClass: "table__footer" },
  { part: "row", tag: "tr", cssClass: "table__row" },
  { part: "headerCell", tag: "th", cssClass: "table__header-cell" },
  { part: "cell", tag: "td", cssClass: "table__cell" },
];

// =============================================================================
// SUITE A — Current broken state (Commit 1). DELETED IN COMMIT 2.
// =============================================================================
//
// These assertions document the exact shape of today's div-soup. They
// pass against current main. Commit 2 deletes this entire suite as part
// of the same diff that flips Suite B's `it.fails` to `it`.

describe("Table realization — current broken state (Commit 1 snapshot; removed in Commit 2)", () => {
  const reactSrc = generateReactComponentSource(ir, "../../primitives");

  it("React imports Stack as the layout primitive (no native <table> anywhere)", () => {
    expect(reactSrc).toMatch(/import\s+\{\s*Stack\s*\}\s+from\s+["']\.\.\/\.\.\/primitives["']/);
    expect(reactSrc).not.toMatch(/<table\b/);
  });

  it("React TableBody wraps in <Stack className=\"table__body\">, emitting a <div>, not a <tbody>", () => {
    // Source includes `["table__body", className]` for the classNames
    // variable, and `<Stack className={classNames}>` in the JSX. Both
    // facts together prove the wrapper is Stack (= div) not <tbody>.
    expect(reactSrc).toMatch(/export function TableBody\b[\s\S]*?\["table__body"/);
    expect(reactSrc).toMatch(/export function TableBody\b[\s\S]*?<Stack className=\{classNames\}/);
    expect(reactSrc).not.toMatch(/export function TableBody\b[\s\S]*?<tbody\b/);
  });

  it("React TableFooter wraps in <Stack as=\"footer\">, emitting <footer> (page-banner), not <tfoot>", () => {
    expect(reactSrc).toMatch(/export function TableFooter\b[\s\S]*?<Stack as="footer"/);
    expect(reactSrc).not.toMatch(/export function TableFooter\b[\s\S]*?<tfoot\b/);
  });

  it("React TableHeader wraps in <Stack as=\"header\">, emitting <header> (page-banner), not <th>", () => {
    expect(reactSrc).toMatch(/export function TableHeader\b[\s\S]*?<Stack as="header"/);
    expect(reactSrc).not.toMatch(/export function TableHeader\b[\s\S]*?<th\b/);
  });

  const angularSrc = generateAngularComponentSource(ir);

  it("Angular emits element selectors fsds-table-{body,footer,header} (invalid table children)", () => {
    expect(angularSrc).toMatch(/selector:\s*["']fsds-table-body["']/);
    expect(angularSrc).toMatch(/selector:\s*["']fsds-table-footer["']/);
    expect(angularSrc).toMatch(/selector:\s*["']fsds-table-header["']/);
  });

  const litSrc = generateLitComponentSource(ir);

  it("Lit registers fsds-table-body/footer/header custom elements (forbidden as table children)", () => {
    expect(litSrc).toMatch(/customElements\.define\(['"]fsds-table-body['"]/);
    expect(litSrc).toMatch(/customElements\.define\(['"]fsds-table-footer['"]/);
    expect(litSrc).toMatch(/customElements\.define\(['"]fsds-table-header['"]/);
  });

  it("Lit root render() template does NOT contain a native <table> element", () => {
    expect(litSrc).not.toMatch(/html`[\s\S]*<table[^>]*class="table__container"/);
  });
});

// =============================================================================
// SUITE B — Realization claims (Commit 2 will promote these).
// =============================================================================
//
// Each it.fails(...) expresses what the codegen + contract changes in
// Commit 2 must make true. Inside each test body, the assertions are
// the verbatim invariants — `it.fails` simply inverts the runner outcome
// for the duration of Commit 1.
//
// In Commit 2:
//   • The contract gains anatomy.details.<part>.tag.
//   • The codegen reads details.tag into PartIR.nativeTag.
//   • Compound-part emitters branch on TABLE_COMPOSITION_TAGS to emit
//     native tags directly (no Stack), attribute selectors (Angular),
//     and suppress custom-element registration (Lit).
//   • Every `it.fails(` in this suite becomes `it(`. The diff is the
//     ledger of realization claims earned.

describe("Table realization — claims for Commit 2", () => {
  const reactSrc = generateReactComponentSource(ir, "../../primitives");

  it.fails("React: root component renders <table className=\"table__container\"> as the inner table element", () => {
    expect(reactSrc).toMatch(/<table[^>]*className="table__container"/);
  });

  it.fails("React: root component wraps the table in a div.table responsive container", () => {
    expect(reactSrc).toMatch(/<div[^>]*className="table"[^>]*>[\s\S]*<table/);
  });

  for (const { part, tag, cssClass } of COMPOSED_PARTS) {
    const subName = `Table${part[0].toUpperCase()}${part.slice(1)}`;
    it.fails(`React: emits ${subName} as a native <${tag} className="${cssClass}">, not <Stack>`, () => {
      const positive = new RegExp(
        `export function ${subName}[\\s\\S]*?<${tag}[^>]*className=[^>]*${cssClass}`,
      );
      const noStack = new RegExp(`export function ${subName}[\\s\\S]*?<Stack`);
      expect(reactSrc).toMatch(positive);
      expect(reactSrc).not.toMatch(noStack);
    });
  }

  const vueRootSrc = generateVueComponentSource(ir);

  it.fails("Vue: root SFC contains the native <table> container in its template", () => {
    expect(vueRootSrc).toMatch(/<table[^>]*class="[^"]*table__container/);
  });

  for (const { part, tag, cssClass } of COMPOSED_PARTS) {
    const partIR = ir.parts.find((p) => p.name === part);
    if (!partIR) {
      it.fails(`Vue: ${part} subcomponent exists in IR (added by Commit 2's contract change)`, () => {
        expect(ir.parts.find((p) => p.name === part)).toBeDefined();
      });
      continue;
    }
    const partSrc = generateVueCompoundPartSource(ir.cssPrefix, partIR);

    it.fails(`Vue: Table${part[0].toUpperCase()}${part.slice(1)}.vue uses <${tag} class="...${cssClass}">, no Stack`, () => {
      expect(partSrc).toMatch(new RegExp(`<${tag}[^>]*:class="[^"]*${cssClass}`));
      expect(partSrc).not.toMatch(/<Stack/);
      expect(partSrc).not.toMatch(/import\s+\{\s*Stack\s*\}/);
    });
  }

  const svelteRootSrc = generateSvelteComponentSource(ir);

  it.fails("Svelte: root component contains the native <table> container", () => {
    expect(svelteRootSrc).toMatch(/<table[^>]*class="?\{?[^>]*table__container/);
  });

  for (const { part, tag, cssClass } of COMPOSED_PARTS) {
    const partIR = ir.parts.find((p) => p.name === part);
    if (!partIR) {
      it.fails(`Svelte: ${part} subcomponent exists in IR (added by Commit 2's contract change)`, () => {
        expect(ir.parts.find((p) => p.name === part)).toBeDefined();
      });
      continue;
    }
    const partSrc = generateSvelteCompoundPartSource(ir.cssPrefix, partIR);

    it.fails(`Svelte: Table${part[0].toUpperCase()}${part.slice(1)}.svelte uses <${tag} class="${cssClass}">, no Stack`, () => {
      expect(partSrc).toMatch(new RegExp(`<${tag}[^>]*class=[^>]*${cssClass}`));
      expect(partSrc).not.toMatch(/<Stack/);
      expect(partSrc).not.toMatch(/import\s+\{\s*Stack\s*\}/);
    });
  }

  const angularSrc = generateAngularComponentSource(ir);

  it.fails("Angular: root TableComponent template contains the native <table> container", () => {
    expect(angularSrc).toMatch(/<table[^>]*\[ngClass\][^>]*"[^"]*table__container/);
  });

  it.fails("Angular: emits attribute selectors (tr[fsdsTableRow] etc.) on native hosts, not element selectors", () => {
    for (const { tag, part } of COMPOSED_PARTS) {
      const kebabPart = part.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      const partCamel = `${part[0].toUpperCase()}${part.slice(1)}`;
      // Element selector forbidden:
      expect(angularSrc).not.toMatch(
        new RegExp(`selector:\\s*["']fsds-table-${kebabPart}["']`),
      );
      // Attribute selector required:
      expect(angularSrc).toMatch(
        new RegExp(`selector:\\s*["']${tag}\\[fsdsTable${partCamel}\\]["']`),
      );
    }
  });

  const litSrc = generateLitComponentSource(ir);

  it.fails("Lit: root template contains a native <table class=\"table__container\">", () => {
    expect(litSrc).toMatch(/html`[\s\S]*<table[^>]*class="table__container"/);
  });

  it.fails("Lit: does NOT register fsds-table-{row,cell,head,body,footer,header-cell,caption} custom elements", () => {
    const forbiddenTags = [
      "fsds-table-row",
      "fsds-table-cell",
      "fsds-table-header-cell",
      "fsds-table-head",
      "fsds-table-body",
      "fsds-table-footer",
      "fsds-table-caption",
    ];
    for (const ce of forbiddenTags) {
      expect(litSrc).not.toMatch(
        new RegExp(`customElements\\.define\\(['"]${ce}['"]`),
      );
    }
  });

  it.fails("Lit: table template does not delegate to <fsds-stack>", () => {
    const tableTemplate = litSrc.match(/html`[\s\S]*?<table[\s\S]*?<\/table>`/);
    expect(tableTemplate).not.toBeNull();
    if (tableTemplate) {
      expect(tableTemplate[0]).not.toMatch(/<fsds-stack/);
    }
  });
});
