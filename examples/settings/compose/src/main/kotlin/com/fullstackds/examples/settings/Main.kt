// Settings example — jetpack-compose lane, desktop entry point.
//
// Locally runnable: `./gradlew run` opens the settings window for visual
// inspection (the swift lane's runnability claim, mirrored). The lane's
// compile admission is `./gradlew compileKotlin` — CI runs exactly that.
//
// FEAT-COMPOSE-THEME-MODULE-001: the app installs the FSDS theme runtime —
// semantic defaults from the token graph, resolved by generated components
// through LocalFsdsTheme — and bridges it into MaterialTheme so the NOT FSDS
// fallback chrome renders in the same system as FSDS components. Swap the
// FsdsTheme value (any semantic slot override) to re-theme at runtime.

package com.fullstackds.examples.settings

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import com.fullstackds.tokens.FsdsSemanticDefaults
import com.fullstackds.tokens.FsdsTheme
import com.fullstackds.tokens.FsdsThemeProvider
import com.fullstackds.tokens.fsdsMaterialColorScheme

fun main() = application {
    Window(
        title = "FSDS Settings — Compose lane",
        onCloseRequest = ::exitApplication,
    ) {
        FsdsThemeProvider(FsdsTheme(FsdsSemanticDefaults.light)) {
            MaterialTheme(colorScheme = fsdsMaterialColorScheme()) {
                SettingsApp(Modifier.padding(24.dp))
            }
        }
    }
}
