import type { ComponentIR } from "../../ir.js";
import { generateReactNativeTest } from "./tests.js";

export function generateReactNativeSurfaceTest(ir: ComponentIR): string {
  return generateReactNativeTest(ir);
}
