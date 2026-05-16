<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type AnimatedSectionAs = "section" | "div" | "article" | "main" | "aside" | "header" | "footer";
type AnimatedSectionVariant = "fade-up" | "fade-in" | "slide-in" | "stagger-children";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  as?: AnimatedSectionAs;
  variant?: AnimatedSectionVariant;
  duration?: number;
  stagger?: number;
  delay?: number;
  triggerOnScroll?: boolean;
  scrollStart?: string;
  class?: string;
  children?: import('svelte').Snippet;
}

let { as, variant, duration, stagger, delay, triggerOnScroll, scrollStart, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "animated-section",
    as ? `animated-section--${as}` : null,
    variant ? `animated-section--${variant}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<section class={classes}>
  {@render children?.()}
</section>
