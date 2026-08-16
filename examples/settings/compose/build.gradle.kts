// Settings example — jetpack-compose lane (FEAT-EXAMPLES-COMPOSE-SETTINGS-001).
// Desktop (JVM) Compose app consuming the generated ds-jetpack-compose package
// via composite-build substitution. Rung-1 sibling of the swift settings lane.

plugins {
    kotlin("jvm") version "2.1.20"
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.20"
    id("org.jetbrains.compose") version "1.8.0"
    application
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation("ds-jetpack-compose:library")
    implementation(compose.desktop.currentOs)
    implementation(compose.material3)
    implementation(compose.foundation)
}

application {
    mainClass.set("com.fullstackds.examples.settings.MainKt")
}
