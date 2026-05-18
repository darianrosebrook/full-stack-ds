<script lang="ts">
// @generated:start imports
import type { Snippet } from "svelte";
import { useTooltipContext } from "./useTooltip.svelte.js";
import type { SurfaceTriggerProps } from "../../primitives/surfaces/createAnchoredSurface.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  /** When true, the consumer takes over the host element via
   *  the `child` snippet prop, which receives the whole
   *  `trigger` object (`{ action, attrs }`). When false
   *  (default), a `<button>` is rendered around the implicit
   *  `children` snippet. */
  asChild?: boolean;
  class?: string;
  "data-testid"?: string;
  /** Default-host content (used when asChild is false). */
  children?: Snippet;
  /** Host-adoption snippet (used when asChild is true). Receives
   *  the trigger object `{ action, attrs }`. The consumer applies
   *  `use:trigger.action` and spreads `{...trigger.attrs}` on
   *  the adopted element. Applying one without the other will
   *  silently break the substrate — both are required. */
  child?: Snippet<[SurfaceTriggerProps]>;
}

let {
  asChild,
  class: className,
  "data-testid": dataTestid,
  children,
  child,
}: Props = $props();
// @generated:end

// @generated:start ctx
const ctx = useTooltipContext();

let buttonEl: HTMLButtonElement | null = $state(null);

// Default-host path: bind the rendered <button> as the anchor
// (substrate auto-wires DOM listeners on it). The adoption path
// is owned by trigger.action and does not need a $effect here.
$effect(() => {
  if (!asChild && buttonEl) ctx.registerAnchor(buttonEl);
});

// Reactive ARIA + data subset for the default-host <button>. We
// strip event handlers because the controller wires them as DOM
// listeners in default-host mode (they would double-fire if also
// spread as Svelte handlers).
const defaultHostBindings = $derived.by(() => {
  const { attrs } = ctx.getTriggerProps();
  const { onpointerenter, onpointerleave, onfocus, onblur, onclick, ...rest } = attrs;
  return rest;
});
// @generated:end

// @custom:start trailing

// @custom:end
</script>

{#if asChild}
  {@render child?.(ctx.getTriggerProps())}
{:else}
  <button
    type="button"
    bind:this={buttonEl}
    class={className}
    data-testid={dataTestid}
    {...defaultHostBindings}
  >
    {@render children?.()}
  </button>
{/if}
