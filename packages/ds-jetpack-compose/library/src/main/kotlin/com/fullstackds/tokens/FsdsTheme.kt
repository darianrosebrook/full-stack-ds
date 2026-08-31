// FsdsTheme — hand-maintained token runtime for the generated
// ds-jetpack-compose components (the Compose analog of
// @full-stack-ds/react-native's tokens/index.tsx and ds-swiftui's
// FsdsTheme.swift). Generated components ship their token scopes as DATA
// (`ComponentTokenScopes`) and resolve them at composition time through
// whatever theme the composition carries — so a consumer can override any
// semantic slot by name without regenerating code.
//
// Resolution semantics mirror the RN module exactly (source of truth,
// resolveTokenValue in tokens/index.tsx):
//   literal  →  theme.tokens[ref]  →  fallback
// A baked literal always wins; theme overrides arrive through the SEMANTIC
// ref name (e.g. "semantic.color.foreground.accent"); the fallback is the
// contract's last-resort literal.
//
// This file is NOT generated. Do not edit generated component files; edit
// this file only to widen the runtime (new accessors, bridge roles).

package com.fullstackds.tokens

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/** One token slot as authored in the token graph. Values stay raw strings;
 *  accessors below parse target-usable forms (dp, Color). @Immutable so the
 *  scope maps and derived style objects stay skippable across recomposition
 *  (the M3-style stability contract). */
@Immutable
class ComponentTokenDefinition(
    val name: String,
    val cssVar: String,
    val ref: String? = null,
    val literal: String? = null,
    val fallback: String? = null,
)

typealias ComponentTokenScope = Map<String, ComponentTokenDefinition>
typealias ComponentTokenScopes = Map<String, ComponentTokenScope>

/** Theme = override map keyed by semantic token name. The empty theme
 *  resolves everything from per-slot fallbacks. */
class FsdsTheme(val tokens: Map<String, String> = emptyMap()) {
    fun resolve(definition: ComponentTokenDefinition?): String? {
        if (definition == null) return null
        if (definition.literal != null) return definition.literal
        val ref = definition.ref
        if (ref != null) {
            val overridden = tokens[ref]
            if (overridden != null) return overridden
        }
        return definition.fallback
    }
}

val LocalFsdsTheme = staticCompositionLocalOf { FsdsTheme() }

/**
 * Foundation-only content-color local — the Compose analog of swift's
 * `foregroundStyle` / RN's `color` on the element, without material3's
 * LocalContentColor (owned-substrate doctrine). Generated static-content
 * components provide their resolved foreground slot here so nested text
 * inherits the design-system tone inside colored chrome. Color.Unspecified
 * means "inherit" (the default when a component carries no foreground slot).
 */
val LocalFsdsContentColor = staticCompositionLocalOf { Color.Unspecified }

/**
 * Foundation-only text-style local — the Compose analog of the type scale a
 * content root carries. Generated content-role components resolve their
 * typography slots into a TextStyle and provide it here. The provider below
 * also mirrors it into material3's LocalTextStyle so plain-M3 Text consumers
 * inherit the design-system type scale (the material import lives in this
 * hand-authored runtime, never in generated code — owned-substrate doctrine).
 */
val LocalFsdsTextStyle = staticCompositionLocalOf { TextStyle.Default }

/**
 * Provide the FSDS type scale to a content region. Wraps the content lambda
 * so both LocalFsdsTextStyle readers (FSDS-aware text) and material3
 * LocalTextStyle readers (M3 Text) inherit the resolved style.
 */
@Composable
fun ProvideFsdsTextStyle(textStyle: TextStyle, content: @Composable () -> Unit) {
    CompositionLocalProvider(
        LocalFsdsTextStyle provides textStyle,
        LocalTextStyle provides textStyle,
        content = content,
    )
}

@Composable
fun FsdsThemeProvider(theme: FsdsTheme, content: @Composable () -> Unit) {
    CompositionLocalProvider(LocalFsdsTheme provides theme) { content() }
}

/** Parse "#RGB" / "#RRGGBB" / "#RRGGBBAA" into a Compose Color; null otherwise. */
fun String?.toFsdsColor(): Color? {
    if (this == null || !startsWith("#")) return null
    val hex = removePrefix("#")
    return when (hex.length) {
        3 -> Color(
            red = ("${hex[0]}${hex[0]}".toIntOrNull(16) ?: return null) / 255f,
            green = ("${hex[1]}${hex[1]}".toIntOrNull(16) ?: return null) / 255f,
            blue = ("${hex[2]}${hex[2]}".toIntOrNull(16) ?: return null) / 255f,
        )
        6, 8 -> {
            val argb = hex.toLongOrNull(16) ?: return null
            val full = if (hex.length == 6) (0xFF shl 24) or argb.toInt() else argb.toInt()
            Color(full)
        }
        else -> null
    }
}

/** Parse a px-like token ("8px" → 8.dp). Unparsable units (rem, %, …) return
 *  null and callers skip the property — the swift runtime's convention. */
fun String?.toFsdsDp(): Dp? {
    if (this == null) return null
    val match = Regex("^(-?[0-9]+(?:\\.[0-9]+)?)px$").find(this.trim()) ?: return null
    return match.groupValues[1].toFloatOrNull()?.dp
}

/** Parse a px-like token into sp for font sizes ("16px" → 16.sp). rem-based
 *  fallbacks (the CSS-authoring vocabulary) resolve only when the semantic
 *  defaults theme overrides them with graph px values; otherwise null. */
fun String?.toFsdsSp(): TextUnit? {
    if (this == null) return null
    val match = Regex("^(-?[0-9]+(?:\\.[0-9]+)?)px$").find(this.trim()) ?: return null
    return match.groupValues[1].toFloatOrNull()?.sp
}

/** Parse a numeric font-weight token ("400"/"500"/"700") into FontWeight. */
fun String?.toFsdsWeight(): FontWeight? {
    if (this == null) return null
    val value = this.trim().toIntOrNull() ?: return null
    return if (value in 100..900) FontWeight(value) else null
}

/**
 * Light-half semantic defaults resolved from the token graph
 * (packages/ds-tokens/generated/tokens.css, base :root layer at
 * FEAT-COMPOSE-THEME-MODULE-001 authoring time). Component slot refs
 * resolve through these when no app theme overrides them. The dark half and
 * the mode/brand/density switching axes are reserved follow-up rungs.
 */
object FsdsSemanticDefaults {
    val light: Map<String, String> = mapOf(
        // semantic.color.foreground.accent → core red-500
        "semantic.color.foreground.accent" to "#d92d2e",
        // semantic.color.background.tertiary → core neutral-200
        "semantic.color.background.tertiary" to "#b8b8b8",
        // semantic.color.background.secondary → core neutral-100
        "semantic.color.background.secondary" to "#d0d0d0",
        // semantic.color.background.primary → core mode-white (light half)
        "semantic.color.background.primary" to "#ffffff",
        // semantic.color.action.* → core brand-primary-500/600/700, mode-white
        "semantic.color.action.background.primary.default" to "#0566fe",
        "semantic.color.action.background.primary.hover" to "#034fd6",
        "semantic.color.action.background.primary.active" to "#013ab0",
        "semantic.color.action.foreground.primary.default" to "#ffffff",
        "semantic.color.action.border.primary.default" to "#0566fe",
        // core.typography.ramp.* → graph px values (mirrors the swift
        // FsdsTheme semantic-defaults table; component scopes fall back to
        // rem strings, which the px accessors skip — the theme override is
        // what makes fontSize resolve).
        "core.typography.ramp.2" to "12px",
        "core.typography.ramp.3" to "14px",
        "core.typography.ramp.4" to "16px",
        "core.typography.ramp.5" to "18px",
        "core.typography.ramp.6" to "20px",
        "core.typography.ramp.7" to "24px",
        "core.typography.ramp.8" to "32px",
        "core.typography.ramp.11" to "60px",
        "core.typography.weight.medium" to "500",
    )
}

/**
 * Bridge FSDS semantic tokens into a Material 3 ColorScheme so plain-M3
 * fallback chrome (Buttons, Cards, dialogs) renders in the same system as
 * FSDS components — one fixed graph-derived table, no hand-picked colors.
 * Unmapped roles keep Material defaults (noted in the lane README).
 */
fun fsdsMaterialColorScheme(theme: FsdsTheme = FsdsTheme(FsdsSemanticDefaults.light)): ColorScheme {
    fun semantic(name: String): Color? = theme.tokens[name]?.toFsdsColor()
    val primary = semantic("semantic.color.action.background.primary.default")
    val onPrimary = semantic("semantic.color.action.foreground.primary.default")
    val primaryDark = semantic("semantic.color.action.background.primary.active")
    val surface = semantic("semantic.color.background.primary")
    val outline = semantic("semantic.color.background.tertiary")
    return lightColorScheme(
        primary = primary ?: Color(0xFF0566FE),
        onPrimary = onPrimary ?: Color.White,
        secondary = primaryDark ?: Color(0xFF013AB0),
        onSecondary = onPrimary ?: Color.White,
        background = surface ?: Color.White,
        onBackground = Color(0xFF474647), // core neutral-700 text tone
        surface = surface ?: Color.White,
        onSurface = Color(0xFF474647),
        outline = outline ?: Color(0xFFB8B8B8),
    )
}

/** Parse a duration token ("100" or "100ms") into milliseconds; null otherwise. */
fun String?.toFsdsMs(): Int? {
    if (this == null) return null
    val match = Regex("^([0-9]+)ms?$").find(this.trim()) ?: return null
    return match.groupValues[1].toIntOrNull()
}
