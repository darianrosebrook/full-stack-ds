import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateReactNativeComponentSource } from "./react-native/component-source.js";

/**
 * FIX-RN-TABS-CONDITIONAL-USEID-01 — regression pin.
 *
 * The RN compound-selection lowering used to emit
 * `const resolvedIdBase = idBase ?? useId().replace(/:/g, "");` — a hook call
 * inside a nullish-coalescing fallback, so `useId` only ran when `idBase` was
 * undefined. That violates react-hooks/rules-of-hooks and failed `pnpm run
 * lint` on the committed generated tree. The react emitter never had the bug:
 * it stages `const generatedId = useId();` unconditionally and coalesces
 * afterwards. The RN lowering now uses the same staged shape.
 *
 * These tests pin both halves: the emitter must stage the hook call
 * unconditionally, and no file in the committed react-native generated tree
 * may contain a conditional (`??`-guarded) hook call.
 */

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

function loadTabsContract(): ComponentContract {
  const contractPath = path.join(
    REPO_ROOT,
    "packages/ds-contracts/components/Tabs/Tabs.contract.json",
  );
  return JSON.parse(
    fs.readFileSync(contractPath, "utf8"),
  ) as unknown as ComponentContract;
}

describe("React Native compound-selection useId emission is unconditional", () => {
  it("stages useId() in a local before coalescing idBase (Tabs, real contract)", () => {
    const ir = buildComponentIR(loadTabsContract());

    const { componentFile } = generateReactNativeComponentSource(ir);

    // Precondition: this really is the compound-selection path — otherwise
    // the assertions below would be vacuous.
    expect(componentFile).toContain("TabsContextProvider");

    // The staged shape: the hook runs on every render, fallback resolves after.
    expect(componentFile).toContain(
      'const generatedIdBase = useId().replace(/:/g, "");',
    );
    expect(componentFile).toContain(
      "const resolvedIdBase = idBase ?? generatedIdBase;",
    );

    // The exact regression: no hook call inside a nullish-coalescing arm.
    expect(componentFile).not.toMatch(/\?\?\s*useId\(/);
  });

  it("no committed react-native generated source guards a hook call with ??", () => {
    const generatedRoot = path.join(
      REPO_ROOT,
      "packages/ds-react-native/src",
    );
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith(".tsx")) files.push(full);
      }
    };
    walk(generatedRoot);

    expect(files.length).toBeGreaterThan(0);
    const offenders = files.filter((file) =>
      /\?\?\s*(useId|useState|useMemo|useCallback|useEffect|useRef|useContext)\(/.test(
        fs.readFileSync(file, "utf8"),
      ),
    );
    expect(offenders).toEqual([]);
  });
});
