// @generated:start imports
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { ShowMoreComponent } from "../ShowMore.component";
// @generated:end

// @generated:start tests
describe("ShowMore — unit", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ShowMoreComponent] });
  });

  it("creates the component", () => {
    const fixture = TestBed.createComponent(ShowMoreComponent);
    expect(fixture.componentInstance).toBeInstanceOf(ShowMoreComponent);
  });

  it("applies the base CSS class", () => {
    const fixture = TestBed.createComponent(ShowMoreComponent);
    expect(classTokens(fixture.componentInstance)).toContain("show-more");
  });

  it("toggles the expanded channel from the trigger click", () => {
    const fixture = TestBed.createComponent(ShowMoreComponent);
    const seen: boolean[] = [];
    fixture.componentInstance.onExpandedChange = (v: boolean) => seen.push(v);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector(".show-more__trigger") as HTMLElement;
    host.click();
    expect(seen).toEqual([true]);
  });
});

function classTokens(component: { classes: () => string }): string[] {
  return component.classes().split(/\s+/).filter(Boolean);
}
// @generated:end

// @custom:start tests

// @custom:end
