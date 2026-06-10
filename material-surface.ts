// Material-surface projection (MATERIAL-SURFACE-PROJECTION-AUTHORITY-01).
//
// Builds the box-model surface the showcase editor inspects: the SAME
// primitive < morphology-profile < authored-sidecar merge codegen realizes
// into `<Name>.tokens.css`, with provenance per slot. The value layers come
// straight from ds-codegen (`loadBoxModelPrimitive`, `resolveStyleProfile`) —
// this module replays the documented precedence to tag each slot's source, and
// the test suite asserts the values stay byte-equal to codegen's
// `mergeBoxModelDefaults` output so the projection cannot drift from the
// authority it projects.
//
// Node-only (the codegen loader reads the contracts package off disk). It is
// imported by `vite-plugin-fsds-data.ts` at bundle-build time and by tests —
// never by client code; the client consumes the result via
// `ComponentBundle.boxModelSurface`.

import {
  loadBoxModelPrimitive,
  resolveStyleProfile,
} from "./packages/ds-codegen/src/box-model.js";
import type { TokenResolution } from "./packages/ds-codegen/src/contract.js";
import type { BoxModelSurfaceSlot, TokenDefinition } from "./src/types/data";

/**
 * Project a component's full box-model slot pool with provenance.
 *
 * @param authoredTokens The component's raw tokens sidecar (`contract.tokens`);
 *                       only its `box-model.*` keys participate.
 * @param morphology     The contract's morphology axis, if any.
 */
export function buildBoxModelSurface(
  authoredTokens: Record<string, TokenDefinition> | undefined,
  morphology: string | undefined,
): BoxModelSurfaceSlot[] {
  const primitive = loadBoxModelPrimitive();
  const profile = resolveStyleProfile(morphology);

  const out: BoxModelSurfaceSlot[] = [];
  for (const slot of primitive.slotNames) {
    const authored = authoredTokens?.[slot] as TokenResolution | undefined;
    const fromProfile = profile?.boxModelDefaults[slot];
    const winner = authored ?? fromProfile ?? primitive.defaults[slot];
    if (!winner) continue;
    const source: BoxModelSurfaceSlot["source"] = authored
      ? "authored"
      : fromProfile
        ? "morphology-profile"
        : "primitive-default";
    out.push({
      slot,
      ...(winner.resolvesTo !== undefined && { resolvesTo: winner.resolvesTo }),
      ...(winner.fallback !== undefined && { fallback: winner.fallback }),
      ...(winner.literal !== undefined && { literal: winner.literal }),
      ...(winner.layer !== undefined && {
        layer: winner.layer as BoxModelSurfaceSlot["layer"],
      }),
      source,
    });
  }
  return out;
}
