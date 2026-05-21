/**
 * SwiftUI behavior emission — scaffold.
 *
 * Behavior surface analogous to React's `use${Name}` / Vue's
 * `use${Name}` / Lit's `${Name}Behavior` ReactiveController. In SwiftUI
 * this most naturally maps to an `ObservableObject` class (`@Published`
 * state, methods that mutate it), instantiated as `@StateObject` in
 * the View.
 *
 * Primitive dispatch (deferred — same IR fields as the other emitters):
 *   - `behavior.normalizedChannels`     → ControllableState analogue
 *   - `behavior.focus.strategy=trap`    → FocusTrap analogue
 *   - `behavior.focus.scrollLock`       → ScrollLock analogue
 *   - `behavior.portal.enabled`         → Portal analogue (likely
 *                                          `WindowGroup` / overlay)
 *   - `behavior.normalizedDismissalTriggers` → Dismissal analogue
 *
 * Returns `null` when the IR declares no behavior — caller skips the
 * file entirely (parity with the React/Vue/Svelte/Lit emitters).
 */
import type { ComponentIR } from "../../../ir.js";

export function generateSwiftUIHookSource(_ir: ComponentIR): string | null {
  throw new Error(
    "generateSwiftUIHookSource: not implemented — Swift emitter is scaffold-only.",
  );
}
