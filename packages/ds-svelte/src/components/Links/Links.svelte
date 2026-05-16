<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type LinkTarget = "_self" | "_blank" | "_parent" | "_top";
type LinkSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  href?: string;
  target?: LinkTarget;
  rel?: string;
  size?: LinkSize;
  disabled?: boolean;
  class?: string;
  children?: import('svelte').Snippet;
}

let { href, target, rel, size, disabled, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "links",
    size ? `links--${size}` : null,
    disabled ? "links--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<a class={classes} href={href} target={target} rel={rel}>
  {@render children?.()}
</a>
