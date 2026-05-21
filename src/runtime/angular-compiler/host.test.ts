import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  synthesizeHost,
  hostsDir,
  hostFilePath,
  clearHosts,
} from "./host";
import type { ComponentBundle } from "../../types/data";

function fakeBundle(name: string, code: string): ComponentBundle {
  return {
    name,
    contractPath: `packages/ds-contracts/${name}.contract.json`,
    sources: {
      angular: {
        component: { filename: `${name}.component.ts`, code },
      },
    },
    contract: {
      name,
      layer: "primitive",
    },
  };
}

describe("synthesizeHost", () => {
  beforeAll(async () => { await clearHosts(); });
  afterAll(async () => { await clearHosts(); });

  it("writes a host .ts file inside the ds-angular package root", async () => {
    const fp = await synthesizeHost({
      component: fakeBundle("Button", "export class ButtonComponent {}"),
    });
    expect(fp).toBe(hostFilePath("Button"));
    expect(fp.startsWith(hostsDir())).toBe(true);
    expect(fs.existsSync(fp)).toBe(true);
  });

  it("rewrites the relative import to point at src/components/ from the hosts dir", async () => {
    // The hosts dir is a sibling of src/, so the relative path from a host
    // file to the component source is ../src/components/Name/Name.component.js,
    // not ./components/... (which is what buildAngularDemo emits assuming a
    // package-root placement).
    const fp = await synthesizeHost({
      component: fakeBundle("Button", "export class ButtonComponent {}"),
    });
    const text = fs.readFileSync(fp, "utf8");
    expect(text).toContain('from "../src/components/Button/Button.component.js"');
    expect(text).not.toContain('from "./components/');
  });

  it("is idempotent — repeated synthesis with same input does not change mtime", async () => {
    const c = fakeBundle("Button", "export class ButtonComponent {}");
    await synthesizeHost({ component: c });
    const fp = hostFilePath("Button");
    const mtime1 = fs.statSync(fp).mtimeMs;
    // Wait a frame, then re-synthesize. Without the compare-then-write guard
    // this would update mtime and trigger an unnecessary recompile.
    await new Promise((r) => setTimeout(r, 10));
    await synthesizeHost({ component: c });
    const mtime2 = fs.statSync(fp).mtimeMs;
    expect(mtime2).toBe(mtime1);
  });

  it("re-writes when source content changes", async () => {
    await synthesizeHost({
      component: fakeBundle("Button", "export class ButtonComponent {}"),
    });
    const fp = hostFilePath("Button");
    const before = fs.readFileSync(fp, "utf8");
    // Same component name, different exported classes — a compound part appeared.
    await synthesizeHost({
      component: fakeBundle(
        "Button",
        "export class ButtonComponent {}\nexport class ButtonGroupComponent {}",
      ),
    });
    const after = fs.readFileSync(fp, "utf8");
    expect(after).not.toBe(before);
    expect(after).toContain("imports: [ButtonComponent, ButtonGroupComponent]");
  });
});
