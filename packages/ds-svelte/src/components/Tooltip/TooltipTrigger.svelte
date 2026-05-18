<script lang="ts">
// @generated:start imports
import type { Snippet } from "svelte";
import { useTooltipContext } from "./useTooltip.svelte.js";
import type { SurfaceTriggerBinding } from "../../primitives/surfaces/createAnchoredSurface.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  /** When true, the consumer takes over the host element via
   *  the `trigger` snippet prop, which receives the split
   *  `{ action, attrs }` binding. When false (default), a
   *  `<button>` is rendered around the implicit `children`. */
  asChild?: boolean;
  class?: string;
  "data-testid"?: string;
  /** Default-host content (used when asChild is false). */
  children?: Snippet;
  /** Host-adoption snippet (used when asChild is true). Receives
   *  the split binding `{ action, attrs }`. The consumer applies
   *  `use:action` and spreads `{...attrs}` on the adopted
   *  element. Applying one without the other will silently break
   *  the substrate — both are required. */
  trigger?: Snippet<[SurfaceTriggerBinding]>;
}

let {
  asChild,
  class: className,
  "data-testid": dataTestid,
  children,
  trigger,
}: Props = $props();
// @generated:end

// @generated:start ctx
const ctx = useTooltipContext();

let buttonEl: HTMLButtonElement | null = $state(null);

// Default-host path: bind the rendered <button> as the anchor
// (substrate auto-wires DOM listeners on it). The adoption path
// is owned by the binding's `action` and does not need a $effect
// here.
$effect(() => {
  if (!asChild && buttonEl) ctx.registerAnchor(buttonEl);
});

// Reactive ARIA + data subset for the default-host <button>. We
// strip event handlers because the controller wires them as DOM
// listeners in default-host mode (they would double-fire if also
// spread as Svelte handlers).
const defaultHostBindings = $derived.by(() => {
  const { attrs } = ctx.getTriggerBinding();
  const { onpointerenter, onpointerleave, onfocus, onblur, onclick, ...rest } = attrs;
  return rest;
});
// @generated:end

// @custom:start trailing

// @custom:end
</script>

{#if asChild}
  {@render trigger?.(ctx.getTriggerBinding())}
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
