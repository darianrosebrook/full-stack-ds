import type { ComponentIR } from "../../ir.js";

export function generateReactNativeHookSource(
  _ir: ComponentIR,
): string | null {
  // Initial RN target slice keeps behavior in the component body for
  // controllable channels and does not emit DOM-derived behavior primitives.
  return null;
}
