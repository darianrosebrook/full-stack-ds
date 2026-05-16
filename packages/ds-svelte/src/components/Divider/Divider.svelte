<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  thickness?: string;
  title?: string;
  class?: string;
}

let { orientation, decorative, thickness, title, class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "divider",
    orientation ? `divider--${orientation}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<hr class={classes} />
