<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  responsive?: boolean;
  ariaLabel?: string;
  class?: string;
  children?: import('svelte').Snippet;
}

let { responsive, ariaLabel, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "table",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes}>
  <table class={'table__container'} aria-label={ariaLabel}>
    {@render children?.()}
  </table>
</div>
