import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BUILTIN_TARGET_PACKS } from "../target-packs/builtin.js";

// Guard against component-name product lore in builtin target
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
// This test fails if it sees a predicate against a name in the live component
// contract corpus in any builtin emitter
// source. The scan set comes from the builtin target registry: an explicit-only
// target is still governed by the semantic-authority doctrine, and a newly
// registered builtin cannot enter through an unscanned directory. New
// violations have to either be rewritten as structural IR
// reads or, if genuinely realization-level, refactored to dispatch on an
// IR flag rather than the component name.

// Patterns that indicate component-name lore. We catch the common
// shapes that appeared in the historical violations:
//   - `name === "Tabs"` (destructured from ir)
//   - `ir.name === "Tabs"`
//   - `component.name === "Modal"`
//   - `contract.name === "Foo"`
// The string side must name a contract in the live corpus, so platform
// vocabulary like `ReactNode` and attribute renames like `htmlFor` pass.
const COMPONENT_NAME_LORE_PATTERNS: RegExp[] = [
  /\b(?:ir|component|contract)\.name\s*===\s*["']([A-Z][a-zA-Z0-9]*)["']/,
  /(?<![\w.])name\s*===\s*["']([A-Z][a-zA-Z0-9]*)["']/,
  /\b(?:componentRef|ref)\s*===\s*["']([A-Z][a-zA-Z0-9]*)["']/,
  /["']([A-Z][a-zA-Z0-9]*)["']\s*===\s*(?:\b(?:ir|component|contract)\.name|(?<![\w.])name\b|(?:\b[A-Za-z_$][\w$]*\.)?componentRef\b|\bref\b)/,
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
      const match = pattern.exec(line);
      if (match) {
        const literal = match[1];
        if (!literal || !COMPONENT_NAMES.has(literal)) continue;
        out.push({ line: i + 1, text: line.trim(), pattern });
      }
    }
  }
  return out;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const COMPONENTS_ROOT = path.join(
  REPO_ROOT,
  "packages/ds-contracts/components",
);

const COMPONENT_NAMES = new Set(
  fs.readdirSync(COMPONENTS_ROOT, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        fs.existsSync(
          path.join(COMPONENTS_ROOT, entry.name, `${entry.name}.contract.json`),
        ),
    )
    .map((entry) => entry.name),
);

const BUILTIN_EMITTERS = Object.values(BUILTIN_TARGET_PACKS).map((pack) => ({
  id: pack.target.id,
  root: path.dirname(path.resolve(REPO_ROOT, pack.entrypoints.emitter)),
}));

describe("builtin target emitters contain no component-name lore", () => {
  it("recognizes host-name and referenced-component predicates without flagging platform types", () => {
    expect(
      COMPONENT_NAMES.size,
      "component-name authority must not be empty",
    ).toBeGreaterThan(0);
    expect(findViolations('if (ir.name === "Tabs") emitTabs();')).toHaveLength(1);
    expect(findViolations('if (ref === "Button") emitAction();')).toHaveLength(1);
    expect(findViolations('if ("Image" === node.componentRef) emitMedia();')).toHaveLength(1);
    expect(findViolations('if (ref === "ReactNode") emitType();')).toHaveLength(0);
  });

  for (const emitter of BUILTIN_EMITTERS) {
    it(`${emitter.id}/ has no per-component-name predicates`, () => {
      const root = emitter.root;
      const files = walk(root);
      expect(
        files.length,
        `${emitter.id} emitter scan must not be vacuous`,
      ).toBeGreaterThan(0);
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
          .map((v) => `  ${emitter.id}/${v.file}:${v.line}  ${v.text}`)
          .join("\n");
        throw new Error(
          `Component-name lore found in builtin ${emitter.id} emitter ` +
            `(${allViolations.length} violation(s)). Move the per-component ` +
            `branch to a structural IR fact and dispatch on that instead.\n` +
            summary,
        );
      }
      expect(allViolations).toHaveLength(0);
    });
  }
});
