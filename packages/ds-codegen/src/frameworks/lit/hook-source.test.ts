import { describe, expect, it } from "vitest";
import { corpusIR } from "../corpus-fixtures.js";
import { generateLitHookSource } from "./hook-source.js";

describe("generateLitHookSource — real corpus contracts", () => {
  it("returns null for behavior-less contracts", () => {
    for (const name of ["Button", "Progress", "Badge", "Text"]) {
      expect(generateLitHookSource(corpusIR(name)), name).toBeNull();
    }
  });

  it("emits the compound behavior class for Tabs", () => {
    const source = generateLitHookSource(corpusIR("Tabs"));

    expect(source).toContain(`export interface TabsBehaviorOptions`);
    expect(source).toContain(`export class TabsBehavior`);
  });

  it("emits the disclosure behavior class for Accordion", () => {
    const source = generateLitHookSource(corpusIR("Accordion"));

    expect(source).toContain(`export interface AccordionBehaviorOptions`);
    expect(source).toContain(`export class AccordionBehavior`);
  });

  it("emits anchor-toggle controller wiring for Select", () => {
    const source = generateLitHookSource(corpusIR("Select"));

    expect(source).toContain(`AnchorToggleController`);
    expect(source).toContain(`export class SelectBehavior`);
  });

  it("emits dismissal, focus-trap and scroll-lock controllers for Dialog", () => {
    const source = generateLitHookSource(corpusIR("Dialog"));

    expect(source).toContain(`DismissalController`);
    expect(source).toContain(`FocusTrapController`);
    expect(source).toContain(`ScrollLockController`);
  });

  it("emits anchor-toggle controller wiring for Toast", () => {
    const source = generateLitHookSource(corpusIR("Toast"));

    expect(source).toContain(`AnchorToggleController`);
    expect(source).toContain(`export class ToastBehavior`);
  });

  it("emits the OTP behavior class", () => {
    const source = generateLitHookSource(corpusIR("OTP"));

    expect(source).toContain(`export interface OTPBehaviorOptions`);
    expect(source).toContain(`export class OTPBehavior`);
  });
});
