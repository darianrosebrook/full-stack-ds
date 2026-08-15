// Settings example — swift lane.
//
// Realizes the framework-neutral examples/settings/spec.md against the
// generated DsSwiftUI package. Only the Switch component exists on this
// target today (native-collapse path), so the Preferences section is the
// fully realized region; every other region is composed from plain SwiftUI
// and marked `NOT FSDS` so the partial-realization boundary is visible in
// source. See README.md for the claim/non-claim ledger.

import SwiftUI
import DsSwiftUI

@main
struct SettingsExampleApp: App {
    var body: some Scene {
        WindowGroup {
            SettingsView()
        }
    }
}

struct SettingsView: View {
    // Channel-shaped consumer state (contract: controlled `checked` +
    // `onChange`). DsSwiftUI.Switch accepts a Binding — the controlled form.
    @State private var darkMode = false
    @State private var emailNotifications = true
    @State private var displayName = "Ada Lovelace"
    @State private var email = "ada@example.com"
    @State private var confirmOpen = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                profileSection
                preferencesSection
                dangerZoneSection
            }
            .padding(24)
            .frame(maxWidth: 560, alignment: .leading)
        }
    }

    // NOT FSDS: Card/CardHeader/CardContent are not emitted for swiftui yet.
    @ViewBuilder
    private func sectionHeading(_ heading: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(heading)
                .font(.headline)
            Divider()
        }
    }

    private var profileSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeading("Profile")
            // NOT FSDS: Field/Input are not emitted for swiftui yet.
            LabeledContent("Display name") {
                TextField("Display name", text: $displayName)
            }
            LabeledContent("Email") {
                TextField("Email", text: $email)
            }
            // NOT FSDS: Button variant=primary is not emitted for swiftui yet.
            Button("Save profile") {
                print("save profile: \(displayName) <\(email)>")
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(.background.secondary)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    /// Fully realized region: every switch row is the FSDS `Switch` from
    /// `import DsSwiftUI`, driven through its controlled channel, and row
    /// layout composes the FSDS `Stack` primitive (the spec mandates Stack
    /// for all multi-child layout).
    private var preferencesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeading("Preferences")
            Stack(variant: .horizontal) {
                Text("Dark mode")
                Spacer()
                Switch(
                    checked: $darkMode,
                    onChange: { value in print("dark mode:", value) }
                )
            }
            Stack(variant: .horizontal) {
                // NOT FSDS: Tooltip is not emitted for swiftui yet; the
                // spec's tooltip content renders as caption text instead.
                VStack(alignment: .leading, spacing: 2) {
                    Text("Email notifications")
                    Text("Product announcements and security alerts only.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Switch(
                    checked: $emailNotifications,
                    onChange: { value in print("email notifications:", value) }
                )
            }
        }
        .padding()
        .background(.background.secondary)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var dangerZoneSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionHeading("Danger zone")
            Text("Permanently delete your account. This cannot be undone.")
            // NOT FSDS: Button variant=destructive + Dialog are not emitted
            // for swiftui yet; a confirmation dialog stands in.
            Button("Delete account") {
                confirmOpen = true
            }
            .buttonStyle(.borderedProminent)
            .tint(.red)
        }
        .padding()
        .background(.background.secondary)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .confirmationDialog(
            "Delete account?",
            isPresented: $confirmOpen,
            titleVisibility: .visible
        ) {
            Button("Confirm deletion", role: .destructive) {
                print("account deleted (no-op)")
            }
        } message: {
            Text("This action cannot be undone.")
        }
    }
}
