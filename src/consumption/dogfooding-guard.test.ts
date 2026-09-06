import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "..");
const RAW_CONTROL_TAGS = new Set([
  "button",
  "details",
  "input",
  "select",
  "summary",
  "textarea",
]);

interface DebtEntry {
  tags: Record<string, number>;
  rationale: string;
}

/**
 * Exact, two-directional debt ledger. New native controls fail the guard, and
 * removing an existing one makes its ledger row stale. The latter matters:
 * debt must disappear from both source and the accepted baseline.
 */
const RAW_CONTROL_DEBT: Record<string, DebtEntry> = {
  "components/CodeViewer.tsx": {
    tags: { button: 1 },
    rationale: "Inline code-range hotspot; Button geometry is intentionally inappropriate.",
  },
  "components/JsonTreeViewer.tsx": {
    tags: { details: 2, summary: 2 },
    rationale: "Recursive native disclosure pending a ref-forwarding, state-synchronized Details API.",
  },
  "components/properties-panel/PropertiesPanel.tsx": {
    tags: { button: 2, input: 4, select: 1 },
    rationale: "Remaining prop and color controls use native inputs; design-property values use the generated Input and retired unwired rows are removed.",
  },
  "components/properties-panel/PropertySection.tsx": {
    tags: { button: 1 },
    rationale: "App-local disclosure pending adoption of the Accordion compound.",
  },
  "components/properties-panel/TokenPicker.tsx": {
    tags: { button: 2, input: 1 },
    rationale: "Searchable token selection pending Command and dense-control realization.",
  },
  "components/properties-panel/TokenValueControl.tsx": {
    tags: { button: 3, input: 3 },
    rationale: "Dense stepper and color editing need reusable NumberField and ColorField compounds.",
  },
  "layout/Header.tsx": {
    tags: { input: 1 },
    rationale: "Single-choice brand selection needs a generated RadioGroup family.",
  },
  "views/TokensView.tsx": {
    tags: { button: 1 },
    rationale: "Single-choice brand selection needs a generated RadioGroup family.",
  },
};

const APP_SURROGATE_DEBT: Record<string, Record<string, number>> = {
  panel: {
    "components/CodeViewer.tsx": 1,
    "components/CommandPalette.tsx": 1,
    "layout/Header.tsx": 1,
    "views/ComponentComplexityView.tsx": 1,
    "views/ComponentTokensView.tsx": 1,
    "views/DeveloperView.tsx": 2,
    "views/Home.tsx": 1,
    "views/TokensPhilosophyView.tsx": 2,
    "views/TokensView.tsx": 1,
    "views/sections/PropsTable.tsx": 1,
    "views/sections/UsageExamples.tsx": 1,
    "views/sections/VariantsMatrix.tsx": 1,
  },
  pill: {
    "views/sections/VariantsMatrix.tsx": 1,
  },
};

function collectProductionTsx(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) collectProductionTsx(full, acc);
    else if (
      entry.endsWith(".tsx") &&
      !/(\.test|\.spec|smoke|diagnostic)\.tsx$/.test(entry)
    ) {
      acc.push(full);
    }
  }
  return acc;
}

function sourceFile(file: string): ts.SourceFile {
  return ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function rawControls(file: ts.SourceFile): Record<string, number> {
  const counts: Record<string, number> = {};
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file);
      if (RAW_CONTROL_TAGS.has(tag)) counts[tag] = (counts[tag] ?? 0) + 1;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return counts;
}

function literalClassTokens(node: ts.Node | undefined): string[] {
  if (!node) return [];
  const tokens: string[] = [];
  const visit = (child: ts.Node) => {
    if (
      ts.isStringLiteral(child) ||
      ts.isNoSubstitutionTemplateLiteral(child) ||
      child.kind === ts.SyntaxKind.TemplateHead ||
      child.kind === ts.SyntaxKind.TemplateMiddle ||
      child.kind === ts.SyntaxKind.TemplateTail
    ) {
      const text = (child as ts.StringLiteralLike).text;
      tokens.push(...text.split(/\s+/).filter(Boolean));
    }
    ts.forEachChild(child, visit);
  };
  visit(node);
  return tokens;
}

function classTokenCount(file: ts.SourceFile, token: string): number {
  let count = 0;
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && node.name.getText(file) === "className") {
      if (literalClassTokens(node.initializer).includes(token)) count += 1;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return count;
}

function namedDsImports(file: ts.SourceFile): string[] {
  const names: string[] = [];
  for (const statement of file.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== "@full-stack-ds/react"
    ) {
      continue;
    }
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      names.push(...bindings.elements.map((element) => element.name.text));
    }
  }
  return names;
}

function derivedRawDebt(files: string[]): Record<string, Record<string, number>> {
  return Object.fromEntries(
    files
      .map((file) => [relative(SRC, file), rawControls(sourceFile(file))] as const)
      .filter(([, tags]) => Object.keys(tags).length > 0),
  );
}

function derivedSurrogateDebt(
  files: string[],
  token: string,
): Record<string, number> {
  return Object.fromEntries(
    files
      .map((file) => [relative(SRC, file), classTokenCount(sourceFile(file), token)] as const)
      .filter(([, count]) => count > 0),
  );
}

describe("showcase dogfooding debt ratchet", () => {
  const productionFiles = collectProductionTsx(SRC);

  it("keeps every raw control explicit and prevents the accepted baseline from growing", () => {
    const expected = Object.fromEntries(
      Object.entries(RAW_CONTROL_DEBT).map(([file, entry]) => [file, entry.tags]),
    );

    expect(derivedRawDebt(productionFiles)).toEqual(expected);
    expect(
      Object.values(RAW_CONTROL_DEBT).every((entry) => entry.rationale.trim().length > 20),
    ).toBe(true);
  });

  it("keeps app-local component surrogates on an exact, burn-down-only ledger", () => {
    for (const [token, expected] of Object.entries(APP_SURROGATE_DEBT)) {
      expect(derivedSurrogateDebt(productionFiles, token), token).toEqual(expected);
    }
  });

  it("keeps migrated metadata labels on the generated Badge family", () => {
    for (const file of [
      resolve(SRC, "views/sections/Anatomy.tsx"),
      resolve(SRC, "views/sections/PropsTable.tsx"),
    ]) {
      expect(namedDsImports(sourceFile(file)), relative(SRC, file)).toContain("Badge");
    }
  });

  it("recognizes real JSX while ignoring code samples and similarly named classes", () => {
    const fixture = ts.createSourceFile(
      "fixture.tsx",
      'const sample = `<button class="panel">x</button>`; const ui = <><button className="panel panel--inset">x</button><div className="evidence-panel tokens-brand-pills" /></>;',
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    expect(rawControls(fixture)).toEqual({ button: 1 });
    expect(classTokenCount(fixture, "panel")).toBe(1);
    expect(classTokenCount(fixture, "pill")).toBe(0);
  });
});
