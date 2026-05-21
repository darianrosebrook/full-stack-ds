/**
 * Jetpack Compose state-holder emission — scaffold.
 *
 * The Compose equivalent of React's `use${Name}` hook is the
 * `remember${Name}State()` factory + `${Name}State` class pattern
 * (e.g. `rememberScrollState()`, `LazyListState`, `DrawerState`). State
 * lives in a class, the factory returns it via `remember { ... }`, and
 * the composable accepts it as a parameter for hoisting.
 *
 * Same IR dispatch as the React/Vue/Lit emitters:
 *
 *   - `behavior.normalizedChannels`        → controlled/uncontrolled
 *                                            params on the composable
 *                                            (state class is rarely needed
 *                                            for plain channels — only when
 *                                            multiple channels share
 *                                            coordination)
 *   - `behavior.focus.strategy=trap`       → `FocusRequester` + `Modifier.focusGroup()`
 *   - `behavior.focus.scrollLock`          → folded into Dialog/Popup host
 *   - `behavior.portal.enabled`            → host composable is `Dialog`
 *                                            or `Popup` (no state needed)
 *   - `behavior.normalizedDismissalTriggers`:
 *       escape  → `Modifier.onKeyEvent { it.key == Key.Escape }`
 *       back    → `BackHandler { ... }`
 *       outside → scrim `Modifier.clickable { ... }` inside Dialog
 *
 * Returns `null` when the IR declares no behavior — caller skips the
 * file entirely. For simple controlled/uncontrolled state with no
 * coordination, no state class is emitted; the hoisted params live
 * directly on the composable signature.
 */
import type { ComponentIR } from "../../ir.js";

export function generateJetpackComposeHookSource(
  _ir: ComponentIR,
): string | null {
  throw new Error(
    "generateJetpackComposeHookSource: not implemented — Jetpack Compose emitter is scaffold-only.",
  );
}
