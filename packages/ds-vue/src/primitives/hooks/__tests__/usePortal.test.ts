// Portal target resolution proofs — the composable pre-resolves the
// Teleport mount point from element getters or selector strings.
import { describe, expect, it } from "vitest";
import { usePortal } from "../usePortal";

describe("usePortal — target resolution", () => {
  it("defaults to document.body when no target is provided", () => {
    const { target, enabled } = usePortal();
    expect(enabled).toBe(true);
    expect(target.value).toBe(document.body);
  });

  it("resolves a target element getter", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const { target } = usePortal({ target: () => el });
    expect(target.value).toBe(el);
    el.remove();
  });

  it("resolves a selector string against the document", () => {
    const el = document.createElement("div");
    el.id = "portal-host-xyz";
    document.body.appendChild(el);
    const { target } = usePortal({ target: () => "#portal-host-xyz" });
    expect(target.value).toBe(el);
    el.remove();
  });

  it("falls back to document.body when the selector matches nothing", () => {
    const { target } = usePortal({ target: () => "#portal-host-missing" });
    expect(target.value).toBe(document.body);
  });

  it("falls back to document.body when the target getter returns undefined", () => {
    const { target } = usePortal({ target: () => undefined });
    expect(target.value).toBe(document.body);
  });

  it("resolves null when disabled", () => {
    const el = document.createElement("div");
    const { target, enabled } = usePortal({ enabled: false, target: () => el });
    expect(enabled).toBe(false);
    expect(target.value).toBeNull();
  });
});
