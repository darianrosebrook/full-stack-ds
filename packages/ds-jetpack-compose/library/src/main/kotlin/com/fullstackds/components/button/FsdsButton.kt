package com.fullstackds.components.button

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.border
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Owned button substrate (FEAT-COMPOSE-BUTTON-ADMISSION-01) — the painted
 * counterpart of FsdsToggle. Foundation-only by doctrine: zero
 * androidx.compose.material imports. The Material 3 button exposes too few
 * slots to realize the contract's per-state color surface, so interaction
 * states (hover/active/disabled), the focus ring, border, corner radius,
 * and press animation are painted here from the style the generated
 * component resolves through LocalFsdsTheme.
 *
 * Ownership non-claims (same class as the toggle substrate): hand-rolled
 * interaction physics replace Google-maintained ripple behavior
 * (indication is null — painted state changes only), and there is no
 * Material elevation/tonal interpolation.
 */
class FsdsButtonStyle(
    val containerColor: Color? = null,
    val containerColorHover: Color? = null,
    val containerColorActive: Color? = null,
    val containerColorDisabled: Color? = null,
    val contentColor: Color? = null,
    val contentColorDisabled: Color? = null,
    val borderColor: Color? = null,
    val borderWidth: Dp = 1.dp,
    val cornerRadius: Dp = 4.dp,
    val focusRingColor: Color? = null,
    val focusRingWidth: Dp = 2.dp,
    val pressDurationMs: Int = 100,
    val minHeight: Dp = 32.dp,
    val minWidth: Dp = 32.dp,
    val padding: PaddingValues = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
)

/** Content scope: exposes the state-aware content color to projected children. */
class FsdsButtonScope internal constructor(val contentColor: Color)

@Composable
fun FsdsButton(
    onClick: (() -> Unit)?,
    style: FsdsButtonStyle,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    contentDescription: String? = null,
    content: @Composable FsdsButtonScope.() -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val focused by interactionSource.collectIsFocusedAsState()

    // Hover is not observable on the shared desktop lane; the active
    // (pressed) and disabled states carry the interaction surface and the
    // hover slot stays resolved-but-unwired pending a pointer-input pass.
    val containerTarget = when {
        !enabled -> style.containerColorDisabled
        pressed -> style.containerColorActive ?: style.containerColorHover ?: style.containerColor
        else -> style.containerColor
    } ?: Color.Transparent
    val contentTarget = (if (enabled) style.contentColor else style.contentColorDisabled ?: style.contentColor)
        ?: Color.Unspecified
    val container by animateColorAsState(containerTarget, tween(style.pressDurationMs), label = "fsdsButtonContainer")
    val content by animateColorAsState(contentTarget, tween(style.pressDurationMs), label = "fsdsButtonContent")

    val ringColor = if (focused) style.focusRingColor ?: style.borderColor else style.borderColor
    val ringWidth = if (focused) style.focusRingWidth else style.borderWidth
    val shape = RoundedCornerShape(style.cornerRadius)
    val border = if (ringColor != null) Modifier.border(BorderStroke(ringWidth, ringColor), shape) else Modifier

    Box(
        modifier = modifier
            .defaultMinSize(minWidth = style.minWidth, minHeight = style.minHeight)
            .background(container, shape)
            .then(border)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                enabled = enabled,
                role = Role.Button,
                onClick = { onClick?.invoke() },
            )
            .focusable(interactionSource = interactionSource, enabled = enabled)
            .padding(style.padding)
            .semantics {
                if (contentDescription != null) this.contentDescription = contentDescription
                role = Role.Button
            },
    ) {
        FsdsButtonScope(content).content()
    }
}
