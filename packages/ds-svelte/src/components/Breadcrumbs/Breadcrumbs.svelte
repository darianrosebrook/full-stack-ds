<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  ariaLabel?: string;
  separator?: string;
  class?: string;
  children?: import('svelte').Snippet;
}

let { ariaLabel = "Breadcrumb", separator, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "breadcrumbs",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<nav class={classes} aria-label={ariaLabel}>
  <ol class={'breadcrumbs__list'}>
    {@render children?.()}
  </ol>
</nav>
