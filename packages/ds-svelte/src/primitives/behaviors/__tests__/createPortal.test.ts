// Portal target resolution proofs through a minimal SFC harness.
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import PortalHarness from "./fixtures/PortalHarness.svelte";

afterEach(cleanup);

describe("createPortal — target resolution", () => {
  it("defaults to document.body when no target is provided", () => {
    const { getByTestId } = render(PortalHarness, { enabled: true });
    expect(getByTestId("portal-target").textContent).toBe("BODY");
  });

  it("resolves a target element getter", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const { getByTestId } = render(PortalHarness, { enabled: true, element: el });
    expect(getByTestId("portal-target").textContent).toBe("DIV");
    el.remove();
  });

  it("resolves a selector string against the document", () => {
    const el = document.createElement("aside");
    el.id = "portal-host-xyz";
    document.body.appendChild(el);
    const { getByTestId } = render(PortalHarness, {
      enabled: true,
      selector: "#portal-host-xyz",
    });
    expect(getByTestId("portal-target").textContent).toBe("ASIDE");
    el.remove();
  });

  it("falls back to document.body when the selector matches nothing", () => {
    const { getByTestId } = render(PortalHarness, {
      enabled: true,
      selector: "#portal-host-missing",
    });
    expect(getByTestId("portal-target").textContent).toBe("BODY");
  });

  it("stays unresolved when disabled", () => {
    const { getByTestId } = render(PortalHarness, { enabled: false, selector: "#x" });
    expect(getByTestId("portal-target").textContent).toBe("none");
  });
});
