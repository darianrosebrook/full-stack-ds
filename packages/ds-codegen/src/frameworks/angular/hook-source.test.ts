import { describe, expect, it } from "vitest";
import { corpusIR } from "../corpus-fixtures.js";
import { generateAngularHookSource } from "./hook-source.js";

describe("generateAngularHookSource — real corpus contracts", () => {
  it("returns null for behavior-less contracts", () => {
    for (const name of ["Button", "Progress", "Badge", "Text"]) {
      expect(generateAngularHookSource(corpusIR(name)), name).toBeNull();
    }
  });

  it("emits compound context wiring for Tabs", () => {
    const source = generateAngularHookSource(corpusIR("Tabs"));

    expect(source).toContain(
      `import { createCompoundContext, createControllableState } from "../../primitives/index.js";`,
    );
    expect(source).toContain(`export interface UseTabsOptions`);
    expect(source).toContain(`export interface UseTabsResult`);
  });

  it("emits compound context wiring for the Accordion disclosure", () => {
    const source = generateAngularHookSource(corpusIR("Accordion"));

    expect(source).toContain(`createCompoundContext`);
    expect(source).toContain(`export interface UseAccordionOptions`);
  });

  it("emits anchor-toggle wiring for Select's open channel", () => {
    const source = generateAngularHookSource(corpusIR("Select"));

    expect(source).toContain(`createAnchorToggle`);
    expect(source).toContain(`export interface UseSelectOptions`);
  });

  it("emits dismissal, focus-trap and scroll-lock wiring for Dialog", () => {
    const source = generateAngularHookSource(corpusIR("Dialog"));

    expect(source).toContain(`createDismissal`);
    expect(source).toContain(`createFocusTrap`);
    expect(source).toContain(`createScrollLock`);
  });

  it("emits anchor-toggle wiring for Toast's auto-dismiss surface", () => {
    const source = generateAngularHookSource(corpusIR("Toast"));

    expect(source).toContain(`createAnchorToggle`);
    expect(source).toContain(`export interface UseToastOptions`);
  });

  it("emits a plain composable for OTP", () => {
    const source = generateAngularHookSource(corpusIR("OTP"));

    expect(source).toContain(
      `export function useOTP(options: UseOTPOptions): UseOTPResult {`,
    );
  });
});
