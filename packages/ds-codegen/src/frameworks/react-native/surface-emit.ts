import type { ComponentIR } from "../../ir.js";

export function isSurfaceComponent(_ir: ComponentIR): boolean {
  // React Native surface semantics need a separate Modal/BackHandler slice.
  // Keep all components on the generic component emitter until that native
  // surface substrate is admitted, so the target can be wired opt-in without
  // over-claiming surface parity.
  return false;
}

export interface ReactNativeSurfaceFiles {
  componentFile: string;
  stylesFile: string;
  hookFile: string | null;
}

export function generateReactNativeSurfaceFiles(
  _ir: ComponentIR,
): ReactNativeSurfaceFiles {
  throw new Error(
    "generateReactNativeSurfaceFiles: React Native surfaces are not admitted in this slice.",
  );
}
