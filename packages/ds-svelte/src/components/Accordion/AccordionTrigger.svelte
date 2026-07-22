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

const classes = $derived(
  [
    "accordion__trigger",
    isOpen && "accordion__trigger--open",
    className,
  ]
    .filter(Boolean)
    .join(" "),
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<h3 class="accordion__header">
<button
  type="button"
  class={classes}
  data-disclosure-trigger=""
  data-value={value}
  id="{ctx.idBase}-trigger-{value}"
  aria-controls="{ctx.idBase}-content-{value}"
  aria-expanded={isOpen}
  disabled={ctx.disabled}
  data-testid={dataTestid}
  onclick={() => ctx.toggleItem(value)}
>
  {@render children?.()}
  <span class="accordion__chevron"></span>
</button>
</h3>
