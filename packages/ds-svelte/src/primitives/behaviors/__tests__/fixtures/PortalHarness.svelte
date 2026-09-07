<script lang="ts">
  import { createPortal } from "../../createPortal.svelte.js";

  let {
    enabled = true,
    selector = "",
    element = null as HTMLElement | null,
  }: { enabled?: boolean; selector?: string; element?: HTMLElement | null } = $props();

  // The target decision lives INSIDE the getter: createPortal re-invokes it
  // from an $effect, so a late-arriving `element`/`selector` prop re-resolves
  // instead of freezing the branch at mount.
  // `enabled` is a mount-time gate by the primitive's contract (react's
  // usePortal re-reads it per render — parity gap tracked in
  // docs/internal/successor-work.md), so its local capture is deliberate.
  const portal = createPortal({
    enabled,
    target: () => {
      if (element) return element;
      if (selector) return selector;
      return undefined;
    },
  });
</script>

<div data-testid="portal-target">{portal.target?.tagName ?? "none"}</div>
