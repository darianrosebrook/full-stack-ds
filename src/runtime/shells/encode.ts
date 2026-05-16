/**
 * Encode a source string for safe interpolation into a template literal that
 * is itself emitted as the body of an inline `<script>` inside an iframe
 * srcdoc. Two distinct escaping concerns:
 *
 *  1. JS template-literal context. JSON.stringify handles `\n`, `"`, and
 *     backslashes — but it leaves `${` and backticks untouched. When the
 *     resulting `"..."` JS string is spliced into the outer template literal
 *     used by the shell builders, an unescaped `${` triggers interpolation
 *     in the *outer* literal, corrupting everything past that point.
 *
 *  2. HTML `<script>` element context. The HTML parser terminates a script
 *     element at the first literal `</script>` it sees — even inside a JS
 *     string literal. Embedded Vue/Svelte SFCs contain `</script>` as part
 *     of their `<script setup>...</script>` blocks, which would end the
 *     outer iframe `<script type="module">` block prematurely, leaving the
 *     rest of the boot code as inert HTML and the iframe silently dead.
 *
 * Fix both: JSON.stringify, then post-escape `${`, backticks, and the
 * `</` byte sequence (only when it precedes `script`, but escaping all `</`
 * is harmless and simpler — it produces `</` which is valid JS).
 */
export function jsLiteral(source: string): string {
  const json = JSON.stringify(source);
  return json
    .replace(/\$\{/g, "\\u0024{")
    .replace(/`/g, "\\u0060")
    .replace(/<\/(script|style)/gi, "<\\/$1");
}
