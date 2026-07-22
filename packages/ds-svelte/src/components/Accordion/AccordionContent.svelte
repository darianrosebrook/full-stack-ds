<script lang="ts">
// @generated:start imports
import { useAccordionContext } from "./useAccordion.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  value: string;
  class?: string;
  "data-testid"?: string;
  children?: import('svelte').Snippet;
}

let { value, class: className, "data-testid": dataTestid, children }: Props = $props();
// @generated:end

// @generated:start classes
const ctx = useAccordionContext();

const isOpen = $derived(ctx.isItemOpen(value));

const classes = $derived(["accordion__content", className].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div
  role="region"
  class={classes}
  id="{ctx.idBase}-content-{value}"
  aria-labelledby="{ctx.idBase}-trigger-{value}"
  hidden={!isOpen ? true : undefined}
  data-testid={dataTestid}
>
  <div class="accordion__contentInner">
    {@render children?.()}
  </div>
</div>
