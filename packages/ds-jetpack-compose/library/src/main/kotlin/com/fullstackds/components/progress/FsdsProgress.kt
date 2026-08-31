// FsdsProgressIndicator — custom-painted, token-driven progress/status
// substrate for the generated ds-jetpack-compose components
// (FEAT-COMPOSE-PASSIVE-LEAF-FAMILIES-01).
//
// Foundation-only by doctrine: zero androidx.compose.material imports (the
// Material progress indicators expose a different slot surface than the
// contract's token grammar — per-intent fill colors, thickness/size axes,
// indeterminate motion duration — so the substrate paints track/fill/spinner
// from RESOLVED token values the generated component resolves through
// LocalFsdsTheme).
//
// Semantics: progressBarRangeInfo carries the determinate fraction (or the
// indeterminate sentinel) exactly like M3's indicators; the contentDescription
// carries the contract's label prop. Ownership non-claims: hand-rolled
// animation physics replace platform indicators (no elevation/tonal
// interpolation, indeterminate is a sliding/sweeping fill rather than a
// keyframe system).
package com.fullstackds.components.progress

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.progressBarRangeInfo
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import kotlin.math.min

/** Fully-resolved progress/status styling — @Immutable so the generated
 *  component's style object stays skippable (M3 stability contract). */
@Immutable
class FsdsProgressIndicatorStyle(
    val trackColor: Color = Color(0xFFD0D0D0),
    val fillColor: Color = Color(0xFF0566FE),
    val thickness: Dp = 4.dp,
    val spinnerSize: Dp = 24.dp,
    val spinnerStrokeWidth: Dp = 3.dp,
    val durationMs: Int = 1200,
)

/** Linear bar when `linear` is true (determinate when `progress` is non-null,
 *  an indeterminate sliding fill when null); circular spinner otherwise. */
@Composable
fun FsdsProgressIndicator(
    progress: Float?,
    linear: Boolean,
    modifier: Modifier = Modifier,
    size: Dp = 24.dp,
    strokeWidth: Dp = 4.dp,
    trackColor: Color = Color(0xFFD0D0D0),
    fillColor: Color = Color(0xFF0566FE),
    durationMs: Int = 1200,
    contentDescription: String? = null,
) {
    val style = FsdsProgressIndicatorStyle(
        trackColor = trackColor,
        fillColor = fillColor,
        thickness = if (linear) strokeWidth else size / 8,
        spinnerSize = size,
        spinnerStrokeWidth = if (linear) strokeWidth else size / 8,
        durationMs = durationMs,
    )
    if (linear) {
        LinearIndicator(progress, style, modifier, contentDescription)
    } else {
        CircularIndicator(style, modifier, contentDescription)
    }
}

@Composable
private fun LinearIndicator(
    progress: Float?,
    style: FsdsProgressIndicatorStyle,
    modifier: Modifier,
    contentDescription: String?,
) {
    val animatedProgress by animateFloatAsState(
        targetValue = progress ?: 0f,
        animationSpec = tween(style.durationMs),
        label = "fsds-progress-fill",
    )
    val indeterminatePhase by rememberInfiniteTransition(label = "fsds-progress-indeterminate")
        .animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(tween(style.durationMs, easing = LinearEasing)),
            label = "fsds-progress-indeterminate-phase",
        )
    Canvas(
        modifier = modifier
            .height(style.thickness)
            .semantics {
                progressBarRangeInfo = if (progress != null) {
                    androidx.compose.ui.semantics.ProgressBarRangeInfo(
                        progress.coerceIn(0f, 1f),
                        0f..1f,
                        0,
                    )
                } else {
                    androidx.compose.ui.semantics.ProgressBarRangeInfo(0f, 0f..0f, 0)
                }
                if (contentDescription != null) this.contentDescription = contentDescription
            },
    ) {
        val w = size.width
        val h = size.height
        val radius = CornerRadius(min(h / 2, 4.dp.toPx()))
        drawRoundRect(style.trackColor, cornerRadius = radius)
        val fillFraction = if (progress != null) {
            animatedProgress
        } else {
            // Indeterminate: a quarter-width fill sliding across the track.
            val slide = indeterminatePhase
            val band = 0.25f
            val start = (slide * (1f + band)) - band
            (start + band).coerceAtMost(1f) - start.coerceAtLeast(0f)
        }
        if (fillFraction > 0f) {
            drawRoundRect(
                style.fillColor,
                size = Size(w * fillFraction, h),
                cornerRadius = radius,
            )
        }
    }
}

@Composable
private fun CircularIndicator(
    style: FsdsProgressIndicatorStyle,
    modifier: Modifier,
    contentDescription: String?,
) {
    val transition = rememberInfiniteTransition(label = "fsds-spinner")
    val angle by transition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            tween(style.durationMs, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "fsds-spinner-angle",
    )
    val sweepFraction by transition.animateFloat(
        initialValue = 0.1f,
        targetValue = 0.8f,
        animationSpec = infiniteRepeatable(
            tween(style.durationMs / 2, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "fsds-spinner-sweep",
    )
    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(
            modifier = Modifier
                .size(style.spinnerSize)
                .semantics {
                    progressBarRangeInfo =
                        androidx.compose.ui.semantics.ProgressBarRangeInfo(0f, 0f..0f, 0)
                    if (contentDescription != null) this.contentDescription = contentDescription
                },
        ) {
            drawArc(
                color = style.fillColor,
                startAngle = angle,
                sweepAngle = 360f * sweepFraction,
                useCenter = false,
                style = Stroke(width = style.spinnerStrokeWidth.toPx(), cap = StrokeCap.Round),
            )
        }
    }
}
