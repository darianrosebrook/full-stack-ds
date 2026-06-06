<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type ImageAspectRatio = "square" | "video" | "photo" | "wide" | "portrait";
type ImageObjectFit = "cover" | "contain" | "fill" | "scale-down" | "none";
type ImageLoading = "lazy" | "eager";
type ImageRadius = "none" | "sm" | "md" | "lg" | "full";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: ImageAspectRatio;
  objectFit?: ImageObjectFit;
  objectPosition?: string;
  loading?: ImageLoading;
  sizes?: string;
  radius?: ImageRadius;
  showPlaceholder?: boolean;
  fallbackSrc?: string;
  size?: string;
  class?: string;
}

let { src, alt, width, height, aspectRatio, objectFit, objectPosition, loading, sizes, radius, showPlaceholder, fallbackSrc, size, class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "image",
    radius ? `image--radius-${radius}` : null,
    size ? `image--size-${size}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<img class={classes} src={src} alt={alt} width={width} height={height} loading={loading} sizes={sizes} role="img" />
