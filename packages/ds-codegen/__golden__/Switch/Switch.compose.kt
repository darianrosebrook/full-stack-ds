// Hand-authored golden output. Not generated.
// See ../README.md for annotation conventions.

// SRC: framework-grammar (Kotlin package declaration)
package com.fullstackds.switchcomponent

// SRC: framework-grammar (Compose imports)
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Switch as M3Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.semantics.toggleableState
import androidx.compose.ui.state.ToggleableState
import androidx.compose.ui.unit.dp

// SRC: contract.types.SwitchSize
enum class SwitchSize { Sm, Md, Lg }

// SRC: contract.name → composable identifier
// SRC: framework-grammar (Kotlin @Composable top-level fn)
//
// Compose's idiomatic controlled/uncontrolled state pattern:
//   - Caller passes `checked` + `onCheckedChange` → controlled
//   - Caller omits both → uncontrolled via remember { mutableStateOf(...) }
//   - Caller passes only `onCheckedChange` → semi-controlled (rare)
// This is the same hoisting pattern Material 3 uses for every stateful
// composable (Slider, Switch, Checkbox, TextField, ...).
@Composable
fun Switch(
    // SRC: contract.channels.checked.value=checked, valueType=boolean
    // SRC: ir.normalizedChannels[0]
    checked: Boolean? = null,
    // SRC: contract.channels.checked.defaultValue=defaultChecked
    defaultChecked: Boolean = false,
    // SRC: contract.channels.checked.onChange=onChange
    // SRC: ir.normalizedChannels[0].callbackKind=value → (Boolean) -> Unit
    onCheckedChange: ((Boolean) -> Unit)? = null,
    // SRC: contract.props.styled.members[name=size], default=md
    size: SwitchSize = SwitchSize.Md,
    // SRC: contract.props.styled.members[name=disabled, type=boolean]
    // SRC: framework-grammar (Compose convention is `enabled` not `disabled`;
    //      contract.disabled=true ↔ enabled=false at the call site)
    enabled: Boolean = true,
    // SRC: contract.props.styled.members[name=name, type=string]
    // SRC: form.participates=true — Compose has no native <form>; `name`
    //      is retained for consumers that wire to a form layer.
    name: String? = null,
    // SRC: contract.props.styled.members[name=value, type=string]
    value: String? = null,
    // SRC: contract.a11y.labeling[0]=aria-label
    // SRC: framework-a11y (Compose contentDescription ≡ aria-label)
    contentDescription: String? = null,
    modifier: Modifier = Modifier,
) {
    // SRC: ir.normalizedChannels[0] → controllable-state pattern
    // SRC: semantic (controlled-takes-precedence-over-uncontrolled)
    var uncontrolledChecked by remember { mutableStateOf(defaultChecked) }
    val resolvedChecked = checked ?? uncontrolledChecked

    // SRC: contract.tokens.root["switch.size.md.track.width|height"]
    // GAP: only md tokens shipped; sm/lg are guessed.
    val (trackWidth, trackHeight) = when (size) {
        SwitchSize.Sm -> 36.dp to 18.dp  // GAP: not in contract
        SwitchSize.Md -> 48.dp to 24.dp  // SRC: contract.tokens.root.switch.size.md.*
        SwitchSize.Lg -> 60.dp to 30.dp  // GAP: not in contract
    }

    // SRC: anatomy.dom: <label> + <input role=switch> + track/thumb spans
    //      → Compose's M3Switch IS the entire anatomy (track + thumb are
    //      drawn by the material theme). Collapse parallels SwiftUI/RN.
    M3Switch(
        // SRC: ir.normalizedChannels[0] → controlled value
        checked = resolvedChecked,
        // SRC: ir.normalizedChannels[0] → controlled change handler
        onCheckedChange = { next ->
            if (checked == null) {
                uncontrolledChecked = next
            }
            onCheckedChange?.invoke(next)
        },
        // SRC: contract.props.disabled (negated for Compose convention)
        enabled = enabled,
        modifier = modifier
            // SRC: contract.variants.size → token-driven sizing
            .size(width = trackWidth, height = trackHeight)
            // SRC: contract.a11y.labeling[2]=aria-checked
            // SRC: framework-a11y (Compose: semantics block; role=switch
            //      → Role.Switch, aria-checked → ToggleableState)
            .semantics {
                role = Role.Switch
                toggleableState = if (resolvedChecked) ToggleableState.On else ToggleableState.Off
                if (contentDescription != null) {
                    stateDescription = if (resolvedChecked) "on" else "off"
                }
            },
        // SRC: contract.tokens (colors)
        // GAP: token resolution per state requires a Theme.kt module the
        //      contract doesn't currently bind. Falling back to M3
        //      defaults.
        colors = SwitchDefaults.colors(),
    )
}
