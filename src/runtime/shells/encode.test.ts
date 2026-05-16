import { describe, it, expect } from "vitest";
import { jsLiteral } from "./encode";

describe("jsLiteral", () => {
  it("produces a valid JS string literal that evaluates back to the original", () => {
    const input = 'hello "world"\n\tline2';
    const encoded = jsLiteral(input);
    // eslint-disable-next-line no-eval -- intentional: we are testing JS literal encoding
    const roundTripped = eval(encoded);
    expect(roundTripped).toBe(input);
  });

  it("escapes `${` so outer template-literal context cannot interpolate it", () => {
    // The historical bug: a generated source containing `${foo}` would, when
    // spliced into an outer template literal via the shell builders, be
    // re-evaluated as template interpolation and corrupt the surrounding JS.
    const input = "const s = `prefix-${value}`;";
    const encoded = jsLiteral(input);
    // The literal `${` MUST NOT appear in the output — only its escaped form.
    expect(encoded).not.toMatch(/\$\{/);
    expect(encoded).toContain("\\u0024{");
    // And it should still round-trip.
    expect(eval(encoded)).toBe(input);
  });

  it("escapes backticks for the same reason", () => {
    const input = "const x = `tagged`;";
    const encoded = jsLiteral(input);
    // Backticks must not appear unescaped.
    expect(encoded).not.toMatch(/(?<!\\)`/);
    expect(eval(encoded)).toBe(input);
  });

  it("escapes </script> so an HTML parser cannot terminate the outer <script> block", () => {
    // The Vue/Svelte SFC embedding bug: a `<script setup>...</script>` payload
    // dropped into an outer `<script type="module">` would be cut short at the
    // first inner `</script>`, leaving the rest of the boot code as inert HTML
    // and the iframe silently dead.
    const input = '<script setup lang="ts">\nimport x from "y";\n</script>';
    const encoded = jsLiteral(input);
    // The dangerous sequence must be escaped — the test simulates the HTML
    // parser's lookbehind by checking that the literal byte sequence is not
    // present (anywhere) in the encoded output.
    expect(encoded.toLowerCase()).not.toContain("</script");
    expect(encoded).toContain("<\\/script");
    expect(eval(encoded)).toBe(input);
  });

  it("escapes </style> the same way (defensive — embedded CSS contexts)", () => {
    const input = "<style>p { color: red; }</style>";
    const encoded = jsLiteral(input);
    expect(encoded.toLowerCase()).not.toContain("</style");
    expect(encoded).toContain("<\\/style");
    expect(eval(encoded)).toBe(input);
  });

  it("handles a realistic Vue SFC with template-literal class strings and a </script> tag", () => {
    // This is the exact combination that broke before all three escapes were
    // in place. Asserting it as one fixture protects against partial-fix
    // regressions.
    const sfc = `<script setup lang="ts">
const cls = \`button--\${size}\`;
</script>
<template>
  <button :class="cls" />
</template>`;
    const encoded = jsLiteral(sfc);
    expect(encoded.toLowerCase()).not.toContain("</script");
    expect(encoded).not.toMatch(/\$\{/);
    expect(encoded).not.toMatch(/(?<!\\)`/);
    expect(eval(encoded)).toBe(sfc);
  });

  it("is a no-op for plain ASCII text with no special sequences", () => {
    const input = "just some plain text";
    expect(eval(jsLiteral(input))).toBe(input);
  });

  it("preserves unicode characters", () => {
    const input = "emoji 🚀 and accents é à";
    expect(eval(jsLiteral(input))).toBe(input);
  });
});
