<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  transitionName?: string;
  duration?: number;
  enabled?: boolean;
  class?: string;
  children?: import('svelte').Snippet;
}

let { transitionName, duration, enabled = true, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "page-transition",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes}>
  {@render children?.()}
</div>
