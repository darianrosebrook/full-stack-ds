/**
 * Jetpack Compose composable emission — scaffold.
 *
 * Target shape (single `.kt` file per component):
 *
 *   // @generated:start imports
 *   package com.fullstackds.button
 *
 *   import androidx.compose.foundation.layout.Row
 *   import androidx.compose.material3.Text
 *   import androidx.compose.runtime.Composable
 *   import androidx.compose.runtime.getValue
 *   import androidx.compose.runtime.mutableStateOf
 *   import androidx.compose.runtime.remember
 *   import androidx.compose.runtime.setValue
 *   import androidx.compose.ui.Modifier
 *   import androidx.compose.ui.semantics.Role
 *   import androidx.compose.ui.semantics.role
 *   import androidx.compose.ui.semantics.semantics
 *   import com.fullstackds.primitives.Stack
 *   // @generated:end
 *
 *   // @generated:start types
 *   enum class ButtonSize { Small, Medium, Large }
 *   // @generated:end
 *
 *   // @generated:start component
 *   @Composable
 *   fun Button(
 *     onClick: () -> Unit,
 *     modifier: Modifier = Modifier,
 *     size: ButtonSize = ButtonSize.Medium,
 *     enabled: Boolean = true,
 *     content: @Composable () -> Unit,
 *   ) {
 *     Stack(
 *       modifier = modifier
 *         .semantics { role = Role.Button }
 *         .clickable(enabled = enabled, onClick = onClick),
 *     ) { content() }
 *   }
 *   // @generated:end
 *
 * IR projection rules (deferred — must live in IR or a sibling
 * `non-react-types.ts`-equivalent, NOT branched on in this emitter):
 *   - Tag → Compose composable: `button` → clickable `Box`/`Surface`,
 *     `input` → `BasicTextField`, `div`/`span` → `Box`/`Row`/`Column`,
 *     text leaves → `Text`.
 *   - ARIA → `Modifier.semantics { ... }` with the IR's normalized
 *     projection.
 *   - Channels: controlled/uncontrolled state hoisting pair, identical
 *     in shape to Material 3's `value` / `onValueChange` convention.
 *   - Children slot: `content: @Composable () -> Unit` parameter,
 *     idiomatic Compose composition.
 */
import type { ComponentIR } from "../../ir.js";

export function generateJetpackComposeComponentSource(_ir: ComponentIR): string {
  throw new Error(
    "generateJetpackComposeComponentSource: not implemented — Jetpack Compose emitter is scaffold-only.",
  );
}
