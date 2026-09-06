import ts from "typescript";
import type { ComponentIR } from "../../ir.js";

export interface NativeTokenRead { scope: string; name: string }

/** The native backend owns this syntax: tokens.<scope>?.["slot"]. */
export function reactNativeTokenReads(sources: readonly string[]): NativeTokenRead[] {
  const reads = new Map<string, NativeTokenRead>();
  for (const source of sources) {
    const ast = ts.createSourceFile("component.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node: ts.Node) {
      if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression) &&
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) && node.expression.expression.text === "tokens") {
        const read = { scope: node.expression.name.text, name: node.argumentExpression.text };
        reads.set(`${read.scope}\0${read.name}`, read);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  return [...reads.values()];
}

/** Keep the referenced scope values and their component-local resolution dependencies. */
export function consumedNativeTokenScopes(ir: ComponentIR, reads: readonly NativeTokenRead[]) {
  const used = new Set(reads.map(read => `${read.scope}\0${read.name}`));
  let changed = true;
  while (changed) {
    changed = false;
    for (const scope of ir.tokenScopes) for (const value of scope.values) {
      if (!used.has(`${scope.scope}\0${value.name}`) || !value.resolvesTo) continue;
      for (const candidate of ir.tokenScopes) for (const dependency of candidate.values) {
        const key = `${candidate.scope}\0${dependency.name}`;
        if (dependency.name === value.resolvesTo && !used.has(key)) { used.add(key); changed = true; }
      }
    }
  }
  return ir.tokenScopes.map(scope => ({ ...scope,
    values: scope.values.filter(value => used.has(`${scope.scope}\0${value.name}`)),
  })).filter(scope => scope.values.length > 0);
}

/** Data keys are separate from call-site reads; parsing ignores examples/comments. */
export function reactNativeTokenDefinitionNames(source: string): Set<string> {
  const ast = ts.createSourceFile("tokens.ts", source, ts.ScriptTarget.Latest, true);
  const names = new Set<string>();
  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && node.name.getText(ast) === "name" && ts.isStringLiteral(node.initializer)) {
      names.add(node.initializer.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return names;
}
