<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type AspectRatioPreset = "square" | "video" | "photo" | "wide" | "portrait";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  ratio?: number;
  preset?: AspectRatioPreset;
  class?: string;
  children?: import('svelte').Snippet;
}

let { ratio, preset, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "aspect-ratio",
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
