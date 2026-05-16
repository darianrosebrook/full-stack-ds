import fs from "node:fs";
import path from "node:path";

export interface StackPrimitiveFile {
  implementation?: {
    targets?: {
      react?: {
        relativeFromComponents?: string;
        module?: string;
        export?: string;
      };
    };
  };
}

/** Resolved relative import path from each generated component folder to the Stack module. */
export function readReactStackImportFromPrimitiveContract(
  contractsRoot: string,
): string {
  const p = path.join(contractsRoot, "primitives", "Stack.primitive.json");
  const raw = JSON.parse(fs.readFileSync(p, "utf-8")) as StackPrimitiveFile;
  const rel = raw.implementation?.targets?.react?.relativeFromComponents;
  if (!rel || typeof rel !== "string") {
    throw new Error(
      `Missing implementation.targets.react.relativeFromComponents in ${p}`,
    );
  }
  return rel;
}
