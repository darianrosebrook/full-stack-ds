import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "..");
const RAW_CONTROL_TAGS = new Set([
  "pre",
  "button",
  "details",
  "input",
  "select",
  "summary",
  "textarea",
]);

const RETIRED_APP_CLASSES = ["panel", "pill", "code-block"];

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

function rawControlSites(files: string[]): Record<string, Record<string, number>> {
  return Object.fromEntries(
    files
      .map((file) => [relative(SRC, file), rawControls(sourceFile(file))] as const)
      .filter(([, tags]) => Object.keys(tags).length > 0),
  );
}

function surrogateSites(
  files: string[],
  token: string,
): Record<string, number> {
  return Object.fromEntries(
    files
      .map((file) => [relative(SRC, file), classTokenCount(sourceFile(file), token)] as const)
      .filter(([, count]) => count > 0),
  );
}

describe("showcase component consumption", () => {
  const productionFiles = collectProductionTsx(SRC);

  it("uses generated components for every control with no raw-site allowances", () => {
    expect(rawControlSites(productionFiles)).toEqual({});
  });

  it("rejects retired app-local component surrogates", () => {
    for (const token of RETIRED_APP_CLASSES) {
      expect(surrogateSites(productionFiles, token), token).toEqual({});
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
      'const sample = `<button class="panel">x</button>`; const ui = <><button className="panel panel--inset">x</button><div className="evidence-panel tokens-brand-pills" /><pre>source</pre></>;',
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    expect(rawControls(fixture)).toEqual({ button: 1, pre: 1 });
    expect(classTokenCount(fixture, "panel")).toBe(1);
    expect(classTokenCount(fixture, "pill")).toBe(0);
  });
});
