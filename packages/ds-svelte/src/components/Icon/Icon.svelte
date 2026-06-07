<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type IconDefinition = { iconName: string; prefix?: string; icon?: unknown };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  icon: IconDefinition;
  width?: number;
  height?: number;
  class?: string;
}

let { icon, width = 20, height = 20, class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "icon",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<span class={classes} aria-hidden="true">
  <svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
    <circle cx="8.5" cy="8.5" r="8" stroke="currentColor" stroke-linecap="round" stroke-dasharray="2 4"></circle>
    <circle cx="8.5" cy="8.5" r="3" stroke="currentColor" stroke-linecap="round" stroke-dasharray=".125 3"></circle>
  </svg>
</span>
