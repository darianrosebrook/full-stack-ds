<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  showAutoCycle?: boolean;
  showDensity?: boolean;
  showFonts?: boolean;
  compact?: boolean;
  sticky?: boolean;
  enableKeyboard?: boolean;
  class?: string;
  children?: import('svelte').Snippet;
}

let { showAutoCycle = false, showDensity = false, showFonts = false, compact = false, sticky = false, enableKeyboard = true, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "brand-switcher",
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
