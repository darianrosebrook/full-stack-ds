import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildComponentIR } from "../../ir.js";
import {
  isSurfaceComponent,
  rnAnchoredSurface,
  rnSurfaceLowering,
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

describe("react-native surface-emit — lowering projections", () => {
  it("projects a centered-modal lowering for Dialog", () => {
    const lowering = rnSurfaceLowering(irFor("Dialog"));
    expect(lowering).not.toBeNull();
    expect(lowering?.mode).toBe("modal");
  });

  it("projects an anchored lowering for Tooltip", () => {
    const anchored = rnAnchoredSurface(irFor("Tooltip"));
    expect(anchored).not.toBeNull();
  });

  it("rejects non-surface components", () => {
    expect(isSurfaceComponent(irFor("Button"))).toBe(false);
    expect(rnSurfaceLowering(irFor("Button"))).toBeNull();
    expect(rnAnchoredSurface(irFor("Button"))).toBeNull();
  });
});
