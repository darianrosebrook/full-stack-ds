// VUE-FIRST-RENDER-CONTROLLABLE-DEFAULT-01: characterize whether
// `useAnchorToggle` preserves `defaultOpen` on first render.

import { describe, expect, it } from "vitest";
import { useAnchorToggle } from "../useAnchorToggle";

describe("useAnchorToggle — uncontrolled defaultOpen propagation", () => {
  it("reports open=true on first read when defaultOpen=true", () => {
    const { open } = useAnchorToggle({ defaultOpen: true });
    expect(open.value).toBe(true);
  });

  it("reports open=false on first read when defaultOpen=false", () => {
    const { open } = useAnchorToggle({ defaultOpen: false });
    expect(open.value).toBe(false);
  });

  it("reports open=false on first read when defaultOpen is omitted (defaults to false)", () => {
    const { open } = useAnchorToggle({});
    expect(open.value).toBe(false);
  });

  it("reports open=true when open getter returns true (controlled)", () => {
    const { open } = useAnchorToggle({ open: () => true, defaultOpen: false });
    expect(open.value).toBe(true);
  });

  it("falls back to defaultOpen=true when open getter returns undefined", () => {
    const { open } = useAnchorToggle({
      open: () => undefined,
      defaultOpen: true,
    });
    expect(open.value).toBe(true);
  });
});
