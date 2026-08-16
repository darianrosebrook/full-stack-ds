// Root build for the generated ds-jetpack-compose package.
// Rung 1 of the declared Android ladder (FEAT-COMPOSE-EMITTER-WIRING-001):
// Compose Multiplatform JVM compilation against the real androidx.compose-
// compatible runtime. No Android SDK, no emulator — see README.md.

plugins {
    kotlin("jvm") version "2.1.20" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.20" apply false
    id("org.jetbrains.compose") version "1.8.0" apply false
}
