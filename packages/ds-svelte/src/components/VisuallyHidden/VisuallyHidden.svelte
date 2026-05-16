<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  focusable?: boolean;
  title?: string;
  class?: string;
  children?: import('svelte').Snippet;
}

let { focusable, title, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "visually-hidden",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<span class={classes}>
  {@render children?.()}
</span>
