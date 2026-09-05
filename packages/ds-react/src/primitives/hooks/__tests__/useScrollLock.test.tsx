import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollLock } from "../useScrollLock";
import { PortalTargetProvider } from "../usePortal";

describe("useScrollLock", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("locks the body when active and restores on unmount", () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("does nothing when inactive", () => {
    document.body.style.overflow = "auto";
    const { unmount } = renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).toBe("auto");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("stacks: only unlocks when the last consumer releases", () => {
    const a = renderHook(() => useScrollLock(true));
    const b = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
    a.unmount();
    expect(document.body.style.overflow).toBe("hidden");
    b.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("preserves a pre-existing overflow value", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("locks a composed portal boundary without blocking the document body", () => {
    const target = document.createElement("section");
    target.style.overflow = "auto";
    document.body.appendChild(target);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PortalTargetProvider target={target}>{children}</PortalTargetProvider>
    );

    const { unmount } = renderHook(() => useScrollLock(true), { wrapper });

    expect(target.style.overflow).toBe("hidden");
    expect(document.body.style.overflow).toBe("");
    unmount();
    expect(target.style.overflow).toBe("auto");
    document.body.removeChild(target);
  });
});
