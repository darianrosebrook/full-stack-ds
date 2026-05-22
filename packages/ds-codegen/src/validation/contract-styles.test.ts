/**
 * Tests for validateContractEmittedStyles — the styles-region drift
 * validator added under PLAN-TOKENS-STYLES-CONVERGENCE-001 to close
 * the asymmetric-proof gap (tokens-region was admission-locked;
 * styles-region had only IR unit tests).
 *
 * Test strategy: write real fixture files under a tmp directory and
 * point the validator at it via `_setRepoRootForTests`. Each test
 * uses a unique component name so concurrent runs don't collide.
 *
 * Cases covered (from the user's acceptance criteria):
 *   1. Matching styles region passes.
 *   2. Changed declaration fails with first-diff hint.
 *   3. Missing @generated:start styles fails.
 *   4. Malformed markers fail.
 *   5. @custom overrides don't affect check.
 *   6. Cross-framework divergence fails once, not five times.
 *   7. Missing file fails with regen instruction.
 *
 * Plus an "exercise the convergence-critical features" fixture that
 * uses root literals, part consumers, and a :has(...) compound
 * selector — the three new behaviors that didn't exist before.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { emitCss } from "../css.js";
import {
  validateContractEmittedStyles,
  _setRepoRootForTests,
} from "./contract-styles.js";

const FRAMEWORKS = ["react", "vue", "svelte", "angular", "lit"] as const;

/**
 * Switch-like fixture exercising the three convergence-critical
 * behaviors at once: a root literal (platforms: web), a part
 * consumer (resolvesTo a local slot), and a :has(...) compound
 * selector. If the validator passes this fixture and rejects a
 * targeted modification of any of those three, the proof covers
 * the new convergence surface.
 */
function makeFixtureContract(name: string): ComponentContract {
  return {
    name,
    cssPrefix: name.toLowerCase(),
    anatomy: { parts: ["root", "track", "input"] },
    props: { styled: { members: [] } },
    tokens: {
      [`${name.toLowerCase()}.color.track.bg`]: {
        resolvesTo: "semantic.color.background.tertiary",
        fallback: "#cecece",
      },
    },
    styles: {
      root: {
        display: { literal: "inline-flex", platforms: ["web"] },
      },
      track: {
        "background-color": {
          resolvesTo: `${name.toLowerCase()}.color.track.bg`,
        },
      },
      [`:has(.${name.toLowerCase()}__input:checked) .${name.toLowerCase()}__track`]: {
        "background-color": {
          resolvesTo: `${name.toLowerCase()}.color.track.bg`,
        },
      },
    },
  } as ComponentContract;
}

interface TmpFixture {
  root: string;
  componentName: string;
  /** Path to `<Component>.css` under the given framework. */
  cssPath(fw: (typeof FRAMEWORKS)[number]): string;
  cleanup(): void;
}

function setupTmpFixture(componentName: string, fileContent: string): TmpFixture {
  const root = mkdtempSync(join(tmpdir(), "fsds-validator-"));
  for (const fw of FRAMEWORKS) {
    const dir = join(root, "packages", `ds-${fw}`, "src", "components", componentName);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${componentName}.css`), fileContent);
  }
  _setRepoRootForTests(root);
  return {
    root,
    componentName,
    cssPath(fw) {
      return join(root, "packages", `ds-${fw}`, "src", "components", componentName, `${componentName}.css`);
    },
    cleanup() {
      _setRepoRootForTests(undefined);
      rmSync(root, { recursive: true, force: true });
    },
  };
}

/**
 * Return what the codegen would emit right now for this contract,
 * matching the validator's own `emitCss(buildComponentIR(...))` path.
 */
function expectedCssFor(contract: ComponentContract): string {
  return emitCss(buildComponentIR(contract));
}

describe("validateContractEmittedStyles — case 1: matching styles region passes", () => {
  let fixture: TmpFixture;
  let contract: ComponentContract;

  beforeEach(() => {
    contract = makeFixtureContract("TestStylesMatch");
    fixture = setupTmpFixture(contract.name, expectedCssFor(contract));
  });
  afterEach(() => fixture.cleanup());

  it("returns zero issues when on-disk styles region byte-matches the expected emit", () => {
    expect(validateContractEmittedStyles(contract)).toEqual([]);
  });
});

describe("validateContractEmittedStyles — case 2: changed declaration fails with first-diff hint", () => {
  let fixture: TmpFixture;
  let contract: ComponentContract;

  beforeEach(() => {
    contract = makeFixtureContract("TestStylesChanged");
    // Hand-edit ONE declaration in the styles region. Validator must
    // catch it and the diff hint should name the changed line.
    const canonical = expectedCssFor(contract);
    const tampered = canonical.replace("inline-flex", "PROBE_BROKEN");
    expect(tampered).not.toBe(canonical);
    fixture = setupTmpFixture(contract.name, tampered);
  });
  afterEach(() => fixture.cleanup());

  it("flags every framework whose styles region differs and includes the first-diff hint", () => {
    const issues = validateContractEmittedStyles(contract);
    // 5 frameworks were all tampered identically. Each emits a per-fw
    // diagnostic. Cross-framework divergence does NOT trigger because
    // all 5 observations are identical (just identically-tampered).
    const perFw = issues.filter((i) =>
      i.message.includes("@generated:start styles region does not match"),
    );
    expect(perFw).toHaveLength(5);
    for (const issue of perFw) {
      expect(issue.pointer).toBe("/styles");
      expect(issue.message).toContain("First diff at line");
      expect(issue.message).toContain("inline-flex");
      expect(issue.message).toContain("PROBE_BROKEN");
    }
  });
});

describe("validateContractEmittedStyles — case 3: missing @generated:start styles section fails", () => {
  let fixture: TmpFixture;
  let contract: ComponentContract;

  beforeEach(() => {
    contract = makeFixtureContract("TestStylesNoSection");
    // File exists but has no @generated:start styles markers at all.
    fixture = setupTmpFixture(
      contract.name,
      "/* a CSS file that forgot the markers */\n.foo { color: red; }\n",
    );
  });
  afterEach(() => fixture.cleanup());

  it("reports 'missing @generated:start styles region' per framework", () => {
    const issues = validateContractEmittedStyles(contract);
    expect(issues).toHaveLength(5);
    for (const issue of issues) {
      expect(issue.pointer).toBe("/styles");
      expect(issue.message).toContain("missing the @generated:start styles region");
    }
  });
});

describe("validateContractEmittedStyles — case 4: malformed preservation markers fail", () => {
  let fixture: TmpFixture;
  let contract: ComponentContract;

  beforeEach(() => {
    contract = makeFixtureContract("TestStylesMalformed");
    // Unmatched marker: start present, end missing. splitSections
    // should throw or surface this as a markers-malformed condition.
    fixture = setupTmpFixture(
      contract.name,
      "/* @generated:start styles */\n.foo { color: red; }\n/* no end marker */\n",
    );
  });
  afterEach(() => fixture.cleanup());

  it("either reports malformed markers OR reports missing section — both are valid failure modes for unbalanced markers", () => {
    const issues = validateContractEmittedStyles(contract);
    expect(issues.length).toBeGreaterThanOrEqual(5);
    // Either path is acceptable; the spec just requires that unbalanced
    // markers don't slip through silently.
    for (const issue of issues) {
      expect(issue.pointer).toBe("/styles");
      const isExpectedFailure =
        issue.message.includes("malformed preservation markers") ||
        issue.message.includes("missing the @generated:start styles region") ||
        issue.message.includes("@generated:start styles region does not match");
      expect(isExpectedFailure).toBe(true);
    }
  });
});

describe("validateContractEmittedStyles — case 5: @custom overrides do not affect the check", () => {
  let fixture: TmpFixture;
  let contract: ComponentContract;

  beforeEach(() => {
    contract = makeFixtureContract("TestStylesCustom");
    // Canonical emit + designer-authored overrides inside the @custom
    // region. The validator must IGNORE the custom region.
    const canonical = expectedCssFor(contract);
    const customized = canonical.replace(
      "/* @custom:start overrides */\n\n/* @custom:end */",
      "/* @custom:start overrides */\n.testStylesCustom { color: hotpink !important; }\n/* @custom:end */",
    );
    expect(customized).not.toBe(canonical);
    fixture = setupTmpFixture(contract.name, customized);
  });
  afterEach(() => fixture.cleanup());

  it("returns zero issues — content inside @custom:start overrides is designer surface, not validated", () => {
    expect(validateContractEmittedStyles(contract)).toEqual([]);
  });
});

describe("validateContractEmittedStyles — case 6: cross-framework divergence fails once, not five times", () => {
  let fixture: TmpFixture;
  let contract: ComponentContract;

  beforeEach(() => {
    contract = makeFixtureContract("TestStylesCrossFw");
    const canonical = expectedCssFor(contract);
    // 4 frameworks get the canonical emit (passing); 1 framework
    // (react) gets a tampered version. Per-fw issue: 1 (react).
    // Cross-fw issue: 1 (one signal per contract).
    fixture = setupTmpFixture(contract.name, canonical);
    const tamperedReact = canonical.replace("inline-flex", "PROBE_BROKEN");
    writeFileSync(fixture.cssPath("react"), tamperedReact);
  });
  afterEach(() => fixture.cleanup());

  it("emits exactly 1 per-framework issue and exactly 1 cross-framework issue", () => {
    const issues = validateContractEmittedStyles(contract);
    const perFw = issues.filter((i) =>
      i.message.includes("@generated:start styles region does not match"),
    );
    const crossFw = issues.filter((i) =>
      i.message.includes("cross-framework drift"),
    );
    expect(perFw).toHaveLength(1);
    expect(perFw[0].message).toContain("react:");
    expect(crossFw).toHaveLength(1);
  });
});

describe("validateContractEmittedStyles — case 7: missing file fails with regen instruction", () => {
  let fixture: TmpFixture;
  let contract: ComponentContract;

  beforeEach(() => {
    contract = makeFixtureContract("TestStylesMissingFile");
    // Set up tmp root WITHOUT writing the css files. Validator should
    // report missing-file per framework.
    const root = mkdtempSync(join(tmpdir(), "fsds-validator-"));
    _setRepoRootForTests(root);
    fixture = {
      root,
      componentName: contract.name,
      cssPath: () => "",
      cleanup() {
        _setRepoRootForTests(undefined);
        rmSync(root, { recursive: true, force: true });
      },
    };
  });
  afterEach(() => fixture.cleanup());

  it("reports per-framework missing-file with regen instruction", () => {
    const issues = validateContractEmittedStyles(contract);
    expect(issues).toHaveLength(5);
    for (const issue of issues) {
      expect(issue.pointer).toBe("/styles");
      expect(issue.message).toContain(`${contract.name}.css missing`);
      expect(issue.message).toContain("pnpm run generate");
    }
  });
});

describe("validateContractEmittedStyles — convergence-critical surface coverage", () => {
  let fixture: TmpFixture;
  let contract: ComponentContract;

  beforeEach(() => {
    contract = makeFixtureContract("TestConvergenceSurface");
    fixture = setupTmpFixture(contract.name, expectedCssFor(contract));
  });
  afterEach(() => fixture.cleanup());

  it("the canonical fixture exercises root literal + part consumer + :has() compound (smoke)", () => {
    const canonical = expectedCssFor(contract);
    // Sanity-check the fixture actually exercises all three behaviors.
    expect(canonical).toContain("inline-flex"); // root literal
    expect(canonical).toContain("var(--fsds-testconvergencesurface-color-track-bg)"); // part consumer
    expect(canonical).toContain(":has(.testconvergencesurface__input:checked)"); // compound
    // And the validator agrees the on-disk file matches.
    expect(validateContractEmittedStyles(contract)).toEqual([]);
  });

  it("breaking the part consumer alone fails the validator", () => {
    const canonical = expectedCssFor(contract);
    const tampered = canonical.replace(
      "var(--fsds-testconvergencesurface-color-track-bg)",
      "var(--fsds-PROBE_BROKEN_SLOT)",
    );
    expect(tampered).not.toBe(canonical);
    for (const fw of FRAMEWORKS) {
      writeFileSync(fixture.cssPath(fw), tampered);
    }
    const issues = validateContractEmittedStyles(contract);
    expect(issues.length).toBeGreaterThanOrEqual(5);
    expect(issues.some((i) => i.message.includes("PROBE_BROKEN_SLOT"))).toBe(true);
  });

  it("breaking the :has() compound selector alone fails the validator", () => {
    const canonical = expectedCssFor(contract);
    const tampered = canonical.replace(
      ":has(.testconvergencesurface__input:checked)",
      ":has(.PROBE_BROKEN__input:checked)",
    );
    expect(tampered).not.toBe(canonical);
    for (const fw of FRAMEWORKS) {
      writeFileSync(fixture.cssPath(fw), tampered);
    }
    const issues = validateContractEmittedStyles(contract);
    expect(issues.length).toBeGreaterThanOrEqual(5);
    expect(issues.some((i) => i.message.includes("PROBE_BROKEN"))).toBe(true);
  });
});

describe("validateContractEmittedStyles — empty-styles contract still validates", () => {
  let fixture: TmpFixture;
  let contract: ComponentContract;

  beforeEach(() => {
    // Tokens-only contract: emitCss produces an empty styles region.
    // The validator should still check that on-disk matches (empty
    // expected → empty observed). Smuggling declarations into an
    // otherwise-empty styles region must be caught.
    contract = {
      name: "TestStylesEmpty",
      cssPrefix: "test-styles-empty",
      anatomy: { parts: ["root"] },
      props: { styled: { members: [] } },
      tokens: {
        "test-styles-empty.color.bg": {
          resolvesTo: "semantic.color.bg",
          fallback: "#fff",
        },
      },
    } as ComponentContract;
    fixture = setupTmpFixture(contract.name, expectedCssFor(contract));
  });
  afterEach(() => fixture.cleanup());

  it("passes when the on-disk styles region is empty as expected", () => {
    expect(validateContractEmittedStyles(contract)).toEqual([]);
  });

  it("fails when a declaration is smuggled into the otherwise-empty styles region", () => {
    const canonical = expectedCssFor(contract);
    // Inject a single line into the empty generated styles region.
    const tampered = canonical.replace(
      "/* @generated:start styles */\n",
      "/* @generated:start styles */\n.test-styles-empty { color: red; }\n",
    );
    expect(tampered).not.toBe(canonical);
    for (const fw of FRAMEWORKS) {
      writeFileSync(fixture.cssPath(fw), tampered);
    }
    const issues = validateContractEmittedStyles(contract);
    expect(issues.length).toBeGreaterThanOrEqual(5);
    expect(
      issues.some((i) => i.message.includes("@generated:start styles region does not match")),
    ).toBe(true);
  });
});
