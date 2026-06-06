// Compute the resolved Checkbox.indicator bindings (the one bounded carrier the
// live spike binds). Bundled (esbuild json loader embeds the inputs at build
// time) and eval'd by build-style-spike.mjs, which reads
// globalThis.__fsdsStyleSpikeBindings. This keeps the resolver the single source
// of the binding — the plugin bundle embeds the resolver's output, never a
// hand-written token path.
import {
  resolveDescriptorStyles,
  flattenResolvedTokens,
  type ResolverDescriptor,
} from "../src/live-token-resolve.js";
import resolved from "../../ds-tokens/generated/resolved.tokens.json";
import descriptor from "../src/generated/components/Checkbox/Checkbox.figma.json";

const tokens = flattenResolvedTokens(resolved);
const all = resolveDescriptorStyles(descriptor as unknown as ResolverDescriptor, tokens);
const indicator = all.filter(
  (b) => b.carrier.kind === "part" && b.carrier.part === "indicator",
);

(globalThis as unknown as { __fsdsStyleSpikeBindings?: unknown }).__fsdsStyleSpikeBindings =
  indicator;
