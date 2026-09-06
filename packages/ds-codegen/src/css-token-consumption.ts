import postcss from "postcss";

/** Custom-property references outside comments and quoted CSS strings. */
export function cssVariableReads(value: string): string[] {
  const unquoted = value.replace(/\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, " ");
  return [...unquoted.matchAll(/(?<![\w-])var\(\s*(--[A-Za-z0-9_-]+)/gi)].map(match => match[1]!);
}

export interface CssTokenConsumption {
  declarations: Map<string, Set<string>>;
  /** Variables reached from actual CSS properties, including fallback branches. */
  consumed: Set<string>;
  /** Direct CSS property consumers, before following declaration dependencies. */
  roots: Set<string>;
  cycles: string[][];
}

/** A declaration is live only when a path leads from a real CSS property to it. */
export function analyzeCssTokenConsumption(sheets: readonly string[]): CssTokenConsumption {
  const declarations = new Map<string, Set<string>>();
  const roots = new Set<string>();
  for (const sheet of sheets) {
    postcss.parse(sheet).walkDecls(declaration => {
      const reads = cssVariableReads(declaration.value);
      if (declaration.prop.startsWith("--")) {
        const dependencies = declarations.get(declaration.prop) ?? new Set<string>();
        reads.forEach(name => dependencies.add(name));
        declarations.set(declaration.prop, dependencies);
      } else {
        reads.forEach(name => roots.add(name));
      }
    });
  }
  const consumed = new Set<string>();
  const pending = [...roots];
  while (pending.length) {
    const name = pending.pop()!;
    if (consumed.has(name)) continue;
    consumed.add(name);
    pending.push(...(declarations.get(name) ?? []));
  }
  const cycles: string[][] = [];
  const completed = new Set<string>();
  const active: string[] = [];
  function visit(name: string) {
    const start = active.indexOf(name);
    if (start >= 0) { cycles.push([...active.slice(start), name]); return; }
    if (completed.has(name)) return;
    active.push(name);
    for (const dependency of declarations.get(name) ?? []) visit(dependency);
    active.pop();
    completed.add(name);
  }
  for (const name of declarations.keys()) visit(name);
  return { declarations, roots, consumed, cycles };
}

/** Remove declarations absent from the consumed closure; preserve real properties. */
export function onlyConsumedDeclarations<T extends { declarations: Record<string, string> }>(
  blocks: readonly T[], consumed: ReadonlySet<string>,
): T[] {
  return blocks.map(block => ({ ...block, declarations: Object.fromEntries(
    Object.entries(block.declarations).filter(([name]) => !name.startsWith("--") || consumed.has(name)),
  ) }));
}
