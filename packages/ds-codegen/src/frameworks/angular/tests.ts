import type { ComponentIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";
import { buildComponentTestPlan } from "../../test-plan.js";

export function generateAngularTest(ir: ComponentIR): string {
  const plan = buildComponentTestPlan(ir);
  const className = `${plan.name}Component`;
  const isDomTree = ir.dom !== undefined;

  // Dismissal tests are only reliable for dom-tree components (they wire document listeners).
  const emitEscape = plan.escapeDismissals.length > 0 && isDomTree;
  const emitOverlayClick = plan.overlayClickDismissals.length > 0 && isDomTree;

  // Angular stack-only components do not consistently expose change-handler callbacks as
  // @Input() props (they are layout wrappers delegating to the stack). Dom-tree components
  // have comprehensive channel tests written in the @custom block. No generated channel
  // prop tests are emitted for Angular.

  const needsJest = isDomTree || emitEscape || emitOverlayClick;

  const importsLines: string[] = [
    `import { describe, expect, it${needsJest ? ", beforeEach, jest" : ""} } from "@jest/globals";`,
    ...(isDomTree ? [`import { TestBed } from "@angular/core/testing";`] : []),
    `import { ${className} } from "../${plan.name}.component";`,
  ];
  const importsBody = importsLines.join("\n");

  const lines: string[] = [];
  lines.push(`describe("${plan.name} — unit", () => {`);

  if (isDomTree) {
    // dom-tree components use inject() and Angular effects in their constructors;
    // TestBed provides the full environment injector with ChangeDetectionScheduler.
    lines.push(`  beforeEach(() => {`);
    lines.push(`    TestBed.configureTestingModule({ imports: [${className}] });`);
    lines.push(`  });`);
    lines.push(``);
    lines.push(`  it("creates the component", () => {`);
    lines.push(`    const fixture = TestBed.createComponent(${className});`);
    lines.push(`    expect(fixture.componentInstance).toBeInstanceOf(${className});`);
    lines.push(`  });`);
    lines.push(``);
    lines.push(`  it("applies the base CSS class", () => {`);
    lines.push(`    const fixture = TestBed.createComponent(${className});`);
    lines.push(`    expect(classTokens(fixture.componentInstance)).toContain("${plan.cssPrefix}");`);
    lines.push(`  });`);

    for (const variant of plan.variants) {
      lines.push(``);
      lines.push(
        `  it("applies ${variant.dimension}=${variant.value} variant class", () => {`,
      );
      lines.push(`    const fixture = TestBed.createComponent(${className});`);
      lines.push(
        `    fixture.componentInstance.${variant.dimension} = "${variant.value}";`,
      );
      lines.push(
        `    expect(classTokens(fixture.componentInstance)).toContain("${variant.className}");`,
      );
      lines.push(`  });`);
    }
  } else {
    lines.push(`  it("creates the component class", () => {`);
    lines.push(`    expect(new ${className}()).toBeInstanceOf(${className});`);
    lines.push(`  });`);
    lines.push(``);
    lines.push(`  it("applies the base CSS class", () => {`);
    lines.push(`    const component = new ${className}();`);
    lines.push(`    expect(classTokens(component)).toContain("${plan.cssPrefix}");`);
    lines.push(`  });`);

    for (const variant of plan.variants) {
      lines.push(``);
      lines.push(
        `  it("applies ${variant.dimension}=${variant.value} variant class", () => {`,
      );
      lines.push(`    const component = new ${className}();`);
      lines.push(`    component.${variant.dimension} = "${variant.value}";`);
      lines.push(
        `    expect(classTokens(component)).toContain("${variant.className}");`,
      );
      lines.push(`  });`);
    }

  }

  lines.push(`});`);

  // Dismissal tests for dom-tree components — document-level Escape listener.
  if (emitEscape) {
    for (const testCase of plan.escapeDismissals) {
      lines.push(``);
      lines.push(`describe("${plan.name} — Escape dismissal", () => {`);
      lines.push(`  beforeEach(() => {`);
      lines.push(`    TestBed.configureTestingModule({ imports: [${className}] });`);
      lines.push(`  });`);
      lines.push(``);
      lines.push(`  it("closes on Escape key", () => {`);
      lines.push(`    const fixture = TestBed.createComponent(${className});`);
      lines.push(`    const ${testCase.spyName} = jest.fn();`);
      lines.push(
        `    fixture.componentInstance.${testCase.channel.valueProp} = true;`,
      );
      lines.push(
        `    fixture.componentInstance.${testCase.channel.changeHandlerProp} = ${testCase.spyName};`,
      );
      lines.push(`    fixture.detectChanges();`);
      lines.push(
        `    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));`,
      );
      lines.push(`    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`);
      lines.push(`  });`);
      lines.push(`});`);
    }
  }

  // Dismissal tests for dom-tree components — overlay click on the presentation layer.
  if (emitOverlayClick) {
    for (const testCase of plan.overlayClickDismissals) {
      lines.push(``);
      lines.push(`describe("${plan.name} — overlay-click dismissal", () => {`);
      lines.push(`  beforeEach(() => {`);
      lines.push(`    TestBed.configureTestingModule({ imports: [${className}] });`);
      lines.push(`  });`);
      lines.push(``);
      lines.push(`  it("closes on overlay click", () => {`);
      lines.push(`    const fixture = TestBed.createComponent(${className});`);
      lines.push(`    const ${testCase.spyName} = jest.fn();`);
      lines.push(
        `    fixture.componentInstance.${testCase.channel.valueProp} = true;`,
      );
      lines.push(
        `    fixture.componentInstance.${testCase.channel.changeHandlerProp} = ${testCase.spyName};`,
      );
      lines.push(`    fixture.detectChanges();`);
      lines.push(
        `    const overlay = fixture.nativeElement.querySelector('[role="presentation"]') as HTMLElement;`,
      );
      lines.push(`    overlay?.click();`);
      lines.push(`    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`);
      lines.push(`  });`);
      lines.push(`});`);
    }
  }

  lines.push(``);
  lines.push(`function classTokens(component: { classes: () => string }): string[] {`);
  lines.push(`  return component.classes().split(/\\s+/).filter(Boolean);`);
  lines.push(`}`);

  const sections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    { kind: "between", body: "" },
    { kind: "generated", id: "tests", body: lines.join("\n") },
    { kind: "between", body: "" },
    { kind: "custom", id: "tests", body: "" },
    { kind: "between", body: "" },
  ];
  return renderSections(sections, "line");
}
