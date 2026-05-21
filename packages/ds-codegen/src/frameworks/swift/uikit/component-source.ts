/**
 * UIKit UIView subclass emission — scaffold.
 *
 * Target shape (per component, single `.swift` file):
 *
 *   // @generated:start imports
 *   import UIKit
 *   import FullStackDSPrimitives   // Stack equivalent (likely UIStackView wrapper)
 *   // @generated:end
 *
 *   // @generated:start types
 *   public enum ButtonSize { case small, medium, large }
 *   // @generated:end
 *
 *   // @generated:start component
 *   public final class Button: UIControl {
 *     public override init(frame: CGRect) { ... }
 *     public required init?(coder: NSCoder) { ... }
 *     // didSet observers drive layout/state
 *   }
 *   // @generated:end
 *
 * Open design questions (deferred):
 *   - Stack mapping: `UIStackView` is the obvious analogue but its API
 *     (axis, distribution, alignment) doesn't 1:1 with our Stack contract;
 *     a thin wrapper is probably needed.
 *   - Accessibility: `accessibilityLabel`, `accessibilityTraits`,
 *     `isAccessibilityElement` projection from `a11y` and `role`.
 *   - Tokens: `UIColor` / `UIFont` / `CGFloat` constants from a generated
 *     `DesignTokens.swift` (no CSS analogue).
 *   - Compound parts: sibling `UIView` subclasses in the same file or
 *     nested types under the parent class.
 */
import type { ComponentIR } from "../../../ir.js";

export function generateUIKitComponentSource(_ir: ComponentIR): string {
  throw new Error(
    "generateUIKitComponentSource: not implemented — Swift emitter is scaffold-only.",
  );
}
