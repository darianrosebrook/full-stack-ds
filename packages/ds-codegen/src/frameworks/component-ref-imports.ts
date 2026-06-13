/**
 * Shared component-reference import resolution for the by-reference composition
 * capability (CODEGEN-RECURSIVE-COMPOSITION-01).
 *
 * When a contract node declares `componentRef: "fsds.<Name>"`, the IR carries
 * the bare name on `DomNodeIR.componentRef`. Each framework emitter substitutes
 * the referenced component for the node's tag AND must add an import for it.
 * This module owns the two framework-neutral pieces of that work:
 *
 *   1. collectComponentRefs — walk an IR dom tree and gather every referenced
 *      component name. Purely structural (reads `node.componentRef`), so it
 *      carries no per-component lore.
 *   2. resolveComponentRefImport — compute the relative sibling import for a
 *      reference, plus the framework-specific imported identifier. Generated
 *      components live at packages/ds-<fw>/src/components/<Name>/<Name>.<ext>;
 *      a reference from a sibling resolves to `../<Ref>/<Ref>` with the
 *      framework's module convention. This mirrors how components already
 *      import the Stack primitive by relative path — there are no self-package
 *      (`@full-stack-ds/<fw>`) imports in generated component source.
 *
 * Kebab-case selector / custom-element derivation is deliberately NOT here:
 * each emitter owns that via the shared `toKebab` (contract.ts) at its tag
 * substitution site, so a reference's selector matches exactly how the
 * referenced component defines its own selector/element name.
 */
import type { DomNodeIR } from "../ir.js";

export type EmitterFramework =
  | "react"
  | "vue"
  | "svelte"
  | "angular"
  | "lit";

/**
 * Walk a dom tree and return the set of referenced component names (bare,
 * `fsds.` already stripped by the IR builder). Returns an empty set when the
 * tree is absent or contains no references. Insertion order is deterministic
 * (depth-first, pre-order) so emitted import blocks are stable.
 */
export function collectComponentRefs(
  dom: DomNodeIR | undefined,
): string[] {
  if (!dom) return [];
  const seen = new Set<string>();
  const order: string[] = [];
  const visit = (node: DomNodeIR): void => {
    if (node.componentRef !== undefined && !seen.has(node.componentRef)) {
      seen.add(node.componentRef);
      order.push(node.componentRef);
    }
    for (const child of node.children) visit(child);
  };
  visit(dom);
  return order;
}

export interface ComponentRefImport {
  /** Bare referenced component name, e.g. "Image". */
  refName: string;
  /** The identifier the emitted code uses for the reference. */
  identifier: string;
  /** The module specifier to import from (relative sibling path). */
  specifier: string;
  /**
   * Import kind per framework idiom:
   *  - "named": `import { <identifier> } from "<specifier>"` (React/Vue/Svelte/Angular).
   *  - "side-effect": `import "<specifier>"` (Lit custom-element self-registration).
   */
  kind: "named" | "side-effect";
}

/**
 * Resolve the import a `componentRef` requires, for one framework. `hostName`
 * is the consuming component (unused for path math today because all generated
 * components are siblings under components/<Name>/, but kept in the signature
 * so a future non-sibling layout doesn't change every call site).
 */
export function resolveComponentRefImport(
  _hostName: string,
  refName: string,
  framework: EmitterFramework,
): ComponentRefImport {
  const base = `../${refName}/${refName}`;
  switch (framework) {
    case "react":
      // React imports omit the extension (matches the Stack primitive import).
      return { refName, identifier: refName, specifier: base, kind: "named" };
    case "vue":
      return {
        refName,
        identifier: refName,
        specifier: `${base}.vue`,
        kind: "named",
      };
    case "svelte":
      return {
        refName,
        identifier: refName,
        specifier: `${base}.svelte`,
        kind: "named",
      };
    case "angular":
      // Angular imports the standalone component CLASS (named <Ref>Component)
      // into both the file and the @Component imports[] array; the template
      // addresses it by selector. The generated file is <Ref>.component.ts, so
      // the specifier targets <Ref>.component.js (matching the package barrel).
      return {
        refName,
        identifier: `${refName}Component`,
        specifier: `../${refName}/${refName}.component.js`,
        kind: "named",
      };
    case "lit":
      // Lit custom elements self-register via customElements.define at module
      // load, so a side-effect import is sufficient; the template addresses
      // the element by its fsds-<kebab> custom element name.
      return {
        refName,
        identifier: refName,
        specifier: `${base}.js`,
        kind: "side-effect",
      };
  }
}

/**
 * Convenience: collect every referenced name in a dom tree and resolve each to
 * its framework import, preserving collection order.
 */
export function resolveComponentRefImports(
  hostName: string,
  dom: DomNodeIR | undefined,
  framework: EmitterFramework,
): ComponentRefImport[] {
  return collectComponentRefs(dom).map((refName) =>
    resolveComponentRefImport(hostName, refName, framework),
  );
}
