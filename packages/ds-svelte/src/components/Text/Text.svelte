<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type TextElement = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type TextVariant = "display" | "headline" | "title" | "body" | "caption" | "overline" | "code";
type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
type TextWeight = "light" | "normal" | "medium" | "semibold" | "bold";
type TextAlign = "left" | "center" | "right" | "justify";
type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  as?: TextElement;
  variant?: TextVariant;
  size?: TextSize;
  weight?: TextWeight;
  align?: TextAlign;
  transform?: TextTransform;
  truncate?: boolean;
  class?: string;
}

let { as, variant, size, weight, align, transform, truncate, class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "text",
    variant ? `text--${variant}` : null,
    size ? `text--${size}` : null,
    weight ? `text--${weight}` : null,
    align ? `text--${align}` : null,
    transform ? `text--${transform}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<p class={classes}></p>
