/**
 * Barrel for the (future) `@full-stack-ds/uikit` package — scaffold.
 *
 * UIKit modules don't use barrel files the way JS does. More likely
 * outputs:
 *   - a generated `Components.swift` that `@_exported import`s each
 *     component module, or
 *   - a generated contribution to `Package.swift`'s `targets` array.
 *
 * The signature matches the other emitters so the factory contract is
 * uniform; the body is left to whoever wires up the workspace.
 */

export function generateUIKitBarrel(
  _componentNames: string[],
  _componentsRoot?: string,
): string {
  throw new Error(
    "generateUIKitBarrel: not implemented — Swift emitter is scaffold-only.",
  );
}
