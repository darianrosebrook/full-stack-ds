// Settings example — jetpack-compose lane.
//
// Realizes the framework-neutral examples/settings/spec.md against the
// generated ds-jetpack-compose package. Only Switch and ToggleSwitch exist
// on this target today (native-collapse path, FEAT-COMPOSE-EMITTER-WIRING-001),
// so the Preferences section is the fully realized region; every other
// region is composed from plain Compose and marked NOT FSDS so the
// partial-realization boundary is visible in source. See README.md for the
// claim/non-claim ledger.

package com.fullstackds.examples.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

// FSDS public exports only — the consumer boundary this lane falsifies.
import com.fullstackds.components.switch.Switch
import com.fullstackds.components.switch.SwitchSize

@Composable
fun SettingsApp(modifier: Modifier = Modifier) {
    // Channel-shaped consumer state (contract: controlled `checked` + `onChange`).
    var darkMode by remember { mutableStateOf(false) }
    var emailNotifications by remember { mutableStateOf(true) }
    var displayName by remember { mutableStateOf("Ada Lovelace") }
    var email by remember { mutableStateOf("ada@example.com") }

    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(24.dp),
    ) {
        ProfileSection( // NOT FSDS: Field/Input/Button not yet emitted on this target.
            displayName = displayName,
            onDisplayNameChange = { displayName = it },
            email = email,
            onEmailChange = { email = it },
        )
        PreferencesSection( // FSDS: fully realized through the generated Switch.
            darkMode = darkMode,
            onDarkModeChange = { darkMode = it },
            emailNotifications = emailNotifications,
            onEmailNotificationsChange = { emailNotifications = it },
        )
        DangerZoneSection() // NOT FSDS: Dialog not yet emitted on this target.
    }
}

@Composable
private fun ProfileSection(
    displayName: String,
    onDisplayNameChange: (String) -> Unit,
    email: String,
    onEmailChange: (String) -> Unit,
) {
    Card {
        Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Profile", style = MaterialTheme.typography.titleMedium)
            OutlinedTextField(
                value = displayName,
                onValueChange = onDisplayNameChange,
                label = { Text("Display name") },
            )
            OutlinedTextField(
                value = email,
                onValueChange = onEmailChange,
                label = { Text("Email") },
            )
            Button(onClick = { println("settings: save profile") }) {
                Text("Save profile")
            }
        }
    }
}

@Composable
private fun PreferencesSection(
    darkMode: Boolean,
    onDarkModeChange: (Boolean) -> Unit,
    emailNotifications: Boolean,
    onEmailNotificationsChange: (Boolean) -> Unit,
) {
    Card {
        Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Preferences", style = MaterialTheme.typography.titleMedium)
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Dark mode")
                // FSDS: generated Switch, controlled form (checked + onChange
                // per the contract channel; default false per spec).
                Switch(checked = darkMode, onChange = onDarkModeChange)
            }
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Email notifications")
                // FSDS: generated Switch, controlled form; the spec's tooltip
                // hint is a non-claim on this target (Tooltip not yet emitted)
                // — the content-description is carried via the public prop.
                Switch(
                    checked = emailNotifications,
                    onChange = onEmailNotificationsChange,
                    size = SwitchSize.Md,
                    contentDescription = "Product announcements and security alerts only.",
                )
            }
        }
    }
}

@Composable
private fun DangerZoneSection() {
    var confirmOpen by remember { mutableStateOf(false) }

    Card {
        Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Danger zone", style = MaterialTheme.typography.titleMedium)
            Text("Permanently delete your account. This cannot be undone.")
            Button(onClick = { confirmOpen = true }) {
                Text("Delete account")
            }
        }
    }

    if (confirmOpen) {
        ConfirmDeleteDialog(
            onDismiss = { confirmOpen = false },
            onConfirm = {
                println("settings: delete account")
                confirmOpen = false
            },
        )
    }
}

// NOT FSDS: the confirm dialog is plain material3 until the compose emitter
// grows the centered-modal surface class (the swift lane's Dialog path).
@Composable
private fun ConfirmDeleteDialog(
    onDismiss: () -> Unit,
    onConfirm: () -> Unit,
) {
    var confirmation by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Delete account?") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("This will permanently remove your account. Type DELETE to confirm.")
                OutlinedTextField(
                    value = confirmation,
                    onValueChange = { confirmation = it },
                    label = { Text("confirmation") },
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = onConfirm,
                enabled = confirmation == "DELETE",
            ) { Text("Delete") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
    )
}
