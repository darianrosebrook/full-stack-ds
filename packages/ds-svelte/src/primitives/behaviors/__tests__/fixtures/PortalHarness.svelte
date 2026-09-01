<script lang="ts">
  import { createPortal } from "../../createPortal.svelte.js";

  let {
    enabled = true,
    selector = "",
    element = null as HTMLElement | null,
  }: { enabled?: boolean; selector?: string; element?: HTMLElement | null } = $props();

  const portal = createPortal({
    enabled,
    target: element
      ? () => element
      : selector
        ? () => selector
        : undefined,
  });
</script>

<div data-testid="portal-target">{portal.target?.tagName ?? "none"}</div>
