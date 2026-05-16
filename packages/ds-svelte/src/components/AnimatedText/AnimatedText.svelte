<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type AnimatedTextAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
type AnimatedTextVariant = "blur-in" | "fade-up" | "slide-in";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  text: string;
  as?: AnimatedTextAs;
  variant?: AnimatedTextVariant;
  duration?: number;
  stagger?: number;
  delay?: number;
  triggerOnScroll?: boolean;
  scrollStart?: string;
  class?: string;
}

let { text, as, variant, duration, stagger, delay, triggerOnScroll, scrollStart, class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "animated-text",
    as ? `animated-text--${as}` : null,
    variant ? `animated-text--${variant}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} data-text={text}></div>
