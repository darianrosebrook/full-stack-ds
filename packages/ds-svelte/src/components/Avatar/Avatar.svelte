<script lang="ts">
// @generated:start imports
import Image from "../Image/Image.svelte";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  src?: string;
  name: string;
  priority?: boolean;
  size?: string;
  class?: string;
}

let { src, name, priority, size, class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "avatar",
    size ? `avatar--${size}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} aria-label={name} role="img">
  {#if src}
  <Image class={'avatar__image'} src={src} alt="" />
  {/if}
</div>
