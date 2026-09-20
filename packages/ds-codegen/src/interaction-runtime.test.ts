// @vitest-environment jsdom
// The runtime under test binds DOM listeners on real host elements; three
// tests observe document-level behavior (disabled/aria-disabled blocking,
// listener disposal). The codegen package's coverage config runs node by
// default (no React); this file is the DOM-observing exception.
// FIX-CODEGEN-COVERAGE-ENV-01
import { describe, expect, it, vi } from "vitest";
import ts from "typescript";
import { INTERACTION_RUNTIME_SOURCE } from "./interaction-runtime.js";

type Runtime = {
  bindInteractionEvents(host: HTMLElement, handlers: Record<string, (event: Event) => void>): () => void;
  canActivateInteraction(event: Event, cancel?: boolean): boolean;
  toggleInteractionItem(value: string | string[], item: string, multiple: boolean, collapsible: boolean): string | string[];
  requestInteractionChange<T>(controlled: T | undefined, next: T, commit: (value: T) => void, notify: (value: T) => void): void;
};
const runtime = {} as Runtime;
new Function("exports", ts.transpileModule(INTERACTION_RUNTIME_SOURCE, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(runtime);

describe("shared interaction runtime", () => {
  it.each([false, true])("respects consumer cancellation with native cancellation=%s", cancel => {
    const event = new Event("click", { cancelable: true });
    event.preventDefault();
    expect(runtime.canActivateInteraction(event, cancel)).toBe(false);
  });
  it("suppresses native default while allowing one governed activation", () => {
    const event = new Event("click", { cancelable: true });
    expect(runtime.canActivateInteraction(event, true)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });
  it.each(["disabled", "aria-disabled"])("blocks a %s host", attr => {
    const host = document.createElement("button");
    host.setAttribute(attr, "true");
    const decisions: boolean[] = [];
    host.addEventListener("click", event => decisions.push(runtime.canActivateInteraction(event)));
    host.dispatchEvent(new Event("click"));
    expect(decisions).toEqual([false]);
  });
  it.each([undefined, false, true])("writes only uncontrolled state, controlled=%s", controlled => {
    const commit = vi.fn(); const notify = vi.fn();
    runtime.requestInteractionChange(controlled, true, commit, notify);
    expect(commit.mock.calls).toEqual(controlled === undefined ? [[true]] : []);
    expect(notify.mock.calls).toEqual([[true]]);
  });
  it("preserves single, collapsible and multiple selection policy", () => {
    expect(runtime.toggleInteractionItem("a", "b", false, false)).toBe("b");
    expect(runtime.toggleInteractionItem("a", "a", false, false)).toBe("a");
    expect(runtime.toggleInteractionItem("a", "a", false, true)).toBe("");
    const original = ["a", "b"];
    expect(runtime.toggleInteractionItem(original, "a", true, true)).toEqual(["b"]);
    expect(runtime.toggleInteractionItem(original, "c", true, true)).toEqual(["a", "b", "c"]);
    expect(original).toEqual(["a", "b"]);
  });
  it("disposes only its own listeners when several bindings share one host", () => {
    const host = document.createElement("button");
    const first = vi.fn(); const second = vi.fn();
    const unbindFirst = runtime.bindInteractionEvents(host, { click: first });
    const unbindSecond = runtime.bindInteractionEvents(host, { click: second });
    host.click();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    unbindFirst(); host.click();
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
    unbindSecond(); host.click();
    expect(second).toHaveBeenCalledTimes(2);
  });

});
