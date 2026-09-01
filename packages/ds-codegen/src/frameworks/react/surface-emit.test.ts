import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildComponentIR } from "../../ir.js";
import {
  generateReactSurfaceComponentSource,
  isSurfaceComponent,
} from "./surface-emit.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = () => resolve(__dirname, "../../../../..");

function loadContract(name: string): unknown {
  const folder = resolve(repoRoot(), "packages/ds-contracts/components", name);
  const contract = JSON.parse(
    readFileSync(resolve(folder, `${name}.contract.json`), "utf8"),
  ) as { name: string };
  for (const sidecar of ["tokens", "styles"]) {
    const p = resolve(folder, `${name}.${sidecar}.json`);
    if (existsSync(p)) {
      (contract as Record<string, unknown>)[sidecar] = JSON.parse(readFileSync(p, "utf8"));
    }
  }
  return contract;
}

function irFor(name: string) {
  return buildComponentIR(loadContract(name) as Parameters<typeof buildComponentIR>[0]);
}

describe("react surface-emit — anchored presence", () => {
  it("classifies anchored surfaces and rejects non-anchored ones", () => {
    expect(isSurfaceComponent(irFor("Tooltip"))).toBe(true);
    expect(isSurfaceComponent(irFor("Popover"))).toBe(true);
    expect(isSurfaceComponent(irFor("Dialog"))).toBe(false);
    expect(isSurfaceComponent(irFor("Button"))).toBe(false);
  });

  it("emits trigger and content interfaces for Tooltip", () => {
    const source = generateReactSurfaceComponentSource(irFor("Tooltip"));
    expect(source).toContain("TooltipTriggerProps");
    expect(source).toContain("TooltipContentProps");
    expect(source).toContain("tooltip");
  });

  it("throws for a non-anchored surface", () => {
    expect(() => generateReactSurfaceComponentSource(irFor("Dialog"))).toThrow();
  });
});
