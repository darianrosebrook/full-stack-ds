import { describe, it, expect } from "vitest";
import { buildReactDemo } from "./demos";
import type { ComponentBundle } from "../types/data";

function makeBundle(name: string): ComponentBundle {
  return {
    name,
    contractPath: `packages/ds-contracts/${name}.contract.json`,
    sources: {},
    contract: { name, layer: "primitive" },
  };
}

const NO_LABEL = [
  "AspectRatio", "Avatar", "BrandSwitcher", "Divider", "Icon", "Image",
  "PageTransition", "Postcard", "Progress", "Skeleton", "SlinkyCursor",
  "Spinner", "Status", "VisuallyHidden",
];
const WITH_LABEL = ["Button", "Badge", "Alert", "Card", "Switch", "Dialog"];

describe("childLabel evidence", () => {
  it("emits no inner text for the NO_CHILD_LABEL set", () => {
    console.log("\n=== components in NO_CHILD_LABEL (should self-close) ===");
    for (const name of NO_LABEL) {
      const out = buildReactDemo(makeBundle(name));
      // Find the rendered node line (after createRoot)
      const nodeLine = out.split("\n").find((l) => l.includes(`<${name}`)) ?? "";
      console.log(`${name.padEnd(18)} → ${nodeLine.trim()}`);
      expect(out, `${name} should self-close`).not.toContain(`>${name}</${name}>`);
      expect(out, `${name} should self-close with /`).toMatch(new RegExp(`<${name}[^>]*/>`));
    }
  });

  it("emits the component name as inner text for components NOT in NO_CHILD_LABEL", () => {
    console.log("\n=== components NOT in NO_CHILD_LABEL (should have child text) ===");
    for (const name of WITH_LABEL) {
      const out = buildReactDemo(makeBundle(name));
      const nodeLine = out.split("\n").find((l) => l.includes(`<${name}`)) ?? "";
      console.log(`${name.padEnd(10)} → ${nodeLine.trim()}`);
      expect(out, `${name} should have child text`).toContain(`>${name}</${name}>`);
    }
  });
});
