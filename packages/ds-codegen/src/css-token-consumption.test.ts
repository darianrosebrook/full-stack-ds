import { describe, expect, it } from "vitest";
import { analyzeCssTokenConsumption, cssVariableReads } from "./css-token-consumption.js";

describe("CSS token consumer closure", () => {
  it("requires a property sink, not another unused declaration", () => {
    const result = analyzeCssTokenConsumption([
      ".item { --a: var(--b); --b: 2px; --unused: var(--orphan); --orphan: 4px; padding: var(--a); }",
    ]);
    expect([...result.consumed].sort()).toEqual(["--a", "--b"]);
  });
  it("finds nested fallback reads and consumers in keyframes and imported sheets", () => {
    const result = analyzeCssTokenConsumption([
      ".item { --a: var(--semantic, var(--fallback)); --fallback: 2px; }",
      "@keyframes fade { to { opacity: var(--a, var(--optional, 1)); } }",
    ]);
    expect([...result.consumed].sort()).toEqual(["--a", "--fallback", "--optional", "--semantic"]);
  });
  it("does not credit strings, comments, declarations or similarly named functions", () => {
    expect(cssVariableReads('"var(--string)" /* var(--comment) */ foovar(--fake) var(/* note */ --real, var(--nested))')).toEqual(["--real", "--nested"]);
    expect([...analyzeCssTokenConsumption(['.x { --only: 1px; content: "var(--only)"; }']).consumed]).toEqual([]);
  });
  it("reports self-reference and disconnected alias cycles", () => {
    const result = analyzeCssTokenConsumption(['.x { --self: var(--self); --a: var(--b); --b: var(--a); }']);
    expect(result.cycles).toEqual([["--self", "--self"], ["--a", "--b", "--a"]]);
    expect([...result.consumed]).toEqual([]);
  });
  it("reports reachable cycles too, even if a property has a fallback", () => {
    const result = analyzeCssTokenConsumption(['.x { --a: var(--b); --b: var(--a); color: var(--a, red); }']);
    expect(result.cycles).toEqual([["--a", "--b", "--a"]]);
  });
});
