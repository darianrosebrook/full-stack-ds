<script lang="ts">
// @generated:start imports
import { onMount, onDestroy } from "svelte";
import { useTabsContext } from "./useTabs.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  value: string;
  disabled?: boolean;
  class?: string;
  "data-testid"?: string;
  children?: import('svelte').Snippet;
}

let { value, disabled, class: className, "data-testid": dataTestid, children }: Props = $props();
// @generated:end

// @generated:start classes
const ctx = useTabsContext();

const isActive = $derived(ctx.activeTab === value);

const classes = $derived(
  [
    "tabs__tab",
    isActive && "tabs__tab--active",
    className,
  ]
    .filter(Boolean)
    .join(" "),
);
// @generated:end

// @generated:start trailing
onMount(() => {
  ctx.registerTab(value);
});

onDestroy(() => {
  ctx.unregisterTab(value);
});
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<button
  role="tab"
  type="button"
  class={classes}
  data-value={value}
  data-testid={dataTestid}
  id="{ctx.idBase}-tab-{value}"
  aria-controls="{ctx.idBase}-panel-{value}"
  aria-selected={isActive}
  tabindex={isActive ? 0 : -1}
  {disabled}
  onclick={() => ctx.setActiveTab(value)}
>
  {@render children?.()}
</button>
