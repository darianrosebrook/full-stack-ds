/**
 * Strip and rewrite imports in generated component source so it runs inside a
 * sandbox iframe without needing the source repository's module layout. Each
 * framework has a slightly different style of import we need to handle.
 *
 * Strategy: we don't try to support every transitive import. We strip CSS
 * imports (we inject CSS as a <style> tag), drop primitive-package imports we
 * don't need for the demo, and leave bare specifiers like "react", "vue",
 * "lit" alone so the iframe's import map can resolve them.
 */

export function rewriteReactSource(src: string): string {
  return src
    // Drop side-effect CSS imports — we inject the CSS via <style>.
    .replace(/^\s*import\s+["'][^"']+\.css["'];?\s*$/gm, "")
    // Drop primitive imports for now (Stack etc.) — many demos don't need them
    // because the component itself is the leaf we're rendering. If a component
    // references Stack at runtime, the harness will error visibly, which is
    // honest behavior we can iterate on.
    .replace(/^\s*import\s+\{[^}]+\}\s+from\s+["']\.\.\/\.\.\/primitives[^"']*["'];?\s*$/gm, "")
    .replace(/^\s*import\s+\w+\s+from\s+["']\.\.\/\.\.\/primitives[^"']*["'];?\s*$/gm, "");
}

export function rewriteVueSource(src: string): string {
  return src
    .replace(/^\s*import\s+["'][^"']+\.css["'];?\s*$/gm, "")
    .replace(/^\s*import\s+\w+\s+from\s+["']\.\.\/\.\.\/primitives[^"']*["'];?\s*$/gm, "");
}

export function rewriteSvelteSource(src: string): string {
  return src
    .replace(/^\s*import\s+["'][^"']+\.css["'];?\s*$/gm, "")
    .replace(/^\s*import\s+\w+\s+from\s+["']\.\.\/\.\.\/primitives[^"']*["'];?\s*$/gm, "");
}

export function rewriteLitSource(src: string): string {
  return src.replace(/^\s*import\s+\w+\s+from\s+["']\.\.\/\.\.\/primitives[^"']*["'];?\s*$/gm, "");
}

export function rewriteAngularSource(src: string): string {
  return src
    .replace(/^\s*import\s+["'][^"']+\.css["'];?\s*$/gm, "")
    .replace(/^\s*import\s+\w+\s+from\s+["']\.\.\/\.\.\/primitives[^"']*["'];?\s*$/gm, "");
}
