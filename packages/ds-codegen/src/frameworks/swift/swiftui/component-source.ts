/**
 * SwiftUI View struct emission — scaffold.
 *
 * Target shape (per component, single `.swift` file):
 *
 *   // @generated:start imports
 *   import SwiftUI
 *   import FullStackDSPrimitives   // Stack equivalent
 *   // @generated:end
 *   // @custom:start imports
 *   // @custom:end
 *
 *   // @generated:start types
 *   public enum ButtonSize { case small, medium, large }
 *   // @generated:end
 *
 *   // @generated:start component
 *   public struct Button: View {
 *     // @Binding / @State for channels, plain `let` for static props
 *     public var body: some View {
 *       Stack(axis: .horizontal) { ... }
 *     }
 *   }
 *   // @generated:end
 *
 * Open design questions (deferred):
 *   - Channel ↔ SwiftUI state mapping: `@Binding` for controlled,
 *     `@State` for uncontrolled, mirroring `useControllableState`.
 *   - Compound-parts: emit sibling `View` structs in the same file or
 *     scope them under a `Button` namespace via nested types.
 *   - Token resolution: SwiftUI has no CSS — tokens become `Color` /
 *     `CGFloat` / `Font` constants from a separate `DesignTokens` module.
 *   - ARIA → `.accessibilityLabel` / `.accessibilityRole` translation
 *     belongs in the IR projection step, not here.
 */
import type { ComponentIR } from "../../../ir.js";

export function generateSwiftUIComponentSource(_ir: ComponentIR): string {
  throw new Error(
    "generateSwiftUIComponentSource: not implemented — Swift emitter is scaffold-only.",
  );
}
