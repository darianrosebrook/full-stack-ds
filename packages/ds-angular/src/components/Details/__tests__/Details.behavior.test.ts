import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TestBed } from "@angular/core/testing";
import { DetailsComponent } from "../Details.component";

describe("Details channel initialization", () => {
  beforeEach(() => { TestBed.configureTestingModule({ imports: [DetailsComponent] }); });

  it("reads defaultOpen after inputs are assigned and changes it only through activation", () => {
    const fixture = TestBed.createComponent(DetailsComponent);
    const callback = jest.fn();
    fixture.componentRef.setInput("summary", "More");
    fixture.componentRef.setInput("defaultOpen", true);
    fixture.componentRef.setInput("onOpenChange", callback);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("details") as HTMLDetailsElement;
    const summary = root.querySelector("summary")!;
    expect(root.open).toBe(true);
    expect(summary.getAttribute("aria-controls")).toBe(root.querySelector(".details__content")!.id);
    expect(callback).not.toHaveBeenCalled();
    summary.click();
    fixture.detectChanges();
    expect(root.open).toBe(false);
    expect(root.querySelector(".details__content")).toBeNull();
    expect(callback.mock.calls).toEqual([[false]]);
    fixture.componentRef.setInput("defaultOpen", false);
    fixture.detectChanges();
    fixture.componentRef.setInput("defaultOpen", true);
    fixture.detectChanges();
    expect(root.open).toBe(false);
  });

  it("tracks controlled parent updates without emitting changes or stale state", () => {
    const fixture = TestBed.createComponent(DetailsComponent);
    const callback = jest.fn();
    fixture.componentRef.setInput("summary", "More");
    fixture.componentRef.setInput("open", false);
    fixture.componentRef.setInput("onOpenChange", callback);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("details") as HTMLDetailsElement;
    root.querySelector("summary")!.click();
    fixture.detectChanges();
    expect(root.open).toBe(false);
    expect(callback.mock.calls).toEqual([[true]]);
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();
    expect(root.open).toBe(true);
    root.querySelector("summary")!.click();
    fixture.detectChanges();
    expect(root.open).toBe(true);
    expect(callback.mock.calls).toEqual([[true], [false]]);
    fixture.componentRef.setInput("open", false);
    fixture.detectChanges();
    expect(root.open).toBe(false);
    expect(root.querySelector(".details__content")).toBeNull();
  });
});
