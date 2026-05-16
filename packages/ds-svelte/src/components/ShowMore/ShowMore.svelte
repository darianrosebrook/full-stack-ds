<script lang="ts">
// @generated:start imports
import { useShowMore } from "./useShowMore.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  maxLines?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
  class?: string;
  children?: import('svelte').Snippet;
}

let { expanded, defaultExpanded, onExpandedChange, maxLines = 3, showMoreLabel = "Show more", showLessLabel = "Show less", class: className, children }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useShowMore({
  expanded: () => expanded,
  defaultExpanded: () => defaultExpanded,
  onExpandedChange: () => onExpandedChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "show-more",
    behavior.expanded ? "show-more--expanded" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes}>
  <div class={'show-more__content'}>
    {@render children?.()}
  </div>
  <button class={'show-more__trigger'} type="button" aria-expanded={behavior.expanded} onclick={(e) => behavior.setExpanded((e.currentTarget as HTMLInputElement).checked)} textContent={showMoreLabel}></button>
</div>
