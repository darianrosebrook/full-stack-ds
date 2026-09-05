import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  resolveTokenValue,
  type ComponentTokenDefinition,
  type FsdsTheme,
} from "./index";

interface ResolverCase {
  id: string;
  name: string;
  ref?: string;
  literal?: string;
  fallback?: string;
  themeByName?: string;
  themeByRef?: string;
  unrelatedTheme?: string;
  expected: string;
}

interface ResolverFixture {
  version: number;
  precedence: string[];
  cases: ResolverCase[];
}

const fixture = JSON.parse(
  readFileSync(
    new URL(
      "../../../ds-contracts/fixtures/native-token-resolver.conformance.json",
      import.meta.url,
    ),
    "utf8",
  ),
) as ResolverFixture;

function themeFor(testCase: ResolverCase): FsdsTheme {
  const tokens: NonNullable<FsdsTheme["tokens"]> = {};
  if (testCase.themeByName !== undefined) {
    tokens[testCase.name] = testCase.themeByName;
  }
  if (testCase.ref && testCase.themeByRef !== undefined) {
    tokens[testCase.ref] = testCase.themeByRef;
  }
  if (testCase.unrelatedTheme !== undefined) {
    tokens["fixture.unrelated"] = testCase.unrelatedTheme;
  }
  return { tokens };
}

describe("native token resolver conformance", () => {
  it("declares the shared precedence contract", () => {
    expect(fixture.version).toBe(1);
    expect(fixture.precedence).toEqual([
      "themeByName",
      "themeByRef",
      "literal",
      "fallback",
    ]);
  });

  for (const testCase of fixture.cases) {
    it(testCase.id, () => {
      const literalBacked =
        testCase.literal !== undefined &&
        testCase.ref === undefined &&
        testCase.fallback === undefined;
      const tokenBacked =
        testCase.literal === undefined &&
        testCase.ref !== undefined &&
        testCase.fallback !== undefined;
      expect(literalBacked || tokenBacked).toBe(true);

      const definition: ComponentTokenDefinition = {
        cssVar: "--fixture",
        name: testCase.name,
        ref: testCase.ref,
        literal: testCase.literal,
        fallback: testCase.fallback,
      };
      expect(resolveTokenValue(definition, themeFor(testCase))).toBe(
        testCase.expected,
      );
    });
  }

  it("keeps every native runner wired to the shared fixture", () => {
    const ci = readFileSync(
      new URL("../../../../.github/workflows/ci.yml", import.meta.url),
      "utf8",
    );
    expect(ci).toContain("pnpm run test:coverage");
    expect(ci).toContain("swift test --package-path packages/ds-swiftui");
    expect(ci).toContain(
      "./packages/ds-jetpack-compose/gradlew -p packages/ds-jetpack-compose :library:test --no-daemon",
    );

    const swiftTest = readFileSync(
      new URL(
        "../../../ds-swiftui/Tests/DsSwiftUITests/FsdsThemeTests.swift",
        import.meta.url,
      ),
      "utf8",
    );
    const composeTest = readFileSync(
      new URL(
        "../../../ds-jetpack-compose/library/src/test/kotlin/com/fullstackds/tokens/FsdsThemeTest.kt",
        import.meta.url,
      ),
      "utf8",
    );
    expect(swiftTest).toContain("native-token-resolver.conformance.json");
    expect(composeTest).toContain("fsds.nativeTokenResolverFixture");
  });
});
