// Plugin `main` for the FSDS Style Spike dev plugin.
//
// This runs INSIDE the native Figma plugin sandbox (loaded via a dev manifest),
// where `figma` is the real plugin API — NOT via window.figma in the editor
// page. It executes the bounded style spike, then SERIALIZES the evidence two
// ways the DevTools/browser side can read without ever calling figma itself:
//   1. figma.root.setSharedPluginData("fsds", "style.spike.evidence", json)
//   2. console.log("FSDS_SPIKE_EVIDENCE " + json)  -> browser console
// The build step prepends globalThis.__fsdsStyleSpikeBindings (the resolver's
// Checkbox.indicator bindings) so this entry stays data-free.

import { runStyleSpike, type SpikeFigma } from "../src/live-run.js";
import type { ResolvedBinding } from "../src/live-token-resolve.js";

declare const figma: SpikeFigma & {
  notify(msg: string): void;
  closePlugin(msg?: string): void;
};

const bindings =
  (globalThis as unknown as { __fsdsStyleSpikeBindings?: ResolvedBinding[] })
    .__fsdsStyleSpikeBindings ?? [];

try {
  const evidence = runStyleSpike(figma, bindings);
  const payload = JSON.stringify(evidence);
  figma.root.setSharedPluginData("fsds", "style.spike.evidence", payload);
  // Single-line, greppable marker so chrome-devtools list_console_messages can
  // pluck the evidence object out of the browser console.
  console.log("FSDS_SPIKE_EVIDENCE " + payload);
  figma.notify(
    `FSDS style spike: digestEqual=${evidence.digestEqual} dupes=${evidence.duplicateCarriers}`,
  );
  figma.closePlugin("FSDS style spike complete");
} catch (err) {
  const msg = err instanceof Error ? err.stack || err.message : String(err);
  console.log("FSDS_SPIKE_ERROR " + msg);
  figma.root.setSharedPluginData("fsds", "style.spike.evidence", JSON.stringify({ error: msg }));
  figma.closePlugin("FSDS style spike failed");
}
