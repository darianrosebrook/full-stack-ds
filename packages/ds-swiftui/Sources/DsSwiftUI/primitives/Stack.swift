// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start primitive
/// FSDS `Stack` layout primitive, lowered from the primitive contract IR.
///
/// The axis applies only in axis-bearing layout modes ("stack", "inline-stack"); every other mode renders a neutral container with no imposed
/// spacing — the SwiftUI analog of the web targets' axis-mode gating.
///
/// Gap: the contract binds inter-child spacing to the "spacing.gap.stack"
/// token; until the theme module projects concrete values, `spacing` is
/// consumer-settable (nil = SwiftUI default spacing).
public struct Stack<Content: View>: View {
  public enum StackVariant: String, CaseIterable {
    case vertical
    case horizontal
  }

  public enum StackLayout: String, CaseIterable {
    case block
    case contents
    case inline
    case inlineStack = "inline-stack"
    case native
    case stack
  }

  private let variant: StackVariant
  private let layout: StackLayout
  private let spacing: CGFloat?
  private let accessibilityIdentifier: String?
  private let content: Content

  public init(
    variant: StackVariant = .vertical,
    layout: StackLayout = .stack,
    spacing: CGFloat? = nil,
    accessibilityIdentifier: String? = nil,
    @ViewBuilder content: () -> Content
  ) {
    self.variant = variant
    self.layout = layout
    self.spacing = spacing
    self.accessibilityIdentifier = accessibilityIdentifier
    self.content = content()
  }

  /// Axis-bearing modes derive from the primitive contract's
  /// displayByMode flex entries; all other modes keep the host's own
  /// layout behavior (no imposed axis, no imposed spacing).
  private var appliesAxis: Bool {
    switch layout {
    case .block: return false
    case .contents: return false
    case .inline: return false
    case .inlineStack: return true
    case .native: return false
    case .stack: return true
    }
  }

  public var body: some View {
    stackBody
      .fsdsAccessibilityIdentifier(accessibilityIdentifier)
  }

  @ViewBuilder
  private var stackBody: some View {
    switch (appliesAxis, variant) {
    case (true, .vertical):
      VStack(spacing: spacing) { content }
    case (true, .horizontal):
      HStack(spacing: spacing) { content }
    case (false, _):
      VStack(spacing: nil) { content }
    }
  }
}
// @generated:end
