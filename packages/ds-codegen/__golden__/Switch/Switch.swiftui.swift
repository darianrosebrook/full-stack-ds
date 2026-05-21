// Hand-authored golden output. Not generated.
// See ../README.md for annotation conventions.

// SRC: framework-grammar (SwiftUI module import)
import SwiftUI

// SRC: contract.types.SwitchSize (kind: union, values: [sm, md, lg])
// SRC: framework-grammar (Swift enum with rawValue: String for token lookup)
public enum SwitchSize: String, CaseIterable {
    case sm
    case md
    case lg
}

// SRC: contract.name → struct identifier
// SRC: framework-grammar (SwiftUI views are structs conforming to View)
public struct Switch: View {
    // SRC: contract.channels.checked.value=checked, valueType=boolean
    // SRC: ir.normalizedChannels[0].callbackKind=value
    // SRC: semantic (controlled/uncontrolled pair → SwiftUI @Binding<T>?)
    private let controlledChecked: Binding<Bool>?

    // SRC: contract.channels.checked.defaultValue=defaultChecked, valueType=boolean
    // SRC: semantic (defaultValue → @State seed for uncontrolled mode)
    @State private var uncontrolledChecked: Bool

    // SRC: contract.channels.checked.onChange=onChange
    // SRC: ir.normalizedChannels[0].callbackKind=value → (Bool) -> Void
    private let onChange: ((Bool) -> Void)?

    // SRC: contract.props.styled.members[name=size], default=md
    private let size: SwitchSize

    // SRC: contract.props.styled.members[name=disabled, type=boolean]
    private let disabled: Bool

    // SRC: contract.props.styled.members[name=name, type=string]
    // SRC: form.participates=true, form.inputType=checkbox — name carries
    //      to native form submission. SwiftUI has no <form>; this is
    //      retained as a Form-binding hint (consumer responsibility).
    private let name: String?

    // SRC: contract.props.styled.members[name=value, type=string]
    // SRC: form.serialization.valueSource=static:on → default "on" if nil
    private let value: String?

    // SRC: contract.a11y.labeling=[aria-label, aria-labelledby, aria-checked]
    // SRC: framework-a11y (SwiftUI uses .accessibilityLabel not aria-label;
    //      aria-checked maps to .accessibilityValue("on")/("off") for
    //      role=switch per Apple's HIG)
    private let accessibilityLabel: String?

    // SRC: framework-grammar (Swift designated init)
    public init(
        checked: Binding<Bool>? = nil,
        defaultChecked: Bool = false,
        onChange: ((Bool) -> Void)? = nil,
        size: SwitchSize = .md,
        disabled: Bool = false,
        name: String? = nil,
        value: String? = nil,
        accessibilityLabel: String? = nil
    ) {
        self.controlledChecked = checked
        self._uncontrolledChecked = State(initialValue: defaultChecked)
        self.onChange = onChange
        self.size = size
        self.disabled = disabled
        self.name = name
        self.value = value
        self.accessibilityLabel = accessibilityLabel
    }

    // SRC: ir.normalizedChannels[0] → controllable-state read site
    // SRC: semantic (controlled-takes-precedence-over-uncontrolled rule)
    private var checked: Bool {
        controlledChecked?.wrappedValue ?? uncontrolledChecked
    }

    // SRC: ir.normalizedChannels[0] → controllable-state write site
    private func setChecked(_ next: Bool) {
        if let binding = controlledChecked {
            binding.wrappedValue = next
        } else {
            uncontrolledChecked = next
        }
        // SRC: ir.normalizedChannels[0].changeHandlerProp=onChange
        onChange?(next)
    }

    public var body: some View {
        // SRC: anatomy.dom: <label> root → SwiftUI uses native Toggle
        //      for role=switch + checkbox semantics on Apple platforms.
        //      The <label> wrapper, <input type=checkbox role=switch>,
        //      <span class=track>, <span class=thumb> are collapsed
        //      because UIKit/SwiftUI's Toggle IS the entire anatomy.
        // SRC: framework-a11y (.switch toggle style on macOS/iOS renders
        //      the track+thumb affordance natively; matches anatomy intent)
        Toggle(isOn: Binding(
            get: { checked },
            set: { setChecked($0) }
        )) {
            // SRC: contract.a2ui.usageHints[1]: "Pair with a visible label"
            //      → label slot is consumer-provided; empty when only an
            //      accessibilityLabel is set.
            EmptyView()
        }
        // SRC: framework-a11y (SwiftUI native switch style)
        .toggleStyle(.switch)
        // SRC: contract.props.disabled
        .disabled(disabled)
        // SRC: contract.a11y.labeling[0]=aria-label
        // SRC: framework-a11y (aria-label → .accessibilityLabel)
        .accessibilityLabel(accessibilityLabel ?? "")
        // SRC: contract.a11y.labeling[2]=aria-checked
        // SRC: framework-a11y (role=switch + checked state →
        //      .accessibilityValue("on"|"off"), per HIG; Toggle does this
        //      implicitly but we set explicitly for parity with the
        //      contract's a11y.labeling declaration)
        .accessibilityValue(checked ? "on" : "off")
        // SRC: contract.variants.size, contract.tokens.root["switch.size.md.*"]
        // SRC: framework-grammar (SwiftUI sizing via .frame)
        // GAP: token resolution per size variant is not derivable from
        //      the IR yet — see Switch.traceability.md §Gaps.
        .frame(width: trackWidth, height: trackHeight)
        // SRC: contract.motion.reducedMotion=respect
        // SRC: framework-a11y (SwiftUI honors UIAccessibility
        //      .isReduceMotionEnabled automatically inside Toggle)
    }

    // SRC: contract.tokens.root["switch.size.md.track.width"]
    //      fallback=48px; values for sm/lg not in contract.
    // GAP: contract only ships md sizes for size.* tokens; sm/lg widths
    //      are implied by the variant existing but have no token entry.
    private var trackWidth: CGFloat {
        switch size {
        case .sm: return 36  // GAP: not in contract
        case .md: return 48  // SRC: contract.tokens.root.switch.size.md.track.width
        case .lg: return 60  // GAP: not in contract
        }
    }

    // SRC: contract.tokens.root["switch.size.md.track.height"]
    private var trackHeight: CGFloat {
        switch size {
        case .sm: return 18  // GAP
        case .md: return 24  // SRC: contract.tokens.root.switch.size.md.track.height
        case .lg: return 30  // GAP
        }
    }
}
