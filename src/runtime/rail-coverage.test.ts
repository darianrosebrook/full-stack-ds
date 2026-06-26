// Coherence guard for the committed rail-coverage projection
// (COMPONENT-EVIDENCE-RAIL-COVERAGE-BINDING-01, contract: rail-coverage-coherence).
//
// rail-coverage.ts is the in-app PROJECTION of rail coverage; the rail spec
// (e2e/runtime-rail.spec.ts) is the source of truth. This test reads the rail
// spec AS SOURCE and the Angular fixture registry, derives the asserted rail
// surface, and fails if the projection drifts from it — a component, framework,
// or non-default prop present in one but not the other is caught here, before
// the showcase can display a stale or invented coverage claim.
//
// It does NOT run Playwright and asserts nothing about last-run pass/fail —
// coverage is a property of the committed spec, not of any CI run.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  RAIL_COVERAGE,
  RAIL_DEFAULT_FRAMEWORKS,
  RAIL_NONDEFAULT_CONFIG_BUS_FRAMEWORKS,
  RAIL_NONDEFAULT_FIXTURE_FRAMEWORKS,
} from "./rail-coverage";
import { ANGULAR_NONDEFAULT_FIXTURES } from "./angular-compiler/nondefault-fixtures";

const here = path.dirname(fileURLToPath(import.meta.url));
const RAIL_SPEC_PATH = path.resolve(here, "../../e2e/runtime-rail.spec.ts");
const railSource = readFileSync(RAIL_SPEC_PATH, "utf8");

const sorted = (xs: readonly string[]): string[] => [...xs].sort();

/** Parse a `const NAME: ... = ["a", "b"]` string-array literal from the spec. */
function parseStringArrayConst(source: string, name: string): string[] {
  const m = source.match(new RegExp(`const\\s+${name}\\s*:[^=]*=\\s*\\[([^\\]]*)\\]`));
  if (!m) throw new Error(`could not find array const ${name} in rail spec`);
  return [...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((x) => x[1]);
}

/** Derive the asserted rail surface from the spec's describe-block titles. */
function parseRailSurface(source: string): {
  defaultComponents: string[];
  nonDefault: Map<string, string>; // component -> non-default prop
} {
  const defaultComponents: string[] = [];
  const nonDefault = new Map<string, string>();
  for (const m of source.matchAll(/test\.describe\(\s*["'`]([^"'`]+)["'`]/g)) {
    const title = m[1];
    const rail = title.match(/^Runtime rail\s*[—-]\s*(.+)$/);
    if (!rail) continue;
    const remainder = rail[1].trim();
    if (/^screenshot/i.test(remainder)) continue; // visual block, not a fact surface
    const comp = remainder.match(/^([A-Za-z][A-Za-z0-9]*)/);
    if (!comp) continue;
    const component = comp[1];
    const nd = remainder.match(/non-default\s+(\w+)/);
    if (nd) {
      nonDefault.set(component, nd[1]);
    } else {
      defaultComponents.push(component);
    }
  }
  return { defaultComponents, nonDefault };
}

const surface = parseRailSurface(railSource);
const specFrameworks = parseStringArrayConst(railSource, "FRAMEWORKS");
const specNonDefaultFrameworks = parseStringArrayConst(railSource, "NONDEFAULT_FRAMEWORKS");

// Runtime evidence: print the derived surface so a reader can see WHAT the
// coherence check compared, not just that it passed.
console.log(
  "\n=== rail surface derived from e2e/runtime-rail.spec.ts ===\n" +
    JSON.stringify(
      {
        defaultComponents: sorted(surface.defaultComponents),
        nonDefault: Object.fromEntries([...surface.nonDefault.entries()].sort()),
        FRAMEWORKS: specFrameworks,
        NONDEFAULT_FRAMEWORKS: specNonDefaultFrameworks,
        angularFixtures: ANGULAR_NONDEFAULT_FIXTURES.map((f) => ({
          component: f.component,
          props: Object.keys(f.props),
        })),
      },
      null,
      2,
    ),
);

describe("rail-coverage projection coherence (A2)", () => {
  it("default-fact component set matches the rail spec's default describe blocks", () => {
    const projection = RAIL_COVERAGE.map((e) => e.component);
    expect(sorted(projection)).toEqual(sorted(surface.defaultComponents));
  });

  it("every projected entry's defaultFrameworks mirror the rail FRAMEWORKS constant", () => {
    expect(sorted(RAIL_DEFAULT_FRAMEWORKS)).toEqual(sorted(specFrameworks));
    for (const entry of RAIL_COVERAGE) {
      expect(sorted(entry.defaultFrameworks)).toEqual(sorted(specFrameworks));
    }
  });

  it("non-default component+prop set matches the rail spec's non-default describe blocks", () => {
    const projectedNonDefault = new Map<string, string[]>();
    for (const e of RAIL_COVERAGE) {
      if (e.nonDefault) projectedNonDefault.set(e.component, [...e.nonDefault.props]);
    }
    // Same components carry non-default coverage.
    expect(sorted([...projectedNonDefault.keys()])).toEqual(
      sorted([...surface.nonDefault.keys()]),
    );
    // The prop the rail asserts is among the projected props for that component.
    for (const [component, prop] of surface.nonDefault) {
      expect(projectedNonDefault.get(component)).toContain(prop);
    }
  });

  it("non-default config-bus frameworks mirror the rail NONDEFAULT_FRAMEWORKS constant", () => {
    expect(sorted(RAIL_NONDEFAULT_CONFIG_BUS_FRAMEWORKS)).toEqual(
      sorted(specNonDefaultFrameworks),
    );
    for (const e of RAIL_COVERAGE) {
      if (e.nonDefault) {
        expect(sorted(e.nonDefault.configBusFrameworks)).toEqual(
          sorted(specNonDefaultFrameworks),
        );
      }
    }
  });

  it("non-default Angular fixture coverage matches ANGULAR_NONDEFAULT_FIXTURES", () => {
    const fixtureComponents = ANGULAR_NONDEFAULT_FIXTURES.map((f) => f.component);
    const projectedFixtureComponents = RAIL_COVERAGE.filter((e) =>
      e.nonDefault?.fixtureFrameworks.includes("angular"),
    ).map((e) => e.component);
    expect(sorted(projectedFixtureComponents)).toEqual(sorted(fixtureComponents));

    // Each projected entry's fixtureFrameworks is exactly Angular, and its
    // non-default prop matches the prop the fixture actually bakes.
    for (const fixture of ANGULAR_NONDEFAULT_FIXTURES) {
      const entry = RAIL_COVERAGE.find((e) => e.component === fixture.component);
      expect(entry?.nonDefault?.fixtureFrameworks).toEqual(RAIL_NONDEFAULT_FIXTURE_FRAMEWORKS);
      for (const propKey of Object.keys(fixture.props)) {
        expect(entry?.nonDefault?.props).toContain(propKey);
      }
    }
  });
});
