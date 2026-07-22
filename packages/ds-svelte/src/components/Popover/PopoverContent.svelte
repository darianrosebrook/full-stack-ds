<script lang="ts">
// @generated:start imports
import { usePopoverContext, usePopoverPlacement } from "./usePopover.svelte.js";
import { createAnchoredPosition, type AnchoredPlacement } from "../../primitives/surfaces/createAnchoredPosition.svelte.js";
import { portal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  class?: string;
  "data-testid"?: string;
  children?: import('svelte').Snippet;
}

let { class: className, "data-testid": dataTestid, children }: Props = $props();
// @generated:end

// @generated:start ctx
const ctx = usePopoverContext();
let contentEl: HTMLDivElement | null = $state(null);

$effect(() => {
  if (contentEl) ctx.registerContent(contentEl);
});

const position = createAnchoredPosition({
  anchor: () => ctx.anchorEl(),
  content: () => ctx.contentEl(),
  open: () => ctx.open(),
  placement: () => (usePopoverPlacement() ?? "auto") as AnchoredPlacement | "auto",
  collision: () => "flip-shift",
});
// @generated:end

// @custom:start trailing

// @custom:end
</script>

{#if ctx.open()}
  <div
    bind:this={contentEl}
    id={ctx.contentId}
    style="position: fixed; top: {position.state.top}px; left: {position.state.left}px; visibility: {position.state.ready ? 'visible' : 'hidden'};"
    data-placement={position.state.placement}
    use:portal={{ enabled: true }}
    class={className}
    data-testid={dataTestid}
    data-popover-content
  >
    {@render children?.()}
  </div>
{/if}
