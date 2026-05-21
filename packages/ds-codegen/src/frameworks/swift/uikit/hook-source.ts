/**
 * UIKit behavior emission — scaffold.
 *
 * Lit-style class controllers are the closest analogue: a plain class
 * that holds state, exposes get/set, and notifies its host view via
 * a delegate or closure. Same IR dispatch as the other emitters
 * (`behavior.normalizedChannels`, `behavior.focus`, `behavior.portal`,
 * `behavior.normalizedDismissalTriggers`).
 *
 * Returns `null` when the IR declares no behavior — caller skips the
 * file entirely.
 */
import type { ComponentIR } from "../../../ir.js";

export function generateUIKitHookSource(_ir: ComponentIR): string | null {
  throw new Error(
    "generateUIKitHookSource: not implemented — Swift emitter is scaffold-only.",
  );
}
