<script lang="ts">
  import { createFocusTrap } from "../../createFocusTrap.svelte.js";

  let { active = true, empty = false }: { active?: boolean; empty?: boolean } = $props();
  let container: HTMLElement | null = $state(null);

  createFocusTrap({
    getActive: () => active,
    containerRef: {
      get el() {
        return container;
      },
    },
  });
</script>

<div bind:this={container} data-testid="trap">
  {#if !empty}
    <button data-testid="first">first</button>
    <input data-testid="mid" />
    <button data-testid="last">last</button>
  {/if}
</div>
