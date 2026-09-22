import { describe, expect, it } from "vitest";
import { createSiteStore } from "./site-store";

describe("site store events", () => {
  it("applies the patch and publishes the event in one notification", () => {
    const store = createSiteStore();
    const seen: { treats: number; event: string | undefined }[] = [];
    store.subscribe(() => seen.push({ treats: store.get().treatsOrdered, event: store.get().event?.kind }));
    store.emit("ordered", "Treat ordered", "Tuna flakes are on the way.", { treatsOrdered: 1 });
    expect(seen).toEqual([{ treats: 1, event: "ordered" }]);
    expect(store.get().event).toMatchObject({ id: 1, kind: "ordered", title: "Treat ordered", message: "Tuna flakes are on the way." });
  });

  it("gives every event a new id, so a repeated action shows a new toast", () => {
    const store = createSiteStore();
    store.emit("sent", "Sent to editor", "a");
    store.emit("sent", "Sent to editor", "a");
    expect(store.get().event?.id).toBe(2);
  });

  it("keeps the eight most recent events, newest first", () => {
    const store = createSiteStore();
    for (let i = 1; i <= 10; i++) store.emit("sent", "Sent", `#${i}`);
    expect(store.get().activity.map((e) => e.message)).toEqual(["#10", "#9", "#8", "#7", "#6", "#5", "#4", "#3"]);
  });
});
