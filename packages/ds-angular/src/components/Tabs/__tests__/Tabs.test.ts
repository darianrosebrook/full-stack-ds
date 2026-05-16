// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { TabsComponent } from "../Tabs.component";
// @generated:end

// @generated:start tests
describe("Tabs — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TabsComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(TabsComponent);
    expect(fixture.componentInstance).toBeInstanceOf(TabsComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(TabsComponent);
    expect(classTokens(fixture.componentInstance)).toContain("tabs");
  });

  it("applies orientation=horizontal variant class", () => {
    const fixture = TestBed.createComponent(TabsComponent);
    fixture.componentInstance.orientation = "horizontal";
    expect(classTokens(fixture.componentInstance)).toContain("tabs--horizontal");
  });

  it("applies orientation=vertical variant class", () => {
    const fixture = TestBed.createComponent(TabsComponent);
    fixture.componentInstance.orientation = "vertical";
    expect(classTokens(fixture.componentInstance)).toContain("tabs--vertical");
  });

  it("applies activationMode=automatic variant class", () => {
    const fixture = TestBed.createComponent(TabsComponent);
    fixture.componentInstance.activationMode = "automatic";
    expect(classTokens(fixture.componentInstance)).toContain("tabs--automatic");
  });

  it("applies activationMode=manual variant class", () => {
    const fixture = TestBed.createComponent(TabsComponent);
    fixture.componentInstance.activationMode = "manual";
    expect(classTokens(fixture.componentInstance)).toContain("tabs--manual");
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
