/**
 * SwiftUI behavior emission.
 *
 * Behavior surface analogous to React's `use${Name}` / Vue's `use${Name}` /
 * Lit's `${Name}Behavior` ReactiveController. In SwiftUI this most naturally
 * maps to an `ObservableObject` class (`@Published` state, methods that
 * mutate it), instantiated as `@StateObject` in the View.
 *
 * Current policy: components whose behavior reduces to the controllable-state
 * channel pattern (Switch/ToggleSwitch) carry it inside the View struct
 * (Binding + @State + onChange) — no separate behavior file, so this returns
 * null and the factory skips the artifact. A real ObservableObject emission
 * arrives with the first component that needs focus trap, scroll lock,
 * portal, or dismissal primitives (same IR fields as the other emitters):
 *   - `behavior.normalizedChannels`     → ControllableState analogue
 *   - `behavior.focus.strategy=trap`    → FocusTrap analogue
 *   - `behavior.focus.scrollLock`       → ScrollLock analogue
 *   - `behavior.portal.enabled`         → Portal analogue
 *   - `behavior.normalizedDismissalTriggers` → Dismissal analogue
 */
import type { ComponentIR } from "../../../ir.js";

export function generateSwiftUIHookSource(_ir: ComponentIR): string | null {
  return null;
}
