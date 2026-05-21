/**
 * Barrel for the (future) `@full-stack-ds/swiftui` package — scaffold.
 *
 * Swift modules don't use barrel files the way JS does: `@_exported import`
 * exists but is rarely idiomatic. More likely outputs:
 *   - a generated `Components.swift` that `@_exported import`s each
 *     component module, or
 *   - a generated `Package.swift` `targets` array contribution.
 *
 * The signature matches the other emitters so the factory contract is
 * uniform; the body is left to whoever wires up the workspace.
 */

export function generateSwiftUIBarrel(
  _componentNames: string[],
  _componentsRoot?: string,
): string {
  throw new Error(
    "generateSwiftUIBarrel: not implemented — Swift emitter is scaffold-only.",
  );
}
