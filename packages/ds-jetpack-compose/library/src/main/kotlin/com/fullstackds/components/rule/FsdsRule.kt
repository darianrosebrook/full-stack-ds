// FsdsRule — token-driven separator substrate for the generated
// ds-jetpack-compose components (FEAT-COMPOSE-ADMISSION-SUBSTRATE-01).
//
// The bare-rule leaf class (an hr root, no channels, no projected content)
// lowers to this painted rule: orientation picks the painted axis, tokens
// supply color/thickness and the surface minimums. `decorative` follows the
// contract's semantics split — a decorative rule clears its semantics node
// entirely (the Compose analog of role="presentation"); a semantic separator
// keeps the default node so AT can traverse it.
//
// Zero androidx.compose.material imports: runtime/ui/foundation only. This
// file is NOT generated; it is committed substrate, like FsdsToggle.kt.

package com.fullstackds.components.rule

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.requiredSizeIn
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/** Orientation of the painted rule, lowered from the contract's enum axis. */
enum class FsdsRuleOrientation { Horizontal, Vertical }

/** Fully-resolved rule styling — @Immutable per the stability contract. */
@Immutable
class FsdsRuleStyle(
    val color: Color,
    val thickness: Dp,
    val minWidth: Dp = 0.dp,
    val minHeight: Dp = 0.dp,
    val padding: PaddingValues = PaddingValues(0.dp),
)

@Composable
fun FsdsRule(
    orientation: FsdsRuleOrientation,
    style: FsdsRuleStyle,
    modifier: Modifier = Modifier,
    decorative: Boolean = false,
) {
    val base = modifier
        .padding(style.padding)
        .requiredSizeIn(minWidth = style.minWidth, minHeight = style.minHeight)
    val painted = when (orientation) {
        FsdsRuleOrientation.Horizontal ->
            base.fillMaxWidth().height(style.thickness).background(style.color)
        FsdsRuleOrientation.Vertical ->
            base.fillMaxHeight().width(style.thickness).background(style.color)
    }
    Box(
        modifier = if (decorative) {
            painted.clearAndSetSemantics { }
        } else {
            painted
        },
    )
}
