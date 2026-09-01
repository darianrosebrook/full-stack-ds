// Event-composition rule: consumer handler first, surface handler skipped
// when the consumer called preventDefault — identical contract to the
// React/Vue substrates' composeEventHandlers.
import { describe, expect, it, vi } from "vitest";
import { composeEventHandlers } from "../compose";

function fakeEvent(): Event {
  return new Event("click", { cancelable: true });
}

describe("composeEventHandlers", () => {
  it("runs the consumer handler before the surface handler", () => {
    const order: string[] = [];
    const composed = composeEventHandlers(
      () => order.push("consumer"),
      () => order.push("surface"),
    );
    composed(fakeEvent());
    expect(order).toEqual(["consumer", "surface"]);
  });

  it("skips the surface handler when the consumer prevented default", () => {
    const surface = vi.fn();
    const composed = composeEventHandlers(
      (event) => event.preventDefault(),
      surface,
    );
    composed(fakeEvent());
    expect(surface).not.toHaveBeenCalled();
  });

  it("runs the surface handler alone when no consumer is provided", () => {
    const surface = vi.fn();
    const composed = composeEventHandlers(undefined, surface);
    composed(fakeEvent());
    expect(surface).toHaveBeenCalledTimes(1);
  });

  it("passes the same event object to both handlers", () => {
    const event = fakeEvent();
    const seen: Event[] = [];
    composeEventHandlers(
      (e) => seen.push(e),
      (e) => seen.push(e),
    )(event);
    expect(seen).toEqual([event, event]);
  });
});
