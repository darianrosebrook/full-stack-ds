/**
 * Barrel for the (future) `@full-stack-ds/jetpack-compose` package —
 * scaffold.
 *
 * Kotlin doesn't use barrel files. Equivalent outputs:
 *   - a generated `Components.kt` whose contents are nothing but
 *     `typealias` re-exports (rarely useful), or
 *   - a contribution to the module's `build.gradle.kts` `sourceSets`,
 *     or
 *   - no barrel at all — consumers import each component from its own
 *     fully-qualified package (`com.fullstackds.button.Button`).
 *
 * The signature matches the other emitters so the factory contract is
 * uniform; the body is left to whoever wires up the Gradle module.
 */

export function generateJetpackComposeBarrel(
  _componentNames: string[],
  _componentsRoot?: string,
): string {
  throw new Error(
    "generateJetpackComposeBarrel: not implemented — Jetpack Compose emitter is scaffold-only.",
  );
}
