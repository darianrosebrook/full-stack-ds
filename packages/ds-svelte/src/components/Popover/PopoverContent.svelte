<script lang="ts">
// @generated:start imports
import { usePopoverContext } from "./usePopover.svelte.js";
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
// @generated:end

// @custom:start trailing

// @custom:end
</script>

{#if ctx.open()}
  <div
    bind:this={contentEl}
    id={ctx.contentId}
    class={className}
    data-testid={dataTestid}
    data-popover-content
  >
    {@render children?.()}
  </div>
{/if}
