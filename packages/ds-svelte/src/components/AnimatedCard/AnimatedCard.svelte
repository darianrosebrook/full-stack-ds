<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type AnimatedCardAs = "article" | "div" | "li" | "a";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  as?: AnimatedCardAs;
  duration?: number;
  delay?: number;
  triggerOnScroll?: boolean;
  scrollStart?: string;
  enableHover?: boolean;
  href?: string;
  class?: string;
  children?: import('svelte').Snippet;
}

let { as, duration, delay, triggerOnScroll, scrollStart, enableHover, href, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "animated-card",
    as ? `animated-card--${as}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} data-as={as}>
  {@render children?.()}
</div>
