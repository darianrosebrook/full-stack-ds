import type { ComponentIR } from "../ir.js";

/** Literal arguments in calls owned by native emitters. Comments and strings
 * containing example code are tokens, never executable call sites. The small
 * scanner handles the emitted Swift/Kotlin subset, including when branches. */
export function nativeSlotArguments(source: string, functions: readonly string[]): Set<string> {
  const tokens = nativeSourceTokens(source);
  const reads = new Set<string>();
  for (let i = 0; i < tokens.length; i++) {
    if (!functions.includes(tokens[i]!) || tokens[i + 1] !== "(") continue;
    let depth = 1;
    for (let j = i + 2; j < tokens.length && depth > 0; j++) {
      const token = tokens[j]!;
      if (token === "(") depth++;
      if (token === ")") depth--;
      if (token.startsWith('"')) reads.add(JSON.parse(token) as string);
    }
  }
  return reads;
}

/** Project the backend's actual lookups, retaining variant definitions of each
 * used name. A token definition or disconnected alias is never a root. */
export function nativeTokenScopes(ir: ComponentIR, names: ReadonlySet<string>, suffixes = false) {
  const used = new Set(ir.tokenScopes.flatMap(scope => scope.values)
    .filter(value => [...names].some(name => suffixes ? value.name.endsWith(name) : value.name === name))
    .map(value => value.name));
  let changed = true;
  while (changed) {
    changed = false;
    for (const scope of ir.tokenScopes) for (const value of scope.values) {
      if (used.has(value.name) && value.resolvesTo && !used.has(value.resolvesTo)) {
        used.add(value.resolvesTo);
        changed = true;
      }
    }
  }
  return ir.tokenScopes.map(scope => ({ ...scope,
    values: scope.values.filter(value => used.has(value.name)),
  })).filter(scope => scope.values.length > 0);
}

function nativeSourceTokens(source: string) {
  return [...source.matchAll(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\])*"|[A-Za-z_][\w]*|[^\s]/g)]
    .map(match => match[0]).filter(token => !token.startsWith("//") && !token.startsWith("/*"));
}

/** Definition keys in the native emitters' owned dictionary syntax. */
export function nativeTokenDefinitionNames(source: string): Set<string> {
  const tokens = nativeSourceTokens(source);
  const names = new Set<string>();
  for (let i = 0; i < tokens.length - 3; i++) {
    if (tokens[i]!.startsWith('"') && [":", "to"].includes(tokens[i + 1]!) &&
        ["FsdsComponentTokenDefinition", "ComponentTokenDefinition"].includes(tokens[i + 2]!) && tokens[i + 3] === "(") {
      names.add(JSON.parse(tokens[i]!) as string);
    }
  }
  return names;
}
