// Settings example — jetpack-compose lane, desktop entry point.
//
// Locally runnable: `./gradlew run` opens the settings window for visual
// inspection (the swift lane's runnability claim, mirrored). The lane's
// compile admission is `./gradlew compileKotlin` — CI runs exactly that.

package com.fullstackds.examples.settings

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application

fun main() = application {
    Window(
        title = "FSDS Settings — Compose lane",
        onCloseRequest = ::exitApplication,
    ) {
        MaterialTheme {
            SettingsApp(Modifier.padding(24.dp))
        }
    }
}
