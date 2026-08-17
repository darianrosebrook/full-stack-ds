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
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/** One token slot as authored in the token graph. Values stay raw strings;
 *  accessors below parse target-usable forms (dp, Color). */
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
