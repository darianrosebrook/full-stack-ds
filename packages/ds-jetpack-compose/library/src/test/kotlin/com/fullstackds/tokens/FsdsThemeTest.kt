package com.fullstackds.tokens

import java.io.File
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

private data class NativeTokenResolverCase(
    val id: String,
    val name: String,
    val ref: String?,
    val literal: String?,
    val fallback: String?,
    val themeByName: String?,
    val themeByRef: String?,
    val unrelatedTheme: String?,
    val expected: String,
)

private fun JsonObject.optionalString(key: String): String? =
    get(key)?.jsonPrimitive?.contentOrNull

private fun JsonObject.toResolverCase() = NativeTokenResolverCase(
    id = getValue("id").jsonPrimitive.content,
    name = getValue("name").jsonPrimitive.content,
    ref = optionalString("ref"),
    literal = optionalString("literal"),
    fallback = optionalString("fallback"),
    themeByName = optionalString("themeByName"),
    themeByRef = optionalString("themeByRef"),
    unrelatedTheme = optionalString("unrelatedTheme"),
    expected = getValue("expected").jsonPrimitive.content,
)

class FsdsThemeTest {
    @Test
    fun sharedFixtureDefinesAndPassesNativeResolutionPrecedence() {
        val fixturePath = checkNotNull(System.getProperty("fsds.nativeTokenResolverFixture"))
        val fixture = Json.parseToJsonElement(File(fixturePath).readText()).jsonObject
        assertEquals(1, fixture.getValue("version").jsonPrimitive.content.toInt())
        assertEquals(
            listOf("themeByName", "themeByRef", "literal", "fallback"),
            fixture.getValue("precedence").jsonArray.map { it.jsonPrimitive.content },
        )

        val cases = fixture.getValue("cases").jsonArray.map { it.jsonObject.toResolverCase() }
        for (testCase in cases) {
            val literalBacked = testCase.literal != null &&
                testCase.ref == null && testCase.fallback == null
            val tokenBacked = testCase.literal == null &&
                testCase.ref != null && testCase.fallback != null
            assertTrue(
                literalBacked || tokenBacked,
                "fixture case is not a legal token sidecar shape: ${testCase.id}",
            )

            val definition = ComponentTokenDefinition(
                name = testCase.name,
                cssVar = "--fixture",
                ref = testCase.ref,
                literal = testCase.literal,
                fallback = testCase.fallback,
            )
            val tokens = buildMap {
                testCase.themeByName?.let { put(testCase.name, it) }
                testCase.ref?.let { ref -> testCase.themeByRef?.let { put(ref, it) } }
                testCase.unrelatedTheme?.let { put("fixture.unrelated", it) }
            }
            assertEquals(
                testCase.expected,
                FsdsTheme(tokens).resolve(definition),
                testCase.id,
            )
        }
    }
}
