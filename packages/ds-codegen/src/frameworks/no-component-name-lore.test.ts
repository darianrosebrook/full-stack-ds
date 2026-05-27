import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Guard against component-name product lore in admitted framework
// emitters. The project's central authority claim is "contract owns
// component semantics; IR owns normalized facts; emitters only realize."
// A literal like `name === "Tabs"` or `component.name === "Modal"` in an
// emitter encodes product knowledge in the wrong layer — what should be
// a structural IR fact has leaked into per-target lowering.
//
// Allowed: realization-syntax mappings (e.g. HTML attribute renames like
// `name === "for" => "htmlFor"`) where the matched string is a DOM /
// platform identifier, not a component or contract name. Those are
// platform vocabulary, not product lore.
//
// This test fails if it sees a component-name predicate (uppercase first
// letter, idiomatic PascalCase component name) in any admitted emitter
// source. New violations have to either be rewritten as structural IR
// reads or, if genuinely realization-level, refactored to dispatch on an
// IR flag rather than the component name.

const ADMITTED_FRAMEWORKS = ["react", "vue", "svelte", "angular", "lit"];

// Patterns that indicate component-name lore. We catch the common
// shapes that appeared in the historical violations:
//   - `name === "Tabs"` (destructured from ir)
//   - `ir.name === "Tabs"`
//   - `component.name === "Modal"`
//   - `contract.name === "Foo"`
// The string side must start with an uppercase letter (PascalCase
// component name shape) so attribute-rename branches like
// `name === "htmlFor"` continue to pass.
const COMPONENT_NAME_LORE_PATTERNS: RegExp[] = [
  /\b(?:ir|component|contract)\.name\s*===\s*"[A-Z][a-zA-Z0-9]*"/,
  /(?<![\w.])name\s*===\s*"[A-Z][a-zA-Z0-9]*"/,
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".test.ts")
    ) {
      out.push(full);
    }
  }
  return out;
}

function findViolations(
  contents: string,
): { line: number; text: string; pattern: RegExp }[] {
  const lines = contents.split("\n");
  const out: { line: number; text: string; pattern: RegExp }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of COMPONENT_NAME_LORE_PATTERNS) {
      if (pattern.test(line)) {
        out.push({ line: i + 1, text: line.trim(), pattern });
      }
    }
  }
  return out;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("admitted framework emitters contain no component-name lore", () => {
  for (const framework of ADMITTED_FRAMEWORKS) {
    it(`${framework}/ has no per-component-name predicates`, () => {
      const root = path.resolve(__dirname, framework);
      const files = walk(root);
      const allViolations: { file: string; line: number; text: string }[] = [];
      for (const file of files) {
        const contents = fs.readFileSync(file, "utf-8");
        for (const v of findViolations(contents)) {
          allViolations.push({
            file: path.relative(root, file),
            line: v.line,
            text: v.text,
          });
        }
      }
      if (allViolations.length > 0) {
        const summary = allViolations
          .map((v) => `  ${framework}/${v.file}:${v.line}  ${v.text}`)
          .join("\n");
        throw new Error(
          `Component-name lore found in admitted ${framework} emitter ` +
            `(${allViolations.length} violation(s)). Move the per-component ` +
            `branch to a structural IR fact and dispatch on that instead.\n` +
            summary,
        );
      }
      expect(allViolations).toHaveLength(0);
    });
  }
});
