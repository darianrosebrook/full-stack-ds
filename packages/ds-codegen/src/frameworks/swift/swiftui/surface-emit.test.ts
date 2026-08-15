import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildComponentIR } from "../../../ir.js";
import { generateSwiftUISurfaceFiles, isSurfaceComponent } from "./surface-emit.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function repoRoot(): string {
  return resolve(__dirname, "../../../../../..");
}

function loadContract(name: string): unknown {
  const folder = resolve(repoRoot(), "packages/ds-contracts/components", name);
  const contract = JSON.parse(
    readFileSync(resolve(folder, `${name}.contract.json`), "utf8"),
  ) as { name: string; tokens?: unknown; styles?: unknown };
  for (const sidecar of ["tokens", "styles"]) {
    const p = resolve(folder, `${name}.${sidecar}.json`);
    if (existsSync(p)) {
      (contract as Record<string, unknown>)[sidecar] = JSON.parse(
        readFileSync(p, "utf8"),
      );
    }
  }
  return contract;
}

function irFor(name: string) {
  return buildComponentIR(loadContract(name) as Parameters<typeof buildComponentIR>[0]);
}

describe("generateSwiftUISurfaceFiles — centered modal (Dialog)", () => {
  it("routes every surface kind to the surface path", () => {
    expect(isSurfaceComponent(irFor("Dialog"))).toBe(true);
    expect(isSurfaceComponent(irFor("Tooltip"))).toBe(true);
    expect(isSurfaceComponent(irFor("Button"))).toBe(false);
  });

  it("emits a sheet presenting the panel through the openness channel", () => {
    const { componentFile } = generateSwiftUISurfaceFiles(irFor("Dialog"));

    expect(componentFile).toContain("public struct Dialog<Header: View, Title: View, BodyContent: View, Footer: View>: View {");
    expect(componentFile).toContain(".sheet(isPresented: Binding(");
    expect(componentFile).toContain("get: { isOpen },");
    expect(componentFile).toContain("set: { setOpen($0) }");
    expect(componentFile).toContain("onOpenChange?(next)");
    expect(componentFile).toContain("open: Binding<Bool>? = nil");
    expect(componentFile).toContain("defaultOpen: Bool = false");
    // `body` region renames to bodyContent (Swift View.body collision).
    expect(componentFile).toContain("@ViewBuilder bodyContent: () -> BodyContent = { EmptyView() }");
    expect(componentFile).not.toContain("private let body: Body");
    // Chrome is presence-driven through FsdsTheme.
    expect(componentFile).toContain('fallback: .string("#ffffff")');
    expect(componentFile).toContain(".clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))");
  });

  it("throws for anchored surfaces and surface-less components", () => {
    expect(() => generateSwiftUISurfaceFiles(irFor("Tooltip"))).toThrow(
      /surface kind "tooltip" is not implemented/,
    );
    expect(() => generateSwiftUISurfaceFiles(irFor("Button"))).toThrow(
      /declares no surface block/,
    );
  });
});
