// Generated-component library. `library/src/main/kotlin/com/fullstackds/components`
// is the codegen components root — `pnpm run generate -- --target=jetpack-compose`
// writes `<Name>/<Name>.kt` there against the Material 3 surface compiled below.

plugins {
    kotlin("jvm")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.compose")
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation(compose.runtime)
    implementation(compose.foundation)
    implementation(compose.material3)
}
