<script lang="ts">
// @generated:start imports
import { useTabsContext } from "./useTabs.svelte.js";
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
const ctx = useTabsContext();

const isActive = $derived(ctx.activeTab === value);

const classes = $derived(["tabs__panel", className].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

{#if !ctx.unmountInactive || isActive}
<div
  role="tabpanel"
  class={classes}
  id="{ctx.idBase}-panel-{value}"
  aria-labelledby="{ctx.idBase}-tab-{value}"
  tabindex={0}
  data-testid={dataTestid}
  hidden={!isActive ? true : undefined}
>
  {@render children?.()}
</div>
{/if}
