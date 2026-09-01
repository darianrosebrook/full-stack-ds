import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveAndWrite } from "./resolve.js";

const tempDirs: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("resolveAndWrite — warning and emit branches", () => {
  it("writes the resolved tree and reports a dangling reference as a warning", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "resolve-and-write-"));
    tempDirs.push(dir);
    const composed = path.join(dir, "composed.json");
    const output = path.join(dir, "resolved.json");
    fs.writeFileSync(
      composed,
      JSON.stringify({
        core: {
          color: {
            primary: { $type: "color", $value: "#000000" },
            ghost: { $type: "color", $value: "{core.color.nothere}" },
          },
        },
      }),
    );

    const { leafCount, warnings } = resolveAndWrite(composed, output);

    expect(leafCount).toBe(2);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.includes("nothere"))).toBe(true);
    // resolveAndWrite collects warnings silently; the runner layer does
    // the console reporting.
    expect(fs.existsSync(output)).toBe(true);

    const resolved = JSON.parse(fs.readFileSync(output, "utf8"));
    expect(resolved.core.color.primary).toMatchObject({
      $type: "color",
      $value: "#000000",
    });
  });

  it("resolves a clean tree without warnings", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "resolve-and-write-"));
    tempDirs.push(dir);
    const composed = path.join(dir, "composed.json");
    const output = path.join(dir, "resolved.json");
    fs.writeFileSync(
      composed,
      JSON.stringify({
        semantic: {
          color: { text: { $type: "color", $value: "#111111" } },
        },
      }),
    );

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { leafCount, warnings } = resolveAndWrite(composed, output);

    expect(leafCount).toBe(1);
    expect(warnings).toEqual([]);
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
